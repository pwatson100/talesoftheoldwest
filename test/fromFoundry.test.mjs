import { test } from "node:test";
import assert from "node:assert/strict";
import { toFoundry } from "../module/helpers/saddlebag/toFoundry.mjs";
import { fromFoundry } from "../module/helpers/saddlebag/fromFoundry.mjs";
import { renderSaddlebagMarkdown } from "../module/helpers/saddlebag/markdown.mjs";
import { parseSaddlebagMarkdown } from "../module/helpers/saddlebag/parse.mjs";
import { loadFixture } from "./helpers.mjs";

const NOW = "2030-01-01T00:00:00.000Z";
let counter = 0;
const uuid = () => `test-uuid-${++counter}`;
const exportSnap = (snap) => fromFoundry(snap, { now: NOW, uuid });

/** What snapshotActor would produce for an actor created from this plan. */
function snapshotFromPlan(plan) {
  const items = [
    ...plan.talents.map((t) => ({
      type: "talent",
      name: t.name,
      flagId: `talent:${t.slug || t.name}`,
      system: { basicisActive: t.rank === "basic", advisActive: t.rank === "advanced" },
    })),
    ...plan.weapons.map((w) => ({
      type: "weapon",
      name: w.name,
      flagId: w.saddlebagItemId,
      system: { ammo: w.loaded, ammoMax: 0, stored: w.stored },
    })),
    ...plan.gear.map((g) => ({
      type: "item",
      name: g.name,
      flagId: g.saddlebagItemId,
      system: { quantity: g.quantity, weight: g.weight ?? 0, stored: g.stored },
    })),
    ...plan.injuries.map((i) => ({ type: "crit", name: `#${i.roll} Location - Injury`, flagId: i.saddlebagId, system: {} })),
  ];
  return {
    name: plan.actorName,
    system: structuredClone(plan.actorData.system),
    flag: structuredClone(plan.flag),
    statuses: [...plan.conditions],
    items,
    horses: plan.horses.map((h) => ({
      name: h.name,
      saddlebagHorseId: h.saddlebagId,
      ridingModifier: h.ridingModifier,
      attributes: Object.fromEntries(Object.entries(h.attributes).map(([k, v]) => [k, { value: v.current, max: v.max }])),
      abilities: Object.fromEntries(Object.entries(h.abilities).map(([k, v]) => [k, { value: v }])),
    })),
  };
}

const planFor = (name) => {
  const { character, campaign } = loadFixture(name);
  return { character, campaign, plan: toFoundry(character, campaign, { dollarSign: true }) };
};

for (const name of ["clem-hale", "bluey"]) {
  test(`round trip: ${name} comes back unchanged except updatedAt`, () => {
    const { character, campaign, plan } = planFor(name);
    const { envelope, warnings } = exportSnap(snapshotFromPlan(plan));
    assert.deepEqual({ ...envelope.character, updatedAt: null }, { ...character, updatedAt: null });
    assert.equal(envelope.character.updatedAt, NOW);
    assert.deepEqual(envelope.campaign, campaign);
    assert.equal(envelope.app, "saddlebag");
    assert.equal(envelope.formatVersion, 1);
    assert.deepEqual(warnings, []);
  });
}

test("a damaged attribute and changed cash, XP and ammo are written back", () => {
  const { plan } = planFor("bluey");
  const snap = snapshotFromPlan(plan);
  snap.system.attributes.grit.value = 1;
  snap.system.damage.hurts.value = 3;
  snap.system.general.xp.value = 4;
  snap.system.general.cash = "$5.50";
  snap.items.find((i) => i.type === "weapon").system.ammo = 2;
  const { envelope } = exportSnap(snap);
  const c = envelope.character;
  assert.equal(c.attributes.grit.current, 1);
  assert.equal(c.attributes.grit.max, 4);
  assert.deepEqual(c.xp, { earned: 4, spent: 0 });
  const last = c.ledger.at(-1);
  assert.equal(last.text, "Adjusted in Foundry");
  assert.equal(last.amount, 250);
  assert.equal(c.items.find((i) => i.kind === "weapon").weapon.loaded, 2);
});

