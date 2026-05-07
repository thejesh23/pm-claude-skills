# Example: Input to the PM Stakeholder Communications Agent

## Common invocations by audience

### Monthly executive update

```bash
bash orchestrate.sh \
  --audience executive \
  --period "April 2026" \
  --your-name "Mohit Aggarwal"
```

### Monthly investor update (most common pattern)

```bash
bash orchestrate.sh \
  --audience investor \
  --period "April 2026" \
  --your-name "Mohit Aggarwal" \
  --audience-detail "Series B investors, board observers"
```

### Weekly cross-functional stakeholder update

```bash
bash orchestrate.sh \
  --audience stakeholder \
  --period "last 2 weeks" \
  --your-name "Mohit Aggarwal" \
  --audience-detail "Engineering, Design, Marketing leads"
```

### Quarterly board pre-read

```bash
bash orchestrate.sh \
  --audience board \
  --period "Q1 2026" \
  --your-name "Mohit Aggarwal" \
  --tone formal
```

## What the agent reads from your connectors

### Linear or Jira (required)

- All issues completed in the period
- Current in-progress and ready issues for context
- Filtered to exclude items tagged `internal-only`

### Google Drive (optional)

- Recent docs modified in the period
- Excluded: anything with "DRAFT", "WIP", or "scratch" in the filename

## What you should know before running

- **Your activity should be in the system.** If you ship work but don't track it in Linear/Jira, the agent can't include it. Either start tracking, or be ready to add manually.
- **Use the `internal-only` label.** Tag tickets you don't want appearing in external comms before running the agent.
- **Period framing matters.** "April 2026" pulls work shipped in April. "Q1 2026" pulls work shipped Jan-March. "last 30 days" is rolling. Pick the framing that matches your communication cadence.
- **Audience detail dramatically improves output.** "executive" gets you a generic exec update. "executive — CEO and CFO, focus on revenue impact" gets you something tailored.

## Use this output as a starting draft, not a finished message

Every output from this agent is a draft. Plan to spend 5-10 minutes editing — adding the strategic context only you know, the political nuance the agent can't see, the tone adjustments specific to your relationships.

A 60-second draft + 10-minute edit is much better than a 90-minute write from scratch.
