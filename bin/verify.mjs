// `pm-claude-skills verify` — integrity check for installed skills. The
// installer records a lockfile of content hashes (.pm-skills-lock.json in the
// target dir); this command recomputes them and reports drift: a skill that
// changed on disk after install is either your edit or someone else's — either
// way you should know. Curated-library staleness is `doctor`'s job; this is
// tamper/drift detection for everything `install` brought in.
//
//   pm-claude-skills verify                 # default agent (claude)
//   pm-claude-skills verify --agent codex
//
// Exit codes: 0 clean · 1 drift or missing files found · 2 no lockfile.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { createHash } from 'node:crypto';

const AGENT_DIRS = {
  claude: join(homedir(), '.claude', 'skills'),
  hermes: join(homedir(), '.hermes', 'skills'),
  codex: join(homedir(), '.codex', 'skills'),
  openclaw: join(homedir(), '.openclaw', 'skills'),
};
const getArg = (argv, n, d) => { const i = argv.indexOf('--' + n); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };

export async function run(argv) {
  const agent = getArg(argv, 'agent', 'claude');
  const target = getArg(argv, 'target', AGENT_DIRS[agent]);
  if (!target) { console.error(`--agent must be one of: ${Object.keys(AGENT_DIRS).join(', ')}`); return 1; }
  const lockPath = join(target, '.pm-skills-lock.json');
  if (!existsSync(lockPath)) {
    console.log(`No lockfile at ${lockPath} — nothing installed via \`pm-claude-skills install\` yet (curated-library health is \`doctor\`'s job).`);
    return 2;
  }
  let lock;
  try { lock = JSON.parse(readFileSync(lockPath, 'utf8')); }
  catch { console.error(`Lockfile at ${lockPath} is corrupt — reinstall with --force to rebuild it.`); return 1; }

  let clean = 0, drifted = 0, missing = 0;
  for (const [name, rec] of Object.entries(lock.skills || {})) {
    const problems = [];
    for (const [rel, hash] of Object.entries(rec.files || {})) {
      const p = join(target, name, rel);
      if (!existsSync(p)) { problems.push(`missing: ${rel}`); continue; }
      const actual = 'sha256:' + createHash('sha256').update(readFileSync(p)).digest('hex');
      if (actual !== hash) problems.push(`modified: ${rel}`);
    }
    if (!problems.length) { clean++; continue; }
    const gone = problems.every((x) => x.startsWith('missing'));
    gone ? missing++ : drifted++;
    console.log(`  ${gone ? '✂' : '⚠'} ${name}  (${rec.repo}@${rec.ref}, installed ${rec.installedAt})`);
    for (const pr of problems.slice(0, 6)) console.log(`      ${pr}`);
  }
  console.log(`\n🔏 verify — ${clean} intact · ${drifted} drifted · ${missing} removed  (${Object.keys(lock.skills || {}).length} locked skill(s) in ${target})`);
  if (drifted) console.log('Drift = the files changed after install. If you edited them, fine — reinstall with --force to re-lock. If you didn\'t: investigate before an agent runs them.');
  return drifted || missing ? 1 : 0;
}
