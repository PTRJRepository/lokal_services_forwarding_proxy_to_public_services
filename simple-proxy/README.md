# Simple Python Reverse Proxy

Reverse proxy sederhana menggunakan Python + Flask untuk routing multiple local services melalui satu gateway port.

## Features

- ✅ **Path-based routing** - Route berdasarkan path (e.g., `/absen` → port 5176)
- ✅ **True transparent proxy** - Forward semua headers, cookies, methods
- ✅ **Simple & lightweight** - Hanya ~70 lines Python code
- ✅ **Easy configuration** - Edit `routes.json` untuk add/remove routes
- ✅ **No content rewriting** - Pure proxy, tidak modify HTML/JS

## Installation

```bash
cd d:\Dashboard_Web_Service\simple-proxy

# Install dependencies
pip install -r requirements.txt
```

## Configuration

Edit `routes.json`:

```json
[
  {
    "path": "/absen",
    "target": "http://localhost:5176",
    "description": "Monitoring Absensi",
    "enabled": true
  }
]
```

## Usage

```bash
# Start proxy
python proxy.py
```

Gateway akan running di `http://localhost:3001`

## How It Works

```
User Request: http://localhost:3001/absen/dashboard
                      ↓
Gateway matches route: /absen → http://localhost:5176
                      ↓
Forwards to: http://localhost:5176/dashboard
                      ↓
Returns response to user
```

## Routes Priority

Routes di-sort by path length (longest first):
1. `/monitoring-beras` (longest)
2. `/absen`
3. `/upah`
4. `/` (catch-all)

## Advantages over Node.js version

1. **Simpler code** - Lebih mudah dipahami dan maintain
2. **Better error handling** - Python exception handling lebih clean
3. **No HTML rewriting complexity** - Pure passthrough proxy
4. **Easier to debug** - Print statements work better

## Limitations

⚠️ **Same limitation with Vite apps**: Apps dengan absolute asset paths (`/app.js`) masih akan kena issue yang sama. Backend apps perlu configure base path atau use relative paths.

## Recommended Backend Configuration

Untuk Vite apps, set `base` in `vite.config.js`:

```javascript
export default {
  base: '/absen/'  // Match route path
}
```

Lalu restart Vite dev server.
