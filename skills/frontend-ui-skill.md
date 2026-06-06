---
name: frontend-ui-engineer
version: 1.0.0
description: Design and implement frontend interfaces with rigorous visual consistency, complete state coverage, and a reusable component contract. Prevents incoherence, missing states, and one-off components before they accumulate into visual debt.
category: engineering
tags: [frontend, ui, components, design-system, states, hierarchy, consistency, pencil]
---

# Frontend UI Engineer Skill

Use this skill BEFORE building any screen, component, or UI feature. It is design-system-agnostic — translate patterns to your stack (Pencil, Tailwind, Material, custom). The principles hold regardless of tooling.

This skill has two layers:
- **The Core Process** (Steps 0–6): apply to every UI change, every time.
- **Quality Lenses** (L1–L4): activate based on what matters most for the current project.

---

## When to Trigger

- Building a new screen or page layout
- Adding a new component (even "just a button variant")
- Implementing a feature that has multiple states (loading, empty, error, success)
- Noticing that two screens solve the same visual problem differently
- Receiving a design that doesn't specify what happens when data is absent, loading, or wrong
- Any UI work where "done" could mean "it works in the happy path"

---

## Triage — Fast Exit

- **Single-line copy change, color token swap, or spacing tweak inside an existing component?** → Skip this skill.
- **Everything else** → Run the process.

**Escalation rule:** If during implementation you realize the component needs a variant that doesn't exist in the design system, stop. A new variant is a design system decision, not an implementation detail.

---

## Process

### Step 0 — Name the Component's Contract

Before writing any markup, write:

> "This component receives [data], renders [visual output], and handles [states]."

Every component is a contract between data and pixels. If you cannot name all the states it must handle, you will ship a component that breaks in production when the data doesn't match the happy path.

**Verification — present before proceeding:**

```
COMPONENT:  "[name]"
INPUT:      "[what data it receives — type, shape, optionality]"
OUTPUT:     "[what it renders on success with real data]"
STATES:     "[loading / empty / error / partial / success — all that apply]"
VARIANTS:   "[size, theme, context variants — exhaustive list]"
```

If STATES is only "success" — stop. Every component that receives async data or optional content has more states than that.

---

### Step 1 — Map the State Matrix

Every interactive or data-driven component exists in multiple states simultaneously. Map them before building.

**The mandatory states:**

| State | Definition | Common mistake |
|---|---|---|
| **Loading** | Data is being fetched | Showing nothing, or a broken layout with no content |
| **Empty** | Fetch succeeded, zero results | Showing nothing, or a raw "No data" string |
| **Error** | Fetch failed, or data is invalid | Showing nothing, or leaking a technical error message |
| **Partial** | Some data present, some missing | Assuming all fields are always populated |
| **Success** | Full data, nominal case | The only state most implementations handle |
| **Disabled** | Interaction blocked | Greyed out but no explanation why |
| **Read-only** | Data visible, not editable | Looks identical to enabled — user tries to click |

**Rule:** A component is not done until every applicable state has a defined visual treatment. "We'll handle that later" is how empty states ship as blank white rectangles.

**State matrix format:**
```
Component: Transaction List
─────────────────────────────────────────────────────
Loading  → skeleton rows (3), same height as real rows
Empty    → illustration + "No transactions yet" + CTA
Error    → inline error message + retry button
Partial  → rows with missing fields show "—" not blank
Success  → paginated list, sortable columns
```

---

### Step 2 — Anchor to the Design System

Before building, verify every visual decision against the design system.

**Checklist:**

- [ ] Is there an existing component that solves this — even partially? Extend it, don't duplicate it.
- [ ] Are all spacing values taken from the design system scale? No magic numbers (`padding: 13px`).
- [ ] Are all colors taken from semantic tokens (`color-text-danger`), not raw values (`#e53e3e`)?
- [ ] Are all typography choices from the defined type scale — not ad-hoc `font-size` overrides?
- [ ] Are all interactive states (hover, focus, active, disabled) defined in the design system or explicitly designed for this component?

**The rule:** Every value that isn't a design token is future inconsistency. One `#3b82f6` hardcoded today becomes the reason the brand color change breaks 40 screens next year.

