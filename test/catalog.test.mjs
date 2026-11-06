import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ABILITY_ATTRIBUTE,
  ABILITY_KEYS,
  ANIMAL_ABILITY_KEYS,
  ARCHETYPE_IDS,
  ATTRIBUTE_TRACKS,
  BREED_KEYS,
  CONDITION_IDS,
  DAMAGE_CAPS,
  abilityKeyFromSaddlebag,
  legacySaddlebagId,
  archetypeFromSlug,
  breedKeyFromSlug,
  normaliseName,
  WEAPON_ALIASES,
} from "../module/helpers/saddlebag/catalog.mjs";
import { TALESOFTHEOLDWEST } from "../module/helpers/config.mjs";
import { loadFixture } from "./helpers.mjs";

test("there are 16 ability keys", () => {
  assert.equal(new Set(ABILITY_KEYS).size, 16);
});

test("every ability key in the fixtures maps to a Foundry key", () => {
  for (const name of ["clem-hale", "bluey"]) {
    const { character } = loadFixture(name);
    const sources = [character.abilities, ...character.compadres.map((c) => c.abilities)];
    for (const abilities of sources) {
      for (const key of Object.keys(abilities)) {
        const mapped = abilityKeyFromSaddlebag(key);
        assert.ok(ABILITY_KEYS.includes(mapped), `${name}: ${key} -> ${mapped}`);
      }
    }
  }
});

test("ability key special cases", () => {
  assert.equal(abilityKeyFromSaddlebag("light-fingered"), "lightfingered");
  assert.equal(abilityKeyFromSaddlebag("animal-handlin"), "animalhandlin");
  assert.equal(abilityKeyFromSaddlebag("nonsense"), null);
});

test("archetypes", () => {
  assert.equal(archetypeFromSlug("homesteader"), "Homesteader");
  assert.equal(archetypeFromSlug("ranch-hand"), "RanchHand");
  assert.equal(archetypeFromSlug("ranchhand"), "RanchHand");
  assert.equal(archetypeFromSlug("laborer"), "Laborer");
  assert.equal(archetypeFromSlug("astronaut"), null);
  assert.equal(archetypeFromSlug(undefined), null);
});

test("breeds", () => {
  assert.equal(breedKeyFromSlug("missouri-fox-trotter"), "missourifoxtrotter");
  assert.equal(breedKeyFromSlug("american-quarter"), "americanquarter");
  assert.equal(breedKeyFromSlug("unicorn"), null);
});

test("attribute tracks and conditions", () => {
  assert.deepEqual(ATTRIBUTE_TRACKS, { grit: "hurts", quick: "shakes", cunning: "vexes", docity: "doubts" });
  assert.deepEqual([...CONDITION_IDS], ["starving", "dehydrated", "exhausted", "freezing", "heatstroke"]);
});

test("every Saddlebag condition id is a Foundry condition", () => {
  for (const id of CONDITION_IDS) {
    assert.ok(id in TALESOFTHEOLDWEST.conditions, `${id} is not in TALESOFTHEOLDWEST.conditions`);
  }
});

test("keys derived from config", () => {
  assert.deepEqual([...ARCHETYPE_IDS], Object.keys(TALESOFTHEOLDWEST.archetype_list));
  assert.ok(BREED_KEYS.includes("other"));
  assert.equal(BREED_KEYS.length, 14);
  assert.deepEqual([...ANIMAL_ABILITY_KEYS].sort(), ["fightin", "hawkeye", "move", "resilience"]);
  assert.equal(ABILITY_ATTRIBUTE.shootin, "quick");
  assert.deepEqual({ ...DAMAGE_CAPS }, { hurts: 5, shakes: 5, vexes: 5, doubts: 5 });
});

test("normaliseName", () => {
  assert.equal(normaliseName("  Shootin’  Iron, ÉCU "), "shootin iron ecu");
  assert.equal(normaliseName(null), "");
});

test("weapon aliases are keyed by normalised Saddlebag names", () => {
  assert.equal(WEAPON_ALIASES[normaliseName("Winchester Model 1866")], "Winchester 1866");
  assert.equal(WEAPON_ALIASES[normaliseName("Winchester Model 1873")], "Winchester 1873");
});

test("legacySaddlebagId reads the id written by Saddlebag's own Foundry export", () => {
  assert.equal(legacySaddlebagId({ saddlebag: { id: "abc", appVersion: "1", exportedAt: "x" } }), "abc");
  assert.equal(legacySaddlebagId({ talesoftheoldwest: { saddlebag: { id: "abc" } } }), null);
  assert.equal(legacySaddlebagId({ saddlebag: { id: "" } }), null);
  assert.equal(legacySaddlebagId({ saddlebag: { ref: "x" } }), null);
  assert.equal(legacySaddlebagId(undefined), null);
});
