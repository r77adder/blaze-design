#!/usr/bin/env node
/**
 * Generate static thumbnail PNGs for every prototype.
 *
 * - Spins up the Vite preview server (built bundle, not dev mode) on a
 *   throwaway port so this is reproducible in CI without leaning on `pnpm dev`.
 * - Visits each prototype route, waits for network/render to settle, takes a
 *   1280x800 PNG, and writes it to `prototypes/<slug>/thumbnail.png`.
 *
 * Runs as part of the `generate-thumbnails` GitHub Actions workflow after
 * every push to main. Locally, run `pnpm thumbnails` after `pnpm build:playground`.
 */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = join(ROOT, 'dist');
const PROTOTYPES_DIR = join(ROOT, 'prototypes');

const WIDTH = 1280;
const HEIGHT = 800;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

/** Serve the prebuilt `dist/` directory as a static SPA: any unknown path
 *  falls back to `index.html` so React Router can handle the route. */
function startStaticServer(distDir) {
  return new Promise((resolveServer) => {
    const indexHtml = readFileSync(join(distDir, 'index.html'));
    const server = createServer((req, res) => {
      const url = new URL(req.url, 'http://localhost');
      let filePath = join(distDir, url.pathname);
      try {
        const s = statSync(filePath);
        if (s.isDirectory()) filePath = join(filePath, 'index.html');
      } catch {
        res.writeHead(200, { 'Content-Type': MIME['.html'] });
        res.end(indexHtml);
        return;
      }
      try {
        const body = readFileSync(filePath);
        res.writeHead(200, {
          'Content-Type': MIME[extname(filePath)] ?? 'application/octet-stream',
        });
        res.end(body);
      } catch {
        res.writeHead(200, { 'Content-Type': MIME['.html'] });
        res.end(indexHtml);
      }
    });
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolveServer({ server, port });
    });
  });
}

function listPrototypeSlugs() {
  return readdirSync(PROTOTYPES_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith('_'))
    .map((e) => e.name)
    .sort();
}

async function main() {
  if (!statSync(DIST, { throwIfNoEntry: false })?.isDirectory()) {
    console.error('dist/ not found — run `pnpm build:playground` first.');
    process.exit(1);
  }

  const slugs = listPrototypeSlugs();
  if (slugs.length === 0) {
    console.log('No prototypes found.');
    return;
  }

  const { server, port } = await startStaticServer(DIST);
  console.log(`Static server on http://127.0.0.1:${port}`);

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  let failed = 0;
  for (const slug of slugs) {
    const url = `http://127.0.0.1:${port}/${slug}`;
    const outDir = join(PROTOTYPES_DIR, slug);
    const outPath = join(outDir, 'thumbnail.png');
    process.stdout.write(`  ${slug} → `);
    try {
      mkdirSync(outDir, { recursive: true });
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      // Give a beat for fonts + late-painting content.
      await page.waitForTimeout(800);
      await page.screenshot({ path: outPath, fullPage: false });
      console.log('ok');
    } catch (err) {
      failed += 1;
      console.log(`FAILED — ${err.message}`);
    }
  }

  await browser.close();
  server.close();

  if (failed > 0) {
    console.error(`\n${failed} thumbnail(s) failed.`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
