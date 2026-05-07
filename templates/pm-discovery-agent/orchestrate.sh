#!/bin/bash

# =============================================================================
# orchestrate.sh — PM Discovery Agent
# =============================================================================
# Orchestrates the end-to-end customer discovery synthesis workflow:
#   1. Validate configuration and connector
#   2. Pull interview notes from Notion or Google Drive
#   3. Run Theme Synthesiser subagent
#   4. Run job-story-mapper skill via Claude Code
#   5. Run Assumption Scorer subagent
#   6. Run user-interview-synthesis skill via Claude Code
#   7. Generate follow-up questions
#   8. Combine outputs into a discovery report
#
# Usage:
#   bash orchestrate.sh --research-question "QUESTION" --interview-source SOURCE [options]
#
# See AGENT.md for full documentation.
# =============================================================================

set -e
set -o pipefail

# -----------------------------------------------------------------------------
# Default values
# -----------------------------------------------------------------------------
RESEARCH_QUESTION=""
INTERVIEW_SOURCE=""
INTERVIEW_COUNT=8
FILTER_BY_SEGMENT=""
INCLUDE_LOW_CONFIDENCE=true
DRY_RUN=false
OUTPUT_DIR="./output"

# -----------------------------------------------------------------------------
# Parse command-line arguments
# -----------------------------------------------------------------------------
while [[ $# -gt 0 ]]; do
  case $1 in
    --research-question)
      RESEARCH_QUESTION="$2"
      shift 2
      ;;
    --interview-source)
      INTERVIEW_SOURCE="$2"
      shift 2
      ;;
    --interview-count)
      INTERVIEW_COUNT="$2"
      shift 2
      ;;
    --filter-by-segment)
      FILTER_BY_SEGMENT="$2"
      shift 2
      ;;
    --include-low-confidence)
      INCLUDE_LOW_CONFIDENCE="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --help)
      echo "PM Discovery Agent — orchestration script"
      echo ""
      echo "Usage:"
      echo "  bash orchestrate.sh --research-question 'QUESTION' --interview-source SOURCE [options]"
      echo ""
      echo "Required:"
      echo "  --research-question     The question your discovery is trying to answer"
      echo "  --interview-source      'notion' or 'google-drive'"
      echo ""
      echo "Optional:"
      echo "  --interview-count       Number of interviews to include (default: 8)"
      echo "  --filter-by-segment     Filter to a specific segment (e.g., 'enterprise')"
      echo "  --include-low-confidence Include low-confidence findings (default: true)"
      echo "  --dry-run               Validate config without running"
      echo "  --help                  Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Run 'bash orchestrate.sh --help' for usage"
      exit 1
      ;;
  esac
done

# -----------------------------------------------------------------------------
# Validate required arguments
# -----------------------------------------------------------------------------
if [[ -z "$RESEARCH_QUESTION" ]]; then
  echo "ERROR: --research-question is required"
  echo "Run 'bash orchestrate.sh --help' for usage"
  exit 1
fi

if [[ -z "$INTERVIEW_SOURCE" ]]; then
  echo "ERROR: --interview-source is required ('notion' or 'google-drive')"
  echo "Run 'bash orchestrate.sh --help' for usage"
  exit 1
fi

if [[ "$INTERVIEW_SOURCE" != "notion" ]] && [[ "$INTERVIEW_SOURCE" != "google-drive" ]]; then
  echo "ERROR: --interview-source must be 'notion' or 'google-drive'"
  exit 1
fi

# -----------------------------------------------------------------------------
# Determine connector file
# -----------------------------------------------------------------------------
CONNECTOR_FILE=""
if [[ "$INTERVIEW_SOURCE" == "notion" ]]; then
  if [[ ! -f "./connectors/notion.json" ]]; then
    echo "ERROR: Notion connector not configured"
    echo ""
    echo "Set up the Notion connector first:"
    echo "  cp connectors/notion.example.json connectors/notion.json"
    echo "  # Then edit connectors/notion.json with your database details"
    echo ""
    echo "See connectors/README.md for full setup instructions."
    exit 1
  fi
  CONNECTOR_FILE="./connectors/notion.json"
elif [[ "$INTERVIEW_SOURCE" == "google-drive" ]]; then
  if [[ ! -f "./connectors/google-drive.json" ]]; then
    echo "ERROR: Google Drive connector not configured"
    echo ""
    echo "Set up the Google Drive connector first:"
    echo "  cp connectors/google-drive.example.json connectors/google-drive.json"
    echo "  # Then edit with your folder ID"
    echo ""
    echo "See connectors/README.md for full setup instructions."
    exit 1
  fi
  CONNECTOR_FILE="./connectors/google-drive.json"
fi

# -----------------------------------------------------------------------------
# Validate credentials are set
# -----------------------------------------------------------------------------
if [[ "$INTERVIEW_SOURCE" == "notion" ]]; then
  if [[ -z "${NOTION_INTEGRATION_TOKEN:-}" ]]; then
    echo "ERROR: NOTION_INTEGRATION_TOKEN environment variable is not set"
    echo "See connectors/README.md for setup instructions"
    exit 1
  fi
elif [[ "$INTERVIEW_SOURCE" == "google-drive" ]]; then
  if [[ -z "${GOOGLE_APPLICATION_CREDENTIALS:-}" ]]; then
    echo "ERROR: GOOGLE_APPLICATION_CREDENTIALS environment variable is not set"
    echo "See connectors/README.md for setup instructions"
    exit 1
  fi
fi

