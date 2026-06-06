---
name: backend-engineer
version: 2.0.0
description: Think through backend design and implementation with rigorous attention to robustness, error visibility, and decoupling. Prevents silent failures, state corruption, and coupling debt before they enter the codebase. Includes quality lenses for testability, auditability, performance, and security — activated per project context.
category: engineering
tags: [backend, robustness, errors, coupling, state, validation, monolith, api, testability, auditability, performance, security]
---

# Backend Engineer Skill

Use this skill BEFORE implementing any backend feature — especially anything that touches business logic, state transitions, external dependencies, or shared data. It is framework-agnostic. Translate patterns to your stack.

This skill has two layers:
- **The Core Process** (Steps 0–9): apply to every project, every time.
- **Quality Lenses** (L1–L4): activate based on what matters most for the current project. Read the lens descriptions and apply the ones that fit.

---

## When to Trigger

- Adding or modifying a business rule that produces a result (calculation, classification, decision)
- Implementing a state transition (status change, lifecycle event, approval, cancellation)
- Writing code that calls an external system (DB, API, queue, file system, email)
- Adding a batch job, scheduled task, or background worker
- Designing an API endpoint or service method that multiple callers will use
- Fixing a bug — every bug fix must produce a test and a root cause analysis
- Any operation where a silent wrong result is worse than a visible error

---

## Triage — Fast Exit

Not every backend change needs the full process.

- **Pure read, no business logic, no state change, isolated?** → Skip this skill.
- **Config change, label, copy, cosmetic?** → Skip this skill.
- **Everything else** → Run the process.

**Escalation rule:** If during implementation you discover the operation mutates more state than expected, or calls more dependencies than expected — stop, escalate to full process. Scope underestimation is the most common source of silent failures.

---

## Process

### Step 0 — Name the Operation Precisely

Before writing any code, write one sentence:

> "This operation takes [input], applies [rule], and produces [output] — or fails with [explicit error]."

Every substantive term in the requirement must appear in your sentence. If you cannot complete the failure clause, you do not yet understand the operation well enough to implement it.

**Why this matters:** Most silent failures originate here. An operation described as "updates the account balance" hides: which balance field, under which conditions, with what concurrency guarantees, and what happens when the update fails halfway. Name it precisely or the gaps become bugs.

**Verification — present before proceeding:**

```
OPERATION:   "[one-sentence description]"
INPUT:       "[what enters, including types and constraints]"
OUTPUT:      "[what is produced on success]"
FAILURE:     "[explicit failure modes — not 'throws exception', but what and why]"
SIDE EFFECTS:"[what else changes — other tables, external systems, notifications]"
```

If FAILURE or SIDE EFFECTS is empty for a non-trivial operation — stop and investigate.

---

### Step 1 — Classify the Operation

| Question | Implication |
|---|---|
| Does it mutate shared state? | Concurrency risk — see Step 4 |
| Does it produce a calculated result? | Silent error risk — see Step 3 |
| Does it transition an entity's status? | State machine risk — see Step 5 |
| Does it call an external dependency? | Failure propagation risk — see Step 6 |
| Does it need to be undoable? | Reversal design required — see Step 7 |
| Will it run in batch or on a schedule? | Idempotency required — see Step 8 |

Multiple "yes" answers mean higher risk. Don't simplify — address each.

---

### Step 2 — Draw the Dependency Map

Before writing code, draw:

```
Input → [Validation] → [Business Logic] → [Persistence] → [Side Effects]
```

For each box, identify:
- What it depends on (which other modules, services, tables)
- What would break if it changed
- Whether it can be tested in isolation

**The rule:** Business logic must not depend on infrastructure. If you cannot test a business rule without a database, a framework, or an HTTP call — the logic is in the wrong place.

---

### Step 3 — Audit for Silent Failures

Silent failures are the hardest bugs. They produce no error, no exception, no log entry — just a wrong result that is discovered later, often in production.

**Checklist — for every result-producing operation:**

