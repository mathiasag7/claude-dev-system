---
name: testing-engineer
version: 2.0.0
description: Design and write tests that specify behavior, survive refactoring, cover failure modes, and permanently eliminate bugs once fixed. Prevents implementation-coupled tests, happy-path-only coverage, and recurring bugs from entering or re-entering the codebase. Concurrency and idempotency are core requirements, not optional lenses — especially in financial contexts.
category: engineering
tags: [testing, behavior, regression, edge-cases, unit, integration, e2e, quality, concurrency, idempotency]
forced_lenses_in_financial_context: [L1-business-logic, L3-concurrency-idempotency]
---

# Testing Engineer Skill

Use this skill BEFORE writing any test, and BEFORE fixing any bug. It is framework-agnostic — translate patterns to your stack (pytest, Jest, RSpec, JUnit, or any other).

**A test is not a verification of code. It is a specification of behavior.** A test that breaks when you rename a variable is not a test — it is a liability. A test that catches a regression six months later is an asset that pays compound interest.

**On concurrency and idempotency:** These are not advanced topics. They are core requirements for any system that processes financial data, runs batch jobs, or handles concurrent user actions. In any such context, concurrency and idempotency tests are mandatory — not optional lenses to activate if you feel like it. A test suite that doesn't cover "what happens if this runs twice" or "what happens if two requests arrive simultaneously" is incomplete.

This skill has two layers:
- **The Core Process** (Steps 0–6): apply to every test, every time.
- **Quality Lenses** (L1–L4): activate based on test type and project context. L1 and L3 are forced in financial/batch contexts.

---

## When to Trigger

- Before implementing any feature that contains business logic
- Before fixing any bug — the fix is incomplete without a regression test
- When a test breaks after a refactor that didn't change behavior
- When the same bug appears for the second time
- When a test suite takes so long to run that developers skip it
- When "it works" means "I tested it manually"

---

## Triage — Fast Exit

- **Trivial getter/setter with no logic?** → Skip. Testing it adds noise, not signal.
- **Pure configuration, no branching?** → Skip.
- **Everything else** → Run the process.

**The signal rule:** If a test's failure would not tell you anything useful about what broke — the test should not exist. Tests that always pass, or that break for reasons unrelated to behavior, are worse than no tests.

---

## Process

### Step 0 — Specify the Behavior, Not the Implementation

Before writing a single line of test code, write the behavior specification in plain language:

> "Given [context], when [action], then [observable outcome]."

This is not a formality. It is the most important step. A test written from the implementation is a test that breaks on every refactor and tells you nothing about whether the system works.

**Wrong approach (implementation-first):**
> "Test that `calculate_fee()` calls `get_rate()` and multiplies the result by `account.balance`."

**Right approach (behavior-first):**
> "Given a standard account with a 1% monthly fee, when the fee calculation runs for October, then the fee amount is 1% of the balance as of October 1st."

The second specification survives a complete internal rewrite. The first breaks the moment you rename `get_rate()`.

**Verification — present before proceeding:**

```
GIVEN:   "[the context — system state, preconditions, data]"
WHEN:    "[the action — what is triggered]"
THEN:    "[the observable outcome — what changes, what is returned, what is raised]"
NOT:     "[what must NOT happen — often more important than what should]"
```

The NOT clause is non-optional for any operation with side effects. A fee calculation that returns the right amount but also sends a notification is broken. Specify what must not happen.

---

### Step 1 — Classify the Test

Different test types answer different questions. Choosing the wrong type produces the wrong answer.

| Test type | Question it answers | Speed | Scope |
|---|---|---|---|
| **Unit** | Does this logic produce the right output? | Milliseconds | One function, no I/O |
| **Integration** | Do these components work together correctly? | Seconds | Multiple layers, real or fake I/O |
| **Contract** | Does this interface still meet its callers' expectations? | Seconds | Boundary between two components |
| **End-to-end** | Does the full user flow work? | Minutes | Full stack, real browser or API client |
| **Regression** | Has this specific bug been re-introduced? | Depends | Targeted — exactly the scenario that was broken |
| **Property** | Does this hold for all inputs in this class? | Variable | Logic under random or exhaustive input |

**The pyramid rule:**
```
         [E2E — few, slow, high confidence]
       [Integration — moderate, catches wiring bugs]
     [Unit — many, fast, catches logic bugs]
```

Inverting the pyramid (many E2E, few unit) produces a test suite that is slow, flaky, and tells you nothing about where a failure originated.

