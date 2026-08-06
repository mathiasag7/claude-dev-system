---
name: domain-brain
version: 1.2.0
description: Before any capability is specified, any doctype created, or any model designed, reason the way a domain-expert business analyst would. Generates the full domain model from Claude's own expertise (every claim tagged by confidence), verifies design-critical claims against the governing authority's publications and real data, builds the invariance map (universal / configurable / local), forces ONE recorded decision between explicit options, persists everything as a per-capability Dossier Métier in docs/domain/ that downstream skills consume, submits the draft dossier to an adversarial fresh-context critic (the domain-critic agent), and presents the validated result as a sponsor-language Proposition. Prevents abstractions built on deployment-specific concepts, and business values hardcoded where a referential belonged.
category: analysis
tags: [business-analysis, domain-modeling, invariance, generalization, referential, decision-record, regulatory, conception, dossier, adversarial-review]
---

# Domain Brain Skill

**Position in the pipeline: FIRST.** This skill runs before `product-thinking-skill`
(which answers "what should exist on this screen for this persona") and before
`feature-design-skill` (which answers "how to build it well in this codebase").
This skill answers the question upstream of both:

> **"What is the right conceptual model of this capability in this domain —
> and will it survive the second institution, the second country,
> and the auditor's first question?"**

**The two failures this skill exists to prevent — both real, see Lessons Learned:**

