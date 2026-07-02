#!/usr/bin/env node
// Validates community/registry.json — structure, namespace rules, and (with
// --fetch) the live SKILL.md each entry points at: SkillSpec conformance level
// + the security-pattern scan the core library uses. Run by the registry-check
// workflow on PRs touching the registry; run locally before submitting:
//
//   node scripts/check-registry.mjs            # structural only, no network
//   node scripts/check-registry.mjs --fetch    # + fetch and validate each skill
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const fetchMode = process.argv.includes('--fetch');
const reg = JSON.parse(readFileSync(join(root, 'community', 'registry.json'), 'utf8'));
const errors = [], warnings = [];

if (reg.spec !== 'pm-skills-registry/1') errors.push('spec must be "pm-skills-registry/1"');
if (!Array.isArray(reg.skills)) errors.push('skills must be an array');

// Curated skill names — community entries may not shadow them (typosquat guard).
import { readdirSync } from 'node:fs';
const curated = new Set(readdirSync(join(root, 'skills')));

const seen = new Set();
const NAME_RE = /^[a-z0-9-]+\/[a-z0-9]+(-[a-z0-9]+)*$/;

// Security patterns mirrored from the skill auditor's highest-signal rules.
const BANNED = [
  [/ignore (all |any )?(previous|prior|above) (instructions|rules)/i, 'instruction-override phrasing'],
  [/disregard (your|the) (system prompt|guidelines|instructions)/i, 'instruction-override phrasing'],
  [/curl\s+-?[a-z]*\s*https?:\/\/(?!raw\.githubusercontent|github\.com|docs\.)/i, 'network call to an unvetted URL'],
  [/send (the )?(user('|’)s)? ?(data|input|conversation|api key)/i, 'data-exfiltration instruction'],
  [/\b(api[_-]?key|token|password)\s*[:=]\s*['"][A-Za-z0-9_\-]{16,}/, 'embedded credential'],
];

for (const s of reg.skills || []) {
  const tag = s.name || '(unnamed)';
  if (!s.name || !NAME_RE.test(s.name)) errors.push(`${tag}: name must be "handle/skill-name" (lowercase kebab)`);
  if (seen.has(s.name)) errors.push(`${tag}: duplicate name`);
  seen.add(s.name);
  const [handle, skillName] = (s.name || '').split('/');
  if (curated.has(skillName)) errors.push(`${tag}: shadows the curated skill "${skillName}" — pick a distinct name`);
  if (!/^https:\/\/github\.com\/[^/]+\/[^/]+\/?$/.test(s.repo || '')) errors.push(`${tag}: repo must be a github.com/<owner>/<repo> URL`);
  else {
    const owner = s.repo.split('/')[3].toLowerCase();
    if (handle && owner !== handle.toLowerCase()) errors.push(`${tag}: namespace "${handle}" must match repo owner "${owner}"`);
  }
  if (!s.path || !s.path.endsWith('SKILL.md')) errors.push(`${tag}: path must point at a SKILL.md`);
  if (!s.ref) warnings.push(`${tag}: no ref — defaulting consumers to main; a tag is more stable`);
  if (!s.description || s.description.length < 30) warnings.push(`${tag}: description missing/short — copy the frontmatter description`);
}

// ── Live validation ───────────────────────────────────────────────────────────
async function validateLive(s) {
  const [owner, repo] = s.repo.replace(/\/$/, '').split('/').slice(3);
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${s.ref || 'main'}/${s.path}`;
  const res = await fetch(url);
  if (!res.ok) return [`${s.name}: fetch failed (${res.status}) — ${url}`];
  const text = await res.text();
  const errs = [];
  const fm = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!fm) return [`${s.name}: no YAML frontmatter — fails SkillSpec L1`];
  const name = (fm[1].match(/^name:\s*["']?([\w-]+)["']?\s*$/m) || [])[1];
  const desc = (fm[1].match(/^description:/m) || [])[0];
  if (!name) errs.push(`${s.name}: frontmatter missing name`);
  else if (name !== s.name.split('/')[1]) errs.push(`${s.name}: frontmatter name "${name}" ≠ registry skill name`);
  if (!desc) errs.push(`${s.name}: frontmatter missing description`);
  const body = fm[2] || '';
  // Conformance level (informational)
  const hasL2 = /##\s*(What This Skill Produces|Required Inputs)/i.test(body) && /##\s*Output/i.test(body);
  const hasL3 = hasL2 && /##\s*Quality Checks/i.test(body) && /##\s*Anti-Patterns/i.test(body);
  console.log(`  ${s.name}: SkillSpec ${hasL3 ? 'L3 Trustworthy' : hasL2 ? 'L2 Structured' : 'L1 Loadable'} (${Math.round(text.length / 1024)} KB)`);
  for (const [re, why] of BANNED) if (re.test(text)) errs.push(`${s.name}: SECURITY — ${why}`);
  return errs;
}

(async () => {
  if (fetchMode) {
    for (const s of reg.skills || []) {
      if (!s.name || !s.repo || !s.path) continue; // structural errors already recorded
      try { errors.push(...await validateLive(s)); }
      catch (e) { errors.push(`${s.name}: fetch error — ${e.message}`); }
    }
  }
  warnings.forEach((w) => console.warn('⚠ ' + w));
  if (errors.length) { errors.forEach((e) => console.error('✗ ' + e)); process.exit(1); }
  console.log(`Registry OK — ${reg.skills.length} entr${reg.skills.length === 1 ? 'y' : 'ies'}${fetchMode ? ' (live-validated)' : ' (structural; use --fetch for live checks)'}`);
})();
