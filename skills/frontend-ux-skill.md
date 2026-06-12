---
name: frontend-ux-engineer
version: 1.0.0
description: Design user experiences that complete tasks efficiently, prevent errors before they happen, and communicate system state clearly. Prevents flow friction, unhandled failure modes, and feedback gaps before they reach users.
category: engineering
tags: [frontend, ux, flow, feedback, errors, tasks, cognitive-load, back-office, consumer]
---

# Frontend UX Engineer Skill

Use this skill BEFORE designing any user flow, form, or interaction sequence. It is tool-agnostic — applies whether you're working in Figma, Pencil, or directly in code.

**UX is not UI.** UI asks: does it look right? UX asks: does the user succeed? A beautiful interface that makes users fail is bad UX. An ugly interface that completes tasks reliably is good UX. Design for success, not appearance.

This skill has two layers:
- **The Core Process** (Steps 0–6): apply to every flow, every time.
- **Quality Lenses** (L1–L4): activate based on user type and project context.

---

## When to Trigger

- Designing a new user flow (any sequence of steps to accomplish a goal)
- Adding a form with more than two fields
- Implementing an action with irreversible or significant consequences
- Any flow where the user could fail and there is no defined recovery path
- Noticing that users need multiple steps to accomplish something that should take one
- Receiving a spec that describes what the system does, not what the user achieves

---

## Triage — Fast Exit

- **Single static display, no user interaction, no decisions?** → Skip this skill.
- **Cosmetic change inside an existing, validated flow?** → Skip this skill.
- **Everything else** → Run the process.

**Escalation rule:** If during implementation you discover the flow requires the user to make a decision that wasn't in the spec — stop. An undocumented decision point is an undesigned failure mode.

---

## Process

### Step 0 — Define the Task, Not the Feature

Before designing anything, write:

> "The user needs to [accomplish goal] starting from [context], ending when [completion condition]."

The critical discipline: write from the user's perspective, not the system's.

**Wrong framing (system-centric):**
> "The system needs to collect KYC information and validate it against regulatory requirements."

**Right framing (user-centric):**
> "The user needs to complete their account verification starting from the dashboard, ending when they receive confirmation that their documents are accepted."

These describe the same feature. The second one immediately surfaces questions the first hides: What does the user do if a document is rejected? What do they see while validation is pending? How long does it take?

**Verification — present before proceeding:**

```
USER GOAL:    "[what they are trying to accomplish]"
START STATE:  "[where they are when the task begins]"
END STATE:    "[what success looks like — what they see, what changes]"
FAILURE MODES:"[ways the task can fail — user error, system error, edge case]"
USER TYPE:    "[who is doing this — expert daily user, or first-time visitor?]"
```

If FAILURE MODES is empty — stop. Every task that involves user input or async operations has failure modes. Name them before designing the happy path.

---

### Step 1 — Map the Full Task Flow

Draw the complete flow before designing any individual screen. A flow that looks simple screen-by-screen can be broken end-to-end.

**Flow map format:**

```
[Trigger] → [Step 1] → [Decision?] → [Step 2] → ... → [Completion]
                            ↓ No
                       [Recovery path]
```

**Rules:**
- Every decision point must have both branches designed. A branch that leads nowhere is a dead end.
- Every error state must have a recovery path. An error with no recovery is a trap.
- Every async operation must have a waiting state. A flow that disappears while the server responds is broken.
- The flow must end somewhere definitive. The user must always know when the task is complete.

**The dead end audit:**
After drawing the flow, find every node that has no outgoing path. Each one is a place where the user gets stuck. Design an exit for every one.

---

### Step 2 — Measure and Reduce Task Length

Count the steps. Then challenge every one.

**Step count audit:**

For each step in the flow, ask:
1. **Is this step necessary to complete the goal?** If the system could infer or default this, remove it.
2. **Does this step belong here?** Some steps exist because the system needs them, not the user. Move them to background processes.
3. **Can this step be merged with the previous or next one?** Two fields on two separate screens is often one screen.
4. **Is the user being asked to provide information the system already has?** Never ask for what you know.

**Reduction targets by task type:**

| Task type | Maximum acceptable steps | Red flag |
|---|---|---|
| Single data entry (create one record) | 1–2 screens | > 3 screens |
| Multi-part form (complex entity) | 3–4 screens with progress | > 5 screens, no progress indicator |
| Approval / review action | 1 screen + 1 confirmation | > 2 screens |
| Destructive action (delete, cancel, close) | 1 confirmation dialog | Multi-step confirmation for non-critical actions |
| Search and find | Filter → results on same screen | Filter on one page, results on another |

**Anti-pattern: The system-paced flow**
The system has 8 internal validation steps. The designer creates 8 screens, one per step. The user fills in 2 fields per screen and clicks "Next" 8 times.

