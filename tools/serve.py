#!/usr/bin/env python3
"""Serve WasteWise locally with caching disabled (handy while editing).
Usage:  python3 tools/serve.py [port]   then open http://localhost:8000"""
import http.server, os, sys

class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()
    def log_message(self, *a):
        pass

os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
print(f"WasteWise running at http://localhost:{port}  (Ctrl+C to stop)")
http.server.ThreadingHTTPServer(("", port), NoCache).serve_forever()
