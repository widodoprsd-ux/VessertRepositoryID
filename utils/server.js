#!/usr/bin/env node

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

// Parse CLI flags (-p 8080, --port 8080, --dir ./public, --host 0.0.0.0)
const args = process.argv.slice(2);
let port = 8080;
let host = "0.0.0.0";
let rootDir = path.resolve(process.cwd(), "public");

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === "-p" || arg === "--port") {
    port = parseInt(args[++i], 10) || 8080;
  } else if (arg === "-h" || arg === "--host") {
    host = args[++i] || "0.0.0.0";
  } else if (arg === "-d" || arg === "--dir") {
    rootDir = path.resolve(process.cwd(), args[++i] || "public");
  }
}

if (!fs.existsSync(rootDir)) {
  rootDir = process.cwd();
}

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".htm": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".cjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".bmp": "image/bmp",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".eot": "application/vnd.ms-fontobject",
  ".map": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json"
};

function getLocalIpAddresses() {
  const ips = [];
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const net of ifaces[name] || []) {
      if (net.family === "IPv4" && !net.internal) {
        ips.push(net.address);
      }
    }
  }
  return ips;
}

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { "Content-Type": "text/plain" });
    return res.end("405 Method Not Allowed");
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Check in rootDir (public) first, then fallback to project root
  let targetFile = path.normalize(path.join(rootDir, pathname));

  if (!fs.existsSync(targetFile) || fs.statSync(targetFile).isDirectory()) {
    const fallbackRoot = path.normalize(path.join(process.cwd(), pathname));
    if (fs.existsSync(fallbackRoot)) {
      targetFile = fallbackRoot;
    }
  }

  // If pointing to directory, serve index.html
  if (fs.existsSync(targetFile) && fs.statSync(targetFile).isDirectory()) {
    const indexPath = path.join(targetFile, "index.html");
    if (fs.existsSync(indexPath)) {
      targetFile = indexPath;
    }
  }

  fs.stat(targetFile, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(`<!DOCTYPE html><html><body><h1>404 Not Found</h1><p>${pathname}</p></body></html>`);
    }

    const ext = path.extname(targetFile).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    if (ext.startsWith(".woff") || ext === ".ttf" || ext === ".otf" || ext === ".ico" || ext === ".png") {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    } else {
      res.setHeader("Cache-Control", "no-cache");
    }

    res.writeHead(200, {
      "Content-Type": contentType,
      "Content-Length": stats.size
    });

    if (req.method === "HEAD") {
      return res.end();
    }

    const readStream = fs.createReadStream(targetFile);
    readStream.pipe(res);
  });
});

server.listen(port, host, () => {
  const localIps = getLocalIpAddresses();
  console.log("\n=======================================================");
  console.log("  ⚡ VessertID Standalone HTTP Server                  ");
  console.log("=======================================================");
  console.log(`  Root Directory : ${rootDir}`);
  console.log(`  Local          : http://localhost:${port}/`);
  localIps.forEach((ip) => {
    console.log(`  Network (HP)   : http://${ip}:${port}/`);
  });
  console.log("=======================================================\n");
});