- [ ] Does every code path produce an explicit result or raise an explicit error? No implicit `None`, no silent `return`, no swallowed exception.
- [ ] Are all `else` / `default` branches either explicitly correct or raising an error? A default that returns a fallback value without logging is a silent failure waiting to happen.
- [ ] Are all enum values and classification inputs validated at entry? Adding a new enum value later must not silently take the wrong branch.
- [ ] Is every calculation tested against edge cases before being trusted? (boundary values, zero, negative, null, empty collection)
- [ ] Does a failed external call produce a visible signal — not just a caught exception that returns `None`?

**Anti-pattern: The polite default**
```python
# Wrong — silently uses wrong rate for unknown convention
def get_day_count(convention):
    if convention == "ACT/365":
        return 365
    else:
        return 360  # silent wrong answer for anything unknown

# Right — unknown = visible error
def get_day_count(convention):
    mapping = {"ACT/365": 365, "ACT/360": 360, "30/360": 360}
    if convention not in mapping:
        raise ValueError(f"Unknown day count convention: {convention!r}")
    return mapping[convention]
```

**Anti-pattern: The swallowed exception**
```python
# Wrong — failure disappears, caller gets None
try:
    result = compute_fee(account)
    return result
except Exception:
    return None

# Right — failure is visible and specific
try:
    result = compute_fee(account)
    return result
except FeeConfigurationError as e:
    logger.error("Fee computation failed for account %s: %s", account.id, e)
    raise  # re-raise so the caller knows
```

---

### Step 4 — Concurrency Safety

Any operation that reads a value and then writes based on that value is a read-modify-write. Without protection, two concurrent operations can both read the same value and produce an incorrect result.

**Ask for every mutation:**
- Could two requests execute this simultaneously?
- If yes: what is the worst case if they interleave?
- Is the worst case acceptable (last-write-wins) or catastrophic (lost update, double-charge)?

**Patterns by risk level:**

| Risk | Pattern |
|---|---|
| Low — last-write-wins acceptable | Optimistic concurrency (version field, compare-and-swap) |
| Medium — conflicting writes must be detected | Optimistic lock + retry with conflict error |
| High — interleaving produces wrong result | Pessimistic lock (SELECT FOR UPDATE or equivalent) |
| Critical — financial, inventory, quota | Always pessimistic. Lock before read, re-validate after lock. |

**Rule:** After acquiring a lock, re-read and re-validate. State may have changed between the initial read and the lock acquisition.

---

### Step 5 — State Machine Integrity

If the operation changes a status or lifecycle field, define the state machine explicitly before implementing.

**For every status transition, document:**

```
ALLOWED:   [from_state] → [to_state]   condition: [guard]
FORBIDDEN: [from_state] → [to_state]   reason: [why]
```

**Rules:**
- Every transition must be explicitly allowed. Anything not listed is forbidden.
- Guards must be checked in code, not assumed from the UI.
- A cancelled record must not be modifiable. A closed record must not be reopened without an explicit operation.
- State transitions must be atomic with their side effects. If posting a journal entry is part of approving a document, both must succeed or neither must.

**Anti-pattern: Status as a free-text field updated anywhere**
Wrong: Any code can call `doc.status = "Approved"` directly.
Right: A single `approve()` method that validates the guard, transitions the state, and triggers side effects atomically.

---

### Step 6 — External Dependency Isolation

Every call to an external system (database, API, queue, file system, email, SMS) is a dependency. Dependencies fail. They are slow. They change.

**Rules:**
- Business logic must not call infrastructure directly. It must go through an abstraction (a repository, a service interface, a gateway).
- The abstraction must be injectable or replaceable for testing.
- Every external call must have an explicit failure mode defined in Step 0.
- Timeouts must be set. An external call without a timeout is an availability risk.
- External failures must be classified: retryable (network blip) vs. non-retryable (invalid data, auth failure). Retrying a non-retryable error wastes time and may cause duplicates.

