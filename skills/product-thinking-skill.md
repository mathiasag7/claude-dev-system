---
name: product-thinking
version: 1.2.0
description: Before implementing any user-facing surface (page, form, detail view, list, dashboard) or any data/model change that surfaces in the UI, simulate the finished product from the real user's perspective. Derives conditional behavior, information architecture, and completeness gaps that a literal reading of the request would miss. Challenges the request against its underlying business need. Runs a bounded, mechanical impact scan for field/enum/model changes. Prevents shipping technically-correct but product-incomplete work that has to be redone.
category: product
tags: [product-thinking, ux, information-architecture, completeness, persona, business-analysis, gap-analysis, impact-scan]
---

# Product Thinking Skill

Use this skill BEFORE `feature-design-skill`, `frontend-ui-skill`, or `frontend-ux-skill` — whenever the task touches something a real user will see, fill, or read. It runs first because it answers "what should exist" — the other skills answer "how to build it well" and "how to make it usable."

**A request is a sentence. A product is a system of consequences.** "Add a Type de trajet field with two values" is a sentence. The product question is: what does each value silently imply about every other field on this screen, this workflow, and the next screen? Executing the sentence without asking the product question produces work that is correct and incomplete — and incomplete work discovered after delivery is more expensive than the five minutes it would have taken to ask.

**The core discipline of this skill: stop being a component builder and become the first user of the finished thing.** Not the user who reads a spec — the user who has a real goal, in the real domain defined in PROJECT.md, looking at a real screen, trying to get something done.

**The second discipline: minimize round-trips without silent assumptions.** The human should never have to complete an analysis that PROJECT.md or the existing product already answers — and should never receive a bare questionnaire when a recommended answer could be derived. The default output of an open question is "I recommend X because Y — confirm or correct," not "what do you want?"

---

## Mode Overrides

The skill runs in **default mode** unless an override keyword is present. Overrides are detected in TWO places, checked in this order:

1. **Arguments** of a manual invocation — e.g. `/sk-product-thinking no-scan` (the launcher passes `$ARGUMENTS` through).
2. **Anywhere in the user's message** — e.g. "ajoute le champ X au formulaire, no-scan". This covers auto-triggered invocations, where no argument exists.

| Keyword | Effect |
|---|---|
| `no-scan` | Skip Step 4's Impact Scan entirely. Everything else runs unchanged. |
| `full-scan` (or `scan-complet`) | Remove the Impact Scan's line caps: complete inventory of every confirmed reference. Still confirmed-only, still an inventory — never speculative prose. |

**Hard boundary: overrides modulate the Impact Scan ONLY.** There is no keyword that skips Steps 0–2 (persona, simulation, resolve-first). Product thinking itself is not optional — only the depth of the mechanical scan is tunable.

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

### Step 0 — Identify the Surface, the Persona, and the Underlying Need

Before anything else, name what is being built, who uses it, and what business need the request is actually answering.

```
SURFACE TYPE:     [form / detail page / list / dashboard / card / modal / workflow step]
PERSONA:          [who uses this — pull from PROJECT.md Section 1 or 4; if undefined, ask]
PERSONA GOAL:     [what is this person trying to accomplish on THIS screen, specifically]
FREQUENCY:        [does this persona see this screen once, or dozens of times a day]
ENTRY POINT:      [how does the persona arrive here — from what action, in what state of mind]
UNDERLYING NEED:  [the business need in ONE sentence — the problem, not the requested solution]
MODE:             [default / no-scan / full-scan — from arguments or message keywords]
```

**Why the underlying need matters:** A request is one possible solution to a need, chosen at the moment the human phrased the message. "Add a Type de client field" might be answering the need "sales must apply different pricing per client segment" — and the simplest answer to THAT need might be a computed value, not a manual field. State the need in one sentence, then check: **is the requested solution the simplest, most coherent answer to it?**

- If yes → proceed; nothing to report.
- If a simpler or more coherent solution exists → **do not silently substitute it.** Note it here and present it in Step 4's gap analysis as an explicit option, alongside the literal request. The human picks.
- If the need itself cannot be stated from the request plus PROJECT.md → that is the first question to ask, before any simulation.

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
UNDERLYING NEED: A match only works if capacity offered and luggage carried are described
in compatible terms — the form must capture each side's reality, not a generic field.

