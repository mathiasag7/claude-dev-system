---
name: qa-selfcheck
version: 1.1.0
description: After implementing or modifying any route, view, form, multi-step flow, clickable element, or demo/seed feature, run a mandatory verification loop BEFORE declaring the work done. Catches the bug classes that manual screen-by-screen human QA keeps finding — fresh-user 404s, residual form state, incoherent demo data, dead buttons, silent-wrong computed outputs and broken exports — by shifting the verification burden from the human to the agent, and by encoding it into repeatable automated tests wherever possible.
category: quality
tags: [qa, verification, smoke-test, regression, self-check, definition-of-done, new-user, form-lifecycle, seed-data]
---

# QA Self-Check Skill

**"The code compiles and the page renders" is not a completion criterion.** The completion criterion is: *a brand-new user, with an empty account, can traverse the modified flow without errors, without confusion, and without residual state.* Until that traversal has been executed — by automated test, or by documented manual simulation when automation is impossible — the task is IN PROGRESS, not done. Per CLAUDE.md §1.11, declaring it done anyway is an unlabeled partial answer.

This skill runs LAST, after the execution skills (`backend-skill`, `frontend-ui-skill`, `frontend-ux-skill`, `debugging-skill`). They decide how to build; this skill verifies that what was built actually works for the persona `product-thinking-skill` defined. It exists because the most expensive bugs in this project's history were not hard bugs — they were **unsimulated-path bugs** that any attentive human would catch by clicking, and that the agent shipped because it never clicked.

---

## When to Trigger