Fix: The number of user-facing steps must reflect the user's mental model of the task — not the system's processing steps. Batch system steps behind one user step.

---

### Step 3 — Design Error Prevention Before Error Handling

The best error message is the one that never appears. Design to prevent errors first, then handle the ones that remain.

**Prevention hierarchy (in order of preference):**

1. **Constrain the input** — make it impossible to enter invalid data. Use date pickers instead of text fields for dates. Use select menus instead of free text for fixed options. Mask phone number fields.
2. **Guide with context** — show format examples, limits, and requirements inline, before the user makes a mistake. Not in a tooltip they have to hover to see.
3. **Validate progressively** — validate as the user types or moves to the next field, not only on submit. A user who fills out 10 fields and gets all errors at once will not trust the form.
4. **Confirm before irreversible actions** — a confirmation step is not UX friction for destructive actions. It is the last line of error prevention.
5. **Handle the error clearly** — when prevention fails, the message must tell the user what went wrong, why, and exactly what to do next.

**Error message contract:**
Every error message must answer three questions:
- **What happened?** (not "Error 422" — "Your ID number is invalid")
- **Why?** (not always necessary, but when it helps: "ID numbers must be 9 digits")
- **What do I do?** ("Check the number on your national ID card and try again")

**Anti-pattern: The submit-gate error**
User fills a long form. Clicks submit. All validation runs. 6 error messages appear at once, scattered across the form. User must scroll to find each one.

Fix: Validate field-by-field on blur. Show errors where they occur. On submit, scroll to the first error automatically.

**Anti-pattern: The vague error**
"Something went wrong. Please try again."

Fix: Be specific. "We couldn't save your changes because the session expired. Please log in again — your unsaved data will be restored."

---

### Step 4 — Design Every Feedback Moment

After every action, the user must know three things: did it work, what happened, and what's next.

**The feedback obligation — for every user action:**

| Action type | Required feedback | Timing |
|---|---|---|
| Button click (async) | Immediate loading state on the button | 0ms |
| Form submit | Disable form + loading indicator | 0ms |
| Success | Confirmation message + next step or CTA | On completion |
| Failure | Specific error message + recovery action | On completion |
| Long operation (> 3s) | Progress indicator with estimated time or steps | During operation |
| Destructive action | Confirmation dialog before, success confirmation after | Before + after |
| Background process | Status indicator the user can check | During + on completion |

**The silence rule:** If the system is doing something and the user sees no change for more than 1 second — the interface is broken, regardless of whether the operation succeeds. Silence reads as failure.

**Anti-pattern: The invisible success**
User submits a form. The form clears. Nothing else happens. Did it work? Is it still processing? Was there an error?

Fix: Every successful operation produces a visible, specific confirmation. "Transaction of XOF 50,000 submitted successfully. Reference: TXN-20240615-0042."

**Anti-pattern: The optimistic update that lies**
UI shows success before the server confirms. Server returns an error. User has already moved on.

Fix: Show success only after server confirmation. Use loading states to bridge the gap.

---

### Step 5 — Manage Cognitive Load

Cognitive load is the mental effort required to use the interface. Every unnecessary decision, every piece of irrelevant information, every non-obvious control is friction. Friction accumulates.

**Cognitive load audit — for every screen:**

- [ ] **Decision count:** How many decisions does the user face on this screen? If more than one primary decision — split the screen or remove options.
- [ ] **Information relevance:** Is every piece of information on this screen relevant to the current task? Information that doesn't help the current decision is noise.
- [ ] **Control obviousness:** Would a first-time user know what every interactive element does without reading a label?
- [ ] **Default quality:** Are the defaults the right choice for most users most of the time? A good default removes a decision.
- [ ] **Progressive disclosure:** Is advanced or rarely-needed content hidden until requested? Showing everything always overwhelms everyone.

**The one-primary-action rule:** Every screen has one thing the user is supposed to do next. That action must be visually unmistakable. Everything else is supporting context.

**Anti-pattern: The options explosion**
A form with 20 visible fields, 12 of which apply to 5% of cases. Every user must scan all 20 fields to find the 8 they need.

Fix: Show the 8 fields that apply to 95% of users. Reveal the rest behind "Advanced options" or conditional logic.

**Anti-pattern: The false choice**
User is asked to choose between two options that mean the same thing to them, but have different system implications that aren't explained.

Fix: Either pick the right default and remove the choice, or explain the implications in plain language where the choice is made.

---

### Step 6 — Define the Empty and First-Use Experience

The first time a user encounters a feature, there is no data, no history, no context. This is the most important moment to design — and the most commonly skipped.

**First-use checklist:**

- [ ] What does the user see the first time they open this section? (Never a blank screen with a table header.)
- [ ] Does the empty state explain what this section is for?
- [ ] Does the empty state give the user a clear action to get started?
- [ ] Is the onboarding path the shortest path to the first success — not the most complete path?
- [ ] If the user makes a mistake on their first try, can they recover without losing progress?