**Anti-pattern: Logic mixed with infrastructure**
```python
# Wrong — business rule is untestable without a real DB
def calculate_monthly_fee(account_id):
    account = db.query("SELECT * FROM accounts WHERE id = ?", account_id)
    if account.type == "premium":
        return 0
    return 5.00

# Right — logic is pure and testable
def calculate_monthly_fee(account):  # receives the object, not the ID
    if account.type == "premium":
        return 0
    return 5.00
```

---

### Step 7 — Reversibility

Financial and business operations must be reversible without data deletion.

**Rules:**
- Never delete a record to undo an operation. Create a counter-operation.
- Cancellation must restore derived state by recalculation, not by nullification.
- If a document was cancelled, the system must reflect the state as if the document never existed — but the document must still be visible in history.
- Every operation that creates a side effect (journal entry, notification, balance update) must define how that side effect is undone on cancellation.

**Anti-pattern: Nullification on cancel**
```python
# Wrong — sets to None, loses history, causes incorrect recalculation
def on_cancel(self):
    self.last_accrual_date = None
    self.accrued_interest = 0

# Right — recalculates from remaining valid documents
def on_cancel(self):
    last = get_last_submitted_accrual(self.account, exclude=self.name)
    self.last_accrual_date = last.date if last else None
    self.accrued_interest = sum_remaining_accruals(self.account)
```

---

### Step 8 — Idempotency for Batch and Scheduled Operations

Any operation that runs on a schedule or processes a batch must be safe to run twice.

**Rules:**
- Check for existing results before creating new ones. The check must be inside the processing function, not only at the scheduler level.
- The idempotency key must be meaningful: it must uniquely identify "this operation for this entity on this date/period."
- A retry must produce the same result, not a duplicate.
- Failure on one item in a batch must not abort the entire batch. Log the failure, continue, report.

**Pattern:**
```python
def accrue_interest_for_account(account, date):
    # Idempotency guard — inside the function, not at the scheduler
    if record_exists(account, date, type="interest_accrual"):
        return  # already done — safe to skip
    
    amount = calculate_interest(account, date)
    create_accrual_record(account, date, amount)
```

---

### Step 9 — Validation Boundaries

Validation must happen at the right boundary — not everywhere, not nowhere.

**Two mandatory validation points:**
1. **Entry boundary** — when data enters the system (API input, form submit, file import). Validate types, formats, required fields, domain constraints.
2. **Operation boundary** — when a business operation executes. Validate business rules: sufficient balance, valid status, authorized actor, consistent state.

**Anti-patterns:**
- Validating at every layer (controller + service + repository) creates duplication and inconsistency when rules change.
- Validating only at the UI trusts the client. Never trust the client.
- Validating too late (after mutation has started) creates partial failures.

**Rule:** The operation boundary validation must be the authoritative check. UI and API validation are user experience, not correctness guarantees.

---

---

## Quality Lenses

The core process covers robustness. These lenses add depth on four other dimensions. **Activate the lenses that match your project's constraints.** A regulated financial system activates L1 + L2. A public API under load activates L3. An externally exposed system activates L4.

---

### L1 — Testability Lens

> Activate when: long-term maintainability matters, the team will grow, or bugs are expensive to debug in production.

**The principle:** Code that is hard to test is hard to change. If you feel resistance writing a test for a function, the function is telling you something about its design.

**Testability checklist — apply during Step 2:**

- [ ] Can the business logic be called with plain objects, without starting a server or connecting to a database?
- [ ] Does each function have a single, nameable responsibility? A function that does two things needs two tests — and usually should be two functions.
- [ ] Are external dependencies (DB, email, API) passed in or injectable — not instantiated inside the function?
- [ ] Are side effects (writes, notifications, events) separated from computations (reads, calculations, decisions)?
- [ ] Is every non-obvious behavior covered by at least one test that would catch a regression?

**Structural rules:**

```
Pure functions    → input in, output out, no side effects → always testable
Command functions → produce side effects → test with mocks/fakes
Query functions   → read and return → test with controlled data
```

Never mix: a function that both computes a result AND writes it to the DB is harder to test and harder to reuse. Split the computation from the persistence.

