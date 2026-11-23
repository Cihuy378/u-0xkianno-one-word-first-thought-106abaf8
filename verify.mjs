// Local gate check for the One Word, First Thought entry.
//
// Runs main.ts twice into /output and proves the two runs agree byte
// for byte, then checks the file against the competition gate the way
// the sealed scorer states it: UTF-8 text of 1 to 24 characters, not
// only whitespace, holding exactly one word and nothing else. Exits
// non-zero on any failure.
//
// Usage: node verify.mjs        (or: npm run verify)

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, rmSync } from "node:fs";

const OUT_FILE = "/output/entry.txt";
const EXPECTED = "borborygmus"; // the stomach's rumble, eleven letters.

function runOnce() {
  execFileSync(process.execPath, ["main.ts"], { stdio: "inherit" });
  return readFileSync(OUT_FILE);
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

// Only the entry file itself is removed between runs; /output, a bind
// mount in the grading sandbox, is never touched.
rmSync(OUT_FILE, { force: true });
const first = runOnce();
const firstHash = sha256(first);

rmSync(OUT_FILE, { force: true });
const second = runOnce();
const secondHash = sha256(second);

const text = first.toString("utf8");
const checks = [
  ["two runs byte-identical", firstHash === secondHash],
  ["bytes are exactly the word", text === EXPECTED],
  ["valid UTF-8 round-trip", Buffer.from(text, "utf8").equals(first)],
  ["1 to 24 characters", [...text].length >= 1 && [...text].length <= 24],
  ["not only whitespace", text.trim().length > 0],
  ["exactly one word, no spaces", text.trim().split(/\s+/).length === 1],
  ["no trailing newline", !text.endsWith("\n")],
  ["lowercase letters only", /^[a-z]+$/.test(text)],
];

let failed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) failed++;
}
console.log(`sha256: ${firstHash}`);
console.log(failed === 0 ? `all ${checks.length} checks passed` : `${failed} check(s) failed`);
process.exit(failed === 0 ? 0 : 1);