**Anti-pattern: The one-off component**
```
Wrong:
Designer hands off a card. Developer builds it from scratch.
Next screen has a similar card. Developer builds it from scratch again.
Three months later: 6 "card" variants with different shadows, radii, and padding.

Right:
Before building — search the design system for "card".
Find the base card component. Identify what's different.
Either use the existing component with a new prop, or propose a new variant to the design system.
Never build a component that solves a problem the design system already solves.
```

---

### Step 3 — Establish Visual Hierarchy

Every screen must have exactly one primary focus. The eye needs a path.

**Hierarchy audit — for every screen:**

1. **What is the single most important action or information on this screen?** It must be visually dominant. If two things compete for dominance, one must yield.
2. **What is the secondary content?** It should be clearly subordinate — smaller, lighter, or less saturated.
3. **What is tertiary / contextual?** Should recede. If everything is the same visual weight, nothing is important.

**The three-second test:** Show the screen to someone for three seconds. Ask: "What were you supposed to do here?" If they can't answer, the hierarchy is broken.

**Anti-pattern: The flat screen**
Every element has the same visual weight. Every button looks equally important. Every label is the same size. The user's eye has nowhere to go.

Fix: Pick one action as primary. Make it visually unmistakable. Demote everything else explicitly.

**Anti-pattern: Competing primaries**
Two buttons with identical visual weight — "Save" and "Cancel" both appear as filled, colored buttons.

Fix: Primary action = filled button. Secondary action = outlined or ghost. Destructive action = explicit danger styling. Never two filled buttons of the same weight on the same screen.

---

### Step 4 — Design for Real Content

Designs built with placeholder content break when real content arrives.

**Checklist — before building:**

- [ ] What is the shortest realistic content? Does the layout hold?
- [ ] What is the longest realistic content? Does it truncate, wrap, or overflow gracefully?
- [ ] What happens if a required field is null or undefined? Is there a defined fallback (`—`, `N/A`, a placeholder)?
- [ ] What happens with a very large number? (`1,000,000,000` vs `10`)
- [ ] What happens with a very long name or label? (`"Jean-Baptiste de la Fontaine"` vs `"Ali"`)
- [ ] What happens on a small screen or narrow viewport?

**Rule:** Design with the worst-case content, not the ideal content. The ideal content is never what ships.

**Anti-pattern: The lorem ipsum trap**
Layout looks perfect with "Lorem ipsum dolor sit amet." Ships broken because the real product description is 400 words or 3 words.

Fix: Test with real content samples before finalizing. If real content isn't available, test with the shortest and longest plausible values.

---

### Step 5 — Define the Component API

If building a reusable component, its API is as important as its visual design.

**For every component, define:**

```
PROPS:
  required:  [name: type — what must always be passed]
  optional:  [name: type = default — what has a sensible default]
  callbacks: [onX: (payload) => void — what events it emits]

SLOTS / CHILDREN:
  [what content can be injected, if any]

CONSTRAINTS:
  [what this component must never do — e.g., "never fetches its own data"]
```

**Rules:**
- A component must not fetch its own data. It receives data as props and renders it. Data fetching belongs one level up.
- A component must not know about the page it lives on. It must work identically in any context.
- Optional props must have explicit defaults. Never let a missing prop produce a broken render.
- Callbacks must be named for what happened, not what should happen next. `onSelect` not `openModal`.

**Anti-pattern: The self-aware component**
```
Wrong:
<TransactionRow /> internally calls the API, knows it's on the Dashboard page,
and conditionally renders differently based on a global store value.

Right:
<TransactionRow transaction={tx} onSelect={handleSelect} />
Receives everything it needs. Knows nothing about where it lives.
```

---

### Step 6 — Accessibility Baseline

A component that is visually correct but inaccessible is not done.

**Non-negotiable baseline:**

- [ ] Interactive elements (buttons, links, inputs) are reachable and operable via keyboard.
- [ ] Focus states are visible — not removed with `outline: none` without a replacement.
- [ ] Color is not the only way to convey information (error state = red icon AND text, not red color alone).
- [ ] Images and icons have alt text or are marked decorative (`aria-hidden`).
- [ ] Form inputs have associated labels — not just placeholder text.
- [ ] Error messages are associated with the input they describe (`aria-describedby`).

