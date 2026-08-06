---
name: sk-backend
description: Implement backend logic with rigorous attention to robustness, error visibility, and decoupling. Use when adding or modifying a business rule, calculation, or classification; implementing a state transition (status change, approval, cancellation); writing code that calls an external system (DB, API, queue, file system, email); adding a batch job, scheduled task, or worker; or designing an API endpoint or service method.
---

## Instructions

This is a launcher. The full process lives in `~/.claude/skills/backend-skill.md` — read that file completely with the Read tool now. Do not paraphrase it from memory.

Hard constraints from the skill:

1. **Begin with the Step 0 operation block** (OPERATION / INPUT / OUTPUT / FAILURE / SIDE EFFECTS). If FAILURE or SIDE EFFECTS would be empty for a non-trivial operation — stop and investigate before implementing.
2. **Classify the operation** (Step 1): shared-state mutation, calculated result, status transition, external dependency, reversibility, batch/scheduled — each "yes" routes to a mandatory step (concurrency, silent-failure audit, state machine, dependency isolation, reversal design, idempotency).
3. **Business logic must not depend on infrastructure** (Step 2): if a rule can't be tested without a database, framework, or HTTP call, it's in the wrong place.
4. **Silent-failure audit is non-negotiable** (Step 3): every path produces an explicit result or raises; no polite defaults; per CLAUDE.md §1.8.
5. **Triage fast-exit** applies only to pure isolated reads and config/copy changes. **Escalation rule:** if the operation mutates more state or calls more dependencies than expected — stop and run the full process.
6. Activate the quality lenses (testability / auditability / performance / security) that PROJECT.md's Active Quality Lenses prescribe.
