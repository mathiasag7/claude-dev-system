---
name: project-onboarding
version: 1.0.0
description: Initialize or repair PROJECT.md at the start of any project. Detects whether the project is greenfield or existing, infers what it can from the codebase, asks only what it cannot deduce, and automatically derives Active Quality Lenses from the project's domain and constraints. The output is a complete, validated PROJECT.md ready for every subsequent session.
category: setup
tags: [onboarding, project-setup, context, initialization, project-md, lenses, inference]
---

# Project Onboarding Skill

Use this skill **once per project** — at the very first session, before any development work begins. If PROJECT.md already exists but is partially filled or outdated, use this skill to complete or repair it.

**This skill is the foundation of the entire system.** Every other skill operates on the context this skill produces. A PROJECT.md that is incomplete, inaccurate, or missing its Active Quality Lenses means every subsequent session starts partially blind.

**The output of this skill is not a filled-in template. It is a validated contract** — verified against the codebase, confirmed by the human, with every inference distinguished from every declaration.

---

## When to Trigger

- First session on any new project
- PROJECT.md exists but has empty sections or placeholder text
- PROJECT.md hasn't been updated in more than one major development cycle
- A new team member (human or AI) is starting on the project
- The project has changed phase (greenfield → active development, active development → maintenance)

---

## Triage — Greenfield or Existing?

Before anything else, determine the project state:

**Greenfield indicators:**
- No source files beyond scaffolding
- No database migrations
- No existing models, routes, or business logic
- PROJECT.md is blank or doesn't exist

**Existing project indicators:**
- Source files with business logic present
- Database schema or migrations exist
- Tests exist (even if incomplete)
- Git history with meaningful commits

**Rule:** If any source files with business logic exist — it's an existing project. Do not treat it as greenfield. Code that exists is truth. Read it before asking anything.

---

## Process

---

### TRACK A — Existing Project

Use this track when source files, models, or business logic already exist.

#### Step A0 — Read the Codebase Before Asking Anything

Before forming a single question, read:

```
SCAN TARGET 1: Project root — identify language, framework, config files
SCAN TARGET 2: Database models or schema files — identify entities and relationships
SCAN TARGET 3: Core business logic files — identify domain patterns
SCAN TARGET 4: Test files — identify testing patterns and coverage approach
SCAN TARGET 5: Existing PROJECT.md or CLAUDE.md — capture any prior context
SCAN TARGET 6: Dependency files (package.json, requirements.txt, pyproject.toml, Gemfile) — identify key libraries
```

For each scan, record what was found vs. what was inferred. **An inference is not a fact until confirmed.**

#### Step A1 — Build the Inference Map

After reading, produce an inference map before asking a single question:

```
INFERRED — STACK:
  Language:    [what was read] — confidence: [high/medium/low]
  Framework:   [what was read] — confidence: [high/medium/low]
  Database:    [what was read] — confidence: [high/medium/low]
  Frontend:    [what was read] — confidence: [high/medium/low]

INFERRED — PATTERNS:
  Data model:  [pattern observed in code]
  Validation:  [pattern observed in code]
  Error handling: [pattern observed in code]
  Naming:      [pattern observed in code]
  Testing:     [pattern observed in code — if tests exist]

INFERRED — CONSTRAINTS:
  [constraint that appears to be enforced in code — e.g. "Decimal used for all amounts"]
  [constraint that appears to be enforced in code]

CANNOT INFER — MUST ASK:
  - Domain and purpose (code doesn't describe why it exists)
  - Regulatory context (compliance obligations aren't in code)
  - Architectural decisions already made (the "why" behind patterns)
  - Known debt the team is aware of (fragile areas not obvious from code)
  - Forbidden patterns that aren't yet in code (decisions made but not yet enforced)
```

**Rule:** Only ask about what cannot be inferred. Every question that could be answered by reading the code is a question that shouldn't be asked.

#### Step A2 — Ask Only the Irreducible Questions

Present the inference map first. Then ask only the questions the code cannot answer.

**Mandatory questions — always ask:**

```
Q1 — PURPOSE:
"In one sentence: what does this system do, and for whom?"
WHY: Code shows how. It rarely shows who benefits or why it exists.

Q2 — DOMAIN:
"What is the business domain? (e.g. microfinance, logistics, healthcare, e-commerce)"
WHY: Domain determines which quality lenses are non-negotiable.

Q3 — REGULATORY CONTEXT:
"Are there regulatory or compliance obligations? If yes — which regime and which rules?"
WHY: Compliance constraints are never visible in code. They drive architecture silently.

Q4 — KNOWN DEBT:
"Are there areas of the codebase you consider fragile, incomplete, or that you've been avoiding?"
WHY: Fragile areas aren't always obvious from code. The team knows things the code doesn't show.

Q5 — FORBIDDEN PATTERNS:
"Are there things that must never appear in this codebase — patterns, libraries, approaches — that aren't yet enforced by tooling?"
WHY: Informal constraints that haven't been codified yet are the ones most likely to be violated.
```

