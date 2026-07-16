#!/usr/bin/env node
// SkillBench runner — score MODELS (not skills) on the frozen professional-work
// task set. Each model runs every task twice: bare (task only) and skilled
// (task + the matching SKILL.md). A pinned judge scores all outputs on the
// library's fixed 1–5 rubric, two passes, mean taken.
//
//   ANTHROPIC_API_KEY=… node skillbench/run-skillbench.mjs --models claude-sonnet-4-6
//   … OPENAI_API_KEY=… GEMINI_API_KEY=… --models claude-fable-5,gpt-4o,gemini-2.0-flash
//   --dry-run            plan + cost estimate, no API calls
//   --judge <model>      override the pinned judge (discloses in results)
//   --tasks <path>       alternate task set (default: skillbench/tasks.json)
//
// Appends per-model entries to skillbench/results.json (existing models are replaced).
// Providers are inferred from the model id: claude-* → Anthropic, gpt-*/o*-* → OpenAI,
// gemini-* → Google. No dependencies.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i !== -1 ? process.argv[i + 1] : d; };
const has = (n) => process.argv.includes(`--${n}`);

const HARNESS_VERSION = '1.0';
const JUDGE = arg('judge', 'claude-sonnet-4-6'); // pinned per benchmark release
const models = (arg('models', '') || '').split(',').map((s) => s.trim()).filter(Boolean);
const dryRun = has('dry-run');
if (!models.length) { console.error('Usage: --models model-a,model-b [--dry-run]'); process.exit(1); }

const { version: taskSetVersion, tasks } = JSON.parse(readFileSync(arg('tasks', join(__dirname, 'tasks.json')), 'utf8'));
const outPath = join(__dirname, 'results.json');

// ── Provider adapters (single-shot completion; no streaming needed) ──────────
function providerOf(model) {
  if (/^claude/.test(model)) return 'anthropic';
  if (/^(gpt|o\d|chatgpt)/.test(model)) return 'openai';
  if (/^gemini/.test(model)) return 'google';
  throw new Error(`Cannot infer provider for "${model}" (expected claude-*/gpt-*/gemini-*).`);
}
async function complete({ model, system, user, maxTokens = 4096 }) {
  const prov = providerOf(model);
  if (prov === 'anthropic') {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) throw new Error('ANTHROPIC_API_KEY not set (needed for ' + model + ')');
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model, max_tokens: maxTokens, ...(system ? { system } : {}), messages: [{ role: 'user', content: user }] }),
    });
    const j = await res.json();
    if (!res.ok) throw new Error(`${model}: ${j.error?.message || res.status}`);
    return j.content?.[0]?.text || '';
  }
  if (prov === 'openai') {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error('OPENAI_API_KEY not set (needed for ' + model + ')');
    const msgs = [];
    if (system) msgs.push({ role: 'system', content: system });
    msgs.push({ role: 'user', content: user });
    const base = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
    const res = await fetch(base.replace(/\/$/, '') + '/chat/completions', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + key },
      body: JSON.stringify({ model, max_tokens: maxTokens, messages: msgs }),
    });
    const j = await res.json();
    if (!res.ok) throw new Error(`${model}: ${j.error?.message || res.status}`);
    return j.choices?.[0]?.message?.content || '';
  }
  // google
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY not set (needed for ' + model + ')');
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ...(system ? { system_instruction: { parts: [{ text: system }] } } : {}), contents: [{ role: 'user', parts: [{ text: user }] }], generationConfig: { maxOutputTokens: maxTokens } }),
  });
  const j = await res.json();
  if (!res.ok) throw new Error(`${model}: ${j.error?.message || res.status}`);
  return j.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
}

