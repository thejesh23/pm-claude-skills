# Anthropic plugin directory — submission / verification package

Everything needed to **(a) refresh the stale directory listing** (it still shows ~205 skills;
we're at 270) and **(b) request the "Anthropic Verified" tier**, via the official form:

**Form:** https://platform.claude.com/plugins/submissions (or https://clau.de/plugin-directory-submission)

> The directory is curated *only* from this form — Anthropic's bot/internal process adds and
> version-bumps entries; community pull requests to `anthropics/claude-plugins-official` are not
> merged. So the form is the path for both updating the listing and verified review.

---

## Listing fields (paste these)

- **Plugin / marketplace name:** `pm-claude-skills`
- **Marketplace (install) source:** `mohitagw15856/pm-claude-skills` — add in Claude Code with `/plugin marketplace add mohitagw15856/pm-claude-skills`
- **Repository:** https://github.com/mohitagw15856/pm-claude-skills
- **Homepage:** https://mohitagw15856.github.io/pm-claude-skills/
- **Author:** Mohit Aggarwal · mohit15856@gmail.com
- **License:** MIT
- **Category:** Productivity

**Short description (≤ ~200 chars):**
> 270 professional Agent Skills across 38 bundles — PRDs, launches, postmortems, compliance, growth, copywriting, careers & CVs. For Claude, ChatGPT, Gemini, Cursor & Codex. Try free in-browser.

**Long description:**
> PM stands for *Professional*, not just Product Management. 270 open-source `SKILL.md` skills + 4 agent
> templates across 38 bundles covering 23 professions — engineering, customer success, legal, finance,
> HR, sales, design/Figma, marketing/growth, copywriting, compliance, careers, job-search, and more.
> Each skill encodes the structure a senior pro uses and cites its framework. Eval-scored (196 skills,
> avg 4.8/5) with a public leaderboard, a regression gate, multi-tool exports, an MCP server, and a
> free browser playground.

---

## Why it meets the verified (security + quality) bar

**Quality**
- 270 skills, all passing **SkillCheck `--strict`** (0 errors, 0 warnings) in CI on every change.
- **Eval-scored:** 196 skills scored by an LLM judge, avg 4.8/5 — public [leaderboard](https://mohitagw15856.github.io/pm-claude-skills/leaderboard.html) + open [benchmark](https://mohitagw15856.github.io/pm-claude-skills/benchmark.html).
- A **regression gate** ([skill-pr-check](.github/workflows/skill-pr-check.yml)) blocks any change that lowers a skill's score.
- Skills cite their source frameworks (RICE, JTBD, Pyramid Principle, SOC 2 TSC, Good Strategy/Bad Strategy, …).

**Security / safety** (see [SECURITY.md](../SECURITY.md))
- 100% open-source, MIT. **No opaque binaries, no closed-source components, no auto-updating remote code.**
- Skills are plain markdown; the only code is **pure-stdlib Python helper scripts** (no third-party deps, no network), run only when explicitly invoked.
- **No telemetry of content** — inputs/outputs/keys are never collected. The optional hosted MCP and playground are open-source and send a prompt only to the provider *the user* chooses, with *their own* key.
- CI runs a **[security audit](.github/workflows/skill-audit.yml)**; the **[`skill-security-auditor`](../skills/skill-security-auditor/)** skill scans any `SKILL.md` for injection / exfiltration / privilege-escalation patterns.

**Maturity / reach**
- Published on **npm** (`pm-claude-skills`), **PyPI** (`pm-skills`), and the **MCP registry**; on **Smithery**.
- Exports for 11 tools (ChatGPT, Gemini, Cursor, Windsurf, Aider, Cline, Continue, Zed, Roo, Kilo Code, Obsidian).
- Already **listed** in the Anthropic plugin directory (at an older 205-skill snapshot — this submission refreshes it to 270 and requests verified review).

---

## Maintenance note

Keep this file's counts in sync with the latest release when re-submitting. Current as of **v29.6.0 — 270 skills, 38 bundles**.
