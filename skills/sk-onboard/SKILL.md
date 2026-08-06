---
name: sk-onboard
description: Initialize or repair PROJECT.md by running the project onboarding process. Use when starting work on a new project, when PROJECT.md is missing, empty, or contains placeholders, when the SessionStart hook shows the PROJECT CONTEXT GATE, or when the user asks to onboard, initialize, or set up project context.
---

## Current PROJECT.md state

!`if [ -f .claude/PROJECT.md ]; then echo "exists — $(grep -c -v '^[[:space:]]*$' .claude/PROJECT.md) non-empty lines"; head -40 .claude/PROJECT.md; else echo "MISSING — .claude/PROJECT.md does not exist"; fi`

## Instructions

This is a launcher. The full process lives in `~/.claude/skills/project-onboarding-skill.md` — read that file completely with the Read tool now. Do not paraphrase it from memory.

Then execute it exactly:

1. **Triage first:** greenfield or existing project? If any source files with business logic exist, it is an existing project — code that exists is truth.
2. **Existing project:** read the codebase (Track A scan targets) and build the inference map BEFORE asking the human anything. Distinguish every inference from every declaration.
3. **Greenfield:** run the structured question sequence from the skill.
4. Derive the Active Quality Lenses from the project's domain and constraints.
5. Present the complete PROJECT.md draft for human confirmation BEFORE writing it.

Do not start any development task until PROJECT.md is complete and confirmed. If the user asked for a development task in the same breath, tell them onboarding must run first — this is CLAUDE.md Part 3, enforced.
