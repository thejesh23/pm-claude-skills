#!/usr/bin/env node
// Renders web/coverage.html — eval coverage per bundle (which bundles are fully scored,
// partially scored, or not yet evaluated), from web/skills.json + evals/results.json.
// The public companion to scripts/eval-status.mjs and the "Evaluate selected bundles"
// Action: it shows what's left to score and links to the workflow that scores it.
// Run after web/build-skills.mjs (and after any eval run). No dependencies.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EVAL_EXCLUDE } from '../evals/eval-exclude.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const REPO = 'https://github.com/mohitagw15856/pm-claude-skills';
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Skills (eval-applicable only) grouped by bundle.
const sdata = JSON.parse(readFileSync(join(root, 'web', 'skills.json'), 'utf8'));
const skills = (Array.isArray(sdata) ? sdata : (sdata.skills || [])).filter((s) => !EVAL_EXCLUDE.has(s.name));

// Which skills have at least one score?
const real = join(root, 'evals', 'results.json');
const example = join(root, 'evals', 'results.example.json');
const resPath = existsSync(real) ? real : (existsSync(example) ? example : null);
const isExample = resPath === example;
const scored = new Set();
if (resPath) for (const x of (JSON.parse(readFileSync(resPath, 'utf8')).results || [])) scored.add(x.skill);

// Aggregate per bundle.
const bundles = new Map();
for (const s of skills) {
  const b = bundles.get(s.plugin) || { bundle: s.plugin, total: 0, scored: 0, unscored: [] };
  b.total++;
  if (scored.has(s.name)) b.scored++; else b.unscored.push(s.name);
  bundles.set(s.plugin, b);
}
const rows = [...bundles.values()].sort((a, b) => (b.scored / b.total) - (a.scored / a.total) || a.bundle.localeCompare(b.bundle));
const statusOf = (b) => b.scored === 0 ? 'unevaluated' : b.scored < b.total ? 'partial' : 'complete';
const icon = { complete: '✅', partial: '🟡', unevaluated: '⬜' };

const totalSkills = skills.length;
const totalScored = skills.length - rows.reduce((a, b) => a + b.unscored.length, 0);
const pct = totalSkills ? Math.round((totalScored / totalSkills) * 100) : 0;
const fullyDone = rows.filter((b) => statusOf(b) === 'complete').length;
const todo = rows.filter((b) => b.scored < b.total).map((b) => b.bundle);

const tableRows = rows.map((b) => {
  const st = statusOf(b);
  const p = Math.round((b.scored / b.total) * 100);
  const tip = b.unscored.length ? ` title="Unscored: ${esc(b.unscored.join(', '))}"` : '';
  return `<tr class="${st}"${tip}>
    <td class="bundle">${esc(b.bundle)}</td>
    <td>${icon[st]} ${st}</td>
    <td class="num">${b.scored}/${b.total}</td>
    <td class="barcell"><span class="bar"><span class="fill" style="width:${p}%"></span></span> <span class="pct">${p}%</span></td>
  </tr>`;
}).join('\n');

