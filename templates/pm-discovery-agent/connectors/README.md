# Connectors — PM Discovery Agent

This folder contains the connector configurations for the PM Discovery Agent. You only need to set up the connector for whichever tool your team uses for interview notes — Notion or Google Drive.

## Which connector should I use?

| If your interview notes live in... | Use this connector |
|---|---|
| A Notion database | `notion.json` |
| A Google Drive folder of Google Docs | `google-drive.json` |
| Both | Pick the one with more interviews — agents work better with more data |
| Somewhere else (Dovetail, Granola, Otter, etc.) | See "Building a connector for another system" below |

## Notion setup (5 minutes)

This is the fastest path if you keep interviews in Notion.

### 1. Create a Notion integration

- Go to https://www.notion.so/my-integrations
- Click "+ New integration"
- Name it "PM Discovery Agent"
- Leave defaults
- Click Submit
- Copy the "Internal Integration Token" (starts with `secret_`)

### 2. Set the environment variable

```bash
export NOTION_INTEGRATION_TOKEN='secret_xxxxxxxxxxxxxxxxxxxxxxxx'
```

To make permanent, add to `~/.zshrc` or `~/.bashrc`.

### 3. Share your interview database with the integration

- Open your interview notes database in Notion
- Click the `...` menu in the top right
- Select "Add connections"
- Choose "PM Discovery Agent"

The integration now has access to that database.

### 4. Find your database ID

The database ID is in the URL when viewing the database. Format: `notion.so/your-workspace/DATABASE_ID?v=...`

The ID is the long string between `/` and `?`. Copy it.

### 5. Configure the connector

```bash
cp notion.example.json notion.json
```

Open `notion.json` and update:
- `database_id` — paste the ID from step 4
- `expected_properties` — adjust to match your actual property names (the defaults assume Name, Interview Date, Interviewee, Segment, Status, Tags)

### 6. Test

```bash
cd ../  # back to pm-discovery-agent root
bash orchestrate.sh --research-question "Test" --interview-source notion --dry-run
```

If you see "✓ Dry-run complete", you're set up.

## Google Drive setup (10 minutes)

A bit more setup than Notion, but works well if your team uses Google Docs for interviews.

### 1. Create a Google Cloud project

- Go to https://console.cloud.google.com/
- Click "Select a project" > "New Project"
- Name it "PM Discovery Agent"
- Click Create

### 2. Enable the APIs

- In the project, search for "Google Drive API" in the API library
- Click Enable
- Search for "Google Docs API"
- Click Enable

### 3. Create a service account

- Go to IAM & Admin > Service Accounts
- Click "+ Create Service Account"
- Name: "pm-discovery-reader"
- Description: "Read-only access for PM Discovery Agent"
- Click Create
- Skip the optional permissions step
- Click Done

### 4. Download the service account key

- Click on the service account you just created
- Go to the "Keys" tab
- Click "Add Key" > "Create new key"
- Choose JSON
- Save the file somewhere secure (e.g., `~/.config/pm-discovery-agent/service-account.json`)

### 5. Set the environment variable

```bash
export GOOGLE_APPLICATION_CREDENTIALS='/Users/yourname/.config/pm-discovery-agent/service-account.json'
```

To make permanent, add to `~/.zshrc` or `~/.bashrc`.

### 6. Share your interview folder with the service account

- Find the service account email (it looks like `pm-discovery-reader@your-project.iam.gserviceaccount.com`)
- Open your interview notes folder in Google Drive
- Click Share
- Paste the service account email
- Set permission to Viewer
- Click Send

### 7. Find your folder ID

Open the folder in Google Drive. The URL looks like: `drive.google.com/drive/folders/FOLDER_ID_HERE`

Copy the ID after `/folders/`.

### 8. Configure the connector

```bash
cp google-drive.example.json google-drive.json
```

Open `google-drive.json` and update:
- `folder_id` — paste the ID from step 7

### 9. Test

```bash
cd ../  # back to pm-discovery-agent root
bash orchestrate.sh --research-question "Test" --interview-source google-drive --dry-run
```

## Building a connector for another system

If your interview notes live somewhere other than Notion or Google Drive, you can build a connector following the same pattern. Common alternatives PMs use:

- **Dovetail** — has a research API; build a connector for the analysis endpoint
- **Granola / Otter / Fathom** — meeting recorders; build a connector that pulls transcripts
- **Reflect / Roam / Logseq** — personal note-taking apps; build a connector for the markdown files
- **Coda / Airtable** — alternative databases; build a connector for the rows API
- **Local files** — markdown files in a folder; build a simple file-reading connector

A connector needs three things:
1. A configuration file defining the data source URL, credentials, and available operations
2. An API client the orchestration script can call
3. A mapping from the source's data model to what the agent expects (interview ID, date, interviewee, content, tags)

Copy `notion.example.json` or `google-drive.example.json` as a starting point.

If you build a connector for a new system, consider raising a PR back to the main pm-claude-skills repo.

## Security notes

**Credentials live in environment variables, not in the JSON files.** This means you can commit your `notion.json` or `google-drive.json` to source control without leaking credentials.

**Use read-only access where possible.** The agent only needs to read interview notes — never to modify them. Both Notion integrations and Google Drive service accounts can be set up with read-only permissions. Use them.

**Rotate credentials periodically.** Both Notion integration tokens and Google service account keys can be regenerated. Do this every 90 days as a security practice.
