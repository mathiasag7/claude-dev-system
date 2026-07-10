---
name: visual-design
version: 1.1.0
description: Design visual mockups and screens like an expert human designer — using the project's declared design canvas MCP, a persistent design memory (shell contract + design system + component library), an art-direction step, and a mandatory cross-page consistency pass. Guarantees that what was decided on one screen (header, navigation, tokens, spacing, components, page patterns) is never silently forgotten on the next. Runs BEFORE frontend-ui-skill (which implements what this skill designs).
category: design
tags: [visual-design, mockup, maquette, design-system, art-direction, canvas, consistency, shell-contract, component-library]
---

# Visual Design Skill

Use this skill whenever the task is to **design what a screen looks like** — a mockup, a maquette, a new page, a visual overhaul of an existing page, an evolution of the design system or its art direction — as opposed to implementing an already-designed component (`frontend-ui-skill`) or designing a flow's steps and feedback (`frontend-ux-skill`).

**The core problem this skill exists to solve: design amnesia between screens.** A model designs a beautiful dashboard with a persistent topbar, then designs the Notifications page of the same product with no header at all — not because it decided to, but because nothing forced it to remember. The fix is not discipline; it is architecture: **design knowledge lives in the component library and in files, not in the conversation.** Every visual task starts by loading the design memory and ends by checking against it.

**The second discipline: design like a human expert, not a component assembler.** A human designer does not start by picking widgets. They ask: what must exist here, for whom, what is the best representation of each piece of information, and how do I arrange it so the user feels oriented and the task feels easy? Those questions are Step 2 — mandatory, before anything is drawn.

---

## The Design Canvas (declared, not hardcoded)

This skill does not name a specific tool. The concrete canvas is **declared in the design memory** — the first line of `DESIGN-SYSTEM.md`:

```
CANVAS: [the design canvas MCP for this project — e.g. Pencil MCP]
```

If undeclared, resolve it at Step 0: check PROJECT.md §2, then the connected MCPs; if still ambiguous, ask once and record the answer.

**What is required of the canvas is not a name but three capabilities:**

1. **Reusable components** (symbols/components with variants) — the library IS the memory of pixels.
2. **Frame templates** (or duplicatable master frames) — the shell template every new screen starts from.
3. **Export/screenshot** — Step 4's mechanical comparison depends on it.

At Step 0, **list the declared MCP's tools and read their schemas — never guess tool names or parameters** — and verify the three capabilities are covered. If one is missing, that is a finding to raise to the human (with the degraded-mode consequence stated, e.g. "no component support → consistency relies entirely on the .md contract and manual checks"), never a silent workaround.

---

## Relationship to the Other Skills

- **`product-thinking-skill`** decides WHAT should exist on the screen (fields, information, actions, conditional behavior). It runs first when the content itself is in question.
- **THIS skill** decides WHAT IT LOOKS LIKE and HOW IT IS COMPOSED — and keeps it consistent across every screen.
- **`frontend-ui-skill`** implements the designed components in code (states, contracts, variants).
- **`frontend-ux-skill`** designs the flow across screens (steps, feedback, failure modes).
- **`design-audit-skill`** remediates an existing messy design. It PRODUCES the canonical system; this skill CONSUMES and extends it. Both read and write the same design memory.

---

## When to Trigger

- Designing a mockup/maquette for a new screen or page
- Visually redesigning or evolving an existing screen
- Creating or evolving the design system (tokens, typography, components, page patterns) or the art direction
- Any request phrased as "design", "maquette", "mockup", "à quoi devrait ressembler", "propose un design/une interface pour"
- Any work performed in the project's design canvas MCP
- Reviewing whether a set of screens is visually coherent