**Conditional questions — ask only if inference was low-confidence:**

```
Q6 — CONSTRAINTS [if unclear from code]:
"Are there architectural decisions already made that must not be revisited?"

Q7 — PHASE [if unclear from git history]:
"What phase is this project in — early development, active feature work, or maintenance?"
```

**Do not ask** about stack, patterns, or naming conventions if these were read from the code with high confidence. Asking for information already visible in the code wastes the human's time and signals that the code wasn't read.

---

### TRACK B — Greenfield Project

Use this track when no meaningful source files exist yet.

#### Step B0 — Confirm Greenfield State

Before proceeding, verify: no business logic files, no schema, no meaningful tests. If any exist — switch to Track A.

#### Step B1 — Ask the Founding Questions

For a greenfield project, nothing can be inferred. Ask everything — but in a structured sequence that builds on previous answers.

**Round 1 — Identity and domain (ask these first, together):**

```
Q1 — PURPOSE:
"In one sentence: what will this system do, and for whom?"

Q2 — DOMAIN:
"What business domain is this? (e.g. microfinance, logistics, healthcare, e-commerce, ERP, SaaS)"

Q3 — PHASE AND TIMELINE:
"Is this starting from scratch today, or are you inheriting a design that already exists on paper?"
```

**Round 2 — Stack and constraints (ask after Round 1 answers received):**

```
Q4 — STACK:
"What is the planned stack? (language, framework, database, frontend)"
Note: If the human says "you decide" — propose based on domain best practices and state why.

Q5 — DEPLOYMENT:
"On-premise, cloud, or multi-tenant SaaS? Any specific environment constraints?"

Q6 — REGULATORY:
"Are there compliance or regulatory obligations from day one?"
```

**Round 3 — Constraints and forbidden patterns (ask after Round 2 answers received):**

```
Q7 — HARD CONSTRAINTS:
"Are there any architectural decisions already made — even informally — that we should treat as closed?"

Q8 — FORBIDDEN:
"Anything that must never appear in this codebase? Known bad patterns from past projects?"
```

**Why three rounds, not one big list:** Each round's answers shape the next round's questions. Domain (Round 1) determines which stack questions are relevant (Round 2). Stack and regulatory context (Round 2) determine which constraints and forbidden patterns matter (Round 3). A flat list of 8 questions produces 8 answers in isolation. Three rounds produce a coherent picture.

---

### Step C — Derive the Active Quality Lenses (Both Tracks)

After gathering all information — inferred and declared — derive Section 11 automatically.

**Derivation rules — apply in order:**

```
IF domain contains [financial / banking / microfinance / payments / insurance / lending]:
  → backend-skill    L2-Auditability       FORCED
  → backend-skill    L1-Testability        FORCED
  → testing-skill    L1-Business Logic     FORCED
  → testing-skill    L3-Concurrency        FORCED

IF domain contains [healthcare / medical / patient data / clinical]:
  → backend-skill    L2-Auditability       FORCED
  → backend-skill    L4-Security           FORCED
  → testing-skill    L1-Business Logic     FORCED

IF regulatory context is NOT N/A:
  → backend-skill    L2-Auditability       FORCED (regardless of domain)

IF deployment is [multi-tenant SaaS / externally exposed API / public-facing]:
  → backend-skill    L4-Security           FORCED

IF product is used on mobile OR mobile usage is significant:
  → frontend-ui-skill   L3-Responsive      FORCED
  → frontend-ux-skill   L4-Mobile-First    FORCED

IF users are [daily operators / power users / back-office staff]:
  → frontend-ui-skill   L4-Data Density    FORCED
  → frontend-ux-skill   L1-Expert User     FORCED

IF system handles [batch jobs / scheduled tasks / background workers]:
  → testing-skill    L3-Concurrency        FORCED
  → backend-skill    L1-Testability        FORCED

IF team size > 3 OR project phase is [active development / maintenance]:
  → backend-skill    L1-Testability        FORCED
```

**Every derived lens must include its justification** — which domain, regulatory, or deployment fact triggered it. A lens without a traceable reason is removed.

---

### Step D — Produce and Validate PROJECT.md

Produce the complete PROJECT.md. Present it before writing it.

**Presentation format:**

```
Here is the PROJECT.md I've built for this project.

INFERRED from code (please correct if wrong):
  [list each inferred field with its value]

DECLARED by you:
  [list each declared field with its value]

DERIVED — Active Quality Lenses (Section 11):
  [list each lens with the rule that triggered it]

ASSUMPTIONS MADE:
  [anything uncertain that was filled with a reasonable default]
  [flag each one for explicit confirmation]

Confirm, and I'll write the file. Or correct any item and I'll rebuild.
```

