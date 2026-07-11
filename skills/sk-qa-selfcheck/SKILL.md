---
name: sk-qa-selfcheck
description: Verify implemented work before declaring it done. Use after implementing or modifying any route, view, template, form (especially multi-step), clickable element, demo-fill/seed feature, or shell/layout change — and whenever a task touching one of these is about to be reported as finished. Also use when the human reports a bug found by manually clicking through the app (404 on a button, form showing stale data, demo filling absurd values, button doing nothing): this skill identifies which verification step failed to run. Runs LAST, after sk-backend / sk-frontend-ui / sk-frontend-ux / sk-debugging. NOT for documentation-only changes or refactors already pinned by tests.
---

## Instructions

This is a launcher. The full process lives in `.claude/skills/qa-selfcheck-skill.md` — read that file completely with the Read tool now. Do not paraphrase it from memory.

Hard constraints from the skill:

1. **"It renders" is not "it's done."** Done = a brand-new user with an empty account traverses the modified flow with no error, no confusion, no residual state. Per CLAUDE.md §1.11, reporting done without the Step 6 verification block is an unlabeled partial answer.
2. **Begin with the Step 0 impact surface block** (ROUTES / FORMS / CLICKABLES / DATA ASSUMED). Every entry in DATA ASSUMED must be guaranteed (get_or_create, defaults, creation signal) or handled (explicit empty state) — never left implicit.
3. **Step 1 — the fresh-user pass is non-negotiable:** exercise the flow as a freshly created, empty account — never only the data-rich dev account. Encode it as the `NewUserSmokeTest` so it replays on every change. A failing route is fixed in the view, never hidden in the exclusion set.
4. **Step 2 — form lifecycle invariants:** create-mode reset after a save, edit ≠ create, dual back semantics (header = exit flow, footer = previous step), draft persistence for ≥3-step or app-exiting flows, per-step validation.
5. **Step 3 — demo/seed integrity:** every demo value drawn from a typed, domain-plausible pool (real brands, coherent models, valid years, local plate/phone formats). One absurd value = broken feature, not a detail.
6. **Steps 4–5:** every touched clickable has a real handler, an existing target, and visible feedback; empty states fit the mobile viewport; UI copy language is uniform (French), shell deviations fixed in the shell.
7. **End with the Step 6 verification report block**, filled honestly. What cannot be automated is handed to the human as a short, precise list — never "test everything".
8. **Feedback loop:** any bug the human finds by clicking is logged in the skill's Lessons Learned with the step that should have caught it (also triggers `sk-debugging` for the fix itself, per CLAUDE.md §1.7).
