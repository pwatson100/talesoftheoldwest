import { test } from "node:test";
import assert from "node:assert/strict";
import { toFoundry } from "../module/helpers/saddlebag/toFoundry.mjs";
import { loadFixture } from "./helpers.mjs";

const run = (name, options = { dollarSign: true }) => {
  const { character, campaign } = loadFixture(name);
  return { character, campaign, plan: toFoundry(character, campaign, options) };
};

const codes = (plan) => plan.warnings.map((w) => w.code);

test("Clem: attributes, archetype and no damage", () => {
  const { plan } = run("clem-hale");
  const sys = plan.actorData.system;
  assert.equal(plan.actorName, "Clem Hale");
  assert.equal(plan.actorData.type, "pc");
  assert.equal(sys.general.archetype, "Homesteader");
  assert.deepEqual(sys.attributes.grit, { value: 4, max: 4 });
  assert.deepEqual(sys.attributes.cunning, { value: 3, max: 3 });
  for (const track of ["hurts", "shakes", "vexes", "doubts"]) assert.equal(sys.damage[track].value, 0);
  assert.equal(sys.abilities.lightfingered.value, 0);
  assert.equal(sys.abilities.animalhandlin.value, 2);
  assert.equal(Object.keys(sys.abilities).length, 16);
  assert.equal(sys.general.cash, "$30.00");
  assert.equal(sys.general.age.value, 30);
  assert.equal(sys.general.faithpoints.value, 4);
});

test("Clem: horse is the current mount with a Foundry breed key", () => {
  const { plan } = run("clem-hale");
  assert.equal(plan.horses.length, 1);
  const [horse] = plan.horses;
  assert.equal(horse.breedKey, "missourifoxtrotter");
  assert.equal(horse.isCurrentMount, true);
  assert.equal(horse.ridingModifier, 1);
  assert.deepEqual(horse.qualityNames, ["Easy To Ride"]);
});

test("Clem: Sharps Rifle carries loaded only, with no damage or crit numbers", () => {
  const { plan } = run("clem-hale");
  const rifle = plan.weapons.find((w) => w.bookId === "sharps-rifle-1874");
  assert.ok(rifle);
  assert.equal(rifle.loaded, 0);
  assert.deepEqual(Object.keys(rifle).sort(), [
    "aliasName",
    "bookId",
    "holder",
    "loaded",
    "name",
    "notes",
    "saddlebagItemId",
    "stored",
  ]);
  const json = JSON.stringify({ ...plan, flag: null });
  assert.doesNotMatch(json, /"(damage|crit|attackMod|drawMod)":\d/);
});

test("Clem: horse-held gear is stored and warned about", () => {
  const { plan } = run("clem-hale");
  const saddle = plan.gear.find((g) => g.bookId === "saddle-and-gear");
  assert.equal(saddle.stored, true);
  assert.equal(saddle.holder.type, "horse");
  assert.ok(codes(plan).includes("horse-held-gear"));
  assert.equal(plan.gear.find((g) => g.bookId === "farming-equipment").stored, false);
});

test("Clem: talents map to references and ranks", () => {
  const { plan } = run("clem-hale");
  assert.deepEqual(
    plan.talents.map((t) => [t.slug, t.reference, t.rank, t.custom]),
    [
      ["companion", "companion", "basic", false],
      ["survivor", "survivor", "basic", false],
    ],
  );
});

test("Bluey: damaged grit", () => {
  const { plan } = run("bluey");
  const sys = plan.actorData.system;
  assert.equal(sys.attributes.grit.value, 3);
  assert.equal(sys.attributes.grit.max, 4);
  assert.equal(sys.damage.hurts.value, 1);
  assert.equal(sys.damage.shakes.value, 0);
});

test("Bluey: conditions, injury and pardner", () => {
  const { plan } = run("bluey");
  assert.deepEqual(plan.conditions, ["starving"]);
  assert.equal(plan.injuries.length, 1);
  assert.equal(plan.injuries[0].roll, 46);
  assert.equal(plan.injuries[0].healingRoll, 10);
  assert.equal(plan.actorData.system.general.yourpardner, "Clem Hale");
});

