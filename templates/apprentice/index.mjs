#!/usr/bin/env node
// The Apprentice — your first employee, batteries included.
// A ready-to-run Claude Agent SDK agent that loads your professional brain,
// discovers your installed pm-skills, and executes real work end to end:
//
//   npm install
//   export ANTHROPIC_API_KEY=sk-ant-…
//   node index.mjs "draft the Q3 stakeholder update from ./notes.md"
//   node index.mjs --chain run-discovery --input interviews.md
//
// What makes it different from a bare agent: it starts every task already
// knowing your company (brain/context.md), your standards (the skills' Quality
// Checks are its acceptance criteria), and your history (brain/decisions).
import { query } from '@anthropic-ai/claude-agent-sdk';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const task = process.argv.slice(2).join(' ').trim();
if (!task) {
  console.log('Usage: node index.mjs "<task>"   e.g. node index.mjs "draft a PRD for usage-based pricing from ./notes.md"');
  process.exit(1);
}

// ── Ground the agent in YOUR context (all local reads) ───────────────────────
function read(p) { try { return readFileSync(p, 'utf8'); } catch { return ''; } }
const brainDir = join(process.cwd(), 'brain');
const context = read(join(brainDir, 'context.md')) || read(join(process.cwd(), 'pm-context.md'));
const decisions = existsSync(join(brainDir, 'decisions'))
  ? readdirSync(join(brainDir, 'decisions')).slice(-5).map((f) => read(join(brainDir, 'decisions', f))).join('\n---\n')
  : '';
const skillsDir = [join(homedir(), '.claude', 'skills'), join(process.cwd(), 'skills')].find((d) => existsSync(d));
const skillNames = skillsDir ? readdirSync(skillsDir).filter((n) => existsSync(join(skillsDir, n, 'SKILL.md'))) : [];

const systemAppend = `
You are The Apprentice — a professional agent grounded in this workspace.

STANDING CONTEXT (from brain/context.md — honour it in every artifact):
${context || '(no brain/context.md found — run `npx pm-claude-skills init` to create one; proceed with stated assumptions)'}

${decisions ? `RECENT DECISIONS ON RECORD:\n${decisions.slice(0, 4000)}\n` : ''}
WORKING METHOD:
1. If a professional artifact is requested, find the matching skill${skillsDir ? ` in ${skillsDir} (installed: ${skillNames.slice(0, 40).join(', ')}${skillNames.length > 40 ? '…' : ''})` : ' via `npx pm-claude-skills search <task>`'} and READ its SKILL.md before drafting — its structure is the structure.
2. The skill's Quality Checks section is your acceptance test; its Anti-Patterns are your reviewer. Verify against both before declaring done.
3. Write artifacts to ./artifacts/<date>-<slug>.md. After significant outcomes, append a dated, provenance-tagged line to the right brain/ file.
4. Predictions you make go in brain/predictions/ with a confidence and a due date — the Reckoning keeps score.`;

console.error(`🧑‍🎓 The Apprentice — ${skillNames.length} skills available, brain ${context ? 'loaded' : 'MISSING'}\n`);

for await (const message of query({
  prompt: task,
  options: {
    systemPrompt: { type: 'preset', preset: 'claude_code', append: systemAppend },
    allowedTools: ['Read', 'Write', 'Edit', 'Glob', 'Grep', 'Bash'],
    permissionMode: 'acceptEdits',
    maxTurns: 40,
  },
})) {
  if (message.type === 'assistant') {
    for (const block of message.message.content) if (block.type === 'text') process.stdout.write(block.text);
  }
  if (message.type === 'result') {
    console.error(`\n\n— done (${message.num_turns} turns, $${(message.total_cost_usd ?? 0).toFixed(4)})`);
  }
}
