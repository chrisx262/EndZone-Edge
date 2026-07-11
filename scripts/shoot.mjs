// scripts/shoot.mjs — build + serve dist/, capture README/launch screenshots.
//
// One-time setup:  npm i -D playwright && npx playwright install chromium
// Run:             npm run shoot        (builds if needed, then shoots)
//
// Outputs PNGs into content/assets/ for the README and launch posts.
// Selectors are text-based so they survive styling changes; if a tab
// label in NFLPredictionApp.tsx changes, update the strings below.

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const PORT = 4188;
const URL = `http://localhost:${PORT}`;
const OUT = 'content/assets';

async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const r = await fetch(url);
      if (r.ok) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`Server at ${url} did not come up in ${timeoutMs}ms`);
}

async function main() {
  await mkdir(OUT, { recursive: true });

  if (!existsSync('dist/index.html')) {
    console.log('dist/ missing — run `npm run build` first.');
    process.exit(1);
  }

  // Serve the built app with vite preview.
  const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
    stdio: 'inherit',
  });

  let browser;
  try {
    await waitForServer(URL);
    browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.setDefaultTimeout(15000);

    await page.goto(URL, { waitUntil: 'networkidle' });

    // Wait for the app to finish its "Loading ... Data" screen.
    await page.getByText(/Loading/i).waitFor({ state: 'hidden' }).catch(() => {});
    await page.getByText(/Football Philosophy|Offense/i).first().waitFor();

    // 1) Predict tab (default view).
    await page.getByRole('button', { name: /Predict Games/i }).click().catch(() => {});
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${OUT}/predict.png` });
    console.log(`✓ ${OUT}/predict.png`);

    // 2) Optimizer / honest-results view.
    await page.getByRole('button', { name: /Find Optimal Weights/i }).first().click();
    await page.waitForTimeout(400);
    // The tab and the run action share a label; click the run button too.
    const runBtn = page.getByRole('button', { name: /Find Optimal Weights/i }).last();
    await runBtn.click().catch(() => {});
    // Wait for the honest-accuracy result to render.
    await page
      .getByText(/untouched|verified|Vegas favorite/i)
      .first()
      .waitFor({ timeout: 20000 })
      .catch(() => {});
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${OUT}/optimizer.png` });
    console.log(`✓ ${OUT}/optimizer.png`);
  } finally {
    if (browser) await browser.close();
    server.kill('SIGTERM');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
