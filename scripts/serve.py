"""Serve the single-page app directly, without a build or browser caching."""
import argparse
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import ssl

APP = Path(__file__).resolve().parents[1] / "index.html"


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path.split("?", 1)[0] not in ("/", "/index.html"):
            self.send_error(404)
            return
        content = APP.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
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
