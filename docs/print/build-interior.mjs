#!/usr/bin/env node
// Renders web/handbook.html to a 6x9" trade-paperback interior PDF for Lulu/KDP.
// Playwright via PLAYWRIGHT_PATH. Prints the page count — feed it to build-covers.mjs:
//   node docs/print/build-interior.mjs && node docs/print/build-covers.mjs --pages <N>
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const out = join(here, process.argv.includes('--kdp') ? 'handbook-interior-6x9-kdp.pdf' : 'handbook-interior-6x9.pdf');

const pw = await import(process.env.PLAYWRIGHT_PATH || 'playwright');
const chromium = pw.chromium || pw.default?.chromium;
const b = await chromium.launch();
const pg = await b.newPage();
await pg.goto(pathToFileURL(join(root, 'web', 'handbook.html')).href, { waitUntil: 'networkidle' });
await pg.pdf({
  path: out,
  width: '6in', height: '9in',
  // Gutter-safe book margins. Lulu accepts uniform 0.625; KDP demands a 0.75in
  // gutter above 300 pages — pass --kdp to widen both sides (Chromium can't
  // mirror odd/even margins, so both sides get gutter width; costs a few pages).
  margin: process.argv.includes('--kdp')
    ? { top: '0.625in', bottom: '0.625in', left: '0.75in', right: '0.75in' }
    : { top: '0.625in', bottom: '0.625in', left: '0.625in', right: '0.625in' },
  scale: 0.72,
  printBackground: false,
});
await b.close();
const pages = (readFileSync(out).toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
console.log(`Wrote docs/print/handbook-interior-6x9.pdf — ${pages} pages at 6×9"`);
console.log(`Next: node docs/print/build-covers.mjs --pages ${pages}`);
