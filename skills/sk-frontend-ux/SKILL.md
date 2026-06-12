---
name: sk-frontend-ux
description: Design user flows, forms, and interaction sequences that complete tasks and prevent errors. Use when designing any new user flow, adding a form with more than two fields, implementing an action with irreversible or significant consequences, when a flow has no defined recovery path for failure, when users need multiple steps for what should take one, or when a spec describes what the system does instead of what the user achieves.
---

## Instructions

This is a launcher. The full process lives in `.claude/skills/frontend-ux-skill.md` — read that file completely with the Read tool now. Do not paraphrase it from memory.

Hard constraints from the skill:

1. **Begin with the Step 0 task definition** (USER GOAL / START STATE / END STATE / FAILURE MODES / USER TYPE), written from the user's perspective, not the system's. If FAILURE MODES is empty — stop; name them before designing the happy path.
2. **Map the full flow first** (Step 1): every decision point has both branches; every error state has a recovery path; every async operation has a waiting state. Run the dead-end audit.
3. **Count and challenge every step** (Step 2): never ask for information the system already has; the user-facing step count reflects the user's mental model, not the system's processing.
4. **Prevention before handling** (Step 3): constrain inputs, guide inline, validate progressively. Every error message answers: what happened, why, what do I do.
5. **Feedback inventory** (Step 4): the silence rule — more than 1 second with no visible change is a broken interface. Success is shown only after server confirmation.
6. **Output Format items 3, 5, and 6 (flow map, error prevention map, feedback inventory) may not be skipped.**
7. **Escalation rule:** an undocumented decision point discovered mid-implementation is an undesigned failure mode — stop and surface it.
