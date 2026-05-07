# Smoke Test — PM Launch Agent

The Launch Agent is the simplest of the four templates to test because it doesn't require any connectors by default.

## Step 1: Run the dry-run

```bash
cd templates/pm-launch-agent

bash orchestrate.sh \
  --feature-name "Test Feature" \
  --launch-date "2026-12-01" \
  --feature-summary "A test feature for verifying the launch agent setup" \
  --dry-run
```

**Expected output:** Configuration banner with feature name, launch date, days-to-launch calculation, channel list for the launch tier, and "✓ Dry-run complete."

## Step 2: Run dry-run for each launch tier

```bash
# Minor tier (in-product + internal only)
bash orchestrate.sh \
  --feature-name "Minor Test" \
  --launch-date "2026-12-01" \
  --feature-summary "Minor launch test" \
  --launch-tier minor \
  --dry-run

# Major tier (full content + media pitch)
bash orchestrate.sh \
  --feature-name "Major Test" \
  --launch-date "2026-12-01" \
  --feature-summary "Major launch test" \
  --launch-tier major \
  --dry-run

# Flagship tier (maximum coverage)
bash orchestrate.sh \
  --feature-name "Flagship Test" \
  --launch-date "2026-12-01" \
  --feature-summary "Flagship launch test" \
  --launch-tier flagship \
  --dry-run
```

For each, verify the channel list expands appropriately:
- minor: `in-product, internal`
- major: `email, in-product, linkedin, x, blog, sales-enablement, internal`
- flagship: adds `media-pitch, customer-webinar, partner-comms`

## Step 3: Test invalid inputs are caught

```bash
# Missing feature name should fail
bash orchestrate.sh --launch-date "2026-12-01" --feature-summary "x" 2>&1 | grep -q "feature-name is required" && echo "✓ Validates feature-name"

# Invalid launch tier should fail
bash orchestrate.sh \
  --feature-name "Test" \
  --launch-date "2026-12-01" \
  --feature-summary "x" \
  --launch-tier "invalid" 2>&1 | grep -q "must be 'minor', 'major', or 'flagship'" && echo "✓ Validates launch-tier"
```

## Step 4: Test Notion connector (optional)

If you've set up the Notion connector:

```bash
bash orchestrate.sh \
  --feature-name "Notion Test" \
  --launch-date "2026-12-01" \
  --feature-summary "Test posting to Notion" \
  --post-to-notion true \
  --dry-run
```

Should validate Notion config without errors.

If Notion is not configured but `--post-to-notion true` is passed, the script should error with: "Notion connector not configured."

## Step 5: Run a real launch plan generation

```bash
bash orchestrate.sh \
  --feature-name "Smart Search" \
  --launch-date "2026-06-15" \
  --feature-summary "AI-powered semantic search across documents and conversations" \
  --target-audience "knowledge workers at mid-market companies" \
  --launch-tier major
```

**Expected:** Eight steps complete with ✓ indicators. Output file at `output/launch-smart-search-plan.md`.

## Common issues

| Issue | Fix |
|---|---|
| "Days-to-launch is negative" | Launch date is in the past — use a future date |
| "Launch tier must be minor, major, or flagship" | Typo in `--launch-tier` value |
| Output file has spaces in name | Feature name had spaces — they're auto-converted to dashes, no action needed |
| Notion connector required but missing | Either set up Notion connector or remove `--post-to-notion true` |

## Reporting issues

If something fails that the table doesn't cover, [open an issue](https://github.com/mohitagw15856/pm-claude-skills/issues).
