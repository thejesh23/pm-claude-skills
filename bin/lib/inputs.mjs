// Parse a skill's "Required Inputs" section into structured fields — the same
// heuristics web/build-skills.mjs uses for the playground form, shared here so
// the CLI can prompt field-by-field. Pure Node, no dependencies.
import { createInterface } from 'node:readline';

export function parseInputs(skillBody) {
  const lines = skillBody.split('\n');
  const headingRe = /^#{2,3}\s+.*(required inputs|inputs needed|information needed|what (i|you).*need)/i;
  const i = lines.findIndex((l) => headingRe.test(l));
  if (i === -1) return [];
  const inputs = [];
  for (let j = i + 1; j < lines.length; j++) {
    const line = lines[j];
    if (/^#{1,3}\s/.test(line)) break;
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    if (!bullet) continue;
    const content = bullet[1];
    const boldMatch = content.match(/\*\*(.+?)\*\*/);
    if (!boldMatch) continue;
    const label = boldMatch[1].replace(/\s*\/\s*/g, ' / ').trim();
    let hint = content.replace(/\*\*(.+?)\*\*/, '').replace(/^[\s—:-]+/, '').trim();
    hint = hint.replace(/\*\*/g, '').replace(/^\((.*)\)$/, '$1').trim();
    inputs.push({ label, hint, optional: /optional/i.test(content) });
  }
  return inputs;
}

// Interactive field-by-field prompt (TTY only). Returns the composed input text,
// or '' if the user provided nothing at all.
export async function promptInputs(inputs, skillName) {
  const rl = createInterface({ input: process.stdin, output: process.stderr });
  const ask = (q) => new Promise((res) => rl.question(q, res));
  console.error(`${skillName} declares ${inputs.length} input${inputs.length === 1 ? '' : 's'}. Fill them in (Enter to skip optional ones):\n`);
  const parts = [];
  for (const inp of inputs) {
    const tag = inp.optional ? ' (optional)' : '';
    const hint = inp.hint ? ` — ${inp.hint}` : '';
    const v = (await ask(`${inp.label}${tag}${hint}\n> `)).trim();
    if (v) parts.push(`${inp.label}: ${v}`);
  }
  rl.close();
  return parts.join('\n');
}
