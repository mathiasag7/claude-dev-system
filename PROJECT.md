# PROJECT.md

This file captures everything Claude cannot infer from the code alone.
Fill every section before the first development session. Leave nothing blank — write "N/A" or "not yet defined" explicitly rather than leaving a section empty.

Update this file when a significant decision is made, a constraint is added, or a pattern is established. It is a living document, not a one-time setup.

---

## 1 — Project Identity

```
PROJECT NAME:     
PURPOSE:          [one sentence — what this system does and for whom]
DOMAIN:           [e.g. microfinance, logistics, healthcare, e-commerce, ERP]
CURRENT PHASE:    [greenfield / active development / maintenance / migration]
STARTED:          [month/year]
```

---

## 2 — Technical Stack

```
LANGUAGE:         [e.g. Python 3.11, TypeScript 5.3]
FRAMEWORK:        [e.g. Frappe 15, Django 4.2, NestJS 10, Rails 7]
DATABASE:         [e.g. MariaDB 10.6, PostgreSQL 15, SQLite]
FRONTEND:         [e.g. Pencil design system, React 18, Vue 3, plain HTML]
KEY LIBRARIES:    [libraries that affect design decisions — e.g. Celery, Sidekiq, Prisma]
DEPLOYMENT:       [on-premise / cloud / multi-tenant SaaS / hybrid]
ENVIRONMENTS:     [development / staging / production — any relevant differences]
```

---

## 3 — Architectural Constraints

Decisions already made that must not be re-decided.
Every item here is a closed question. Claude treats these as non-negotiable.

```
- [Constraint — e.g. "All monetary amounts use Decimal, never float. No exceptions."]
- [Constraint — e.g. "Every entity that stores financial data must have a GL mapping."]
- [Constraint — e.g. "Background jobs must be idempotent. Check-before-create is mandatory."]
- [Constraint — e.g. "No direct DB writes on financial documents — always go through the controller."]
- [Constraint]
```

> Add constraints as they are established during the project. Never remove one without team agreement.

---

## 4 — Domain Vocabulary

Terms that have a precise meaning in this project.
Claude must use these terms exactly as defined — not as they are used generically elsewhere.

| Term | Definition in this project |
|---|---|
| [Term] | [precise definition] |
| [Term] | [precise definition] |
| [Term] | [precise definition] |

> Example: "Account" may mean a bank account here, not a user login. "Product" may mean a financial product, not a software product. Define every term that could be misread.

---

## 5 — Established Patterns

Patterns already in use in this codebase. New code follows these unless divergence is explicitly justified and documented.

```
DATA MODEL:      [e.g. "Fields flow from Product → Account → Transaction. fetch_from for inheritance, never duplicate fields."]

VALIDATION:      [e.g. "Business rules in validate(). Infrastructure checks in before_save(). Never the reverse."]

ERROR HANDLING:  [e.g. "User-facing errors use framework throw. Internal errors use raise. Never swallow exceptions."]

NAMING:          [e.g. "Classes in PascalCase. Functions in snake_case. Constants in UPPER_SNAKE_CASE. Files in kebab-case."]

TESTING:         [e.g. "Tests in /tests/. One test file per module. Shared fixtures in conftest.py. Test names describe behavior, not implementation."]

API DESIGN:      [e.g. "All endpoints return {data, error, message}. Pagination via cursor, not offset."]

STATE MACHINES:  [e.g. "Status transitions only through dedicated methods. Direct assignment to status fields is forbidden."]
```

---

## 6 — What Is Forbidden

Things that must never appear in this codebase.
Each item has an explicit reason. Claude treats these as hard stops — not suggestions.

| Forbidden | Reason |
|---|---|
| [e.g. `float` for monetary amounts] | [e.g. Precision loss causes silent financial errors] |
| [e.g. Direct status field assignment] | [e.g. Bypasses state machine guards] |
| [e.g. Hardcoded currency or locale strings] | [e.g. Breaks multi-currency and multi-region support] |
| [e.g. Bulk DB writes bypassing validation] | [e.g. Skips business rules silently] |
| [Add more as discovered during the project] | |

---

## 7 — Regulatory and Compliance Context

Leave this section blank (`N/A`) if the project has no regulatory constraints.

```
REGULATORY REGIME:  [e.g. BCEAO/UEMOA, BNR/Rwanda, GDPR/EU, HIPAA/US, none]

COMPLIANCE RULES:
  - [e.g. "All financial transactions require an immutable audit trail."]
  - [e.g. "KYC verification required before account activation."]
  - [e.g. "Personal data must be encrypted at rest."]

REPORTING OBLIGATIONS:
  - [e.g. "Monthly regulatory report in BCEAO format, due 5th of each month."]
  - [e.g. "Annual data retention report required."]

AUDIT REQUIREMENTS:
  - [e.g. "Every write to a financial record must log actor, timestamp, previous value, new value."]
  - [e.g. "Hard deletes are forbidden on any regulated entity."]
```

---

## 8 — Known Debt and Watch Areas

Parts of the codebase that are fragile, incomplete, or under active rework.
Claude must not make these worse without explicit discussion.

| Area | What's fragile | Status |
|---|---|---|
| [e.g. Interest calculation module] | [e.g. Day-count convention not tested for all edge cases] | [e.g. Rework planned Q3] |
| [e.g. Notification system] | [e.g. Recipient resolution uses session user — broken in scheduler context] | [e.g. Known bug, not yet fixed] |
| [Add as discovered] | | |

---

## 9 — Domain References

References Claude should consult when designing or implementing features for this project.
These supplement the universal research process in the Feature Design skill.

| Reference | Useful for | Source |
|---|---|---|
| [e.g. Apache Fineract] | [e.g. Account lifecycle, fee system, GL mappings] | [e.g. https://github.com/apache/fineract] |
| [e.g. Internal ADR folder] | [e.g. Past architecture decisions for this project] | [e.g. /docs/adr/] |
| [e.g. Regulatory documentation] | [e.g. BCEAO reporting format specs] | [e.g. /docs/compliance/bceao/] |

---

## 10 — Decision Log

A running record of significant design decisions made during the project.
Add an entry every time a non-trivial architectural or design decision is made.
This is the memory of why things are the way they are.

```
[DATE] — [DECISION]
  Context:  [what situation prompted this decision]
  Options:  [what alternatives were considered]
  Chosen:   [what was decided]
  Because:  [the reason — constraint, reference, requirement]
  Trade-off:[what this decision makes harder or impossible]

[DATE] — [DECISION]
  Context:  
  Options:  
  Chosen:   
  Because:  
  Trade-off:
```

> The decision log is the most important section for long-running projects. It prevents re-litigating decisions already made, and explains to future contributors (human or AI) why the code is structured the way it is.
