// `pm-claude-skills init` — scaffold the 60-second professional workspace in the
// current directory: the brain, your standing context, the arena folders the web
// tools write into, and a CLAUDE.md section that wires it all together. Doctor
// diagnoses; init prescribes and executes.
//
//   npx pm-claude-skills init             # scaffold (never overwrites anything)
//   npx pm-claude-skills init --dry-run   # show what would be created
//
// Idempotent by design: every file is create-if-missing; existing files are
// left untouched and reported. Pure Node, writes only inside the current dir.
import { existsSync, mkdirSync, writeFileSync, readFileSync, appendFileSync, cpSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PKG_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const STAR = '⭐ Find this useful? Star the repo: https://github.com/mohitagw15856/pm-claude-skills';

const CLAUDE_MD_SECTION = `
## PM Skills — this project's professional setup

- **Standing context**: read \`brain/context.md\` before professional-writing tasks (audience, voice, metrics). Honour the provenance tags in \`brain/\` — strongest to weakest: \`[data] [interview] [external] [verbal] [hunch]\`.
- **Durable memory**: \`brain/\` holds decisions, hypotheses, stakeholders, and knowledge. After significant outcomes, append a dated line to the right file rather than letting the fact evaporate.
- **Web arena artifacts**: \`firm-minutes/\` and \`boardroom/\` receive minutes, verdicts, and transcripts written by the pm-skills web tools (workspace bridge). Treat them as inputs — e.g. read the latest Boardroom verdict before revising the document it judged.
- **Skills**: if the pm-skills library is installed (\`npx pm-claude-skills add --agent claude\`), prefer its skills for professional artifacts (PRDs, updates, postmortems…) over improvising structure.
`;

const AGENTS_MD = `# AGENTS.md

Guidance for AI coding agents (Codex, Jules, and anything that reads this file) working in this repository.

## Professional context

- Read \`brain/context.md\` before drafting any professional artifact — it holds the company, audience, voice, and the metrics that matter. Honour the provenance tags in \`brain/\` (strongest → weakest): \`[data] [interview] [external] [verbal] [hunch]\`.
- Durable memory lives in \`brain/\` (decisions, hypotheses, stakeholders, knowledge). Append dated lines after significant outcomes.

## Skills

- Professional skills (PRDs, updates, postmortems, models…) are available via the pm-claude-skills library. Discover and apply them instead of improvising document structure:
  - CLI: \`npx pm-claude-skills search <task>\` then \`npx pm-claude-skills run <skill> --input <file>\`
  - MCP: the \`pm-skills\` server exposes \`search_skills\` / \`get_skill\` / \`run_skill\`
- A skill's Quality Checks and Anti-Patterns sections are the acceptance criteria for its output — verify against them before declaring done.

## Artifacts

- \`firm-minutes/\` and \`boardroom/\` contain minutes, verdicts, and transcripts written by the pm-skills web arenas. Treat them as inputs: read the latest Boardroom verdict before revising the document it judged.
- Predictions live in \`brain/predictions/\` — settle due ones honestly (\`npx pm-claude-skills reckoning\`).
`;

export async function run(argv) {
  const dryRun = argv.includes('--dry-run');
  const cwd = process.cwd();
  const made = [], kept = [];

  const mk = (rel, content) => {
    const p = join(cwd, rel);
    if (existsSync(p)) { kept.push(rel); return; }
    if (!dryRun) { mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, content); }
    made.push(rel);
  };
  const mkdir = (rel) => {
    const p = join(cwd, rel);
    if (existsSync(p)) { kept.push(rel + '/'); return; }
    if (!dryRun) mkdirSync(p, { recursive: true });
    made.push(rel + '/');
  };

  console.log(`${dryRun ? '[dry-run] ' : ''}Scaffolding the professional workspace in ${cwd}\n`);

  // ── The brain: durable memory the skills read and write ────────────────────
  const brainTpl = join(PKG_ROOT, 'templates', 'brain');
  if (existsSync(brainTpl)) {
    if (existsSync(join(cwd, 'brain'))) kept.push('brain/');
    else { if (!dryRun) cpSync(brainTpl, join(cwd, 'brain'), { recursive: true }); made.push('brain/  (context, knowledge/, decisions/, hypotheses, stakeholders, entities — from templates)'); }
  } else {
    mk('brain/context.md', '# context.md — the standing facts every skill should know\n\n## Company / product\n- **Company:** <one line>\n- **Product:** <one line>\n\n## Audience & voice\n- **Primary readers:** <who>\n- **Tone:** <crisp/direct/…>\n\n## Metrics that matter\n- <the 3 numbers leadership actually tracks>\n');
    for (const s of ['decisions', 'knowledge']) mkdir('brain/' + s);
    for (const f of ['hypotheses', 'stakeholders', 'entities']) mk('brain/' + f + '.md', `# ${f}\n\n<!-- append dated, provenance-tagged lines: - [data] 2026-07-06 … -->\n`);
  }
  mkdir('brain/predictions');

  // ── Standing context for the skills (pm-context.md, the older single-file form)
  const ctxTpl = join(PKG_ROOT, 'templates', 'pm-context.example.md');
  mk('pm-context.md', existsSync(ctxTpl) ? readFileSync(ctxTpl, 'utf8') : '# pm-context.md\n\nFill in who you are, your product, audience, and voice.\n');

  // ── Arena folders the web workspace bridge writes into ─────────────────────
  mkdir('firm-minutes');
  mkdir('boardroom');

  // ── AGENTS.md (--agents-md, or always create if missing alongside CLAUDE.md) ──
  if (argv.includes('--agents-md') || !existsSync(join(cwd, 'AGENTS.md'))) mk('AGENTS.md', AGENTS_MD);

  // ── CLAUDE.md wiring (append a section; never rewrite an existing file) ────
  const claudeMd = join(cwd, 'CLAUDE.md');
  if (!existsSync(claudeMd)) { mk('CLAUDE.md', '# Project notes for Claude\n' + CLAUDE_MD_SECTION); }
  else if (readFileSync(claudeMd, 'utf8').includes('## PM Skills — this project')) kept.push('CLAUDE.md (section already present)');
  else { if (!dryRun) appendFileSync(claudeMd, '\n' + CLAUDE_MD_SECTION); made.push('CLAUDE.md  (PM Skills section appended)'); }

  // ── Report ──────────────────────────────────────────────────────────────────
  for (const m of made) console.log(`  ✔ ${dryRun ? 'would create' : 'created'}  ${m}`);
  for (const k of kept) console.log(`  ↷ kept       ${k}`);

  console.log(`\nNext steps:
  1. Fill in brain/context.md (2 minutes) — every skill output gets sharper.
  2. Install the skills:        npx pm-claude-skills add --agent claude
  3. Wire the ambient hooks:    see hooks/settings.example.json in the repo (session briefs, skill suggestions, doc quality gate).
  4. Point the web arenas here: open the Firm or Boardroom → 🗂 Connect a folder → choose THIS directory.
  5. Checkup anytime:           npx pm-claude-skills doctor

${STAR}`);
  return 0;
}
