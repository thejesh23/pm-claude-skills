#!/usr/bin/env node
// Verifies an agent's conformance-run outputs against conformance/tasks.json.
//   node conformance/verify.mjs <results-dir>   # results/<task-id>.md per task
// Grades each task pass/fail with reasons; overall certification requires 5/5.
// This tests AGENT behaviour (discovery, restraint, structure, self-verification,
// anti-pattern adherence) — not model quality. Submit passing runs per README.
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dir = process.argv[2];
if (!dir) { console.error('usage: node conformance/verify.mjs <results-dir>'); process.exit(2); }
const { tasks } = JSON.parse(readFileSync(join(here, 'tasks.json'), 'utf8'));
let pass = 0;
for (const t of tasks) {
  const f = join(dir, t.id + '.md');
  const probs = [];
  if (!existsSync(f)) { console.log(`✗ ${t.id}: missing ${f}`); continue; }
  const out = readFileSync(f, 'utf8');
  const low = out.toLowerCase();
  const e = t.expect;
  for (const m of e.must_mention || []) if (!low.includes(m.toLowerCase())) probs.push(`must mention "${m}"`);
  for (const m of e.must_not_mention || []) if (low.includes(m.toLowerCase())) probs.push(`must NOT mention "${m}"`);
  if (e.must_mention_any && !e.must_mention_any.some((m) => low.includes(m.toLowerCase()))) probs.push(`must mention one of: ${e.must_mention_any.join(', ')}`);
  if (e.structure_any && !e.structure_any.some((s) => out.includes(s))) probs.push(`needs one of the structure markers: ${e.structure_any.join(', ')}`);
  if (e.min_sections && (out.match(/^#{1,3}\s/gm) || []).length < e.min_sections) probs.push(`needs ≥${e.min_sections} sections`);
  if (probs.length) console.log(`✗ ${t.id} (${t.tests}): ${probs.join(' · ')}`);
  else { console.log(`✓ ${t.id} (${t.tests})`); pass++; }
}
console.log(`\n${pass}/${tasks.length} — ${pass === tasks.length ? '🎖 CONFORMANT (submit per conformance/README.md)' : 'not yet conformant'}`);
process.exit(pass === tasks.length ? 0 : 1);
