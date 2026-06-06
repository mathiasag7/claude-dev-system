---
name: debugging-engineer
version: 1.0.0
description: Diagnose and eliminate bugs through systematic reproduction, root cause analysis, and permanent regression tests. Prevents symptom-fixing, partial solutions, and recurring bugs. Forces the distinction between surface bug and systemic cause before any code is written.
category: engineering
tags: [debugging, root-cause, regression, reproduction, diagnosis, investigation, silent-failures]
forced_lenses_in_financial_context: [L2-systemic-impact]
---

# Debugging Engineer Skill

Use this skill BEFORE writing any fix — for any bug, any error, any unexpected behavior. Framework-agnostic. The process is the same whether the bug is in Python, TypeScript, or SQL.

**A fix written before the bug is reproduced is a guess. A fix written before the root cause is understood is a patch over a symptom. Neither is a fix.**

This skill has two layers:
- **The Core Process** (Steps 0–6): apply to every bug, every time.
- **Quality Lenses** (L1–L3): activate based on bug severity and system context.

---

## When to Trigger

- Any unexpected behavior in production or staging
- Any test failure that wasn't anticipated
- Any "it works on my machine" situation
- Any bug that has appeared before — especially one that was "already fixed"
- Any situation where the fix seems obvious before the cause is understood
- Any error that is caught and swallowed somewhere in the system

---

## Triage — Fast Exit

- **Typo, wrong variable name, copy-paste error — cause is visible in the code without investigation?** → Fix directly, write regression test, done.
- **Everything else** → Run the full process. The fix that seems obvious before investigation is the fix most likely to be wrong.

**Escalation rule:** If during investigation you discover the bug is caused by a design flaw rather than an implementation error — stop. A design flaw fixed at the implementation level will return. Escalate to an architecture discussion before proceeding.

---

## Process

### Step 0 — Write the Bug Statement

Before touching any code, write the bug statement precisely:

> "Given [system state], when [action or trigger], then [what actually happens] — but expected [what should happen]."

**Verification — present before proceeding:**

```
OBSERVED:     "[what actually happens — specific, not 'it doesn't work']"
EXPECTED:     "[what should happen — specific, traceable to a requirement or contract]"
TRIGGER:      "[what action, input, or condition causes the bug]"
FREQUENCY:    "[always / intermittent / under specific conditions]"
FIRST SEEN:   "[when — in production, in testing, after which change]"
SCOPE:        "[which users, accounts, records, environments are affected]"
```

**Why this matters:** A bug described as "the balance is wrong" is not a bug statement. "Given an account with two disbursements in the same period, when the monthly fee runs, then the fee is calculated twice — but expected once per period" is a bug statement. The difference is the difference between finding the cause and guessing at it.

If TRIGGER is "unknown" — the first task is to find the trigger. Do not proceed to investigation until you can produce the bug on demand.

---

### Step 1 — Reproduce Before Investigating

**The reproduction rule: if you cannot reproduce the bug, you cannot fix it.**

A fix applied to a bug you cannot reproduce is a change applied to a system you do not understand. You may get lucky. You will not know if you did.

**Reproduction protocol:**

1. **Find the minimal reproduction case.** The smallest input, the simplest state, the fewest steps that reliably produce the bug. Strip away everything that isn't required.
2. **Write it as a failing test before fixing anything.** Run it. Watch it fail. This is the proof that the test catches the bug.
3. **Verify the reproduction is stable.** Run it three times. If it fails intermittently — the bug is timing- or state-dependent. That changes the investigation entirely.

**Minimal reproduction format:**
```
SETUP:    "[minimum state required — no more than what is needed]"
ACTION:   "[exactly what triggers the bug]"
RESULT:   "[the wrong output or error]"
EXPECTED: "[the correct output]"
```

**Anti-pattern: Fixing without reproducing**
Developer reads the bug report, finds "suspicious code," changes it, deploys. The bug disappears. Two weeks later it returns — because the suspicious code wasn't the cause, and the real cause was never found.

**Anti-pattern: Reproducing in production**
Debugging by reading production logs and making changes live. Acceptable as a last resort. Not acceptable as a first step.

---

### Step 2 — Trace to the Root Cause

A bug has a location (where it manifests) and a cause (where it originates). These are rarely the same place. Fixing the location without finding the cause is treating a symptom.

**The Five Whys — mandatory for any non-trivial bug:**

Ask "why" until the answer is either:
- A design decision that needs to be revisited, or
- An implementation error at its actual origin

