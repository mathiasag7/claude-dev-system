# .claude/

This folder is the operating system for Claude Code on this project.

It carries three things: universal rules that never change, project-specific context that is filled once and maintained over time, and an enforcement layer that makes the rules mechanical instead of voluntary. Together they ensure Claude starts every session knowing how to work, what already exists, and what must never be done — without being re-explained, and without relying on the model remembering to comply.

---

## Why this exists

Every project loses time to the same two problems. First: knowledge accumulated on previous work — patterns established, mistakes corrected, decisions made — has to be re-explained from scratch at every new session. Second: even when that knowledge is written down, instruction-following decays over long sessions, and skills get silently bypassed. This folder solves both. The files are the memory; the hooks are the enforcement.

---

## Structure

```
.claude/
├── CLAUDE.md                          ← Universal rules (12). Copy to every project. Never modify per-project.
├── PROJECT.md                         ← Project-specific context (the compass). Filled by /sk-onboard. Updated continuously.
├── README.md                          ← This file.
├── settings.json                      ← Wires the hooks (SessionStart, UserPromptSubmit, Stop). Commit to git.
│
├── agents/                            ← Subagents — fresh-context specialists invoked BY skills, not by you
│   └── domain-critic.md               ← Adversarial reviewer of a Dossier Métier (domain-brain Step 6). Only input: the dossier.
│
├── hooks/                             ← Enforcement layer (deterministic)
│   ├── session-start.sh               ← SessionStart: verifies PROJECT.md is complete; injects the gate if not
│   ├── skill-activation.mjs           ← UserPromptSubmit: matches each prompt to its skill, injects activation
│   ├── retro-gate.mjs                 ← Stop: blocks silent session close when code was modified (retro-skill gate)
│   └── skill-rules.json               ← Trigger rules per skill — the only enforcement file you maintain
│
└── skills/
    │   ── Canonical processes (flat files — the single source of truth) ──
    ├── project-onboarding-skill.md    ← Run first, on every new project
    ├── domain-brain-skill.md          ← Run FIRST for any NEW capability: domain model, invariance map, Dossier Métier, adversarial pass, Proposition
    ├── product-thinking-skill.md      ← Run before the build skills for any user-facing field/screen/data change
    ├── feature-design-skill.md
    ├── backend-skill.md
    ├── visual-design-skill.md         ← Run BEFORE frontend-ui: mockups, design system, cross-page consistency
    ├── frontend-ui-skill.md
    ├── frontend-ux-skill.md
    ├── testing-skill.md
    ├── debugging-skill.md
    ├── architecture-refactoring-skill.md
    ├── design-audit-skill.md          ← Remediation of messy/inconsistent existing designs
    ├── qa-selfcheck-skill.md          ← Run LAST, before any "done"
    ├── retro-skill.md                 ← Session close-out (lessons, decision log) — enforced by the Stop-hook retro gate
    │
    │   ── Launchers (thin SKILL.md dirs → slash commands + semantic auto-load) ──
    ├── sk-onboard/SKILL.md            ← /sk-onboard          → project-onboarding-skill.md
    ├── sk-brain/SKILL.md              ← /sk-brain            → domain-brain-skill.md
    ├── sk-product-thinking/SKILL.md   ← /sk-product-thinking → product-thinking-skill.md
    ├── sk-feature-design/SKILL.md     ← /sk-feature-design   → feature-design-skill.md
    ├── sk-backend/SKILL.md            ← /sk-backend          → backend-skill.md
    ├── sk-visual-design/SKILL.md      ← /sk-visual-design    → visual-design-skill.md
    ├── sk-frontend-ui/SKILL.md        ← /sk-frontend-ui      → frontend-ui-skill.md
    ├── sk-frontend-ux/SKILL.md        ← /sk-frontend-ux      → frontend-ux-skill.md
    ├── sk-testing/SKILL.md            ← /sk-testing          → testing-skill.md
    ├── sk-debugging/SKILL.md          ← /sk-debugging        → debugging-skill.md
    ├── sk-refactor/SKILL.md           ← /sk-refactor         → architecture-refactoring-skill.md
    ├── sk-qa-selfcheck/SKILL.md       ← /sk-qa-selfcheck     → qa-selfcheck-skill.md
    └── sk-design-audit/SKILL.md       ← /sk-design-audit     → design-audit-skill.md
```

One directory lives deliberately OUTSIDE `.claude/`:

```
docs/domain/                           ← The Dossiers Métier — one per capability, produced/updated by domain-brain.
    <capability>-dossier.md              This is the capitalized business depth. It is business documentation,
                                         versioned with the code, readable by the sponsor, consumed by the skills.
```

---

## The three knowledge layers

Since the introduction of `domain-brain`, knowledge is split across three layers with distinct scopes — confusing them is how context rots:

