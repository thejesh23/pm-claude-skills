#!/usr/bin/env node
// The Org Edition server — your company's skill library on your infra.
// Pure Node (no deps): serves the playground, the REST API (/v1/*) over the
// curated library PLUS your private skills, and the private registry. Private
// skills live in ./private-skills and OVERRIDE curated ones on name collision.
//
//   node org/server.mjs [--port 8080] [--private ./private-skills]
// Docker:  docker compose -f org/compose.yml up
//
// What this is NOT: no accounts, no telemetry, no phoning home. Access control
// is your network's job (put it behind your VPN/SSO proxy like any internal tool).
import { createServer } from 'node:http';
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : d; };
const PORT = +arg('port', process.env.PORT || 8080);
const PRIVATE = arg('private', process.env.PRIVATE_SKILLS || join(root, 'org', 'private-skills'));

function loadDir(dir, source) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const f = join(dir, name, 'SKILL.md');
    if (!existsSync(f)) continue;
    const text = readFileSync(f, 'utf8');
    const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    if (!m) continue;
    const desc = (m[1].match(/^description:\s*["']?([^\n]+?)["']?\s*$/m) || [])[1] || '';
    out.push({ name, description: desc, source, instructions: m[2].trim() });
  }
  return out;
}
let SKILLS = [];
function reload() {
  const curated = loadDir(join(root, 'skills'), 'curated');
  const priv = loadDir(PRIVATE, 'private');
  const privNames = new Set(priv.map((s) => s.name));
  SKILLS = [...priv, ...curated.filter((s) => !privNames.has(s.name))];
  console.log(`[org] ${SKILLS.length} skills loaded (${priv.length} private override/extend ${curated.length} curated)`);
}
reload();
setInterval(reload, 60_000).unref();   // private skills hot-reload

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.txt': 'text/plain', '.gif': 'image/gif', '.xml': 'application/xml', '.pdf': 'application/pdf' };
const json = (res, obj, code = 200) => { res.writeHead(code, { 'content-type': 'application/json', 'access-control-allow-origin': '*' }); res.end(JSON.stringify(obj)); };

createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  const p = url.pathname;
  if (p === '/v1' || p === '/v1/') return json(res, { org: true, skills: SKILLS.length, endpoints: ['/v1/skills', '/v1/skills/:name', '/v1/search?q='] });
  if (p === '/v1/skills') return json(res, SKILLS.map(({ name, description, source }) => ({ name, description, source })));
  if (p.startsWith('/v1/skills/')) {
    const s = SKILLS.find((x) => x.name === decodeURIComponent(p.slice(11)));
    return s ? json(res, s) : json(res, { error: 'not_found' }, 404);
  }
  if (p === '/v1/search') {
    const q = (url.searchParams.get('q') || '').toLowerCase().split(/\s+/).filter(Boolean);
    const hits = SKILLS.map((s) => {
      const hay = (s.name + ' ' + s.description).toLowerCase();
      let sc = 0; for (const w of q) if (hay.includes(w)) sc += s.name.includes(w) ? 2 : 1;
      return [sc, s];
    }).filter(([sc]) => sc > 0).sort((a, b) => b[0] - a[0]).slice(0, 15)
      .map(([, s]) => ({ name: s.name, description: s.description, source: s.source }));
    return json(res, { query: url.searchParams.get('q'), matches: hits });
  }
  // static playground
  let f = join(root, 'web', p === '/' ? 'index.html' : p.replace(/^\//, ''));
  try {
    if (statSync(f).isDirectory()) f = join(f, 'index.html');
    res.writeHead(200, { 'content-type': MIME[extname(f)] || 'application/octet-stream' });
    res.end(readFileSync(f));
  } catch { res.writeHead(404); res.end('not found'); }
}).listen(PORT, () => console.log(`[org] Org Edition serving on :${PORT} — playground + /v1 API. Private skills: ${PRIVATE}`));
