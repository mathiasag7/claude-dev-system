#!/usr/bin/env node
// Stop hook: if this session modified code and no retro was done, block ONCE
// with the instruction to run the retro. Marker file guarantees single fire.
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

const input = JSON.parse(readFileSync(0, "utf8"));

// Never fight the loop guard: if we already blocked once, always allow.
if (input.stop_hook_active) process.exit(0);

const cacheDir = join(process.cwd(), ".claude", ".cache", "retro");
const marker = join(cacheDir, `${input.session_id || "unknown"}`);
if (existsSync(marker)) process.exit(0);

// Heuristic: did this session touch code-like files? (uncommitted changes)
const CODE = /\.(py|js|mjs|ts|tsx|jsx|html|css|scss|json|md|yml|yaml|sql)$/i;
let touched = [];
try {
  const out = execSync("git status --porcelain", { encoding: "utf8" });
  touched = out.split("\n").filter(Boolean)
    .map(l => l.slice(3).trim())
    .filter(f => CODE.test(f) && !f.startsWith(".claude/.cache/"));
} catch { /* not a git repo → stay silent */ }

if (touched.length === 0) process.exit(0);

// Write the marker BEFORE blocking → the gate fires exactly once per session.
mkdirSync(cacheDir, { recursive: true });
writeFileSync(marker, new Date().toISOString());

console.log(JSON.stringify({
  decision: "block",
  reason:
    "RETRO GATE — this session modified code (" + touched.length + " file(s)) and no retro " +
    "has been consigned. Before ending: read .claude/skills/retro-skill.md and run it now — " +
    "harvest H1–H5 events against the consignment bar, route each lesson to its home " +
    "(skill Lessons Learned / PROJECT.md §4-§5-§8, propose for §3-§6-§10 / skill-rules.json " +
    "keywords), max 3 entries, deduplicate, then output the retro report block. " +
    "If nothing passes the bar, state exactly: \"Retro: nothing meets the consignment bar.\" " +
    "Then finish your response."
}));
