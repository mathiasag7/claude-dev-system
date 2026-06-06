---
name: architecture-refactoring-engineer
version: 1.0.0
description: Evaluate, plan, and execute architectural changes and refactoring safely. Prevents scope explosion, regression-blind migrations, and debt that compounds faster after the refactor than before. Forces explicit distinction between debt that blocks vs. debt that can wait.
category: engineering
tags: [architecture, refactoring, technical-debt, migration, coupling, design, restructuring]
forced_lenses_in_financial_context: [L1-regression-safety, L2-data-migration]
---

# Architecture & Refactoring Engineer Skill

Use this skill BEFORE starting any refactoring effort, architectural change, or technical debt reduction — regardless of size. Framework-agnostic.

**Refactoring without a regression safety net is not refactoring — it is rewriting with hope. An architectural change that wasn't justified before it started cannot be evaluated after it finishes. The cost of a bad refactor is not the time spent — it is the new bugs introduced and the original debt left unchanged underneath.**

This skill has two layers:
- **The Core Process** (Steps 0–6): apply to every refactor, every time.
- **Quality Lenses** (L1–L3): activate based on scope and risk.

---

## When to Trigger

- Any change whose primary purpose is improving structure rather than adding behavior
- Any migration from one pattern, abstraction, or library to another
- Any decision to "clean up" code before adding a feature
- Any discovery that a module needs to be split, merged, or relocated
- Any proposal to change how data flows through the system
- Any situation where "the code works but it's a mess" is the starting point

---

## Triage — Fast Exit

- **Rename a variable, extract a function with no callers outside the module, fix a comment?** → Do it. Not a refactor.
- **Everything else** → Run the process.

**The "just a small cleanup" trap:** The most dangerous refactors start with "I'll just quickly..." No refactor is judged by how it starts. It is judged by what it breaks and whether that was caught before production.

---

## Process

### Step 0 — Name What You're Changing and Why

Before writing a single line, write:

> "I am changing [what] from [current state] to [target state] because [specific problem this solves]."

The "because" must be specific. Not "it's messy" — but what is the measurable consequence of the current state that the refactor eliminates.

**Verification — present before proceeding:**

```
WHAT:       "[what is being changed — module, pattern, abstraction, data flow]"
FROM:       "[current state — specific, not 'bad']"
TO:         "[target state — specific, not 'better']"
BECAUSE:    "[the concrete problem this solves — a bug class, a bottleneck, an onboarding cost]"
NOT BECAUSE:"[what this refactor does NOT solve — be explicit about what stays broken]"
TRIGGERS:   "[what made this necessary now — new feature, repeated bug, team growth]"
```

If BECAUSE is "it will be cleaner" — stop. Refactors justified by aesthetics are the most likely to introduce bugs for no measurable gain. Aesthetics is a consequence of solving a real problem. It is not the justification.

---

### Step 1 — Classify the Debt

Not all technical debt is equal. Debt that blocks is different from debt that is inconvenient. Treating them the same wastes time on the wrong problems.

**Debt classification:**

| Class | Description | Priority |
|---|---|---|
| **Blocking debt** | Prevents a required feature from being built correctly | Fix before the feature |
| **Multiplication debt** | Every new feature makes this worse — the problem compounds | Fix soon, schedule explicitly |
| **Stability debt** | Causes recurring bugs or silent failures in production | Fix based on incident frequency |
| **Velocity debt** | Slows development but doesn't cause bugs | Fix when convenient, not urgently |
| **Aesthetic debt** | Code is hard to read but works correctly and doesn't slow meaningful work | Acceptable to leave indefinitely |

**The compounding test:** Ask — "If I add five more features on top of this without changing it, will the debt double or stay the same?" If it doubles — it's multiplication debt. It must be scheduled explicitly, not added to a someday list.

**Rule:** Only blocking debt and multiplication debt justify interrupting feature work. The rest must be scheduled, not improvised.

---

### Step 2 — Define the Safety Net Before Touching Anything

Before the first change, the safety net must exist. If it doesn't, building it is the first task of the refactor.

**Safety net checklist:**

- [ ] Is there a test suite that covers the behavior being refactored — not just the happy path?
- [ ] Do those tests test behavior (input → output), not implementation (which functions are called)?
- [ ] Can the full test suite run in under 5 minutes?
- [ ] Are the tests actually green right now, before any change?

