# Enforcement Layer — Install Notes

This package adds deterministic enforcement to your `.claude/` system:
hooks make skill activation and the PROJECT.md gate mechanical instead of voluntary.

## Contents

```
.claude/
├── settings.json                     ← wires both hooks (merge if you already have one)
├── hooks/
│   ├── skill-activation.mjs          ← UserPromptSubmit: injects skill instructions per prompt
│   ├── skill-rules.json              ← triggers per skill — the only file you maintain
│   └── session-start.sh              ← SessionStart: enforces the PROJECT.md gate
└── skills/
    └── design-audit-skill.md         ← new remediation skill (messy existing designs)
```

## Install

1. Copy the `.claude/` contents into your project's `.claude/` folder
   (merge `settings.json` if one exists — the `hooks` key is what matters).
2. `chmod +x .claude/hooks/session-start.sh` (the .mjs needs no chmod; it's invoked via `node`).
3. Requirements: Node (already required by Claude Code) and bash.
4. Restart the Claude Code session. Run `/hooks` to verify both hooks are registered.
5. Commit `.claude/settings.json` and `.claude/hooks/` to git so the whole team gets enforcement.

## Verify

- Start a session in a project with an empty PROJECT.md → the first context injected
  should be the PROJECT CONTEXT GATE block.
- Type "fix the bug in X" → Claude's context receives the debugging-skill activation
  block before it responds. Ask Claude "what was injected with my prompt?" to confirm.

## Maintain

- **Adding a skill:** add the .md to `.claude/skills/`, add an entry to
  `skill-rules.json` (keywords, patterns, instruction). That's it.
- **Tuning:** if a skill fires when it shouldn't, tighten its keywords/patterns.
  If it misses, add the phrasing you actually used to its keywords.
  The escape valve ("state why it doesn't apply, then proceed") makes false
  positives cheap, so err on the side of firing.
- The dedup cache lives in `.claude/.cache/skill-hook/` — add it to `.gitignore`.
  Delete it anytime to reset reminders.

## CLAUDE.md patch

Add one row to the §1.3 skill table:

```
| Auditing or remediating an existing messy/inconsistent design | `design-audit-skill.md` |
```

And optionally append to §1.3:

> Skill activation is reinforced by a UserPromptSubmit hook that injects the
> matching skill instruction with every prompt. If the hook fires, reading the
> skill is mandatory. If you believe the match is wrong, say why in one sentence
> before proceeding — never silently ignore an injected activation.

## What stays voluntary (by design)

Hooks enforce *that the instruction is present every time*. The model still does
the judgment work. Two rules remain culture, not law — keep reviewing for them:
scope discipline (§1.8) and labeling partial answers (§1.11). If you later want
mechanical pressure on those too, a Stop hook can check, e.g., that a session
containing a bug fix also touched a test file — happy to extend this when needed.