1. **Skills** (`.claude/skills/`) — the PROCESS layer. Universal, project-agnostic reasoning procedures. They contain no project knowledge (only Lessons Learned entries as history).
2. **PROJECT.md** — the COMPASS layer. Project identity, closed constraints, cross-feature invariants, the Decision Log, and the INDEX of dossiers in §4. A compass points; it never built a house.
3. **Dossiers Métier** (`docs/domain/`) — the DEPTH layer. One file per capability: the domain model in plain language, the invariance map (UNIVERSAL/CONFIGURABLE/LOCAL), numbered business rules with source tags, the recorded decision, open assumptions. This is what `product-thinking` and `feature-design` read to work on a capability — and what the `domain-critic` agent attacks before anything is validated.

---

## The three activation layers

Every skill can be activated three independent ways. The flat `*-skill.md` file is always the single source of truth; launchers never duplicate its content.

1. **Hook (deterministic floor).** On every prompt, `skill-activation.mjs` matches keywords and patterns from `skill-rules.json` and injects the matching skill's activation instruction into context — including which Step 0 block to begin with. First match in a session = full instruction; repeats = one-line reminder. The model cannot forget what is re-injected.
2. **Semantic (Claude self-triggers).** Each `sk-*/SKILL.md` launcher carries a description derived from the skill's "When to Trigger" section. Claude Code can auto-load the launcher when a prompt matches the meaning, even if no keyword matched — catching phrasings the regex missed.
3. **Manual (100% certain).** Typing `/sk-` in the picker lists all the commands. Use them when you know what kind of work is starting — especially `/sk-onboard`, `/sk-brain`, and `/sk-design-audit`, the three heavyweight ceremonies.

If a launcher fires, its first instruction is always: read the corresponding flat skill file in full with the Read tool — never paraphrase it from memory.

**Agents are not skills.** The files in `.claude/agents/` are never triggered by your prompts — a skill invokes them at a precise step, in a fresh context. `domain-critic` exists precisely because it must NOT share the conversation that produced the dossier it reviews.

---

## Files

### `CLAUDE.md` — Universal Operating Rules

Defines how Claude Code behaves on any project. Contains 12 non-negotiable rules covering: reading the code before proposing or answering, mandatory skill activation when matched, never reinventing what exists, making decisions explicit, incomplete-over-wrong, regression tests for every bug, scope discipline, no silent failures, explicit assumptions, labeling partial answers as partial, and all code named in English. Skill routing and the PROJECT.md gate are no longer prose rules here — they are enforced by the hooks; CLAUDE.md keeps only what requires judgment.

**Never modify this file on a per-project basis.** If a rule needs to change — change it here and it applies everywhere. If a project needs an exception — document the exception in PROJECT.md, not here.

### `PROJECT.md` — Project Context

Captures everything Claude cannot infer from the code alone. Filled by the onboarding skill at project start, updated whenever a significant decision is made. Contains 11 sections:

| Section | What it captures |
|---|---|
| 1 — Project Identity | Name, purpose, domain, current phase |
| 2 — Technical Stack | Language, framework, database, frontend, deployment |
| 3 — Architectural Constraints | Closed decisions that must not be re-decided |
| 4 — Domain Vocabulary | Terms with precise meanings — plus the INDEX of Dossiers Métier (`docs/domain/`) |
| 5 — Established Patterns | Data model, validation, error handling, naming, testing conventions |
| 6 — What Is Forbidden | Hard stops with explicit reasons |
| 7 — Regulatory and Compliance | Regime, rules, reporting obligations, audit requirements |
| 8 — Known Debt and Watch Areas | Fragile or incomplete parts of the codebase |
| 9 — Domain References | External references relevant to this project's domain |
| 10 — Decision Log | Running record of why significant decisions were made |
| 11 — Active Quality Lenses | Skill lenses always active on this project — derived from domain and constraints |

**The Decision Log (section 10) is the most important section for long-running projects.** It prevents re-litigating past decisions and explains to any future contributor — human or AI — why the code is structured the way it is. `domain-brain` writes here too: every capability decision lands with its criteria and its reopening condition.

**Completion is verified mechanically:** the SessionStart hook checks for the template's placeholder markers (`[e.g. ...]`, `[Term]`, `[DATE]`, an empty `PROJECT NAME:`) and injects the PROJECT CONTEXT GATE if the file is missing, skeletal, or unfilled. While the gate is up, Claude is instructed to run `/sk-onboard` before any other work.

### `agents/` — Fresh-Context Specialists

Subagents invoked by skills at precise steps, never by the user. `domain-critic.md` is the Contradicteur of the domain-brain process: it reviews a draft Dossier Métier with the dossier as its ONLY input — no conversation context, by design. If the dossier cannot defend itself alone, it is not finished. Adding an agent = dropping a `.md` with `name`/`description`/`tools` frontmatter in this folder; Claude Code discovers it automatically — no wiring in settings.json.

### `hooks/` — Enforcement Layer

