# CLAUDE.md

This file defines how Claude Code works on this project. Read it completely at the start of every session. It is the operating contract — not optional context.

Skill activation and the PROJECT.md gate are enforced mechanically by hooks (see Part 3). This file contains only what requires judgment.

---

## PART 1 — UNIVERSAL RULES
### These rules apply on every project, without exception.

---

### 1.1 — The Code Is the Truth: Read Before You Propose or Answer

Before proposing anything — a solution, a design, a fix, a refactor — read the relevant existing code. Before answering any question about the current state of the codebase ("does X exist?", "how does Y work?", "what would break?") — search and read first. Do not answer from memory of what the code "probably" looks like.

**A proposal or answer made without reading the existing code is a guess. Label it as such or don't make it.** If you cannot locate the relevant code, say so and ask — do not assume it doesn't exist.

---

### 1.2 — Skills Are Mandatory When Matched

Skills live in `.claude/skills/`. A `UserPromptSubmit` hook matches each task to its skill and injects the activation instruction with the prompt. When the hook fires: **read the skill file with the Read tool before doing any work — do not paraphrase it from memory.** If you judge the match is wrong, state why in one sentence, then proceed. Never silently ignore an injected activation.

If a task clearly matches a skill and the hook missed it (new phrasing, indirect request), activate the skill anyway. The hook is a floor, not a ceiling.

---

### 1.3 — Never Reinvent What Already Exists in the Project

Before introducing a new pattern, abstraction, utility, or architectural approach — search the codebase for an existing one. If something similar exists: extend it, don't duplicate it. If you introduce something new anyway: state what exists, why it doesn't cover this case, and why the new approach is justified.

**Undocumented divergence from existing patterns is architectural debt. Document or don't diverge.**

---

### 1.4 — Make Decisions Explicit

Every non-trivial implementation decision must be stated, not implied: what was chosen, what was considered, why this and not that. "This seemed cleaner" is not a justification. A justification is traceable to a constraint, a reference, a project rule, or an explicit requirement.

---

### 1.5 — Incomplete Is Better Than Wrong

If you are uncertain about part of the implementation: say so, implement what you are certain about, and mark the uncertain part with a comment and a question. Do not fill uncertainty with plausible-looking code — it is harder to find than an explicit gap.

---

### 1.6 — Bugs Require Regression Tests

Every bug fix is incomplete without a regression test that fails on the original buggy code, passes after the fix, and is named after the bug. A bug fixed without a regression test will return.

---

### 1.7 — Scope Discipline

Do not expand scope without explicit agreement. If the task turns out to require more than was asked: complete what was asked, report what you discovered, and wait for a decision. Unrequested scope expansion is not helpfulness — it is unreviewed code and unexpected side effects.

---

### 1.8 — No Silent Failures

Never write code where a wrong result is indistinguishable from a correct one. Every `else`/`default` branch is explicitly correct or raises. Exceptions are caught specifically and handled or re-raised — never swallowed. A function that cannot complete its contract raises; it does not silently return `None`, `0`, or a fallback. (Full checklist: backend skill, Step 3.)

---

### 1.9 — State the Assumption, Don't Hide It

When a requirement is ambiguous and a decision must be made to proceed, state the assumption before the code that depends on it:

```
# ASSUMPTION: [what was assumed]
# REASON: [why]
# REVIEW: [what to verify with the team]
```

Hidden assumptions become bugs. Explicit assumptions become decisions.

---

### 1.10 — A Partial Answer Must Be Labeled as Partial

If a task is only partially completed — for any reason — say so before ending the response: what was done, what remains, and why. A response that looks complete but isn't passes review, gets merged, and fails in production. An explicit gap gets caught.

**"I've implemented X. Y and Z remain — I need [clarification / context / agreement to proceed]" is a complete response. Stopping without that statement is not.**

---

## PART 2 — PROJECT CONTEXT

Read `.claude/PROJECT.md` for project-specific context, constraints, domain vocabulary, and forbidden patterns. Its constraints are binding for the entire session. PROJECT.md is the only file that changes between projects; this file never does.

If a significant decision is made during a session, append it to the PROJECT.md Decision Log before the session ends.

---

## PART 3 — ENFORCEMENT (informational)

Two hooks run automatically; their injected blocks are instructions, not suggestions:

- **SessionStart** verifies PROJECT.md is complete. If the PROJECT CONTEXT GATE block appears, run `/sk-onboard` (project-onboarding skill) before any other work.
- **UserPromptSubmit** injects skill activations per task (rule 1.2).

**Context from a previous conversation is not a substitute for reading the current state of the code. The code is the truth. The conversation is history.**