**The first success rule:** The goal of onboarding is not to explain the product. It is to get the user to their first success as fast as possible. The first success creates trust. Trust creates engagement.

**Empty state contract:**
```
Every empty state must contain:
1. A visual signal (icon or illustration) — not just text
2. A plain-language explanation of what will appear here
3. A primary action to create the first item (when applicable)

Example:
[Icon: document with plus sign]
"No transactions yet"
"Transactions will appear here once your account is active."
[Button: "Make your first deposit"]
```

---

## Quality Lenses

---

### L1 — Expert User Lens

> Activate when: the product is used daily by the same users to accomplish repetitive professional tasks (back-office, operations, data entry, case management).

**The principle:** Expert users optimize for speed, not discoverability. They know what the interface does. They want to do it faster. Designing for the first-time visitor at the expense of the daily user is a UX failure.

**Expert user checklist:**

- [ ] Are keyboard shortcuts available for the most frequent actions?
- [ ] Can the user skip steps they've already completed in a previous session?
- [ ] Are filter, sort, and view preferences saved across sessions?
- [ ] Can the user reach the most frequent action in ≤ 2 clicks from any context?
- [ ] Is bulk action available for tasks the user performs on multiple records daily?
- [ ] Are confirmation dialogs for non-destructive actions suppressible after the first time?

**Anti-pattern: Protecting the expert from themselves**
Daily operations user must confirm every action with a dialog — even non-destructive ones. After 50 times, the confirmation is invisible noise and a source of frustration.

Fix: Reserve mandatory confirmation for genuinely destructive or irreversible actions. For recoverable actions, allow undo instead of confirmation.

**Anti-pattern: Discoverability tax on expert users**
Large, spaced-out buttons with descriptive labels and illustrative icons. Great for onboarding. Exhausting for someone who processes 200 records a day.

Fix: Design the information density appropriate to the user's expertise. Let users who know the product compress the interface.

---

### L2 — First-Time User Lens

> Activate when: the product targets new users, has a significant onboarding step, or users encounter features infrequently.

**The principle:** First-time users don't read. They scan, click, and infer. The interface must be self-explanatory in the order a user will encounter it — not in the order the features were built.

**First-time user checklist:**

- [ ] Is the primary action on every screen discoverable without reading any documentation?
- [ ] Are labels written in user vocabulary — not system or technical vocabulary?
- [ ] Is the sequence of steps presented in the order the user thinks about the task?
- [ ] Are consequences of actions stated before the action is taken — not after?
- [ ] Is there a safe way to explore without accidentally doing something irreversible?

**The vocabulary rule:** If a label or instruction requires the user to know a technical term to understand it — rewrite it. "Submit for KYC verification" → "Send your identity documents for review." The user knows what documents are. They don't know what KYC is.

**Anti-pattern: The insider label**
Navigation item labeled with internal product terminology. Users who didn't write the spec don't know what it means.

Fix: Label with the outcome, not the feature name. "Check your account status" not "Account Lifecycle Management."

---

### L3 — Error Recovery Lens

> Activate when: the product handles high-stakes or irreversible actions, or users frequently encounter errors in the current system.

**The principle:** Users will make mistakes. The question is not whether to handle errors — it is whether recovery is possible, clear, and fast. An interface that traps users in error states destroys trust permanently.

**Error recovery checklist:**

- [ ] Can the user undo the last action? If not — is the confirmation step sufficient protection?
- [ ] If a multi-step flow fails at step 4, does the user return to step 1 with all progress lost — or to step 4 with the error explained?
- [ ] Are partial saves implemented for long forms? A user who loses 20 minutes of work doesn't come back.
- [ ] Is there a "save as draft" or equivalent for complex tasks that can't be completed in one session?
- [ ] When a system error occurs (server down, timeout), does the UI explain that it's a system problem — not a user error?

**The blame rule:** Never make a system error feel like a user error. "Your request could not be processed" with no explanation implies the user did something wrong. "Our server is temporarily unavailable — your data has been saved. Please try again in a few minutes" is honest and preserves trust.

**Anti-pattern: The progress trap**
User fills 15 fields across 4 steps. Step 4 fails due to a validation error on a field from step 1. System returns user to step 1. All subsequent fields are cleared.

Fix: Preserve all entered data across steps. Return the user to the specific step and field where the error occurred. Never discard progress on error.

---

### L4 — Mobile-First Interaction Lens

> Activate when: the product is accessed primarily on mobile, or mobile usage is significant.

**The principle:** Mobile is not a constrained version of desktop. It is a different interaction context: one thumb, variable attention, interrupted sessions, no hover state, no keyboard shortcuts.

**Mobile interaction checklist:**

