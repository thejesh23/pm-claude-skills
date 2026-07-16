#!/usr/bin/env node
// Author stats — pulls per-skill playground run counts from GoatCounter
// (counts-only telemetry; event paths like "run/<skill>") into
// web/skill-stats.json for authors.html and the skill pages. Needs
// GOATCOUNTER_TOKEN (Settings → API) — exits 0 quietly without it so crons
// can carry it before the secret exists.
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const token = process.env.GOATCOUNTER_TOKEN;
const site = process.env.GOATCOUNTER_SITE || 'mohitagw';
if (!token) { console.log('GOATCOUNTER_TOKEN not set — skipping stats build (page shows its no-data state).'); process.exit(0); }

const api = async (path) => {
  const r = await fetch(`https://${site}.goatcounter.com/api/v0${path}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) throw new Error(`goatcounter ${r.status}: ${await r.text()}`);
  return r.json();
};

// /stats/hits returns paths with counts; paginate and keep event paths we chart.
const runs = {};
const opens = {};
let after = '';
for (let page = 0; page < 40; page++) {
  const d = await api(`/stats/hits?limit=100${after}`);
  for (const h of d.hits || []) {
    const p = h.path || '';
    if (p.startsWith('run/')) runs[p.slice(4)] = (runs[p.slice(4)] || 0) + (h.count || 0);
    if (p.startsWith('cmd/pick/')) opens[p.slice(9)] = (opens[p.slice(9)] || 0) + (h.count || 0);
  }
  if (!d.more) break;
  after = `&after=${encodeURIComponent(d.hits[d.hits.length - 1].path)}`;
}

writeFileSync(join(root, 'web', 'skill-stats.json'), JSON.stringify({
  built: new Date().toISOString().slice(0, 10),
  note: 'counts only — event names, never content; see the Cost & Privacy page',
  runs, picks: opens,
}, null, 1) + '\n');
console.log(`Wrote web/skill-stats.json — ${Object.keys(runs).length} skills with run counts.`);
