// Screenshots the Skill Galaxy and the in-browser Brain into web/docs-assets/,
// for the README and articles. Drives the live GitHub Pages site by default;
// set BASE_URL to point at a local server instead.
//
// Usage:
//   npx playwright install chromium                 # first time only
//   node web/docs-assets/shoot.mjs                  # shoot the live site
//   BASE_URL=http://localhost:8080 \
//     node web/docs-assets/shoot.mjs                # shoot a local `web/` server
//   PAGES=galaxy node web/docs-assets/shoot.mjs     # just one (galaxy|brain)
//
// Mirrors the record-*.mjs demo scripts: same Playwright resolution, deviceScaleFactor 2.
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pw = await import(process.env.PLAYWRIGHT_PATH || 'playwright');
const chromium = pw.chromium || (pw.default && pw.default.chromium);

const BASE = (process.env.BASE_URL || 'https://mohitagw15856.github.io/pm-claude-skills').replace(/\/$/, '');

const ALL = [
  // galaxy is a live canvas animation — give it longer to settle into a clean frame.
  { id: 'galaxy', page: 'galaxy.html', out: 'galaxy.png', viewport: { width: 1600, height: 1000 }, settle: 6000 },
  { id: 'brain', page: 'brain.html', out: 'brain.png', viewport: { width: 1440, height: 1000 }, settle: 3000 },
];
const only = (process.env.PAGES || '').split(',').map((s) => s.trim()).filter(Boolean);
const shots = only.length ? ALL.filter((s) => only.includes(s.id)) : ALL;

const browser = await chromium.launch();
try {
  for (const s of shots) {
    // IGNORE_HTTPS_ERRORS=1 lets it run behind a TLS-intercepting proxy (some CI/sandboxes).
    const ctx = await browser.newContext({ viewport: s.viewport, deviceScaleFactor: 2, ignoreHTTPSErrors: !!process.env.IGNORE_HTTPS_ERRORS });
    const page = await ctx.newPage();
    const url = `${BASE}/${s.page}`;
    console.error(`→ ${url}`);
    // 'load' not 'networkidle' — an animated canvas page never goes network-idle.
    await page.goto(url, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(s.settle); // let the canvas / animation settle
    const outPath = path.join(__dirname, s.out);
    await page.screenshot({ path: outPath });
    console.error(`  wrote ${path.relative(process.cwd(), outPath)}`);
    await ctx.close();
  }
} finally {
  await browser.close();
}