Hooks are the difference between rules Claude is asked to follow and rules Claude is made to see. `session-start.sh` runs once per session (the PROJECT.md gate). `skill-activation.mjs` runs on every prompt (skill routing). `retro-gate.mjs` runs on Stop (session close-out gate when code was modified). `skill-rules.json` is the only file to maintain: when adding a skill, add its keywords, patterns, and activation instruction there. Tuning guidance: false positives are cheap (Claude states why the match is wrong in one sentence, then proceeds), so err on the side of firing. The dedup cache in `.claude/.cache/skill-hook/` belongs in `.gitignore`.

### `skills/` — Reusable Work Processes

Each flat skill defines a complete process: when to trigger it, how to execute step by step, anti-patterns to avoid, quality criteria to meet. Framework-agnostic. Each has two layers: a **core process** (mandatory steps every time) and **quality lenses** (depth layers activated by project context — some forced in financial contexts, per the skill's frontmatter).

| Skill | Activate when |
|---|---|
| `project-onboarding-skill.md` | **First session on any project** — or when PROJECT.md is empty or outdated |
| `domain-brain-skill.md` | **Conceiving any NEW capability** — its domain logic, its data model, anything meant to be reused across institutions — runs before every other skill; produces/updates the Dossier Métier |
| `product-thinking-skill.md` | **Before any user-facing field/screen/form/data change** — no fast exit for small changes; reads the capability's dossier when one exists |
| `feature-design-skill.md` | Designing any new feature — before any implementation decision |
| `backend-skill.md` | Implementing business logic, APIs, batch jobs, state transitions |
| `visual-design-skill.md` | Designing what a screen looks like (mockup, maquette, visual redesign, design system, art direction) — **before `frontend-ui`** |
| `frontend-ui-skill.md` | Building or modifying UI components, screens, or design system elements |
| `frontend-ux-skill.md` | Designing user flows, forms, or interaction sequences |
| `testing-skill.md` | Writing, reviewing, or fixing any test |
| `debugging-skill.md` | Diagnosing or fixing any bug |
| `architecture-refactoring-skill.md` | Refactoring, migrating, or reducing technical debt |
| `design-audit-skill.md` | Auditing/remediating a messy, inconsistent, or never-systematized existing design |
| `qa-selfcheck-skill.md` | **Before declaring any implemented work done** — routes, forms, demo data, fresh-user path |
| `retro-skill.md` | **Closing any session that modified code** — lesson capture, decision log, trigger tuning |

---

## How to use this on a new project

**Step 1 — Copy the folder.** Copy the entire `.claude/` folder into the root of the new project, then `chmod +x .claude/hooks/session-start.sh`. Commit everything except `.claude/.cache/`. Run `/hooks` in the first session to confirm the hooks registered, and type `/sk-` to confirm the commands appear.

**Step 2 — Onboarding runs itself.** The SessionStart hook detects the unfilled PROJECT.md and injects the gate; run `/sk-onboard`. For existing projects, Claude reads the codebase and builds an inference map before asking anything; for greenfield, it asks a structured sequence. Either way it produces a complete PROJECT.md — including Active Quality Lenses — and presents it for confirmation before writing.

**Step 3 — Work.** From then on, every prompt is matched to its skill by the hook, CLAUDE.md and PROJECT.md frame every session, and the slash commands are there when you want certainty. When a NEW capability is being conceived, `/sk-brain` runs first and leaves a Dossier Métier in `docs/domain/` that every downstream skill reads.

**Step 4 — Maintain the memory.** Add a Decision Log entry for every significant decision. Update Known Debt when fragile areas are discovered. Add to What Is Forbidden when a new hard stop is established. Update Active Quality Lenses if the domain or regulatory context changes. Update a capability's dossier — never fork it — when the capability evolves.

---

## How skills, PROJECT.md, and the Dossiers Métier interact

Skills are universal — they contain no project-specific knowledge. PROJECT.md is the compass — project invariants and the index, no process knowledge, no per-capability depth. The Dossiers Métier are the depth — one per capability, the domain model a feature is actually built from. When Claude designs a feature: `domain-brain` produces or updates the dossier (and the `domain-critic` agent attacks it before validation); `product-thinking` reads the dossier to simulate the right screens; `feature-design` reads it to propose the right build; PROJECT.md prevents contradictions across capabilities. None of the three layers is sufficient without the others. The hooks make sure they are actually in play.

---

## What this folder does not contain

- **Business documentation** — functional specs, user stories, product requirements belong in `/docs/`. The Dossiers Métier produced by `domain-brain` live in `docs/domain/` for exactly this reason: they are business documentation — sponsor-readable — that happens to also be machine-consumed. `.claude/` holds the process that produces them, never the depth itself.
- **Technical documentation** — API docs, data dictionaries, architecture diagrams belong in `/docs/`.
- **Code style rules** — linter configuration belongs in `.eslintrc`, `pyproject.toml`, or equivalent.
- **CI/CD configuration** — belongs in `.github/`, `Makefile`, or equivalent.

This folder contains only what shapes how Claude Code thinks and works — not what the system does or how it is deployed.
