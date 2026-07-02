# Launch drafts — the v36→v41 story

*Hand-written (no API run). The story: in one week, a prompt library became a benchmark, a standard, a registry, an arena, and a staff. Pick the channel, tweak the voice, ship.*

---

## Show HN

**Title (≤80 chars):**
> Show HN: I turned my prompt library into a benchmark, a registry, and an AI staff

**Text:**

Six months ago this was a folder of SKILL.md files — structured instructions that teach AI assistants how senior professionals actually write PRDs, postmortems, board updates. It grew to 441 skills across 25 professions.

Last week I stopped adding skills and asked what the library *wants to be*. One week later:

- **SkillBench** — there's HumanEval for code and nothing for professional work, so we froze a 12-task benchmark (PRDs, postmortems, churn analyses…) that scores *models*, bare vs. skill-instructed, on a fixed rubric. The gap between the two runs ("skill lift") is the library's own value, measured.
- **A community registry** — publish `you/skill-name` via one PR while your skill stays in your repo; CI validates conformance + security patterns; served live over REST and MCP.
- **The Boardroom** — paste your PRD and five AI executives (a CFO who kills unpriced assumptions, a sceptical VC…) debate it in rounds, then a Chair issues a verdict memo. Verdicts export as hash-verifiable attestations.
- **The Firm** — the endgame: charter a standing AI staff who file delta-aware memos on your metrics/customers/market, hold a board session *without you*, and log falsifiable predictions you score later — so each staff member accumulates a real calibration record.

Everything runs client-side with your own key (Claude/GPT/Gemini/local), the whole thing is MIT, and the skills also work in Claude Code, Cursor, ChatGPT, etc.

Playground: https://mohitagw15856.github.io/pm-claude-skills/ · Repo: https://github.com/mohitagw15856/pm-claude-skills

Happy to answer anything about the benchmark methodology, the SKILL.md spec, or why the CFO persona is so mean.

---

## Product Hunt

**Name:** PM Skills
**Tagline (≤60):** 441 pro skills, a benchmark, and an AI staff for your work
**Description (≤260):**
> AI gives you filler; PM Skills gives you the structure senior pros use — 441 open-source skills across 25 professions. New: The Boardroom (5 AI execs debate your doc), The Firm (a standing AI staff with scoreable predictions), and SkillBench (the professional-work benchmark).

**First comment (maker):**
> Hey PH 👋 — solo maker here. This started as SKILL.md files teaching AI what a *good* PRD looks like. It's now: a playground that runs 441 skills with your own key (or free Gemini / fully local), interactive outputs (drag a RICE confidence slider, the ranking re-sorts), an arena where AI executives cross-examine your documents — and The Firm, where a chartered AI staff meets without you and sends minutes with dissent preserved. Everything MIT. Ask me anything, especially the hard ones.

---

## X/Twitter thread

1/ Last week my open-source prompt library stopped being a prompt library.
It became: a benchmark, a standard, a registry, an arena, and a staff.
Here's what shipped 🧵

2/ 🏛 The Boardroom — paste a PRD or pitch. Five AI executives debate it in rounds: severity-tagged openings, cross-examination, a Chair's verdict memo with "the changes that would survive the room."

3/ 🛡️ Then it examines *you*. The Defense cross-questions you about your own document, live, and scores your honesty about unknowns higher than confident bluffing. The Gauntlet does the same for your whole job interview — decode → stories → interview → salary negotiation vs a hidden band.

4/ 🏢 The Firm — the endgame. Charter a standing AI staff (CFO, CCO, CTO, Strategy). Each session they file delta-aware memos, meet WITHOUT you, and send minutes with dissent preserved. Every memo ends in a falsifiable prediction you score later. You can performance-review your AI staff.

5/ 🏛 SkillBench — HumanEval exists for code; nothing measured professional work. Frozen 12-task set, every model runs it bare vs. skill-instructed, fixed rubric judge. The delta is called skill lift — it's the library measuring its own value.

6/ Plus: an npm-style community registry for skills, a formal SKILL.md spec with conformance levels, tamper-evident verdict attestations, a training-data pipeline publishing to Hugging Face, and skills in 8 languages.

7/ 441 skills · 64 bundles · 25 professions · MIT · runs with your own key (or free, or fully local in-browser).
Playground: mohitagw15856.github.io/pm-claude-skills
Repo: github.com/mohitagw15856/pm-claude-skills

---

## LinkedIn

**The week my prompt library stopped being a prompt library.**

For months I maintained pm-claude-skills: 400+ open-source SKILL.md files that teach AI assistants the structure senior professionals actually use — PRDs, postmortems, board updates, churn analyses.

Then I asked a different question: what does codified professional judgment *unlock*?

One week of building later:

🏛 **The Boardroom** — five AI executives pressure-test your document in structured rounds before your real leadership team sees it.
🏢 **The Firm** — a chartered AI staff that files delta-aware memos, meets without you, and logs falsifiable predictions you score against reality. Trust becomes earned, per staff member, visibly.
📊 **SkillBench** — the first benchmark for AI on professional work: every model runs 12 realistic tasks bare vs. skill-instructed. The gap is measurable proof that structure beats prompting.
🌐 **A community registry** — publish your own skills, npm-style, validated by CI, served over MCP so *agents* can hire the library too.

All MIT-licensed. All running client-side with your own key.

The lesson I keep relearning: the value was never the prompts. It's the judgment encoded around them — quality bars, anti-patterns, verification steps. Models keep getting better; judgment about what "good" looks like is what compounds.

🔗 in the comments.
