---
name: feature-designer
version: 2.0.0
description: Design features through deep research, contextual understanding, and justified decisions. Prevents memory-based proposals, superficial references, context-blind designs, and unjustified architectural choices. Clarifies what "research" means when Claude is the researcher — and what distinguishes evidence from recall.
category: design
tags: [feature-design, research, architecture, patterns, decision-making, context, investigation]
---

# Feature Designer Skill

Use this skill EVERY TIME a feature needs to be designed — before any implementation decision, before any proposal, before any schema or API shape is suggested.

**Feature design is an investigation, not a response.** The output of this skill is not a proposal generated from training memory. It is a design grounded in research, constrained by the existing project, and justified by explicit reasoning. A design that cannot answer "why this, not that?" is not a design — it is a guess.

---

## When to Trigger

- Any request containing: "design", "how should we build", "what's the best way to implement", "how do we approach", "architect this feature"
- Any feature description followed by an expectation of a technical proposal
- Any feature that touches more than one system concern (data model + API + workflow, or UI + state + persistence)
- Any feature where getting the design wrong creates migration cost or architectural debt

---

## Triage — Fast Exit

- **Trivial CRUD with no business logic, no cross-cutting concern, no ambiguity?** → Implement directly, no design process needed.
- **Everything else** → Run the full process. Do not shortcut.

**The memory trap — and what it means when Claude is the researcher:**

When Claude proposes a design, it draws on training data — patterns seen across thousands of codebases and documentation sources. This is useful. It is also dangerous if mistaken for research.

The difference:

| Memory | Research |
|---|---|
| "Stripe uses idempotency keys for this" (recalled pattern) | "Stripe's idempotency key design doc explains they chose per-request keys rather than per-operation keys because..." (specific finding from a specific source) |
| "Event sourcing handles this well" (recalled category) | "Axon Framework's documentation on aggregate design identifies three edge cases in temporal queries that naive event sourcing misses..." (specific edge case from a specific implementation) |
| "Most systems use optimistic locking here" (statistical recall) | "Apache Fineract uses pessimistic locking for loan disbursement specifically because concurrent approval is a regulatory requirement in their target markets..." (specific design decision with documented reason) |

Memory gives category names. Research gives edge cases, failure modes, and the reasons behind decisions. **The edge cases are what prevent bugs.** Category names don't.

**When Claude performs research in-session (web search, documentation fetch):** This is real research. Apply the research protocol fully. Document sources, specific findings, and what was rejected.

**When no in-session research tools are available:** Be explicit. State: "This design is based on training knowledge of [reference systems], not in-session research. The following findings should be verified against current documentation before implementation." Then proceed with that caveat documented — not pretend the memory is research.

---

## Process

### Step 0 — Absorb the Context Before Anything Else

Before searching, before proposing, before asking questions — read everything available about the existing project.

**Context inventory — collect before proceeding:**

```
PROJECT STACK:     "[languages, frameworks, databases, existing patterns]"
EXISTING FEATURES: "[what already exists that this feature touches or resembles]"
CONSTRAINTS:       "[regulatory, performance, architectural constraints already established]"
PRIOR DECISIONS:   "[design decisions already made that this feature must respect]"
INTEGRATION POINTS:"[what this feature connects to — APIs, DocTypes, services, events]"
```

**The context rule:** A design proposed without reading the existing codebase, existing data model, and existing patterns is not a contextual design — it is a generic template. Generic templates create integration debt.

**What to look for in the existing project:**
- Is there a similar feature already built? If yes — understand it completely before designing the new one.
- What naming conventions, patterns, and abstractions does the project already use?
- What constraints are already established (field types, validation patterns, GL mappings, state machines)?
- What has already been decided that must not be re-decided?

Do not proceed to Step 1 until the context inventory is complete.

---

### Step 1 — Research Before Proposing

This step is non-negotiable. No proposal is made before research is complete.

**Research is not:**
- Recalling examples from training data
- Listing 3 well-known tools that exist in this space
- Summarizing a Wikipedia article on the topic

**Research is:**
- Searching for how proven systems actually implement this specific feature
- Reading source code, design documents, ADRs, and changelog entries
- Finding the edge cases that real implementations discovered
- Identifying the decisions that existing systems made and why

**Research execution — for every feature:**

#### Phase 1: Identify the problem category (5 min)
Write one sentence: "This feature is fundamentally a [problem category] problem."

