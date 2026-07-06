#!/usr/bin/env bash
# SessionStart hook — the Chief of Staff. Opens every Claude Code session with a
# morning brief assembled from THIS project's professional state: predictions due
# for settling, the freshest Firm minutes/Boardroom verdicts, and the brain's
# open hypotheses. Pure file reads — zero API cost, read-only, always exits 0.
#
# Wire it up in ~/.claude/settings.json under "SessionStart" — see
# hooks/settings.example.json. Pairs with `npx pm-claude-skills init`.
set -uo pipefail

root="$(pwd)"
today="$(date +%Y-%m-%d)"
out=""

# ── Predictions due (brain/predictions/*.md with status: pending + due: <= today)
if [ -d "$root/brain/predictions" ]; then
  due=""
  pending_n=0
  for f in "$root"/brain/predictions/*.md; do
    [ -f "$f" ] || continue
    status="$(sed -n 's/^status:[[:space:]]*//p' "$f" | head -1)"
    [ "$status" = "pending" ] || continue
    pending_n=$((pending_n+1))
    d="$(sed -n 's/^due:[[:space:]]*//p' "$f" | head -1)"
    if [ -n "$d" ] && [[ "$d" < "$today" || "$d" == "$today" ]]; then
      line="$(awk '/^---$/{c++;next} c>=2 && NF {print; exit}' "$f")"
      due="${due}- DUE ${d}: ${line} ($(basename "$f"))"$'\n'
    fi
  done
  if [ -n "$due" ]; then
    out="${out}### 🔔 Predictions due for settling"$'\n'"${due}Settle them honestly: npx pm-claude-skills reckoning score <file> hit|miss"$'\n\n'
  elif [ "$pending_n" -gt 0 ]; then
    out="${out}- ⏳ ${pending_n} prediction(s) open, none due today."$'\n'
  fi
fi

# ── Latest arena artifacts (firm minutes / boardroom verdicts)
for dir in firm-minutes boardroom; do
  if [ -d "$root/$dir" ]; then
    latest="$(ls -t "$root/$dir" 2>/dev/null | grep -v '^memos$' | head -1)"
    if [ -n "$latest" ] && [ -f "$root/$dir/$latest" ]; then
      age_note=""
      out="${out}- 📄 Latest in ${dir}/: ${latest} — read it before revising what it discusses."$'\n'
    fi
  fi
done

# ── Open hypotheses from the brain (unresolved [hunch]/hypothesis lines)
hyp_file=""
[ -f "$root/brain/hypotheses.md" ] && hyp_file="$root/brain/hypotheses.md"
[ -d "$root/brain/hypotheses" ] && hyp_file="$(ls "$root"/brain/hypotheses/*.md 2>/dev/null | head -1)"
if [ -n "$hyp_file" ] && [ -f "$hyp_file" ]; then
  n="$(grep -c '^- ' "$hyp_file" 2>/dev/null)" || n=0
  [ "${n:-0}" -gt 0 ] && out="${out}- 🧪 ${n} hypothesis line(s) in brain/ — treat [hunch] as unsettled."$'\n'
fi

if [ -n "$out" ]; then
  echo "## ☀️ Chief of Staff brief ($today)"
  echo
  printf '%s' "$out"
fi
exit 0
