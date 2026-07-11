---
name: retro
version: 1.0.0
description: At the end of a working session (or before compaction), harvest what this session taught that would change Claude's behavior next session, route each lesson to its correct receptacle (a skill's Lessons Learned, PROJECT.md §5/§6/§8/§10, or skill-rules.json triggers), deduplicate, cap the volume, write the entries, and report them in one line each. Exists because lesson consignment done voluntarily by humans decays to zero — this skill makes it a mechanical closing ceremony.
category: process
tags: [retrospective, lessons-learned, knowledge-capture, decision-log, continuous-improvement, session-end]
---

# Retro Skill

**A lesson that isn't written down is a bug scheduled for the next session.** This project's memory is not the conversation — conversations die at session end. The memory is the files: skills' Lessons Learned sections, PROJECT.md, skill-rules.json. This skill is the pump that moves learning from the dying conversation into the surviving files.

It is deliberately cheap: one pass, at most a few written entries, one-line report each. The expensive version (long reflective essays) would be skipped; the cheap version runs every time.

---

## When to Trigger

- End of any session that modified code, templates, config, or skills
- Before a context compaction in a long session
- The Stop-hook retro gate fired (session touched code, no retro done yet)
- The human explicitly asks "what did we learn?" / "qu'est-ce qu'on retient ?"
- A bug found by the human was just fixed (micro-retro: one entry, immediately — don't wait for session end)

**This skill does NOT trigger for:**
- Sessions that were pure Q&A with no changes and no corrections
- Repeating a lesson already consigned (dedup, Step 2)

---

## Triage — Fast Exit

If the session produced **no event matching the harvest criteria of Step 0**, the retro output is exactly one line — `Retro: nothing meets the consignment bar.` — and nothing is written. An empty retro honestly reported is a valid retro. Padding the files with trivia to "have something" is the anti-pattern, not the goal.

---

## Process

### Step 0 — Harvest: what counts as a lesson

Scan the session for these events, and only these:

```
H1  HUMAN-CAUGHT MISS:   the human found (usually by clicking/reading) something Claude
                         should have caught — a bug, an incoherence, a missing behavior.
H2  WRONG ASSUMPTION:    an assumption Claude made (stated or silent) proved false and
                         cost a correction round-trip.
H3  SKILL MISFIRE:       a skill that should have activated didn't (phrasing missed by
                         triggers), or fired and its process still let the miss through.
H4  ESTABLISHED PATTERN: a new convention, constraint, or decision was settled with the
                         human during the session.
H5  DEBT DISCOVERED:     a fragile area was found but deliberately not fixed now.
```

**The consignment bar — apply to every candidate:** *"Would writing this change Claude's behavior in the next session on this project?"* If no → drop it. Compliments, routine work, and one-off typos never pass the bar.

### Step 1 — Route: every lesson has exactly one home

Do not pile everything into one file. Route by kind:

| Event | Destination | Format there |
|---|---|---|
| H1 miss that a skill's process should have caught | That skill's **Lessons Learned** section | `[DATE] — [project] — [what happened] → [step reinforced]` |
| H1 miss that no existing skill covers | Report to the human: "gap — new skill or new step?" — **never** invent a skill silently | one line in the retro report |
| H2 wrong assumption about the domain | **PROJECT.md §4** (vocabulary) or **§3** (constraint) | the corrected definition/constraint |
| H2 wrong assumption about the codebase | **PROJECT.md §5** (established patterns) | the actual pattern |
| H3 trigger phrasing missed | **skill-rules.json** — add the human's actual phrasing to that skill's keywords | keyword/pattern addition |
| H3 skill fired but process leaked | That skill's **Lessons Learned** (+ flag if a step needs amending) | dated entry |
| H4 new convention/decision | **PROJECT.md §10 Decision Log** (and §5 or §6 if it's a pattern/interdiction) | the Decision Log block (Context/Options/Chosen/Because/Trade-off) |
| H5 debt discovered | **PROJECT.md §8 Known Debt** | table row |

Routing is the real value of this skill. A lesson in the wrong file is a lesson nobody re-reads.

### Step 2 — Deduplicate and cap

- Before writing, read the destination section. If an equivalent entry exists: do not duplicate — if today's occurrence adds force (same miss, second time), annotate the existing entry (`— recurred [DATE]`) instead. A recurrence is a signal the skill step itself needs strengthening, not just the log.
- **Cap: 3 written entries per session.** If more candidates pass the bar, write the 3 with the highest behavioral impact and list the rest in the report as "not consigned (cap)". A Lessons Learned section that grows by 10 lines a session is unreadable in a month, which makes it dead.

### Step 3 — Write and report

- Write the entries directly (the files are git-tracked; the human reviews via diff — asking confirmation per entry recreates the friction this skill exists to remove).
- Exception: **PROJECT.md §3 (constraints), §6 (forbidden), and §10 (decisions) are proposed, not auto-written**, unless the human already validated the decision explicitly during the session. Closing a question the human never closed is scope theft.
- End with the report:

```
RETRO — [n] entries consigned:
  • [file § / skill] — [one-line summary]
  • ...
PROPOSED (needs your ok): [entries targeting PROJECT.md §3/§6/§10, if any]
NOT CONSIGNED: [cap overflow or borderline candidates, one line each — or "—"]
```

If nothing passed the bar: `Retro: nothing meets the consignment bar.`

### Step 4 — Mark done (hook integration)

If the retro gate hook is installed, write the session marker file it expects
(`.claude/.cache/retro/<session_id>`) so the Stop gate does not re-fire.

---

## Anti-Patterns

**Anti-pattern: The diary**
Consigning routine events ("implemented the vehicle form") that change nothing next session.
Fix: the consignment bar of Step 0 — behavior change or drop.

**Anti-pattern: The single dump file**
Every lesson appended to one file regardless of kind, where nothing is ever re-read in context.
Fix: Step 1's routing table — one lesson, one home.

**Anti-pattern: The duplicate**
The same miss consigned again as a fresh entry, hiding that it's a recurrence.
Fix: Step 2 — annotate the existing entry; a recurrence escalates to amending the skill step.

**Anti-pattern: The novel**
Ten entries, three paragraphs each. Volume kills re-readability, which kills the whole system.
Fix: cap of 3, one to two lines each.

**Anti-pattern: The silent legislator**
A "lesson" quietly adds a constraint to PROJECT.md §3/§6 or a Decision Log entry the human never validated.
Fix: Step 3's exception — those sections are proposed, never auto-written.

**Anti-pattern: The skipped retro**
Session ends, human is tired, nothing is consigned — the exact failure this skill was built against.
Fix: the Stop-hook retro gate makes the reminder mechanical; the fast-exit makes compliance cheap.

---

## Principles

1. **Conversations die; files survive. Pump the learning across before the session ends.**
2. **One lesson, one home. Routing beats accumulating.**
3. **The bar is behavioral: if it wouldn't change the next session, it isn't a lesson.**
4. **Three entries max. A memory nobody can re-read is not a memory.**
5. **A recurrence is not a new entry — it's evidence the skill itself needs amending.**
6. **Constraints and decisions belong to the human. Propose; don't legislate.**

---

## Output Format

1. **Harvest list** (candidates found, H1–H5 tagged — may be internal, summarized)
2. **Routing decisions** (which entry goes where)
3. **Written entries** (the diffs, ≤3)
4. **Retro report block** (Step 3 — always, even when empty)
5. **Marker written** (Step 4, if hook installed)

---

## Lessons Learned

> Yes, the retro skill has its own retro section: add an entry when the routing table sent
> a lesson to the wrong place, when the cap proved too tight/loose, or when the bar let
> trivia through or blocked something that later mattered.

```
[DATE] — [project] — [lesson about the retro process itself]
```