**Do not write the file until confirmation is received.** A PROJECT.md written without confirmation is a PROJECT.md that may contain wrong information treated as fact.

---

### Step E — Write and Lock

After confirmation:

1. Write PROJECT.md to `.claude/PROJECT.md`
2. Add a first Decision Log entry:

```
[DATE] — PROJECT CONTEXT INITIALIZED
  Context:  First session — PROJECT.md created via project-onboarding skill
  Method:   [Track A — inferred from existing codebase / Track B — greenfield, declared]
  Confirmed by: [human confirmation received]
  Assumptions: [list any assumptions flagged and confirmed]
  Active lenses: [list all lenses in Section 11 and their trigger rules]
```

3. State explicitly: "PROJECT.md is now the operating context for this project. All subsequent sessions read this file at startup."

---

## Quality Rules

**On inference:**
- Inferences are hypotheses until confirmed. Never present an inference as a fact.
- High confidence inference = pattern appears in 3+ places in the codebase consistently.
- Low confidence inference = pattern appears once, or appears inconsistently.
- Zero confidence = not visible in code at all. Ask.

**On questions:**
- Never ask for information already visible in the code.
- Never ask more than 4 questions at once. Batch them by round.
- Every question states why it matters — what it affects in PROJECT.md or in lens derivation.
- A question whose answer wouldn't change anything should not be asked.

**On lenses:**
- Every lens in Section 11 must have a traceable trigger from the derivation rules.
- Lenses are not added because they "seem like a good idea."
- When in doubt — don't add the lens. An unnecessary forced lens is friction without value.

**On confirmation:**
- Present before writing. Always.
- Distinguish clearly between inferred and declared.
- A confirmed PROJECT.md is the truth for this project. Treat it as such.

---

## Anti-Patterns

**Anti-pattern: The questionnaire**
A flat list of 15 questions presented all at once before reading any code.
Result: The human fills in information Claude could have read itself. Trust is lost before the first line of code.
Fix: Read first. Ask only what the code cannot answer.

**Anti-pattern: The silent inference**
Claude reads the code, fills in PROJECT.md, and writes it without presenting it first.
Result: Inferences treated as facts. Wrong context silently shapes every subsequent session.
Fix: Present before writing. Always distinguish inferred from declared.

**Anti-pattern: The generic lens assignment**
All lenses activated "just to be safe" regardless of domain or constraints.
Result: Every task runs through every lens. The skill system becomes overhead, not help.
Fix: Derive lenses strictly from the derivation rules. Only what is justified is activated.

**Anti-pattern: The one-time document**
PROJECT.md is filled at the start and never updated.
Result: The document drifts from reality. New constraints, new debt, new decisions accumulate in conversations but not in the file.
Fix: At the end of any session where a significant decision was made — add a Decision Log entry. PROJECT.md is a living document.

**Anti-pattern: Asking domain questions after stack questions**
Stack is asked first. Then domain. Then the human realizes the stack choice was wrong for their domain.
Fix: Domain always before stack. Domain constraints shape technology choices. Never the reverse.

---

## Principles

1. **Read before asking.** Code that exists is truth. Questions about things already visible in code are waste.
2. **Inferences are hypotheses. Declarations are facts.** Never conflate them.
3. **Domain determines lenses. Lenses are not preferences.** A financial system without L2-Auditability is an incomplete setup.
4. **Present before writing.** A PROJECT.md written without confirmation is a liability.
5. **Three rounds, not one list.** Earlier answers shape later questions. Sequence matters.
6. **Every lens must be traceable.** No lens without a rule. No rule without a domain or constraint fact.
7. **PROJECT.md is not a one-time setup.** It is the living memory of the project. Treat it accordingly.

---

## Output Format

When this skill is invoked, produce in this order:

1. **Track determination** (greenfield or existing — evidence for the decision)
2. **Inference map** (Track A only — what was read, what was inferred, confidence levels)
3. **Questions** (only what cannot be inferred — batched in rounds)
4. **[Wait for answers]**
5. **Lens derivation** (each lens with its triggering rule explicitly stated)
6. **PROJECT.md draft** (complete, with inferred vs. declared clearly marked)
7. **[Wait for confirmation]**
8. **Write PROJECT.md + initial Decision Log entry**

Steps 3 and 6 are non-negotiable wait points. Do not proceed past either without a response.

---

## Lessons Learned

> Add entries here when a question produced a surprising answer that changed the lens derivation, or when an inference was wrong in a way that affected the project.
> Format: [DATE] — [PROJECT CONTEXT] — [what was learned]

```
[DATE] — [project] — [lesson]
```
