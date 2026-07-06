# The Apprentice — your first employee, batteries included

A **ready-to-run [Claude Agent SDK](https://docs.claude.com/en/api/agent-sdk/overview) agent** that starts every task already knowing your company. It loads your professional brain (`brain/context.md`, recent decisions), discovers your installed pm-skills, treats each skill's **Quality Checks as its acceptance tests**, and files artifacts + predictions back into the workspace.

```bash
# 1. Set up the workspace (once) — brain, context, folders:
npx pm-claude-skills init && npx pm-claude-skills add --agent claude

# 2. Copy this template out and install:
cp -R templates/apprentice ~/my-apprentice && cd ~/my-apprentice && npm install

# 3. Put it to work (your ANTHROPIC_API_KEY, your costs):
export ANTHROPIC_API_KEY=sk-ant-…
node index.mjs "draft the Q3 stakeholder update from ./notes/q3.md — CFO audience"
```

What it does differently from a bare agent loop:

| Bare agent | The Apprentice |
|---|---|
| Starts from zero every task | Starts grounded in `brain/context.md` + your last 5 decisions |
| Invents document structure | Reads the matching SKILL.md first — the skill's structure is the structure |
| "Looks done" = done | The skill's **Quality Checks** are the acceptance test; **Anti-Patterns** are the reviewer |
| Output disappears into chat | Artifacts land in `./artifacts/`; facts and predictions land in `brain/` |

Runs on your key with `acceptEdits` permissions in the working directory. Read `index.mjs` — it's ~80 lines and meant to be forked.
