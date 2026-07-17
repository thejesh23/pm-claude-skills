// `pm-claude-skills import` — bring your existing prompt hoard. Converts the
// rule files you already maintain (Cursor, Cline, Windsurf, or any prompt
// file) into SKILL.md packages: your content becomes the method section,
// the conformance structure is scaffolded around it, and skillspec tells you
// what's left to write. Nothing is guessed — TODOs mark what only you know.
//
//   pm-claude-skills import cursor            # scans .cursor/rules + .cursorrules
//   pm-claude-skills import cline|windsurf    # their rule dirs
//   pm-claude-skills import file my-prompt.md # any single prompt file
//   … [--out imported-skills]
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { join, basename, resolve } from 'node:path';

const arg = (argv, n, d) => { const i = argv.indexOf('--' + n); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const kebab = (s) => s.toLowerCase().replace(/\.[a-z]+$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'imported-skill';

const SOURCES = {
  cursor: () => [
    ...(existsSync('.cursorrules') ? [{ file: '.cursorrules', name: 'cursor-rules' }] : []),
    ...list('.cursor/rules', /\.mdc?$/),
  ],
  cline: () => [
    ...(existsSync('.clinerules') && !isDir('.clinerules') ? [{ file: '.clinerules', name: 'cline-rules' }] : []),
    ...list('.clinerules', /\.md$/),
  ],
  windsurf: () => [
    ...(existsSync('.windsurfrules') ? [{ file: '.windsurfrules', name: 'windsurf-rules' }] : []),
    ...list('.windsurf/rules', /\.md$/),
  ],
};
const isDir = (p) => { try { return existsSync(p) && readdirSync(p) !== undefined; } catch { return false; } };
const list = (dir, re) => {
  try { return readdirSync(dir).filter((f) => re.test(f)).map((f) => ({ file: join(dir, f), name: kebab(f) })); }
  catch { return []; }
};

function stripFrontmatter(text) {
  const m = text.match(/^\s*---\r?\n([\s\S]*?)\r?\n\s*---\r?\n?([\s\S]*)$/);
  return m ? { meta: m[1], body: m[2] } : { meta: '', body: text };
}

function toSkill(name, raw) {
  const { body } = stripFrontmatter(raw);
  const firstLine = (body.trim().split('\n')[0] || '').replace(/^#+\s*/, '').slice(0, 120);
  return `---
name: ${name}
description: "${(firstLine || 'Imported rule set.').replace(/"/g, "'")} Use when <!-- TODO: the trigger phrases a user would actually type -->. Produces <!-- TODO: the concrete artifact -->."
---

# ${name.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ')}

<!-- Imported by \`pm-claude-skills import\` — your original content is the method
     section below, untouched. The scaffolded sections carry TODOs only YOU can
     answer; skillspec-check warns until they're real. -->

## What This Skill Produces
- <!-- TODO: the concrete deliverables this rule set was written to get -->

## Required Inputs
Ask for these if not provided:
- <!-- TODO: what this needs from the user each time -->

## Method (imported, verbatim)

${body.trim()}

## Output Format
<!-- TODO: a concrete template so two runs look like the same product -->

## Quality Checks
- [ ] <!-- TODO: what must be true before this output ships -->

## Anti-Patterns
- [ ] Do not <!-- TODO: the mistake this rule set exists to prevent -->
`;
}

export async function run(argv) {
  const src = argv[0];
  if (!src || argv.includes('--help')) {
    console.log(`import — convert your existing rules/prompts into SKILL.md packages.

  pm-claude-skills import cursor|cline|windsurf [--out imported-skills]
  pm-claude-skills import file <path> [--name my-skill] [--out imported-skills]

Your content becomes the method section verbatim; conformance structure is
scaffolded with TODOs. Then: npx skillspec-check <out> to see what's left.`);
    return src ? 0 : 2;
  }
  const out = resolve(arg(argv, 'out', 'imported-skills'));
  let items = [];
  if (src === 'file') {
    const f = argv[1];
    if (!f || !existsSync(f)) { console.error('import file <path> — file not found.'); return 1; }
    items = [{ file: f, name: kebab(arg(argv, 'name', basename(f))) }];
  } else if (SOURCES[src]) {
    items = SOURCES[src]();
    if (!items.length) { console.error(`Nothing found for "${src}" here — run from the project root that has the rule files.`); return 1; }
  } else {
    console.error(`Unknown source "${src}" — cursor | cline | windsurf | file`); return 2;
  }
  const seen = new Set();
  for (const it of items) {
    let name = it.name, n = 2;
    while (seen.has(name)) name = `${it.name}-${n++}`;
    seen.add(name);
    mkdirSync(join(out, name), { recursive: true });
    writeFileSync(join(out, name, 'SKILL.md'), toSkill(name, readFileSync(it.file, 'utf8')));
    console.log(`→ ${name}  (from ${it.file})`);
  }
  console.log(`\n📥 imported ${items.length} → ${out}
Next: fill the TODOs (they're the judgment only you have), then:
  npx skillspec-check ${arg(argv, 'out', 'imported-skills')}
Keep them private, or share back: https://github.com/mohitagw15856/pm-claude-skills/blob/main/CONTRIBUTING.md`);
  return 0;
}