test("damage that disagrees with the attribute warns and trusts the attribute", () => {
  const { plan } = planFor("bluey");
  const snap = snapshotFromPlan(plan);
  snap.system.damage.hurts.value = 0; // attribute says 3 of 4
  const { envelope, warnings } = exportSnap(snap);
  assert.equal(envelope.character.attributes.grit.current, 3);
  assert.ok(warnings.some((w) => w.code === "damage-mismatch"));
});

test("XP above earned raises earned; spending lowers unspent", () => {
  const { character, campaign } = loadFixture("clem-hale");
  character.xp = { earned: 6, spent: 2 };
  const plan = toFoundry(character, campaign, { dollarSign: true });
  const snap = snapshotFromPlan(plan);
  assert.equal(snap.system.general.xp.value, 4);
  snap.system.general.xp.value = 1;
  assert.deepEqual(exportSnap(snap).envelope.character.xp, { earned: 6, spent: 5 });
  snap.system.general.xp.value = 9;
  assert.deepEqual(exportSnap(snap).envelope.character.xp, { earned: 11, spent: 2 });
});

test("a deleted injury is removed; a new one is added with a fresh id", () => {
  const { plan } = planFor("bluey");
  const snap = snapshotFromPlan(plan);
  snap.items = snap.items.filter((i) => i.type !== "crit");
  assert.deepEqual(exportSnap(snap).envelope.character.injuries, []);

  snap.items.push({ type: "crit", name: "#23 Arm - Broken", flagId: null, system: {} });
  const [injury] = exportSnap(snap).envelope.character.injuries;
  assert.equal(injury.roll, "23");
  assert.equal(injury.healingRoll, null);
  assert.match(injury.id, /^test-uuid-/);
});

test("conditions follow Foundry statuses", () => {
  const { plan } = planFor("bluey");
  const snap = snapshotFromPlan(plan);
  snap.statuses = ["exhausted"];
  assert.deepEqual(exportSnap(snap).envelope.character.conditions, ["exhausted"]);
});

test("a deleted item is dropped and a Foundry-native item arrives as custom gear", () => {
  const { plan } = planFor("bluey");
  const snap = snapshotFromPlan(plan);
  snap.items = snap.items.filter((i) => i.name !== "Quiver");
  snap.items.push({ type: "item", name: "Lantern", flagId: null, system: { quantity: 2, weight: 1, stored: false } });
  const items = exportSnap(snap).envelope.character.items;
  assert.ok(!items.some((i) => i.name === "Quiver"));
  const lantern = items.find((i) => i.name === "Lantern");
  assert.equal(lantern.custom, true);
  assert.equal(lantern.kind, "gear");
  assert.equal(lantern.quantity, 2);
  assert.equal(lantern.bookId, null);
});

test("a weapon added in Foundry maps to the matching Saddlebag weapon", () => {
  const { plan } = planFor("bluey");
  const snap = snapshotFromPlan(plan);
  snap.items.push({
    type: "weapon",
    name: "Winchester 1873",
    flagId: null,
    system: {
      subtype: "shootin",
      range: "long",
      damage: 2,
      crit: 1,
      attackbonus: 2,
      bonusdraw: 0,
      ammo: 20,
      ammoMax: 15,
      stored: false,
      weight: 1,
      qualities: ["Calibrated", "Reliable", "Piercing", "Hard To Load"],
    },
  });
  const { envelope, warnings } = exportSnap(snap);
  const w = envelope.character.items.find((i) => i.bookId === "winchester-model-1873");
  assert.ok(w, "matched by book id");
  assert.equal(w.custom, false);
  assert.equal(w.name, "Winchester Model 1873");
  assert.equal(w.kind, "weapon");
  assert.equal(w.weapon.weaponKind, "rifle");
  assert.equal(w.weapon.ability, "SHOOTIN\u2019");
  assert.equal(w.weapon.action, "lever");
  assert.equal(w.weapon.capacity, 15);
  assert.equal(w.weapon.loaded, 15);
  assert.deepEqual(w.weapon.ammoTypes, ["ammo-44-40"]);
  assert.equal(w.weapon.ammoType, "ammo-44-40");
  assert.equal(w.weapon.attackMod, 2);
  assert.deepEqual(w.tags.builtIn, ["calibrated", "reliable", "piercing-ranged"]);
  assert.ok(warnings.some((x) => x.code === "quality-not-exported"));
  assert.ok(!warnings.some((x) => x.code === "weapon-exported-as-custom"));
});