**Rule:** Placeholder text is not a label. When the user starts typing, the placeholder disappears and they've lost the context of what the field is for.

---

## Quality Lenses

Activate based on project context.

---

### L1 — Design System Consistency Lens

> Activate when: multiple developers build UI in parallel, or the product will grow over time.

**The principle:** A design system is only as strong as its enforcement. Without active governance, it drifts into a collection of similar-but-not-quite-identical components.

**Consistency audit — apply to every new component:**

- [ ] Does this component introduce a new visual pattern not in the design system? If yes — is it justified, or is it drift?
- [ ] Does this component duplicate an existing one with minor differences? If yes — extend the existing one.
- [ ] Are the component's tokens (spacing, color, radius, shadow) sourced from the global token set?
- [ ] Would a new developer, looking at this component, know which design system element it corresponds to?

**The naming rule:** Component names must match design system names exactly. If the design system calls it `CardSurface`, the component is `CardSurface` — not `ContentBox`, `InfoPanel`, or `WidgetWrapper`. Divergent naming is the first symptom of a fracturing design system.

**Anti-pattern: Shadow token proliferation**
```
Wrong: --shadow-sm, --shadow-card, --shadow-modal, --shadow-elevated,
       --shadow-dropdown, --shadow-tooltip (all slightly different, all undocumented)

Right: --shadow-1 (subtle), --shadow-2 (raised), --shadow-3 (floating)
       Three levels. Every component picks one. No exceptions.
```

---

### L2 — Motion and Feedback Lens

> Activate when: the product needs to feel polished, or user actions currently feel unresponsive.

**The principle:** Motion communicates state change. Without it, users lose track of what happened and what the system is doing.

**Motion checklist:**

- [ ] Does every user action produce an immediate visual response — even if the result isn't ready yet?
- [ ] Do state transitions (loading → success, collapsed → expanded) animate — or do they snap?
- [ ] Is motion purposeful — does it reinforce spatial relationships and state changes — or decorative?
- [ ] Is motion fast enough not to feel sluggish? (Most UI transitions: 150–250ms. Anything over 400ms feels slow.)
- [ ] Is motion reduced or disabled when the user has set `prefers-reduced-motion`?

**Feedback hierarchy:**
```
Immediate (0ms)    → button press visual response (active state)
Fast (100–200ms)   → hover states, focus rings, toggle switches
Standard (200–300ms) → panel open/close, dropdown appear, modal enter
Slow (300–500ms)   → page transitions, heavy content loads
Never animate      → error messages (must appear instantly, not fade in)
```

**Anti-pattern: The disappearing action**
User clicks a button. Nothing visibly changes for 800ms while the server responds. User clicks again. Duplicate request.

Fix: Disable the button immediately on click. Show a loading indicator. Re-enable on completion or error.

---

### L3 — Responsive Behavior Lens

> Activate when: the product is used on multiple screen sizes, or mobile usage is significant.

**The principle:** Responsive design is not shrinking a desktop layout. It is designing a different information priority for each context.

**Responsive checklist — for every screen:**

- [ ] On mobile, is the primary action still reachable without scrolling?
- [ ] Do tables degrade gracefully? (Horizontal scroll, collapsed rows, or card view — not overflow hidden.)
- [ ] Are touch targets at least 44×44px? A link that's 12px tall is unusable on a touchscreen.
- [ ] Does the layout reflow — or does it just scale down? Scaling down is not responsive design.
- [ ] Are modals and drawers full-screen on mobile? A 400px modal on a 375px screen is a UX failure.

**The content priority rule:** On mobile, decide what gets hidden. Not "everything fits if we shrink it" — but "these three things are critical, these two are secondary, this one disappears on small screens." Explicit priority is better than accidental overflow.

---

### L4 — Data Density Lens

> Activate when: the product is used by power users, handles large datasets, or is a back-office / operational tool.

**The principle:** Consumer products optimize for clarity. Operational tools optimize for density. These require different design decisions. Don't apply consumer UI patterns to a tool used by an analyst who needs 50 rows visible at once.

**Density checklist:**