```
SYMPTOM:  "The monthly fee ran twice for account X"
Why?      "The idempotency check didn't prevent the second run"
Why?      "The idempotency check looks at a flag on the account record"
Why?      "The flag is set after the fee is created, not before"
Why?      "The original implementation assumed the job would never run concurrently"
Why?      "There was no concurrency requirement documented when the job was written"
ROOT CAUSE: "The idempotency key is set after the side effect, not before — race condition under concurrent execution"
```

Stopping at "the idempotency check didn't prevent the second run" produces a fix that strengthens the wrong part of the system.

**Root cause categories — classify before fixing:**

| Category | Description | Fix approach |
|---|---|---|
| **Implementation error** | Code doesn't do what it was designed to do | Fix the code |
| **Design gap** | Code does what it was designed to do, but the design was incomplete | Fix the design, then the code |
| **Missing guard** | A case that should have been handled wasn't considered | Add explicit handling |
| **Assumption violation** | Code assumed a condition that isn't always true | Remove the assumption, add a check |
| **Concurrency failure** | Correct under sequential execution, wrong under concurrent execution | Add locking or idempotency |
| **Integration contract breach** | External system behaved in an undocumented way | Add defensive handling at the boundary |
| **Data corruption** | Historical data doesn't match current model expectations | Fix data + add validation to prevent recurrence |

**The design gap test:** If the fix requires adding code that handles a scenario the original design didn't consider — it's a design gap, not just a bug. Document the gap in PROJECT.md before closing the ticket.

---

### Step 3 — Assess Blast Radius Before Fixing

Before writing the fix, answer:

```
AFFECTED RECORDS:   "[how many records in production are in the wrong state]"
AFFECTED USERS:     "[who has been impacted]"
SILENT OR VISIBLE:  "[did users see an error, or did they get a wrong result silently]"
DATA CORRECTION:    "[does historical data need to be corrected, or only future behavior]"
SIDE EFFECTS FIXED: "[does the fix automatically correct existing bad state, or only prevent new bad state]"
REGRESSION RISK:    "[what other behavior could break if this is fixed]"
```

**The silent corruption test:** A bug that produces a wrong result silently (no error, no exception, just wrong data) is worse than one that throws. Silent bugs require a data audit. Determine whether records created during the bug's active period are in a consistent state.

**Anti-pattern: Fix the code, ignore the data**
A fee calculation bug is fixed. The code now runs correctly. But 400 accounts had incorrect fees calculated during the three weeks the bug was active. The fix closed the code gap but left a data gap. Both must be addressed.

---

### Step 4 — Write the Fix

Now, and only now, write the fix.

**Fix discipline:**

- **Fix exactly the root cause. Nothing more.**  Do not refactor adjacent code, improve unrelated logic, or "clean up while you're in there." Each change that isn't the fix is a change that wasn't tested and wasn't reviewed.
- **The fix must be the minimum change that eliminates the root cause.**  If the fix requires changing 10 files — question whether you've correctly identified the root cause. Root causes are usually narrow. Fixes that span many files are usually patching symptoms at multiple locations.
- **State the assumption the original code made that was wrong.**  Every bug is a violated assumption. Name it explicitly in a comment.

**Fix documentation format (inline comment):**
```python
# BUG FIX: [date] — [brief description of what was wrong]
# ROOT CAUSE: [the assumption that was violated]
# See regression test: test_[bug_name]
```

---

### Step 5 — Write the Regression Test

The regression test is not optional. It is part of the fix. A bug fixed without a regression test is a bug that will return.

**Regression test protocol:**

1. The test must **fail on the original buggy code** — verify this before merging.
2. The test must **pass after the fix** — verify this too.
3. The test is named after the bug, not the fix.
4. The test uses the **minimal reproduction case** from Step 1 — not a complex setup.
5. The test must remain in the codebase permanently. It is not a temporary diagnostic.

**Naming convention:**
```python
# Bad — describes the fix
def test_idempotency_check_runs_before_fee_creation():

# Good — describes the bug that was eliminated
def test_monthly_fee_not_duplicated_when_job_runs_twice_same_period():
def test_fee_not_calculated_for_closed_account():
def test_balance_not_negative_after_concurrent_withdrawals():
```

Six months later, when this test fails, the name tells the next developer exactly what scenario was broken — without reading any history.

---

### Step 6 — Document and Close

Before closing the bug:

**Decision log entry (add to PROJECT.md):**
```
[DATE] — BUG: [brief name]
  Symptom:    [what was observed]
  Root cause: [the actual cause — design gap or implementation error]
  Fix:        [what was changed]
  Data impact:[whether historical data was corrected]
  Prevention: [what was added to prevent recurrence — test, validation, constraint]
  Category:   [implementation error / design gap / concurrency failure / etc.]
```