test("Bluey: custom talent and custom item", () => {
  const { plan } = run("bluey");
  const custom = plan.talents.find((t) => t.custom);
  assert.equal(custom.name, "Custom Talent");
  assert.equal(custom.rank, "advanced");
  assert.equal(custom.notes, "blah");
  assert.equal(custom.slug, "");
  const item = plan.gear.find((g) => g.custom);
  assert.equal(item.name, "Custom Item");
  assert.equal(item.bookId, null);
});

test("Bluey: cash honours the dollar option", () => {
  assert.equal(run("bluey").plan.actorData.system.general.cash, "$3.00");
  assert.equal(run("bluey", { dollarSign: false }).plan.actorData.system.general.cash, "3.00");
});

test("Bluey: Quality Bow is a weapon", () => {
  const { plan } = run("bluey");
  assert.ok(plan.weapons.some((w) => w.name === "Quality Bow"));
  assert.ok(!plan.gear.some((g) => g.name === "Quality Bow"));
});

test("Bluey: the blank compadre is imported as \"Compadre\" with a warning", () => {
  const { plan } = run("bluey");
  assert.equal(plan.compadres.length, 1);
  assert.equal(plan.compadres[0].name, "Compadre");
  assert.equal(plan.compadres[0].actorData.type, "npc");
  assert.equal(codes(plan).filter((c) => c === "compadre-unnamed").length, 1);
  assert.ok(!codes(plan).includes("unsupported-compadre"));
});

test("pardner kinds compadre and npc are understood; an unknown kind still warns", () => {
  const { character, campaign } = loadFixture("bluey");
  for (const kind of ["compadre", "npc", "pc"]) {
    character.pardner = { kind, id: "x", name: "Somebody" };
    assert.ok(!codes(toFoundry(character, campaign, {})).includes("unsupported-pardner"), kind);
  }
  character.pardner = { kind: "alien", id: "x", name: "Somebody" };
  assert.ok(codes(toFoundry(character, campaign, {})).includes("unsupported-pardner"));
});

test("Bluey: biography is escaped HTML", () => {
  const { character, campaign } = loadFixture("bluey");
  character.description = "Tall <b>& proud</b>\n\nSecond one";
  character.backstory = "Born in a barn.";
  const plan = toFoundry(character, campaign, {});
  assert.equal(
    plan.biographyHtml,
    "<p>Tall &lt;b&gt;&amp; proud&lt;/b&gt;</p><p>Second one</p><h3>Backstory</h3><p>Born in a barn.</p>",
  );
  assert.equal(plan.actorData.system.biography, plan.biographyHtml);
});

test("edge: current null means full value", () => {
  const { character, campaign } = loadFixture("clem-hale");
  character.attributes.grit.current = null;
  const plan = toFoundry(character, campaign, {});
  assert.equal(plan.actorData.system.attributes.grit.value, 4);
  assert.equal(plan.actorData.system.damage.hurts.value, 0);
});

test("edge: current 0 means value 0 and damage equals max", () => {
  const { character, campaign } = loadFixture("clem-hale");
  character.attributes.grit.current = 0;
  const plan = toFoundry(character, campaign, {});
  assert.equal(plan.actorData.system.attributes.grit.value, 0);
  assert.equal(plan.actorData.system.damage.hurts.value, 4);
});

test("edge: XP above 10 is clamped with a warning", () => {
  const { character, campaign } = loadFixture("clem-hale");
  character.xp = { earned: 15, spent: 3 };
  const plan = toFoundry(character, campaign, {});
  assert.equal(plan.actorData.system.general.xp.value, 10);
  assert.ok(codes(plan).includes("xp-overflow"));
});

test("edge: XP is earned minus spent", () => {
  const { character, campaign } = loadFixture("clem-hale");
  character.xp = { earned: 7, spent: 3 };
  const plan = toFoundry(character, campaign, {});
  assert.equal(plan.actorData.system.general.xp.value, 4);
  assert.ok(!codes(plan).includes("xp-overflow"));
});