**Classification rule:** If you need a database to test a business rule — the rule is in the wrong place (see Backend Skill, Step 6). Fix the design before writing the test.

---

### Step 2 — Map the Test Cases

Before writing any test, enumerate all cases for this behavior.

**The mandatory case categories:**

| Category | Definition | Example |
|---|---|---|
| **Happy path** | Valid input, nominal conditions | Fee calculated correctly for a standard account |
| **Boundary values** | The exact edge of valid range | Fee on an account with exactly zero balance |
| **Just outside boundary** | One step beyond the valid range | Fee on a negative balance, fee rate of exactly 100% |
| **Empty / null / zero** | Absence of data | Fee on account with no transactions, null rate |
| **Invalid input** | Input that should be rejected | Non-numeric amount, unknown currency, future date |
| **State preconditions** | Operation applied to wrong state | Fee calculation on a closed account |
| **Enum exhaustion** | Every value of every enum | Fee calculation for every fee_type value |
| **Concurrent execution** | Two operations running simultaneously | Two fee calculations on the same account at the same time |
| **Idempotency** | Same operation triggered twice | Batch job runs twice — no duplicate records created |

**Concurrency and idempotency are mandatory case categories** for any operation that:
- Mutates shared state (balances, status fields, counters)
- Runs on a schedule or in a batch
- Can be triggered by multiple actors simultaneously
- Has financial consequences if duplicated

This is not optional. "We'll add concurrency tests later" is how duplicate charges and lost updates reach production.

**The case map format:**
```
Behavior: Monthly fee calculation
──────────────────────────────────────────────────────────
HAPPY PATH
  ✓ Standard account, positive balance, valid rate → correct amount
  ✓ Premium account → zero fee (waived)

BOUNDARY
  ✓ Balance exactly zero → fee is zero (not error)
  ✓ Rate exactly 0% → fee is zero
  ✓ Rate exactly 100% → fee equals balance

JUST OUTSIDE BOUNDARY
  ✓ Negative balance → defined behavior (error or zero, document which)
  ✓ Rate > 100% → rejected at configuration time, not at calculation time

EMPTY / NULL
  ✓ No balance field → explicit error, not silent zero
  ✓ Null rate → explicit error, not silent default

INVALID INPUT
  ✓ Non-numeric rate → rejected
  ✓ Future calculation date → rejected

STATE PRECONDITIONS
  ✓ Closed account → fee not calculated, explicit skip logged
  ✓ Already calculated for this period → idempotent, no duplicate

ENUM EXHAUSTION
  ✓ fee_type: FLAT → correct flat calculation
  ✓ fee_type: PERCENTAGE → correct percentage calculation
  ✓ fee_type: TIERED → correct tier lookup
  ✓ fee_type: unknown_future_value → explicit error (not silent default)

CONCURRENT EXECUTION
  ✓ Two fee jobs for same account, same period, running simultaneously → only one fee created
  ✓ Fee job and account closure running simultaneously → consistent final state

IDEMPOTENCY
  ✓ Job triggered twice for same account/period → balance unchanged on second run
  ✓ Job fails mid-run and is retried → no partial application, correct final state
```

**Rule:** The happy path is always the smallest fraction of the test cases. If your test map has one happy path and no failure cases — you haven't tested the behavior, you've documented the implementation.

---

### Step 3 — Write Tests That Survive Refactoring

A test that breaks when you rename a function has negative value. It creates noise, erodes trust in the test suite, and trains developers to ignore failures.

**The behavior contract:**

Tests must depend only on:
- **Inputs** passed to the system under test
- **Observable outputs** returned or raised
- **Observable side effects** on the system's state

Tests must NOT depend on:
- Internal function names
- Internal variable names
- Internal call sequences ("did method X call method Y?")
- Implementation details that are not part of the public contract

**The refactoring test:**
> "If I rewrite the internals of this function without changing its behavior, do any tests break?"

If yes — those tests are testing the implementation, not the behavior. Rewrite them.

**Anti-pattern: The spy trap**
```python
# Wrong — tests that method_a calls method_b internally
def test_fee_calculation():
    with patch.object(service, 'get_rate') as mock_rate:
        service.calculate_fee(account)
        mock_rate.assert_called_once_with(account.id)
# This test breaks if you inline get_rate(). It doesn't verify the fee is correct.

# Right — tests the observable outcome
def test_fee_calculation():
    account = Account(balance=10000, rate=0.01)
    fee = service.calculate_fee(account, date(2024, 10, 1))
    assert fee.amount == Decimal("100.00")
    assert fee.account_id == account.id
    assert fee.period == "2024-10"
```

