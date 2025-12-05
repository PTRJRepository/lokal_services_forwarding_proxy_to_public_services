# Simple Python Reverse Proxy Gateway
# Manage multiple local services through single port with path-based routing

from flask import Flask, request, Response
import requests
import json
import os

app = Flask(__name__)

# Load routes configuration
ROUTES_FILE = 'routes.json'

def load_routes():
    if os.path.exists(ROUTES_FILE):
        with open(ROUTES_FILE, 'r') as f:
            return json.load(f)
    return []

routes = load_routes()

# Sort routes by path length (longest first) for proper matching
routes.sort(key=lambda r: len(r['path']), reverse=True)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'])
def proxy(path):
    """Main proxy handler - routes requests to backend services"""
    
    full_path = '/' + path if path else '/'
    
    # Find matching route
    matched_route = None
    for route in routes:
        if route.get('enabled', True) and full_path.startswith(route['path']):
            matched_route = route
            break
    
    if not matched_route:
        return {'error': 'No route found', 'path': full_path}, 404
    
    # Build target URL
    # Remove route prefix from path
    remaining_path = full_path[len(matched_route['path']):]
    
    # Ensure remaining path starts with / if not empty
    if remaining_path and not remaining_path.startswith('/'):
        remaining_path = '/' + remaining_path
    
    target_url = matched_route['target'].rstrip('/') + remaining_path
    
    # Add query string if present
    if request.query_string:
        target_url += '?' + request.query_string.decode('utf-8')
    
    print(f"→ {request.method} {full_path} → {target_url}")
    
    try:
        # Forward request to backend
        resp = requests.request(
            method=request.method,
            url=target_url,
            headers={k: v for k, v in request.headers if k.lower() not in ['host']},
            data=request.get_data(),
            cookies=request.cookies,
            allow_redirects=False,
            stream=True
        )
        
        print(f"← {resp.status_code} from {matched_route['target']}")
        
        # Return response to client
        excluded_headers = ['content-encoding', 'content-length', 'transfer-encoding', 'connection']
        headers = [(k, v) for k, v in resp.raw.headers.items() if k.lower() not in excluded_headers]
        
        return Response(resp.content, resp.status_code, headers)
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Proxy error: {str(e)}")
        return {'error': 'Bad Gateway', 'message': str(e), 'target': matched_route['target']}, 502

if __name__ == '__main__':
    print("╔════════════════════════════════════════════════════════╗")
    print("║     🚀 Python Simple Reverse Proxy Gateway            ║")
    print("╚════════════════════════════════════════════════════════╝")
    print(f"\n📡 Gateway running on: http://localhost:3001")
    print(f"\n📋 Active Routes ({len([r for r in routes if r.get('enabled', True)])}/{len(routes)}):")
    for route in routes:
        if route.get('enabled', True):
            print(f"   ✓ {route['path']} → {route['target']} ({route.get('description', '')})")
        else:
            print(f"   ✗ {route['path']} → {route['target']} (disabled)")
    print("\n")
    
    app.run(host='0.0.0.0', port=3001, debug=False, threaded=True)
