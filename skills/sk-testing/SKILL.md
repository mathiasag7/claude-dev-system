---
name: sk-testing
description: Design and write tests that specify behavior, survive refactoring, and permanently lock bug fixes. Use before implementing any feature containing business logic, before fixing any bug, when a test breaks after a behavior-preserving refactor, when the same bug appears twice, when the suite is slow enough that developers skip it, or when "it works" means "tested manually".
---

## Instructions

This is a launcher. The full process lives in `.claude/skills/testing-skill.md` — read that file completely with the Read tool now. Do not paraphrase it from memory.

Hard constraints from the skill:

1. **Begin with the Step 0 behavior specification** (GIVEN / WHEN / THEN / NOT) in plain language before any test code. The NOT clause is non-optional for any operation with side effects.
2. **Specify behavior, not implementation** (Steps 0, 3): a test that breaks on a rename is a liability. Tests must survive a complete internal rewrite of what they cover.
3. **Regression tests lock fixes** (Step 4): fails on the buggy code, passes after the fix, named after the bug. Per CLAUDE.md §1.6.
4. **Concurrency and idempotency are core, not optional:** in any financial or batch context, lenses L1 (business logic) and L3 (concurrency/idempotency) are forced — "what happens if this runs twice" and "what happens if two requests arrive simultaneously" must be covered.
5. **Triage:** skip only trivial getters/setters and pure configuration. The signal rule: if a test's failure would tell you nothing useful, it should not exist.
6. Tests must be isolated from each other (Step 5) and the suite must stay runnable (Step 6) — a suite developers skip protects nothing.