**Anti-pattern: Asserting too much**
```python
# Wrong — one test asserts the entire object structure
def test_create_transaction():
    tx = create_transaction(account, amount=500)
    assert tx.id is not None
    assert tx.amount == 500
    assert tx.status == "pending"
    assert tx.created_at is not None
    assert tx.account_id == account.id
    assert tx.reference is not None
    assert tx.currency == "XOF"
    # 7 assertions — when it fails, which behavior is broken?

# Right — one behavior per test
def test_transaction_amount_is_recorded():
    tx = create_transaction(account, amount=500)
    assert tx.amount == Decimal("500")

def test_transaction_starts_in_pending_state():
    tx = create_transaction(account, amount=500)
    assert tx.status == "pending"
```

One behavior per test. One reason to fail per test.

---

### Step 4 — Write Regression Tests That Lock the Fix

Every bug fixed without a regression test will return. This is not pessimism — it is the observed behavior of codebases over time.

**The regression test protocol — mandatory for every bug fix:**

1. **Reproduce the bug in a test before fixing it.** Write the test. Run it. Watch it fail. This confirms the test actually catches the bug.
2. **Fix the bug.** Run the test. Watch it pass.
3. **Name the test after the bug, not the implementation.** The test name is permanent documentation of what was broken.
4. **The test must fail on the original buggy code.** If it passes before the fix — it does not catch the regression.

**Regression test naming convention:**
```python
# Bad — describes implementation
def test_fee_calculation_with_correct_day_count():

# Good — describes the bug that was fixed
def test_fee_not_doubled_when_scheduler_runs_twice_same_day():
def test_zero_balance_does_not_produce_negative_fee():
def test_cancelled_transaction_excluded_from_balance_calculation():
```

Six months later, when this test fails, the name tells you exactly what scenario broke — without reading the test body.

**The minimal reproduction rule:**
The regression test must use the minimum setup that reproduces the bug. A regression test that requires 15 objects to be created to reproduce a bug in a two-line function is hiding the real cause. Simplify until the test is as small as the bug.

---

### Step 5 — Isolate Tests From Each Other

Tests that depend on each other, on execution order, or on shared mutable state are not tests — they are a liability that grows with the codebase.

**Isolation rules:**

- [ ] Each test creates its own data. No shared fixtures that are mutated between tests.
- [ ] Each test cleans up after itself, or runs in a transaction that is rolled back.
- [ ] Tests pass in any order, in parallel, or in isolation.
- [ ] A failing test does not affect the execution or result of any other test.
- [ ] No test depends on the side effect of a previous test.

**The order-independence test:**
Run your test suite in reverse order. If a different set of tests fails — your tests have hidden dependencies. Find and eliminate them.

**Anti-pattern: The shared state trap**
```python
# Wrong — test 2 depends on test 1 having run first
class TestAccountWorkflow:
    def test_1_create_account(self):
        self.account = Account.create(name="Test")  # sets self.account
        assert self.account.status == "pending"

    def test_2_activate_account(self):
        self.account.activate()  # fails if test_1 didn't run
        assert self.account.status == "active"

# Right — each test is self-contained
def test_new_account_starts_as_pending():
    account = Account.create(name="Test")
    assert account.status == "pending"

def test_pending_account_can_be_activated():
    account = Account.create(name="Test", status="pending")
    account.activate()
    assert account.status == "active"
```

---

### Step 6 — Make the Test Suite Runnable

A test suite that takes 20 minutes to run will not be run. A test suite that requires a production database to run will not be run in CI. Tests that are not run do not exist.

**Runnability checklist:**

- [ ] Unit tests run in under 30 seconds with no external dependencies.
- [ ] Integration tests run in under 5 minutes with local or in-memory dependencies.
- [ ] No test requires a connection to a production or staging environment.
- [ ] Tests can be run by anyone on the team after cloning the repo — no manual setup.
- [ ] Flaky tests (tests that pass and fail intermittently) are fixed or deleted immediately. A flaky test is worse than no test — it trains developers to ignore failures.

