# Smoke Test — PM Stakeholder Communications Agent

## Step 1: Verify connector setup

```bash
cd templates/pm-stakeholder-comms-agent

# Check at least one ticketing connector is configured
ls connectors/linear.json connectors/jira.json 2>/dev/null

# Optional: check Google Drive connector
ls connectors/google-drive.json 2>/dev/null
```

## Step 2: Verify credentials

```bash
# Linear
echo "LINEAR_API_KEY: ${LINEAR_API_KEY:+set}"

# Jira
echo "JIRA_EMAIL: ${JIRA_EMAIL:+set}"
echo "JIRA_API_TOKEN: ${JIRA_API_TOKEN:+set}"

# Google Drive (optional)
echo "GOOGLE_APPLICATION_CREDENTIALS: ${GOOGLE_APPLICATION_CREDENTIALS:+set}"
```

## Step 3: Run dry-run for each audience type

```bash
bash orchestrate.sh \
  --audience executive \
  --period "last 30 days" \
  --your-name "Test User" \
  --dry-run

bash orchestrate.sh \
  --audience investor \
  --period "Q1 2026" \
  --your-name "Test User" \
  --dry-run

bash orchestrate.sh \
  --audience stakeholder \
  --period "last 2 weeks" \
  --your-name "Test User" \
  --dry-run

bash orchestrate.sh \
  --audience board \
  --period "Q1 2026" \
  --your-name "Test User" \
  --dry-run
```

Each should show the configuration banner, the correct skill name (executive-update / investor-update / stakeholder-update / board-deck-narrative), and "✓ Dry-run complete."

## Step 4: Run a real one if you have a test environment

```bash
bash orchestrate.sh \
  --audience executive \
  --period "last 30 days" \
  --your-name "Your Name"
```

Output should appear at `output/executive-update-[date].md`.

## Common issues

| Issue | Fix |
|---|---|
| "Audience must be executive, investor, stakeholder, or board" | Use one of those four exact values |
| "No ticketing connector configured" | Set up Linear or Jira (see connectors/README.md) |
| "API key not set" | Export the right environment variable |
| Empty output despite activity in your tools | Check the period filter — typo in the date format will return zero results |
| Items showing that should be private | Add the `internal-only` label in your ticketing system |
