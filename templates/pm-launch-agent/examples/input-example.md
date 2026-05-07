# Example: Input to the PM Launch Agent

## Common invocations by launch tier

### Minor feature launch (in-product only)

```bash
bash orchestrate.sh \
  --feature-name "Keyboard Shortcuts" \
  --launch-date "2026-05-20" \
  --feature-summary "Power-user keyboard shortcuts for the most common actions in the app" \
  --target-audience "active power users" \
  --launch-tier minor
```

### Major feature launch (full content + media)

```bash
bash orchestrate.sh \
  --feature-name "Smart Search" \
  --launch-date "2026-06-15" \
  --feature-summary "AI-powered semantic search across documents and conversations. Finds what you mean, not just what you typed." \
  --target-audience "knowledge workers at mid-market companies" \
  --launch-tier major
```

### Flagship launch (maximum coverage)

```bash
bash orchestrate.sh \
  --feature-name "Workspace 2.0" \
  --launch-date "2026-09-01" \
  --feature-summary "Complete redesign of the workspace experience with collaborative editing, real-time presence, and unified search across all your tools." \
  --target-audience "all customers and prospects" \
  --launch-tier flagship \
  --post-to-notion true
```

## What goes into a great feature summary

The agent's output quality depends heavily on this input. Vague summaries produce vague content.

**Weak summary:** "New search feature that's better"

**Strong summary:** "AI-powered semantic search that understands intent, not just keywords. Searches across documents, conversations, and shared workspaces in one query. Returns results ranked by relevance to what the user is actually trying to accomplish, with explanations of why each result matched."

The strong version gives the agent enough material to:
- Generate distinctive positioning (semantic search, intent over keywords)
- Identify proof points (cross-source search, ranked by intent)
- Suggest use cases (research workflows, troubleshooting)
- Differentiate from alternatives

## Launch tier decision guide

| If your launch is... | Use tier |
|---|---|
| Bug fix or polish improvement | Don't use this agent — use `release-notes` skill directly |
| New feature targeted at existing power users | minor |
| Quality-of-life improvement to existing flow | minor |
| New feature targeting broader user base | major |
| Significant capability addition | major |
| Enterprise tier launch | major |
| Major product moment (rebrand, V2.0, new product) | flagship |
| Press-worthy announcement | flagship |
| Public company milestone | flagship |

When in doubt, start with major. You can always reduce coverage. Going from minor to major after the fact is harder.

## What you should know before running

- **Launch dates 1+ weeks in the future work best.** The agent generates a full pre-launch plan. If launch is in 2 days, much of the plan won't be useful.
- **Have a clear feature summary.** Write it before running. 2-3 sentences minimum, ideally a paragraph.
- **Know your target audience.** "All customers" works but produces generic content. "SMB founders evaluating workflow tools" is sharper.
- **Be honest about tier.** Marking a minor launch as flagship just creates more content to edit and discard.
