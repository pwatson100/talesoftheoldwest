import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseSaddlebagMarkdown } from "../module/helpers/saddlebag/parse.mjs";

/** Load and parse a scrubbed fixture; returns a fresh copy of `{ character, campaign, ... }`. */
export function loadFixture(name) {
  const text = readFileSync(fileURLToPath(new URL(`./fixtures/saddlebag/${name}.md`, import.meta.url)), "utf8");
  const result = parseSaddlebagMarkdown(text);
  if (!result.ok) throw new Error(`Fixture ${name} failed to parse: ${result.error}`);
  return result.data;
}
