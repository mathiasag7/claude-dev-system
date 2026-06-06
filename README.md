# .claude/

This folder is the operating system for Claude Code on this project.

It carries two things: universal rules that never change, and project-specific context that is filled once and maintained over time. Together they ensure Claude starts every session knowing how to work, what already exists, and what must never be done — without being re-explained.

---

## Why this exists

Every project loses time to the same problem: knowledge accumulated on previous work — patterns established, mistakes corrected, decisions made — has to be re-explained from scratch at the start of every new session or project. This folder solves that. It is the memory that persists between sessions and transfers between projects.

---

## Structure

```
.claude/
├── CLAUDE.md                          ← Universal rules. Copy to every project. Never modify.
├── PROJECT.md                         ← Project-specific context. Fill once. Update continuously.
└── skills/
    ├── project-onboarding-skill.md    ← Run first, on every new project
    ├── feature-design-skill.md
    ├── backend-skill.md
    ├── frontend-ui-skill.md
    ├── frontend-ux-skill.md
    ├── testing-skill.md
    ├── debugging-skill.md
    └── architecture-refactoring-skill.md
```

---

## Files

### `CLAUDE.md` — Universal Operating Rules

Defines how Claude Code behaves on any project. Contains 11 non-negotiable rules covering: reading before proposing, investigating before answering, activating skills at the right moment, making decisions explicit, scope discipline, eliminating silent failures, and labeling partial answers explicitly.

**Never modify this file on a per-project basis.** If a rule needs to change — change it here and it applies everywhere. If a project needs an exception — document the exception in PROJECT.md, not here.

---

### `PROJECT.md` — Project Context

Captures everything Claude cannot infer from the code alone. Filled at project start, updated whenever a significant decision is made.

Contains 11 sections:

| Section | What it captures |
|---|---|
| 1 — Project Identity | Name, purpose, domain, current phase |
| 2 — Technical Stack | Language, framework, database, frontend, deployment |
| 3 — Architectural Constraints | Closed decisions that must not be re-decided |
| 4 — Domain Vocabulary | Terms with precise meanings specific to this project |
| 5 — Established Patterns | Data model, validation, error handling, naming, testing conventions |
| 6 — What Is Forbidden | Hard stops with explicit reasons |
| 7 — Regulatory and Compliance | Regime, rules, reporting obligations, audit requirements |
| 8 — Known Debt and Watch Areas | Fragile or incomplete parts of the codebase |
| 9 — Domain References | External references relevant to this project's domain |
| 10 — Decision Log | Running record of why significant decisions were made |
| 11 — Active Quality Lenses | Skill lenses always active on this project — derived from domain and constraints |

**The Decision Log (section 10) is the most important section for long-running projects.** It prevents re-litigating past decisions and explains to any future contributor — human or AI — why the code is structured the way it is.

---

### `skills/` — Reusable Work Processes

Each skill defines a complete process for a specific type of work: when to trigger it, how to execute it step by step, what anti-patterns to avoid, and what quality criteria to meet. Skills are framework-agnostic — they apply regardless of language or stack.

| Skill | Activate when |
|---|---|
| `project-onboarding-skill.md` | **First session on any project** — or when PROJECT.md is empty or outdated |
| `feature-design-skill.md` | Designing any new feature — before any implementation decision |
| `backend-skill.md` | Implementing business logic, APIs, batch jobs, state transitions |
| `frontend-ui-skill.md` | Building or modifying UI components, screens, or design system elements |
| `frontend-ux-skill.md` | Designing user flows, forms, or interaction sequences |
| `testing-skill.md` | Writing, reviewing, or fixing any test |
| `debugging-skill.md` | Diagnosing or fixing any bug |
| `architecture-refactoring-skill.md` | Refactoring, migrating, or reducing technical debt |

Each skill has two layers:
- **Core process** — mandatory steps applied every time the skill is active
- **Quality lenses** — optional depth layers activated based on project context (testability, auditability, performance, security, etc.)

---

## How to use this on a new project

**Step 1 — Copy the folder**
Copy the entire `.claude/` folder into the root of the new project.

**Step 2 — Run the onboarding skill**
At the first session, Claude detects whether the project is greenfield or existing. For existing projects, it reads the codebase first and infers what it can before asking anything. For greenfield projects, it asks a structured sequence of questions. Either way, it produces a complete PROJECT.md — including the Active Quality Lenses derived from the project's domain and constraints — and presents it for confirmation before writing.

This replaces manual filling. The output is more accurate because inferences are grounded in the actual code, not recollection.

**Step 3 — Start the first session**
Claude Code reads `CLAUDE.md` and `PROJECT.md` at the start of every session. From that point, it knows the stack, the constraints, the forbidden patterns, the active quality lenses, and which skills to activate for which tasks.

**Step 4 — Maintain PROJECT.md**
Add a Decision Log entry every time a significant architectural or design decision is made. Update the Known Debt section when fragile areas are discovered. Add to What Is Forbidden when a new hard stop is established. Update Active Quality Lenses if the project's domain or regulatory context changes.

---

## How skills and PROJECT.md interact

Skills are universal — they contain no project-specific knowledge. PROJECT.md is project-specific — it contains no process knowledge. They complement each other.

When Claude designs a feature, the Feature Design skill provides the process (research first, ask questions, justify decisions). PROJECT.md provides the context (existing patterns to integrate with, domain vocabulary to use, constraints to respect). Neither is sufficient without the other.

---

## What this folder does not contain

- **Business documentation** — functional specs, user stories, and product requirements belong in `/docs/`.
- **Technical documentation** — API docs, data dictionaries, and architecture diagrams belong in `/docs/`.
- **Code style rules** — linter configuration belongs in `.eslintrc`, `pyproject.toml`, or equivalent.
- **CI/CD configuration** — belongs in `.github/`, `Makefile`, or equivalent.

This folder contains only what shapes how Claude Code thinks and works — not what the system does or how it is deployed.
