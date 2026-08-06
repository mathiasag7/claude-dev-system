---
name: sk-retro
description: End-of-session knowledge capture. Use at the end of any session that modified code, templates, config, or skills; before a context compaction in a long session; when the Stop-hook retro gate fires; right after fixing a bug the human found manually (immediate micro-retro); or when the human asks "what did we learn" / "qu'est-ce qu'on retient". Harvests at most 3 lessons that would change behavior next session, routes each to its correct home (a skill's Lessons Learned, PROJECT.md §3/§4/§5/§6/§8/§10, or skill-rules.json triggers), deduplicates, writes, and reports one line per entry. NOT for pure Q&A sessions with no changes and no corrections — those end with "Retro: nothing meets the consignment bar."
---

## Instructions

This is a launcher. The full process lives in `~/.claude/skills/retro-skill.md` — read that file completely with the Read tool now. Do not paraphrase it from memory.

Hard constraints from the skill:

1. **Harvest only H1–H5 events** (human-caught miss, wrong assumption, skill misfire, established pattern, discovered debt), each tested against the consignment bar: *would writing this change next session's behavior?* If nothing passes, the entire retro is the single line `Retro: nothing meets the consignment bar.` — never pad.
2. **Route before writing.** One lesson, one home, per the Step 1 routing table: skill Lessons Learned for process misses, PROJECT.md §4/§5 for corrected assumptions, §8 for debt, §10 for decisions, skill-rules.json keywords for trigger misses. Never pile everything into one file, and never invent a new skill silently — a coverage gap is reported as a question.
3. **Deduplicate and cap at 3 entries.** An equivalent existing entry is annotated `— recurred [DATE]`, not duplicated — and a recurrence escalates to proposing an amendment to the failing skill step.
4. **Write directly, except §3 / §6 / §10 of PROJECT.md**, which are proposed for the human's ok unless the decision was explicitly validated during the session — closing a question the human never closed is scope theft (CLAUDE.md §1.8).
5. **Always end with the retro report block** (consigned / proposed / not consigned), then write the session marker `.claude/.cache/retro/<session_id>` so the Stop gate does not re-fire.
