#!/usr/bin/env bash
# PostToolUse hook (Write|Edit) — ambient doc lint: when the model writes a document
# whose name/type matches a skill with a quality bar, inject that skill's Quality
# Checks + Anti-Patterns as a self-review instruction. The model fixes its own draft
# before you ever read it. Read-only, best-effort, always exits 0.
#
# Detects: *.prd.md / *prd* → prd-template · *okr* → okr-builder · *postmortem*/*rca* →
# incident-postmortem · *update*/*status* → stakeholder-update. Extend the map below.
# Skills location override: PM_SKILLS_DIR (default ~/.claude/skills).
set -euo pipefail

SKILLS_DIR="${PM_SKILLS_DIR:-$HOME/.claude/skills}"
payload="$(cat 2>/dev/null || true)"
# The written file's path from the tool input JSON.
file="$(printf '%s' "$payload" | sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)"
[ -n "$file" ] || exit 0
case "$file" in *.md) : ;; *) exit 0 ;; esac

lc="$(printf '%s' "$file" | tr '[:upper:]' '[:lower:]')"
skill=""
case "$lc" in
  *prd*)                       skill="prd-template" ;;
  *okr*)                       skill="okr-builder" ;;
  *postmortem*|*post-mortem*|*rca*) skill="incident-postmortem" ;;
  *status*|*update*)           skill="stakeholder-update" ;;
esac
[ -n "$skill" ] || exit 0
f="$SKILLS_DIR/$skill/SKILL.md"
[ -f "$f" ] || exit 0

# Pull the two checklist sections (until the next ## heading).
checks="$(awk '/^## Quality Checks/{on=1;next} /^## /{on=0} on' "$f" | head -20)"
anti="$(awk '/^## Anti-Patterns/{on=1;next} /^## /{on=0} on' "$f" | head -20)"
[ -n "$checks$anti" ] || exit 0

cat <<EOF
[doc-quality-gate hook] You just wrote $(basename "$file"), which looks like a ${skill} artifact. Before finishing, self-review it against this quality bar and fix any failures in place (briefly note what you fixed):
QUALITY CHECKS:
$checks
ANTI-PATTERNS:
$anti
EOF
exit 0
