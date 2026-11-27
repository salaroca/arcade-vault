#!/usr/bin/env bash
# PostToolUse hook: runs Prettier + ESLint on created/edited files.
# Claude Code passes a JSON payload via stdin.

set -euo pipefail

# Parse file_path from stdin JSON using node (always available in a Next.js project)
INPUT=$(cat)
FILE=$(node -e "
  try {
    const d = JSON.parse(process.argv[1]);
    console.log(d.tool_input && d.tool_input.file_path ? d.tool_input.file_path : '');
  } catch(e) { console.log(''); }
" "$INPUT" 2>/dev/null || echo "")

# Nothing to do
[ -z "$FILE" ] && exit 0

# Resolve to absolute path if relative
if [[ "$FILE" != /* ]]; then
  FILE="$(pwd)/$FILE"
fi

# File must exist
[ -f "$FILE" ] || exit 0

# Extract extension (lowercase)
EXT="${FILE##*.}"
EXT=$(echo "$EXT" | tr '[:upper:]' '[:lower:]')

PRETTIER_EXTS="ts tsx js jsx mjs cjs md mdx json css"
ESLINT_EXTS="ts tsx js jsx mjs cjs"

# Check if extension is in a space-separated list
in_list() {
  local ext="$1" list="$2"
  for e in $list; do [ "$ext" = "$e" ] && return 0; done
  return 1
}

# Run Prettier
if in_list "$EXT" "$PRETTIER_EXTS"; then
  npx prettier --write "$FILE" 2>&1 >/dev/null || true
fi

# Run ESLint --fix (only for JS/TS files)
if in_list "$EXT" "$ESLINT_EXTS"; then
  npx eslint --fix "$FILE" 2>&1 >/dev/null || true
fi

exit 0