**The dependency inversion for tests:**
```python
# Wrong — test requires live database, live email server, live payment API
def test_process_payment(self):
    # needs real DB, real email, real Stripe
    result = payment_service.process(self.real_account, amount=100)
    assert result.status == "confirmed"

# Right — dependencies are replaced with controlled fakes
def test_process_payment(self):
    fake_db = InMemoryRepository()
    fake_email = RecordingEmailSender()
    fake_payment = StubPaymentGateway(response="confirmed")

    service = PaymentService(db=fake_db, email=fake_email, gateway=fake_payment)
    result = service.process(account_id="ACC-001", amount=100)

    assert result.status == "confirmed"
    assert fake_email.sent_count == 1
    assert fake_db.find("ACC-001").last_payment == 100
```

---

## Quality Lenses

---

### L1 — Business Logic Lens

> Activate when: the system contains domain rules, financial calculations, approval workflows, or classification logic.

**The principle:** Business logic tests are the most valuable tests in the system. They encode the rules of the domain. They are the last line of defense against a code change that is technically correct but domain-incorrect.

**Business logic test checklist:**

- [ ] Is every business rule expressed as at least one test?
- [ ] Are the edge cases of every rule tested — not just the central case?
- [ ] Are domain invariants tested? (A debit must always be balanced by a credit. An account balance must never go below its minimum without an explicit overdraft.)
- [ ] Are all enum-driven rule branches tested? Every `fee_type`, every `account_status`, every `transaction_type`.
- [ ] When a business rule changes, does the test fail before the code is updated? (If not — the test isn't testing the rule.)

**The invariant test pattern:**
```python
# Business invariant: double-entry — debits must equal credits
def test_double_entry_invariant():
    post_journal_entry(debit_account="A", credit_account="B", amount=1000)
    assert sum_debits("A") == sum_credits("B")
    assert total_debits_in_system() == total_credits_in_system()

# Business rule: premium accounts are exempt from monthly fees
def test_premium_accounts_are_fee_exempt():
    account = Account(type="premium", balance=100000)
    fee = calculate_monthly_fee(account)
    assert fee == Decimal("0")

# Business rule edge case: fee waiver applies even on the day of upgrade
def test_fee_exempt_on_day_of_upgrade_to_premium():
    account = Account(type="standard", balance=100000)
    account.upgrade_to_premium(on=date(2024, 10, 15))
    fee = calculate_monthly_fee(account, for_date=date(2024, 10, 15))
    assert fee == Decimal("0")
```

---

### L2 — Integration and Wiring Lens

> Activate when: multiple components interact, or the system has non-trivial data flow between layers.

**The principle:** Unit tests verify that components work in isolation. Integration tests verify that they work together. A system can pass all unit tests and fail in production because the components were integrated incorrectly.

**Integration test checklist:**

- [ ] Is the full path from input to persistence tested for critical operations?
- [ ] Are error conditions tested at integration level — not just unit level? (What happens when the DB is unavailable? When the downstream API returns a 500?)
- [ ] Are the boundaries between components tested with real contracts — not assumed interfaces?
- [ ] Is the data format at each boundary explicitly verified? (The service returns what the controller expects. The controller returns what the client expects.)

**The boundary contract test:**
```python
# Test the contract at the boundary — not just the internals
def test_create_account_api_returns_required_fields():
    response = client.post("/api/accounts", json={
        "name": "Test Account",
        "currency": "XOF",
        "product": "savings-standard"
    })
    assert response.status_code == 201
    body = response.json()
    # Contract: these fields must always be present for callers to function
    assert "id" in body
    assert "status" in body
    assert "created_at" in body
    # Contract: sensitive fields must never be present
    assert "internal_score" not in body
    assert "raw_balance" not in body
```

---

### L3 — Concurrency and Idempotency Lens

> **In financial and batch-processing contexts: this lens is MANDATORY, not optional.**
> Activate for any system that handles concurrent operations, batch jobs, financial mutations, or retryable operations. If your PROJECT.md defines a financial domain — activate this without asking.

**The principle:** Concurrency bugs and idempotency failures are the hardest to find in production and the easiest to miss in testing. They only appear under specific timing conditions — which means they only appear in production, at scale, under load. By then, the damage is done: duplicate charges, lost updates, incorrect balances.

**The financial stakes:** In a system that processes money, a concurrency bug is not an inconvenience — it is a financial integrity failure. "We'll add concurrency tests later" is not an acceptable answer when "later" means after a double-charge incident.

**Concurrency test checklist:**

- [ ] Is there a test that simulates two concurrent mutations on the same record?
- [ ] Is there a test that runs a batch job twice and verifies no duplicates are created?
- [ ] Is there a test that simulates a job failure and retry, verifying the final state is correct?
- [ ] Is there a test for the partial failure case — operation starts, fails halfway, system is in a consistent state?
- [ ] Is there a test that verifies the idempotency key is set BEFORE the side effect, not after?
- [ ] Is there a test for every read-modify-write operation under concurrent load?

**The idempotency test pattern:**
```python
# Test that running twice produces the same result as running once
def test_monthly_fee_is_idempotent():
    account = Account(balance=100000, rate=0.01)

    run_monthly_fee_job(account, period="2024-10")
    balance_after_first_run = account.balance
    fee_count_after_first_run = count_fees(account, period="2024-10")

    run_monthly_fee_job(account, period="2024-10")  # run again — must be safe
    assert account.balance == balance_after_first_run  # no change
    assert count_fees(account, period="2024-10") == fee_count_after_first_run  # no duplicate

# Test that idempotency key is checked BEFORE mutation
def test_idempotency_guard_prevents_second_execution():
    account = Account(balance=100000, rate=0.01)
    
    # First run — should create fee
    run_monthly_fee_job(account, period="2024-10")
    assert count_fees(account, period="2024-10") == 1
    
    # Simulate the job being killed after fee creation but before marking complete
    # Second run must still detect the existing fee and not create another
    run_monthly_fee_job(account, period="2024-10")
    assert count_fees(account, period="2024-10") == 1  # still 1, not 2

# Test concurrent mutations
def test_concurrent_deposits_do_not_lose_funds():
    account = Account(balance=0)
    run_concurrently([
        lambda: deposit(account, 1000),
        lambda: deposit(account, 1000),
        lambda: deposit(account, 1000),
    ])
    assert account.balance == Decimal("3000")  # no lost update

# Test partial failure leaves system in consistent state
def test_failed_disbursement_does_not_partially_update_balance():
    account = Account(balance=10000)
    
    # Simulate failure after balance deduction but before transaction record creation
    with simulate_failure_after("balance_deduction"):
        with pytest.raises(DisbursementError):
            disburse(account, amount=5000)
    
    # System must be in a consistent state — either fully applied or fully rolled back
    # Balance of 10000 means rollback succeeded
    # Balance of 5000 with a transaction record means full application succeeded  
    # Balance of 5000 with NO transaction record is the failure case we're testing against
    assert (account.balance == Decimal("10000") or 
            (account.balance == Decimal("5000") and transaction_exists(account, amount=5000)))
```

**The race condition detection pattern:**
```python
# Detect race conditions by running operations under controlled concurrency
import threading

def test_no_duplicate_account_creation_under_race():
    results = []
    errors = []
    
    def create():
        try:
            account = Account.create(customer_id="C001", product="savings")
            results.append(account.id)
        except DuplicateAccountError as e:
            errors.append(e)
    
    threads = [threading.Thread(target=create) for _ in range(5)]
    for t in threads: t.start()
    for t in threads: t.join()
    
    # Exactly one account should have been created
    assert len(results) == 1
    assert len(errors) == 4  # others should have been rejected, not silently ignored
```

---

### L4 — End-to-End and Acceptance Lens

> Activate when: the feature involves a multi-step user flow, or the product has acceptance criteria that must be verified against the full system.

**The principle:** E2E tests are expensive. They are slow, brittle, and hard to maintain. They earn their cost only when they verify something that unit and integration tests cannot: that the full system, assembled and configured as it runs in production, completes a real user task.

**E2E test checklist:**

- [ ] Does each E2E test correspond to a complete user goal — not a technical operation?
- [ ] Is the E2E test suite limited to the critical paths? (Onboarding, core transaction, approval flow — not every feature.)
- [ ] Are E2E tests isolated from each other with independent test data?
- [ ] Is the E2E suite monitored for flakiness? A flaky E2E test is deleted, not retried.
- [ ] Is there a clear escalation path when an E2E test fails? (Who investigates? What is the SLA?)

**The critical path rule:**
```
E2E tests cover:
  ✓ The user can register and complete onboarding
  ✓ The user can complete the primary transaction (deposit, transfer, payment)
  ✓ The user can recover from the most common error (failed payment, expired session)
  ✗ NOT: every UI state
  ✗ NOT: every validation message
  ✗ NOT: every admin configuration option
```

Those belong in unit and integration tests, where they run fast and fail precisely.

---

## Anti-Patterns (Recurring Across Projects)

**Anti-pattern: The test that only tests the happy path**
One test per function, input is always valid, result is always success. The test suite is green and the system is broken in production.
Fix: For every behavior, the failure cases are a test requirement — not optional.

**Anti-pattern: The implementation mirror**
Tests that reproduce the implementation line by line, asserting internal state instead of observable behavior. Every refactor breaks the test suite.
Fix: Test what the function promises to its callers, not how it delivers on that promise.

**Anti-pattern: The never-failing regression**
Bug is fixed. No regression test is written. Six months later the same bug is fixed again by someone who doesn't know it was fixed before.
Fix: The regression test is part of the fix. A bug fix without a regression test is a half-fix.

**Anti-pattern: The 200-line test**
One test that sets up 15 objects, calls 8 functions, and asserts 20 properties. When it fails, the failure message tells you nothing about what broke.
Fix: One behavior per test. If setup is complex — it belongs in a fixture, not repeated in every test.

**Anti-pattern: The test that requires a specific environment**
Test passes on the developer's machine, fails in CI, is never run in production. The condition it tests is never verified in the environment that matters.
Fix: Tests must be environment-agnostic. If a test requires a specific configuration — that configuration is part of the test setup, not assumed from the environment.

---

## Principles (Technology-Agnostic)

1. **A test is a specification of behavior, not a verification of code.** Write it before the code when possible. Always write it from the behavior's perspective.
2. **The failure cases are more important than the happy path.** The happy path is assumed. The failure cases are where bugs live.
3. **A test that breaks on refactoring without behavior change is a liability.** Delete it or rewrite it.
4. **Every bug fixed without a regression test will return.** This is not a prediction — it is a pattern.
5. **One behavior per test.** A test with multiple assertions is multiple tests waiting to be separated.
6. **A test suite that isn't run doesn't exist.** Speed and simplicity of execution are requirements, not preferences.
7. **Flaky tests are worse than no tests.** They train developers to ignore failures. Fix or delete immediately.
8. **Test the contract, not the implementation.** Callers care about what a function promises, not how it works.
9. **The regression test name is permanent documentation.** Name it after the bug, not the fix.
10. **A unit test that requires a database is an integration test in disguise.** Fix the design, then write the test.

---

## Questions to Ask Before Shipping

**Core (always):**
- For every behavior, are the failure cases tested — not just the happy path?
- Does every test survive a refactor that doesn't change behavior?
- For every bug fixed, is there a regression test that fails on the original code?
- Can the full test suite run in under 5 minutes with no external dependencies?
- Does each test have exactly one reason to fail?
- **For any operation that mutates state: is there a test that runs it twice?** (Idempotency — always)
- **For any operation on shared state: is there a test that runs it concurrently?** (Concurrency — always in financial contexts)

**Business Logic (L1):**
- Is every business rule expressed as at least one test?
- Are all enum-driven rule branches covered?
- Are domain invariants verified after every mutation?

**Integration (L2):**
- Is the contract at every boundary explicitly tested?
- Are error conditions at integration level tested — not just happy paths?

**Concurrency (L3):**
- Is there a test that runs the operation twice and verifies idempotency?
- Is there a test for concurrent mutations on the same record?
- Is the idempotency key set BEFORE the side effect — and is this tested?
- Is there a test for partial failure — operation fails halfway, system is consistent?

**E2E (L4):**
- Does each E2E test correspond to a complete user goal?
- Is every E2E test monitored for flakiness?

---

## Output Format

When this skill is invoked, produce:

1. **Active lenses** (which of L1–L4 apply and why — note if L1 or L3 are forced by project context)
2. **Behavior specification** (Step 0 — Given/When/Then/Not for each behavior)
3. **Test case map** (all categories: happy path, boundary, null, invalid, state, enum exhaustion, **concurrent execution**, **idempotency**)
4. **Regression test** (if fixing a bug — the minimal reproduction, the name, the before/after)
5. **Isolation audit** (are tests independent? do they share mutable state?)
6. **Runnability check** (external dependencies identified, replacements defined)
7. **Lens findings** (findings from each active lens)
8. **Implementation plan** (test file structure, setup/teardown, order of writing)

Do NOT skip items 2, 3, or 4. A test without a behavior specification and a complete case map — including concurrency and idempotency where applicable — is not ready to write. A bug fix without a regression test is not complete.

---

## Lessons Learned

> Add entries here when a new anti-pattern or test gap is discovered on a project.
> Format: [DATE] — [PROJECT CONTEXT] — [what was learned]
> This section grows over time. It is the memory of test gaps that must not recur.

```
[DATE] — [project] — [lesson]
```
