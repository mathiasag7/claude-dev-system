---
name: product-thinking
version: 1.0.0
description: Before implementing any user-facing surface (page, form, detail view, list, dashboard) or any data/model change that surfaces in the UI, simulate the finished product from the real user's perspective. Derives conditional behavior, information architecture, and completeness gaps that a literal reading of the request would miss. Prevents shipping technically-correct but product-incomplete work that has to be redone.
category: product
tags: [product-thinking, ux, information-architecture, completeness, persona, business-analysis, gap-analysis]
---

# Product Thinking Skill

Use this skill BEFORE `feature-design-skill`, `frontend-ui-skill`, or `frontend-ux-skill` — whenever the task touches something a real user will see, fill, or read. It runs first because it answers "what should exist" — the other skills answer "how to build it well" and "how to make it usable."

**A request is a sentence. A product is a system of consequences.** "Add a Type de trajet field with two values" is a sentence. The product question is: what does each value silently imply about every other field on this screen, this workflow, and the next screen? Executing the sentence without asking the product question produces work that is correct and incomplete — and incomplete work discovered after delivery is more expensive than the five minutes it would have taken to ask.

**The core discipline of this skill: stop being a component builder and become the first user of the finished thing.** Not the user who reads a spec — the user who has a real goal, in the real domain defined in PROJECT.md, looking at a real screen, trying to get something done.

---

## When to Trigger

- Adding, removing, or changing a field on any form, model, or record
- Building or modifying a detail page, list view, dashboard, or any screen that displays data
- Adding a new value to an enum, status, type, or category field
- Any request that mentions a business concept from PROJECT.md's Domain Vocabulary (Section 4)
- Any request phrased as "add X to the form/page/screen" without describing the surrounding behavior
- Building anything that will be used repeatedly by a real persona (not a one-off admin script)

**This skill does NOT trigger for:**
- Pure backend logic with no UI surface (covered by `backend-skill`)
- Internal tooling with no end-user persona (scripts, migrations, CLI tools)
- Bug fixes that don't change what's visible or available to the user (covered by `debugging-skill`)

---

## Triage — Fast Exit

There is no fast exit for anything that reaches a real user's screen. The mistake this skill exists to prevent is precisely the instinct that a field, a value, or a screen is "too small to think about." Small surface changes are exactly where product debt accumulates unnoticed.

**The only exception:** a change to a screen or field that is purely cosmetic (color, spacing, copy correction) with zero behavioral or informational consequence. Everything else — even one field, even one enum value — runs the process.

---

## Process

### Step 0 — Identify the Surface and the Persona

Before anything else, name what is being built and who uses it.

```
SURFACE TYPE:   [form / detail page / list / dashboard / card / modal / workflow step]
PERSONA:        [who uses this — pull from PROJECT.md Section 1 or 4; if undefined, ask]
PERSONA GOAL:   [what is this person trying to accomplish on THIS screen, specifically]
FREQUENCY:      [does this persona see this screen once, or dozens of times a day]
ENTRY POINT:    [how does the persona arrive here — from what action, in what state of mind]
```