Examples:
- "This is fundamentally a state machine problem — entities transition through defined lifecycle states."
- "This is fundamentally a hierarchical resolution problem — rules at multiple levels, most specific wins."
- "This is fundamentally an event sourcing problem — history matters more than current state."

Naming the category determines which references to search.

#### Phase 2: Find reference implementations (20–40 min)
Search for systems that have solved this exact problem or a closely related one. For each reference found:

```
REFERENCE:   "[project or system name]"
SOURCE:      "[URL, repo, doc — not memory]"
APPROACH:    "[how they solved it — one paragraph, specific]"
WHY THEY CHOSE IT: "[what constraint or insight drove their design]"
EDGE CASES THEY HANDLE: "[the non-obvious problems their implementation addresses]"
WHAT APPLIES HERE: "[what transfers to our context]"
WHAT DOESN'T: "[what doesn't fit and why]"
```

**Minimum research depth:**
- ≥ 3 reference implementations found and read (not just named)
- ≥ 1 source that discusses failure modes or problems with common approaches
- ≥ 1 source specific to the project's domain (not just generic software design)

**Research quality by source type:**

| Source type | Quality | Requirement |
|---|---|---|
| In-session web search / doc fetch | Highest — verifiable, current | Source URL required |
| Training knowledge of open-source systems (Fineract, Stripe, Django, etc.) | Medium — useful but unverifiable in-session | Must state specific design decisions and edge cases, not just names |
| Generic design pattern recollection ("most systems do X") | Low — statistical, no edge cases | Must be flagged as recalled pattern, not research finding |
| Unnamed intuition | None | Not a valid research output |

**If in-session research tools are available:** Use them. Do not substitute memory for a search that takes 30 seconds.

**If in-session research tools are unavailable:** Use training knowledge but label it explicitly. The output format's Research Summary section must state: "Based on training knowledge — not verified in-session. Recommend verifying [specific claims] before implementation."

**If research returns nothing relevant:** Document what was searched, what was found, and why it doesn't apply. "I searched and found nothing useful" is a valid research output. "I didn't search" is not.

#### Phase 3: Extract invariants and edge cases
From all references, extract:
- **Invariants** — properties that every implementation preserves, regardless of approach
- **Edge cases** — the non-obvious scenarios that break naive implementations
- **Anti-patterns** — approaches that looked good but failed in practice

These are the most valuable outputs of research. They are what prevents discovering problems in production that existing systems already solved years ago.

---

### Step 2 — Ask the Questions That Change the Design

Before proposing anything, ask the questions whose answers would change the design if different.

**This is not a courtesy step.** Asking questions after the design is proposed is asking for approval, not for input. The questions must come before the proposal, because the answers determine the proposal.

**How to identify the right questions:**

For each major design decision the feature requires, ask: "If the answer to this were different, would the design change significantly?"

- If yes → this is a question to ask.
- If no → this is an assumption to state, not a question to ask.

**Question categories:**

| Category | Examples |
|---|---|
| **Scope boundaries** | What is explicitly out of scope for this feature? What will be handled in a future iteration? |
| **Volume and scale** | How many records? How many concurrent users? What's the expected growth? |
| **Lifecycle and mutability** | Can this be edited after creation? Cancelled? By whom? Under what conditions? |
| **Regulatory and audit** | Does this need a full audit trail? Does it need to be reversible? Any regulatory constraint? |
| **Integration** | What systems consume the output of this feature? What systems feed into it? |
| **Priority conflicts** | When two rules or configurations conflict, which wins? |
| **Edge case handling** | What happens in the edge case X? Is it an error, a fallback, or a defined behavior? |

**Question format — present before proceeding:**

```
QUESTION 1: "[question]"
WHY IT MATTERS: "[which design decision changes based on the answer]"
DEFAULT ASSUMPTION IF NOT ANSWERED: "[what I will assume if you don't answer this]"

QUESTION 2: ...
```

The "why it matters" clause is mandatory. A question without a stated consequence is a question that wastes the requester's time.

**The question limit:** Ask only the questions that change the design. 3–5 focused questions are more valuable than 10 broad ones. If there are more than 7 questions — the feature scope is not well enough understood to design. Return to Step 0.

---

### Step 3 — Design With the Existing Project, Not Against It

The design must integrate with what already exists. A design that ignores the project's existing patterns creates a two-architecture codebase — the part that follows established patterns, and the part that doesn't.

