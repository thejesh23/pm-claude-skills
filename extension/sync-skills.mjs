#!/usr/bin/env node
// Keep the extension's bundled skills snapshot in sync with the canonical web catalog.
// Run after web/build-skills.mjs:  node extension/sync-skills.mjs
// Strips nothing — the playground catalog already carries exactly the fields the
// content script needs (title, description, plugin, instructions).
import { copyFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, '..', 'web', 'skills.json');
const dest = join(here, 'skills.json');

if (!existsSync(src)) {
  console.error('web/skills.json not found — run `node web/build-skills.mjs` first.');
  process.exit(1);
}
copyFileSync(src, dest);
console.log('extension/skills.json synced from web/skills.json ✓');
