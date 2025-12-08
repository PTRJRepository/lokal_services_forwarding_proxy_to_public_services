const express = require('express');
const http = require('http');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// Load environment configuration based on NODE_ENV
// Development: localhost
// Production: 223.25.98.220 (atau fallback 10.0.0.110)
const env = process.env.NODE_ENV || 'development';
const envPath = path.join(__dirname, `.env.${env}`);

// Load dotenv if the file exists
if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    console.log(`✅ Loaded environment from: .env.${env}`);
} else {
    // Fallback to default .env if exists
    const defaultEnvPath = path.join(__dirname, '.env');
    if (fs.existsSync(defaultEnvPath)) {
        require('dotenv').config({ path: defaultEnvPath });
        console.log('✅ Loaded environment from: .env (default)');
    } else {
        console.log('⚠️ No .env file found, using environment variables');
    }
}

// Log current environment
console.log(`🌍 Running in ${env.toUpperCase()} mode`);
console.log(`📡 Backend Host: ${process.env.BACKEND_HOST || 'localhost'}`);
console.log(`📡 Fallback Host: ${process.env.BACKEND_HOST_FALLBACK || 'localhost'}`);

// Use the exact Next.js version from the dashboard app to avoid manifest version mismatch
const next = require('./Dashboard_Utama/node_modules/next');

const dev = process.env.NODE_ENV !== 'production';
// Point to the Next.js app directory
const nextApp = next({ dev, dir: path.join(__dirname, 'Dashboard_Utama') });
const nextHandle = nextApp.getRequestHandler();

const app = express();
const PORT = process.env.PORT || 3001;

// Determine which config file to use based on environment
const CONFIG_FILE = path.join(__dirname, `routes-config.${env}.json`);
const DEFAULT_CONFIG_FILE = path.join(__dirname, 'routes-config.json');


// Middleware
app.use(cors());
app.use(morgan('dev'));

// Load routes configuration
let routes = [];
let activeConfigFile = CONFIG_FILE;

function loadRoutes() {
    try {
        // Try environment-specific config first
        if (fs.existsSync(CONFIG_FILE)) {
            const data = fs.readFileSync(CONFIG_FILE, 'utf8');
            routes = JSON.parse(data);
            activeConfigFile = CONFIG_FILE;
            console.log(`✅ Loaded ${routes.length} routes from: routes-config.${env}.json`);
        } else if (fs.existsSync(DEFAULT_CONFIG_FILE)) {
            // Fallback to default config
            const data = fs.readFileSync(DEFAULT_CONFIG_FILE, 'utf8');
            routes = JSON.parse(data);
            activeConfigFile = DEFAULT_CONFIG_FILE;
            console.log(`✅ Loaded ${routes.length} routes from: routes-config.json (fallback)`);
        } else {
            console.log('⚠️ Config file not found, starting empty.');
            routes = [];
        }
    } catch (error) {
        console.error('❌ Error loading routes:', error.message);
        routes = [];
    }
}

function saveRoutes() {
    try {
        fs.writeFileSync(activeConfigFile, JSON.stringify(routes, null, 4));
        console.log(`✅ Routes saved to: ${path.basename(activeConfigFile)}`);
    } catch (error) {
        console.error('❌ Error saving routes:', error.message);
    }
}

// Initial load
loadRoutes();

// Watch for file changes to hot-reload config
// Watch both environment-specific and default config files
const filesToWatch = [CONFIG_FILE, DEFAULT_CONFIG_FILE];
filesToWatch.forEach(file => {
    if (fs.existsSync(file)) {
        fs.watchFile(file, (curr, prev) => {
            console.log(`🔄 Config change detected in ${path.basename(file)}, reloading...`);
            loadRoutes();
            // Clear proxy caches when routes change
            proxyCache.clear();
            wsProxyCache.clear();
            console.log('🧹 Proxy cache cleared');
        });
    }
});

// ============================================
// SERVE STATIC CONFIG UI AT /config-path
// Must be BEFORE nextApp.prepare() to avoid Next.js intercepting
// ============================================

// Serve static files for route management config UI (CSS, JS)
app.use('/_static', express.static(path.join(__dirname, 'public')));