**Integration checklist — before finalizing any design:**

- [ ] Does this design use the existing naming conventions, or does it introduce new ones?
- [ ] Does this design reuse existing abstractions (base classes, service patterns, validation patterns)?
- [ ] Does this design respect the existing data model hierarchy (which entities own which fields)?
- [ ] Does this design introduce a new pattern where an existing pattern already handles this?
- [ ] If this design differs from existing patterns — is the reason documented explicitly?

**The divergence rule:** When the proposed design differs from an established project pattern, the divergence must be explicitly justified. Acceptable justifications: the existing pattern doesn't handle this case, the existing pattern has a known problem this design avoids, the scope of this feature is different enough to warrant a different approach. Not acceptable: "this is cleaner," "I prefer this structure," "this is more modern."

**Design against the existing context:**
```
EXISTING PATTERN:    "[how the project currently solves similar problems]"
THIS DESIGN:         "[how this feature is designed]"
SAME OR DIFFERENT:   "[same / diverges in these ways]"
DIVERGENCE REASON:   "[if different — explicit justification]"
```

---

### Step 4 — Produce the Design Document

Only after Steps 0–3 are complete does the design get written.

**Design document structure:**

#### 4.1 — Feature Summary
One paragraph. What this feature does, for whom, and what problem it solves. Written from the user's perspective, not the system's.

#### 4.2 — Research Summary
What was found. What was studied. What patterns and invariants were extracted. What was rejected and why. This section is mandatory — it is the evidence that the design is grounded in research, not generated from memory.

```
## Research Summary

### References Studied
- [Reference 1]: [what they do, what applies]
- [Reference 2]: [what they do, what applies]
- [Reference 3]: [what they do, what applies]

### Invariants Extracted
- [Property that every reference implementation preserves]
- [Property that every reference implementation preserves]

### Edge Cases Identified
- [Non-obvious scenario and how references handle it]
- [Non-obvious scenario and how references handle it]

### Rejected Approaches
- [Approach]: rejected because [specific reason from research, not preference]
```

#### 4.3 — Design Decisions
For each major decision in the design:

```
DECISION:    "[what was decided]"
OPTIONS CONSIDERED: "[what alternatives were evaluated]"
CHOSEN BECAUSE: "[specific reason — reference, constraint, or invariant that justifies it]"
TRADE-OFFS: "[what this decision costs — what it makes harder or impossible]"
```

No decision without a justification. No justification from preference. Every justification traceable to a research finding, a project constraint, or an explicit business requirement.

#### 4.4 — Data Model
Entities, fields, relationships. For each non-obvious field or relationship — why it exists, what it encodes, what happens if it's absent.

#### 4.5 — Behavior Specification
For each operation the feature exposes:
- Input, output, failure modes (same format as Backend Skill Step 0)
- State transitions if applicable (same format as Backend Skill Step 5)
- Side effects

#### 4.6 — Edge Cases and Failure Modes
Explicit treatment of every edge case identified in research. Not "TBD" — a defined behavior for each one.

#### 4.7 — What This Design Defers
What is explicitly out of scope. What future iteration would extend this. What this design makes easy to extend — and what it makes hard.

---

### Step 5 — Validate the Design Against Quality Criteria

Before presenting the design, verify:

**Correctness:**
- [ ] Does the design handle every edge case identified in research?
- [ ] Does the design respect every invariant extracted from references?
- [ ] Does the design answer every question from Step 2?

**Integration:**
- [ ] Does the design integrate cleanly with the existing data model?
- [ ] Does the design follow established project patterns, or explicitly justify divergence?
- [ ] Does the design create any unintended coupling?

**Completeness:**
- [ ] Is every major decision justified — not just described?
- [ ] Are failure modes defined for every operation?
- [ ] Is the scope boundary explicit — what is in, what is out?

**Future-proofing:**
- [ ] Does the design make the next obvious extension easy?
- [ ] Does the design avoid decisions that would require migration if requirements change predictably?
- [ ] Are the parts likely to change isolated from the parts unlikely to change?

---

## Anti-Patterns

**Anti-pattern: The memory proposal**
Feature is described. Design is proposed in the next message. No search was performed. The proposal is fluent, confident, and based entirely on training data patterns.
Consequence: the design solves a generic version of the problem, not the actual problem in this project's context.
Fix: Research is mandatory. The proposal cannot precede the research. If search results confirm the memory-based approach — document that. But search first.

