# 🦞 OpenClaw — native skills + the ClawHub pack

OpenClaw reads the same `SKILL.md` standard as Claude Code, so every skill here loads as-is (a skill with no `metadata.openclaw` block is always eligible). Three ways in, plus the publishing runbook.

## Install (pick one)

```bash
# 1. Our installer — copies skill folders into ~/.openclaw/skills
npx pm-claude-skills add --agent openclaw

# 2. OpenClaw's own installer, straight from this repo
openclaw skills install git:mohitagw15856/pm-claude-skills

# 3. One-liner install script
bash <(curl -fsSL https://raw.githubusercontent.com/mohitagw15856/pm-claude-skills/main/scripts/openclaw-install.sh)
```

## The dressed export

[`exports/openclaw/`](../exports/openclaw/) carries all 496 skills as flat `<skill>/SKILL.md` folders with OpenClaw-native dressing on top of the canonical body: a top-level `homepage` (shown in the macOS Skills UI) and a `metadata.openclaw` block with a per-bundle emoji. Regenerated from `skills/` on every release — never hand-edited. Helper scripts stay in the source repo; per the [authoring standard](../SKILL-AUTHORING-STANDARD.md), every skill is useful with `SKILL.md` alone.

## Publishing to ClawHub (owner runbook, ~15 min)

ClawHub auth rides a GitHub account, so this is an owner action:

```bash
npm i -g clawhub          # the registry CLI (separate from openclaw itself)
clawhub login             # authenticates via GitHub

# Start curated, not firehose: the skills suited to an always-on personal agent.
cd exports/openclaw
clawhub skill publish ./chief-of-staff  --slug chief-of-staff  --version 49.0.0 --dry-run
# …review the plan, drop --dry-run, repeat for the starter set below.

# Or wholesale (it scans skill folders and publishes new/changed ones):
clawhub sync --dry-run    # review first — 496 uploads is a statement
clawhub sync --all
```

**Suggested starter set** (personal always-on agent fit): `chief-of-staff`, `email-triage`, `morning-intelligence`, `meeting-notes`, `brag-doc`, `stakeholder-update`, `executive-summary`, `competitor-signal-tracker`, `apology-letter`, `budget-builder`, plus the `pm-lifeadmin` and `pm-personal` bundles. Publish the rest once the starter set proves discovery works.

**House rule:** publish only from `exports/openclaw/` (the generated, dressed copies), and re-`sync` after each release so ClawHub never serves a stale body.

## Lint before you trust (and before you publish)

ClawHub is open by design — which is why hidden-instruction skills have shown up there. The same validator that gates this library's CI works on any OpenClaw skill, including everything you've installed from others:

```bash
npx skillspec-check ~/.openclaw/skills   # security scan + conformance grade
```

The OpenClaw dialect (`homepage`, `user-invocable`, `metadata.openclaw`) validates cleanly — see the [SkillSpec repo](https://github.com/mohitagw15856/skillspec) and RFC-0003.
