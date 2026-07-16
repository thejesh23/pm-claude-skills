// `pm-claude-skills outdated` — what changed since you installed. Compares the
// skills in an install target (default ~/.claude/skills) against this package's
// copies by content hash: changed / same / local-only, with an update path.
//
//   pm-claude-skills outdated                     # scan ~/.claude/skills
//   pm-claude-skills outdated --target <dir>
//   pm-claude-skills outdated --update            # refresh the changed ones in place
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const PKG_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const sha = (t) => createHash('sha256').update(t).digest('hex');
const arg = (argv, n, d) => { const i = argv.indexOf('--' + n); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };

export async function run(argv) {
  if (argv.includes('--help')) {
    console.log('outdated — compare installed skills against this package.\n  pm-claude-skills outdated [--target <dir>] [--update]');
    return 0;
  }
  const target = arg(argv, 'target', join(process.env.HOME || '', '.claude', 'skills'));
  if (!existsSync(target)) { console.error(`No skills at ${target} — nothing installed there yet.`); return 1; }
  const doUpdate = argv.includes('--update');
  let changed = 0, same = 0, local = 0;
  const changedNames = [];
  for (const n of readdirSync(target)) {
    const inst = join(target, n, 'SKILL.md');
    if (!existsSync(inst) || !statSync(join(target, n)).isDirectory()) continue;
    const pkg = join(PKG_ROOT, 'skills', n, 'SKILL.md');
    if (!existsSync(pkg)) { local++; continue; }   // theirs, not ours — never touch
    const a = readFileSync(inst, 'utf8'), b = readFileSync(pkg, 'utf8');
    if (sha(a) === sha(b)) { same++; continue; }
    changed++; changedNames.push(n);
    if (doUpdate) { writeFileSync(inst, b); console.log(`↻ updated ${n}`); }
    else console.log(`≠ ${n} — library copy differs from your installed one`);
  }
  console.log(`\n${same} up to date · ${changed} ${doUpdate ? 'updated' : 'outdated'} · ${local} local-only (untouched)`);
  if (changed && !doUpdate) {
    console.log(`Refresh them:  pm-claude-skills outdated --target ${target} --update`);
    console.log('Careful: --update overwrites installed copies — if you edited a library skill locally, fork it under a new name first (or use Skill Remix).');
  }
  return 0;
}
