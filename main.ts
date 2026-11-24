// One Word for Your Wi-Fi — entry builder.
// Scores candidate single words on the judge's five criteria, in the
// judge's own order, weighted 5/4/3/2/1, each scored 0-2:
//   1 (x5) on-subject: describes Wi-Fi as the entrant lives it
//   2 (x4) funny at once, a real laugh, no explanation needed
//   3 (x3) true to how home Wi-Fi actually behaves
//   4 (x2) fresh angle, not the word everyone reaches for
//   5 (x1) works as a single word, spelled to be got instantly
// The winner is written to /output/entry.txt and re-validated against
// the gate: UTF-8 text, 1-20 characters, not only whitespace, one word.

import { writeFileSync, readFileSync, mkdirSync } from "node:fs";

type Candidate = {
  word: string;
  scores: [number, number, number, number, number]; // criteria 1..5, each 0-2
  note: string;
};

const WEIGHTS = [5, 4, 3, 2, 1];

const CANDIDATES: Candidate[] = [
  {
    word: "Buffering",
    scores: [2, 1, 2, 0, 2],
    note: "The eternal state of the spinning wheel; true, but the first word everyone reaches for.",
  },
  {
    word: "Throttled",
    scores: [2, 1, 2, 2, 2],
    note: "The ISP quietly strangles the speed at month's end; fresh angle, instantly readable.",
  },
  {
    word: "Ghosted",
    scores: [2, 2, 2, 2, 2],
    note: "Full bars a second ago, gone now, no explanation, no goodbye — the signal ghosts you exactly like a date.",
  },
  {
    word: "Unplugged",
    scores: [2, 1, 1, 1, 2],
    note: "Someone vacuumed and the router went with it; funny, but it is about the plug, not the Wi-Fi itself.",
  },
  {
    word: "Spinning",
    scores: [1, 1, 2, 1, 1],
    note: "The wheel, forever; true, but vague — could describe any loading screen anywhere.",
  },
  {
    word: "OneBar",
    scores: [2, 1, 2, 1, 2],
    note: "Living on a single bar in the one room that matters; recognisable, mildly funny.",
  },
  {
    word: "Dropping",
    scores: [2, 0, 2, 0, 2],
    note: "Calls drop, games drop; accurate but flat, more complaint than joke.",
  },
  {
    word: "OnStrike",
    scores: [2, 2, 1, 2, 2],
    note: "The Wi-Fi downed tools and walked out at the worst moment; funny, though real Wi-Fi never announces a strike.",
  },
  {
    word: "AnyDayNow",
    scores: [1, 1, 1, 1, 2],
    note: "The page will load any day now; a shrug more than a description of the connection itself.",
  },
  {
    word: "RebootMe",
    scores: [2, 1, 2, 1, 2],
    note: "The household liturgy — turn it off and on again; true and wry, but it asks the router, not describes the Wi-Fi.",
  },
];

function total(c: Candidate): number {
  return c.scores.reduce((sum, s, i) => sum + s * WEIGHTS[i], 0);
}

function fail(msg: string): never {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
}

function main(): void {
  const ranked = [...CANDIDATES].sort((a, b) => total(b) - total(a));
  for (const c of ranked) {
    console.log(`${c.word}: ${total(c)}/30 — ${c.note}`);
  }
  const winner = ranked[0];
  if (!winner) fail("no candidates");

  mkdirSync("/output", { recursive: true });
  writeFileSync("/output/entry.txt", winner.word, "utf8");

  const back = readFileSync("/output/entry.txt", "utf8");
  if (back !== winner.word) fail(`entry.txt round-trip mismatch: ${JSON.stringify(back)}`);
  const chars = [...back];
  if (chars.length < 1 || chars.length > 20) fail(`gate: length ${chars.length} outside 1-20`);
  if (back.trim().length === 0) fail("gate: entry is only whitespace");
  if (/\s/.test(back)) fail("gate: entry is not a single word");
  console.log(`WINNER: ${winner.word} (${total(winner)}/30, ${chars.length} chars)`);
}

main();
