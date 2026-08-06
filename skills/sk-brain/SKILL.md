---
name: sk-brain
description: Before specifying or modeling ANY new capability, reason as a domain-expert business analyst. Use when the user says "je veux construire", "quelle approche", "comment concevoir", "peut-on se baser sur", hesitates between designs, asks for the "logique métier" of a feature, or when logic/models/scores must be reused across institutions, tenants, or countries. Generates the domain model from Claude's own expertise, verifies design-critical claims on the governing authority's taxonomy (e.g. BCEAO for SFD) and real data, builds the invariance map (universal/configurable/local), forces one recorded decision, writes a per-capability Dossier Métier in docs/domain/, submits it to the adversarial domain-critic agent, and presents a sponsor-language Proposition. NOT for pure UI questions (sk-product-thinking) or implementation research in existing code (sk-feature-design).
argument-hint: [capability description | quick]
---

## Existing dossiers

!`ls docs/domain/*-dossier.md 2>/dev/null || echo "aucun dossier encore — docs/domain/ sera créé au premier run"`

## Instructions

This is a launcher. The full process lives in
`~/.claude/skills/domain-brain-skill.md` — read that file completely with the
Read tool now. Do not paraphrase it from memory.

ARGUMENTS: $ARGUMENTS

Hard constraints, before anything else:

1. **This skill runs FIRST** — before sk-product-thinking, before
   sk-feature-design, before any doctype or code exists. It decides the
   conceptual model; they decide the screens and the build.
2. **Step 2 (invariance map) is non-negotiable** and has no quick mode. No
   data model before the map exists and the human has confirmed it. Reusable
   logic consumes UNIVERSAL/CONFIGURABLE concepts only; any value a business
   person could ask to change is CONFIGURABLE — table, never code.
3. **Every domain claim carries a source/confidence tag**
   ([MODEL-HIGH] / [MODEL-LOW] / [AUTHORITY] / [DATA] / [HUMAN] /
   [ASSUMPTION]); every question to the human carries a recommendation so
   "ok" is a sufficient answer. Generate boldly from Claude's own expertise
   first (Step 1 Phase G), verify selectively what the design depends on
   (Phase V), ask the human last.
4. **Step 4 ends in ONE recorded decision** with explicit criteria and a
   stopping rule — never leave the human with an open menu, and never reopen
   a recorded decision (or a closed challenge) without new information.
5. **The knowledge is capitalized in the Dossier Métier**
   (`docs/domain/<capability>-dossier.md`), created or UPDATED — never
   forked. PROJECT.md receives only a pointer line and genuinely
   cross-feature invariants.
6. **The run is not complete until the dossier exists and the Proposition
   has been presented in sponsor language** (Step 7's five sections — how it
   will work, the chosen approach and why, the constraints, the admin
   impact, the 2–3 arbitration points).
7. **The Proposition never goes out on a DRAFT dossier** : the contradictory
   pass (Step 6, `domain-critic` agent in a FRESH context, dossier path as
   its ONLY input — never this conversation) is not optional, even in
   `quick` mode. Two rounds maximum; unresolved BLOQUANTs escalate to the
   Proposition as arbitration point n°1.