SIMULATION:
  If "Type de trajet" = Proposition de trajet (offering space):
    PERSONA WANTS TO KNOW: what luggage types can I accommodate → multi-select capacity field
    PERSONA WANTS TO DO: specify acceptable luggage types (plural — they have room for variety)
    CONFUSION IF MISSING: no way to say "I accept light AND medium but not heavy"

  If "Type de trajet" = Demande de trajet (requesting space):
    PERSONA WANTS TO KNOW: nothing to configure — they already HAVE one item
    PERSONA WANTS TO DO: specify their single luggage type (singular — one bag, one type)
    CONFUSION IF MISSING: a multi-select here is nonsensical — they don't have multiple bag types
    to declare, they have one bag

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
UNDERLYING NEED: [state it — e.g. "downstream processes treat client segments differently";
if the need can't be stated, that's the first question]

SIMULATION — before adding the field, ask what it's FOR:
  Is "Type de client" set by business rule (volume, region, contract) → SYSTEM-COMPUTED, not user input
  Is it a sales decision made at signup → USER INPUT, visible, in the creation form
  Is it something that only matters after the relationship develops → NOT in creation form, appears later
  Is it informative only, changed by an admin process elsewhere → READ-ONLY, in the detail view, not
  the creation form

DERIVED QUESTIONS (see Step 2 — resolve from context first, then ask the residual):
  - Where does the value of "Type de client" come from — user judgment or computed from other data?
  - Does the CREATOR of the record need to see/set this, or only someone reviewing it later?
  - Does PROJECT.md's Domain Vocabulary already define "Type de client" — and if so, does that
    definition specify who sets it and when?
```

---

### Step 2 — Resolve First, Ask Second

The simulation in Step 1 produces hypotheses about behavior. This step turns them into settled answers — with the minimum possible burden on the human.

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

**Phase A — Mandatory resolution pass (before asking anything).**
Every question in the set MUST first be run against, in order:

1. **The request and conversation itself** — was it already answered, even implicitly?
2. **PROJECT.md** — personas (Section 1), Domain Vocabulary (Section 4), stated workflows.
3. **The existing product/codebase** — how do *similar* fields already behave? An existing status field that is read-only and admin-set is strong evidence for how a new status-like field should behave. Existing form sections define where a new field of the same nature belongs.

A question resolved in Phase A is not asked. It is *reported* — one line, with its source:
```
RESOLVED FROM CONTEXT:
  EDITABILITY: read-only — PROJECT.md §4 defines "Type de client" as computed from contract volume
  PLACEMENT:   "Informations commerciales" section — matches where "Segment" already lives in the form
```

**Phase B — The residual, asked WITH a recommendation.**
Only what genuinely cannot be resolved in Phase A is asked. And every asked question ships with a recommended answer and a one-line justification, so the human can reply "ok" — or correct in one word — instead of redoing the analysis:

```
OPEN QUESTIONS (each with a recommendation — reply "ok" to accept all, or correct individually):
  TIMING: Does "Type de client" belong in the creation form, or only in the detail view later?
    → Recommendation: detail view only. Rationale: PROJECT.md's signup flow emphasizes minimum
      friction, and no creation-time process consumes this value.
  CONDITIONALITY: Should selecting "Grand compte" reveal the "Account manager" field?
    → Recommendation: yes. Rationale: every "Grand compte" record in the existing data has one,
      and the detail view already displays it.
```

**The two failure modes this step forbids, symmetrically:**
- **Silent assumption** — more than one plausible answer, none confirmed, one picked quietly. Forbidden.
- **The bare questionnaire** — asking questions the context already answers, or asking without a recommendation. Equally forbidden: it transfers the analysis back to the human, which is the round-trip this skill exists to eliminate.

These are product and business questions, asked even for changes too small to trigger a full feature design cycle — this is not the same as Step 2 in `feature-design-skill` (technical research questions).

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

#### 4a — Impact Scan (bounded, mechanical)

**Trigger:** only when the change touches a **field, enum/status/type value, or data model**. Not for new pages, layout changes, or flow changes with no data-shape impact. **Skipped entirely in `no-scan` mode.**

**Mechanics — search, never speculate:**
1. Grep the codebase for the field/enum name and its obvious variants (DB column name, API key, translated label, constant).
2. Inventory the surfaces that reference it: list views, filters, tables, validations, API serializers/contracts, permissions, business rules, tests, fixtures, exports, docs.
3. Report the inventory — **capped**:

```
IMPACT SCAN (confirmed from code — max 8 lines in default mode):
  - [file/surface]: [what references it — one line each]
