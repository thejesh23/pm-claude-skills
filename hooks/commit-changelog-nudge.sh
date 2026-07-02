#!/usr/bin/env bash
# PostToolUse hook (Bash) — after a `git commit` in a repo that keeps a CHANGELOG.md,
# nudge the model to draft the matching changelog line in Keep-a-Changelog style
# (using the changelog-generator skill's conventions if installed). It only fires on
# commits, only when a CHANGELOG.md exists, and never writes anything itself.
# Read-only, best-effort, always exits 0.
set -euo pipefail

payload="$(cat 2>/dev/null || true)"
cmd="$(printf '%s' "$payload" | sed -n 's/.*"command"[[:space:]]*:[[:space:]]*"\(.*\)".*/\1/p' | head -c 300)"
case "$cmd" in *"git commit"*) : ;; *) exit 0 ;; esac

# Find the repo root and check for a changelog.
root="$(git rev-parse --show-toplevel 2>/dev/null || true)"
[ -n "$root" ] && [ -f "$root/CHANGELOG.md" ] || exit 0

subject="$(git -C "$root" log -1 --format='%s' 2>/dev/null || true)"
[ -n "$subject" ] || exit 0
# Skip merges, fixups, and changelog-only commits.
case "$subject" in Merge\ *|fixup!*|*changelog*|*CHANGELOG*) exit 0 ;; esac

cat <<EOF
[commit-changelog-nudge hook] A commit just landed: "$subject". This repo keeps a CHANGELOG.md — if this change is user-visible, propose the one-line Unreleased entry for it (Keep-a-Changelog category: Added/Changed/Fixed), phrased for users rather than developers. If it's internal-only, say nothing.
EOF
exit 0