- Any new or modified route, view, or template
- Any new or modified form — especially multi-step forms
- Any new clickable element (button, link, tab, action menu)
- Any demo-fill, seed, or fixture feature
- Any change to the shell/layout (header, bottom nav, global spacing)
- Any task about to be reported as "done" that touched one of the above
- The human reports a bug that manual clicking found (also triggers `debugging-skill`; this skill then asks: which step below would have caught it, and why didn't it run?)

**This skill does NOT trigger for:**
- Pure documentation or comment changes
- Internal refactoring already pinned by tests (covered by `architecture-refactoring-skill`)
- Work that produced no executable change

---

## Triage — Fast Exit

There is no fast exit for anything executable that a user can reach. The instinct "this change is too small to verify" is the trigger, not the exemption — the residual-state bug and the fresh-user 404 both came from changes that looked too small to verify.

**The only exception:** changes with no executable surface (copy, comments, docs).

---

## The Four Bug Classes This Skill Exists to Catch

Each class has already produced a real bug in this project (see Lessons Learned):

1. **The fresh-user bug.** Code assumes a related object exists (preferences, profile, vehicle) that a new account doesn't have. Symptom: 404/500 on a perfectly normal click. Typical cause: `Model.objects.get(...)` instead of `get_or_create`, or a template assuming a non-empty queryset.
2. **The residual-state bug.** A form (especially multi-step) reopened in create mode after a first save still shows the previous record's data; a frontend store is not purged on entry.
3. **The incoherent-demo bug.** Demo-fill injects data of the wrong type (a person's name as vehicle brand, "3" as year, a name as plate). An incoherent demo invalidates manual testing and masks real bugs.
4. **The dead-clickable bug.** A visible button triggers nothing, or points to a route that doesn't exist.

---

## Process

### Step 0 — Impact Surface Block

Before verifying anything, state what the change touched:

```
ROUTES TOUCHED:     [URLs / views created or modified]
FORMS TOUCHED:      [forms + whether multi-step]
CLICKABLES ADDED:   [every new clickable element, with its expected destination/effect]
DATA ASSUMED:       [objects the code assumes exist — profile? preferences? vehicle? prior step data?]
```

DATA ASSUMED is the critical line. Every assumption must be either **guaranteed** (get_or_create, default value, post-save signal at user creation) or **handled** (explicit empty state). An assumption that is neither is a fresh-user bug waiting for its first real user.

### Step 1 — The Fresh-User Pass (non-negotiable)

Exercise the modified flow as a **freshly created account with zero related data** — never only as the data-rich dev account.

Encode it once as an automated smoke test so it replays on every change:

```python
class NewUserSmokeTest(TestCase):
    """Every named route must respond 200/302 for a brand-new, empty user."""
    def setUp(self):
        self.user = User.objects.create_user("fresh", password="x")
        self.client.force_login(self.user)

    def test_all_named_routes_survive_a_fresh_user(self):
        needs_args = {...}   # routes requiring kwargs → covered by dedicated tests, listed, never forgotten
        for name in get_all_named_urls():
            if name in needs_args:
                continue
            resp = self.client.get(reverse(name))
            self.assertIn(resp.status_code, (200, 302),
                          f"{name} returned {resp.status_code} for a fresh user")
```

**Hard rule:** a view that fails this test because a related object is missing is fixed in the view (get_or_create / defaults / empty state) — never by adding the route to the exclusion set. The exclusion set is for routes requiring kwargs, and each of those must have its own test with a fresh user.

The fresh-user pass has three sub-passes — GET alone is not a pass:

1. **GET smoke** — the test above: every named route responds 200/302 for a fresh, empty user.
2. **Mutation smoke** — every form touched by the change POSTs once successfully with minimal valid data, and once with invalid data producing a user-visible error (never a 500).
3. **Authorization pass** — if the project defines roles or permissions (PROJECT.md §7), a fresh user WITHOUT the required role gets 403 or a redirect on each touched route — never 200 (data leak) and never 500 (missing-permission crash). In regulated/financial projects this sub-pass is forced.

**Fresh-install corollary:** the fresh user presupposes a working fresh database. If the change touched models, migrations, or seed code, verify once that migrations + seed run cleanly on an empty database — a fresh-user test on a hand-patched dev DB proves nothing about a real deployment.

(The code sample above is Django; translate the pattern to the project's stack per PROJECT.md §2 — the invariant is stack-agnostic: *every reachable route, one fresh empty account, no 4xx/5xx surprises*.)

### Step 2 — Form Lifecycle Invariants

For every form touched, verify five invariants:

1. **Create-mode reset.** After saving record A, reopening the form in create mode shows all fields empty. (Frontend: initialize state keyed by `new` vs `record_id`; purge the store on create-mode entry.)
2. **Edit ≠ create.** Opening in edit mode loads exactly the targeted record.
3. **Dual back semantics** (multi-step): header back-arrow = exit the flow to the parent page (with a data-loss confirmation, unless a draft exists); footer Back button = previous step. Both must exist and do different things.
4. **Draft persistence** when the flow has ≥3 steps or can force an app exit (camera, gallery, payment): state is persisted (server-side `draft` status preferred) and recoverable from the parent page.
5. **Per-step validation.** The recap/submit step cannot be reached with invalid data from an earlier step.

Automate what's automatable (reset and edit/create are plain view tests: POST record A, GET the create form, assert no initial data).

### Step 3 — Demo/Seed Data Integrity

Any demo-fill or fixture draws from **typed, domain-plausible pools** — per field type, not from one generic pool. Plausibility is defined by the project's Domain Vocabulary (PROJECT.md §4) and locale, not by this skill.

The general rules:

- Every field draws from a pool of its own type — never a person's name in a product field, never a number in a name field.
- Cross-field coherence: dependent fields stay coherent (a model matches its brand; an amount matches its currency and magnitude; a date falls in a plausible range for the entity).
- Locale formats (phone, plate, ID numbers, currency) follow the project's country/locale as declared in PROJECT.md.
- Financial/reporting projects: demo amounts must be internally consistent (debits tie to credits, lines sum to their totals) — an unbalanced demo ledger masks real calculation bugs.

*Example (vehicle domain):* Brand from a real list (Toyota, Honda…), model coherent with brand (Toyota → Corolla, never "Toyota Civic"), year 2010–current, plate in local format.

Verification: run the demo, open the recap, read every label/value pair asking *"would a domain human find this normal?"* One incoherence = the demo feature is broken, and it is a bug like any other (it silently corrupts all manual testing built on it).

### Step 4 — Clickable Integrity

Every clickable element added or modified:

- has a real handler or `href` — no silent decorative buttons;
- targets a route that exists (`reverse()`/named routes in templates, never hard-coded URLs);
- produces visible feedback (navigation, toast, state change). "I click and nothing happens" is always a bug, never a pending feature left unmarked.

### Step 5 — Computed Outputs and Exports

For any change that produces a **computed artifact** — a report, a dashboard figure, a financial statement, a file export (PDF, Excel, CSV):

1. **Empty-dataset rendering.** The artifact renders correctly for a period/scope with zero underlying data: explicit empty state or zeroed lines — never a 500, never misleading residual figures.
2. **Internal consistency spot-check.** The artifact's own arithmetic ties: totals equal the sum of their lines; a balance sheet balances; a figure shown in two places shows the same value. This is a cheap read-and-tie check — full numerical correctness belongs to `testing-skill` (lens L1-Business Logic), but a total that doesn't tie is caught HERE, before "done".
3. **Export smoke.** The file generates without error, is non-empty, opens in its target application, and its headline figures match the on-screen version.
4. **A 200 with wrong numbers is a failed check.** Rendering is not correctness; this step exists because every other step would let a plausible-looking wrong report ship.

### Step 6 — Shell and Viewport Consistency

- Empty states and single-action screens fit the project's target viewport without scrolling (mobile-first projects: ~380×750; desktop/back-office projects: the declared minimum resolution — per PROJECT.md §2/§11).
- No screen mixes languages in its user-facing copy; the UI language is the one declared in PROJECT.md (e.g. a French-UI project shows "Modifier", never "Edit"). Code identifiers remain English per CLAUDE.md §1.12; this rule is about UI copy only.
- The shell (header, bottom nav, spacing) is identical across pages; a shell deviation is fixed in the shell, not patched per page (see `visual-design-skill`'s shell contract).

### Step 7 — Verification Report (mandatory before "done")

End every task with this block, filled honestly:

```
VERIFICATION PERFORMED:
  ✅/❌ Fresh-user pass (new account, empty data) — [how it was tested]
  ✅/❌ Form create-mode reset — [how]                          [or N/A]
  ✅/❌ All touched routes/clickables exercised — [list]
  ✅/❌ Demo/seed reread field by field                          [or N/A]
  ✅/❌ Computed outputs: empty-dataset + totals tie + exports   [or N/A]
  ✅/❌ Viewport + shell + language consistency                  [or N/A]
NOT VERIFIED (and why): [what requires a human — e.g. real camera capture, real payment]
```

A ❌ without justification forbids declaring the task done (CLAUDE.md §1.11). How to encode any of these checks as durable tests is `testing-skill`'s job — this skill decides WHAT must be verified; that one decides HOW it is written. What cannot be verified automatically is handed to the human as a **short, precise list** — never "please test everything".

---

## Anti-Patterns

**Anti-pattern: Works on the rich dev account**
The flow is only exercised with the developer's data-laden account. The fresh user is the default case in production, not the edge case.
Fix: Step 1 runs with a newly created empty account, always.

**Anti-pattern: Renders therefore works**
The template displays, so the task is reported done — without clicking anything.
Fix: every clickable in the touched flow is exercised (Step 4).

**Anti-pattern: Fixing the symptom in the exclusion set**
A route fails the smoke test, so it's added to the skip list instead of fixing the view.
Fix: exclusion set is for kwargs-requiring routes only, each with its own dedicated test.

**Anti-pattern: "It's just demo data"**
Demo incoherence is tolerated because "it's not production code". A false demo costs more time than it saves and hides real bugs behind absurd data.
Fix: Step 3 treats demo integrity as a shippable feature with its own bug bar.

**Anti-pattern: Delegating to the human what a 15-line test catches**
"Please test the flow" is sent for behaviors (route 404s, form reset) that a Django test verifies deterministically.
Fix: automate Steps 1–2 first; the human list in Step 6 contains only what machines cannot see.

**Anti-pattern: The optimistic "done"**
The report says done; the verification block is absent or filled with unchecked optimism.
Fix: Step 6's block is the definition of done. No block, no done.

---

## Principles

1. **The fresh, empty user is the default production case — test it first, not last.**
2. **A verification that isn't encoded as a test will be skipped under pressure. Encode it.**
3. **Every bug the human finds by clicking is a bug this skill failed to catch — log it in Lessons Learned and strengthen the step that should have caught it.**
4. **Demo data is a testing instrument; a broken instrument is worse than none.**
5. **Hand the human a short list of what machines cannot verify — never the whole app.**
6. **"Done" is a claim about the user's experience, not about the code's existence.**

---

## Questions to Ask Before Declaring Done

- Did I exercise this flow as a brand-new user with zero related data?
- If I save a record and immediately create another, is the form empty?
- Did I click (or test) every button and link I added or touched?
- Would a domain human find every demo value normal?
- Does the smoke test still pass — and did I add the new routes to it?
- Does every report/export render on an empty period, and do its totals tie?
- Does a user without the required role get a 403 — not a 200, not a 500?
- What exactly am I asking the human to verify, and is each item genuinely non-automatable?

---

## Output Format

When this skill is invoked, produce:

1. **Impact surface block** (Step 0)
2. **Fresh-user pass results** (Step 1 — test run output, or documented simulation)
3. **Form lifecycle check** (Step 2 — the five invariants, each ✅/❌/N/A)
4. **Demo integrity check** (Step 3 — or N/A)
5. **Clickable integrity check** (Step 4)
6. **Computed outputs & exports check** (Step 5 — or N/A)
7. **Shell/viewport check** (Step 6 — or N/A)
8. **Verification report block** (Step 7 — mandatory, honest, before any "done")

---

## Lessons Learned

> Add an entry every time the human finds, by manual clicking, a bug this skill should have caught. Name the step that failed to fire and why.
> Format: [DATE] — [PROJECT CONTEXT] — [what was learned] → [step reinforced]

```
2026-07-11 — bormi — 404 on /users/preferences/ for a fresh user: view called .get() on a nonexistent UserPreference. → Step 1.
2026-07-11 — bormi — "Add a vehicle" form retained the previous vehicle's data in create mode. → Step 2, invariant 1.
2026-07-11 — bormi — Demo-fill placed person names in brand/model/plate and "3" in year. → Step 3.
2026-07-11 — bormi — "Galerie" button at the photo step produced no visible effect. → Step 4.
```
