import { test } from "node:test";
import assert from "node:assert/strict";
import { MAX_COMPADRES, animalSubtype, remapCompadreIds, toFoundryCompadres } from "../module/helpers/saddlebag/compadre.mjs";
import { toFoundry } from "../module/helpers/saddlebag/toFoundry.mjs";
import { loadFixture } from "./helpers.mjs";

const NOW = "2026-11-06T00:00:00.000Z";
const posse = () => loadFixture("v4/clem-hale-posse");
const run = (character) => toFoundryCompadres(character, { now: NOW });
const codes = (result) => result.warnings.map((w) => w.code);

// A hand-built compadre, labelled as such: no real file has talents, tags, a named attack or accompanying: false.
const human = (over = {}) => ({
  id: "h-1", kind: "human", name: "Hand Built", gender: null, genderNote: "", categoryId: null, portraitId: null,
  coat: "", description: "", attributes: {
    grit: { max: 3, current: 3 }, quick: { max: 3, current: 3 }, cunning: { max: 3, current: 3 }, docity: { max: 3, current: 3 },
  },
  keyAbility: null, abilities: {}, talents: [], publicReputation: "", privatePersonality: "", attack: null,
  tags: { builtIn: [], acquired: [] }, accompanying: true, where: "", notes: "", ...over,
});
const animal = (over = {}) => ({
  ...human({ id: "a-1", kind: "animal", name: "Hand Built Beast", attack: { name: "", damage: 0, crit: 0 } }),
  attributes: { grit: { max: 3, current: 3 }, quick: { max: 3, current: 3 }, cunning: { max: 3, current: 3 }, docity: null },
  ...over,
});
const withCompadres = (...list) => ({ id: "pc-1", name: "Tester", compadres: list });

test("Clem: three real compadres become one npc, one animal and one defaults-only npc", () => {
  const result = run(posse().character);
  assert.equal(result.compadres.length, 3);
  const [boy, captain, isadora] = result.compadres;

  assert.equal(boy.actorData.type, "npc");
  assert.equal(boy.name, "Clem's Boy");
  assert.equal(boy.actorData.system.general.archetype, "Cowboy, Rancher or Frontiersman");
  assert.deepEqual(boy.actorData.system.abilities.fightin, { value: 1 });
  assert.equal(boy.actorData.system.abilities.lightfingered.value, 0);
  assert.deepEqual(boy.actorData.system.attributes.docity, { value: 3, max: 3 });
  assert.equal(
    boy.actorData.system.biography,
    "<p>Male</p><p>Public reputation: Loyal</p><p>Private personality: Introvert</p><p>Youthful</p><p>TBD</p>",
  );

  assert.equal(captain.actorData.type, "animal");
  assert.equal(captain.actorData.system.general.subtype, "dog");
  assert.equal(captain.actorData.system.general.attacks, "");
  assert.equal(captain.actorData.system.attributes.docity, undefined);
  assert.equal(captain.actorData.system.damage.doubts, undefined);
  assert.ok(captain.actorData.system.biography.startsWith("<p>Coat &amp; markings: Bloodhound</p><p>Male</p>"));

  assert.equal(isadora.name, "Isadora Keller");
  assert.equal(isadora.actorData.system.biography, "");
  assert.equal(isadora.actorData.system.general.archetype, "");
  assert.deepEqual(codes(result), []);
});

test("flags keep the whole original record as a separate copy", () => {
  const { character } = posse();
  const result = run(character);
  const [boy] = result.compadres;
  assert.deepEqual(boy.flag.compadre, character.compadres[0]);
  assert.notEqual(boy.flag.compadre, character.compadres[0]);
  assert.equal(boy.flag.id, character.compadres[0].id);
  assert.equal(boy.flag.characterId, character.id);
  assert.equal(boy.flag.importedAt, NOW);
});

test("damage is the gap between max and current", () => {
  const h = human({ attributes: {
    grit: { max: 4, current: 1 }, quick: { max: 3, current: 3 }, cunning: { max: 2, current: 0 }, docity: { max: 5, current: 4 },
  } });
  const sys = run(withCompadres(h)).compadres[0].actorData.system;
  assert.deepEqual(sys.attributes.grit, { value: 1, max: 4 });
  assert.equal(sys.damage.hurts.value, 3);
  assert.equal(sys.damage.shakes.value, 0);
  assert.equal(sys.damage.vexes.value, 2);
  assert.equal(sys.damage.doubts.value, 1);
});

test("current above max clamps with a warning; values above the cap clamp", () => {
  const h = human({ attributes: {
    grit: { max: 3, current: 5 }, quick: { max: 9, current: 9 }, cunning: { max: 3, current: 3 }, docity: { max: 3, current: 3 },
  } });
  const result = run(withCompadres(h));
  const sys = result.compadres[0].actorData.system;
  assert.deepEqual(sys.attributes.grit, { value: 3, max: 3 });
  assert.deepEqual(sys.attributes.quick, { value: 5, max: 5 });
  assert.ok(codes(result).filter((c) => c === "clamped").length >= 2);

  const a = animal({ attributes: { grit: { max: 12, current: 12 }, quick: { max: 3, current: 3 }, cunning: { max: 3, current: 3 }, docity: null } });
  assert.deepEqual(run(withCompadres(a)).compadres[0].actorData.system.attributes.grit, { value: 10, max: 10 });
});

