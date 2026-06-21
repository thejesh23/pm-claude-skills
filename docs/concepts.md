# 🎓 Skills, MCP, Subagents, Prompts & Hooks — what's the difference, and when do you use each?

People install a skill, then ask: *"wait, how is this different from an MCP server? Or a subagent? Or just a good prompt?"* Short answer: **they solve different problems and compose together.** This page is the mental model.

> **One-line version:** A **prompt** is what you say once. A **skill** is reusable *know-how* the model loads when relevant. An **MCP server** gives the model *new actions and live data*. A **subagent** is a *separate worker* with its own context. A **hook** is *automation* that fires on an event. A skill needs **no API, no server, no code** — it's just a structured instruction file.

## The 60-second comparison

| | What it is | Gives the model… | Lives where | Needs code/server? | Best for |
|---|---|---|---|---|---|
| **Prompt / system prompt** | Text you send | Instructions for *this* turn | The message | No | One-off asks; global persona |
| **Skill** (`SKILL.md`) | A structured instruction file the model loads on demand | Reusable *expertise* — how a pro produces a specific artifact | A file in `skills/` (or `.claude/skills/`) | **No** | Repeatable, structured deliverables (PRDs, postmortems, rubrics) |
| **MCP server** | A running service speaking the Model Context Protocol | New **tools & live data** (read a DB, send email, query GitHub) | A process (local or remote) | **Yes** | *Acting* on real systems and data |
| **Subagent** | A separate agent with its own context window & tools | Parallelism + isolation — delegate a sub-task | An agent definition (`agents/`) | No | Big tasks; keeping the main thread clean |
| **Hook** | A script that runs on an agent event | **Automation** — run X before/after a tool, on prompt submit, etc. | Settings + a script | A script | Guardrails, auto-formatting, auto-loading context |

## How to choose (decision guide)

- **"I want consistent, professional output for a recurring task."** → **Skill.** (e.g. every incident gets a proper postmortem.)
- **"I want the model to read/write a real system — my DB, GitHub, Slack, files."** → **MCP server.** (Pair it with a skill so the *structure* comes from the skill and the *data* from the server — see [connectors](../connectors/README.md).)
- **"I just need this one thing, once."** → **Prompt.** (If you find yourself pasting the same prompt repeatedly, promote it to a **skill**.)
- **"This task is huge / I want it done in the background without polluting my main context."** → **Subagent.**
- **"I want something to happen automatically every time (lint on save, block a dangerous command, load project context)."** → **Hook.**

They stack: a **hook** can auto-load a **skill**, which structures work that an **MCP server** grounds in live data, optionally delegated to a **subagent**.

## Why skills are so cheap: progressive disclosure

A skill is loaded in two stages, which is why you can have *hundreds* installed without blowing up the context:

1. **Always in context (tiny):** just each skill's `name` + `description` — roughly ~100 tokens each. This is how the model *decides* which skill is relevant. (It's also why the **description is the most important line** in a `SKILL.md` — see [`writing-great-skills`](../skills/writing-great-skills/SKILL.md).)
2. **Loaded on demand (only when triggered):** the full `SKILL.md` body — usually a few thousand tokens — enters context *only* when the model picks that skill for the task.

So 199 skills cost almost nothing until one is actually used. That's the whole trick: **broad capability, narrow cost.**

## Where each one shines (and where it doesn't)

- **Skills** are portable (Claude Code, Claude.ai, the API, Cursor, Gemini via exports) and need no infrastructure — but they can't *act* on the world by themselves. Pair with MCP for that.
- **MCP** is powerful but heavier: a server to run, auth to configure, trust to manage. Don't reach for it when a skill alone does the job.
- **Subagents** add isolation and parallelism but also coordination overhead — use them for genuinely large or separable work.
- **Hooks** are great guardrails but run on *your* machine with *your* permissions — keep them simple and auditable.

## See it in practice

- Run any of the 199 skills free in the [**Playground**](https://mohitagw15856.github.io/pm-claude-skills/).
- Ground a skill in **live data** via [**MCP connectors**](../connectors/README.md) (filesystem, GitHub) or [**Composio**](../connectors/composio.md) (500+ SaaS apps).
- Chain skills into a [**workflow**](../WORKFLOWS.md) (the closest thing to a lightweight orchestrator).
- Author your own with the [**`writing-great-skills`**](../skills/writing-great-skills/SKILL.md) skill.