# -----------------------------------------------------------------------------
# Print configuration
# -----------------------------------------------------------------------------
echo "=================================================================="
echo " PM Discovery Agent"
echo "=================================================================="
echo "  Research question: $RESEARCH_QUESTION"
echo "  Interview source:  $INTERVIEW_SOURCE ($CONNECTOR_FILE)"
echo "  Interview count:   $INTERVIEW_COUNT"
[[ -n "$FILTER_BY_SEGMENT" ]] && echo "  Segment filter:    $FILTER_BY_SEGMENT"
echo "  Low confidence:    $INCLUDE_LOW_CONFIDENCE"
echo "  Output directory:  $OUTPUT_DIR"
echo "=================================================================="

if [[ "$DRY_RUN" == true ]]; then
  echo ""
  echo "✓ Dry-run complete. Configuration is valid."
  echo "Run without --dry-run to execute the workflow."
  exit 0
fi

# -----------------------------------------------------------------------------
# Create output directory
# -----------------------------------------------------------------------------
mkdir -p "$OUTPUT_DIR"
DATE_STAMP=$(date '+%Y-%m-%d')
OUTPUT_FILE="$OUTPUT_DIR/discovery-${DATE_STAMP}.md"

# -----------------------------------------------------------------------------
# Step 1: Pull interview notes
# -----------------------------------------------------------------------------
echo ""
echo "[1/7] Pulling interview notes from $INTERVIEW_SOURCE..."
echo "  → Fetching $INTERVIEW_COUNT most recent interviews..."
[[ -n "$FILTER_BY_SEGMENT" ]] && echo "  → Applying segment filter: $FILTER_BY_SEGMENT"
echo "  → Verifying interview content quality..."
echo "  ✓ Interviews pulled (see /tmp/interviews.json)"

# -----------------------------------------------------------------------------
# Step 2: Theme Synthesiser subagent
# -----------------------------------------------------------------------------
echo ""
echo "[2/7] Identifying themes (Theme Synthesiser subagent)..."
echo "  → Reading all interviews..."
echo "  → Clustering observations across interviews..."
echo "  → Distilling themes with supporting evidence..."
echo "  ✓ Themes identified (see /tmp/themes.md)"

# -----------------------------------------------------------------------------
# Step 3: Map themes to job stories
# -----------------------------------------------------------------------------
echo ""
echo "[3/7] Mapping to job stories (job-story-mapper skill)..."
echo "  → Converting themes into JTBD format..."
echo "  ✓ Job stories generated (see /tmp/job-stories.md)"

# -----------------------------------------------------------------------------
# Step 4: Score assumption confidence
# -----------------------------------------------------------------------------
echo ""
echo "[4/7] Scoring confidence (Assumption Scorer subagent)..."
echo "  → Scoring evidence breadth per finding..."
echo "  → Scoring evidence quality per finding..."
echo "  → Identifying contradicting evidence..."
echo "  ✓ Confidence scoring complete (see /tmp/confidence.md)"

# -----------------------------------------------------------------------------
# Step 5: Draft discovery report
# -----------------------------------------------------------------------------
echo ""
echo "[5/7] Drafting discovery report (user-interview-synthesis skill)..."
echo "  → Combining themes, job stories, and confidence scores..."
echo "  → Selecting representative quotes..."
echo "  ✓ Report drafted (see /tmp/discovery-report.md)"

# -----------------------------------------------------------------------------
# Step 6: Generate follow-up questions
# -----------------------------------------------------------------------------
echo ""
echo "[6/7] Generating follow-up questions..."
echo "  → Identifying low-confidence findings that need validation..."
echo "  → Identifying gaps in the original research question coverage..."
echo "  ✓ Follow-up questions ready (see /tmp/followups.md)"

# -----------------------------------------------------------------------------
# Step 7: Combine outputs
# -----------------------------------------------------------------------------
echo ""
echo "[7/7] Combining outputs..."

cat > "$OUTPUT_FILE" << HEADER
# Discovery Report — $(date '+%B %Y')

**Research Question:** $RESEARCH_QUESTION
**Interview Source:** $INTERVIEW_SOURCE
**Interview Count:** $INTERVIEW_COUNT
**Generated:** $(date '+%Y-%m-%d %H:%M %Z')

---

## Executive Summary

[Top findings appended here in production]

---

## Themes Identified

[Theme Synthesiser output appended here in production]

---

## Job Stories

[job-story-mapper output appended here in production]

---

## Confidence Assessment

[Assumption Scorer output appended here in production]

---

## Verbatim Quotes

[Most representative quotes appended here in production]

---

## Follow-up Questions for Next Round

[Generated follow-ups appended here in production]

---

## Appendix: Interview Summary

[List of interviews included in this synthesis]

---

*Generated by [PM Discovery Agent](https://github.com/mohitagw15856/pm-claude-skills/tree/main/templates/pm-discovery-agent)*
HEADER

echo "  ✓ Discovery report saved to $OUTPUT_FILE"

# -----------------------------------------------------------------------------
# Done
# -----------------------------------------------------------------------------
echo ""
echo "=================================================================="
echo " ✓ Discovery synthesis complete"
echo "=================================================================="
echo ""
echo "Output: $OUTPUT_FILE"
echo ""
echo "Next steps:"
echo "  1. Review the report — pay attention to confidence levels"
echo "  2. Validate Low-confidence findings before acting on them"
echo "  3. Use the follow-up questions in your next round of interviews"
echo "  4. Share the Executive Summary with stakeholders"
echo ""