If the answer to any of these is no — **stop**. Build the test coverage first. A refactor without a safety net is a bet, not an engineering decision.

**The characterization test:** When refactoring code that has no tests, write characterization tests first. These tests don't assert correct behavior — they assert current behavior. Their purpose is to catch any change in behavior during the refactor.

```python
# Characterization test — documents current behavior before refactoring
# NOTE: This test documents current behavior. 
# If this test fails after refactoring — behavior changed unexpectedly.
# Review before concluding the test is wrong.
def test_fee_calculation_current_behavior():
    account = Account(balance=10000, type="standard", rate=0.01)
    result = legacy_calculate_fee(account, date(2024, 10, 1))
    # Record current output — this is what must be preserved
    assert result == Decimal("100.00")
    assert result.account_id == account.id
```

---

### Step 3 — Plan the Migration in Stages

The most dangerous refactor is the one that touches everything at once. Plan the migration as a sequence of small, independently deployable steps. Each step must leave the system in a working state.

**Staging principles:**

1. **New alongside old, then migrate, then remove.** Never replace the old thing in place all at once. Build the new thing, migrate callers one by one, verify at each stage, remove the old thing last.
2. **Each stage is deployable independently.** If a stage can't be deployed without the next stage — the stages are wrong.
3. **Behavior must be identical at every stage.** The refactor is complete when the behavior tests pass at every intermediate stage, not just the final one.
4. **Set an explicit end date for migration.** Open-ended migrations where old and new coexist indefinitely become permanent dual maintenance.

**Migration plan format:**
```
STAGE 1: "[what changes, what is preserved, what tests cover it]"
  Deployable independently? [yes/no]
  Behavior change? [none expected]
  Rollback: "[how to revert this stage alone]"

STAGE 2: "[what changes, what is preserved, what tests cover it]"
  Deployable independently? [yes/no]
  Behavior change? [none expected]
  Rollback: "[how to revert this stage alone]"

[...]

FINAL STAGE: "[removal of old code, cleanup]"
  Condition for proceeding: "[all callers migrated, all tests passing, no old code in use]"
```

**Anti-pattern: The big bang refactor**
All old code is replaced with new code in one commit. The diff is 2000 lines. It's impossible to review. It's impossible to roll back. If it breaks something, the cause is invisible.
Fix: Any refactor that can't be code-reviewed in under an hour needs to be staged.

---

### Step 4 — Track Coupling Before and After

The primary measurable output of a structural refactor is reduced coupling. If the refactor doesn't reduce coupling — it doesn't justify the risk.

**Coupling audit — before starting:**

```
MODULE:           "[name]"
DEPENDS ON:       "[what it calls or imports]"
DEPENDED ON BY:   "[what calls or imports it]"
SHARED STATE:     "[what mutable state it shares with others]"
COUPLING SCORE:   "[total number of external dependencies in + out]"
```

Run the same audit after the refactor is complete. If the coupling score didn't improve — document why. If it got worse — the refactor needs to be reconsidered.

**Coupling reduction targets:**

| Refactor type | Expected coupling reduction |
|---|---|
| Extract module | Incoming dependencies to extracted module decrease |
| Introduce abstraction | Callers depend on interface, not implementation |
| Flatten hierarchy | Removed intermediate layers reduce call depth |
| Split god object | Each resulting object has fewer external dependencies than the original |

---

### Step 5 — Handle Data Migrations Explicitly

Refactors that change data models, field names, or storage patterns are fundamentally different from refactors that only change code. Data is permanent. Code is replaceable.

**Data migration rules:**

- **Schema changes are never "just" schema changes.** Every field rename, type change, or table restructure affects all historical data, all queries, and all code that reads or writes those fields.
- **Never drop data to simplify a migration.** If the new model doesn't need field X, archive it — don't delete it. Data deleted in a migration cannot be recovered.
- **Dual-write during migration.** When migrating from old schema to new schema, write to both simultaneously until all readers are migrated. Then stop writing to old. Then remove old.
- **Test the migration against production data volume.** A migration that runs in 2 seconds on dev data may run for 6 hours on production. Always test with a representative data sample.

