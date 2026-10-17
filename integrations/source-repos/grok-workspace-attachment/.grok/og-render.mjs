import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { extname, join } from "node:path";
import { chromium } from "playwright";

const root = "/workspace/.grok";
const mime = {
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".ttf": "font/ttf",
  ".woff2": "font/woff2",
};

const server = createServer((req, res) => {
  const url = new URL(req.url || "/", "http://127.0.0.1");
  let rel = url.pathname === "/" ? "/og-card.html" : url.pathname;
  const file = join(root, rel);
  if (!file.startsWith(root) || !existsSync(file)) {
    res.writeHead(404);
    res.end("missing");
    return;
  }
  res.writeHead(200, { "content-type": mime[extname(file)] || "application/octet-stream" });
  res.end(readFileSync(file));
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const { port } = server.address();

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
try {
  const page = await browser.newPage({
    viewport: { width: 2400, height: 1260 },
    deviceScaleFactor: 1,
  });
  await page.goto(`http://127.0.0.1:${port}/og-card.html`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);
  await page.screenshot({
    path: "/workspace/.grok/og-card-raw.png",
    type: "png",
    clip: { x: 0, y: 0, width: 2400, height: 1260 },
  });
  console.log("wrote /workspace/.grok/og-card-raw.png");
} finally {
  await browser.close();
  server.close();
}
