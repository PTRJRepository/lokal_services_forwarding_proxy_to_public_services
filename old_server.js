const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;
const CONFIG_FILE = path.join(__dirname, 'routes-config.json');

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
// Serve static files only under /dashboard path to avoid conflict with root proxy
app.use('/dashboard', express.static('public'));

// Load routes configuration
let routes = [];
let proxyMiddleware = new Map(); // Store active proxy middleware for dynamic removal

function loadRoutes() {
    try {
        const data = fs.readFileSync(CONFIG_FILE, 'utf8');
        routes = JSON.parse(data);
        console.log(`✅ Loaded ${routes.length} routes from configuration`);
    } catch (error) {
        console.error('❌ Error loading routes:', error.message);
        routes = [];
    }
}

function saveRoutes() {
    try {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(routes, null, 2));
        console.log('✅ Routes saved successfully');
        return true;
    } catch (error) {
        console.error('❌ Error saving routes:', error.message);
        return false;
    }
}

// Initialize routes
loadRoutes();

// Apply dynamic proxy routes with hot-reload capability
function applyProxyRoutes() {
    // Remove existing proxy middleware
    for (const [path, middleware] of proxyMiddleware) {
        app._router.stack = app._router.stack.filter(layer => layer.handle !== middleware);
        console.log(`🗑️  Removed old proxy for ${path}`);
    }
    proxyMiddleware.clear();

    // Sort routes by path length (longest first) to ensure specific routes match before generic ones
    // This is critical when you have root "/" route alongside specific routes like "/absen"
    const sortedRoutes = [...routes].sort((a, b) => b.path.length - a.path.length);

    sortedRoutes.forEach(route => {
        if (route.enabled) {
            console.log(`🔀 Routing ${route.path} → ${route.target}`);

            // Create middleware that excludes API and dashboard paths
            const conditionalMiddleware = (req, res, next) => {
                // Get the original URL without query parameters
                const path = req.path.split('?')[0];

                // IMPORTANT: Check exact paths first, then prefixes
                if (path === '/health' || path === '/health/') {
                    return next('route');
                }

                if (path.startsWith('/api/') || path === '/api') {
                    return next('route');
                }

                if (path.startsWith('/dashboard/') || path === '/dashboard') {
                    return next('route');
                }

                // For root path, only apply if no other route matches
                if (route.path === '/') {
                    // Check if request matches any other enabled route path
                    const otherRoutes = routes.filter(r => r.enabled && r.path !== '/');
                    for (const otherRoute of otherRoutes) {
                        if (path.startsWith(otherRoute.path)) {
                            return next('route'); // Skip root proxy, let other route handle it
                        }
                    }
                }

                // Apply proxy middleware
                proxyMiddleware.get(route.path)(req, res, next);
            };

            const proxy = createProxyMiddleware({
                target: route.target,
                changeOrigin: true,
                // Don't remove the path prefix for proper routing
                pathRewrite: {
                    [`^${route.path}`]: ''  // Remove only the prefix, keep the rest
                },

                // ADVANCED: Self-handle response to rewrite HTML/JS content
                selfHandleResponse: true,

                onProxyReq: (proxyReq, req, res) => {
                    console.log(`→ ${req.method} ${req.originalUrl} → ${route.target}`);
                },

                onProxyRes: (proxyRes, req, res) => {
                    console.log(`← ${proxyRes.statusCode} from ${route.target}`);

                    const contentType = proxyRes.headers['content-type'] || '';
                    const isHtml = contentType.includes('text/html');
                    const isJs = contentType.includes('javascript') || contentType.includes('application/javascript');
                    const isCss = contentType.includes('text/css');

                    // Only rewrite HTML, JS, and CSS - skip root path to avoid breaking root app
                    const shouldRewrite = (isHtml || isJs || isCss) && route.path !== '/';

                    if (shouldRewrite) {
                        let body = '';
                        proxyRes.on('data', (chunk) => {
                            body += chunk.toString('utf8');
                        });

                        proxyRes.on('end', () => {
                            try {
                                // Rewrite absolute paths to include base path
                                // /app.js → /absen/app.js
                                // /src/main.jsx → /absen/src/main.jsx
                                // /@vite/client → /absen/@vite/client

                                if (isHtml) {
                                    // Rewrite HTML: script src, link href, img src, etc.
                                    body = body.replace(/(<script[^>]+src=["']\s*)\/(?!\/)/gi, `$1${route.path}/`);
                                    body = body.replace(/(<link[^>]+href=["']\s*)\/(?!\/)/gi, `$1${route.path}/`);
                                    body = body.replace(/(<img[^>]+src=["']\s*)\/(?!\/)/gi, `$1${route.path}/`);
                                    body = body.replace(/(<a[^>]+href=["']\s*)\/(?!\/)/gi, `$1${route.path}/`);

                                    // Rewrite base tag if exists
                                    if (!body.includes('<base')) {
                                        body = body.replace(/<head>/i, `<head>\n  <base href="${route.path}/">`);
                                    }

                                    // Handle Vite-specific paths
                                    body = body.replace(/(["'])\/@vite\//g, `$1${route.path}/@vite/`);
                                }

                                if (isJs) {
                                    // Rewrite JS: import statements and fetch calls
                                    body = body.replace(/from\s+["']\/(?!\/)/g, `from "${route.path}/`);
                                    body = body.replace(/import\s+["']\/(?!\/)/g, `import "${route.path}/`);
                                    body = body.replace(/fetch\(["']\/(?!\/)/g, `fetch("${route.path}/`);
                                }

                                if (isCss) {
                                    // Rewrite CSS: url() references
                                    body = body.replace(/url\(["']?\/(?!\/)/g, `url("${route.path}/`);
                                }

                                // Set correct headers
                                res.statusCode = proxyRes.statusCode;
                                Object.keys(proxyRes.headers).forEach(key => {
                                    res.setHeader(key, proxyRes.headers[key]);
                                });

                                // Update content-length
                                res.setHeader('content-length', Buffer.byteLength(body));

                                res.end(body);
                            } catch (error) {
                                console.error(`❌ Error rewriting content for ${route.path}:`, error.message);
                                res.statusCode = 500;
                                res.end('Internal Server Error');
                            }
                        });
                    } else {
                        // For non-rewritable content or root path, just pipe through
                        res.statusCode = proxyRes.statusCode;
                        Object.keys(proxyRes.headers).forEach(key => {
                            res.setHeader(key, proxyRes.headers[key]);
                        });
                        proxyRes.pipe(res);
                    }
                },

                onError: (err, req, res) => {
                    console.error(`❌ Proxy error for ${route.path}:`, err.message);
                    if (!res.headersSent) {
                        res.status(502).json({
                            error: 'Bad Gateway',
                            message: `Unable to reach ${route.target}`,
                            route: route.path
                        });
                    }
                }
            });

            // Store middleware for later removal
            proxyMiddleware.set(route.path, proxy);

            // Apply conditional middleware that checks paths
            app.use(route.path, conditionalMiddleware);
        }
    });

    console.log(`✅ Applied ${proxyMiddleware.size} proxy routes`);
}

// Hot-reload function
function hotReloadRoutes() {
    console.log('\n🔄 Hot-reloading routes configuration...');
    loadRoutes();
    applyProxyRoutes();
    console.log('✅ Routes reloaded successfully!');
}

// Management API Routes
// Get all routes
app.get('/api/routes', (req, res) => {
    res.json(routes);
});

// Add new route
app.post('/api/routes', (req, res) => {
    const { path, target, description } = req.body;

    if (!path || !target) {
        return res.status(400).json({ error: 'Path and target are required' });
    }

    // Check if path already exists
    if (routes.some(r => r.path === path)) {
        return res.status(409).json({ error: 'Route path already exists' });
    }

    const newRoute = {
        id: `route-${Date.now()}`,
        path,
        target,
        description: description || '',
        enabled: true
    };

    routes.push(newRoute);

    if (saveRoutes()) {
        // Hot-reload routes immediately
        hotReloadRoutes();
        res.status(201).json({
            message: 'Route added and applied successfully! 🎉',
            route: newRoute
        });
    } else {
        res.status(500).json({ error: 'Failed to save route' });
    }
});

// Update route
app.put('/api/routes/:id', (req, res) => {
    const { id } = req.params;
    const { path, target, description, enabled } = req.body;

    const routeIndex = routes.findIndex(r => r.id === id);

    if (routeIndex === -1) {
        return res.status(404).json({ error: 'Route not found' });
    }

    // Check if new path conflicts with other routes
    if (path && routes.some((r, idx) => r.path === path && idx !== routeIndex)) {
        return res.status(409).json({ error: 'Route path already exists' });
    }

    routes[routeIndex] = {
        ...routes[routeIndex],
        path: path || routes[routeIndex].path,
        target: target || routes[routeIndex].target,
        description: description !== undefined ? description : routes[routeIndex].description,
        enabled: enabled !== undefined ? enabled : routes[routeIndex].enabled
    };

    if (saveRoutes()) {
        // Hot-reload routes immediately
        hotReloadRoutes();
        res.json({
            message: 'Route updated and applied successfully! 🎉',
            route: routes[routeIndex]
        });
    } else {
        res.status(500).json({ error: 'Failed to save route' });
    }
});

// Delete route
app.delete('/api/routes/:id', (req, res) => {
    const { id } = req.params;
    const routeIndex = routes.findIndex(r => r.id === id);

    if (routeIndex === -1) {
        return res.status(404).json({ error: 'Route not found' });
    }

    const deletedRoute = routes.splice(routeIndex, 1)[0];

    if (saveRoutes()) {
        // Hot-reload routes immediately
        hotReloadRoutes();
        res.json({
            message: 'Route deleted and applied successfully! 🎉',
            route: deletedRoute
        });
    } else {
        res.status(500).json({ error: 'Failed to save route' });
    }
});

// Toggle route enabled status
app.post('/api/routes/:id/toggle', (req, res) => {
    const { id } = req.params;
    const route = routes.find(r => r.id === id);

    if (!route) {
        return res.status(404).json({ error: 'Route not found' });
    }

    route.enabled = !route.enabled;

    if (saveRoutes()) {
        // Hot-reload routes immediately
        hotReloadRoutes();
        res.json({
            message: `Route ${route.enabled ? 'enabled' : 'disabled'} and applied successfully! 🎉`,
            route
        });
    } else {
        res.status(500).json({ error: 'Failed to save route' });
    }
});

// Health check for backend service
app.get('/api/routes/:id/health', async (req, res) => {
    const { id } = req.params;
    const route = routes.find(r => r.id === id);

    if (!route) {
        return res.status(404).json({ error: 'Route not found' });
    }

    // Flag to prevent multiple responses
    let responseSent = false;

    try {
        const http = require('http');
        const url = new URL(route.target);

        const options = {
            hostname: url.hostname,
            port: url.port,
            path: '/',
            method: 'GET',
            timeout: 3000
        };

        const request = http.request(options, (response) => {
            if (!responseSent) {
                responseSent = true;
                res.json({
                    status: 'healthy',
                    statusCode: response.statusCode,
                    target: route.target
                });
            }
        });

        request.on('error', (error) => {
            if (!responseSent) {
                responseSent = true;
                res.json({
                    status: 'unhealthy',
                    error: error.message,
                    target: route.target
                });
            }
        });

        request.on('timeout', () => {
            request.destroy();
            if (!responseSent) {
                responseSent = true;
                res.json({
                    status: 'unhealthy',
                    error: 'Connection timeout',
                    target: route.target
                });
            }
        });

        request.end();
    } catch (error) {
        if (!responseSent) {
            responseSent = true;
            res.json({
                status: 'unhealthy',
                error: error.message,
                target: route.target
            });
        }
    }
});

// Dashboard route
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check for gateway itself
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        gateway: 'running',
        port: PORT,
        routes: routes.length
    });
});

// Apply proxy routes AFTER all API routes and static routes
applyProxyRoutes();

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'No route configured for this path',
        path: req.path,
        availableRoutes: routes.filter(r => r.enabled).map(r => r.path)
    });
});

// Start server
app.listen(PORT, () => {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║     🚀 API Gateway & Proxy Management System          ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log(`\n📡 Gateway running on: http://localhost:${PORT}`);
    console.log(`🎛️  Management Dashboard: http://localhost:${PORT}/dashboard`);
    console.log(`\n📋 Active Routes (${routes.filter(r => r.enabled).length}/${routes.length}):`);
    routes.forEach(route => {
        if (route.enabled) {
            console.log(`   ✓ ${route.path} → ${route.target}`);
        } else {
            console.log(`   ✗ ${route.path} → ${route.target} (disabled)`);
        }
    });
    console.log('\n');
});