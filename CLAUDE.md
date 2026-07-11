@RTK.md
> **Project context loaded automatically:**
> @.claude/PROJECT.md

---

# CLAUDE.md

This file defines how Claude Code works on this project. Read it completely at the start of every session. It is not optional context — it is the operating contract for this project.

---

## PART 1 — UNIVERSAL RULES
### These rules apply on every project, without exception. They do not change.

---

### 1.1 — Read Before You Propose

Before proposing anything — a solution, a design, a fix, a refactor — read the relevant existing code.

- Locate the files involved. Read them.
- Understand the existing pattern before suggesting a new one.
- If you cannot locate the relevant code, say so and ask — do not assume it doesn't exist.

**A proposal made without reading the existing code is a guess. Label it as such or don't make it.**

---

### 1.2 — Investigate Before You Answer

If the question involves the current state of the codebase — what exists, how something works, where something is defined — search and read first. Do not answer from memory of what the code "probably" looks like.

This applies to:
- "Does X already exist in the project?"
- "How does the current Y work?"
- "Where is Z defined?"
- "What would break if I changed W?"

The answer to these questions is in the code, not in memory.

---

### 1.3 — Activate Skills for the Right Work

The following skills are available in `.claude/skills/`. Each defines a process, anti-patterns, and quality criteria for a specific type of work. Read and apply the relevant skill before starting any non-trivial task.

| Task type | Skill to activate |
|---|---|
| **Starting a new project or PROJECT.md is empty** | `project-onboarding-skill.md` |
| **Any field, screen, form, or data change a real user will see** | `product-thinking-skill.md` — **run this FIRST, before the skill below** |
| Designing a new feature | `feature-design-skill.md` |
| Implementing backend logic, API, batch job, state transition | `backend-skill.md` |
| **Designing what a screen looks like (mockup, maquette, visual redesign, design system, art direction)** | `visual-design-skill.md` — **run BEFORE `frontend-ui-skill.md`** |
| Building or modifying UI components, screens, design system | `frontend-ui-skill.md` |
| Designing or reviewing a user flow, form, or interaction sequence | `frontend-ux-skill.md` |
| Auditing or remediating a messy/inconsistent existing design | `design-audit-skill.md` |
| Writing, reviewing, or fixing tests | `testing-skill.md` |
| Diagnosing or fixing a bug | `debugging-skill.md` |
| Refactoring, migrating, or reducing technical debt | `architecture-refactoring-skill.md` |
| **Verifying implemented work before declaring it done (routes, forms, demo data, fresh-user path)** | `qa-selfcheck-skill.md` — **run LAST, before any "done"** |
| **Closing a session that modified code (lesson capture, decision log, trigger tuning)** | `retro-skill.md` — **run at session end; enforced by the Stop-hook retro gate** |

**Skill activation is not optional.** If a task matches a skill trigger — activate it. Do not paraphrase the skill from memory. Read it.

**On `product-thinking-skill.md` specifically:** it has no fast-exit for triviality. A single field, a single new enum value, a single UI element being asked for is exactly the size of change where product consequences are most often missed. "This is too small to need a skill" is the instinct this skill exists to override — treat that instinct itself as the trigger to activate it.

**On `visual-design-skill.md` specifically:** it runs BEFORE `frontend-ui-skill.md`, not instead of it. `visual-design` decides what a screen looks like and keeps it consistent across screens (via the persistent design memory in `.claude/design/`); `frontend-ui` implements the result in code. Designing a screen's visuals directly in code, skipping the design memory, is how a header present on one screen silently disappears on the next.

---

### 1.4 — Never Reinvent What Already Exists in the Project

Before introducing a new pattern, abstraction, utility function, or architectural approach — verify it doesn't already exist.

- Search the codebase for similar implementations.
- If something similar exists: extend it, don't duplicate it.
- If you choose to introduce something new: state explicitly what already exists, why it doesn't cover this case, and why the new approach is justified.

**Undocumented divergence from existing patterns is architectural debt. Document or don't diverge.**

---

### 1.5 — Make Decisions Explicit

Every non-trivial implementation decision must be stated, not implied.

When the decision has alternatives, document:
- What was chosen
- What was considered
- Why this, not that

"This seemed cleaner" is not a justification. A justification is traceable to a constraint, a reference, a project rule, or an explicit requirement.

---

### 1.6 — Incomplete is Better Than Wrong

