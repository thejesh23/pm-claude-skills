#!/usr/bin/env bash
# Stop hook — the ambient session ledger. When a session ends, append ONE line
# (date · repo · branch · commit count today) to a local ledger file, so the
# pm-weekly-review skill has real material on Friday instead of your memory.
#
# ⚠ This hook WRITES — one append-only line to $PM_SESSION_LEDGER
# (default: ~/.claude/pm-session-ledger.md). It's the only hook in this pack
# that does; delete it from settings if you want a strictly read-only set.
# Best-effort, always exits 0.
set -euo pipefail

LEDGER="${PM_SESSION_LEDGER:-$HOME/.claude/pm-session-ledger.md}"
root="$(git rev-parse --show-toplevel 2>/dev/null || true)"
repo="${root##*/}"; [ -n "$repo" ] || repo="(no repo)"
branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '-')"
today="$(date +%Y-%m-%d)"
commits=0
[ -n "$root" ] && commits="$(git -C "$root" log --since=midnight --oneline 2>/dev/null | wc -l | tr -d ' ')"

mkdir -p "$(dirname "$LEDGER")"
printf -- '- %s · %s@%s · %s commit(s) this day\n' "$today" "$repo" "$branch" "$commits" >> "$LEDGER"
# Print nothing — Stop hook output isn't needed in context.
exit 0
