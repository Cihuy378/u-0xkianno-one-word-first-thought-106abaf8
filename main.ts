// One Word, First Thought — entry program.
//
// Writes exactly one word to /output/entry.txt and nothing else: no
// explanation, no second draft, no trailing newline. The file is the
// entry, byte for byte.
//
// The word is borborygmus: the rumbling of a stomach. It is the first
// thought of a body that has been waiting too long for lunch — a word
// that sounds like what it means, growling its way across the tongue.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// The rumble itself: eleven letters, one word, no spaces.
const WORD: string = "borborygmus";

const OUT_DIR: string = "/output";
const OUT_FILE: string = `${OUT_DIR}/entry.txt`;

// /output is a bind mount in the grading sandbox: never delete it,
// only create it when it is missing, then write the word.
mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_FILE, WORD, "utf8");

// Read-back guard: the entry is judged byte for byte, so refuse to
// exit cleanly unless the file on disk is exactly the word, nothing
// more and nothing less. A truncated or padded write must fail loudly
// here, never silently reach the judge.
const written: Buffer = readFileSync(OUT_FILE);
if (!written.equals(Buffer.from(WORD, "utf8"))) {
  throw new Error(
    `entry.txt mismatch: expected ${Buffer.from(WORD, "utf8").toString("hex")}, ` +
      `found ${written.toString("hex")}`,
  );
}