POTENTIAL (max 3 lines — only if strongly implied by PROJECT.md, labeled as unconfirmed):
  - [item]
```

If the confirmed list exceeds the cap in default mode: report the top 8 by product impact, then one line — *"N additional references found — say `full-scan` for the complete inventory."* In `full-scan` mode, the caps are removed but the format is not: still one line per reference, still confirmed-only. **The scan is an inventory, never an essay.** No paragraph of speculative consequences — every line traces to a grep hit or a PROJECT.md statement.

#### 4b — Gap analysis format

```
LITERALLY REQUESTED:  "[exactly what was asked]"

UNDERLYING NEED (from Step 0):  "[one sentence]"
ALTERNATIVE SOLUTION (only if Step 0 surfaced one):
  "[the simpler/more coherent answer to the need — presented as an OPTION, never pre-implemented.
   State in one line why it might be better, and what the literal request loses by comparison.]"

IMPACT SCAN:  [the 4a inventory, or "skipped (no-scan)" / "not applicable (no data-shape change)"]

FINISHED PRODUCT REQUIRES, additionally:
  - "[conditional behavior derived in Step 1]"
  - "[placement/grouping change derived in Step 3]"
  - "[a related field or state that the request didn't mention but the simulation surfaced]"
  - "[impacted surfaces from 4a that must be updated for coherence — e.g. the list filter]"

RECOMMENDATION:
  "[what should be built now vs. flagged for later — and, if an alternative solution exists,
   which of the two paths is recommended and why]"

DECISION NEEDED:
  "Should I implement the finished-product version, the literal request with the gaps documented
  for later — or the alternative solution?"
