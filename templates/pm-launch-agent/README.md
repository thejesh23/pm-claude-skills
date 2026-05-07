# PM Launch Agent — Agent Template

> **An end-to-end product launch coordination agent. Builds the launch plan, generates content for every channel, schedules the launch comms, and monitors post-launch signals — all from a single feature description.**

This is the fourth agent template in the pm-claude-skills library. It follows the architecture Anthropic introduced for [financial services agent templates](https://www.anthropic.com/news/finance-agents) on May 5, 2026.

---

## What it does

You give the agent a feature description and a launch date. It does the rest:

1. **Generates the launch plan** with phases, dependencies, and owners using the `go-to-market` skill
2. **Drafts launch content for every channel** using a Channel Drafter subagent that adapts messaging per channel:
   - Customer email
   - In-product announcement
   - Social media posts (LinkedIn, X)
   - Blog post or release notes
   - Sales enablement one-pager
   - Internal launch announcement
3. **Builds the content calendar** using the `content-calendar` skill
4. **Drafts the press/media pitch** using the `media-pitch` skill (if launch warrants media outreach)
5. **Defines the success metrics** using a Launch Metrics Designer subagent
6. **Compiles everything** into a launch plan document

End-to-end: roughly 2-3 minutes. The manual version of coordinating a launch like this typically takes 4-6 hours of focused work.

---

## Why this matters

Launches fail not because the work isn't done, but because the work is fragmented across people and tools. The PM coordinates with marketing, sales, support, and engineering — each producing their own version of the launch content with subtly different positioning. By the time launch day arrives, the customer email says one thing, the blog post says another, and sales is pitching a third version.

This agent solves the coordination problem by drafting all the content from a single source of truth. Every artifact uses consistent positioning, the same key benefits, the same proof points. Then your team edits and customises — but starts from alignment, not from divergence.

---

## What's inside this template

```
templates/pm-launch-agent/
├── README.md                          ← you are here
├── AGENT.md                           ← agent definition
├── orchestrate.sh                     ← orchestration script
├── skills/                            ← skills used by this agent
│   ├── README.md
│   ├── go-to-market/SKILL.md          ← (symlink)
│   ├── content-calendar/SKILL.md      ← (symlink)
│   ├── media-pitch/SKILL.md           ← (symlink)
│   ├── email-campaign/SKILL.md        ← (symlink)
│   └── launch-checklist/SKILL.md      ← (symlink)
├── subagents/
│   ├── channel-drafter.md             ← per-channel content generation
│   └── launch-metrics-designer.md     ← success metrics design
├── connectors/
│   ├── README.md
│   └── notion.example.json            ← Notion (for posting the plan)
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
- Optional: Notion (for posting the launch plan to a shared workspace)

### Setup

This agent works without any connectors — it generates content based on the feature description you provide. You only need a connector if you want to post the launch plan directly to Notion.

```bash
cd templates/pm-launch-agent
bash orchestrate.sh \
  --feature-name "Smart Search" \
  --launch-date "2026-06-15" \
  --feature-summary "AI-powered semantic search across documents and conversations" \
  --dry-run
```

If the dry-run completes, you're set up.

---

## Running the agent

### Standard usage

```bash
bash orchestrate.sh \
  --feature-name "Smart Search" \
  --launch-date "2026-06-15" \
  --feature-summary "AI-powered semantic search across documents and conversations" \
  --target-audience "knowledge workers at mid-market companies" \
  --launch-tier major
```

The agent will:
1. Generate the launch plan using `go-to-market` skill
2. Draft customer email using `email-campaign` skill (via Channel Drafter)
3. Draft in-product announcement (via Channel Drafter)
4. Draft social media posts for LinkedIn and X (via Channel Drafter)
5. Draft blog post (via Channel Drafter)
6. Draft sales enablement one-pager (via Channel Drafter)
7. Draft internal launch announcement (via Channel Drafter)
8. Build content calendar using `content-calendar` skill
9. Draft media pitch using `media-pitch` skill (only for major launches)
10. Define success metrics (via Launch Metrics Designer)
11. Compile launch checklist using `launch-checklist` skill
12. Output everything to `output/launch-[feature-name]-plan.md`

### Configuration options

| Flag | Required | Default | Description |
|---|---|---|---|
| `--feature-name` | Yes | — | Name of the feature being launched |
| `--launch-date` | Yes | — | Target launch date (YYYY-MM-DD format) |
| `--feature-summary` | Yes | — | One-paragraph description of what the feature does |
| `--target-audience` | No | "all customers" | Who the launch is targeting |
| `--launch-tier` | No | minor | `minor`, `major`, or `flagship` (controls breadth and intensity) |
| `--include-media-pitch` | No | auto | Include media pitch (auto = yes for major/flagship) |
| `--post-to-notion` | No | false | Post the launch plan to configured Notion workspace |
| `--dry-run` | No | false | Validate config without running |

### Launch tiers explained

- **Minor** — small feature releases, in-product announcements only, no media
- **Major** — significant feature launches, full content calendar, media pitch included
- **Flagship** — major product moments (rebrand, big feature, version release), maximum coverage

The tier affects both the breadth of content generated and the depth of each piece.

---

## Why this architecture

**Skills** provide format-specific output structures — content calendar formats, email campaign templates, media pitch frameworks. The library already has all the relevant skills.

**Subagents** handle the cross-cutting decisions:
- The Channel Drafter adapts the same launch message into different formats while keeping positioning consistent
- The Launch Metrics Designer figures out what success looks like for this specific launch

**Connectors** are minimal here — only Notion if you want to post the plan to a shared workspace. Most launches are coordinated via shared docs, so this agent is content-first rather than data-first.

---

## Customisation

### Add channels you actually use

The default Channel Drafter outputs for: email, in-product, LinkedIn, X, blog, sales enablement, internal. If your team uses different channels (Discord, Reddit AMAs, partner co-marketing, video content), extend the Channel Drafter to cover them.

### Adjust positioning for your team's voice

The default outputs use neutral B2B SaaS positioning language. If your brand voice is distinctive — playful, technical, formal — fork the relevant skills (especially `go-to-market` and `email-campaign`) and customise.

### Connect to your launch tools

Add connectors for tools you actually use for launch coordination:
- Asana or Linear (for the launch checklist as actionable tasks)
- Buffer or Hootsuite (for scheduling social posts)
- Mailchimp or Customer.io (for scheduling the customer email)

The pattern is the same as other templates in this library.

---

## Limitations and honest caveats

**This agent generates first drafts, not finished launches.** Every piece of content needs review and editing. Marketing should review the customer-facing content. Sales should review the enablement one-pager. Your CEO might want to weigh in on the blog post. The agent removes the blank-page problem, not the editorial work.

**Positioning quality depends on your inputs.** A vague feature summary produces vague content. Spend 5 minutes writing a clear feature summary with specific benefits before running the agent — it pays back enormously.

**Launch metrics are starting points.** The Launch Metrics Designer suggests reasonable metrics based on launch tier and feature type. Validate against your actual analytics setup. Some suggested metrics may not be measurable in your stack.

**No actual scheduling.** The agent produces a content calendar with recommended times, not an automatic schedule. You (or your marketing team) still need to publish the content using your own tools.

---

## Where to learn more

- [Anthropic's announcement of agent templates](https://www.anthropic.com/news/finance-agents)
- [PM Sprint Agent](../pm-sprint-agent/) (first template)
- [PM Discovery Agent](../pm-discovery-agent/) (second template)
- [PM Stakeholder Comms Agent](../pm-stakeholder-comms-agent/) (third template)
- [Part 19 article — Building the PM Launch Agent](#) *(link added when published)*

---

*Built and maintained by [Mohit Aggarwal](https://medium.com/@mohit15856) | Fourth agent template in [pm-claude-skills](https://github.com/mohitagw15856/pm-claude-skills)*
