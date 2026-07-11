#!/usr/bin/env node
// The Atlas — a map of the public agent-skill ecosystem. Samples the public
// SKILL.md corpus (census machinery), adds this library's 466, embeds every
// skill LEXICALLY (TF-IDF over name+description — honest label: this is a
// lexical map, not a neural one), lays it out with a force simulation at build
// time, and writes web/atlas.json for the interactive page. Free (GitHub API);
// needs `gh` auth. ~3 minutes.
//
//   node scripts/build-atlas.mjs [--sample 150]
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SAMPLE = Math.min(300, parseInt((process.argv.find((a, i) => process.argv[i - 1] === '--sample') || '150'), 10) || 150);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const gh = (q) => JSON.parse(execFileSync('gh', ['api', q], { encoding: 'utf8', maxBuffer: 32e6 }));

// 1. Ours.
const ours = JSON.parse(readFileSync(join(root, 'web', 'skills.json'), 'utf8')).skills
  .map((s) => ({ id: 'pm/' + s.name, name: s.name, repo: 'mohitagw15856/pm-claude-skills', ours: true, text: s.name.replace(/-/g, ' ') + ' ' + String(s.description).slice(0, 300) }));

// 2. The ecosystem sample (deduped by repo+name, skipping our own + forks of us).
console.error(`📡 sampling up to ${SAMPLE} external skills…`);
const seen = new Set(); const theirs = [];
for (let page = 1; page <= 6 && theirs.length < SAMPLE; page++) {
  let items = [];
  try { items = gh(`search/code?q=${encodeURIComponent('"description:" filename:SKILL.md')}&per_page=100&page=${page}`).items || []; } catch { break; }
  for (const it of items) {
    const repo = it.repository.full_name;
    if (repo.includes('mohitagw15856') || it.repository.fork) continue;
    const name = it.path === 'SKILL.md' ? repo.split('/')[1] : it.path.split('/').slice(-2)[0];
    const key = repo + '|' + name;
    if (seen.has(key) || theirs.length >= SAMPLE) continue;
    seen.add(key);
    theirs.push({ key, repo, name, path: it.path });
  }
  await sleep(2500);
}
console.error(`   fetching ${theirs.length} descriptions…`);
const ext = [];
for (const t of theirs) {
  try {
    const res = await fetch(`https://raw.githubusercontent.com/${t.repo}/HEAD/${t.path}`);
    if (!res.ok) continue;
    const text = await res.text();
    const desc = (text.match(/^description:\s*["']?([^\n]+)/m) || [])[1] || '';
    if (!desc) continue;
    ext.push({ id: t.repo + '/' + t.name, name: t.name, repo: t.repo, ours: false, text: t.name.replace(/-/g, ' ') + ' ' + desc.slice(0, 300) });
  } catch { /* skip */ }
  await sleep(100);
}

// 3. Lexical embedding: TF-IDF vectors → cosine similarity → force layout.
const all = [...ours, ...ext];
const STOP = new Set('a an the and or of for to in on with use when produces this that your you it is are skill skills md agent claude use-when'.split(' '));
const docs = all.map((d) => d.text.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/[\s-]+/).filter((w) => w.length > 2 && !STOP.has(w)));
const df = {};
docs.forEach((ws) => new Set(ws).forEach((w) => df[w] = (df[w] || 0) + 1));
const N = docs.length;
const vecs = docs.map((ws) => {
  const tf = {}; ws.forEach((w) => tf[w] = (tf[w] || 0) + 1);
  const v = {}; let norm = 0;
  for (const [w, f] of Object.entries(tf)) { if (df[w] < 2 || df[w] > N * 0.4) continue; const x = f * Math.log(N / df[w]); v[w] = x; norm += x * x; }
  norm = Math.sqrt(norm) || 1;
  for (const w in v) v[w] /= norm;
  return v;
});
const sim = (a, b) => { let s = 0; const [sm, lg] = Object.keys(a).length < Object.keys(b).length ? [a, b] : [b, a]; for (const w in sm) if (lg[w]) s += sm[w] * lg[w]; return s; };

// kNN edges + force layout (simple, deterministic).
console.error('   layout…');
const K = 4, edges = [];
for (let i = 0; i < N; i++) {
  const sims = [];
  for (let j = 0; j < N; j++) if (j !== i) sims.push([sim(vecs[i], vecs[j]), j]);
  sims.sort((a, b) => b[0] - a[0]);
  for (const [s, j] of sims.slice(0, K)) if (s > 0.08) edges.push([i, j, s]);
}
let rngState = 42; const rand = () => { rngState = (rngState * 1103515245 + 12345) & 0x7fffffff; return rngState / 0x7fffffff; };
const pos = all.map(() => [rand() * 1000 - 500, rand() * 1000 - 500]);
for (let iter = 0; iter < 260; iter++) {
  const t = 1 - iter / 260;
  // repulsion (sampled) + spring on edges
  for (let i = 0; i < N; i++) {
    let fx = 0, fy = 0;
    for (let k = 0; k < 18; k++) {
      const j = Math.floor(rand() * N); if (j === i) continue;
      const dx = pos[i][0] - pos[j][0], dy = pos[i][1] - pos[j][1];
      const d2 = dx * dx + dy * dy + 1;
      fx += 3200 * dx / d2; fy += 3200 * dy / d2;
    }
    pos[i][0] += fx * t * 0.02; pos[i][1] += fy * t * 0.02;
  }
  for (const [i, j, s] of edges) {
    const dx = pos[j][0] - pos[i][0], dy = pos[j][1] - pos[i][1];
    const k = 0.012 * s * t;
    pos[i][0] += dx * k; pos[i][1] += dy * k;
    pos[j][0] -= dx * k; pos[j][1] -= dy * k;
  }
}
const out = {
  built: new Date().toISOString().slice(0, 10),
  note: 'Lexical map (TF-IDF over names+descriptions), not a neural embedding — clusters mean shared vocabulary.',
  nodes: all.map((d, i) => ({ id: d.id, n: d.name, r: d.repo, o: d.ours ? 1 : 0, x: Math.round(pos[i][0]), y: Math.round(pos[i][1]) })),
  edges: edges.filter(([, , s]) => s > 0.15).map(([i, j]) => [i, j]),
  stats: { ours: ours.length, external: ext.length, repos: new Set(ext.map((e) => e.repo)).size },
};
writeFileSync(join(root, 'web', 'atlas.json'), JSON.stringify(out));
console.log(`Wrote web/atlas.json — ${ours.length} ours + ${ext.length} external from ${out.stats.repos} repos, ${out.edges.length} edges.`);
