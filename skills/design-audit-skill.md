---
name: design-audit-remediation
version: 1.0.0
description: Audit and remediate an existing product whose design is inconsistent, degraded, or was never systematized. Derives a canonical design system from the best of what exists, then migrates the product to it page by page — without a big-bang redesign and without inventing a new aesthetic mid-flight. This is the remediation counterpart to frontend-ui-skill, which assumes a design system already exists.
category: engineering
tags: [frontend, design-audit, remediation, visual-debt, design-system, migration, tokens, screenshots]
requires: [frontend-ui-skill, frontend-ux-skill]
---

# Design Audit & Remediation Skill

Use this skill when the design of an existing product is the problem — inconsistent, messy, degraded, or never designed in the first place. It produces a canonical design system derived from the codebase itself, then a controlled page-by-page migration.

**This skill is not for building new UI.** Once the canonical system exists (end of Phase 2), every individual component or screen rebuild is handed to `frontend-ui-skill.md` and `frontend-ux-skill.md`. This skill governs the audit, the system derivation, and the migration sequence — nothing else.

**The cardinal rule: no page is modified before the canonical system is confirmed by the human.** Restyling pages one by one against personal taste produces a *new* layer of inconsistency on top of the old one. That is the most common failure mode of design remediation, and the one this skill exists to prevent.

---

## When to Trigger

- The user says the design is messy, inconsistent, ugly, outdated, or "all over the place"
- Two or more screens solve the same visual problem differently and nobody can say which is correct
- There is no design system, or the design system exists on paper but the code ignores it
- A redesign is requested without a target design being provided
- Visual debt is blocking feature work ("we can't add this screen because we don't know which button style to copy")

---

## Triage — Fast Exit

- **A design system exists and is respected, and one page drifted?** → Skip this skill. Use `frontend-ui-skill.md` to bring the page back to the system.
- **The user provides a complete target design (Figma, mockups) for the whole product?** → Skip Phases 1–2 (the system is given, not derived). Start at Phase 3 with the provided system as canonical.
- **Everything else** → Run the full process.

**Escalation rule:** If during the audit you discover the inconsistency is not visual but *structural* — duplicated components with diverging logic, pages built on incompatible architectures — stop. That is `architecture-refactoring-skill.md` territory and must be sequenced before or alongside the visual migration. Restyling structurally broken code wastes the restyling.

---

## Process

### Phase 0 — Establish Visual Access

Design quality is a *visual* judgment. Code alone reveals token inconsistency and duplication, but it cannot reveal that a page looks bad, cramped, unbalanced, or dated.

**Before anything else, determine the level of visual access available:**

```
VISUAL ACCESS LEVEL:
  A — Rendered access: a browser/devtools MCP is available; pages can be
      rendered, screenshotted, and inspected at multiple viewports.
  B — Static access: the human provides screenshots of the key pages.
  C — Code-only: no rendering, no screenshots.
```

**Selecting the rendering tool (Level A).** Do not hardcode one product. Choose in this order:
1. If a Chrome DevTools MCP is available, use it.
2. Otherwise use whatever browser/rendering MCP is available (e.g. Playwright MCP).
3. If none is available and you cannot tell which the project uses, **ask the human** which tool to use — or ask them to provide screenshots (falling back to Level B), or confirm this is Level C. Do not guess at a tool name.

If PROJECT.md records a canonical visual-testing tool (see Technical Stack / Established Patterns), use that without re-asking. Otherwise, once resolved, propose recording it in PROJECT.md so future sessions don't re-ask.

**Rules per level:**
- **Level A:** Screenshot every page in the page census (Phase 1) at desktop and mobile widths, before any change. These are the audit baseline and the migration before/after evidence.
- **Level B:** Request screenshots of, at minimum, the 5 most-used pages and any page the user called out as bad. Audit what is visible; flag the rest as unverified.
- **Level C:** State explicitly, in the audit report and to the human: *"This audit is code-only. It detects inconsistency and duplication. It cannot judge visual quality. Recommendations about layout, hierarchy, and aesthetics are inferences, not observations."* Do not present code-only findings as visual findings.

**Anti-pattern: The blind aesthete**
Claiming "this page looks cluttered" or "the hierarchy is broken" from reading JSX. Code shows what is *built*, not what is *seen*. A visual claim without visual access is a guess — label it as such or don't make it.

---

### Phase 1 — Inventory (Look, Don't Touch)

Measure the mess before deciding anything. **No fixes during this phase — not even "obvious" ones.** Fixing while inventorying contaminates the audit and starts the migration before the target exists.

