#!/usr/bin/env bash
# UserPromptSubmit hook — suggest the most relevant installed PM Skill for the prompt.
#
# Scans your installed skills (default ~/.claude/skills/*/SKILL.md) and, if the prompt
# strongly matches one, nudges the model to apply it. Best-effort and non-blocking: if
# nothing matches well, it stays quiet. Whatever it prints to stdout is added to context.
#
# Override the skills location with PM_SKILLS_DIR. Wire it up via hooks/settings.example.json.
# No dependencies beyond awk/grep. Always exits 0.
set -euo pipefail

SKILLS_DIR="${PM_SKILLS_DIR:-$HOME/.claude/skills}"
[ -d "$SKILLS_DIR" ] || exit 0

# Claude Code passes the hook event as JSON on stdin; pull the user's prompt out of it.
payload="$(cat 2>/dev/null || true)"
prompt="$(printf '%s' "$payload" | sed -n 's/.*"prompt"[[:space:]]*:[[:space:]]*"\(.*\)".*/\1/p' | head -c 400)"
[ -n "$prompt" ] || prompt="$payload"
# lowercase, keep words >3 chars as match terms
terms="$(printf '%s' "$prompt" | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9' ' ' | tr ' ' '\n' | awk 'length>3' | sort -u)"
[ -n "$terms" ] || exit 0

best_name=""; best_score=0
for f in "$SKILLS_DIR"/*/SKILL.md; do
  [ -f "$f" ] || continue
  name="$(basename "$(dirname "$f")")"
  desc="$(sed -n 's/^description:[[:space:]]*//p' "$f" | tr '[:upper:]' '[:lower:]')"
  hay="$name $desc"
  score=0
  while IFS= read -r t; do
    case "$hay" in *"$t"*) score=$((score+1));; esac
  done <<EOF
$terms
EOF
  if [ "$score" -gt "$best_score" ]; then best_score="$score"; best_name="$name"; fi
done

# Only suggest if the match is meaningfully strong (>=3 overlapping terms).
if [ "$best_score" -ge 3 ] && [ -n "$best_name" ]; then
  echo "💡 A relevant PM Skill is installed: **$best_name**. If it fits this request, apply its framework."
fi
exit 0