test("a blank attribute keeps the Foundry default and warns", () => {
  const h = human();
  h.attributes.cunning = { max: null, current: null };
  const result = run(withCompadres(h));
  assert.equal(result.compadres[0].actorData.system.attributes.cunning, undefined);
  assert.deepEqual(codes(result), ["compadre-missing-attribute"]);

  const h2 = human();
  h2.attributes.docity = null;
  assert.deepEqual(codes(run(withCompadres(h2))), ["compadre-missing-attribute"]);
});

test("abilities: hyphens removed, rank clamped, unknown key warned", () => {
  const h = human({ abilities: { "light-fingered": 2, "animal-handlin": 9, bogus: 1 } });
  const result = run(withCompadres(h));
  const abilities = result.compadres[0].actorData.system.abilities;
  assert.deepEqual(abilities.lightfingered, { value: 2 });
  assert.deepEqual(abilities.animalhandlin, { value: 5 });
  assert.ok(!("bogus" in abilities));
  assert.deepEqual(codes(result).sort(), ["clamped", "unknown-ability"]);
});

test("an animal keeps only the four animal abilities", () => {
  const a = animal({ abilities: { fightin: 2, labor: 3, move: 1 } });
  const abilities = run(withCompadres(a)).compadres[0].actorData.system.abilities;
  assert.deepEqual(Object.keys(abilities).sort(), ["fightin", "move"]);
});

test("animalSubtype guesses from text and never says horse", () => {
  assert.equal(animalSubtype("wolf pack"), "wolf");
  assert.equal(animalSubtype("Grey Wolves"), "wolf");
  assert.equal(animalSubtype("Bloodhound"), "dog");
  assert.equal(animalSubtype("the pup"), "dog");
  assert.equal(animalSubtype("Rex", "", "a good DOG"), "dog");
  assert.equal(animalSubtype("Captain"), "critters");
  assert.equal(animalSubtype("Old Horse", "stallion"), "critters");
  assert.equal(animalSubtype(), "critters");
  assert.equal(animalSubtype(null, 4, undefined), "critters");
});

test("blank names get a default and a warning", () => {
  const result = run(withCompadres(human({ name: "  " }), animal({ name: "" })));
  assert.deepEqual(result.compadres.map((c) => c.name), ["Compadre", "Animal compadre"]);
  assert.deepEqual(codes(result), ["compadre-unnamed", "compadre-unnamed"]);
});

test("accompanying: false adds a biography line", () => {
  const away = run(withCompadres(human({ accompanying: false, where: "Back at the ranch" }))).compadres[0];
  assert.equal(away.accompanying, false);
  assert.equal(away.actorData.system.biography, "<p>Not with the PC: Back at the ranch</p>");
  const noPlace = run(withCompadres(human({ accompanying: false }))).compadres[0];
  assert.equal(noPlace.actorData.system.biography, "<p>Not with the PC</p>");
  assert.equal(run(withCompadres(human())).compadres[0].actorData.system.biography, "");
});

test("a named animal attack is written as escaped HTML", () => {
  const a = animal({ attack: { name: "Bite <hard>", damage: 2, crit: 3 } });
  assert.equal(run(withCompadres(a)).compadres[0].actorData.system.general.attacks, "<p>Bite &lt;hard&gt; · damage 2 · crit 3</p>");
  const noName = animal({ attack: { name: "", damage: 1, crit: 0 } });
  assert.equal(run(withCompadres(noName)).compadres[0].actorData.system.general.attacks, "<p>Attack · damage 1 · crit 0</p>");
});

test("animal tags become title-cased quality names", () => {
  const a = animal({ tags: { builtIn: ["easy-to-ride"], acquired: ["sure-footed"] } });
  assert.deepEqual(run(withCompadres(a)).compadres[0].qualityNames, ["Easy To Ride", "Sure Footed"]);
});

test("a human's talents use the PC talent plan shape", () => {
  const h = human({ talents: [{ name: "Tough As Nails", talentId: "tough-as-nails", rank: "advanced" }, { name: "Mine", rank: "basic" }] });
  const talents = run(withCompadres(h)).compadres[0].talents;
  assert.deepEqual(talents[0], { slug: "tough-as-nails", reference: "toughasnails", name: "Tough As Nails", rank: "advanced", custom: false, notes: "" });
  assert.equal(talents[1].custom, true);
  assert.equal(talents[1].slug, "");
});

test("category: known id gives its name, unknown id warns and stays blank", () => {
  assert.equal(run(withCompadres(human({ categoryId: "trader" }))).compadres[0].actorData.system.general.archetype, "Trader");
  const bad = run(withCompadres(human({ categoryId: "wizard" })));
  assert.equal(bad.compadres[0].actorData.system.general.archetype, "");
  assert.deepEqual(codes(bad), ["compadre-unknown-category"]);
});