**Anti-pattern: The name-drop reference**
"This is similar to how Stripe handles it" or "Fineract uses this pattern." No source. No specific implementation detail. No edge case from the actual reference. Just a name.
Consequence: sounds researched, isn't. Provides no actual design grounding.
Fix: Every reference requires a source that was read, a specific implementation detail that was extracted, and a documented reason for why it applies or doesn't apply to this context.

**Anti-pattern: The context-blind design**
Design proposes a data model, an API shape, and a service structure that ignore the project's existing conventions entirely. New naming convention. New abstraction pattern. New validation approach.
Consequence: the feature becomes an island — technically correct but architecturally isolated. Future developers don't know which pattern to follow.
Fix: Read the existing project before designing. Every significant divergence from existing patterns requires an explicit, documented justification.

**Anti-pattern: The approval question**
Questions are asked after the design is presented: "Does this look good to you?" "Would you like me to adjust anything?"
These are not design questions — they are approval requests. They don't change the design; they confirm it.
Fix: Questions that change the design are asked before the design. Questions after the design is presented are clarifications about the design, not inputs to it.

**Anti-pattern: The undifferentiated question list**
8 questions are asked, some trivial, some critical, all presented with equal weight. The requester answers all 8 and still isn't sure which ones actually mattered.
Fix: Every question states why it matters and what assumption will be made if it isn't answered. The requester can then prioritize.

**Anti-pattern: The scopeless design**
Design is presented with no explicit boundary. What's in scope is implied by what was designed. What's out of scope is never stated.
Consequence: implementation scope creep, because the boundary was never agreed upon.
Fix: Every design document explicitly states what is deferred and why.

---

## Principles (Technology-Agnostic)

1. **Research before proposing. Always.** A proposal without research is a guess dressed as a design.
2. **The edge cases from research are more valuable than the happy path from memory.** They represent problems already solved — don't discover them again in production.
3. **A design that ignores the existing project creates two codebases.** Integrate or justify divergence explicitly.
4. **Questions that change the design come before the design.** Questions that seek approval come after — and are worth less.
5. **Every decision has trade-offs. Name them.** A design without stated trade-offs is a design that hasn't been thought through.
6. **"This is cleaner" is not a justification.** A justification is traceable to a reference, a constraint, or a requirement.
7. **The scope boundary is part of the design.** What is deferred is as important as what is built.
8. **Invariants extracted from references are the skeleton of the design.** Build around them, not around implementation preferences.
9. **A design is not done when it handles the happy path.** It is done when it handles every edge case identified in research.
10. **The research summary is not optional.** It is the evidence that the design is grounded. Without it, the design cannot be evaluated or challenged.

---

## Questions to Ask Before Presenting a Design

- Was the existing project read before any design decision was made?
- Were at least 3 reference implementations actually searched and read — not recalled from memory?
- If no in-session research tools were available — is the training-knowledge basis explicitly labeled as such?
- Are the questions that change the design asked before the proposal — not after?
- Is every major design decision justified with a specific reason — not a preference?
- Are the edge cases from research explicitly handled in the design?
- Is the scope boundary stated — what is in, what is deferred?
- Does the design integrate with existing project patterns, or is divergence explicitly justified?

---

## Output Format

When this skill is invoked, produce in this order — never out of order:

1. **Context inventory** (Step 0 — what was read in the existing project)
2. **Research summary** (Step 1 — references found, invariants extracted, edge cases identified, approaches rejected — with explicit label if training-knowledge-only)
3. **Clarifying questions** (Step 2 — questions that change the design, with stated consequences and default assumptions)
4. **[Wait for answers before proceeding]**
5. **Design document** (Step 4 — summary, research summary, decisions, data model, behavior spec, edge cases, deferred scope)
6. **Validation checklist** (Step 5 — correctness, integration, completeness, future-proofing)

Steps 1, 2, and the wait at step 4 are non-negotiable. A design presented before research is complete and questions are answered is a violation of this skill.

---

## Lessons Learned

> Add entries here when a design decision produced unexpected results, or when a missing edge case was discovered during implementation.
> Format: [DATE] — [PROJECT CONTEXT] — [what was learned]
> This section grows over time. It is the memory of design gaps that must not recur.

```
[DATE] — [project] — [lesson]
```
