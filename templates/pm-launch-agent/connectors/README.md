# Connectors — PM Launch Agent

This agent works without any connectors — it generates content from your feature description rather than pulling data from external systems. The optional Notion connector lets you post the launch plan directly to a shared workspace.

## Optional: Notion

If you want the agent to post the launch plan to Notion (so cross-functional partners can collaborate on it), set up the Notion connector.

```bash
cd templates/pm-launch-agent/connectors
cp notion.example.json notion.json

# Get your integration token
# Create at: https://www.notion.so/my-integrations
export NOTION_INTEGRATION_TOKEN='secret_xxxxxxxxxxxx'

# Edit notion.json — update workspace_url and parent_page_id
```

Then run with `--post-to-notion true`:

```bash
bash orchestrate.sh \
  --feature-name "Smart Search" \
  --launch-date "2026-06-15" \
  --feature-summary "AI-powered semantic search across documents" \
  --launch-tier major \
  --post-to-notion true
```

## Without Notion

The agent works fully without any connectors configured. The launch plan is saved to `output/launch-[name]-plan.md` and you can copy it anywhere you want.

```bash
bash orchestrate.sh \
  --feature-name "Smart Search" \
  --launch-date "2026-06-15" \
  --feature-summary "AI-powered semantic search across documents" \
  --launch-tier major
```

## Future connectors

If your team uses dedicated tools for launch coordination, additional connectors would be useful additions:

- **Buffer or Hootsuite** — auto-schedule social posts from the channel drafts
- **Mailchimp or Customer.io** — auto-create the customer email campaign
- **Asana or Linear** — turn the launch checklist into actionable tasks
- **Slack** — post the internal launch announcement to a specific channel

PRs welcome for any of these. Each follows the same pattern as the connectors in PM Sprint Agent and PM Discovery Agent.
