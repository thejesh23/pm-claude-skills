// `pm-claude-skills council <skill>` — the second-opinion machine. One model
// AUTHORS the artifact, a DIFFERENT vendor's model CRITIQUES it against the
// skill's own Quality Checks and Anti-Patterns, and a third (or the first)
// ARBITRATES, producing the final artifact with the critique addressed.
//
// Cross-provider adversarial review: vendor blind spots don't overlap, so the
// critic catches what the author's family reliably misses.
//
//   pm-claude-skills council prd-template --text "usage-based pricing for the API tier"
//   pm-claude-skills council exec-summary --input notes.md --models anthropic,openai,gemini
//   pm-claude-skills council prd-template --text "…" --dry-run     # plan only, no calls
//
// Keys from env: ANTHROPIC_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY (needs ≥2
// providers to be a council; 3 calls total). Output → stdout or --out <file>.
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { complete, available, provider } from './lib/providers.mjs';

const PKG_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const getArg = (argv, n, d) => { const i = argv.indexOf('--' + n); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };

async function readStdin() {
  if (process.stdin.isTTY) return '';
  const chunks = []; for await (const c of process.stdin) chunks.push(c);
  return Buffer.concat(chunks).toString('utf8').trim();
}

export async function run(argv) {
  const skill = argv[0] && !argv[0].startsWith('--') ? argv[0] : '';
  if (!skill || argv.includes('--help')) {
    console.log(`The Council — cross-provider adversarial review. Author → critic (different vendor) → arbiter.

Usage: pm-claude-skills council <skill> [--text "…" | --input <file> | stdin] [--models a,b,c] [--out <file>] [--dry-run]
Providers by env key: ANTHROPIC_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY (≥2 required; 3 API calls total).`);
    return skill ? 0 : 1;
  }
  const file = join(PKG_ROOT, 'skills', skill, 'SKILL.md');
  if (!existsSync(file)) { console.error(`Unknown skill "${skill}" — see: pm-claude-skills list`); return 1; }
  const text = readFileSync(file, 'utf8');
  const body = (text.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?([\s\S]*)$/) || [, text])[1].trim();
  const qc = (body.match(/##\s*Quality Checks\s*\n([\s\S]*?)(?=\n##\s|$)/i) || [, '(none declared)'])[1].trim();
  const ap = (body.match(/##\s*Anti-Patterns\s*\n([\s\S]*?)(?=\n##\s|$)/i) || [, '(none declared)'])[1].trim();

  let input = getArg(argv, 'text', '');
  const inFile = getArg(argv, 'input');
  if (!input && inFile && existsSync(inFile)) input = readFileSync(inFile, 'utf8');
  if (!input) input = await readStdin();
  if (!input.trim()) { console.error('No input. Provide --text, --input <file>, or pipe via stdin.'); return 1; }

  const wanted = (getArg(argv, 'models', '') || '').split(',').map((s) => s.trim()).filter(Boolean);
  const avail = available();
  const roster = wanted.length ? wanted : avail;
  const dryRun = argv.includes('--dry-run');

  if (roster.length < 2) {
    console.error(`The Council needs ≥2 providers; ${avail.length ? 'available: ' + avail.join(', ') : 'no provider keys set'}.` +
      ' Set at least two of ANTHROPIC_API_KEY / OPENAI_API_KEY / GEMINI_API_KEY.' + (dryRun ? '' : ' (--dry-run works without keys.)'));
    if (!dryRun) return 1;
  }
  const [author, critic, arbiter] = [roster[0] || 'anthropic', roster[1] || 'openai', roster[2] || roster[0] || 'anthropic'];
  console.error(`⚖️  The Council on "${skill}" — author: ${author} · critic: ${critic} · arbiter: ${arbiter}`);

  if (dryRun) {
    console.error(`[dry-run] 3 calls would run:
  1. ${author} (${provider(author).defaultModel}) authors the artifact from the skill (${body.length} chars of instructions).
  2. ${critic} (${provider(critic).defaultModel}) critiques it against the skill's OWN bar — Quality Checks (${qc.split('\n').length} items) + Anti-Patterns (${ap.split('\n').length} items) — verdict per check, quoting the draft.
  3. ${arbiter} arbitrates: final artifact with every upheld objection addressed, and a changelog of what the critique changed.
No API calls made.`);
    return 0;
  }

  // 1. Author
  console.error(`  1/3 ${author} authoring…`);
  const draft = await complete(author, { system: body + '\n\n---\nExecute this skill now on the input and produce the complete artifact. No questions; state assumptions.', user: input, maxTokens: 8192 });

  // 2. Cross-vendor critique against the skill's own bar
  console.error(`  2/3 ${critic} critiquing…`);
  const critique = await complete(critic, {
    system: `You are the adversarial reviewer on a council. A DIFFERENT model produced a draft using a skill; judge the draft strictly against that skill's OWN declared bar — nothing else.\n\nTHE SKILL'S QUALITY CHECKS:\n${qc}\n\nTHE SKILL'S ANTI-PATTERNS:\n${ap}\n\nFor each quality check: PASS/FAIL + one line quoting the draft. For each anti-pattern: CLEAN/VIOLATED + where. End with "## Priority repairs" — the 3 fixes that most improve the artifact. Be specific; no praise padding.`,
    user: `THE ORIGINAL INPUT:\n${input.slice(0, 8000)}\n\nTHE DRAFT UNDER REVIEW:\n${draft}`, maxTokens: 3000 });

  // 3. Arbitration → final
  console.error(`  3/3 ${arbiter} arbitrating…`);
  const final = await complete(arbiter, {
    system: body + '\n\n---\nYou are the arbiter of a council. Below: the original input, a draft, and a cross-examination of that draft against this skill\'s own quality bar. Produce the FINAL artifact: keep what survived, repair every upheld objection, ignore critiques that misread the input. Then append "## Council changelog" — 3-6 bullets on what the critique changed.',
    user: `INPUT:\n${input.slice(0, 8000)}\n\nDRAFT (${author}):\n${draft}\n\nCRITIQUE (${critic}):\n${critique}`, maxTokens: 8192 });

  const outFile = getArg(argv, 'out');
  const full = final + `\n\n---\n*Council: ${author} authored · ${critic} critiqued · ${arbiter} arbitrated — pm-claude-skills*\n`;
  if (outFile) { writeFileSync(outFile, full); console.error(`✅ ${outFile}`); }
  else process.stdout.write(full);
  return 0;
}
