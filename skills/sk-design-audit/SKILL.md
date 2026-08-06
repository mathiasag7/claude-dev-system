---
name: sk-design-audit
description: Audit and remediate an existing product whose design is messy, inconsistent, ugly, or outdated. Use when the user says the design/UI is bad or inconsistent, asks to clean up or unify the visual design, requests a redesign without providing a target design, or when visual debt blocks feature work. NOT for building new UI against an existing design system (use frontend-ui-skill for that).
---

## Instructions

This is a launcher. The full process lives in `~/.claude/skills/design-audit-skill.md` — read that file completely with the Read tool now. Do not paraphrase it from memory.

Hard constraints, before anything else:

1. **Do NOT start restyling pages.** No page is modified before the canonical system is derived (Phase 2) and confirmed by the human. Taste-driven page fixes create a new layer of inconsistency on top of the old one.
2. **Begin with Phase 0 — declare the visual access level:**
   - A: a browser tool (e.g. Playwright MCP) is available → screenshot every page before any change.
   - B: the human can provide screenshots → request the 5 most-used pages plus any page they called out.
   - C: code-only → state explicitly that the audit detects inconsistency and duplication but cannot judge visual quality. Never present a code-only finding as a visual finding.
3. **Phase 1 is read-only.** Inventory tokens, components, and pages. No fixes during the audit — not even "obvious" ones.
4. **Confirmation gates:** present the Audit Report (after Phase 1) and the canonical system proposal (after Phase 2) for human review. Phase 2 confirmation is a hard gate.
5. Per-component rebuilds during migration are handed to `frontend-ui-skill.md`; flows to `frontend-ux-skill.md`. Behavior is frozen — remediation changes how pages look, not what they do.

Produce the Output Format items from the skill, in order, respecting both gates.