**1a — Token census.** Extract from the entire codebase:

```
COLORS:      every distinct color value (hex, rgb, hsl, named) + usage count + where
SPACING:     every distinct margin/padding/gap value + usage count
TYPOGRAPHY:  every font-family / font-size / font-weight / line-height combination
RADII:       every border-radius value
SHADOWS:     every box-shadow value
BREAKPOINTS: every media query threshold
```

Use code search (grep/AST), not memory. Report counts honestly: "47 distinct colors, of which 9 account for 90% of usage" is the kind of finding that drives Phase 2.

**1b — Component census.** Identify every implementation of the same visual concept:

```
CONCEPT: "Card"
  Implementations found: 6
  - components/Card.tsx          (used 23×)
  - components/InfoBox.tsx       (used 8×)  — same thing, different padding/shadow
  - pages/dashboard/Panel.tsx    (used 4×)  — inline styles, diverged
  ...
```

Do this for at least: buttons, cards/panels, form inputs, tables/lists, modals, navigation, page headers, empty/error states.

**1c — Page census.** List every page/route with: purpose, traffic or importance (ask the human if unknown), and a one-line state assessment (consistent / drifted / chaotic / unverified).

**Output of Phase 1 — the Audit Report:**

```
AUDIT REPORT
  Visual access level:    [A/B/C]
  Token census:           [counts per family, with top-usage values]
  Component census:       [concepts × implementations, with usage counts]
  Page census:            [pages, importance, state]
  Structural findings:    [anything that escalates to architecture-refactoring]
  Severity assessment:    [where the worst debt is concentrated]
```

Present this to the human before Phase 2. The audit is a deliverable in itself.

---

### Phase 2 — Derive the Canonical System

**The principle: curate, don't create.** The canonical system is derived from the *best of what already exists* — the highest-usage, most coherent patterns — not from a new aesthetic invented during remediation. A remediation that introduces a brand-new visual language is a redesign wearing a remediation costume, and it doubles the migration cost.

For each token family, make one explicit decision:

```
DECISION — COLORS:
  Canonical: [the chosen palette, as semantic tokens: color-primary, color-text-danger, ...]
  Derived from: [which existing values were kept and why — usually the highest-usage coherent set]
  Eliminated: [the other N values, each mapped to its nearest canonical token]

DECISION — SPACING:    [scale chosen, e.g. 4/8/12/16/24/32/48, + mapping of stragglers]
DECISION — TYPOGRAPHY: [type scale: roles → size/weight/line-height]
DECISION — RADII:      [2–3 levels maximum]
DECISION — SHADOWS:    [2–3 levels maximum — per frontend-ui-skill L1]
```

For each component concept with multiple implementations: **pick one survivor** (usually the most-used or best-built), define its variants to absorb the others' legitimate differences, and mark the rest for elimination with a mapping table (`InfoBox` → `Card variant="muted"`).

**Produce `DESIGN-SYSTEM.md`** (or equivalent) containing the tokens, the surviving components with their variants, and the elimination mappings.

**Confirmation gate — mandatory.** Present the proposed system to the human with: what was kept, what dies, and any judgment calls where two existing patterns were equally defensible. **Do not proceed to Phase 3 without explicit confirmation.** Per CLAUDE.md §1.5, every choice here must be traceable — "this one looked better" is not a justification; "this one is used 23× vs 4× and already handles all states" is.

---

### Phase 3 — Prioritize the Migration

Never migrate everything at once. Sequence by:

1. **Foundation first:** token definitions + the survivor components. Migrating pages before the system's building blocks exist forces rework.
2. **Highest-visibility pages next:** the pages users see most. Maximum perceived improvement per unit of work.
3. **Worst-debt pages after:** chaotic but low-traffic pages.
4. **Cleanup last:** delete eliminated components and dead styles only after nothing references them.

```
MIGRATION PLAN:
  Batch 0: tokens + Button, Card, Input, Modal (the survivors)
  Batch 1: [pages, in order] — rationale: [traffic/importance]
  Batch 2: ...
  Each batch = one reviewable unit. No batch starts until the previous is merged.
```

**The blast-radius rule:** each batch must be independently shippable. A half-migrated product with a clear boundary ("settings pages are new-system, reports are legacy") is acceptable and normal. A product where every page is half-migrated is worse than the original mess.

---

### Phase 4 — Migrate, Page by Page

For each page in the current batch:

