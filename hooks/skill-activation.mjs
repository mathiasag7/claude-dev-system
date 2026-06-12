#!/usr/bin/env node
/**
 * skill-activation.mjs — UserPromptSubmit hook for Claude Code
 *
 * Matches each user prompt against .claude/hooks/skill-rules.json and injects
 * a skill-activation instruction into Claude's context BEFORE the model sees
 * the prompt. This makes skill activation deterministic instead of voluntary.
 *
 * Behavior:
 *   - First match of a skill in a session  -> full activation instruction
 *   - Repeat match in the same session     -> one-line reminder (low noise)
 *   - No match                             -> silent (exit 0, no output)
 *
 * State is kept per-session in .claude/.cache/skill-hook/<session_id>.json
 * and is safe to delete at any time.
 *
 * Install (in .claude/settings.json):
 *   "hooks": {
 *     "UserPromptSubmit": [
 *       { "hooks": [ { "type": "command",
 *           "command": "node \"$CLAUDE_PROJECT_DIR/.claude/hooks/skill-activation.mjs\"" } ] }
 *     ]
 *   }
 *
 * Notes:
 *   - stdout of a UserPromptSubmit hook is appended to Claude's context.
 *   - This script never blocks the prompt (always exits 0); it only informs.
 *   - Keep skill-rules.json as the single place you maintain triggers.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// ---------------------------------------------------------------------------
// 1. Read hook input from stdin (JSON: { session_id, prompt, cwd, ... })
// ---------------------------------------------------------------------------
let input = "";
try {
  input = readFileSync(0, "utf8"); // fd 0 = stdin
} catch {
  process.exit(0);
}

let payload;
try {
  payload = JSON.parse(input);
} catch {
  process.exit(0); // malformed input — never break the user's prompt
}

const prompt = String(payload.prompt ?? "").toLowerCase();
if (!prompt.trim()) process.exit(0);

const sessionId = String(payload.session_id ?? "default").replace(/[^a-zA-Z0-9_-]/g, "");
const projectDir =
  process.env.CLAUDE_PROJECT_DIR ||
  payload.cwd ||
  dirname(dirname(dirname(fileURLToPath(import.meta.url)))); // hooks/ -> .claude/ -> root

// ---------------------------------------------------------------------------
// 2. Load rules
// ---------------------------------------------------------------------------
const rulesPath = join(projectDir, ".claude", "hooks", "skill-rules.json");
let rules;
try {
  rules = JSON.parse(readFileSync(rulesPath, "utf8"));
} catch {
  process.exit(0); // no rules file — do nothing
}

const maxSuggestions = rules.max_suggestions_per_prompt ?? 2;

// ---------------------------------------------------------------------------
// 3. Score every skill against the prompt
//    keyword hit = 1 point, regex pattern hit = 2 points, + small priority tiebreak
// ---------------------------------------------------------------------------
const matches = [];

for (const [name, skill] of Object.entries(rules.skills ?? {})) {
  let score = 0;

  for (const kw of skill.keywords ?? []) {
    // Word-boundary match so "test" doesn't fire on "latest", "ui" not on "build"
    const safe = kw.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(^|[^a-z0-9])${safe}([^a-z0-9]|$)`, "i");
    if (re.test(prompt)) score += 1;
  }

  for (const pat of skill.patterns ?? []) {
    try {
      if (new RegExp(pat, "i").test(prompt)) score += 2;
    } catch {
      /* bad regex in config — skip, don't crash */
    }
  }

  if (score > 0) {
    matches.push({ name, skill, score, priority: skill.priority ?? 0 });
  }
}

if (matches.length === 0) process.exit(0);

matches.sort((a, b) => b.score - a.score || b.priority - a.priority);
const selected = matches.slice(0, maxSuggestions);

// ---------------------------------------------------------------------------
// 4. Session state — full instruction on first match, short reminder after
// ---------------------------------------------------------------------------
const stateDir = join(projectDir, ".claude", ".cache", "skill-hook");
const statePath = join(stateDir, `${sessionId}.json`);
let state = { suggested: [] };
try {
  if (existsSync(statePath)) state = JSON.parse(readFileSync(statePath, "utf8"));
} catch {
  /* corrupted state — start fresh */
}

const fresh = selected.filter((m) => !state.suggested.includes(m.name));
const repeats = selected.filter((m) => state.suggested.includes(m.name));

// ---------------------------------------------------------------------------
// 5. Emit context for Claude
// ---------------------------------------------------------------------------
const lines = [];

if (fresh.length > 0) {
  lines.push("[SKILL ACTIVATION — injected by hook, per CLAUDE.md §1.2]");
  for (const m of fresh) {
    lines.push("");
    lines.push(`Task matches: ${m.name}  (${m.skill.file})`);
    lines.push(m.skill.instruction);
  }
  lines.push("");
  lines.push(
    "Read the skill file(s) above with the Read tool BEFORE doing any work — do not paraphrase from memory. " +
      "If you judge a matched skill does not apply to this specific request, state explicitly why in one sentence, then proceed."
  );
}

if (repeats.length > 0) {
  if (lines.length > 0) lines.push("");
  lines.push(
    `[SKILL REMINDER] Still in scope for this task type: ${repeats
      .map((m) => m.name)
      .join(", ")}. Their processes remain mandatory, including verification blocks and regression tests.`
  );
}

process.stdout.write(lines.join("\n"));

// Persist state (best effort)
try {
  mkdirSync(stateDir, { recursive: true });
  state.suggested = [...new Set([...state.suggested, ...selected.map((m) => m.name)])];
  writeFileSync(statePath, JSON.stringify(state));
} catch {
  /* non-fatal */
}

process.exit(0);