test("a Foundry weapon with no Saddlebag match exports as a custom weapon, not gear", () => {
  const { plan } = planFor("bluey");
  const snap = snapshotFromPlan(plan);
  snap.items.push({
    type: "weapon",
    name: "Grandpa's Blunderbuss",
    flagId: null,
    system: { subtype: "shootin", range: "short", damage: 3, crit: 2, attackbonus: 0, bonusdraw: -1, ammo: 1, ammoMax: 1, stored: false, weight: 2 },
  });
  const { envelope, warnings } = exportSnap(snap);
  const w = envelope.character.items.find((i) => i.name === "Grandpa's Blunderbuss");
  assert.equal(w.kind, "weapon");
  assert.equal(w.custom, true);
  assert.equal(w.bookId, null);
  assert.equal(w.weapon.damage, 3);
  assert.equal(w.weapon.drawMod, -1);
  assert.ok(warnings.some((x) => x.code === "weapon-exported-as-custom"));
  assert.doesNotThrow(() => JSON.stringify(envelope));
});
test("an imported weapon takes its weight from Foundry, replacing Saddlebag's 'tiny'", () => {
  const snap = snapshotFromPlan(planFor("clem-hale").plan);
  snap.items.find((i) => i.type === "weapon").system.weight = 1;
  const w = exportSnap(snap).envelope.character.items.find((i) => i.bookId === "sharps-rifle-1874");
  assert.equal(w.weight, 1);
});

test("storing an imported weapon in Foundry exports it as stowed and elsewhere", () => {
  const snap = snapshotFromPlan(planFor("clem-hale").plan);
  snap.items.find((i) => i.type === "weapon").system.stored = true;
  const w = exportSnap(snap).envelope.character.items.find((i) => i.bookId === "sharps-rifle-1874");
  assert.equal(w.holder.type, "elsewhere");
  assert.equal(w.weapon.state, "stowed");
});

test("description and backstory are not rewritten from the biography", () => {
  const { character, plan } = planFor("bluey");
  const snap = snapshotFromPlan(plan);
  snap.system.biography = "<p>Edited in Foundry</p>";
  const c = exportSnap(snap).envelope.character;
  assert.equal(c.description, character.description);
  assert.equal(c.backstory, character.backstory);
});

test("unknown fields in the stored character survive", () => {
  const { character, campaign } = loadFixture("bluey");
  character.somethingNew = { a: 1 };
  const plan = toFoundry(character, campaign, { dollarSign: false });
  const c = exportSnap(snapshotFromPlan(plan)).envelope.character;
  assert.deepEqual(c.somethingNew, { a: 1 });
});