// Serve /config-path as static config management HTML
app.get('/config-path', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================
// PROXY MIDDLEWARE CACHE
// ============================================

// Cache for proxy middleware instances (HTTP with content rewriting)
const proxyCache = new Map();

// Separate cache for WebSocket proxies (no selfHandleResponse)
const wsProxyCache = new Map();

// Function to get or create proxy middleware for a route
function getProxyMiddleware(route) {
    if (!proxyCache.has(route.id)) {
        console.log(`📦 Creating proxy middleware for ${route.path} -> ${route.target}`);

        // Create pathRewrite rule to strip the route path prefix
        // e.g., /absen -> /, /absen/api -> /api
        const pathRewriteRule = {};
        pathRewriteRule[`^${route.path}`] = '';

        const proxy = createProxyMiddleware({
            target: route.target,
            changeOrigin: true,
            pathRewrite: pathRewriteRule, // Strip the path prefix
            ws: true, // Support WebSocket for Vite HMR
            logLevel: 'debug',

            // CRITICAL: Self-handle response to rewrite HTML/JS/CSS content
            selfHandleResponse: true,

            onError: (err, req, res) => {
                console.error(`❌ Proxy error for ${route.path}:`, err.message);
                if (!res.headersSent) {
                    res.status(502).json({
                        error: 'Proxy Error',
                        message: `Backend service at ${route.target} is not reachable`,
                        details: err.message
                    });
                }
            },
            onProxyReq: (proxyReq, req, res) => {
                // Remove conditional request headers to force fresh response (not 304)
                // This is needed so we can rewrite the HTML/JS/CSS content
                proxyReq.removeHeader('If-None-Match');
                proxyReq.removeHeader('If-Modified-Since');

                // Add cache control headers for static assets
                if (req.path && req.path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
                    proxyReq.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
                    proxyReq.setHeader('Pragma', 'no-cache');
                    proxyReq.setHeader('Expires', '0');
                }

                console.log(`➡️ Proxying: ${req.method} ${req.originalUrl} -> ${route.target}${proxyReq.path}`);
            },
            onProxyRes: (proxyRes, req, res) => {
                console.log(`⬅️ Response: ${proxyRes.statusCode} from ${route.target}`);

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
            }
        });
        proxyCache.set(route.id, proxy);
    }
    return proxyCache.get(route.id);
}

// Function to get or create WebSocket proxy middleware for a route
// This is separate because WebSocket needs direct connection without selfHandleResponse
function getWsProxyMiddleware(route) {
    if (!wsProxyCache.has(route.id)) {
        console.log(`📦 Creating WebSocket proxy for ${route.path} -> ${route.target}`);

        // Create pathRewrite rule to strip the route path prefix
        const pathRewriteRule = {};
        pathRewriteRule[`^${route.path}`] = '';

        const wsProxy = createProxyMiddleware({
            target: route.target,
            changeOrigin: true,
            pathRewrite: pathRewriteRule,
            ws: true,
            logLevel: 'debug',
            // NO selfHandleResponse for WebSocket - it needs direct connection
            onError: (err, req, socket) => {
                console.error(`❌ WebSocket proxy error for ${route.path}:`, err.message);
                if (socket && socket.destroy) {
                    socket.destroy();
                }
            },
            onProxyReqWs: (proxyReq, req, socket, options, head) => {
                console.log(`🔌 WebSocket proxying: ${req.url} -> ${route.target}`);
            }
        });
        wsProxyCache.set(route.id, wsProxy);
    }
    return wsProxyCache.get(route.id);
}

nextApp.prepare().then(() => {

    // ============================================
    // ROUTE MANAGEMENT API ENDPOINTS
    // ============================================

    // Get all routes
    app.get('/api/routes', (req, res) => {
        res.json(routes);
    });

    // Add new route
    app.post('/api/routes', express.json(), (req, res) => {
        const { path: routePath, target, description, enabled } = req.body;

        if (!routePath || !target) {
            return res.status(400).json({ error: 'Path and target are required' });
        }

        const newRoute = {
            id: `route-${Date.now()}`,
            path: routePath,
            target,
            description: description || '',
            enabled: enabled !== false
        };

        routes.push(newRoute);
        saveRoutes();

        res.json({ message: 'Route added successfully', route: newRoute });
    });

    // Update route
    app.put('/api/routes/:id', express.json(), (req, res) => {
        const { id } = req.params;
        const { path: routePath, target, description, enabled } = req.body;

        const index = routes.findIndex(r => r.id === id);
        if (index === -1) {
            return res.status(404).json({ error: 'Route not found' });
        }

        routes[index] = {
            ...routes[index],
            path: routePath || routes[index].path,
            target: target || routes[index].target,
            description: description !== undefined ? description : routes[index].description,
            enabled: enabled !== undefined ? enabled : routes[index].enabled
        };

        saveRoutes();
        res.json({ message: 'Route updated successfully', route: routes[index] });
    });

    // Toggle route enabled/disabled
    app.post('/api/routes/:id/toggle', (req, res) => {
        const { id } = req.params;

        const index = routes.findIndex(r => r.id === id);
        if (index === -1) {
            return res.status(404).json({ error: 'Route not found' });
        }

        routes[index].enabled = !routes[index].enabled;
        saveRoutes();

        res.json({ message: `Route ${routes[index].enabled ? 'enabled' : 'disabled'}`, route: routes[index] });
    });

    // Delete route
    app.delete('/api/routes/:id', (req, res) => {
        const { id } = req.params;

        const index = routes.findIndex(r => r.id === id);
        if (index === -1) {
            return res.status(404).json({ error: 'Route not found' });
        }

        routes.splice(index, 1);
        saveRoutes();

        res.json({ message: 'Route deleted successfully' });
    });

    // Check route health
    app.get('/api/routes/:id/health', async (req, res) => {
        const { id } = req.params;

        const route = routes.find(r => r.id === id);
        if (!route) {
            return res.status(404).json({ error: 'Route not found' });
        }

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(route.target, {
                method: 'HEAD',
                signal: controller.signal
            });
            clearTimeout(timeout);

            res.json({ status: response.ok ? 'healthy' : 'unhealthy' });
        } catch (error) {
            res.json({ status: 'unhealthy', error: error.message });
        }
    });

    // ============================================
    // LEGACY API ROUTES FOR BACKWARD COMPATIBILITY
    // ============================================

    // Get backend host from environment (uses BACKEND_HOST or fallback to localhost)
    const absenHost = process.env.BACKEND_HOST || 'localhost';
    const absenPort = process.env.ABSEN_PORT || '5176';
    const absenTarget = `http://${absenHost}:${absenPort}`;

    // Route attendance API calls to the absen service
    app.use('/api/attendance', createProxyMiddleware({
        target: absenTarget,
        changeOrigin: true,
        pathRewrite: {
            '^/api': '/api'
        },
        logLevel: 'debug',
        onError: (err, req, res) => {
            console.error('❌ Attendance API proxy error:', err.message);
            if (!res.headersSent) {
                res.status(502).json({
                    error: 'Service Unavailable',
                    message: 'Attendance service is not reachable'
                });
            }
        }
    }));

    // Route attendance-by-loc-enhanced API calls to the absen service
    app.use('/api/attendance-by-loc-enhanced', createProxyMiddleware({
        target: absenTarget,
        changeOrigin: true,
        pathRewrite: {
            '^/api': '/api'
        },
        logLevel: 'debug',
        onError: (err, req, res) => {
            console.error('❌ Attendance API proxy error:', err.message);
            if (!res.headersSent) {
                res.status(502).json({
                    error: 'Service Unavailable',
                    message: 'Attendance service is not reachable'
                });
            }
        }
    }));

    // ============================================
    // DYNAMIC PROXY MIDDLEWARE
    // ============================================

    // ============================================
    // PROXY MIDDLEWARE - MUST BE BEFORE Next.js HANDLER
    // ============================================

    // Check if path matches a defined proxy route FIRST
    app.use((req, res, next) => {
        const reqPath = req.path;
        const referer = req.get('Referer');

        // Skip management and static routes
        if (reqPath === '/config-path' ||
            reqPath.startsWith('/_static') ||
            reqPath.startsWith('/api/routes') ||
            reqPath.startsWith('/api/auth') ||
            reqPath.startsWith('/api/services')) {
            return next();
        }

        // Skip Next.js internal paths
        if (reqPath.startsWith('/_next') || reqPath.startsWith('/static')) {
            return nextHandle(req, res);
        }

        // Sort routes by path length (longest first) to ensure specific routes match before generic ones
        const sortedRoutes = [...routes].sort((a, b) => b.path.length - a.path.length);

        // Find matching route either by direct path match or by referer for asset requests
        let matchedRoute = sortedRoutes.find(r => r.enabled && reqPath.startsWith(r.path));

        // If no direct match, check if this is an asset request based on referer
        if (!matchedRoute && referer) {
            for (const route of sortedRoutes) {
                if (route.enabled && referer.includes(route.path)) {
                    // This is likely an asset request for this route
                    matchedRoute = route;
                    console.log(`📎 Asset request detected for ${route.path}: ${reqPath}`);
                    break;
                }
            }
        }

        if (matchedRoute) {
            console.log(`🔀 Proxying ${reqPath} -> ${matchedRoute.target}`);

            // Check if this is a WebSocket upgrade request
            const isWebSocketRequest =
                (req.headers.connection || '').toLowerCase().includes('upgrade') ||
                (req.headers.upgrade || '').toLowerCase() === 'websocket';

            // Use passthrough proxy (no selfHandleResponse) when:
            // 1. This is a WebSocket upgrade request
            // 2. rewriteContent is explicitly set to false
            const usePassthroughProxy = isWebSocketRequest || matchedRoute.rewriteContent === false;

            if (usePassthroughProxy) {
                console.log(`🔌 Using passthrough proxy for: ${reqPath} (WebSocket: ${isWebSocketRequest}, rewriteContent: ${matchedRoute.rewriteContent})`);
                const wsProxy = getWsProxyMiddleware(matchedRoute);
                return wsProxy(req, res, next);
            }

            // Use regular proxy with content rewriting for normal HTTP requests
            const proxyMiddleware = getProxyMiddleware(matchedRoute);
            return proxyMiddleware(req, res, next);
        }

        // If no proxy route matches, continue to next middleware
        next();
    });

    // ============================================
    // Next.js ROUTES - HANDLE ONLY DASHBOARD PATHS
    // ============================================

    app.use((req, res) => {
        const reqPath = req.path;

        // Only let Next.js handle dashboard-specific routes
        const isDashboardRoute =
            reqPath === '/' ||
            reqPath === '/login' ||
            reqPath.startsWith('/dashboard') ||
            reqPath.startsWith('/admin') ||
            reqPath.startsWith('/api/auth') ||
            reqPath.startsWith('/api/services') ||
            reqPath.startsWith('/api/routes');

        if (isDashboardRoute) {
            return nextHandle(req, res);
        }

        // Return 404 for unmatched routes
        res.status(404).json({
            error: 'Not Found',
            message: 'No route configured for this path',
            path: reqPath,
            availableRoutes: routes.filter(r => r.enabled).map(r => ({
                path: r.path,
                target: r.target,
                description: r.description
            }))
        });
    });

    // Create HTTP server for WebSocket support
    const server = http.createServer(app);

    // Handle WebSocket upgrade requests
    server.on('upgrade', (req, socket, head) => {
        const reqPath = req.url;
        console.log(`🔌 WebSocket upgrade: ${reqPath}`);

        const sortedRoutes = [...routes].sort((a, b) => b.path.length - a.path.length);
        let matchedRoute = sortedRoutes.find(r => r.enabled && reqPath.startsWith(r.path));

        // WebSocket HMR requests might come as relative paths
        // Check if the origin header contains a route path
        if (!matchedRoute && req.headers.origin) {
            matchedRoute = sortedRoutes.find(r => r.enabled && req.headers.origin.includes(r.path));
            if (matchedRoute) {
                console.log(`🔌 WebSocket HMR request detected for ${matchedRoute.path}: ${reqPath}`);
            }
        }

        if (matchedRoute) {
            console.log(`🔌 WebSocket -> ${matchedRoute.target}`);
            // Use dedicated WebSocket proxy (without selfHandleResponse)
            const wsProxy = getWsProxyMiddleware(matchedRoute);
            wsProxy.upgrade(req, socket, head);
        } else {
            console.log(`❌ No WebSocket route for: ${reqPath}`);
            socket.destroy();
        }
    });

    server.listen(PORT, (err) => {
        if (err) throw err;
        console.log(`\n> 🚀 Unified Server running on http://localhost:${PORT}`);
        console.log(`> 🖥️  Dashboard & Proxy Gateway Integrated`);
        console.log(`> ⚙️  Route Config: http://localhost:${PORT}/config-path`);
        console.log(`> 🔌 WebSocket proxy enabled`);
    });
});
