# PM Discovery Agent — Agent Template

> **An end-to-end customer discovery agent. Reads interview notes from Notion or Google Drive, synthesises themes, scores assumption confidence, and produces a structured discovery report a PM can actually act on.**

This is the second agent template in the pm-claude-skills library. Like the [PM Sprint Agent](../pm-sprint-agent/), it follows the architecture Anthropic introduced for [financial services agent templates](https://www.anthropic.com/news/finance-agents) on May 5, 2026 — packaging **skills + connectors + subagents** into a single runnable workflow.

---

## What it does

You point this agent at a folder of customer interview notes or transcripts. It does the rest:

1. **Pulls interview notes** from Notion (a database) or Google Drive (a folder)
2. **Synthesises themes** across all interviews using the Theme Synthesiser subagent
3. **Maps insights to job stories** using the `job-story-mapper` skill
4. **Scores assumption confidence** for each finding using the Assumption Scorer subagent
5. **Drafts the discovery report** using the `user-interview-synthesis` skill
6. **Identifies follow-up questions** for the next round of interviews
7. **Saves the report** as a structured markdown document

End-to-end: roughly 3-5 minutes for 8-12 interview transcripts. The manual version of this synthesis takes most PMs a full day — and the inconsistency is the bigger problem than the time.

---

## Why this matters

Customer discovery is the workflow PMs say they care about most and consistently underinvest in. The reasons are predictable: synthesis is hard, themes are easy to over-interpret, confirmation bias is real, and writing it up takes hours. So PMs do interviews, take notes, and never come back to them properly.

This agent doesn't replace the discovery work. It removes the synthesis bottleneck so the discovery work actually pays off.

---

## What's inside this template

```
templates/pm-discovery-agent/
├── README.md                          ← you are here
├── AGENT.md                           ← agent definition (system prompt + tool list)
├── orchestrate.sh                     ← orchestration script
├── skills/                            ← skills used by this agent
│   ├── README.md
│   ├── discovery-interview-guide/SKILL.md  ← (symlink)
│   ├── user-interview-synthesis/SKILL.md   ← (symlink)
│   ├── job-story-mapper/SKILL.md           ← (symlink)
│   └── assumption-mapper/SKILL.md          ← (symlink)
├── subagents/
│   ├── theme-synthesiser.md           ← cross-interview theme detection
│   └── assumption-scorer.md           ← confidence scoring for findings
├── connectors/
│   ├── README.md                      ← connector setup guide
│   ├── notion.example.json            ← Notion database connector
│   └── google-drive.example.json      ← Google Drive folder connector
├── examples/
│   ├── input-example.md               ← what you feed the agent
│   ├── output-example.md              ← what the agent produces
│   └── sample-interview.md            ← example interview note format
└── tests/
    └── smoke-test.md                  ← manual smoke test for new installations
```

---

## Quick install (5 minutes)

### Prerequisites

- Claude Code installed
- The full skills library installed: `/plugin marketplace add mohitagw15856/pm-claude-skills`
- Either a Notion workspace or Google Drive (most PMs have both)

### Setup

**Choose your input source.** PMs typically store interview notes in one of two places:

- **Notion** — if you keep interviews in a Notion database (most common for PMs at scaleups)
- **Google Drive** — if you keep interviews as Google Docs in a folder (most common for PMs at startups and large enterprises)

Set up the connector for whichever one you use. You don't need both.

### Notion setup (5 minutes)

```bash
cd templates/pm-discovery-agent/connectors
cp notion.example.json notion.json
# Edit notion.json with your database_id and page properties
```

Detailed setup steps in `connectors/README.md`.

### Google Drive setup (5 minutes)

```bash
cd templates/pm-discovery-agent/connectors
cp google-drive.example.json google-drive.json
# Edit with your folder_id and authentication details
```

### Test the smoke test

```bash
cd templates/pm-discovery-agent
bash orchestrate.sh --research-question "Test discovery synthesis" --dry-run
```

If the dry-run completes without errors, you're ready to run a real discovery synthesis.

---

## Running the agent

### Standard usage

```bash
bash orchestrate.sh \
  --research-question "Why are users abandoning the onboarding flow?" \
  --interview-source notion \
  --interview-count 10
```

The agent will:

1. Pull the latest 10 interview notes from your configured Notion database
2. Run the Theme Synthesiser subagent to identify patterns across interviews
3. Run the `job-story-mapper` skill to convert findings into structured job stories
4. Run the Assumption Scorer subagent to flag which findings are high vs low confidence
5. Run the `user-interview-synthesis` skill to draft the final report
6. Identify follow-up questions for the next round of interviews
7. Save the report to `output/discovery-[date].md`

### Configuration options

| Flag | Required | Default | Description |
|---|---|---|---|
| `--research-question` | Yes | — | The question your discovery is trying to answer |
| `--interview-source` | Yes | — | `notion` or `google-drive` |
| `--interview-count` | No | 8 | How many interviews to include in synthesis |
| `--filter-by-segment` | No | — | If your notes are tagged by segment, filter to one (e.g., "enterprise") |
| `--include-low-confidence` | No | true | Include low-confidence findings in the report (with explicit flagging) |
| `--dry-run` | No | false | Validate config without running the workflow |

---

## How interview notes should be structured

The agent works best when interview notes follow a consistent structure. There's no rigid format required, but the more your notes contain, the better the synthesis.

**Minimum requirements** (the agent will work with any notes that have these):
- Interviewee identifier (name, role, or anonymous ID)
- Date of interview
- Free-text notes or transcript

**Recommended additions** (for better synthesis):
- Segment or persona tags
- Key quotes pulled out
- Initial interpretations or hypotheses
- Follow-up questions noted

See `examples/sample-interview.md` for a template you can use to standardise your team's interview notes.

---

## Why this architecture

The template follows the same three-component pattern as PM Sprint Agent:

**Skills** provide the structured output formats. The `user-interview-synthesis` skill knows what a good discovery report contains. The `job-story-mapper` knows the JTBD format. The `assumption-mapper` knows how to structure assumptions. These already exist in this library — the agent doesn't reinvent them.

**Connectors** provide governed access to data. Notion and Google Drive are where PMs actually keep interview notes. Credentials live in environment variables, never in prompts.

**Subagents** handle specialised analysis. Theme synthesis across 10 interviews requires holding 10 documents in mind and finding patterns — that's a focused job for a subagent with a specific system prompt. Confidence scoring requires distinguishing "5 people said this" from "1 person said this dramatically" — also a focused job for a subagent.

---

## Customisation

### Adapt to your team's discovery process

The default agent uses the generic discovery skills from the main library. If your team has specific conventions — particular persona definitions, opportunity scoring frameworks, ICE prioritisation for follow-ups — fork the relevant skill into `skills/` and modify it. The orchestrate script will pick up the local version.

### Add additional analysis steps

If your discovery process includes things this template doesn't cover — competitive mention extraction, willingness-to-pay analysis, feature request triage — add subagents in `subagents/` for those analyses and update `orchestrate.sh` to call them.

### Switch interview sources

If you use a tool other than Notion or Google Drive — Dovetail, Granola, Otter, Reflect, Roam, Coda — you can build a connector following the pattern in `connectors/README.md`. PRs welcome for additional connectors.

---

## Limitations and honest caveats

**The synthesis is only as good as the notes.** If your interview notes are sparse, generic, or inconsistent in format, the synthesis will reflect that. Spending 15 minutes after each interview to write proper notes pays off enormously when you run the agent.

**Theme synthesis can over-cluster.** The Theme Synthesiser will find patterns even in small datasets. If you're running it on 3 interviews, treat the themes as hypotheses to validate, not conclusions. The agent flags this when interview count is low.

**Confidence scoring is heuristic, not statistical.** The Assumption Scorer uses simple rules — how many people mentioned it, how strongly, how recently. It's not running statistical analysis. Use the scores as a directional ranking, not a precise measurement.

**No autonomous execution.** This template runs as a Claude Code plugin — it produces outputs for human review, it doesn't autonomously create JIRA tickets or modify your discovery database. For autonomous execution, deploy via Claude Managed Agents using the same skills, connectors, and subagent definitions.

---

## Where to learn more

- [Anthropic's announcement of agent templates](https://www.anthropic.com/news/finance-agents) (May 2026)
- [The PM Sprint Agent template](../pm-sprint-agent/) (first template in this library)
- [The pm-claude-skills main README](../../README.md)
- [Part 17 article — Building the PM Discovery Agent](#) *(link added when published)*

---

*Built and maintained by [Mohit Aggarwal](https://medium.com/@mohit15856) | Second agent template in [pm-claude-skills](https://github.com/mohitagw15856/pm-claude-skills)*