This entry is not bureaucracy. It is the difference between a bug that returns in six months and one that doesn't. The category field is especially important — three bugs in the same category on the same project means a systemic pattern, not isolated incidents.

---

## Quality Lenses

### L1 — Intermittent Bug Lens

> Activate when: the bug doesn't reproduce consistently, or only appears under load or in production.

**The principle:** Intermittent bugs are not random. They are deterministic bugs that require specific conditions — timing, data state, concurrency, load — that aren't always present. "It only happens sometimes" means "the triggering conditions aren't fully understood."

**Investigation techniques:**

- **Add logging before the condition, not at the error.** The log entry you need is the one that records state before the bug — not the exception that fires after.
- **Identify what's different when it fails vs. when it succeeds.** Time of day? Load level? Specific user? Specific data combination? Concurrent operations? The difference IS the trigger.
- **Look for shared mutable state.** Intermittent bugs are disproportionately caused by race conditions on shared state — a cache that's updated by two processes, a balance read before a lock is acquired, a flag set too late.
- **Check for time-dependent behavior.** Bugs that appear "sometimes" are often bugs that appear always — but only when a specific timing window is hit (a lock expires, a scheduled job runs, a session expires).

**Checklist:**
- [ ] Is the bug reproducible under controlled load? (Run 10 concurrent requests instead of 1)
- [ ] Does the bug occur more frequently at specific times? (Job windows, high traffic periods)
- [ ] Does the bug always affect the same records, or random ones?
- [ ] Is there shared mutable state accessed without locking in the affected code path?
- [ ] Does the bug disappear when a specific service is slowed down? (Reveals race conditions)

---

### L2 — Systemic Impact Lens

> Activate when: the bug affects financial data, audit records, regulatory reporting, or any data that has downstream consequences. Always active in financial/core-banking contexts.

**The principle:** In systems where data integrity matters, a bug has two components: the code defect and the data defect. Fixing the code without auditing the data leaves the system in a state that looks correct and isn't.

**Systemic impact checklist:**

- [ ] How many records were created or modified while the bug was active?
- [ ] Are those records in a state that will produce wrong results going forward?
- [ ] Does the fix automatically correct existing bad records, or only prevent new bad records?
- [ ] If data correction is needed — does it need its own regression test?
- [ ] Is there a regulatory or audit obligation to disclose the impact?
- [ ] Does the bug affect any report, balance, or aggregate that has already been sent externally?

**Data correction protocol:**
```
AUDIT QUERY:    "[SQL or equivalent to identify all affected records]"
CORRECTION:     "[the operation needed to restore correct state]"
VERIFICATION:   "[how to confirm the correction worked]"
IRREVERSIBLE?:  "[if any data was irrecoverably lost — document exactly what and why]"
```

Never run a data correction without:
1. A backup or snapshot of the affected records before correction
2. A dry-run that shows what will change without changing it
3. A verification query that confirms the expected post-correction state

---

### L3 — Recurring Bug Lens

> Activate when: this bug has appeared before, or when the same type of bug appears more than once in the codebase.

**The principle:** A bug that appears twice is not two bugs. It is evidence of a systemic gap — a missing validation, an untested assumption, an architectural pattern that doesn't protect against this class of failure. Fix the pattern, not just the instance.

**Recurrence analysis:**

```
PREVIOUS OCCURRENCE: "[when was this or a similar bug seen before]"
PREVIOUS FIX:        "[what was done then]"
WHY IT RETURNED:     "[what the previous fix missed]"
PATTERN:             "[what class of bug this belongs to]"
SYSTEMIC FIX:        "[what change to the architecture, validation, or test coverage would prevent this class of bug]"
```

**Pattern catalog — add to PROJECT.md when identified:**

| Pattern | Description | Systemic fix |
|---|---|---|
| Silent default | Wrong fallback returned on unknown input instead of error | Audit all `else`/`default` branches in business logic |
| Late idempotency key | Idempotency check set after side effect, not before | Move guard to top of operation, before any mutation |
| Untested enum | New enum value added without updating all switch/match logic | Add enum exhaustion test for every enum in business logic |
| Trust without validation | Data from external source used without entry validation | Add boundary validation at every external input point |
| Concurrency assumption | Operation assumed to run sequentially, runs concurrently | Audit all read-modify-write operations for locking |

---

## Anti-Patterns (Recurring Across Projects)

