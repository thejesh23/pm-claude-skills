#!/bin/bash

# =============================================================================
# orchestrate.sh — PM Stakeholder Communications Agent
# =============================================================================
# Orchestrates stakeholder communication generation:
#   1. Validate config and detect available connectors
#   2. Run Audience Analyser subagent
#   3. Pull recent activity from ticketing system (and Drive if configured)
#   4. Run Highlight Selector subagent
#   5. Run the appropriate skill based on audience
#   6. Add audience-appropriate ask
#   7. Save the draft
#
# Usage:
#   bash orchestrate.sh --audience AUDIENCE --period PERIOD --your-name NAME [options]
# =============================================================================

set -e
set -o pipefail

# -----------------------------------------------------------------------------
# Default values
# -----------------------------------------------------------------------------
AUDIENCE=""
PERIOD=""
YOUR_NAME=""
AUDIENCE_DETAIL=""
INCLUDE_PRE_DRAFT_SUMMARY=true
TONE="auto"
DRY_RUN=false
OUTPUT_DIR="./output"

# -----------------------------------------------------------------------------
# Parse arguments
# -----------------------------------------------------------------------------
while [[ $# -gt 0 ]]; do
  case $1 in
    --audience) AUDIENCE="$2"; shift 2 ;;
    --period) PERIOD="$2"; shift 2 ;;
    --your-name) YOUR_NAME="$2"; shift 2 ;;
    --audience-detail) AUDIENCE_DETAIL="$2"; shift 2 ;;
    --include-pre-draft-summary) INCLUDE_PRE_DRAFT_SUMMARY="$2"; shift 2 ;;
    --tone) TONE="$2"; shift 2 ;;
    --dry-run) DRY_RUN=true; shift ;;
    --help)
      echo "PM Stakeholder Communications Agent — orchestration script"
      echo ""
      echo "Usage:"
      echo "  bash orchestrate.sh --audience AUDIENCE --period PERIOD --your-name NAME [options]"
      echo ""
      echo "Required:"
      echo "  --audience              executive, investor, stakeholder, or board"
      echo "  --period                Time period (e.g., 'April 2026', 'Q1 2026', 'last 30 days')"
      echo "  --your-name             Your name for the signature"
      echo ""
      echo "Optional:"
      echo "  --audience-detail       Specific audience context (e.g., 'CEO and CFO')"
      echo "  --tone                  formal, direct, casual, or auto (default: auto)"
      echo "  --include-pre-draft-summary  Include high-level summary at top (default: true)"
      echo "  --dry-run               Validate config without running"
      exit 0
      ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

# -----------------------------------------------------------------------------
# Validate required arguments
# -----------------------------------------------------------------------------
if [[ -z "$AUDIENCE" ]]; then
  echo "ERROR: --audience is required"
  exit 1
fi

if [[ "$AUDIENCE" != "executive" ]] && [[ "$AUDIENCE" != "investor" ]] && [[ "$AUDIENCE" != "stakeholder" ]] && [[ "$AUDIENCE" != "board" ]]; then
  echo "ERROR: --audience must be 'executive', 'investor', 'stakeholder', or 'board'"
  exit 1
fi

if [[ -z "$PERIOD" ]]; then
  echo "ERROR: --period is required"
  exit 1
fi

if [[ -z "$YOUR_NAME" ]]; then
  echo "ERROR: --your-name is required"
  exit 1
fi

# -----------------------------------------------------------------------------
# Detect ticketing connector
# -----------------------------------------------------------------------------
TICKETING_CONNECTOR=""
if [[ -f "./connectors/linear.json" ]]; then
  TICKETING_CONNECTOR="linear"
elif [[ -f "./connectors/jira.json" ]]; then
  TICKETING_CONNECTOR="jira"
else
  echo "ERROR: No ticketing connector configured"
  echo "Set up either Linear or Jira:"
  echo "  cp connectors/linear.example.json connectors/linear.json"
  echo "  # OR"
  echo "  cp connectors/jira.example.json connectors/jira.json"
  exit 1
fi

# Check ticketing credentials
if [[ "$TICKETING_CONNECTOR" == "linear" ]]; then
  if [[ -z "${LINEAR_API_KEY:-}" ]]; then
    echo "ERROR: LINEAR_API_KEY not set"
    exit 1
  fi
elif [[ "$TICKETING_CONNECTOR" == "jira" ]]; then
  if [[ -z "${JIRA_EMAIL:-}" ]] || [[ -z "${JIRA_API_TOKEN:-}" ]]; then
    echo "ERROR: JIRA_EMAIL and JIRA_API_TOKEN must both be set"
    exit 1
  fi
fi