const html = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Eval Coverage — which skill bundles are scored on the leaderboard</title>
<meta name="description" content="Eval coverage per bundle for pm-claude-skills: which bundles are fully scored, partially scored, or not yet evaluated — and how to help score the rest." />
<style>
  :root{--bg:#0f1115;--panel:#161a21;--panel2:#1d222b;--border:#2a313c;--text:#e7ebf0;--muted:#95a0b0;--accent:#d97757;--accent2:#e89b82}
  html[data-theme="light"]{--bg:#f7f6f3;--panel:#fff;--panel2:#f1efe9;--border:#e4e0d8;--text:#1b2027;--muted:#667085}
  html[data-theme="light"] .toolbar-nav{background:rgba(255,255,255,.75)}
  body{margin:0;background:var(--bg);color:var(--text);font:15px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
  a{color:var(--accent2)} header{padding:28px 22px;border-bottom:1px solid var(--border);background:var(--panel)}
  header h1{margin:0 0 6px;font-size:23px} header p{margin:0;color:var(--muted);font-size:14px}
  header .bigstat{margin:0 0 8px;font-size:18px;color:var(--accent2)}
  .toolbar-nav{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;padding:12px 22px;background:rgba(13,15,20,.7);border-bottom:1px solid var(--border)}
  .toolbar-nav .tool{font-size:13px;font-weight:600;text-decoration:none;padding:7px 14px;border-radius:99px;color:var(--muted);border:1px solid transparent;white-space:nowrap;transition:color .12s,background .12s,border-color .12s}
  .toolbar-nav .tool:hover{color:var(--text);background:var(--panel2);border-color:var(--border)}
  .toolbar-nav .tool.active{background:linear-gradient(135deg,#e0855f,#d9605a);color:#1a1207;border-color:transparent}
  main{max-width:860px;margin:0 auto;padding:22px}
  .banner{background:rgba(245,158,11,.12);border:1px solid rgba(245,158,11,.4);color:#fcd34d;padding:12px 14px;border-radius:10px;margin-bottom:18px;font-size:13.5px}
  .cta{background:var(--panel);border:1px solid var(--border);border-radius:12px;padding:16px 18px;margin-bottom:20px}
  .cta h2{margin:0 0 6px;font-size:16px} .cta p{margin:0 0 8px;color:var(--muted);font-size:13.5px}
  .cta code{background:var(--panel2);padding:2px 6px;border-radius:6px;font-size:12.5px}
  table{width:100%;border-collapse:collapse;font-size:14px}
  th,td{padding:9px 12px;text-align:left;border-bottom:1px solid var(--border)}
  th{color:var(--accent2);font-size:12px;text-transform:uppercase;letter-spacing:.04em}
  td.bundle{font-weight:600} td.num{font-variant-numeric:tabular-nums;color:var(--muted)}
  .bar{display:inline-block;width:120px;height:8px;background:var(--panel2);border-radius:99px;overflow:hidden;vertical-align:middle}
  .fill{display:block;height:100%;background:linear-gradient(90deg,#e0855f,#6ee7b7)}
  .pct{color:var(--muted);font-size:12.5px;font-variant-numeric:tabular-nums}
  tr.unevaluated td.bundle{color:var(--muted)}
  .meta{color:var(--muted);font-size:12.5px;margin-top:16px}
</style></head><body>
<header>
  <h1>📊 Eval Coverage</h1>
  <p class="bigstat"><strong>${totalScored}/${totalSkills} skills scored (${pct}%) · ${fullyDone}/${rows.length} bundles complete</strong></p>
  <p>Which bundles are scored on the <a href="leaderboard.html">leaderboard</a>, and what's left to evaluate. Skills that need an image, a live source, or that activate a behaviour aren't eval-applicable and are excluded here.</p>
</header>
<nav class="toolbar-nav" id="toolbar" aria-label="Tools"></nav>
<script src="nav.js"></script>
<main>
  ${isExample ? '<div class="banner">⚠️ <strong>Example data</strong> — illustrative coverage so this page renders. Real coverage appears once <code>evals/results.json</code> is populated.</div>' : ''}
  <div class="cta">
    <h2>Help score the rest</h2>
    <p>${todo.length ? `${todo.length} bundle(s) still have skills to evaluate.` : 'Every bundle is fully scored — nice.'} Maintainers can run the <a href="${REPO}/actions/workflows/eval-bundles.yml"><strong>Evaluate selected bundles</strong></a> Action (mode <code>list</code> to preview for free, then <code>evaluate</code>), or locally: <code>node scripts/eval-status.mjs</code> to see the list, then <code>node evals/run-evals.mjs --bundles &lt;names&gt; --unevaluated</code>.</p>
  </div>
  <table>
    <thead><tr><th>Bundle</th><th>Status</th><th>Scored</th><th>Coverage</th></tr></thead>
    <tbody>
${tableRows}
    </tbody>
  </table>
  <p class="meta">${rows.length} bundles · ${totalSkills} eval-applicable skills. Coverage = skills with at least one leaderboard score. Methodology in <a href="${REPO}/tree/main/evals">evals/</a>.</p>
</main></body></html>
`;

writeFileSync(join(root, 'web', 'coverage.html'), html);
console.log(`Wrote web/coverage.html — ${totalScored}/${totalSkills} skills scored across ${rows.length} bundles${isExample ? ' (EXAMPLE data)' : ''}.`);
