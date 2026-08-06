---
name: sk-visual-design
description: Design visual mockups/maquettes, art direction, and design-system evolution using the project's design canvas MCP, with a persistent design memory (canvas component library + shell contract) that guarantees cross-page consistency. Use whenever the task is to design what a screen LOOKS like — a new page mockup, a visual redesign, a design-system or art-direction change, any work in the design canvas, or any mention of "maquette", "mockup", "design de l'écran/page", "à quoi ça devrait ressembler", or visual inconsistency between screens (missing header/shell on one page). Runs BEFORE sk-frontend-ui (which implements the design). NOT for implementing already-designed components (sk-frontend-ui), flow/steps/feedback design (sk-frontend-ux), or deciding a screen's content (sk-product-thinking).
---

## Instructions

This is a launcher. The full process lives in `~/.claude/skills/visual-design-skill.md` — read that file completely with the Read tool now. Do not paraphrase it from memory.

Hard constraints, before anything else:

1. **Load the Design Memory first.** Read `.claude/design/SHELL-CONTRACT.md` and `.claude/design/DESIGN-SYSTEM.md` in full. If absent, BOOTSTRAP both halves of the memory (canvas component library + shell template, AND the two files), confirmed by the human, before designing anything.
2. **The canvas is declared, not assumed.** Resolve the `CANVAS:` line in DESIGN-SYSTEM.md (fallback: PROJECT.md §2, connected MCPs, then ask once). List the declared MCP's tools and read their schemas — never guess tool names or parameters. Verify the three required capabilities (reusable components, frame templates, export/screenshot); a missing capability is a finding to raise, never a silent workaround.
3. **Art direction (Step 1-bis) triggers ONLY on bootstrap or explicit repositioning.** Then: 2-3 named style tiles in the canvas, the HUMAN picks — the skill never self-selects a direction. Everywhere else, holding the established direction IS the art direction.
4. **Step 2 before drawing.** Answer the designer questions in writing (purpose, audience, must-exist in priority order, best representation per element, orientation, perceived ease, empty/edge states). If the screen's CONTENT is unsettled or conditional, stop and run sk-product-thinking first.
5. **Compose by instantiation.** Every screen starts as a duplicate of the shell template; components are instantiated from the library, never redrawn inline. A missing component is created AS a library component (with its index line in DESIGN-SYSTEM.md) first — every component decision materializes in BOTH the canvas library and the .md index.
6. **Step 4 is non-negotiable: the cross-page consistency pass.** Screenshot the new screen, open at least two sibling screens, walk the shell contract line by line. Every delta is either a bug (fix now) or a contract change (update the template/library, record in SHELL-CONTRACT.md, flag siblings) — never a silent local exception.
7. **Write decisions to both halves of the memory in the same task.** A decision not in the library AND the index does not exist for the next screen.
8. Hand off the designed screen (frame, components by index name, tokens, states) to `sk-frontend-ui` for implementation — implementation does not re-decide the design.