- [ ] Are all primary actions reachable with one thumb without shifting grip?
- [ ] Are destructive actions placed away from frequent actions — not adjacent in a list?
- [ ] Does the flow accommodate interrupted sessions? (User gets a phone call mid-form — does progress persist?)
- [ ] Are swipe gestures used only where they are standard on the platform — not invented conventions?
- [ ] Does the keyboard appearance not obscure the field being typed in or the submit button?
- [ ] Are loading states full-screen or clearly contained — not partial overlays that confuse touch targets?

**The thumb zone rule:** The bottom center of a mobile screen is the easiest reach. The top corners are the hardest. Primary actions belong in the easy zone. Destructive or rare actions belong in the hard zone — not because they're hidden, but because the friction is appropriate.

**Anti-pattern: The desktop flow on mobile**
Multi-column form layout. Tiny touch targets. Hover-only tooltips. Submit button at the top of the page. The user must scroll up after filling in the last field to submit.

Fix: Single-column layout. Submit at the bottom, always visible or sticky. No hover-dependent information.

---

## Anti-Patterns (Recurring Across Projects)

**Anti-pattern: Designing the system, not the task**
The flow mirrors the system's internal process. 8 screens because there are 8 validation steps. Users don't care about internal steps — they care about completing their goal.
Fix: Design from the user's task model. Collapse system steps behind single user steps.

**Anti-pattern: The missing recovery path**
Every error state leads to a dead end. User hits an error — there is no "go back," no "try again," no explanation of what to do next.
Fix: Every error state is a design requirement with the same priority as the success state.

**Anti-pattern: The assumed context**
The interface assumes the user knows what they're looking at. No labels on dashboard metrics. No explanation of what a section does. No guidance on what to do first.
Fix: Never assume context. The user's mental model of the product is never the same as the builder's.

**Anti-pattern: Feedback debt**
Every action completes silently. No confirmation, no error, no loading state. The user is left guessing.
Fix: Define the feedback for every action before implementing it. Feedback is not optional polish.

**Anti-pattern: The form as interrogation**
Long form with no explanation of why each field is needed, no indication of progress, no save state, mandatory fields that the system could infer.
Fix: Every field must justify its existence. If you can infer it — infer it. If you need it — explain why.

---

## Principles (Technology-Agnostic)

1. **The user's goal is the unit of design.** Not the feature, not the screen, not the form. The goal.
2. **The best step is the one you remove.** Every step that doesn't contribute to the goal is friction.
3. **Design error prevention before error messages.** The interface should make mistakes hard to make.
4. **Silence is failure.** If the system is doing something and the user sees nothing — the interface is broken.
5. **Defaults are decisions.** A good default removes a decision from the user. A bad default forces a correction.
6. **Expert users and first-time users need different interfaces.** Know which you're designing for, and when they're the same person.
7. **Never make a system error feel like a user error.** Honesty about what went wrong preserves trust.
8. **Progress is never optional.** Never discard user input on error.
9. **Confirmation is for irreversible actions.** Overusing it trains users to ignore it.
10. **The first success is more important than the full feature.** Get the user to a win before showing them everything.

---

## Questions to Ask Before Shipping

**Core (always):**
- Can the user complete this task without reading any documentation?
- What happens if the user makes the most likely mistake at each step?
- What does the user see while waiting for the system to respond?
- What does the user see when the operation fails?
- How many steps does this task take — and is each step necessary?
- What is the user's mental model of this task, and does the flow match it?

**Expert User (L1):**
- Can a daily user complete this task in under 30 seconds?
- Are filter and view preferences saved across sessions?

**First-Time User (L2):**
- Would a user who has never seen this product know what to do first?
- Are all labels written in user vocabulary, not system vocabulary?

**Error Recovery (L3):**
- If the operation fails at the last step, how much progress does the user lose?
- Does the error message tell the user what to do, not just what went wrong?

**Mobile (L4):**
- Are all primary actions reachable with one thumb?
- Does the flow survive an interrupted session?

---

## Output Format

When this skill is invoked, produce:

1. **Active lenses** (which of L1–L4 apply and why)
2. **Task definition** (Step 0 verification block — goal, start, end, failure modes, user type)
3. **Full task flow** (every step, every branch, every dead end identified)
4. **Step count audit** (current count, justified reductions, target count)
5. **Error prevention map** (for each input — constraint, guidance, validation, confirmation)
6. **Feedback inventory** (every action mapped to its required feedback and timing)
7. **Cognitive load audit** (decision count per screen, defaults defined, progressive disclosure applied)
8. **Lens findings** (findings from each active lens)
9. **Implementation plan** (screens to design, in task order, with state coverage per screen)

Do NOT skip items 3, 5, or 6. A flow without a complete branch map, error prevention strategy, and feedback inventory is not ready to implement.
