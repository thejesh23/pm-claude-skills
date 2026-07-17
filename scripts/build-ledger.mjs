#!/usr/bin/env node
// The Ledger — the weekly digest that writes itself. Composes the week from
// sources that already exist (git history, the catalog, seasons, quest issues)
// into newsletter/<year>-w<week>.md and regenerates web/feed.xml (RSS) from
// every issue. Runs on the weekly cron; zero AI, zero cost, zero writing.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'https://mohitagw15856.github.io/pm-claude-skills';
const git = (args) => { try { return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim(); } catch { return ''; } };

const now = new Date();
const week = (() => { const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())); const day = d.getUTCDay() || 7; d.setUTCDate(d.getUTCDate() + 4 - day); const y0 = new Date(Date.UTC(d.getUTCFullYear(), 0, 1)); return Math.ceil((((d - y0) / 86400000) + 1) / 7); })();
const issueName = `${now.getFullYear()}-w${String(week).padStart(2, '0')}`;

// ── The week's raw material ───────────────────────────────────────────────────
const { skills } = JSON.parse(readFileSync(join(root, 'web', 'skills.json'), 'utf8'));
const newSkillFiles = git(['log', '--since=7 days ago', '--diff-filter=A', '--name-only', '--pretty=format:', '--', 'skills/*/SKILL.md'])
  .split('\n').filter(Boolean);
const newSkills = [...new Set(newSkillFiles.map((f) => f.split('/')[1]))].filter((n) => skills.some((s) => s.name === n));
const releases = git(['tag', '--sort=-creatordate', '--format=%(refname:short) %(creatordate:short)'])
  .split('\n').filter((l) => { const d = l.split(' ')[1]; return d && (now - new Date(d)) < 8 * 86400000; });
const commits = +git(['rev-list', '--count', '--since=7 days ago', 'HEAD']) || 0;

let season = null;
try {
  const cur = JSON.parse(readFileSync(join(root, 'web', 'season-current.json'), 'utf8'));
  const lb = JSON.parse(readFileSync(join(root, 'seasons', `leaderboard-${cur.season}.json`), 'utf8'));
  season = { n: cur.season, title: cur.title, closes: cur.closes, entries: lb.entries.length, top: lb.entries[0] || null };
} catch { /* no season staged */ }

let quests = '';
try {
  const issues = JSON.parse(execFileSync('gh', ['issue', 'list', '--label', 'adopt-a-profession', '--state', 'open', '--json', 'number,title'], { cwd: root, encoding: 'utf8' }));
  quests = issues.length ? `${issues.length} professions still up for adoption — [claim one](https://github.com/mohitagw15856/pm-claude-skills/issues?q=is%3Aopen+label%3Aadopt-a-profession).` : '';
} catch { /* gh not available — the section just drops */ }

// ── Compose ───────────────────────────────────────────────────────────────────
const lines = [`# The Ledger — week ${week}, ${now.getFullYear()}`, '',
  `> The week in the open library, written by the repo itself. ${skills.length} skills · [playground](${BASE}/) · [subscribe](${BASE}/feed.xml)`, ''];
if (newSkills.length) {
  lines.push(`## 🆕 ${newSkills.length} new skill${newSkills.length === 1 ? '' : 's'}`, '');
  for (const n of newSkills.slice(0, 12)) {
    const s = skills.find((x) => x.name === n);
    lines.push(`- **[${s.title}](${BASE}/skill/${n}.html)** — ${s.summary}`);
  }
  lines.push('');
}
if (releases.length) {
  lines.push('## 📦 Shipped', '', ...releases.map((r) => { const [tag, date] = r.split(' '); return `- [${tag}](https://github.com/mohitagw15856/pm-claude-skills/releases/tag/${tag}) (${date})`; }), '');
}
if (season) {
  lines.push(`## 🏆 Season ${season.n} — ${season.title}`, '',
    season.entries
      ? `${season.entries} entr${season.entries === 1 ? 'y' : 'ies'} on the board${season.top ? `; ${season.top.name} leads at ${season.top.score}/40` : ''}. Closes ${season.closes} — [play it](${BASE}/casting.html).`
      : `The board is still empty — first entry takes the lead by definition. Closes ${season.closes}. [Play it](${BASE}/casting.html).`, '');
}
if (quests) lines.push('## 🤝 Adopt a profession', '', quests, '');
lines.push('## The week in one number', '', `**${commits} commits.** Daily challenge, streaks and the share grid: [play today's](${BASE}/daily.html).`, '');

writeFileSync(join(root, 'newsletter', `${issueName}.md`), lines.join('\n') + '\n');

// ── RSS from every issue ──────────────────────────────────────────────────────
const issues = readdirSync(join(root, 'newsletter')).filter((f) => /^\d{4}-w\d{2}\.md$/.test(f)).sort().reverse().slice(0, 26);
const items = issues.map((f) => {
  const text = readFileSync(join(root, 'newsletter', f), 'utf8');
  const title = (text.match(/^# (.+)$/m) || [, f])[1];
  const [y, w] = f.replace('.md', '').split('-w');
  const d = new Date(Date.UTC(+y, 0, 1 + (+w - 1) * 7));
  const body = text.split('\n').slice(2).join('\n').slice(0, 2400);
  return `  <item>
    <title>${title.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</title>
    <link>https://github.com/mohitagw15856/pm-claude-skills/blob/main/newsletter/${f}</link>
    <guid>${BASE}/feed.xml#${f}</guid>
    <pubDate>${d.toUTCString()}</pubDate>
    <description><![CDATA[${body}]]></description>
  </item>`;
});
writeFileSync(join(root, 'web', 'feed.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title>PM Skills — The Ledger</title>
  <link>${BASE}/</link>
  <description>The weekly digest of the open professional-skills library — new skills, releases, the Season, and the ecosystem. Written by the repo itself.</description>
  <language>en</language>
${items.join('\n')}
</channel></rss>
`);
console.log(`Wrote newsletter/${issueName}.md + web/feed.xml (${issues.length} issues) — ${newSkills.length} new skills, ${releases.length} releases, ${commits} commits this week.`);