**Data migration checklist:**
- [ ] Is a backup available before the migration runs?
- [ ] Has the migration been tested on a production-representative dataset?
- [ ] Is there a rollback plan that doesn't require data restoration from backup?
- [ ] Are all readers of the old schema migrated before the old schema is removed?
- [ ] Are all historical records in a consistent state after migration?

---

### Step 6 — Verify and Document the Outcome

A refactor is complete when behavior is preserved, coupling is reduced, tests pass, and the change is documented.

**Completion checklist:**
- [ ] All behavior tests that existed before the refactor still pass
- [ ] No new behavior was added during the refactor (new behavior = new feature = separate PR)
- [ ] Coupling score improved (or documented reason it didn't)
- [ ] Old code removed — no dead code left "just in case"
- [ ] Decision log entry added to PROJECT.md

**Decision log entry format:**
```
[DATE] — REFACTOR: [name]
  Problem:    [the concrete problem that was solved]
  Approach:   [what changed and how]
  Stages:     [how many stages, key milestones]
  Debt class: [blocking / multiplication / stability / velocity]
  Before:     [coupling score or other measurable baseline]
  After:      [coupling score or other measurable result]
  Remaining:  [what debt was explicitly deferred and why]
```

---

## Quality Lenses

### L1 — Regression Safety Lens

> Activate when: the code being refactored has limited test coverage, or changes behavior that's hard to observe directly. Always active for financial business logic.

**The principle:** The gap between "this refactor is done" and "this refactor is safe" is exactly as wide as the test coverage. Without tests that cover the refactored behavior, there is no way to know if something broke.

**Regression safety protocol:**

- [ ] Write characterization tests for all untested code before refactoring
- [ ] After each stage, run the full test suite — not just the tests for the changed module
- [ ] If a previously passing test fails after a refactor that "shouldn't have changed behavior" — stop immediately. The refactor changed something you didn't intend.
- [ ] Add at least one new test for each behavior that was difficult to test in the old structure but should be testable in the new one

**The "refactor revealed" test:** If the refactor makes a previously-hidden bug visible (a test that was always passing now fails because the bug is now exposed) — stop. Document the bug. Fix it separately. Then continue the refactor.

---

### L2 — Data Migration Safety Lens

> Activate when: the refactor involves schema changes, field renames, data model restructuring, or any change that affects stored data.

**The principle:** Code can be rolled back. Migrated data cannot. Every data migration is permanent. Design for correctness, not convenience.

**Migration safety protocol:**

1. **Volume test first.** Run the migration on a copy of production data. Record the time. If it exceeds acceptable downtime — the migration strategy needs to change (batch migration, background job, lazy migration).
2. **Verify row counts before and after.** The total number of records must be conserved. If rows disappear — the migration has a bug.
3. **Verify key aggregates before and after.** Sum of balances, count of active accounts, total disbursed amount — these must match before and after.
4. **Keep old columns until all code is migrated.** Dropping old columns too early is the most common cause of data migration incidents.

**Lazy migration pattern** (for large tables where downtime is unacceptable):
```python
# Read: if new field exists, use it; otherwise compute from old fields
def get_customer_name(customer):
    if customer.full_name:  # new field
        return customer.full_name
    return f"{customer.first_name} {customer.last_name}"  # old fields

# Write: always write to both during migration period
def update_customer_name(customer, name):
    customer.full_name = name  # new field
    parts = name.split(" ", 1)
    customer.first_name = parts[0]  # old field — keep writing until all code migrated
    customer.last_name = parts[1] if len(parts) > 1 else ""
```

---

### L3 — Team Impact Lens

> Activate when: the refactor affects code that multiple developers work on simultaneously, or when the migration will span more than one sprint.

**The principle:** A long-running refactor that touches shared code creates merge conflicts, coordination overhead, and diverging implementations. The longer the migration, the higher the cost of keeping old and new synchronized.

**Team impact checklist:**

- [ ] Is the migration plan communicated to all developers who work in the affected modules?
- [ ] Is there a clear rule: "new code goes in new structure, old code stays in old structure until migrated"?
- [ ] Is there a defined completion date after which the old structure is removed?
- [ ] Is there a single person responsible for driving the migration to completion?
- [ ] Are there automated checks (linting, CI rules) that prevent new code from using the old structure once migration has started?

**The migration owner rule:** Every refactor that spans more than one sprint needs an owner whose explicit responsibility is to drive it to completion. Ownerless migrations are the migrations that live forever.

---

## Anti-Patterns (Recurring Across Projects)

**Anti-pattern: Refactoring with no tests**
Old code has no tests. Developer refactors it. Something breaks silently. The refactor is deployed. Two weeks later a bug is reported that was introduced by the refactor — but was invisible because there were no tests to catch it.
Fix: Write characterization tests first. Non-negotiable.

**Anti-pattern: The never-ending migration**
New pattern is introduced. Old pattern is "being migrated." Six months later, 40% of code uses the new pattern, 60% uses the old pattern. Both are maintained. New developers don't know which to use.
Fix: Set a completion date. Add a linting rule that prevents new usage of the old pattern. Make the old pattern's removal a tracked deliverable.

**Anti-pattern: The scope-expanding refactor**
Refactor starts on module X. Developer discovers module Y also needs cleanup. And Z. Refactor expands. PR is eventually abandoned because it's too large to review.
Fix: Scope discipline. The refactor covers exactly what was committed to in Step 0. New scope = new task.

**Anti-pattern: Behavior change disguised as refactoring**
"I refactored the fee calculation" — but the refactored version also changes rounding behavior, because the developer thought the old rounding was wrong. The change is unreviewed, undocumented, and breaks downstream reports.
Fix: A refactor must not change behavior. If behavior needs to change — that is a feature or a bug fix. It must be handled separately, with its own review and its own tests.

**Anti-pattern: Coupling transferred, not reduced**
Module X is split into X1 and X2 to reduce its complexity. But X1 and X2 are now tightly coupled to each other — calls go back and forth between them. The coupling wasn't reduced — it was renamed.
Fix: Measure coupling before and after. If the score didn't improve, the split was structural theater.

---

## Principles (Technology-Agnostic)

1. **A refactor that changes behavior is not a refactor. It is a bug or a feature.** Handle it as such.
2. **The safety net must exist before the first change.** Building the net during the fall is too late.
3. **Stage the migration. Every stage must be independently deployable.**
4. **Data is permanent. Code is replaceable.** Treat data migrations with an order of magnitude more care.
5. **Measure coupling before and after. If it didn't improve — justify why the risk was worth it.**
6. **Debt that blocks must be fixed. Debt that is inconvenient must be scheduled. Debt that is aesthetic must be accepted.**
7. **Scope discipline: the refactor covers exactly what was committed to. No more.**
8. **Every long-running migration needs an owner and a completion date.**
9. **Never add new behavior during a refactor.** The test suite cannot tell the difference — which means neither can reviewers.
10. **Document what you deferred.** Known debt that isn't documented is debt that will be discovered as a surprise.

---

## Questions to Ask Before Starting

- Is the problem this refactor solves concrete and measurable — not aesthetic?
- Does a test suite exist that covers the behavior being changed?
- Is the migration staged so each step is independently deployable?
- For data model changes: has the migration been tested on production-scale data?
- Is there a completion date and an owner?
- Is the scope bounded — with explicit documentation of what is out of scope?

## Questions to Ask Before Completing

- Do all behavior tests still pass?
- Did the coupling score improve?
- Was any behavior changed that wasn't the explicit goal?
- Is all old code removed — or is there a tracked plan to remove it?
- Is the outcome documented in PROJECT.md?

---

## Output Format

When this skill is invoked, produce:

1. **Refactor statement** (Step 0 — what, from, to, because, not because, trigger)
2. **Debt classification** (Step 1 — class, compounding test, priority justification)
3. **Safety net assessment** (Step 2 — current test coverage, gaps, characterization tests needed)
4. **Migration plan** (Step 3 — stages, each independently deployable, rollback per stage)
5. **Coupling audit** (Step 4 — before state, expected after state)
6. **Data migration plan** (Step 5 — if applicable: dual-write strategy, volume test result, rollback plan)
7. **Lens findings** (findings from each active lens)
8. **Completion criteria** (explicit checklist for declaring the refactor done)

Do NOT skip items 3, 4, or 8. A refactor without a safety net, a coupling audit, and explicit completion criteria is not ready to start.

---

## Lessons Learned

> Add entries here when a new anti-pattern or failure mode is discovered during a refactor on a project.
> Format: [DATE] — [PROJECT CONTEXT] — [what was learned]
> This section grows over time.

```
[DATE] — [project] — [lesson]
```
