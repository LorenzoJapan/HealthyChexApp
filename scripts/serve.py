"""Serve the app and its icons directly, without a build or browser caching."""
import argparse
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import ssl

ROOT = Path(__file__).resolve().parents[1]
# Only the files GitHub Pages users load; the rest of the repo stays private to this server.
TYPES = {".html": "text/html; charset=utf-8", ".webmanifest": "application/manifest+json",
         ".png": "image/png", ".svg": "image/svg+xml"}


def resolve(path):
    if path in ("/", "/index.html"):
        return ROOT / "index.html"
    if path == "/manifest.webmanifest":
        return ROOT / "manifest.webmanifest"
    if path.startswith("/icons/"):
        file = (ROOT / path.lstrip("/")).resolve()
        if file.parent == ROOT / "icons" and file.suffix in TYPES and file.is_file():
            return file
    return None


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        file = resolve(self.path.split("?", 1)[0])
        if file is None:
            self.send_error(404)
            return
        content = file.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", TYPES[file.suffix])
        self.send_header("Content-Length", str(len(content)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(content)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=int(os.getenv("FRONTEND_PORT", "3108")))
    parser.add_argument("--host", default=os.getenv("HOST", "0.0.0.0"))
    args = parser.parse_args()
    server = ThreadingHTTPServer((args.host, args.port), Handler)
    cert = os.getenv("DEV_SSL_CERT_PATH")
    key = os.getenv("DEV_SSL_KEY_PATH")
    protocol = "http"
    if cert and key:
        context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        context.load_cert_chain(cert, key)
        server.socket = context.wrap_socket(server.socket, server_side=True)
        protocol = "https"
    print(f"HealthyChex: {protocol}://localhost:{args.port}/", flush=True)
    server.serve_forever()