- [ ] Are tables paginated or virtualized — not limited to 10 rows because the design assumed small datasets?
- [ ] Can the user control visible columns? Power users need different columns than occasional users.
- [ ] Are bulk operations available? A user who needs to process 200 records needs selection + batch action.
- [ ] Are filters persistent across sessions? Power users shouldn't re-apply the same filters every day.
- [ ] Is keyboard navigation supported for tables and lists? A user who processes hundreds of rows per day cannot use a mouse for every action.

**Anti-pattern: The consumer UI on an operational tool**
Large card grid with illustrations, big whitespace, one action per card. Looks great in a demo. In production, the operations team needs to process 300 items a day and is clicking through 12 screens to do what should take 2.

Fix: When the user is a professional using the tool daily, optimize for their workflow — not for the impression it makes on a first-time visitor.

---

## Anti-Patterns (Recurring Across Projects)

**Anti-pattern: The invisible empty state**
A list, table, or feed that simply shows nothing when there's no data. The user doesn't know if it's loading, if there's an error, or if there genuinely is no content.
Fix: Every container that can be empty must have an explicit empty state design — minimum: an icon, a message, and (when applicable) a call to action.

**Anti-pattern: The permanent skeleton**
A loading skeleton that is never replaced because the error state wasn't implemented. The user sees loading spinners forever.
Fix: Every loading state must have a defined timeout or error fallback.

**Anti-pattern: The overloaded modal**
A modal that contains a full form, with multiple sections, multiple actions, and its own navigation. Modals are for focused, single-question interactions.
Fix: If the task takes more than one decision, it belongs on its own page.

**Anti-pattern: The unstyled error**
API returns an error. The UI displays `Error: 500 Internal Server Error` in plain text, or displays nothing at all.
Fix: Every error state has a human-readable message, a visual treatment consistent with the design system, and (when possible) a recovery action.

**Anti-pattern: Inconsistent action placement**
Primary action is bottom-right on one screen, top-left on another, floating in the middle on a third.
Fix: Action placement is a design system decision. Primary actions go in one place, consistently, across all screens.

---

## Principles (Technology-Agnostic)

1. **A component is not done until every state is designed.** The happy path is the easiest part.
2. **Every visual value that isn't a token is future inconsistency.** Use the design system or extend it — never bypass it.
3. **Visual hierarchy is a contract with the user's attention.** One primary. Everything else is secondary.
4. **Design with the worst-case content.** The ideal content never ships.
5. **A component must not know where it lives.** It receives data, renders output, emits events. Nothing more.
6. **Accessibility is not a layer added at the end.** An inaccessible component is an incomplete component.
7. **Motion communicates state.** Absence of feedback is absence of trust.
8. **Consistency over originality.** The tenth screen should feel like the first screen.
9. **An empty state is a feature.** Design it with the same care as the success state.
10. **When in doubt, do less.** A sparse screen is recoverable. A cluttered screen destroys trust.

---

## Questions to Ask Before Shipping

**Core (always):**
- What does this component look like with no data?
- What does it look like while data is loading?
- What does it look like when the request fails?
- What does it look like with the longest realistic content?
- What does it look like with the shortest realistic content?
- Is every visual value sourced from a design token?
- Does an existing component already solve this problem?

**Design System (L1):**
- Would a new developer know which design system element this corresponds to?
- Does this component introduce undocumented tokens or patterns?

**Motion (L2):**
- Does every user action produce an immediate visual response?
- Is there any transition that snaps instead of animates?

**Responsive (L3):**
- Is the primary action reachable on mobile without scrolling?
- Do all touch targets meet the 44×44px minimum?

**Density (L4):**
- Can a power user accomplish their core workflow without a mouse?
- Are filters and column preferences persistent?

---

## Output Format

When this skill is invoked, produce:

1. **Active lenses** (which of L1–L4 apply and why)
2. **Component contract** (Step 0 verification block — input, output, states, variants)
3. **State matrix** (every applicable state with its defined visual treatment)
4. **Design system anchoring** (existing components used, tokens applied, new patterns justified)
5. **Hierarchy audit** (what is primary, secondary, tertiary on this screen)
6. **Real content test** (shortest, longest, null — does the layout hold?)
7. **Component API** (props, defaults, callbacks, constraints)
8. **Lens findings** (findings from each active lens)
9. **Implementation plan** (markup structure, token references, what to build first)

Do NOT skip items 2, 3, or 6. A component without a state matrix and a real content test is not ready to implement.
