#!/usr/bin/env bash
# UserPromptSubmit hook — auto-inject your project's CONTEXT.md into every prompt.
#
# Pairs with the CONTEXT.md convention (see CONTEXT.example.md): drop a CONTEXT.md in
# your project root and every turn is grounded in your company/product/voice — without
# pasting it each time. Whatever this script prints to stdout is added to the model's context.
#
# Wire it up in ~/.claude/settings.json — see hooks/settings.example.json.
# No dependencies. Safe: read-only, always exits 0.
set -euo pipefail

# Look for CONTEXT.md in the current dir, then walk up to the git root.
find_context() {
  local dir
  dir="$(pwd)"
  while [ "$dir" != "/" ]; do
    if [ -f "$dir/CONTEXT.md" ]; then echo "$dir/CONTEXT.md"; return 0; fi
    dir="$(dirname "$dir")"
  done
  return 1
}

if ctx="$(find_context)"; then
  echo "## Project context (from CONTEXT.md)"
  echo
  cat "$ctx"
fi

exit 0
