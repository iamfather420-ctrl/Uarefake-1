import { chromium } from "playwright";
import { readFileSync } from "node:fs";
const svg = readFileSync("/workspace/public/favicon.svg", "utf8");
const html = `<!doctype html>
<meta charset="utf-8">
<style>
  html,body{margin:0;background:#6a6a6e;width:180px;height:90px}
  .row{display:flex;gap:12px;padding:12px;align-items:center}
  .tile{background:#09090b;padding:6px;border-radius:4px}
  img.big{width:64px;height:64px;display:block}
  img.sm{width:16px;height:16px;display:block;image-rendering:auto}
</style>
<div class="row">
  <div class="tile"><img class="big" src='data:image/svg+xml;utf8,${encodeURIComponent(svg)}'></div>
  <div class="tile"><img class="sm" src='data:image/svg+xml;utf8,${encodeURIComponent(svg)}'></div>
</div>`;
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
try {
  const page = await browser.newPage({ viewport: { width: 180, height: 90 }, deviceScaleFactor: 3 });
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.screenshot({ path: "/workspace/.grok/favicon-preview.png" });
  console.log("ok");
} finally {
  await browser.close();
}
