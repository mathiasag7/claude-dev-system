---
name: sk-product-thinking
description: Before implementing any field, form, page, or data change a real user will see, simulate the finished product from that user's perspective. Use when adding or changing a field on a form/model/record, adding a value to an enum/status/type/category, building or modifying a detail page/list/dashboard, or any request phrased as "add X to the form/page" without describing surrounding behavior. There is no fast exit for small requests — a single field is exactly where this skill matters most. NOT for pure backend logic with no UI surface, internal tooling with no persona, or bug fixes that don't change what's visible.
---

## Instructions

This is a launcher. The full process lives in `.claude/skills/product-thinking-skill.md` — read that file completely with the Read tool now. Do not paraphrase it from memory.

Hard constraints, before anything else:

1. **No fast exit for size.** A single field or a single new enum value is not "too small to think about" — treat that exact instinct as the trigger. The only real exception is a purely cosmetic change (color, spacing, copy) with zero behavioral or informational consequence.
2. **Run this BEFORE `sk-feature-design`, `sk-frontend-ui`, or `sk-frontend-ux`.** This skill answers "what should exist and why." They answer "how to build it well." Do not build first and rationalize second.
3. **Begin with Step 0** — identify the surface type and the persona (pull from PROJECT.md Section 1/4; if undefined, stop and ask — do not design for an undefined user).
4. **Step 1 is mandatory: simulate the finished product.** Walk through what the persona wants to know and do, in priority order, on this specific screen — before listing fields. If a field's value (a type, category, or status) could change what else should appear, be required, or be editable, that conditional behavior is part of the requirement, not a later enhancement.
5. **Step 2 — ask what cannot be simulated:** visibility, editability, timing, conditionality, placement, cardinality. Do not silently assume answers when more than one is plausible.
6. **Step 4 — gap analysis is a hard reporting requirement, not a license to expand scope.** Present the delta between the literal request and the finished-product version explicitly, per CLAUDE.md §1.8. The human decides whether to close the gap now or later — never decide silently in either direction.
7. Hand off the settled spec to `sk-feature-design` / `sk-backend` (data/logic), `sk-frontend-ui` (layout/components), or `sk-frontend-ux` (flow/feedback) as appropriate.
