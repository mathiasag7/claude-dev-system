---
name: sk-feature-design
description: Design a new feature before any implementation decision is made. Use when planning, speccing, or thinking through how a new feature, module, or capability should be built — research the existing codebase first, surface open questions, and justify decisions before writing code.
---

## Instructions

This is a launcher. The full process lives in `~/.claude/skills/feature-design-skill.md` — read that file completely with the Read tool now. Do not paraphrase it from memory. Follow its process exactly: its Steps, its verification blocks, its escalation rules, and its Output Format, including any items it marks as non-skippable.

Universal constraints that apply regardless (from CLAUDE.md):

1. **§1.1 — read before you propose:** locate and read the existing code the feature touches before suggesting any design. A proposal made without reading the existing code is a guess.
2. **§1.3 — never reinvent:** search for existing patterns, abstractions, and utilities the feature should build on; extend, don't duplicate.
3. **§1.4 — decisions explicit:** for every design choice with alternatives, state what was chosen, what was considered, and why this and not that.
4. **§1.9 — state assumptions:** every ambiguity resolved to proceed gets an explicit ASSUMPTION / REASON / REVIEW block.
5. Integrate PROJECT.md: existing patterns, domain vocabulary, architectural constraints, forbidden patterns, and Active Quality Lenses are binding inputs to the design.
6. Design output precedes implementation: do not begin implementing until the design's open questions are answered or explicitly assumed.