test("gender note is escaped and kept in the biography", () => {
  const h = human({ gender: "female", genderNote: "she <and> they" });
  assert.equal(run(withCompadres(h)).compadres[0].actorData.system.biography, "<p>Female (she &lt;and&gt; they)</p>");
});

test("HTML in every text field is escaped", () => {
  const h = human({
    publicReputation: "<b>r</b>", privatePersonality: "<i>p</i>", description: "<u>d</u>", notes: "<s>n</s>", name: "<x>",
    accompanying: false, where: "<w>",
  });
  const bio = run(withCompadres(h)).compadres[0].actorData.system.biography;
  assert.ok(!/<(?!\/?p>)[a-z]/i.test(bio), bio);
  for (const part of ["&lt;b&gt;r", "&lt;i&gt;p", "&lt;u&gt;d", "&lt;s&gt;n", "&lt;w&gt;"]) assert.ok(bio.includes(part), part);
});

test("malformed input never throws", () => {
  for (const bad of [undefined, null, {}, { compadres: null }, { compadres: "x" }, { compadres: {} }, { compadres: [] }]) {
    assert.deepEqual(toFoundryCompadres(bad), { compadres: [], warnings: [] });
  }
  const result = run(withCompadres(null, 5, "x", [], {}, { id: 7, kind: "human" }, human({ attributes: null, abilities: null, tags: null })));
  assert.equal(result.compadres.length, 1);
});

test("duplicate ids keep the first and warn", () => {
  const result = run(withCompadres(human({ name: "First" }), human({ name: "Second" })));
  assert.deepEqual(result.compadres.map((c) => c.name), ["First"]);
  assert.deepEqual(codes(result), ["compadre-duplicate-id"]);
});

test("more than three keeps the first three", () => {
  const list = [1, 2, 3, 4].map((n) => human({ id: `h-${n}`, name: `N${n}` }));
  const result = run(withCompadres(...list));
  assert.equal(MAX_COMPADRES, 3);
  assert.deepEqual(result.compadres.map((c) => c.name), ["N1", "N2", "N3"]);
  assert.deepEqual(codes(result), ["too-many-compadres"]);
});

test("an unknown kind is skipped with a warning", () => {
  const result = run(withCompadres(human({ kind: "robot" }), human({ id: "h-2" })));
  assert.equal(result.compadres.length, 1);
  assert.deepEqual(codes(result), ["compadre-unknown-kind"]);
});

test("portraits: warns only when an archive set is given and lacks the id", () => {
  const h = human({ portraitId: "p-1" });
  assert.deepEqual(codes(run(withCompadres(h))), []);
  assert.deepEqual(codes(toFoundryCompadres(withCompadres(h), { now: NOW, portraits: new Set(["p-1"]) })), []);
  assert.deepEqual(codes(toFoundryCompadres(withCompadres(h), { now: NOW, portraits: new Set() })), ["compadre-portrait-missing"]);
  assert.equal(run(withCompadres(h)).compadres[0].portraitId, "p-1");
});

test("output is plain JSON", () => {
  const result = run(posse().character);
  assert.deepEqual(JSON.parse(JSON.stringify(result)), result);
});

test("toFoundry puts the compadres in the plan and the warnings in order", () => {
  const { character, campaign } = posse();
  const plan = toFoundry(character, campaign, { now: NOW });
  assert.equal(plan.compadres.length, 3);
  assert.ok(!plan.warnings.some((w) => w.code === "unsupported-compadre"));
});

test("remapCompadreIds rewrites compadre ids, holders and a compadre pardner, and nothing else", () => {
  const character = {
    id: "pc-1",
    compadres: [{ id: "c-1" }, { id: "c-2" }],
    items: [
      { id: "i-1", holder: { type: "compadre", id: "c-1" } },
      { id: "i-2", holder: { type: "pc", id: null } },
      { id: "i-3", holder: { type: "horse", id: "c-1" } },
      { id: "i-4", holder: { type: "compadre", id: "unknown" } },
    ],
    pardner: { kind: "compadre", id: "c-2", ownerId: "pc-1" },
  };
  const out = remapCompadreIds(character, new Map([["c-1", "n-1"], ["c-2", "n-2"]]));
  assert.deepEqual(out.compadres, [{ id: "n-1" }, { id: "n-2" }]);
  assert.equal(out.items[0].holder.id, "n-1");
  assert.deepEqual(out.items[1].holder, { type: "pc", id: null });
  assert.equal(out.items[2].holder.id, "c-1");
  assert.equal(out.items[3].holder.id, "unknown");
  assert.deepEqual(out.pardner, { kind: "compadre", id: "n-2", ownerId: "pc-1" });
  assert.equal(character.compadres[0].id, "c-1");
  assert.equal(character.pardner.id, "c-2");

  const other = remapCompadreIds({ id: "x", pardner: { kind: "pc", id: "c-1" } }, new Map([["c-1", "n-1"]]));
  assert.equal(other.pardner.id, "c-1");
});
