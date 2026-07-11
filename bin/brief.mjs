// `pm-claude-skills brief` — the chief-of-staff, on demand. The SessionStart
// hook's morning brief as a human command: predictions due, the latest arena
// verdicts, open hypotheses, and (with --stats) the project's public vitals.
// Pure file reads + two public GETs. No API key, no cost.
//
//   pm-claude-skills brief            # this directory's professional state
//   pm-claude-skills stats            # the public vitals (runs served, stars, bench)
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const cwd = process.cwd();
const today = () => new Date().toISOString().slice(0, 10);
const dim = (s) => `\x1b[2m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;

function predictions() {
  const dir = join(cwd, 'brain', 'predictions');
  if (!existsSync(dir)) return { due: [], open: 0 };
  const due = []; let open = 0;
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.md'))) {
    const t = readFileSync(join(dir, f), 'utf8');
    if (!/^status:\s*pending$/m.test(t)) continue;
    open++;
    const d = (t.match(/^due:\s*(\S+)/m) || [])[1];
    if (d && d <= today()) {
      const line = (t.split(/\n---\n/)[1] || '').trim().split('\n')[0];
      due.push({ due: d, text: line, file: f });
    }
  }
  return { due, open };
}
function latestIn(dir, skipDirs = true) {
  const p = join(cwd, dir);
  if (!existsSync(p)) return null;
  const files = readdirSync(p).filter((f) => !skipDirs || f.includes('.'));
  if (!files.length) return null;
  return files.sort().pop();
}
function hypotheses() {
  for (const c of ['brain/hypotheses.md', 'brain/hypotheses']) {
    const p = join(cwd, c);
    if (!existsSync(p)) continue;
    try {
      const text = c.endsWith('.md') ? readFileSync(p, 'utf8')
        : readdirSync(p).map((f) => readFileSync(join(p, f), 'utf8')).join('\n');
      return text.split('\n').filter((l) => l.trim().startsWith('- ')).slice(0, 5);
    } catch { return []; }
  }
  return [];
}

export async function brief() {
  console.log(bold(`☀️  Chief of Staff — ${today()}`) + dim(`  (${cwd})`) + '\n');
  const { due, open } = predictions();
  if (due.length) {
    console.log(bold('🔔 Predictions due — settle them:'));
    for (const d of due) console.log(`   ${d.due}  ${d.text}  ${dim(d.file)}`);
    console.log(dim('   pm-claude-skills reckoning score <file> hit|miss') + '\n');
  } else if (open) console.log(`⏳ ${open} prediction(s) open, none due today.\n`);
  for (const [dir, label] of [['firm-minutes', '🏢 Latest Firm minutes'], ['boardroom', '🏛 Latest Boardroom artifact']]) {
    const f = latestIn(dir);
    if (f) console.log(`${label}: ${f}${dim(' — read before revising what it discusses')}`);
  }
  const hyp = hypotheses();
  if (hyp.length) {
    console.log('\n' + bold('🧪 Open hypotheses') + dim(' ([hunch] stays unsettled until tested):'));
    hyp.forEach((h) => console.log('   ' + h.trim().slice(0, 100)));
  }
  if (!due.length && !open && !latestIn('firm-minutes') && !hyp.length) {
    console.log(dim('Nothing on file here. Scaffold the workspace:  pm-claude-skills init'));
  }
  return 0;
}

export async function stats() {
  console.log(bold('📈 PM Skills — public vitals\n'));
  try {
    const h = await (await fetch('https://raw.githubusercontent.com/mohitagw15856/pm-claude-skills/vitals-data/history.json')).json();
    const last = h[h.length - 1] || {}, first = h[0] || {};
    console.log(`  🔥 Free runs served: ${bold(String(last.runs ?? '—'))}  (${h.length} days on the ledger, +${(last.runs ?? 0) - (first.runs ?? 0)} this period)`);
    console.log(`  ⭐ Stars: ${bold(String(last.stars ?? '—'))}`);
  } catch { console.log(dim('  vitals ledger unreachable')); }
  try {
    const b = await (await fetch('https://raw.githubusercontent.com/mohitagw15856/pm-claude-skills/main/skillbench/results.json')).json();
    for (const r of (b.runs || [])) console.log(`  🏆 SkillBench: ${r.model} → ${r.score}  ${dim('(' + (r.date || '').slice(0, 10) + ')')}`);
  } catch { /* fine */ }
  console.log(dim('\n  Live dashboard: https://mohitagw15856.github.io/pm-claude-skills/status.html'));
  return 0;
}
