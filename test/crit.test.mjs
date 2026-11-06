import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseCritResult } from "../module/helpers/saddlebag/crit.mjs";

const html = (fields) => fields.map(([label, text]) => `<p><strong>${label}</strong>: ${text}</p>`).join("");

const LACERATED = html([
  ["Location", "Gut"],
  ["Injury", "Lacerated Intestines"],
  ["Fatal", "Yes −1 / [[2d6]] Rounds"],
  ["Healing Time", "[[2d6]] Weeks"],
  ["Immediate Effect", "Stunned for 3 Rounds"],
  ["Long-Term Effect", "Something lasting"],
]);

test("uses Saddlebag's healing roll and leaves fatal dice unrolled", () => {
  const r = parseCritResult(LACERATED, 10);
  assert.equal(r.location, "Gut");
  assert.equal(r.injury, "Lacerated Intestines");
  assert.equal(r.healingTime, "10 Weeks");
  assert.equal(r.fatal, true);
  assert.equal(r.fatalText, "Yes −1 / 2d6 Rounds");
  assert.equal(r.instant, false);
  assert.equal(r.fatalPenalty, true);
  assert.equal(r.fatalDuration, "2d6 Rounds");
  assert.equal(r.immediateEffect, "Stunned for 3 Rounds");
  assert.equal(r.longTermEffect, "Something lasting");
});

test("keeps the healing dice as text when no roll was recorded", () => {
  assert.equal(parseCritResult(LACERATED, null).healingTime, "2d6 Weeks");
});

test("non-fatal injury with plain healing time", () => {
  const r = parseCritResult(
    html([
      ["Location", "Lower Leg"],
      ["Injury", "Twisted Ankle"],
      ["Fatal", "No"],
      ["Healing Time", "[[1d6]] Days"],
    ]),
    4,
  );
  assert.equal(r.fatal, false);
  assert.equal(r.fatalText, null);
  assert.equal(r.healingTime, "4 Days");
  assert.equal(r.longTermEffect, "None");
});

test("instant death has no healing time and a red long-term effect", () => {
  const r = parseCritResult(
    html([
      ["Location", "Head"],
      ["Injury", "Terrible Hit to the Head"],
      ["Fatal", "Yes / Instant"],
      ["Healing Time", "-"],
      ["Long-Term Effect", "YOU ARE VERY DEAD"],
    ]),
    null,
  );
  assert.equal(r.fatal, true);
  assert.equal(r.fatalText, "Yes / Instant");
  assert.equal(r.instant, true);
  assert.equal(r.fatalDuration, null);
  assert.equal(r.fatalPenalty, false);
  assert.equal(r.healingTime, null);
  assert.match(r.longTermEffect, /VERY DEAD/);
  assert.match(r.longTermEffect, /<strong/);
});

test("falls back to defaults for missing fields", () => {
  const r = parseCritResult("", null);
  assert.equal(r.location, "Body");
  assert.equal(r.injury, "Critical Injury");
  assert.equal(r.fatal, false);
  assert.equal(r.healingTime, null);
  assert.equal(r.immediateEffect, "None");
});

test("every result in the Critical Injuries table parses without throwing", () => {
  const dir = fileURLToPath(new URL("../rolltables/", import.meta.url));
  let table;
  try {
    table = JSON.parse(readFileSync(`${dir}tables_Critical_Injuries_d6HFQcLrhNfhp6I3.json`, "utf8"));
  } catch {
    return; // rolltables are optional in this checkout
  }
  assert.equal(table.results.length, 36);
  for (const result of table.results) {
    const r = parseCritResult(result.text, 3);
    assert.ok(r.location && r.injury, `result ${result.range}`);
    assert.doesNotMatch(r.fatalText ?? "", /\[\[/);
    assert.doesNotMatch(r.healingTime ?? "", /\[\[/);
  }
});