test("Foundry-native PC exports as Unassigned with a complete character", () => {
  const { character: sample } = loadFixture("bluey");
  const snap = {
    name: "Native Nell",
    system: {
      biography: "<p>Rode in.</p>",
      general: {
        archetype: "",
        faith: "Hope",
        bigdream: "A ranch",
        yourpardner: "Somebody",
        cash: "$12.00",
        faithpoints: { value: 4 },
        age: { value: 28 },
        fame: { value: 1 },
        morals: { value: 3 },
        publicspirit: { value: 2 },
        xp: { value: 3 },
      },
      attributes: { grit: { value: 3, max: 3 }, quick: { value: 3, max: 3 }, cunning: { value: 2, max: 3 }, docity: { value: 3, max: 3 } },
      abilities: { fightin: { value: 2 }, lightfingered: { value: 1 } },
      damage: { hurts: { value: 0 }, shakes: { value: 0 }, vexes: { value: 1 }, doubts: { value: 0 } },
    },
    flag: null,
    statuses: ["starving"],
    items: [
      { type: "talent", name: "Home Brewed", flagId: null, system: { advisActive: true } },
      { type: "item", name: "Rope", flagId: null, system: { quantity: 1, weight: 1, stored: false } },
    ],
    horses: [],
  };
  const { envelope, warnings } = exportSnap(snap);
  const c = envelope.character;
  assert.equal(envelope.campaign.kind, "unassigned");
  assert.equal(c.campaignId, envelope.campaign.id);
  assert.equal(c.birth.year, null);
  assert.equal(c.date, null);
  assert.equal(c.ageAtCreation, 28);
  assert.equal(c.creation.method, "blank");
  assert.equal(c.attributes.cunning.current, 2);
  assert.equal(c.abilities["light-fingered"], 1);
  assert.equal(c.abilities["animal-handlin"], 0);
  assert.deepEqual(c.conditions, ["starving"]);
  assert.equal(c.ledger[0].amount, 1200);
  assert.equal(c.talents[0].rank, "advanced");
  assert.equal(c.items[0].custom, true);
  assert.ok(warnings.some((w) => w.code === "exported-as-unassigned"));
  for (const key of Object.keys(sample)) {
    assert.ok(key in c, `missing top-level key: ${key}`);
  }
  assert.doesNotThrow(() => JSON.stringify(envelope));
});

test("Foundry-native PC keeps the same ids on a later export when exportIds are supplied", () => {
  const snap = {
    name: "Native Nell",
    system: { biography: "<p>Rode in.</p>", general: { cash: "$0" }, attributes: {}, abilities: {}, damage: {} },
    flag: null,
    statuses: [],
    items: [],
    horses: [],
  };
  const first = exportSnap(snap).envelope;
  const again = exportSnap({
    ...snap,
    system: { ...snap.system, biography: "<p>Edited.</p>" },
    exportIds: { characterId: first.character.id, campaignId: first.campaign.id },
  }).envelope;
  assert.equal(again.character.id, first.character.id);
  assert.equal(again.campaign.id, first.campaign.id);
  assert.equal(again.character.campaignId, first.campaign.id);
  assert.equal(again.character.backstory, "Edited.");
});

test("markdown: parses back to the same envelope", () => {
  for (const name of ["clem-hale", "bluey"]) {
    const { plan } = planFor(name);
    const { envelope } = exportSnap(snapshotFromPlan(plan));
    const text = renderSaddlebagMarkdown(envelope);
    const parsed = parseSaddlebagMarkdown(text);
    assert.ok(parsed.ok, parsed.error);
    assert.deepEqual(parsed.data.character, envelope.character);
    assert.deepEqual(parsed.data.campaign, envelope.campaign);
    assert.match(text, /^# /);
    assert.match(text, /<!-- saddlebag:data v1\nThis block lets Saddlebag open this file again\. Leave it as it is\.\n\{/);
    assert.ok(text.trimEnd().endsWith("-->"));
  }
});

test("markdown: '-->' inside text cannot close the data block early", () => {
  const { plan } = planFor("bluey");
  const snap = snapshotFromPlan(plan);
  snap.system.general.bigdream = "Go west --> and prosper";
  const { envelope } = exportSnap(snap);
  const text = renderSaddlebagMarkdown(envelope);
  const block = text.slice(text.indexOf("<!-- saddlebag:data"));
  assert.equal(block.split("-->").length - 1, 1);
  const parsed = parseSaddlebagMarkdown(text);
  assert.ok(parsed.ok);
  assert.equal(parsed.data.character.bigDream, "Go west --> and prosper");
});

test("markdown: body carries no rules text and shows the cash total", () => {
  const { plan } = planFor("clem-hale");
  const { envelope } = exportSnap(snapshotFromPlan(plan));
  const text = renderSaddlebagMarkdown(envelope);
  const body = text.slice(0, text.indexOf("<!-- saddlebag:data"));
  assert.match(body, /\*\*Cash in hand:\*\* \$30\.00/);
  assert.match(body, /Sharps Rifle 1874/);
  assert.doesNotMatch(body, /damage|crit/i);
});
