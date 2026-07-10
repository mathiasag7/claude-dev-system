# Enforcement Layer — Install Notes

This package adds deterministic enforcement to your `.claude/` system:
hooks make skill activation and the PROJECT.md gate mechanical instead of voluntary.

## Contents

```
.claude/
├── CLAUDE.md                         ← shrunk universal rules (replaces your original)
├── settings.json                     ← wires both hooks (merge if you already have one)
├── hooks/
│   ├── skill-activation.mjs          ← UserPromptSubmit: injects skill instructions per prompt
│   ├── skill-rules.json              ← triggers per skill — the only file you maintain
│   └── session-start.sh              ← SessionStart: enforces the PROJECT.md gate
└── skills/
    ├── design-audit-skill.md            ← remediation skill (messy existing designs)
    ├── product-thinking-skill.md        ← run FIRST for user-facing field/screen/data changes
    ├── visual-design-skill.md           ← run BEFORE frontend-ui (mockups, design system, consistency)
    ├── sk-onboard/SKILL.md              ← /sk-onboard          → project-onboarding-skill.md
    ├── sk-product-thinking/SKILL.md     ← /sk-product-thinking → product-thinking-skill.md
    ├── sk-design-audit/SKILL.md         ← /sk-design-audit     → design-audit-skill.md
    ├── sk-feature-design/SKILL.md       ← /sk-feature-design   → feature-design-skill.md
    ├── sk-backend/SKILL.md              ← /sk-backend          → backend-skill.md
    ├── sk-visual-design/SKILL.md        ← /sk-visual-design    → visual-design-skill.md
    ├── sk-frontend-ui/SKILL.md          ← /sk-frontend-ui      → frontend-ui-skill.md
    ├── sk-frontend-ux/SKILL.md          ← /sk-frontend-ux      → frontend-ux-skill.md
    ├── sk-testing/SKILL.md              ← /sk-testing          → testing-skill.md
    ├── sk-debugging/SKILL.md            ← /sk-debugging        → debugging-skill.md
    └── sk-refactor/SKILL.md             ← /sk-refactor         → architecture-refactoring-skill.md
```

Each `<name>/SKILL.md` is a thin launcher: typing /<name> (or Claude auto-loading it
from its description) instructs Claude to read the corresponding flat *-skill.md in
full. Your flat files stay the single source of truth; launchers never duplicate them.
Your flat skill files go in .claude/skills/ next to the launcher folders.

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
- Type "ajoute le champ Type de client au formulaire" → the product-thinking-skill
  activation should fire (French triggers are wired).
- Type "fais la maquette de la page X, no-scan" → the visual-design activation fires,
  and product-thinking's Impact Scan mode-override is detected deterministically.

## Maintain

- **Adding a skill:** add the .md to `.claude/skills/`, add an entry to
  `skill-rules.json` (keywords, patterns, instruction). That's it.
- **Tuning:** if a skill fires when it shouldn't, tighten its keywords/patterns.
  If it misses, add the phrasing you actually used to its keywords.
  The escape valve ("state why it doesn't apply, then proceed") makes false
  positives cheap, so err on the side of firing.
- **Scan-mode override:** `no-scan` / `full-scan` / `scan-complet` anywhere in a
  prompt is detected deterministically by the hook and injected as a [MODE OVERRIDE]
  block consumed by product-thinking-skill. It modulates the Impact Scan only — it
  never skips the product-thinking core steps.
- The dedup cache lives in `.claude/.cache/skill-hook/` — add it to `.gitignore`.
  Delete it anytime to reset reminders.

## CLAUDE.md

The shrunk CLAUDE.md in this package replaces your original. All 12 behavioral rules
survive (1.1+1.2 were merged in an earlier revision; 1.12 "All Code Is in English"
was added later). The skill table and Part 4 gate are reinforced by the hooks.
Keep your original somewhere if you want to diff.

## Old CLAUDE.md patch (only if you keep your original instead)

Add the new rows to the §1.3 skill table:

```
| Any field, screen, form, or data change a real user will see | product-thinking-skill.md — run FIRST |
| Designing what a screen looks like (mockup, design system, art direction) | visual-design-skill.md — run BEFORE frontend-ui |
| Auditing or remediating an existing messy/inconsistent design | design-audit-skill.md |
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
