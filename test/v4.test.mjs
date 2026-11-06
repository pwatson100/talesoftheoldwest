import { test } from "node:test";
import assert from "node:assert/strict";
import { toFoundry } from "../module/helpers/saddlebag/toFoundry.mjs";
import { parseCampaignJson } from "../module/helpers/saddlebag/parse.mjs";
import { loadFixture } from "./helpers.mjs";

// Saddlebag format version 4 (export of 6 Nov 2026).
const run = (name) => {
  const { character, campaign, formatVersion } = loadFixture(`v4/${name}`);
  return { character, campaign, formatVersion, plan: toFoundry(character, campaign, { dollarSign: true }) };
};
const codes = (plan) => plan.warnings.map((w) => w.code);

test("v4 fixtures parse and report formatVersion 4", () => {
  for (const name of ["clem-hale", "bluey", "mr-green"]) {
    assert.equal(run(name).formatVersion, 4);
  }
});

test("v4 Bluey: damage, XP and cash map from the new values", () => {
  const { plan } = run("bluey");
  const sys = plan.actorData.system;
  assert.deepEqual(sys.attributes.grit, { value: 2, max: 4 });
  assert.equal(sys.damage.hurts.value, 2);
  assert.deepEqual(sys.attributes.quick, { value: 1, max: 3 });
  assert.equal(sys.damage.shakes.value, 2);
  assert.equal(sys.general.xp.value, 2);
  assert.equal(sys.general.cash, "$3.00");
  assert.deepEqual(plan.conditions, []);
  assert.deepEqual(plan.injuries, []);
});

test("v4 Bluey: weapons carry loaded ammo and the new Peacemaker is a weapon", () => {
  const { plan } = run("bluey");
  const loaded = Object.fromEntries(plan.weapons.map((w) => [w.name, w.loaded]));
  assert.deepEqual(loaded, { "Quality Bow": 1, "Colt 45 Peacemaker": 6 });
  assert.equal(plan.gear.filter((g) => g.name === "Bullets").length, 2);
});

test("v4 Clem: dehydrated condition and ammo-kind gear are imported", () => {
  const { plan } = run("clem-hale");
  assert.deepEqual(plan.conditions, ["dehydrated"]);
  assert.ok(plan.gear.some((g) => g.name === "Arrows" && g.quantity === 20));
});

test("v4 Mr Green: grit at zero records full damage", () => {
  const { plan } = run("mr-green");
  assert.deepEqual(plan.actorData.system.attributes.grit, { value: 0, max: 3 });
  assert.equal(plan.actorData.system.damage.hurts.value, 3);
});

test("v4 fields without a Foundry equivalent are not warned about and survive in the flag", () => {
  const { character, plan } = run("bluey");
  assert.ok(!codes(plan).includes("unknown-ability"));
  assert.deepEqual(plan.flag.character.otherName, character.otherName);
  assert.deepEqual(plan.flag.character.portraitPrompt, character.portraitPrompt);
  assert.equal(plan.flag.character.horses[0].wildness, 1);
  assert.equal(plan.flag.character.formatVersion, 4);
});

test("parseCampaignJson accepts a v4 campaign envelope with npcs", () => {
  const json = JSON.stringify({ app: "saddlebag", kind: "campaign", formatVersion: 4, campaign: { id: "k1", npcs: [] } });
  const result = parseCampaignJson(json);
  assert.equal(result.ok, true);
  assert.deepEqual(result.data.campaign.npcs, []);
});
