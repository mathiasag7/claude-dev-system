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
 *   - `no-scan` / `full-scan` / `scan-complet` anywhere in the prompt
 *                                          -> deterministic [MODE OVERRIDE]
 *                                             block for product-thinking-skill,
 *                                             emitted on every such prompt
 *                                             (never deduplicated)
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

// ---------------------------------------------------------------------------
// 1b. Deterministic mode-override detection (consumed by product-thinking-skill)
//     Detected HERE, mechanically — not left to the model's reading of the
//     prompt. `no-scan` wins over `full-scan` if both are present (explicit
//     opt-out beats opt-in). Accepts hyphen/space/plain variants and the
//     French `scan-complet`.
// ---------------------------------------------------------------------------
let scanMode = null;
if (/(^|[^a-z0-9])no[-_ ]?scan([^a-z0-9]|$)/i.test(prompt)) {
  scanMode = "no-scan";
} else if (/(^|[^a-z0-9])(full[-_ ]?scan|scan[-_ ]?complet)([^a-z0-9]|$)/i.test(prompt)) {
  scanMode = "full-scan";
}

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

if (matches.length === 0 && !scanMode) process.exit(0);

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
  lines.push("[SKILL ACTIVATION — injected by hook, per CLAUDE.md §1.3]");
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

// ---------------------------------------------------------------------------
// 5b. Mode override — emitted on EVERY prompt where a mode keyword appears
//     (per-prompt, not per-session: the dedup cache does not apply to it).
//     Emitted even if no skill matched, since the user explicitly typed the
//     override and product-thinking may be loaded via its launcher instead.
// ---------------------------------------------------------------------------
if (scanMode) {
  if (lines.length > 0) lines.push("");
  lines.push(
    `[MODE OVERRIDE — detected deterministically by hook] Impact Scan mode for product-thinking-skill: ${scanMode}. ` +
      (scanMode === "no-scan"
        ? "Skip Step 4a (Impact Scan) entirely. All other steps run unchanged — this keyword never skips Steps 0-2."
        : "Run Step 4a (Impact Scan) with line caps removed: complete inventory of every confirmed reference. Still confirmed-only, still an inventory — never speculative prose.")
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
