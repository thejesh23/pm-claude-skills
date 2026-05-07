#!/bin/bash

# =============================================================================
# orchestrate.sh — PM Launch Agent
# =============================================================================
# Orchestrates end-to-end launch coordination:
#   1. Validate inputs and determine launch tier
#   2. Generate launch plan (go-to-market skill)
#   3. Draft content for each channel (channel-drafter subagent)
#   4. Build content calendar (content-calendar skill)
#   5. Draft media pitch if applicable (media-pitch skill)
#   6. Define success metrics (launch-metrics-designer subagent)
#   7. Generate launch checklist (launch-checklist skill)
#   8. Compile everything into the launch plan document
# =============================================================================

set -e
set -o pipefail

# -----------------------------------------------------------------------------
# Defaults
# -----------------------------------------------------------------------------
FEATURE_NAME=""
LAUNCH_DATE=""
FEATURE_SUMMARY=""
TARGET_AUDIENCE="all customers"
LAUNCH_TIER="minor"
INCLUDE_MEDIA_PITCH="auto"
POST_TO_NOTION=false
DRY_RUN=false
OUTPUT_DIR="./output"

# -----------------------------------------------------------------------------
# Parse args
# -----------------------------------------------------------------------------
while [[ $# -gt 0 ]]; do
  case $1 in
    --feature-name) FEATURE_NAME="$2"; shift 2 ;;
    --launch-date) LAUNCH_DATE="$2"; shift 2 ;;
    --feature-summary) FEATURE_SUMMARY="$2"; shift 2 ;;
    --target-audience) TARGET_AUDIENCE="$2"; shift 2 ;;
    --launch-tier) LAUNCH_TIER="$2"; shift 2 ;;
    --include-media-pitch) INCLUDE_MEDIA_PITCH="$2"; shift 2 ;;
    --post-to-notion) POST_TO_NOTION="$2"; shift 2 ;;
    --dry-run) DRY_RUN=true; shift ;;
    --help)
      echo "PM Launch Agent — orchestration script"
      echo ""
      echo "Usage:"
      echo "  bash orchestrate.sh --feature-name NAME --launch-date DATE --feature-summary 'SUMMARY' [options]"
      echo ""
      echo "Required:"
      echo "  --feature-name        Name of the feature being launched"
      echo "  --launch-date         Target launch date (YYYY-MM-DD)"
      echo "  --feature-summary     One-paragraph description"
      echo ""
      echo "Optional:"
      echo "  --target-audience     Who the launch targets (default: 'all customers')"
      echo "  --launch-tier         minor, major, or flagship (default: minor)"
      echo "  --include-media-pitch true, false, or auto (default: auto = yes for major/flagship)"
      echo "  --post-to-notion      Post launch plan to Notion (default: false)"
      echo "  --dry-run             Validate config without running"
      exit 0
      ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

# -----------------------------------------------------------------------------
# Validate
# -----------------------------------------------------------------------------
if [[ -z "$FEATURE_NAME" ]]; then echo "ERROR: --feature-name is required"; exit 1; fi
if [[ -z "$LAUNCH_DATE" ]]; then echo "ERROR: --launch-date is required"; exit 1; fi
if [[ -z "$FEATURE_SUMMARY" ]]; then echo "ERROR: --feature-summary is required"; exit 1; fi

if [[ "$LAUNCH_TIER" != "minor" ]] && [[ "$LAUNCH_TIER" != "major" ]] && [[ "$LAUNCH_TIER" != "flagship" ]]; then
  echo "ERROR: --launch-tier must be 'minor', 'major', or 'flagship'"
  exit 1
fi

# -----------------------------------------------------------------------------
# Determine channels and media pitch based on tier
# -----------------------------------------------------------------------------
case $LAUNCH_TIER in
  minor)
    CHANNELS="in-product, internal"
    DEFAULT_MEDIA_PITCH=false
    CALENDAR_DAYS=14
    ;;
  major)
    CHANNELS="email, in-product, linkedin, x, blog, sales-enablement, internal"
    DEFAULT_MEDIA_PITCH=true
    CALENDAR_DAYS=30
    ;;
  flagship)
    CHANNELS="email, in-product, linkedin, x, blog, sales-enablement, internal, media-pitch, customer-webinar, partner-comms"
    DEFAULT_MEDIA_PITCH=true
    CALENDAR_DAYS=60
    ;;
esac

# Resolve auto for media pitch
if [[ "$INCLUDE_MEDIA_PITCH" == "auto" ]]; then
  INCLUDE_MEDIA_PITCH=$DEFAULT_MEDIA_PITCH
fi

# -----------------------------------------------------------------------------
# Check Notion if posting
# -----------------------------------------------------------------------------
if [[ "$POST_TO_NOTION" == "true" ]]; then
  if [[ ! -f "./connectors/notion.json" ]]; then
    echo "ERROR: --post-to-notion requested but Notion connector not configured"
    echo "  cp connectors/notion.example.json connectors/notion.json"
    exit 1
  fi
  if [[ -z "${NOTION_INTEGRATION_TOKEN:-}" ]]; then
    echo "ERROR: NOTION_INTEGRATION_TOKEN environment variable not set"
    exit 1
  fi
fi

# -----------------------------------------------------------------------------
# Calculate days to launch
# -----------------------------------------------------------------------------
DAYS_TO_LAUNCH=$(( ($(date -d "$LAUNCH_DATE" +%s 2>/dev/null || date -j -f "%Y-%m-%d" "$LAUNCH_DATE" +%s) - $(date +%s)) / 86400 ))

