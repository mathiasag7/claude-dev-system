---
name: sk-refactor
description: Evaluate, plan, and execute refactoring, migrations, and technical-debt reduction safely. Use for any change whose primary purpose is improving structure rather than adding behavior, any migration between patterns/abstractions/libraries, any "clean up before adding a feature", any module split/merge/relocation, any change to how data flows, or any task starting from "the code works but it's a mess". Maps to architecture-refactoring-skill.md.
---

## Instructions

This is a launcher. The full process lives in `~/.claude/skills/architecture-refactoring-skill.md` — read that file completely with the Read tool now. Do not paraphrase it from memory.

Hard constraints from the skill:

1. **Begin with the Step 0 block** (WHAT / FROM / TO / BECAUSE / NOT BECAUSE / TRIGGERS). The BECAUSE must be a concrete, measurable consequence — "it's messy" does not qualify. The NOT BECAUSE clause states explicitly what stays broken.
2. **Safety net before touching anything** (Step 2): behavior must be pinned by tests before the refactor begins. Refactoring without a regression safety net is rewriting with hope.
3. **Plan in stages** (Step 3): each stage independently shippable; no big-bang.
4. **Data migrations are explicit** (Step 5) — never an implicit side effect of a code change.
5. **Triage:** renames and local extractions with no external callers are not refactors — just do them. Beware the "just a small cleanup" trap: no refactor is judged by how it starts.
6. In financial contexts, lenses L1 (regression safety) and L2 (data migration) are forced.
7. Per CLAUDE.md §1.7: do not let the refactor's scope expand silently — report discovered scope and wait.