// ── The rubric judge (same dimensions as the library's skill evals) ───────────
const RUBRIC = `You are a strict evaluator of professional work artifacts. Score the RESPONSE to the TASK on four dimensions, each 1-5:
- structure: would a senior professional recognise this artifact's shape?
- completeness: are the load-bearing sections present and specific (not padded)?
- usefulness: could the intended reader act on it without a rewrite?
- grounding: does it use the task's facts, label assumptions, avoid fabricated specifics?
Return STRICT JSON only: {"structure":n,"completeness":n,"usefulness":n,"grounding":n}`;
async function judgeScore(taskInput, output) {
  const passes = [];
  for (let i = 0; i < 2; i++) {
    const raw = await complete({ model: JUDGE, system: RUBRIC, user: `TASK:\n${taskInput}\n\nRESPONSE:\n${output.slice(0, 14000)}`, maxTokens: 300 });
    try {
      const j = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1));
      const dims = ['structure', 'completeness', 'usefulness', 'grounding'].map((d) => Math.max(1, Math.min(5, +j[d] || 0)));
      if (dims.every((v) => v >= 1)) passes.push(dims.reduce((a, b) => a + b, 0) / 4);
    } catch { /* one bad judge pass is tolerated; two → score null */ }
  }
  return passes.length ? +(passes.reduce((a, b) => a + b, 0) / passes.length).toFixed(2) : null;
}

const skillBody = (name) => readFileSync(join(root, 'skills', name, 'SKILL.md'), 'utf8').replace(/^---[\s\S]*?---\n/, '');

// ── Plan / dry run ────────────────────────────────────────────────────────────
const genCalls = models.length * tasks.length * 2;
const judgeCalls = genCalls * 2;
console.log(`SkillBench v${taskSetVersion} · ${models.length} model(s) × ${tasks.length} tasks × 2 modes = ${genCalls} generations + ${judgeCalls} judge passes (judge: ${JUDGE})`);
if (dryRun) { console.log('~rough cost: generations dominate; expect the cost of ~' + genCalls + ' medium completions per full run. Dry run — no calls made.'); process.exit(0); }

// ── Run ───────────────────────────────────────────────────────────────────────
const results = existsSync(outPath) ? JSON.parse(readFileSync(outPath, 'utf8')) : { _comment: 'SkillBench results. One entry per model per run. See skillbench/README.md.', runs: [] };
for (const model of models) {
  console.log(`\n▶ ${model}`);
  const perTask = [];
  for (const t of tasks) {
    process.stdout.write(`  ${t.id} … `);
    const entry = { task: t.id, domain: t.domain };
    try {
      const bare = await complete({ model, user: t.input });
      entry.bare = await judgeScore(t.input, bare);
      const skilled = await complete({ model, system: skillBody(t.skill), user: t.input });
      entry.skilled = await judgeScore(t.input, skilled);
      console.log(`bare ${entry.bare ?? '–'} · skilled ${entry.skilled ?? '–'}`);
    } catch (e) {
      entry.error = String(e.message || e).slice(0, 200);
      console.log('ERROR ' + entry.error);
    }
    perTask.push(entry);
  }
  const ok = perTask.filter((x) => x.skilled != null);
  const mean = (k) => ok.length ? +(ok.reduce((s, x) => s + x[k], 0) / ok.length).toFixed(2) : null;
  const run = {
    model, date: new Date().toISOString().slice(0, 10),
    taskSetVersion, harness: HARNESS_VERSION, judge: JUDGE,
    score: mean('skilled'), bare: mean('bare'),
    lift: ok.length ? +(mean('skilled') - mean('bare')).toFixed(2) : null,
    tasks: perTask,
  };
  results.runs = results.runs.filter((r) => !(r.model === model && r.taskSetVersion === taskSetVersion));
  results.runs.push(run);
  console.log(`  → SkillBench ${run.score ?? '–'} · bare ${run.bare ?? '–'} · skill lift ${run.lift > 0 ? '+' : ''}${run.lift ?? '–'}`);
}
writeFileSync(outPath, JSON.stringify(results, null, 2) + '\n');
console.log(`\nWrote ${outPath}`);