1. **The late generalization failure.** Logic or a model anchored on a LOCAL
   concept (one institution's product catalog) when the capability was meant
   to be reused across institutions without retraining. Discovered after the
   doctype was built. Cost: rebuild.
2. **The frozen business value.** A threshold, classification, or mapping
   hardcoded, when the first question from any real deployment is
   "why can't we change this?". Cost: credibility.

**Where the brain lives.** A skill file contains reasoning moves, not domain
knowledge. The knowledge this skill produces is persisted as one **Dossier
Métier per capability** in `docs/domain/` — THAT library of dossiers is the
brain that compounds from feature to feature. PROJECT.md stays what it is:
a compass — an index of dossiers plus the invariants that are genuinely
cross-feature. The compass points; the dossiers carry the depth. A compass
never built a house.

**Two brains, one artifact.** Generation and critique are performed by two
separated minds: the resident business analyst (this skill, Steps 1–5) and
the Contradicteur (the `domain-critic` agent, Step 6), which runs in a FRESH
context and only ever sees the dossier — never this conversation. The
separation is achieved by context isolation, not by a second skill file:
a critic who watched the design being made asks theater questions. A critic
who must understand the capability from the dossier alone tests both the
knowledge and the artifact that carries it, in one move.

---

## Mode Overrides

Overrides are detected in the invocation arguments or anywhere in the user's
message.

| Keyword | Effect |
|---|---|
| `quick` | Step 3 runs only the axes that obviously bite. Steps 0, 1, 2, 4, 5, 6 and 7 always run in full — there is no quick mode for the invariance map, the dossier, or the contradictory pass. |

---

## Process

### Step 0 — Frame the capability, not the solution

```
CAPABILITY:        [what the business will be able to DO — one sentence, zero tech]
BENEFICIARY:       [who exploits it, in domain terms — pull persona from PROJECT.md §1]
REUSE HORIZON:     [this deployment only / N institutions / N countries / product to sell]
DOMAIN:            [from PROJECT.md §1 — if thin, Step 1 exists to fix that]
COST OF WRONG:     [what a wrong conceptual model costs — rework scope, in one line]
MODE:              [default / quick — from arguments or message keywords]
```

**REUSE HORIZON is the most consequential line in this file.** Everything in
Step 2 keys off it. If the human has not stated it, it is the FIRST question —
asked with a recommendation, like every question in this system.
"Je veux construire X" is a solution sentence; extract the capability from it
before proceeding.

---

### Step 1 — Build the domain (generate boldly, verify selectively)

The skill's first source of domain knowledge is **Claude itself, deployed as a
senior business analyst**. Do not start by asking anyone anything — start by
producing the métier.

**Before generating:** read PROJECT.md §4 and the existing dossiers in
`docs/domain/` — not as the main source, but so the generation builds on what
previous features already established instead of contradicting it.

**Phase G — Generate.** Write the full domain hypothesis for this capability,
as the resident expert would brief a new hire:

```
ACTORS & ROLES:     who intervenes, who decides, who benefits, who audits
CORE MECHANISMS:    how this capability works in this industry — the flows,
                    the rules, the money, the risk, in plain language
TAXONOMIES:         the classifications the industry uses for these concepts,
                    and WHO governs them (regulator, standard, convention)
KNOWN CONSTRAINTS:  regulatory, prudential, operational — as generally known
EDGE CASES:         the situations practitioners know and outsiders miss
PITFALLS:           how this capability is classically built wrong
```

Every claim in Phase G carries a confidence tag:

- `[MODEL-HIGH]` — structural knowledge, stable across sources and time
  (how a term deposit works, why a regulator imposes a nomenclature, who
  the actors of a credit granting are)
- `[MODEL-LOW]` — precise, dated, or local: numbers, thresholds, exact
  nomenclature values, current regulation references

**Phase V — Verify what matters.** Triage the `[MODEL-LOW]` claims:

1. **Critical to the design** (the invariance map or a business rule depends
   on it) → verify: web-search the governing authority's actual publication
   (BCEAO/UMOA for SFD, a central bank, ISO, IFRS, national nomenclature —
   read the real document, do not paraphrase it from memory), inspect real
   data if the human has any ("as-tu une base d'une institution que je peux
   lire ?" — grep the schema, count the values), and upgrade the tag to
   `[AUTHORITY: doc]` or `[DATA: sample]`. One real dataset beats ten
   assumptions.
2. **Not design-critical** → leave tagged as `[ASSUMPTION — flagged]`; it
   goes in the dossier's open-items list, not in the foundations.

**The human comes LAST** — only for what is irreducibly local (this
institution's practices, this project's preferences), and every question
still ships with a recommended answer, so "ok" is a sufficient reply.

**Source tags are mandatory.** Every domain claim used downstream carries one:
`[MODEL-HIGH]` / `[AUTHORITY: doc]` / `[DATA: sample]` / `[HUMAN]` /
`[ASSUMPTION — flagged]`. An untagged claim is treated as an assumption and
flagged before Step 4.

---

### Step 2 — The invariance map (the heart — non-negotiable, no quick mode)

Classify EVERY concept the capability touches:

```
UNIVERSAL:     stable across the entire REUSE HORIZON.
               (e.g. the regulator's product categories, the secteur
               d'activité referential, nature juridique — the authority's
               taxonomy lives here)
CONFIGURABLE:  varies per deployment but is enumerable → lives in a TABLE,
               referential, or settings — owned by an admin, NEVER in code.
LOCAL:         irreducibly specific to one deployment.
               (e.g. this institution's product catalog, its agency network)
```

**Two hard rules — violating either is the expensive failure:**

- **Reusable logic consumes UNIVERSAL and CONFIGURABLE concepts only.**
  A model, rule, score, or computation intended to survive the reuse horizon
  must never take a LOCAL concept as input. When the natural input is LOCAL
  (products), find its UNIVERSAL projection (product type = category ×
  secteur × term structure) — look in the authority's taxonomy FIRST.
- **Any value a business person could plausibly ask to change is CONFIGURABLE.**
  Thresholds, ranges, rates, classifications, labels, mappings, weights.
  Answer "why is this hardcoded?" before anyone asks it.

Output: the map itself, plus — for each CONFIGURABLE item — where it lives
(referential doctype / settings / range config) and who maintains it.

**This map is a wait point: confirmed by the human before any modeling.**

---

### Step 3 — Interrogate like the domain expert

The questions come from knowledge × analysis. Run the grid, keep only the
axes that bite, resolve from Step 1 sources first, and every residual
question carries a recommendation:

```
ACTORS & INCENTIVES:  who acts, who benefits, who could game it
LIFECYCLE:            how each concept lives over time — and what happens to
                      HISTORY when a CONFIGURABLE value changes
                      (recompute or freeze?)
MONEY & RISK:         what money flows, what the regulator/auditor will ask,
                      what trail must exist
TEMPORALITY:          what drifts — rates, classifications, model calibration;
                      does anything need versioning
DATA PROVENANCE:      declared vs computed vs imported — precedence and
                      conflicts
SCALE & EDGE:         smallest real case, largest, and the deployment with
                      ZERO history (cold start is a design input, not a
                      surprise)
INTEGRATION:          which system owns the truth for each datum (CBS, SIG) —
                      is this system master or mirror of it
FAILURE:              what the user sees when the clever part has nothing
                      to say
```

---

### Step 4 — Decide, once

Indecision is a missing procedure, not a missing talent.

1. Enumerate 2–3 candidate approaches. Never one (that's a decree),
   rarely four (that's avoidance).
2. Name the criteria explicitly, weighted by REUSE HORIZON: invariance
   compliance, reversibility, cost now vs cost of being wrong, who
   maintains it.
3. Recommend ONE. One paragraph of rationale. The human confirms or corrects.
4. **Stopping rule:** a decision that satisfies the named criteria is DONE.
   Re-opening it requires NEW INFORMATION — a fact from a Step 1 source —
   never a new mood. The perfectionist redo loop dies here.
5. Record in PROJECT.md Decision Log: context, options considered, choice,
   criteria, and what new fact would legitimately reopen it.

---

### Step 5 — Write the Dossier Métier (the capitalized brain)

The output of Steps 1–4 is persisted as `docs/domain/<capability>-dossier.md`
— one dossier per capability, versioned in the repo, readable by the
commanditaire, written with `status: DRAFT` in its header. THIS file, not
PROJECT.md, is what downstream skills consume: product-thinking reads it to
simulate the right screens, feature-design reads it to propose the right
build.

Dossier structure:

1. **La capacité** — one paragraph, zero tech.
2. **Le métier** — the domain model in plain language (from Phase G,
   verified).
3. **Invariance map** (from Step 2) — with, per CONFIGURABLE item, the
   referential/settings that owns it and who maintains it.
4. **Règles métier** — numbered, each with its source tag.
5. **Décision** (from Step 4) — options, criteria, choice, reopening
   condition.
6. **Hypothèses ouvertes** — every remaining [MODEL-LOW]/[ASSUMPTION], so
   the next session knows exactly what is solid and what is not.
7. **Glossaire local** — terms this capability adds to the project
   vocabulary.

PROJECT.md then receives exactly TWO things: a pointer line in §4
("Segmentation → docs/domain/segmentation-dossier.md") and any invariant
that is genuinely CROSS-feature. Nothing else — PROJECT.md stays a compass,
the dossiers carry the depth. A dossier is UPDATED, never forked, when its
capability evolves.

---

### Step 6 — La passe contradictoire (deux cerveaux, un artefact)

The DRAFT dossier is submitted to the Contradicteur — the `domain-critic`
agent, invoked in a FRESH context with the dossier path as its ONLY input.
It has not seen this conversation; that is the condition of its value. If
the critic cannot understand the capability from the dossier alone, the
dossier has failed its mission as the capitalized brain — fix the dossier,
not the critic.

Resolution protocol — for EACH challenge returned:

- **Answered by a source** → the dossier is amended, the tag upgraded.
- **Answered by reasoning** → the answer is written INTO the dossier
  (Règles or Décision section), not just into the conversation.
- **Conceded** → the item joins Hypothèses ouvertes, or becomes an
  arbitration point of the Proposition if it is BLOQUANT. Never silently
  ignored.

**Stopping rule — strict; it is what prevents the redo machine:**

- 2 rounds MAXIMUM. The second round replays only the unresolved BLOQUANTs.
- A challenge answered or conceded is CLOSED. Reopening it requires new
  information — same law as Step 4.
- A BLOQUANT still unresolved after 2 rounds does not block the process:
  it goes to the commanditaire as arbitration point n°1 of the Proposition.

The dossier moves from `DRAFT` to `VALIDÉ` when every challenge is closed
or escalated to arbitration. The Proposition (Step 7) goes out on the
VALIDÉ dossier only.

---

### Step 7 — La Proposition (present like a PM, not a questionnaire)

The deliverable to the human is a proposal, in the posture of a project
manager backed by his business analyst, addressing the sponsor:

1. **« Voici comment la feature fonctionnera »** — the finished capability
   narrated in simple language, from the user's seat. No schema, no doctype
   names, no tech vocabulary.
2. **« Voici l'approche retenue, et pourquoi »** — the Step 4 decision with
   its criteria, in three sentences. Alternatives mentioned in one line
   each, with why they lost.
3. **« Voici les contraintes »** — what the domain/regulator/data imposes,
   sourced.
4. **« Voici ce que ça change pour l'administration »** — the referentials
   and settings born from the invariance map, and who will maintain them.
5. **« Voici les 2–3 points qui requièrent VOTRE arbitrage »** — each with
   the expert's recommendation, so "ok" is a sufficient answer. Unresolved
   BLOQUANTs from Step 6 come first.

The sponsor validates, corrects, or arbitrates — then hand off:
`product-thinking-skill` for the screens, `feature-design-skill` for the
build, both reading the dossier. **Never jump from here to code.**

---

## Quality Rules

- No design, no doctype, no model before the invariance map exists and is
  confirmed by the human.
- No domain claim without a source/confidence tag. Untagged = assumption =
  flagged.
- No question without a recommendation. Ever.
- No decision without recorded criteria; no reopening — of a decision or of
  a closed challenge — without new information.
- Every run produces or updates a dossier in `docs/domain/` — a run whose
  knowledge dies with the session has failed.
- The Contradicteur never receives conversation context — only the dossier
  path. Giving it more destroys its reason for existing.
- The Proposition never goes out on a DRAFT dossier.
- PROJECT.md receives only the pointer line and genuinely cross-feature
  invariants. Depth lives in the dossier.

---

## Anti-Patterns

- **The armchair expert.** Designing the "common ground" without reading the
  authority's actual nomenclature or inspecting one real database. The
  common ground is discovered, not invented.
- **The local anchor.** Reusable logic consuming LOCAL concepts. Costs a
  rebuild.
- **The frozen business value.** A threshold in code. Costs credibility.
- **The infinite redo.** Reopening a recorded decision — or a closed
  challenge — because it "doesn't feel perfect". Feelings are not new
  information.
- **The encyclopedic dump.** Twenty questions without recommendations. This
  skill asks fewer, sharper, pre-answered questions.
- **The accomplice critic.** Running the critique in the same context, or
  feeding the Contradicteur the conversation. That is theater, not
  adversity — the whole value of Step 6 is context isolation.
- **The dossier fork.** Creating a second dossier when a capability evolves
  instead of updating the existing one. One capability, one dossier, one
  history.

---

## Lessons Learned

> Add entries here when a shipped capability revealed a conceptual-model gap
> this skill should have caught.
> Format: [DATE] — [PROJECT] — [what was learned]

```
[2026-07] — opencrm — Feature d'estimation : features du modèle ancrées sur les
produits (LOCAL) alors que le modèle devait servir plusieurs SFD sans
réentraînement ; découvert APRÈS construction du doctype produit. La projection
UNIVERSELLE (type de produit = catégorie × secteur × terme) existait dans la
taxonomie du régulateur — jamais consultée avant conception.
[2026-07] — opencrm — Segmentation : valeurs métier figées dans le code ; la
première question d'un déploiement réel a été « pourquoi ce n'est pas dans une
table ? ». Toute valeur qu'un métier peut vouloir changer est CONFIGURABLE
dès le jour 1.
[2026-07-22] — opencrm — Capacité estimation-prédictive déjà ~80% construite ; la
mémoire (2 semaines) était périmée et sous-estimait le construit (profitability_real
vit dans smartcrm pas crm ; 522 credit-types CBS ; référentiel type-produit déjà
bâti). Leçon : quand une capacité est DÉJÀ largement implémentée, cartographier le
CODE RÉEL (agent Explore) AVANT la Phase G — sinon on génère le modèle domaine contre
une mémoire périmée et le run devient capitalisation+validation, pas conception ex
nihilo. Renforce Step 1 (« lire dossiers + code existant avant de générer »).
```