**Anti-pattern: The obvious fix**
Bug is reported. Developer recognizes the area of code. The fix seems clear. Code is changed without reproducing the bug, without verifying the root cause, without a regression test.
Result: The bug returns. Or the fix breaks something else. Or the real cause is elsewhere and the visible bug disappears while a silent bug remains.
Fix: Reproduce first. Always. Even when the fix is obvious.

**Anti-pattern: The location fix**
The bug manifests in function X. Function X is fixed. But the root cause is in function Y, which calls X with wrong data. The fix adds defensive code in X that papers over Y's error.
Result: Y continues to produce wrong data. Every consumer of Y has to defend against it. The system becomes a web of defensive patches over a bad source.
Fix: Trace to the origin. Fix at the source, not at the manifestation.

**Anti-pattern: The speculative refactor**
Bug is found. Developer "fixes" the bug AND refactors the surrounding code "while in the area." The refactor is unreviewed, untested, and not related to the bug.
Result: The bug fix is correct. The refactor introduces a new bug. No one connects them for two weeks.
Fix: Fix the bug. Document the refactor as a separate task. Never mix.

**Anti-pattern: The undocumented data patch**
Data is corrupted by a bug. A one-off SQL script corrects it. The script is run, it works, it's never saved. Three months later, the same bug recurs (or a similar one), and no one remembers the correction script existed or what it did.
Fix: Every data correction is a documented, versioned, tested operation — not a disposable script.

**Anti-pattern: Closing without regression test**
Bug is fixed and verified manually. Ticket is closed. No regression test is written.
Result: The same bug is fixed again six months later by someone who doesn't know it was fixed before.
Fix: The regression test is mandatory before the ticket is closed. No exceptions.

---

## Principles (Technology-Agnostic)

1. **Reproduce before investigating. Investigate before fixing. Fix before closing.** These steps are not optional and cannot be reordered.
2. **The fix location and the root cause are rarely the same place.** Fixing where the bug manifests is treating a symptom.
3. **A bug that cannot be reproduced cannot be fixed.** It can only be guessed at.
4. **Silent bugs are worse than visible ones.** A wrong result that looks correct destroys trust in the entire system.
5. **Every bug is a violated assumption. Name the assumption before writing the fix.**
6. **The regression test is part of the fix, not a post-fix optional.** A bug without a regression test will return.
7. **Fix exactly the root cause. Nothing more.** Adjacent improvements are separate tasks.
8. **A recurring bug is evidence of a systemic gap, not bad luck.** Fix the pattern.
9. **Data bugs have two components: the code defect and the data defect.** Both must be addressed.
10. **The bug's name in the regression test is permanent documentation.** Name it after the bug, not the fix.

---

## Questions to Ask Before Closing a Bug

**Core (always):**
- Can I reproduce this bug with a test that fails before the fix and passes after?
- Do I know the root cause — not just the location where the bug manifests?
- Did I fix exactly the root cause, or did I add defensive code around a symptom?
- Is there a regression test that will catch this if it returns?
- Is the fix documented in the code with a reference to the regression test?
- Does historical data need to be corrected?

**Intermittent (L1):**
- Have I identified the specific conditions that trigger the bug — not just "it happens sometimes"?
- Is there shared mutable state in the affected code path?

**Systemic Impact (L2):**
- How many records are in an incorrect state due to this bug?
- Has a data correction been run and verified?

**Recurring (L3):**
- Has this bug or a similar one appeared before?
- What systemic change would prevent this class of bug from recurring?

---

## Output Format

When this skill is invoked, produce:

1. **Bug statement** (Step 0 verification block — observed, expected, trigger, frequency, scope)
2. **Minimal reproduction** (Step 1 — setup, action, result, expected — written as a failing test)
3. **Root cause analysis** (Step 2 — Five Whys trace, root cause category)
4. **Blast radius assessment** (Step 3 — affected records, silent vs visible, data correction needed)
5. **Fix description** (Step 4 — what changes, what assumption is corrected, what does NOT change)
6. **Regression test** (Step 5 — test name, minimal setup, assertion, verification it fails before fix)
7. **Decision log entry** (Step 6 — for PROJECT.md)
8. **Lens findings** (if applicable — intermittent conditions, data correction protocol, systemic pattern)

Do NOT skip items 2, 3, or 6. A fix without a reproduction, a root cause, and a regression test is not a fix.

---

## Lessons Learned

> Add entries here when a new anti-pattern or root cause category is discovered on a project.
> Format: [DATE] — [PROJECT CONTEXT] — [what was learned]
> This section grows over time. It is the memory of bugs that must not return.

```
[DATE] — [project] — [lesson]
```