**Why frequency matters:** A screen seen once (onboarding) tolerates friction and explanation. A screen seen 50 times a day (an operator's daily queue) must be fast, dense, and free of anything that isn't decision-relevant. The same field can be a helpful detail in one and noise in the other.

**If the persona isn't defined in PROJECT.md:** stop and ask. Building for an undefined persona is building for no one — the design defaults to whatever is easiest to implement, which is exactly the failure mode this skill prevents.

---

### Step 1 — Simulate the Finished Product

This is the center of the skill. Before designing anything, answer this question in full:

> **"If this screen were completely finished — production-grade, nothing missing, nothing to redo — what would [persona] see, in what order, and why?"**

Do this by walking through the persona's actual goal step by step, not by listing possible fields.

**The simulation format:**
```
PERSONA ARRIVES because: "[trigger — e.g. clicked 'View trip' from their dashboard]"

PERSONA WANTS TO KNOW, in priority order:
  1. "[the first thing they need to confirm — usually: is this the right thing]"
  2. "[the second thing — usually: what state is it in, what can I do next]"
  3. "[supporting detail — context that helps the decision but isn't the decision]"
  4. "[secondary information — useful but not part of the primary task]"

PERSONA WANTS TO DO, in priority order:
  1. "[the primary action this screen exists to enable]"
  2. "[secondary actions — edit, cancel, share, escalate]"

PERSONA WOULD BE CONFUSED OR BLOCKED IF:
  "[what's missing that they'd expect — the gap a literal implementation would leave]"
```

**Applied to the trip example:**
```
SURFACE: Trip creation form
PERSONA: Someone posting a trip (could be offering space or requesting space)
PERSONA GOAL: Communicate exactly what they have or need, so the right match happens

SIMULATION:
  If "Type de trajet" = Proposition de trajet (offering space):
    PERSONA WANTS TO KNOW: what luggage types can I accommodate → multi-select capacity field
    PERSONA WANTS TO DO: specify acceptable luggage types (plural — they have room for variety)
    CONFUSION IF MISSING: no way to say "I accept light AND medium but not heavy"

  If "Type de trajet" = Demande de trajet (requesting space):
    PERSONA WANTS TO KNOW: nothing to configure — they already HAVE one item
    PERSONA WANTS TO DO: specify their single luggage type (singular — one bag, one type)
    CONFUSION IF MISSING: a multi-select here is nonsensical — they don't have multiple bag types to declare, they have one bag

DERIVED REQUIREMENT: The luggage field is not one field. It is two different fields (or one field
with different cardinality and label) driven by Type de trajet. Implementing "add a luggage field"
literally — one multi-select for both cases — produces a form that lets a trip requester declare
5 luggage types they don't have.
```

**Applied to the "Type de client" example:**
```
SURFACE: Client creation form
PERSONA: Whoever creates client records — sales agent? Ops? Self-service signup?
PERSONA GOAL: Register a client with the minimum friction and correct classification

SIMULATION — before adding the field, ask what it's FOR:
  Is "Type de client" set by business rule (volume, region, contract) → SYSTEM-COMPUTED, not user input
  Is it a sales decision made at signup → USER INPUT, visible, in the creation form
  Is it something that only matters after the relationship develops → NOT in creation form, appears later
  Is it informative only, changed by an admin process elsewhere → READ-ONLY, in the detail view, not the creation form

DERIVED QUESTIONS (see Step 2 — these must be asked, not assumed):
  - Where does the value of "Type de client" come from — user judgment or computed from other data?
  - Does the CREATOR of the record need to see/set this, or only someone reviewing it later?
  - Does PROJECT.md's Domain Vocabulary already define "Type de client" — and if so, does that
    definition specify who sets it and when?
```

---

### Step 2 — Ask What Cannot Be Simulated

The simulation in Step 1 produces hypotheses about behavior. Some of these can be resolved by reading PROJECT.md or the existing product. What's left is asked — before building, not after.

**The standard question set for any field or surface addition:**

```
VISIBILITY:      "Should [element] be visible to the end user, or is it system/internal only?"
EDITABILITY:      "If visible — is it editable by the user, or read-only / set elsewhere?"
TIMING:           "Does this belong in THIS step of the workflow, or does it only become relevant later?"
CONDITIONALITY:   "Does the value of [related field] change what should appear here?"
PLACEMENT:        "Given the business logic, which section of the screen does this belong to — 
                   and does its presence change how existing fields should be grouped?"
CARDINALITY:      "Is this single-select, multi-select, or does that itself depend on context?"
```

**Do not silently assume answers to fill gaps.** If the request doesn't specify, and Step 1's simulation produces more than one plausible answer — ask. This is not the same as Step 2 in `feature-design-skill` (technical research questions) — these are product and business questions, asked even for changes too small to trigger a full feature design cycle.

---

### Step 3 — Design the Information Architecture

Once the finished-product picture and the open questions are resolved, decide how it's organized — not just what exists.

**Grouping and hierarchy rules:**

- Fields that answer the same question for the user are grouped together, regardless of their order in the original request or the data model.
- The primary decision-relevant information is above the fold, first, largest. Supporting detail is secondary — smaller, lower, or behind a disclosure.
- Fields whose relevance depends on another field's value are visually and logically subordinate to that field — they appear conditionally, near it, not scattered elsewhere on the form.
- System/computed fields that must be visible for trust or audit reasons are placed as read-only context, never mixed into the editable input flow.

**The reordering check:** After Step 1 and Step 2, re-examine the literal field order from the original request. The order things were mentioned in a conversation is not a design decision — it's an artifact of how the request was phrased. Reorder based on the persona's priority list from Step 1, not the request's sentence order.

---

### Step 4 — Gap Analysis Against the Literal Request

Compare what was literally asked against the finished-product simulation. Present the delta explicitly — do not silently expand scope, per CLAUDE.md rule 1.8.

**Gap analysis format:**
```
LITERALLY REQUESTED:  "[exactly what was asked]"

FINISHED PRODUCT REQUIRES, additionally:
  - "[conditional behavior derived in Step 1]"
  - "[placement/grouping change derived in Step 3]"
  - "[a related field or state that the request didn't mention but the simulation surfaced]"

RECOMMENDATION:
  "[what should be built now vs. flagged for later]"

DECISION NEEDED:
  "Should I implement the finished-product version, or exactly the literal request with the gaps
  documented for later?"
```

**This is the step that respects Scope Discipline (CLAUDE.md 1.8).** The skill's job is to surface the gap and make it visible — not to unilaterally build the expanded version. The human decides whether "later" is acceptable for this gap or whether it must be closed now.

---

### Step 5 — Hand Off to Execution Skills

Once the finished-product spec and the scope decision are settled, hand off:

- Data model or conditional logic → `feature-design-skill` / `backend-skill`
- Visual layout, states, components → `frontend-ui-skill`
- Flow, feedback, form behavior → `frontend-ux-skill`

This skill does not replace them. It produces the "what and why" that makes their "how" correct on the first attempt instead of the second.

---

## Anti-Patterns

**Anti-pattern: The literal field**
A field is added exactly as named, with no consideration of how its value should change the rest of the form. Result: the trip form lets a "demande" post multiple luggage types, which is nonsensical for someone who has exactly one bag.
Fix: Every new field or enum value is checked for downstream conditional impact before implementation.

**Anti-pattern: The dumped field**
A new field is added to the form in whatever position it was mentioned in the request, without asking whether it belongs there, whether it should be visible at all, or whether it's read-only.
Fix: Run Step 2's question set before placing any field.

**Anti-pattern: The silent scope expansion**
The finished-product vision is built in full without ever telling the human what was added beyond the original ask.
Fix: Step 4's gap analysis is presented every time, and the decision to build the expanded version is the human's, not an assumption.

**Anti-pattern: Designing for "a user" instead of the persona**
Decisions are made based on generic UX wisdom without grounding them in who actually uses this specific screen in this specific product.
Fix: Step 0 names the persona explicitly, from PROJECT.md. If it isn't defined there — ask before designing.

**Anti-pattern: Order mirrors the request, not the user's priorities**
Fields appear in the UI in the order the human happened to mention them in the message, rather than the order the persona actually needs them.
Fix: Step 3's reordering check is mandatory, not optional.

**Anti-pattern: Confusing "technically complete" with "product complete"**
The field works, saves correctly, and passes validation — but a real user encountering it in production would be confused, blocked, or would immediately ask "why can I select 5 things when I only have 1 bag?"
Fix: Step 1's simulation is done from the persona's confusion point, not from the schema's correctness.

---

## Principles

1. **A request is a sentence. The product is everything the sentence implies.** Execute the implication, not just the sentence.
2. **Simulate the persona's actual moment on the actual screen — not a generic user with generic needs.**
3. **Conditional business logic (this value changes what else should exist) is the most common gap between "technically done" and "product done."**
4. **Field order in a request is not a design decision. It's an artifact of conversation. Reorder based on the persona's priorities.**
5. **System/computed fields are not UI decisions by default — ask whether they belong in front of the user at all.**
6. **Surface the gap between literal and complete. Never silently build past what was asked — and never silently ship less than what the product needs, without saying so.**
7. **The smaller the request looks, the more important this skill is.** Product debt accumulates in the fields everyone assumed were "too simple to think about."

---

## Questions to Ask Before Building

- Who is the persona for this specific screen, and what are they trying to accomplish here?
- Does any field's value change what else should be visible, editable, or required?
- Is every field here because the user needs to act on it, or because it was convenient to add?
- Would a system/computed value be better as read-only context than as an editable input?
- Does the order of elements reflect the user's priorities, or the order they were requested in?
- What would this persona expect to see that isn't in the literal request — and have I surfaced that gap explicitly?

---

## Output Format

When this skill is invoked, produce:

1. **Surface and persona identification** (Step 0)
2. **Finished-product simulation** (Step 1 — what the persona wants to know, wants to do, would be confused by)
3. **Open questions** (Step 2 — visibility, editability, timing, conditionality, placement, cardinality)
4. **[Wait for answers if questions were raised]**
5. **Information architecture** (Step 3 — grouping, hierarchy, conditional placement, reordering rationale)
6. **Gap analysis** (Step 4 — literal request vs. finished product, explicit delta, recommendation)
7. **[Wait for scope decision]**
8. **Handoff note** (Step 5 — which execution skill(s) take over, with the settled spec)

Steps 2 and 4 are non-negotiable wait points when they surface anything beyond the literal request. Do not silently decide either direction — visibility, ask; scope, ask.

---

## Lessons Learned

> Add entries here when a shipped feature revealed a product gap that this skill should have caught, or when a simulation assumption turned out wrong for this project's actual users.
> Format: [DATE] — [PROJECT CONTEXT] — [what was learned]

```
[DATE] — [project] — [lesson]
```