**Anti-pattern: The untestable service**
```python
# Wrong — to test discount logic, you need a live DB and a live email server
class OrderService:
    def place_order(self, user_id, items):
        user = db.get(user_id)
        discount = 0.1 if user.is_premium else 0
        total = sum(i.price for i in items) * (1 - discount)
        db.save(Order(user_id, total))
        email.send(user.email, "Order confirmed", total)
        return total

# Right — computation is pure and testable in isolation
def calculate_order_total(is_premium, item_prices):
    discount = 0.1 if is_premium else 0
    return sum(item_prices) * (1 - discount)

class OrderService:
    def __init__(self, db, email):  # injected — replaceable in tests
        self.db = db
        self.email = email

    def place_order(self, user, items):
        total = calculate_order_total(user.is_premium, [i.price for i in items])
        self.db.save(Order(user.id, total))
        self.email.send(user.email, "Order confirmed", total)
        return total
```

**Questions to ask:**
- If I want to test the discount logic, what do I need to set up?
- If I change the email provider, which tests break?
- Can I run the full test suite without an internet connection?

---

### L2 — Auditability Lens

> Activate when: regulatory compliance is required, financial data is involved, or "who did what and when" must be answerable.

**The principle:** In auditable systems, the question is never "what is the current state?" — it is "what was the state at time T, and who caused it to be that way?"

**Auditability checklist — apply during Step 0 and Step 7:**

- [ ] Is every write operation attributed to an actor (user, system job, API key)?
- [ ] Is every state change timestamped with the time of the change, not just the time of the record creation?
- [ ] Are corrections made by creating new records, not by overwriting old ones?
- [ ] Is the reason for a state change captured — not just the new state?
- [ ] Can you reconstruct the full history of any entity from the audit log alone?
- [ ] Are deletions forbidden on auditable entities? (soft delete at most — never hard delete)

**Structural rules:**

```
Auditable record = immutable after creation
Correction       = new record that supersedes the old one
Cancellation     = new record that negates the old one — old record stays
History          = append-only log, never updated
```

**Anti-pattern: Overwriting audit-critical fields**
```python
# Wrong — history destroyed, "what was the rate last month?" is unanswerable
def update_interest_rate(account, new_rate):
    account.interest_rate = new_rate
    account.save()

# Right — history preserved, any point-in-time query is possible
def update_interest_rate(account, new_rate, effective_date, changed_by):
    RateHistory.create(
        account=account,
        rate=new_rate,
        effective_from=effective_date,
        changed_by=changed_by,
        changed_at=now()
    )
```

**Anti-pattern: Reason-free status changes**
```python
# Wrong — state changed, but why? by whom? under what authority?
account.status = "Suspended"
account.save()

# Right — the transition is a first-class event
AccountEvent.create(
    account=account,
    event_type="suspension",
    previous_status="Active",
    new_status="Suspended",
    reason="Regulatory hold — KYC expired",
    actor=current_user,
    timestamp=now()
)
```

**Questions to ask:**
- If a regulator asks "who changed this value and why on this date", can we answer?
- If a record is "corrected", is the original still visible?
- If a batch job runs at 2am and produces wrong results, can we trace exactly which records it touched?

---

### L3 — Performance Lens

> Activate when: the system handles significant load, response time is a user-facing constraint, or operations run on large datasets.

**The principle:** Performance problems are almost always design problems discovered late. The right time to think about performance is during data model and query design — not after the feature ships.

**Performance checklist — apply during Step 2:**

- [ ] Are queries bounded? Does every list query have a `LIMIT`? Can a query return 1M rows?
- [ ] Are N+1 query patterns present? (loading a list, then querying each item individually)
- [ ] Are expensive operations happening in the request cycle that could be deferred to background?
- [ ] Are indexes defined for every field used in a `WHERE`, `ORDER BY`, or `JOIN` condition?
- [ ] Are heavy computations cached, and is the cache invalidation strategy defined?
- [ ] Are bulk operations batched — not looped with individual DB calls?

**Structural rules:**