test("edge: four horses become three with a warning", () => {
  const { character, campaign } = loadFixture("clem-hale");
  const base = character.horses[0];
  character.horses = [1, 2, 3, 4].map((n) => ({ ...structuredClone(base), id: `h${n}`, name: `Horse ${n}` }));
  const plan = toFoundry(character, campaign, {});
  assert.equal(plan.horses.length, 3);
  assert.ok(codes(plan).includes("too-many-horses"));
  assert.equal(plan.flag.character.horses.length, 4);
});

test("edge: unknown breed becomes other with a warning", () => {
  const { character, campaign } = loadFixture("clem-hale");
  character.horses[0].breedId = "unicorn";
  const plan = toFoundry(character, campaign, {});
  assert.equal(plan.horses[0].breedKey, "other");
  assert.ok(codes(plan).includes("unknown-breed"));
});

test("edge: unknown condition and invalid injury are skipped with warnings", () => {
  const { character, campaign } = loadFixture("bluey");
  character.conditions = ["starving", "sleepy"];
  character.injuries.push({ id: "x", roll: "70", healingRoll: null });
  character.injuries.push({ id: "y", roll: "abc", healingRoll: null });
  const plan = toFoundry(character, campaign, {});
  assert.deepEqual(plan.conditions, ["starving"]);
  assert.equal(plan.injuries.length, 1);
  assert.ok(codes(plan).includes("unknown-condition"));
  assert.equal(codes(plan).filter((c) => c === "invalid-injury").length, 2);
});

test("edge: unknown ability and archetype produce warnings", () => {
  const { character, campaign } = loadFixture("clem-hale");
  character.abilities.juggling = 2;
  character.creation.archetypeId = "astronaut";
  const plan = toFoundry(character, campaign, {});
  assert.ok(codes(plan).includes("unknown-ability"));
  assert.ok(codes(plan).includes("unknown-archetype"));
  assert.equal(plan.actorData.system.general.archetype, "");
  assert.equal(plan.actorData.system.abilities.juggling, undefined);
});

test("edge: ability and reputation values are clamped", () => {
  const { character, campaign } = loadFixture("clem-hale");
  character.abilities.labor = 9;
  character.reputation.morals = 0;
  const plan = toFoundry(character, campaign, {});
  assert.equal(plan.actorData.system.abilities.labor.value, 5);
  assert.equal(plan.actorData.system.general.morals.value, 1);
  assert.ok(codes(plan).filter((c) => c === "clamped").length >= 2);
});

test("edge: lifepath creation warns and leaves archetype blank", () => {
  const { character, campaign } = loadFixture("clem-hale");
  character.creation = { method: "lifepath", archetypeId: null, livings: ["grifter"], log: [] };
  const plan = toFoundry(character, campaign, {});
  assert.equal(plan.actorData.system.general.archetype, "");
  assert.ok(codes(plan).includes("creation-method"));
});

test("edge: unknown extra fields survive untouched in flag.character", () => {
  const { character, campaign } = loadFixture("bluey");
  character.somethingNew = { nested: [1, 2, { deep: true }] };
  character.items[0].futureField = "keep me";
  const copy = structuredClone(character);
  const plan = toFoundry(character, campaign, {});
  assert.deepEqual(plan.flag.character, copy);
  assert.deepEqual(plan.flag.campaign, campaign);
  assert.deepEqual(character, copy, "input must not be mutated");
});

test("output is JSON-serialisable and flag matches the input", () => {
  for (const name of ["clem-hale", "bluey"]) {
    const { character, campaign, plan } = run(name);
    const roundTripped = JSON.parse(JSON.stringify(plan));
    assert.deepEqual(roundTripped, plan);
    assert.deepEqual(plan.flag.character, character);
    assert.deepEqual(plan.flag.campaign, campaign);
    assert.equal(plan.flag.id, character.id);
  }
});
