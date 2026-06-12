---
name: sk-frontend-ui
description: Build and modify UI components and screens with complete state coverage and design-system consistency. Use when building a new screen or page layout, adding any component (even "just a button variant"), implementing anything with loading/empty/error/success states, noticing two screens solve the same visual problem differently, or receiving a design that doesn't specify absent/loading/wrong-data behavior. NOT for auditing a messy existing design (use /design-audit).
---

## Instructions

This is a launcher. The full process lives in `.claude/skills/frontend-ui-skill.md` — read that file completely with the Read tool now. Do not paraphrase it from memory.

Hard constraints from the skill:

1. **Begin with the Step 0 component contract** (COMPONENT / INPUT / OUTPUT / STATES / VARIANTS). If STATES is only "success" — stop; async or optional data always has more states.
2. **Map the state matrix** (Step 1): loading / empty / error / partial / success / disabled / read-only, each with a defined visual treatment. A component is not done until every applicable state is designed.
3. **Anchor to the design system** (Step 2): every value is a token — no magic numbers, no raw hex. Search for an existing component before building; extend, don't duplicate.
4. **Real-content test** (Step 4): shortest, longest, null. Design with worst-case content.
5. **Component API rules** (Step 5): never fetches its own data; never knows what page it lives on; optional props have defaults.
6. **Accessibility baseline** (Step 6) is part of done, not a layer at the end.
7. **Output Format items 2, 3, and 6 (contract, state matrix, real-content test) may not be skipped.**
8. **Escalation rule:** a variant that doesn't exist in the design system is a design-system decision — stop and surface it, don't improvise it.
