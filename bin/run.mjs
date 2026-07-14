// `pm-claude-skills run <skill>` — run a skill headless with your own key, so every skill is
// scriptable and CI-usable (not just installable or browser-only). Input comes from --text,
// --input <file>, or stdin; the finished artifact prints to stdout (or --out <file>).
// Needs ANTHROPIC_API_KEY. Pure Node, no dependencies — reuses bin/lib/anthropic.mjs.
import { readFileSync, existsSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { complete, parseSkill } from './lib/anthropic.mjs';
import { parseInputs, promptInputs } from './lib/inputs.mjs';

const PKG_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const SKILLS_DIR = join(PKG_ROOT, 'skills');
const SUFFIX =
  '\n\n---\nThe user has provided their input below. Execute this skill now and produce the ' +
  'complete output. Do not ask follow-up questions — work with what is given and note any ' +
  'reasonable assumptions.';

const getArg = (argv, name, def) => { const i = argv.indexOf('--' + name); return i !== -1 && argv[i + 1] ? argv[i + 1] : def; };

async function readStdin() {
  if (process.stdin.isTTY) return '';
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  return Buffer.concat(chunks).toString('utf8').trim();
}

export async function run(argv) {
  const skill = argv[0] && !argv[0].startsWith('--') ? argv[0] : '';
  if (!skill || argv.includes('--help') || argv.includes('-h')) {
    console.log(`Run a skill headless with your own key (output → stdout).

Usage:
  pm-claude-skills run <skill> [--text "…"] [--input <file>] [--model <m>] [--out <file>]
  cat notes.txt | pm-claude-skills run meeting-notes        # input can be piped

Examples:
  pm-claude-skills run prd-template --text "a referral program for B2B users"
  cat q2-notes.md | pm-claude-skills run executive-update --out update.md

Needs ANTHROPIC_API_KEY. See available skills with:  pm-claude-skills list
No setup at all? Run any skill free in the browser: https://mohitagw15856.github.io/pm-claude-skills/`);
    return skill ? 0 : 1;
  }

  const file = join(SKILLS_DIR, skill, 'SKILL.md');
  if (!existsSync(file)) {
    const all = existsSync(SKILLS_DIR) ? readdirSync(SKILLS_DIR).filter((n) => { try { return statSync(join(SKILLS_DIR, n)).isDirectory(); } catch { return false; } }) : [];
    const near = all.filter((n) => n.includes(skill) || skill.includes(n)).slice(0, 6);
    console.error(`Unknown skill "${skill}".` + (near.length ? ` Did you mean: ${near.join(', ')}?` : ' Run `pm-claude-skills list` to see all skills.'));
    return 1;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY || '';
  if (!apiKey) {
    console.error('Set ANTHROPIC_API_KEY to run a skill — or use the browser playground (no setup): https://mohitagw15856.github.io/pm-claude-skills/');
    return 1;
  }

  // Resolve input: --text wins, then --input <file>, then piped stdin.
  let input = getArg(argv, 'text', '');
  const inFile = getArg(argv, 'input');
  if (!input && inFile) {
    if (!existsSync(inFile)) { console.error(`Input file not found: ${inFile}`); return 1; }
    input = readFileSync(inFile, 'utf8');
  }
  if (!input) input = await readStdin();
  const { body } = parseSkill(readFileSync(file, 'utf8'));
  if ((!input || !input.trim()) && process.stdin.isTTY) {
    // No input but a human at the terminal: prompt field-by-field from the
    // skill's own declared inputs (same parse the playground form uses).
    const declared = parseInputs(body);
    if (declared.length) input = await promptInputs(declared, skill);
  }
  if (!input || !input.trim()) {
    console.error('No input given. Provide --text "…", --input <file>, pipe via stdin, or run in a terminal to be prompted field-by-field.');
    return 1;
  }

  const model = getArg(argv, 'model', 'claude-sonnet-4-6');
  console.error(`▶ Running ${skill} with ${model}…`);
  const out = await complete({ apiKey, model, system: body + SUFFIX, messages: [{ role: 'user', content: input }], maxTokens: 8192 });

  const outFile = getArg(argv, 'out');
  if (outFile) { writeFileSync(outFile, out + '\n'); console.error(`✅ Wrote ${outFile}`); }
  else process.stdout.write(out + '\n');
  return 0;
}