If you are uncertain about a part of the implementation:
- Say so explicitly.
- Implement what you are certain about.
- Mark what remains uncertain with a comment and a question.

Do not fill uncertainty with plausible-looking code. Plausible-looking wrong code is harder to find than an explicit gap.

---

### 1.7 — Bugs Require Regression Tests

Every bug fix is incomplete without a regression test that:
- Fails on the original buggy code
- Passes after the fix
- Is named after the bug, not the fix

A bug fixed without a regression test will return. This is not a prediction — it is a pattern.

---

### 1.8 — Scope Discipline

Do not expand scope without explicit agreement.

If during implementation you discover that the task requires more than what was asked:
- Complete what was asked.
- Report what you discovered.
- Wait for a decision before expanding.

Unrequested scope expansion is not helpfulness — it is a source of unreviewed code and unexpected side effects.

---

### 1.9 — No Silent Failures

Never write code where a wrong result is indistinguishable from a correct one.

- Every `else` and `default` branch is either explicitly correct or raises an explicit error.
- Exceptions are caught specifically, logged, and re-raised or handled — never swallowed.
- A function that cannot complete its contract raises an error. It does not return `None`, `0`, or a fallback silently.

---

### 1.10 — State the Assumption, Don't Hide It

When a requirement is ambiguous and a decision must be made to proceed:
- State the assumption explicitly before the code that depends on it.
- Flag it for review.

Format:
```
# ASSUMPTION: [what was assumed]
# REASON: [why this assumption was made]
# REVIEW: [what to verify with the team]
```

Hidden assumptions become bugs. Explicit assumptions become decisions.

---

### 1.11 — A Partial Answer Must Be Labeled as Partial

If a task is only partially completed — for any reason — say so explicitly before ending the response.

- State what was done.
- State what remains.
- State why it wasn't completed (uncertainty, missing context, scope decision).

A response that looks complete but isn't is worse than an explicit gap. It passes review, gets merged, and fails in production. An explicit gap gets caught.

**"I've implemented X. Y and Z remain — I need [clarification / more context / explicit agreement to proceed]" is a complete response. Stopping without that statement is not.**

---

### 1.12 — All Code Is in English

Every element that belongs to the code is named in English. This includes, without exception:

- Variable names
- Function and method names
- Class names
- Model names
- File names
- Component names
- Technical field names
- API names, routes, DTOs, serializers, and similar constructs

French — or any other language — is never used to name a code element, unless strictly imposed by an external dependency (e.g. a third-party API field, a legacy database column, a regulatory form label mandated verbatim). In that case, name the wrapper or adapter around it in English, and mention the constraint briefly at the point it's used — no formal write-up is required.

**This rule governs naming, not content.** Domain Vocabulary in `PROJECT.md` §4 stays in whatever language the business uses (French terms like "Type de trajet" are correct there — that section documents meaning for humans, not code). The translation happens at the boundary: `trip_type` / `TripType` in the code, "Type de trajet" in PROJECT.md and in the UI copy shown to French-speaking users. User-facing strings (labels, error messages, UI copy) are not code elements under this rule — they follow the project's localization strategy, not this one.

**A French variable, class, or endpoint name is not a style preference — it is a rule violation**, flagged the same as any other item in this file.

---

## PART 2 — PROJECT CONTEXT

Read `.claude/PROJECT.md` for the project-specific context, constraints, domain vocabulary, and forbidden patterns.

PROJECT.md is the only file that changes between projects. This file never changes.

---

## PART 3 — SESSION STARTUP CHECKLIST
### Run this mentally at the start of every session.

- [ ] Have I read `.claude/PROJECT.md` completely?
- [ ] Do I know the current stack, constraints, and forbidden patterns for this project?
- [ ] Is there a skill I should activate for the first task of this session?
- [ ] If continuing from a previous session — have I re-read the relevant code, not just the conversation?

**Context from a previous conversation is not a substitute for reading the current state of the code. The code is the truth. The conversation is history.**

---

## PART 4 — PROJECT INITIALIZATION

If `.claude/PROJECT.md` is empty, missing, or has unfilled placeholder sections — **stop everything and run `project-onboarding-skill.md` before any other work.**

No skill in this system functions correctly without a complete PROJECT.md. Running development tasks without it is running blind.

**The onboarding skill runs once per project. After that, PROJECT.md is the context. Update it — don't replace it.**
