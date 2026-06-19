#!/usr/bin/env node
// Generates WORKFLOWS.md from workflows.json and validates that every recipe
// references a real skill (skills/<skill>/SKILL.md) and ships a slash command
// (commands/<id>.md). Run: node scripts/build-workflows.mjs  [--check]
// --check exits non-zero if WORKFLOWS.md is out of sync (for CI).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { workflows } = JSON.parse(readFileSync(join(root, 'workflows.json'), 'utf8'));

// --- Validate ---
const errors = [];
for (const w of workflows) {
  if (!existsSync(join(root, 'commands', `${w.id}.md`))) errors.push(`Missing command file: commands/${w.id}.md`);
  for (const step of w.steps) {
    if (!existsSync(join(root, 'skills', step.skill, 'SKILL.md'))) errors.push(`${w.id}: unknown skill "${step.skill}"`);
  }
}
if (errors.length) {
  console.error('Workflow validation failed:\n  ' + errors.join('\n  '));
  process.exit(1);
}

// --- Render WORKFLOWS.md ---
const lines = [];
lines.push('# 🧩 Workflow Recipes', '');
lines.push('> **Skills you can chain.** A recipe runs several skills in sequence and *passes each output forward as context* for the next — so a fuzzy idea comes out the other end as a finished, joined-up set of artifacts. No other skills library chains across professions like this.', '');
lines.push('Run one as a slash command in Claude Code (e.g. `/ship-a-feature a referral program for B2B users`), or fetch it over MCP with the `get_workflow` tool.', '');
lines.push('<!-- Generated from workflows.json by scripts/build-workflows.mjs — do not edit by hand. -->', '');
lines.push(`There are **${workflows.length} recipes** today:`, '');

// Index table
lines.push('| Recipe | Command | Lifecycle | Chains |');
lines.push('|--------|---------|-----------|--------|');
for (const w of workflows) {
  lines.push(`| **${w.name}** | \`${w.command}\` | ${w.lifecycle} | ${w.steps.length} skills |`);
}
lines.push('');

// Per-recipe detail
for (const w of workflows) {
  lines.push(`## ${w.name} — \`${w.command}\``, '');
  lines.push(`*${w.lifecycle}* · ${w.summary}`, '');
  const chain = w.steps.map((s) => `\`${s.skill}\``).join(' → ');
  lines.push(chain, '');
  w.steps.forEach((s, i) => {
    lines.push(`${i + 1}. **${s.skill}** → produces ${s.produces}.`);
  });
  lines.push('');
}

lines.push('---', '');
lines.push('**Add your own:** define it in [`workflows.json`](workflows.json), add a matching `commands/<id>.md`, and run `node scripts/build-workflows.mjs`. Recipes are just composition — every step is an existing skill you can already run on its own.', '');

const md = lines.join('\n');
const target = join(root, 'WORKFLOWS.md');

if (process.argv.includes('--check')) {
  const current = existsSync(target) ? readFileSync(target, 'utf8') : '';
  if (current !== md) {
    console.error('WORKFLOWS.md is out of sync with workflows.json. Run: node scripts/build-workflows.mjs');
    process.exit(1);
  }
  console.log('WORKFLOWS.md is in sync.');
} else {
  writeFileSync(target, md);
  console.log(`Wrote WORKFLOWS.md — ${workflows.length} recipes, all skills + commands validated.`);
}