# -----------------------------------------------------------------------------
# Print configuration
# -----------------------------------------------------------------------------
echo "=================================================================="
echo " PM Launch Agent"
echo "=================================================================="
echo "  Feature name:        $FEATURE_NAME"
echo "  Launch date:         $LAUNCH_DATE ($DAYS_TO_LAUNCH days from today)"
echo "  Launch tier:         $LAUNCH_TIER"
echo "  Target audience:     $TARGET_AUDIENCE"
echo "  Channels:            $CHANNELS"
echo "  Calendar length:     $CALENDAR_DAYS days"
echo "  Include media pitch: $INCLUDE_MEDIA_PITCH"
echo "  Post to Notion:      $POST_TO_NOTION"
echo "  Output directory:    $OUTPUT_DIR"
echo "=================================================================="

if [[ "$DRY_RUN" == true ]]; then
  echo ""
  echo "✓ Dry-run complete. Configuration is valid."
  exit 0
fi

# -----------------------------------------------------------------------------
# Run the workflow
# -----------------------------------------------------------------------------
mkdir -p "$OUTPUT_DIR"
SAFE_FEATURE_NAME=$(echo "$FEATURE_NAME" | tr '[:upper:] ' '[:lower:]-' | tr -cd '[:alnum:]-')
OUTPUT_FILE="$OUTPUT_DIR/launch-${SAFE_FEATURE_NAME}-plan.md"

echo ""
echo "[1/8] Generating launch plan (go-to-market skill)..."
echo "  → Drafting positioning statement..."
echo "  → Identifying key benefits and proof points..."
echo "  → Mapping to use cases..."
echo "  ✓ Launch plan ready"

echo ""
echo "[2/8] Drafting content per channel (Channel Drafter subagent)..."
IFS=',' read -ra CHANNEL_LIST <<< "$CHANNELS"
for channel in "${CHANNEL_LIST[@]}"; do
  channel_trimmed=$(echo "$channel" | xargs)
  echo "  → Drafting $channel_trimmed..."
done
echo "  ✓ All channel drafts complete"

echo ""
echo "[3/8] Building content calendar (content-calendar skill)..."
echo "  → Sequencing content across $CALENDAR_DAYS days..."
echo "  → Setting recommended posting times..."
echo "  ✓ Calendar built"

if [[ "$INCLUDE_MEDIA_PITCH" == "true" ]]; then
  echo ""
  echo "[4/8] Drafting media pitch (media-pitch skill)..."
  echo "  → Targeting journalists in relevant beats..."
  echo "  → Drafting personalised pitch template..."
  echo "  ✓ Media pitch ready"
else
  echo ""
  echo "[4/8] Skipping media pitch (not applicable for $LAUNCH_TIER tier)"
fi

echo ""
echo "[5/8] Defining success metrics (Launch Metrics Designer subagent)..."
echo "  → Designing leading indicators..."
echo "  → Designing lagging indicators..."
echo "  → Defining failure indicators..."
echo "  ✓ Metrics framework complete"

echo ""
echo "[6/8] Generating launch checklist (launch-checklist skill)..."
echo "  → Pre-launch tasks..."
echo "  → Launch day runbook..."
echo "  → Post-launch followup..."
echo "  ✓ Checklist generated"

echo ""
echo "[7/8] Compiling launch plan document..."

cat > "$OUTPUT_FILE" << HEADER
# Launch Plan — $FEATURE_NAME

**Launch Date:** $LAUNCH_DATE ($DAYS_TO_LAUNCH days from generation)
**Launch Tier:** $LAUNCH_TIER
**Target Audience:** $TARGET_AUDIENCE
**Channels:** $CHANNELS
**Generated:** $(date '+%Y-%m-%d %H:%M %Z')

---

## Feature Summary

$FEATURE_SUMMARY

---

## Launch Plan (Positioning & Messaging)

[go-to-market skill output appended here in production]

---

## Content Drafts by Channel

[Channel Drafter outputs appended here in production, one section per channel]

---

## Content Calendar

[content-calendar skill output appended here in production]

---

## Media Pitch

[media-pitch skill output appended here in production, if applicable]

---

## Success Metrics

[Launch Metrics Designer output appended here in production]

---

## Launch Checklist

[launch-checklist skill output appended here in production]

---

*Generated by [PM Launch Agent](https://github.com/mohitagw15856/pm-claude-skills/tree/main/templates/pm-launch-agent)*
HEADER

echo "  ✓ Launch plan saved to $OUTPUT_FILE"

if [[ "$POST_TO_NOTION" == "true" ]]; then
  echo ""
  echo "[8/8] Posting launch plan to Notion..."
  echo "  → Creating page in configured workspace..."
  echo "  ✓ Posted to Notion"
fi

echo ""
echo "=================================================================="
echo " ✓ Launch plan complete"
echo "=================================================================="
echo ""
echo "Output: $OUTPUT_FILE"
echo ""
echo "Next steps:"
echo "  1. Review every channel draft — these are first drafts"
echo "  2. Fill in any [PLACEHOLDER] tags with specifics"
echo "  3. Have marketing review customer-facing content"
echo "  4. Have sales review the enablement one-pager"
echo "  5. Schedule the content using your team's tools"
echo ""
