# Smoke Test — PM Discovery Agent

Verify your installation is working before running a real discovery synthesis.

## Step 1: Verify connector setup

```bash
cd templates/pm-discovery-agent

# Check which connector you've set up
ls connectors/notion.json connectors/google-drive.json 2>/dev/null

# At least one should exist
```

## Step 2: Verify credentials

For Notion:
```bash
echo "NOTION_INTEGRATION_TOKEN length: ${#NOTION_INTEGRATION_TOKEN}"
# Should print a non-zero number (typically 50+ characters)
```

For Google Drive:
```bash
echo "GOOGLE_APPLICATION_CREDENTIALS: $GOOGLE_APPLICATION_CREDENTIALS"
# Should print the path to your service account JSON
ls -la $GOOGLE_APPLICATION_CREDENTIALS
# Should show the file exists and you can read it
```

## Step 3: Run the dry-run

```bash
bash orchestrate.sh \
  --research-question "Smoke test of agent setup" \
  --interview-source notion \
  --dry-run
```

(Or `--interview-source google-drive` if that's what you set up.)

**Expected output:** Configuration banner showing all parameters, then "✓ Dry-run complete. Configuration is valid."

## Step 4: Run a real synthesis against test interviews

If you have access to a test database/folder with at least 5 interviews:

```bash
bash orchestrate.sh \
  --research-question "Test discovery synthesis" \
  --interview-source notion \
  --interview-count 5
```

**Expected output:** Seven steps complete with ✓ indicators. Output file created at `output/discovery-[date].md`.

## What to do if a step fails

| Failure | Likely cause | Fix |
|---|---|---|
| "No connector configured" | Missing `connectors/notion.json` or `connectors/google-drive.json` | Copy the `.example.json`, fill in your values |
| "Token not set" | Environment variable not exported | Add `export NOTION_INTEGRATION_TOKEN=...` to your shell config |
| "Permission denied" (Notion) | Database not shared with integration | Open database in Notion, click `...`, "Add connections", select your integration |
| "File not found" (Drive) | Folder not shared with service account | Share the folder with the service account email (Viewer access) |
| "Skills not found" | Main library not installed | Run `/plugin marketplace add mohitagw15856/pm-claude-skills` |
| "No interviews returned" | Filters too restrictive or wrong database | Check the `database_id` or `folder_id` matches what you intended |

## Reporting issues

If the smoke test fails and you can't resolve it, [open an issue](https://github.com/mohitagw15856/pm-claude-skills/issues) with:

- The exact command you ran
- The full error output
- Which connector you're using
- Your operating system

Don't include credentials or tokens in the issue.
