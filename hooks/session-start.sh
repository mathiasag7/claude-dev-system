#!/usr/bin/env bash
# session-start.sh — SessionStart hook for Claude Code
#
# Enforces CLAUDE.md Part 4 mechanically: if PROJECT.md is missing, empty,
# or still contains placeholders, Claude is told — in injected context, every
# session — to run the onboarding skill before any other work.
#
# stdout of a SessionStart hook is injected into Claude's context.
# This script never blocks the session; it only informs. Always exits 0.
#
# Install (in .claude/settings.json):
#   "hooks": {
#     "SessionStart": [
#       { "hooks": [ { "type": "command",
#           "command": "bash \"$CLAUDE_PROJECT_DIR/.claude/hooks/session-start.sh\"" } ] }
#     ]
#   }

set -u
ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"
PROJECT_MD="$ROOT/.claude/PROJECT.md"

problem=""

if [[ ! -f "$PROJECT_MD" ]]; then
  problem="PROJECT.md does not exist at .claude/PROJECT.md."
elif [[ ! -s "$PROJECT_MD" ]]; then
  problem="PROJECT.md exists but is empty."
else
  # Fewer than 30 non-empty lines = almost certainly an unfilled skeleton
  lines=$(grep -c -v '^[[:space:]]*$' "$PROJECT_MD" 2>/dev/null || echo 0)
  if [[ "$lines" -lt 30 ]]; then
    problem="PROJECT.md has only $lines non-empty lines — it appears to be an unfilled skeleton."
  # Common placeholder markers
  elif grep -q -E '\[(TODO|TBD|FILL|fill me|placeholder|à remplir|a remplir)\]|<!-- *(TODO|TBD|FILL)|\[\.\.\.\]|_____' "$PROJECT_MD" 2>/dev/null; then
    problem="PROJECT.md still contains placeholder markers (TODO/TBD/FILL/...)."
  fi
fi

if [[ -n "$problem" ]]; then
  cat <<EOF
[PROJECT CONTEXT GATE — injected by SessionStart hook, per CLAUDE.md Part 4]
$problem

Before ANY development task in this session:
1. Read .claude/skills/project-onboarding-skill.md and run it.
2. Determine greenfield vs existing. For existing projects, read the codebase
   and build the inference map BEFORE asking the human anything.
3. Produce a complete PROJECT.md (including Active Quality Lenses) and present
   it for confirmation before writing it.

If the user's first request is a development task, tell them PROJECT.md is
incomplete and that onboarding must run first. Do not skip this gate.
EOF
else
  cat <<EOF
[SESSION CONTEXT — injected by SessionStart hook]
PROJECT.md is present and appears complete. Per CLAUDE.md: read
.claude/PROJECT.md before the first task; constraints, forbidden patterns and
Active Quality Lenses defined there are binding for this entire session.
EOF
fi

exit 0
