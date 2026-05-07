# PM Stakeholder Communications Agent — Agent Template

> **An agent that generates the right stakeholder communication for the right audience. Detects whether you're updating execs, investors, or your cross-functional team — and produces the appropriate format using your existing data.**

This is the third agent template in the pm-claude-skills library. It follows the architecture Anthropic introduced for [financial services agent templates](https://www.anthropic.com/news/finance-agents) on May 5, 2026.

---

## What it does

You give the agent an audience (or let it detect one) and the period to cover. It does the rest:

1. **Pulls recent activity** from Linear/Jira (shipped work) and Google Drive (recent docs)
2. **Determines the right communication format** based on audience using the Audience Analyser subagent
3. **Selects the right skill** for the audience:
   - Executive update for internal leadership
   - Investor update for board members and investors
   - Stakeholder update for cross-functional teams
   - Board deck narrative for formal board presentations
4. **Drafts the communication** using the selected skill and pulled data
5. **Adds an appropriate ask or call-to-action** for the audience
6. **Saves the draft** for review

End-to-end: roughly 45-60 seconds. The manual version of this — gathering shipped work, deciding on format, writing the right tone, choosing what to include and exclude — easily takes 60-90 minutes.

---

## Why this matters

PMs write the same kinds of stakeholder updates over and over: monthly to leadership, quarterly to investors, weekly to cross-functional partners, ad-hoc to specific stakeholders. Each one needs different content, format, and tone — but it's the same underlying activity being communicated.

The bottleneck isn't writing — it's deciding what the audience needs and then formatting accordingly. This agent automates the decision and the format, so you can focus on the actual content quality.

---

## What's inside this template

```
templates/pm-stakeholder-comms-agent/
├── README.md                          ← you are here
├── AGENT.md                           ← agent definition
├── orchestrate.sh                     ← orchestration script
├── skills/                            ← skills used by this agent
│   ├── README.md
│   ├── executive-update/SKILL.md      ← (symlink)
│   ├── investor-update/SKILL.md       ← (symlink)
│   ├── stakeholder-update/SKILL.md    ← (symlink)
│   └── board-deck-narrative/SKILL.md  ← (symlink)
├── subagents/
│   ├── audience-analyser.md           ← determine the right format/tone
│   └── highlight-selector.md          ← choose what to include from activity
├── connectors/
│   ├── README.md
│   ├── linear.example.json
│   ├── jira.example.json
│   └── google-drive.example.json
├── examples/
│   ├── input-example.md
│   └── output-example.md
└── tests/
    └── smoke-test.md
```

---

## Quick install (5 minutes)

### Prerequisites

- Claude Code installed
- The full skills library installed: `/plugin marketplace add mohitagw15856/pm-claude-skills`
- Linear OR Jira (your team's ticketing system)
- Google Drive (for pulling recent docs — optional but recommended)

### Setup

The agent reads from two sources:
1. **Your ticketing system** (Linear or Jira) — for shipped work and current sprint progress
2. **Google Drive** (optional) — for recent docs that might be worth referencing

```bash
cd templates/pm-stakeholder-comms-agent/connectors

# Set up at least one ticketing connector
cp linear.example.json linear.json
# OR
cp jira.example.json jira.json

# Optional: set up Google Drive
cp google-drive.example.json google-drive.json
```

Detailed setup in `connectors/README.md`.

---

## Running the agent

### Basic usage

```bash
bash orchestrate.sh \
  --audience executive \
  --period "April 2026" \
  --your-name "Mohit Aggarwal"
```

The agent will:
1. Pull all work shipped in April 2026 from Linear/Jira
2. Pull recent docs and decisions from Google Drive
3. Determine the right format for an executive audience
4. Use the `executive-update` skill to draft the update
5. Add an executive-appropriate ask
6. Save to `output/exec-update-april-2026.md`

### Configuration options

| Flag | Required | Default | Description |
|---|---|---|---|
| `--audience` | Yes | — | `executive`, `investor`, `stakeholder`, `board` |
| `--period` | Yes | — | Time period to cover (e.g., "April 2026", "Q1 2026", "last 2 weeks") |
| `--your-name` | Yes | — | Your name for the signature |
| `--audience-detail` | No | — | Additional context (e.g., "CEO and CFO" or "Series B investors") |
| `--include-pre-draft-summary` | No | true | Include a high-level summary at the top |
| `--tone` | No | auto | `formal`, `direct`, `casual`, or `auto` (lets agent decide based on audience) |
| `--dry-run` | No | false | Validate config without running |

### Example invocations

**Monthly executive update:**
```bash
bash orchestrate.sh --audience executive --period "April 2026" --your-name "Mohit Aggarwal"
```

**Quarterly investor update:**
```bash
bash orchestrate.sh --audience investor --period "Q1 2026" --your-name "Mohit Aggarwal" --audience-detail "Series B investors"
```

**Weekly cross-functional update:**
```bash
bash orchestrate.sh --audience stakeholder --period "last 2 weeks" --your-name "Mohit Aggarwal" --audience-detail "Engineering, Design, Marketing leads"
```

**Board pre-read narrative:**
```bash
bash orchestrate.sh --audience board --period "Q1 2026" --your-name "Mohit Aggarwal" --tone formal
```

---

## Why this architecture

**Skills** provide the four output formats. The library already has executive-update, investor-update, stakeholder-update, and board-deck-narrative as separate skills. They're optimised for their specific audiences.

**Connectors** pull from Linear/Jira (work activity) and Google Drive (docs). The agent doesn't ask you to compile what you shipped — it pulls it.

**Subagents** handle the routing decisions:
- The Audience Analyser determines which format fits and what tone is appropriate
- The Highlight Selector chooses which activity is worth including based on audience priorities

This separation matters because the same shipped work needs to be communicated differently to different audiences. An exec wants outcomes and decisions needed. An investor wants metrics and runway. A cross-functional team wants what they need to know to do their job.

---

## Customisation

### Use your team's tone and conventions

Default skills produce well-structured updates in a neutral tone. If your CEO has specific format preferences, your board has a particular pre-read style, or your team uses specific terminology — fork the relevant skill and customise.

### Add more communication types

Add subagents and skill calls for additional communication types your team needs — customer-facing release notes, all-hands talking points, sales enablement updates. The pattern is the same.

### Pull from additional sources

If your team's activity also lives in tools like Notion (decisions log), Slack (decisions and discussions), or Confluence (specs) — add connectors for those and update the orchestration to include them.

---

## Limitations and honest caveats

**The agent generates a draft, not a finished communication.** Read it. Edit it. Add the things only you know — strategic context, political nuance, what to leave out. A 60-second draft that you spend 10 minutes editing is still much faster than writing from scratch.

**Tone matching is heuristic.** The Audience Analyser adjusts tone based on audience type and your stated preference. It can't perfectly match your CEO's specific writing style. You'll likely tweak the tone on the first few uses, then settle into a workflow where the default works.

**The "ask" or call-to-action requires your judgment.** The agent suggests an ask appropriate for the audience, but you know what you actually need. Override the suggestion when needed.

**Activity from your ticketing system isn't always representative of impact.** Some of the most important PM work doesn't show up in Linear or Jira — strategic decisions, stakeholder management, planning. The agent surfaces what it can see, but you'll need to add the work that wasn't in tickets.

---

## Where to learn more

- [Anthropic's announcement of agent templates](https://www.anthropic.com/news/finance-agents)
- [PM Sprint Agent template](../pm-sprint-agent/)
- [PM Discovery Agent template](../pm-discovery-agent/)
- [Part 18 article — Building the PM Stakeholder Comms Agent](#) *(link added when published)*

---

*Built and maintained by [Mohit Aggarwal](https://medium.com/@mohit15856) | Third agent template in [pm-claude-skills](https://github.com/mohitagw15856/pm-claude-skills)*