```
Request cycle    → fast operations only (< 200ms target)
Background job   → anything that takes seconds (report generation, bulk processing, email)
Cache            → computed values that are expensive and change infrequently
Index            → every filter field on high-volume tables
Pagination       → every list endpoint, no exceptions
```

**Anti-pattern: The hidden N+1**
```python
# Wrong — 1 query for orders + 1 query per order for the customer = N+1
orders = Order.get_all(status="pending")
for order in orders:
    print(order.customer.name)  # each access fires a DB query

# Right — 1 query with a join or prefetch
orders = Order.get_all(status="pending", prefetch=["customer"])
for order in orders:
    print(order.customer.name)  # no additional query
```

**Anti-pattern: Synchronous heavy work in request cycle**
```python
# Wrong — user waits 30 seconds while report generates
@api.post("/reports/generate")
def generate_report(params):
    data = fetch_all_transactions(params)   # slow
    report = build_pdf(data)               # slow
    return report

# Right — return immediately, deliver asynchronously
@api.post("/reports/generate")
def generate_report(params):
    job_id = queue.enqueue(build_report_job, params)
    return {"job_id": job_id, "status": "processing"}
```

**Questions to ask:**
- What is the largest dataset this query will ever run on?
- What happens to response time when the table grows 10×?
- Which operations block the user — and do they need to?
- What is the cache hit rate, and what triggers invalidation?

---

### L4 — Security Lens

> Activate when: the system is externally exposed, handles sensitive data, or involves authentication, authorization, or financial transactions.

**The principle:** Security is not a layer added at the end. It is a property of the design. An insecure design cannot be secured by adding checks around it.

**Security checklist — apply during Step 0 and Step 9:**

- [ ] Is every operation authorized — not just authenticated? (the user is logged in ≠ the user can do this)
- [ ] Is authorization checked at the operation level, not only at the route level?
- [ ] Is every input that crosses a trust boundary validated and sanitized?
- [ ] Are sensitive values (passwords, tokens, keys) never logged, never returned in responses, never stored in plain text?
- [ ] Are error messages informative to developers but not to attackers? (stack traces, table names, and field names must not leak to clients)
- [ ] Are all writes tied to the authenticated actor — not to an ID passed in by the client?
- [ ] Is rate limiting applied to sensitive operations (login, password reset, OTP)?

**Structural rules:**

```
Authentication   → who are you? (verified identity)
Authorization    → what are you allowed to do? (checked per operation, not per route)
Trust boundary   → any data that crosses from outside your system — always untrusted
Sensitive data   → encrypt at rest, never log, mask in responses
Principle of least privilege → every actor gets the minimum access needed
```

**Anti-pattern: Route-level authorization only**
```python
# Wrong — authorization is at the route, but the operation can be called from elsewhere
@require_login
@api.post("/accounts/{id}/close")
def close_account(id):
    account_service.close(id)  # no check inside — what if called from a batch job?

# Right — authorization is enforced inside the operation itself
def close_account(account_id, requested_by):
    account = Account.get(account_id)
    if not requested_by.can("close_account", account):
        raise PermissionError(f"User {requested_by.id} cannot close account {account_id}")
    # proceed
```

**Anti-pattern: Client-supplied actor identity**
```python
# Wrong — client tells us who is making the request
@api.post("/transactions")
def create_transaction(payload):
    transaction = Transaction(
        amount=payload["amount"],
        created_by=payload["user_id"]  # client-supplied — never trust this
    )

# Right — actor identity comes from the authenticated session
@api.post("/transactions")
def create_transaction(payload, current_user):
    transaction = Transaction(
        amount=payload["amount"],
        created_by=current_user.id  # from verified session
    )
```

**Questions to ask:**
- If a user calls this operation directly (bypassing the UI), what can they do?
- If an attacker knows the ID of another user's record, can they act on it?
- What information does an error response reveal to an unauthenticated caller?
- Are there operations that should be rate-limited but aren't?

---

