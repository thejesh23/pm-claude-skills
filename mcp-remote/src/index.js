// Remote MCP server for PM Skills — a Cloudflare Worker speaking MCP over the
// Streamable HTTP transport, so anyone can add the library as a URL connector in
// ChatGPT, Claude.ai, Cursor, etc. (no install). Stateless; skills are fetched from
// the public catalog and cached at the edge.
//
// Deploy: cd mcp-remote && npx wrangler deploy  (free Cloudflare account)
// Then add the printed https://…workers.dev/  URL as an MCP/connector endpoint.

const SKILLS_URL = 'https://mohitagw15856.github.io/pm-claude-skills/skills.json';
const SERVER = { name: 'pm-claude-skills', version: 'remote-1.0.0' };

let CACHE = null;
async function getSkills() {
  if (CACHE) return CACHE;
  const r = await fetch(SKILLS_URL, { cf: { cacheTtl: 3600, cacheEverything: true } });
  const j = await r.json();
  CACHE = (j.skills || []).map((s) => ({ name: s.name, title: s.title, description: s.description, plugin: s.plugin, body: s.instructions || '' }));
  return CACHE;
}

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
  'access-control-allow-headers': 'content-type, authorization, mcp-session-id, mcp-protocol-version',
};

const TOOLS = [
  { name: 'list_skills', description: 'List every available skill (name + description). Optionally filter by bundle.', inputSchema: { type: 'object', properties: { bundle: { type: 'string' } } } },
  { name: 'search_skills', description: 'Search skills by keyword and return the best matches.', inputSchema: { type: 'object', properties: { query: { type: 'string' }, limit: { type: 'number' } }, required: ['query'] } },
  { name: 'get_skill', description: 'Get a skill\'s full instructions by name. Apply them to the user\'s task.', inputSchema: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] } },
];

async function runTool(name, args) {
  const skills = await getSkills();
  if (name === 'list_skills') {
    const list = args.bundle ? skills.filter((s) => s.plugin === args.bundle) : skills;
    return list.map((s) => `- ${s.name} (${s.plugin}): ${s.description}`).join('\n');
  }
  if (name === 'search_skills') {
    const q = String(args.query || '').toLowerCase();
    const scored = skills.map((s) => ({ s, n: (s.title + ' ' + s.description + ' ' + s.name).toLowerCase().split(q).length - 1 }))
      .filter((x) => x.n > 0).sort((a, b) => b.n - a.n).slice(0, args.limit || 10);
    return scored.length ? scored.map((x) => `- ${x.s.name}: ${x.s.description}`).join('\n') : 'No matching skills.';
  }
  if (name === 'get_skill') {
    const s = skills.find((x) => x.name === args.name);
    return s ? `# ${s.title}\n\n${s.body}` : `No skill named "${args.name}". Use search_skills to find one.`;
  }
  throw new Error('Unknown tool: ' + name);
}

async function handle(msg) {
  const { id, method, params = {} } = msg;
  const result = async () => {
    switch (method) {
      case 'initialize':
        return { protocolVersion: params.protocolVersion || '2025-03-26', capabilities: { tools: {}, prompts: {}, resources: {} }, serverInfo: SERVER };
      case 'tools/list':
        return { tools: TOOLS };
      case 'tools/call': {
        try { return { content: [{ type: 'text', text: await runTool(params.name, params.arguments || {}) }] }; }
        catch (e) { return { content: [{ type: 'text', text: 'Error: ' + e.message }], isError: true }; }
      }
      case 'prompts/list': {
        const s = await getSkills();
        return { prompts: s.map((x) => ({ name: x.name, title: x.title, description: x.description, arguments: [{ name: 'task', description: 'The task to apply this skill to.', required: false }] })) };
      }
      case 'prompts/get': {
        const s = (await getSkills()).find((x) => x.name === params.name);
        if (!s) throw new Error('Unknown prompt');
        const task = (params.arguments && params.arguments.task) || '';
        return { description: s.description, messages: [{ role: 'user', content: { type: 'text', text: s.body + (task ? `\n\n---\nApply this skill now to:\n${task}` : '') } }] };
      }
      case 'resources/list': {
        const s = await getSkills();
        return { resources: s.map((x) => ({ uri: `skill://${x.name}`, name: x.title, description: x.description, mimeType: 'text/markdown' })) };
      }
      case 'resources/read': {
        const uri = params.uri || '';
        const s = (await getSkills()).find((x) => x.name === uri.replace(/^skill:\/\//, ''));
        if (!s) throw new Error('Unknown resource');
        return { contents: [{ uri, mimeType: 'text/markdown', text: `# ${s.title}\n\n${s.body}` }] };
      }
      case 'ping':
        return {};
      default:
        return undefined; // notifications / unknown → no result
    }
  };

  // notifications (no id) get no response
  if (id === undefined || id === null) return null;
  try {
    const r = await result();
    if (r === undefined) return { jsonrpc: '2.0', id, error: { code: -32601, message: 'Method not found: ' + method } };
    return { jsonrpc: '2.0', id, result: r };
  } catch (e) {
    return { jsonrpc: '2.0', id, error: { code: -32603, message: e.message } };
  }
}

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });
    if (request.method === 'GET' || request.method === 'HEAD') {
      // MCP Streamable HTTP: a client opening the optional SSE stream sends Accept:
      // text/event-stream. This server is stateless (no server-initiated messages), so
      // we signal "no stream" with 405 per spec; humans/health-checks get a JSON blurb.
      const accept = request.headers.get('accept') || '';
      if (accept.includes('text/event-stream')) return new Response('This MCP server has no server-initiated stream; send JSON-RPC via POST.', { status: 405, headers: CORS });
      return new Response(JSON.stringify({ server: SERVER, transport: 'streamable-http', hint: 'POST MCP JSON-RPC here, or add this URL as an MCP connector.' }), { headers: { 'content-type': 'application/json', ...CORS } });
    }
    if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: CORS });
    let body;
    try { body = await request.json(); } catch { return new Response('Bad JSON', { status: 400, headers: CORS }); }
    const out = Array.isArray(body) ? (await Promise.all(body.map(handle))).filter(Boolean) : await handle(body);
    if (out === null || (Array.isArray(out) && out.length === 0)) return new Response(null, { status: 202, headers: CORS });
    return new Response(JSON.stringify(out), { headers: { 'content-type': 'application/json', ...CORS } });
  },
};
