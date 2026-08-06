---
name: sk-debugging
description: Diagnose and fix bugs through systematic reproduction, root cause analysis, and a permanent regression test. Use for any unexpected behavior, unanticipated test failure, "it works on my machine" situation, recurring bug, error caught and swallowed somewhere, or any case where the fix seems obvious before the cause is understood.
---

## Instructions

This is a launcher. The full process lives in `~/.claude/skills/debugging-skill.md` — read that file completely with the Read tool now. Do not paraphrase it from memory.

Hard constraints from the skill:

1. **Begin with the Step 0 bug statement** (OBSERVED / EXPECTED / TRIGGER / FREQUENCY / FIRST SEEN / SCOPE). If TRIGGER is unknown, finding it is the first task — do not investigate before you can produce the bug on demand.
2. **Reproduce before investigating** (Step 1): minimal reproduction, written as a failing test before fixing anything, verified stable across three runs.
3. **Triage exception:** only a typo / wrong variable / copy-paste error whose cause is visible without investigation may be fixed directly — and it still gets a regression test.
4. **Escalation rule:** if the cause turns out to be a design flaw rather than an implementation error — stop and escalate to an architecture discussion. A design flaw fixed at implementation level will return.
5. **No fix ships without the regression test** (Step 5), named after the bug, failing on the original code. Per CLAUDE.md §1.6.
6. In financial contexts, lens L2 (systemic impact) is forced — check whether the same root cause corrupted other records before closing.