**Anti-pattern: The God Function**
One function that validates, queries, computes, posts, notifies, and logs.
Consequence: impossible to test, impossible to change one part without risking others.
Fix: split by responsibility. Each function does one thing.

**Anti-pattern: Trusting input inside the system**
Passing raw user input deep into the system before validating.
Consequence: invalid data causes failures far from the source, making root cause hard to find.
Fix: validate at the entry boundary. Reject early. Return a clear error.

**Anti-pattern: Framework magic hiding business logic**
Putting business rules inside ORM hooks, lifecycle callbacks, or middleware implicitly.
Consequence: the rule runs invisibly, is hard to find, and breaks when the hook order changes.
Fix: explicit is better than implicit. Call business functions by name.

**Anti-pattern: Coupling via shared mutable state**
Multiple operations reading and writing the same global or module-level object.
Consequence: changing one operation's behavior affects all others.
Fix: pass state explicitly. Functions receive what they need and return what they produce.

**Anti-pattern: Catching all exceptions at the top**
One try/except at the top of every endpoint that turns all errors into "something went wrong."
Consequence: all failure information is destroyed. Debugging is impossible.
Fix: handle specific exceptions specifically. Let unexpected errors propagate with their full context.

---

## Principles (Technology-Agnostic)

These are true regardless of language, framework, or domain.

1. **A wrong result that looks correct is worse than a visible error.** Design for failures to be loud.
2. **Business logic must be testable without infrastructure.** If you need a database to test a rule, the rule is in the wrong place.
3. **Every operation has a failure mode. Name it before implementing the happy path.**
4. **Coupling is debt that compounds.** Every shortcut that links two unrelated things creates a future cost.
5. **State transitions are contracts.** Every allowed transition is a promise. Every forbidden one is a guardrail.
6. **External systems will fail. Design for it, not around it.**
7. **Batch jobs run twice. Design for idempotency before the first run.**
8. **Cancellation is an operation, not an undo button.** It must leave the system in a correct, auditable state.
9. **Validation at the boundary. Trust inside the boundary.**
10. **If you cannot name the failure mode, you do not yet understand the operation.**

---

## Questions to Ask Before Shipping

**Core (always):**
- If this operation runs twice simultaneously, what happens?
- If this operation fails halfway through, what is the state of the system?
- If I add a new value to this enum next month, which code paths silently take the wrong branch?
- If the external dependency is unavailable, what does the caller receive?
- If this operation is cancelled, does the system reflect a correct state without it?
- If this batch job is triggered twice, how many records are created?
- Can I test the core business logic without starting the server?

**Testability (L1):**
- If I want to test just the business rule, what do I need to set up?
- Can I run the full test suite without a database or network?

**Auditability (L2):**
- If a regulator asks "who changed this and why on this date", can we answer?
- If a record is corrected, is the original still visible?

**Performance (L3):**
- What happens to this query when the table grows 10×?
- Does anything in the request cycle block that could be deferred?

**Security (L4):**
- If a user calls this operation directly (bypassing the UI), what can they do?
- Does any error response reveal internal system details to the caller?

---

## Output Format

When this skill is invoked, produce:

1. **Active lenses** (which of L1–L4 apply to this project and why)
2. **Operation definition** (Step 0 verification block — input, output, failure, side effects)
3. **Dependency map** (what calls what, what can be isolated)
4. **Silent failure audit** (every code path accounted for)
5. **Concurrency assessment** (read-modify-write identification, locking strategy)
6. **State machine** (if applicable — allowed transitions, guards, forbidden paths)
7. **Reversal design** (if applicable — how cancellation restores correct state)
8. **Idempotency guard** (if batch/scheduled — the check, the key, the retry behavior)
9. **Lens findings** (findings from each active lens — testability gaps, audit gaps, performance risks, security gaps)
10. **Implementation plan** (what to write, in what order, what to test first)

Do NOT skip items 3, 4, or 8 when applicable. Do NOT skip lens findings for active lenses. If you cannot answer "what happens on failure?" and "what happens if this runs twice?", stop and investigate before proceeding.