```

**This is the step that respects Scope Discipline (CLAUDE.md 1.8).** The skill's job is to surface the gap — the impacted surfaces, and any better answer to the underlying need — and make it visible; not to unilaterally build the expanded or substituted version. The human decides whether "later" is acceptable for this gap or whether it must be closed now.

---

### Step 5 — Hand Off to Execution Skills

Once the finished-product spec and the scope decision are settled, hand off:

- Data model or conditional logic → `feature-design-skill` / `backend-skill`
- Visual layout, states, components → `frontend-ui-skill`
- Flow, feedback, form behavior → `frontend-ux-skill`

This skill does not replace them. It produces the "what and why" that makes their "how" correct on the first attempt instead of the second. The Impact Scan inventory travels with the handoff — the surfaces the human agreed to update are part of the spec.

---

## Anti-Patterns

**Anti-pattern: The literal field**
A field is added exactly as named, with no consideration of how its value should change the rest of the form. Result: the trip form lets a "demande" post multiple luggage types, which is nonsensical for someone who has exactly one bag.
Fix: Every new field or enum value is checked for downstream conditional impact before implementation.

**Anti-pattern: The unchallenged request**
The request is treated as the need itself, so a manual field is built where a computed value was the real answer — technically flawless, functionally wrong.
Fix: Step 0 states the underlying need in one sentence and checks whether the request is the simplest answer to it. Any better answer surfaces in Step 4 as an option — never as a silent substitution.

**Anti-pattern: The dumped field**
A new field is added to the form in whatever position it was mentioned in the request, without asking whether it belongs there, whether it should be visible at all, or whether it's read-only.
Fix: Run Step 2's question set before placing any field.

**Anti-pattern: The silent scope expansion**
The finished-product vision is built in full without ever telling the human what was added beyond the original ask.
Fix: Step 4's gap analysis is presented every time, and the decision to build the expanded version is the human's, not an assumption.

**Anti-pattern: The bare questionnaire**
Six questions are fired at the human — half of which PROJECT.md or the existing code already answers, none of which comes with a recommendation. The analysis the skill was supposed to do is transferred back to the human, and every small field costs a full round-trip.
Fix: Step 2's Phase A resolution pass is mandatory; only the residual is asked, and every asked question ships with a recommended answer and rationale so the human can reply "ok."

**Anti-pattern: The speculative impact essay**
"Impact analysis" written from imagination: forty lines of "this might affect…" with no grep behind them. It buries the two real impacts under twelve hypothetical ones and trains the human to skip the section.
Fix: 4a's scan is mechanical — every line traces to a code reference or a PROJECT.md statement, capped in default mode, expandable only via `full-scan`.

**Anti-pattern: The invisible enum ripple**
A new enum/status value is added to the model and the form — but the list filter, the API validation, and the export mapping still only know the old values. Technically shipped, silently broken everywhere the value travels.
Fix: 4a triggers automatically on any field/enum/model change; the confirmed inventory goes into the gap analysis where the human decides what gets updated now.

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
2. **A request is one solution to a need. State the need; if a simpler solution answers it better, surface it as an option — never substitute it silently.**
3. **Simulate the persona's actual moment on the actual screen — not a generic user with generic needs.**
4. **Conditional business logic (this value changes what else should exist) is the most common gap between "technically done" and "product done."**
5. **Resolve from context before asking. Recommend before waiting.** The human's ideal reply to an open question is "ok" — not a paragraph of analysis the skill should have done itself.
6. **Impact is grepped, not imagined.** A field's reach across the product is a fact in the code — inventory it mechanically, cap the report, and let `full-scan` open the depth on demand.
7. **Field order in a request is not a design decision. It's an artifact of conversation. Reorder based on the persona's priorities.**
8. **System/computed fields are not UI decisions by default — ask whether they belong in front of the user at all.**
9. **Surface the gap between literal and complete. Never silently build past what was asked — and never silently ship less than what the product needs, without saying so.**
10. **The smaller the request looks, the more important this skill is.** Product debt accumulates in the fields everyone assumed were "too simple to think about."

---

## Questions to Ask Before Building

- What business need is this request answering — and is the request the simplest answer to it?
- Who is the persona for this specific screen, and what are they trying to accomplish here?
- Does any field's value change what else should be visible, editable, or required?
- Is every field here because the user needs to act on it, or because it was convenient to add?
- Would a system/computed value be better as read-only context than as an editable input?
- Does the order of elements reflect the user's priorities, or the order they were requested in?
- If this is a field/enum/model change — where else does this name appear in the codebase, and have I inventoried those surfaces?
- What would this persona expect to see that isn't in the literal request — and have I surfaced that gap explicitly?
- Have I resolved everything PROJECT.md and the existing code can resolve — and does every remaining question carry a recommended answer?

---

## Output Format

When this skill is invoked, produce:

1. **Surface, persona, underlying-need, and mode identification** (Step 0 — including whether the request is the simplest answer to the need, and the active mode: default / no-scan / full-scan)
2. **Finished-product simulation** (Step 1 — what the persona wants to know, wants to do, would be confused by)
3. **Resolved-from-context report + residual open questions with recommendations** (Step 2 — Phase A one-liners with sources, then Phase B questions each carrying "Recommendation: X. Rationale: Y")
4. **[Wait for answers ONLY if Phase B is non-empty — a single "ok" accepts all recommendations]**
5. **Information architecture** (Step 3 — grouping, hierarchy, conditional placement, reordering rationale)
6. **Gap analysis with Impact Scan** (Step 4 — 4a's capped inventory when applicable, then literal request vs. finished product, alternative solution if any, explicit delta, recommendation)
7. **[Wait for scope decision]**
8. **Handoff note** (Step 5 — which execution skill(s) take over, with the settled spec including the agreed impact surfaces)

Steps 2 and 4 are non-negotiable wait points when they surface anything beyond the literal request — but they must arrive pre-analyzed: context-resolvable answers already resolved and sourced, residual questions already carrying a recommendation, impacts already grepped and capped, alternatives already argued in one line. Do not silently decide either direction — and do not hand the human an unprocessed questionnaire or a speculative essay.

---

## Lessons Learned

> Add entries here when a shipped feature revealed a product gap that this skill should have caught, or when a simulation assumption turned out wrong for this project's actual users.
> Format: [DATE] — [PROJECT CONTEXT] — [what was learned]

```
[DATE] — [project] — [lesson]
[2026-07] — opencrm — Le formulaire New Lead (hérité du framework) contenait un Customer type dont la valeur aurait dû conditionner les champs suivants ; les écrans hérités ne passent jamais par le skill — les auditer manuellement au premier contact
```
