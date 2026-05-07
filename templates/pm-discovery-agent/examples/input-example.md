# Example: Input to the PM Discovery Agent

## Command-line invocation

```bash
bash orchestrate.sh \
  --research-question "Why are users abandoning the onboarding flow?" \
  --interview-source notion \
  --interview-count 10 \
  --filter-by-segment "smb"
```

## What the agent reads from your connector

### From Notion

The agent automatically pulls from your configured Notion database:

- Most recent N interviews where Status = "Completed"
- For each interview:
  - Title (interviewee name or identifier)
  - Interview date
  - Interviewee role and segment tags
  - Full page content (notes, transcript, observations, quotes)

If you've applied a segment filter, only interviews matching that segment are included.

### From Google Drive

The agent automatically pulls from your configured folder:

- Most recently modified Google Docs in the folder
- For each doc:
  - Document title
  - Last modified date
  - Full text content

If your filenames follow the `YYYY-MM-DD - Name.gdoc` convention, the agent uses the date for sorting and the name for interviewee identification.

## What the agent does NOT need from you

- A summary of what the interviews said — that's what the agent produces
- Pre-tagged themes — the agent finds them
- A list of which interviews are most important — the agent uses all included interviews
- Statistical analysis — this is qualitative discovery, not quantitative

## What you should know before running

- **Have at least 5 interviews completed.** The agent works best with 5+ interviews. With fewer, themes will be tagged as "Emerging" rather than "Strong" — directional insights only.
- **Have a specific research question.** Vague questions produce vague synthesis. "What do users think?" is too broad. "Why are users abandoning the onboarding flow at step 3?" is specific enough to drive useful synthesis.
- **Check your interview notes are accessible.** The agent can only read what your connector has access to. If notes are in a different database/folder than configured, results will be empty.

## Example: Real-world invocations

```bash
# Standard discovery synthesis from Notion
bash orchestrate.sh \
  --research-question "What's blocking users from completing checkout?" \
  --interview-source notion \
  --interview-count 8

# Synthesis filtered to a specific segment
bash orchestrate.sh \
  --research-question "How are enterprise customers using the API?" \
  --interview-source notion \
  --interview-count 12 \
  --filter-by-segment "enterprise"

# Synthesis from Google Drive folder (all recent interviews)
bash orchestrate.sh \
  --research-question "What workflows do power users have that we don't support?" \
  --interview-source google-drive \
  --interview-count 10

# Smaller batch with low-confidence findings excluded (cleaner stakeholder report)
bash orchestrate.sh \
  --research-question "Validate our pricing hypothesis" \
  --interview-source notion \
  --interview-count 6 \
  --include-low-confidence false

# Dry run to validate config
bash orchestrate.sh \
  --research-question "Test" \
  --interview-source notion \
  --dry-run
```