**This skill does NOT trigger for:**
- Implementing an already-designed component in code (`frontend-ui-skill`)
- Flow logic, form steps, validation feedback (`frontend-ux-skill`)
- Deciding which fields/data a screen contains (`product-thinking-skill` — run it first if content is unsettled)
- Full remediation of a messy legacy design (`design-audit-skill` — though its output feeds this skill's memory)

---

## The Design Memory (the anti-amnesia mechanism)

The memory has TWO halves, and **every component decision materializes in BOTH — one without the other is incomplete:**

### Half 1 — The canvas component library (the truth of pixels)
Every component (card, button, stat-card, notification-row, badge, filter-pills, ...) exists as a **reusable component in the canvas**, with its variants. The global shell itself is a component/master-frame template. Composing a screen = **instantiating** library components — never redrawing them. A new screen physically starts as a duplicate of the shell template: a header cannot be forgotten when it is part of the frame you start from.

### Half 2 — The files under `.claude/design/` (the truth of rules and reasons)
Versioned in git. What pixels cannot say:

**`SHELL-CONTRACT.md`** — the invariants EVERY screen of a surface must carry:

```
## Shell Contract — [product / surface name]

### Global shell (present on EVERY authenticated screen — no exceptions)
- Topbar: [content, height, behavior — e.g. "logo→back-to-site · Achats/Ventes switch ·
  notifications · cart · profile menu; persistent, never scrolls away"]
- Sidebar / nav: [what it contains, what it NEVER contains]
- Page header pattern: [e.g. "Serif display title + one-line muted subtitle, 32px top spacing"]
- Shell template location: [where the master frame lives in the canvas]

### Page-type templates
- DASHBOARD: [stat-card row → main content area; card grid rules — canvas template ref]
- LIST/FEED:  [title + subtitle → filter pills left / bulk action right → grouped list — ref]
- FORM:       [sections numbered, 2-col grid, odd last field spans full width — ref]
- DETAIL:     [...]

### Exceptions (explicit, with reason)
- [screen]: [which invariant is waived and WHY — e.g. "auth pages: no sidebar, marketing shell"]
```

**`DESIGN-SYSTEM.md`** — `CANVAS:` declaration; the concept study and art direction (Step 1); tokens (semantic colors, type scale, spacing, radii, elevation); and the **component index**: one line per library component — name, canvas location, usage rule ("stat-card: dashboard KPIs only, never inside lists"), variants. This index is what Claude reads in one second at session start to know what exists before opening the canvas.

**Bootstrap rule:** if the memory doesn't exist, the FIRST visual task begins by creating BOTH halves — inventory existing screens (canvas snapshots/screenshots), extract the de facto tokens and shell, build the initial component library and shell template in the canvas, write the two files, and get the whole confirmed by the human before designing anything new.

**Update rule:** every decision made during a design task (new component, new template, waived invariant, direction change) is materialized in both halves in the same task — not "later". A decision not in the library AND the index does not exist for the next screen.

---

## Process

### Step 0 — Load the Design Memory

1. Read `.claude/design/SHELL-CONTRACT.md` and `.claude/design/DESIGN-SYSTEM.md` in full. If absent → Bootstrap rule.
2. Resolve the CANVAS declaration; list the declared MCP's tools, read their schemas, verify the three capabilities (components, frame templates, export). Missing capability → raise, don't work around.
3. Read PROJECT.md (persona, domain, vocabulary).
4. Identify the page type being designed and locate its template and the relevant components in the library (via the component index first, then the canvas).

### Step 1 — Concept Study (once per project, refreshed when it drifts)

Answer, in writing, from PROJECT.md + the existing screens (or re-read the block at the top of DESIGN-SYSTEM.md if it exists):

```
WHAT THIS PRODUCT IS:      [one sentence]
WHO USES THIS SURFACE:     [persona + state of mind — e.g. "a seller checking money and problems, often on the go"]
BRAND ADJECTIVES (3-5):    [e.g. "warm, trustworthy, calm, editorial" — every visual choice must be
                            defensible against these]
WHAT "SATISFYING" MEANS HERE: [e.g. "money status visible in 2 seconds; problems impossible to miss;
                               nothing feels bureaucratic"]
```

If a new screen contradicts this block, that is a finding to raise, not to silently absorb.

### Step 1-bis — Art Direction Exploration (conditional)

**Triggers in exactly two cases:** (a) bootstrap of a product with no established visual identity, or (b) an explicit request to reposition/refresh the visual identity. **In every other case this step is SKIPPED — holding an established direction IS the art direction of a live product.**

When triggered:

1. Produce **2-3 style tiles in the canvas** — small boards, not full screens: display + body typography, palette, one button, one card, one representative screen fragment.
2. Name each direction's **intention** in one line (e.g. "warm editorial marketplace" / "sober fintech trust" / "vivid street-market energy") and state what each optimizes and trades off (e.g. warmth vs. perceived rigor).
3. Present the tiles to the human. **The human picks — the skill never self-selects a direction.**
4. The chosen direction becomes the source of Step 1's brand adjectives and the initial token set — written into DESIGN-SYSTEM.md, tiles kept in the canvas as reference.

Exploration outside these two triggers is noise: proposing three new directions for screen #14 of a coherent product is how identities die.

### Step 2 — Interrogate the Screen Like a Designer

Before drawing anything, answer for THIS screen:

```
PURPOSE:        What is this screen FOR, in one sentence? (Two sentences → maybe two screens.)
AUDIENCE:       Who lands here, coming from where, in what state of mind, how often?
MUST EXIST:     What information and actions must be present — in the user's priority order?
                (Content unsettled or conditional → stop, run product-thinking-skill first.)
REPRESENTATION: For each element, the BEST representation — not the default one:
                  a number → stat card? plain text? with trend?
                  a list → table (dense, comparable) or cards (scannable, actionable)?
                  a status → badge color? icon? position?
                  time → absolute or relative? grouped by day?
ORIENTATION:    Where does the eye land first? Can the user answer "where am I / what can I do /
                what happened / what's next" without reading everything?
PERCEIVED EASE: What makes this FEEL easy — fewer visible choices, stronger grouping, whitespace,
                one obvious primary action? What would make it feel bureaucratic?
EMPTY/EDGE:     Zero data, one item, 500 items, a very long title — what does each look like?
```

Unanswerable questions follow the product-thinking discipline: resolve from the memory and existing screens first; ask only the residual, each with a recommended answer and one-line rationale.

### Step 3 — Compose in the Canvas, by Instantiation

- **Start by duplicating the shell template** for this page type. The shell is on the frame before any content exists — never added "if there's time".
- **Instantiate library components; never redraw them.** A needed component that doesn't exist is created AS a library component first (with its index line), then instantiated — never drawn inline as a one-off.
- Tokens only (semantic colors, type scale, spacing scale) — no ad-hoc hex, no ad-hoc size. A value outside the system is a mistake or an explicit new token proposal.
- Hierarchy through type scale and spacing, not decoration.
- Design the empty, loading, and overflow states from Step 2's EMPTY/EDGE line.

### Step 4 — Cross-Page Consistency Pass (mandatory, mechanical)

This is the step that prevents "dashboard has a topbar, Notifications has none".

1. **Export/screenshot the new screen** via the canvas.
2. **Open at least TWO sibling screens** of the same surface (most recently designed + most used).
3. **Walk the shell contract line by line:**

```
CONSISTENCY CHECK — [screen] vs SHELL-CONTRACT + [sibling A] + [sibling B]
  Topbar present & conforming:        [yes / NO → fix or justify]
  Sidebar/nav conforming:             [...]
  Page header pattern:                [...]
  Tokens only:                        [any ad-hoc value found?]
  Page-type template respected:       [...]
  Instantiated from library (no inline near-duplicates of existing components): [...]
```

4. **Every delta is exactly one of two things:** a bug in the new screen (→ fix now) or a deliberate improvement (→ it applies to the CONTRACT — update the shell template/component in the library, record in SHELL-CONTRACT.md, flag sibling screens as pending alignment). A delta neither fixed nor recorded is forbidden — that is the amnesia this skill kills.

### Step 5 — Update the Memory and Hand Off

1. Materialize every new decision in BOTH halves: component/template in the canvas library + index line and rules in the files. Record exceptions with reasons; list screens pending alignment.
2. Hand off to `frontend-ui-skill` with: the frame/screenshot, the components and tokens used (by index name), and the designed states. Implementation builds what was designed — it does not re-decide the design.

---

## Anti-Patterns

**Anti-pattern: The orphan page**
A screen ships without the global shell (no topbar, no nav) while every sibling has one.
Fix: screens start as duplicates of the shell template (Step 3), and Step 4's contract walk is mandatory.

**Anti-pattern: Memory in the model**
Design decisions live in chat history; the next session or screen silently reinvents them.
Fix: the two-half memory. A decision not in the library AND the index does not exist.

**Anti-pattern: The described-but-not-built component**
The .md describes a card; the canvas has no such component; every screen redraws its own version.
Fix: the dual materialization rule — canvas component + index line, both, same task.

**Anti-pattern: Per-page reinvention**
Each new screen gets its own slightly-different header, radius, gray.
Fix: instantiation only; inline near-duplicates are a Step 4 finding, not a style choice.

**Anti-pattern: Widget-first design**
The screen is assembled from available components before anyone asked what the user needs first.
Fix: Step 2 answered in writing before anything is drawn.

**Anti-pattern: Direction exploration on screen #14**
New visual directions proposed mid-product "to freshen things up", forking the identity.
Fix: Step 1-bis triggers ONLY on bootstrap or explicit repositioning; otherwise holding the direction is the job.

**Anti-pattern: The self-selected direction**
The model explores directions and picks one itself.
Fix: Step 1-bis rule 3 — the human picks, always.

**Anti-pattern: Decoration as hierarchy**
Importance signaled with colors, borders, icons instead of size, weight, position, space.
Fix: hierarchy from type and spacing scales; decoration defensible against the brand adjectives.

**Anti-pattern: Happy-state-only mockups**
Five perfect items in the maquette; zero, one, or five hundred in production.
Fix: Step 2's EMPTY/EDGE, designed in Step 3.

**Anti-pattern: The silent contract fork**
A new screen improves the shell but the improvement stays local — two de facto contracts.
Fix: an improvement applies to the contract (template updated, siblings flagged) or it doesn't ship.

**Anti-pattern: Guessing canvas tools**
Tool names/parameters invented from memory; calls fail or corrupt the document.
Fix: Step 0.2 — list the declared MCP's tools and read their schemas before the first call.

**Anti-pattern: Hardcoding the tool instead of the capabilities**
The process breaks the day the canvas changes, or silently degrades when the tool lacks components.
Fix: the canvas is declared in the memory; the skill requires three capabilities and raises a finding when one is missing.

---

## Principles

1. **Design knowledge lives in the component library and in files, not in the conversation.** Load before, check after, write during.
2. **The shell is the product's promise that the user is still in the same place.** Screens start FROM it, not end with it.
3. **Every component decision materializes twice: in the canvas library and in the index.** One without the other is incomplete.
4. **Ask the designer questions before drawing:** what must exist, for whom, best representation, orientation, perceived ease.
5. **Art direction is explored at bootstrap or repositioning — and held everywhere else.** The human picks the direction; the skill defends it.
6. **Every visual choice is defensible against the brand adjectives.** "It looks nice" is not a justification.
7. **Tokens only; instantiation only.** A value or a drawing outside the system is a mistake or an explicit proposal.
8. **A cross-page delta is a bug or a contract change. There is no third state.**
9. **Consistency is checked mechanically (contract walk + sibling comparison), not remembered.**
10. **Design the empty, loading, and overflow states — the happy path is the easy 20%.**
11. **The canvas is a declared dependency with required capabilities, not a hardcoded name.**

---

## Output Format

When this skill is invoked, produce:

1. **Design memory status** (Step 0 — loaded or bootstrapped; canvas resolved, capabilities verified)
2. **Concept study** (Step 1 — reused or derived) — plus, if triggered, **art-direction tiles** (Step 1-bis) **[wait for the human's pick]**
3. **Screen interrogation** (Step 2 — answered block; residual questions with recommendations) **[wait only if residual questions exist]**
4. **The composed screen in the canvas** (Step 3 — instantiated from the library, including empty/edge states)
5. **Consistency check report** (Step 4 — contract walk, every delta resolved as fix or contract change)
6. **Memory update + handoff note** (Step 5 — what was added to the library and the files; what frontend-ui implements)

Step 4's report is non-negotiable: a screen delivered without its consistency check is not delivered. Step 1-bis's human pick is non-negotiable when it triggers: the skill never self-selects an art direction.

---

## Lessons Learned

> Add entries when a shipped screen revealed a consistency gap or a wrong representation choice this skill should have caught.
> Format: [DATE] — [PROJECT] — [lesson]

```
[2026-07] — marketplace seller space — The Notifications page shipped without the global shell
(topbar/nav) while the Dashboard had one — same surface, same session. Root cause: design
decisions lived only in the conversation. The two-half Design Memory + Step 4 exists because of it.
```