1. **Before-evidence:** screenshot at desktop + mobile (Level A) or note "unverified" (Level C).
2. **Map:** list every non-canonical value and component on the page → its canonical replacement, using the Phase 2 mapping tables. Anything with no mapping is a *new* design decision → back to the human, not improvised inline.
3. **Hand off the rebuild:** each component built or significantly modified goes through `frontend-ui-skill.md` (contract, state matrix, real-content test). Each flow touched goes through `frontend-ux-skill.md`. **Migration is not an excuse to skip state coverage — it is the one chance to add the empty/error/loading states the page never had.**
4. **Behavior freeze:** remediation changes how the page *looks*, not what it *does*. If a behavior change is genuinely warranted, per CLAUDE.md §1.8 report it and wait — do not bundle it silently into a visual diff.
5. **After-evidence:** screenshot again, same viewports. Present before/after. At Level A, also verify: no horizontal overflow at 375px, focus states visible, no layout break with longest realistic content.
6. **Record:** page marked migrated in the plan; any new mapping decisions appended to DESIGN-SYSTEM.md.

---

### Phase 5 — Lock It In

A remediated design without enforcement degrades back within months.

- [ ] Lint rules (e.g. stylelint/ESLint) banning raw color values and non-scale spacing in app code — tokens only.
- [ ] Eliminated components deleted, with a redirect comment or codemod so old imports fail loudly, not silently.
- [ ] PROJECT.md updated: Decision Log entry for the canonical system; "bypassing design tokens" added to What Is Forbidden; DESIGN-SYSTEM.md referenced in Established Patterns.
- [ ] `frontend-ui-skill.md` Step 2 now has a real design system to anchor to — state this explicitly so future sessions use it.

---

## Anti-Patterns

**Anti-pattern: The big-bang redesign**
"Make the whole site look good" executed as one giant change. Unreviewable, unshippable, and abandoned at 60%.
Fix: derive the system, confirm it, migrate in shippable batches.

**Anti-pattern: The new aesthetic smuggled in**
Mid-migration, pages start getting a look that exists nowhere in the original product because it "seemed nicer."
Fix: the canonical system is fixed at the Phase 2 gate. New aesthetics are a separate, explicitly-agreed project.

**Anti-pattern: Fixing while inventorying**
"While auditing I went ahead and cleaned up a few obvious things." Now the audit no longer describes the codebase, and the migration started before the target existed.
Fix: Phase 1 is read-only. No exceptions.

**Anti-pattern: The code-only visual verdict**
Declaring pages ugly or cluttered without ever rendering them.
Fix: Phase 0. State the access level; label inferences as inferences.

**Anti-pattern: Migration as silent feature work**
"While restyling the form I also changed the validation logic." A visual diff that hides a behavior change is unreviewable.
Fix: behavior freeze. Report discovered behavior problems; fix them in separate, labeled changes.

---

## Principles

1. **Curate, don't create.** The canonical system is the best of what exists, made consistent.
2. **No modification before the system is confirmed.** Taste-driven page fixes are new debt.
3. **A visual claim requires visual access.** Otherwise it is an inference — label it.
4. **Each batch independently shippable.** A clean boundary beats a uniform half-measure.
5. **Remediation freezes behavior.** Look changes; function doesn't — unless explicitly agreed.
6. **The audit is a deliverable.** Even if migration never happens, the team now knows the true state.
7. **Enforcement outlives the migration.** Without lint rules and a Decision Log entry, the mess returns.

---

## Questions to Ask Before Shipping (each batch)

- Is every value on the migrated pages a canonical token?
- Does every migrated component pass the frontend-ui-skill state matrix and real-content test?
- Do the before/after screenshots show improvement without behavior change?
- Did any mapping decision get made inline that isn't recorded in DESIGN-SYSTEM.md?
- Could a reviewer tell exactly where the new-system/legacy boundary now sits?

---

## Output Format

When this skill is invoked, produce in order — with a human confirmation gate after items 2 and 3:

1. **Visual access level** (A/B/C, and what that limits)
2. **Audit Report** (token census, component census, page census, severity) → *human review*
3. **Canonical system proposal** (decisions per token family, survivor components, elimination mappings, DESIGN-SYSTEM.md draft) → *human confirmation — hard gate*
4. **Migration plan** (batches, order, rationale, blast-radius boundaries)
5. **Per-page migration records** (before-evidence, mapping, ui/ux-skill handoffs, after-evidence)
6. **Lock-in checklist** (lint rules, deletions, PROJECT.md updates)

Do NOT skip items 1, 2, or the gate after 3. A migration started without a confirmed canonical system is taste, not remediation.
