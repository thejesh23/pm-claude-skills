# Connectors — PM Stakeholder Communications Agent

This agent reads from your team's tracking systems to compile stakeholder communications. Set up at least one ticketing connector (Linear or Jira). Google Drive is optional but recommended.

## Required: Linear OR Jira

The agent needs to know what you've shipped. Set up whichever ticketing system you use.

### Linear setup (5 min)

```bash
cd templates/pm-stakeholder-comms-agent/connectors
cp linear.example.json linear.json

# Get your API key
# Generate at: https://linear.app/settings/account/security
export LINEAR_API_KEY='lin_api_xxxxxxxxxxxx'

# Edit linear.json — update workspace_url and team_id
```

### Jira setup (5 min)

```bash
cd templates/pm-stakeholder-comms-agent/connectors
cp jira.example.json jira.json

# Get your API token
# Generate at: https://id.atlassian.com/manage-profile/security/api-tokens
export JIRA_EMAIL='you@company.com'
export JIRA_API_TOKEN='ATATT3xFfGF0...'

# Edit jira.json — update instance_url and project_key
```

## Optional but recommended: Google Drive

Adding Google Drive lets the agent reference recent docs and documented decisions in stakeholder updates. Without it, the agent only has access to ticketing system activity.

```bash
cd templates/pm-stakeholder-comms-agent/connectors
cp google-drive.example.json google-drive.json

# Set up service account (see pm-discovery-agent/connectors/README.md for detailed steps)
export GOOGLE_APPLICATION_CREDENTIALS='/path/to/service-account.json'

# Edit google-drive.json — update folder_id
```

## Tagging strategy: keep some work out of external comms

Both Linear and Jira connectors have an `exclude_label` field defaulting to `internal-only`. Apply this label to any tickets you don't want surfacing in stakeholder updates:

- Sensitive personnel work
- Strategic decisions not yet ready to communicate
- Internal cleanup and tech debt without external impact
- Customer-specific work where the customer hasn't approved attribution

Tagged items still show in your team's tooling but won't appear in agent-generated communications.

## Security notes

- Credentials live in environment variables, never in the JSON files
- Use read-only credentials where possible — the agent only needs to read activity
- Both ticketing system tokens and Google service account keys can be regenerated; rotate every 90 days
