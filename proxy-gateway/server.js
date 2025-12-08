const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
// Use the exact Next.js version from the dashboard app to avoid manifest version mismatch
const next = require('./Dashboard_Utama/node_modules/next');

const dev = process.env.NODE_ENV !== 'production';
// Point to the Next.js app directory
const nextApp = next({ dev, dir: path.join(__dirname, 'Dashboard_Utama') });
const nextHandle = nextApp.getRequestHandler();

const app = express();
const PORT = 3001;
const CONFIG_FILE = path.join(__dirname, 'routes-config.json');

// Middleware
app.use(cors());
app.use(morgan('dev'));

// Load routes configuration
let routes = [];

function loadRoutes() {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            const data = fs.readFileSync(CONFIG_FILE, 'utf8');
            routes = JSON.parse(data);
            console.log(`✅ Loaded ${routes.length} routes from configuration`);
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
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(routes, null, 4));
        console.log('✅ Routes saved to configuration');
    } catch (error) {
        console.error('❌ Error saving routes:', error.message);
    }
}

// Initial load
loadRoutes();

// Watch for file changes to hot-reload config
fs.watchFile(CONFIG_FILE, (curr, prev) => {
    console.log('🔄 Config change detected, reloading...');
    loadRoutes();
    // Clear proxy cache when routes change
    proxyCache.clear();
    console.log('🧹 Proxy cache cleared');
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

// Cache for proxy middleware instances
const proxyCache = new Map();

// Function to get or create proxy middleware for a route
function getProxyMiddleware(route) {
    if (!proxyCache.has(route.id)) {
        console.log(`📦 Creating proxy middleware for ${route.path} -> ${route.target}`);
        const proxy = createProxyMiddleware({
            target: route.target,
            changeOrigin: true,
            // NO pathRewrite - let backend receive full path
            // Backend Vite apps need to be configured with base path
            ws: true, // Support WebSocket for Vite HMR
            logLevel: 'debug',
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
                console.log(`➡️ Proxying: ${req.method} ${req.originalUrl} -> ${route.target}${req.originalUrl}`);
            },
            onProxyRes: (proxyRes, req, res) => {
                console.log(`⬅️ Response: ${proxyRes.statusCode} from ${route.target}`);
            }
        });
        proxyCache.set(route.id, proxy);
    }
    return proxyCache.get(route.id);
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
    // DYNAMIC PROXY MIDDLEWARE
    // ============================================

    app.use((req, res, next) => {
        const reqPath = req.path;

        // Skip Next.js internal paths immediately
        if (reqPath.startsWith('/_next') || reqPath.startsWith('/static')) {
            return nextHandle(req, res);
        }

        // Skip dashboard routes - let Next.js handle them
        const isDashboardRoute =
            reqPath === '/' ||
            reqPath === '/login' ||
            reqPath.startsWith('/config-path') ||
            reqPath.startsWith('/dashboard') ||
            reqPath.startsWith('/admin') ||
            reqPath.startsWith('/api/auth') ||
            reqPath.startsWith('/api/services') ||
            reqPath.startsWith('/api/routes');

        if (isDashboardRoute) {
            return nextHandle(req, res);
        }

        // Check if path matches a defined proxy route
        const sortedRoutes = [...routes].sort((a, b) => b.path.length - a.path.length);
        const matchedRoute = sortedRoutes.find(r => r.enabled && reqPath.startsWith(r.path));

        if (matchedRoute) {
            console.log(`🔀 Proxying ${reqPath} -> ${matchedRoute.target}`);
            const proxyMiddleware = getProxyMiddleware(matchedRoute);
            return proxyMiddleware(req, res, next);
        }

        // Default failover to Next.js
        return nextHandle(req, res);
    });

    app.listen(PORT, (err) => {
        if (err) throw err;
        console.log(`\n> 🚀 Unified Server running on http://localhost:${PORT}`);
        console.log(`> 🖥️  Dashboard & Proxy Gateway Integrated`);
        console.log(`> ⚙️  Route Config: http://localhost:${PORT}/config-path`);
    });
});
