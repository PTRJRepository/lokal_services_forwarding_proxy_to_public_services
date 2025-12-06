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
// express.json() can conflict with Next.js body parsing if applied globally to Next routes
// app.use(express.json()); 

// Load routes configuration
let routes = [];
let proxyMiddleware = new Map();

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

// Initial load
loadRoutes();

// Watch for file changes to hot-reload config
fs.watchFile(CONFIG_FILE, (curr, prev) => {
    console.log('🔄 valid config change detected, reloading...');
    loadRoutes();
    applyProxyRoutes();
});

// Apply dynamic proxy routes
function applyProxyRoutes() {
    // Remove existing proxy middleware
    for (const [path, middleware] of proxyMiddleware) {
        // Express stack filtering is hacky, but works for simple stacks.
        // Better: Mount proxies on a sub-router or specific paths.
        // For now, we just rely on the router stack order or route replacement?
        // Actually, removing from app._router.stack is risky with Next.js mixed in.
        // Safer approach: use a router for proxies and swap it?
        // Or just let the proxy middleware check the dynamic 'routes' array inside its handler? (Dynamic Router Pattern)

        // Let's use the Dynamic Proxy Pattern: one middleware that checks the list.
    }
    // We will switch to a single dynamic middleware approach below to avoid stack manipulation issues
}

nextApp.prepare().then(() => {

    // 1. Dynamic Proxy Middleware
    app.use((req, res, next) => {
        const path = req.path;

        // Skip Next.js internal paths immediately
        if (path.startsWith('/_next') || path.startsWith('/static')) {
            return nextHandle(req, res);
        }

        // Check if path matches a defined proxy route
        // Sort by length to match specific first
        const sortedRoutes = [...routes].sort((a, b) => b.path.length - a.path.length);

        const matchedRoute = sortedRoutes.find(r => r.enabled && path.startsWith(r.path));

        if (matchedRoute) {
            // If it's the root path proxy, we might want to be careful not to shadow Next.js
            // But if user defined "/" proxy, they probably want it.
            // EXCEPT: We want Dashboard to be the default UI.
            // So we only proxy specific routes usually.

            // Issue: If "/" is mapped to something, Dashboard is unreachable?
            // User Request: "Dashboard Utama disinkronisasi... tempat user login... bridge"
            // So Dashboard IS the root app.
            // We should ONLY proxy paths that are explicitly NOT the dashboard paths.

            // Let's assume dashboard routes are: /, /login, /dashboard, /admin, /api/auth
            const isDashboardRoute =
                path === '/' ||
                path === '/login' ||
                path.startsWith('/dashboard') ||
                path.startsWith('/admin') ||
                path.startsWith('/api/auth');

            if (isDashboardRoute && matchedRoute.path === '/') {
                // Collision: Root is proxied, but we want Main Dashboard?
                // Strategy: If matched route is explicitly "/", ignore it? 
                // Or maybe user WANTS to map "/" to dashboard? 
                // Let's assume "/" goes to Next.js by default unless explicitly overriden, 
                // BUT we are building the dashboard integration.
                return nextHandle(req, res);
            }

            // Proceed with Proxy
            console.log(`🔀 Proxying ${path} -> ${matchedRoute.target}`);

            return createProxyMiddleware({
                target: matchedRoute.target,
                changeOrigin: true,
                pathRewrite: {
                    [`^${matchedRoute.path}`]: '' // Rewrite prefix? Or keep it? User says "pemisah path". Usually means strip it?
                    // existing logic had: pathRewrite: { [`^${route.path}`]: '' }
                },
                onProxyReq: (proxyReq, req, res) => {
                    // copy from original logic if needed
                }
            })(req, res, next);
        }

        // 2. Default failover to Next.js
        return nextHandle(req, res);
    });

    app.listen(PORT, (err) => {
        if (err) throw err;
        console.log(`\n> 🚀 Unified Server running on http://localhost:${PORT}`);
        console.log(`> 🖥️  Dashboard & Proxy Gateway Integrated`);
    });
});