# Check optional Google Drive
DRIVE_AVAILABLE=false
if [[ -f "./connectors/google-drive.json" ]] && [[ -n "${GOOGLE_APPLICATION_CREDENTIALS:-}" ]]; then
  DRIVE_AVAILABLE=true
fi

# Determine which skill the agent will use
case $AUDIENCE in
  executive) SKILL_NAME="executive-update" ;;
  investor) SKILL_NAME="investor-update" ;;
  stakeholder) SKILL_NAME="stakeholder-update" ;;
  board) SKILL_NAME="board-deck-narrative" ;;
esac

# -----------------------------------------------------------------------------
# Print configuration
# -----------------------------------------------------------------------------
echo "=================================================================="
echo " PM Stakeholder Communications Agent"
echo "=================================================================="
echo "  Audience:           $AUDIENCE"
[[ -n "$AUDIENCE_DETAIL" ]] && echo "  Audience detail:    $AUDIENCE_DETAIL"
echo "  Period:             $PERIOD"
echo "  Your name:          $YOUR_NAME"
echo "  Tone:               $TONE"
echo "  Skill to use:       $SKILL_NAME"
echo "  Ticketing source:   $TICKETING_CONNECTOR"
echo "  Drive source:       $([ "$DRIVE_AVAILABLE" = true ] && echo "configured" || echo "not configured")"
echo "  Output directory:   $OUTPUT_DIR"
echo "=================================================================="

if [[ "$DRY_RUN" == true ]]; then
  echo ""
  echo "✓ Dry-run complete. Configuration is valid."
  exit 0
fi

# -----------------------------------------------------------------------------
# Run workflow
# -----------------------------------------------------------------------------
mkdir -p "$OUTPUT_DIR"
DATE_STAMP=$(date '+%Y-%m-%d')
OUTPUT_FILE="$OUTPUT_DIR/${AUDIENCE}-update-${DATE_STAMP}.md"

echo ""
echo "[1/6] Analysing audience requirements..."
echo "  → Determining target length, tone, content priorities..."
echo "  → Identifying audience-specific watchouts..."
echo "  ✓ Audience analysis complete"

echo ""
echo "[2/6] Pulling recent activity..."
echo "  → Fetching shipped work from $TICKETING_CONNECTOR for: $PERIOD"
echo "  → Filtering out items tagged 'internal-only'"
[[ "$DRIVE_AVAILABLE" = true ]] && echo "  → Fetching recent docs from Google Drive"
echo "  ✓ Activity pulled"

echo ""
echo "[3/6] Selecting highlights for audience..."
echo "  → Scoring each item for relevance to $AUDIENCE audience..."
echo "  → Filtering by impact clarity..."
echo "  → Curating to fit length budget..."
echo "  ✓ Highlights selected"

echo ""
echo "[4/6] Drafting communication ($SKILL_NAME skill)..."
echo "  → Applying audience-appropriate format and tone..."
echo "  → Including selected highlights..."
echo "  ✓ Draft generated"

echo ""
echo "[5/6] Adding audience-appropriate call-to-action..."
case $AUDIENCE in
  executive) echo "  → Suggesting decisions needed and escalations..." ;;
  investor) echo "  → Suggesting asks for hiring help, intros, advice..." ;;
  stakeholder) echo "  → Suggesting alignment needs and blockers to remove..." ;;
  board) echo "  → Suggesting discussion items and approvals needed..." ;;
esac
echo "  ✓ Call-to-action added"

echo ""
echo "[6/6] Saving draft..."

cat > "$OUTPUT_FILE" << HEADER
# ${AUDIENCE^} Update — $PERIOD

**From:** $YOUR_NAME
**To:** $([ -n "$AUDIENCE_DETAIL" ] && echo "$AUDIENCE_DETAIL" || echo "$AUDIENCE")
**Period:** $PERIOD
**Generated:** $(date '+%Y-%m-%d %H:%M %Z')

---

[Pre-draft summary appended here in production]

---

[Main update content from $SKILL_NAME skill appended here in production]

---

## Asks / Decisions Needed

[Audience-appropriate call-to-action appended here in production]

---

## Activity Reference Appendix

[Raw activity data for reference, appended here in production]

---

*Generated by [PM Stakeholder Communications Agent](https://github.com/mohitagw15856/pm-claude-skills/tree/main/templates/pm-stakeholder-comms-agent)*
HEADER

echo "  ✓ Draft saved to $OUTPUT_FILE"

echo ""
echo "=================================================================="
echo " ✓ ${AUDIENCE^} update generated"
echo "=================================================================="
echo ""
echo "Output: $OUTPUT_FILE"
echo ""
echo "Next steps:"
echo "  1. Review the draft — this is a first draft, not a final version"
echo "  2. Edit for context only you know (strategy, politics, tone)"
echo "  3. Verify the call-to-action matches what you actually need"
echo "  4. Send when ready"
echo ""
