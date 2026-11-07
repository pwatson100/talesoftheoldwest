import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { fromFoundry } from "../module/helpers/saddlebag/fromFoundry.mjs";
import { legacyItemTag, legacySaddlebagId, weaponBookEntryById } from "../module/helpers/saddlebag/catalog.mjs";

// PC-clem-hale.json is a real Saddlebag "export for Foundry" file (v0.11.1, 7 Nov 2026): the biography is scrubbed
// to one line, everything else is as exported. This is what an unreplaced, Saddlebag-made PC looks like in the world.
const actor = JSON.parse(readFileSync(fileURLToPath(new URL("./fixtures/saddlebag/foundry/PC-clem-hale.json", import.meta.url)), "utf8"));
const NOW = "2030-01-01T00:00:00.000Z";
let n = 0;
const uuid = () => `fresh-${++n}`;

/** What snapshotActor produces for this actor (the parts fromFoundry reads). */
const snapshot = (edit = (items) => items) => ({
  name: actor.name,
  system: actor.system,
  flag: null,
  exportIds: null,
  legacyCharacterId: legacySaddlebagId(actor.flags),
  statuses: [],
  items: edit(
    actor.items.map((i) => ({
      type: i.type,
      name: i.name,
      flagId: null,
      legacy: legacyItemTag(i.flags, i.system.reference),
      system: {
        quantity: i.system.quantity,
        weight: i.system.weight,
        ammo: i.system.ammo,
        ammoMax: i.system.ammoMax,
        stored: i.system.stored,
        basicisActive: i.system.basicisActive,
        advisActive: i.system.advisActive,
        ...(i.type === "weapon" && {
          subtype: i.system.subtype,
          range: i.system.range,
          damage: i.system.damage,
          crit: i.system.crit,
          attackbonus: i.system.attackbonus,
          bonusdraw: i.system.bonusdraw,
          qualities: [],
        }),
      },
    })),
  ),
  horses: [],
});
const run = (snap = snapshot()) => fromFoundry(snap, { now: NOW, uuid });

test("legacyItemTag reads the tag Saddlebag's export wrote", () => {
  assert.deepEqual(legacyItemTag({ saddlebag: { ref: "quiver", kind: "gear", id: "g1" } }, "quiver"), {
    ref: "quiver", kind: "gear", id: "g1", rank: "basic", book: true,
  });
  assert.deepEqual(legacyItemTag({ saddlebag: { ref: "My Knife", kind: "gear", id: "g2" } }, ""), {
    ref: "My Knife", kind: "gear", id: "g2", rank: "basic", book: false,
  });
  assert.equal(legacyItemTag({ saddlebag: { ref: "survivor", kind: "talent", rank: "advanced" } }, "survivor").rank, "advanced");
  assert.equal(legacyItemTag({ saddlebag: { ref: "survivor", kind: "talent" } }, "survivor").id, null);
});

test("legacyItemTag ignores items without a Saddlebag tag", () => {
  assert.equal(legacyItemTag(undefined, ""), null);
  assert.equal(legacyItemTag({}, "x"), null);
  assert.equal(legacyItemTag({ saddlebag: { ref: "" } }, "x"), null);
  assert.equal(legacyItemTag({ saddlebag: { id: "only-an-actor-id" } }, ""), null);
  assert.equal(legacyItemTag({ talesoftheoldwest: { saddlebagItemId: "x" } }, "x"), null);
});

test("weaponBookEntryById finds a book weapon by its book id", () => {
  assert.equal(weaponBookEntryById("sharps-rifle-1874").name, "Sharps Rifle 1874");
  assert.equal(weaponBookEntryById("nonsense"), null);
});

test("an unreplaced legacy PC keeps its Saddlebag character id", () => {
  const { envelope } = run();
  assert.equal(envelope.character.id, "8a5f3346-f06a-4fe3-a5cd-7ef9fa03e7ed");
  assert.equal(envelope.character.campaignId, envelope.campaign.id);
});

test("stored export ids still win over the legacy id", () => {
  const { envelope } = run({ ...snapshot(), exportIds: { characterId: "mine", campaignId: "camp" } });
  assert.equal(envelope.character.id, "mine");
  assert.equal(envelope.campaign.id, "camp");
});

test("legacy talents export as book talents, not custom ones", () => {
  const { envelope } = run();
  assert.deepEqual(
    envelope.character.talents.map((t) => [t.talentId, t.name, t.rank, t.custom]),
    [["companion", "Companion", "basic", false], ["survivor", "Survivor", "basic", false]],
  );
});

test("legacy gear keeps its Saddlebag id and book id", () => {
  const { envelope } = run();
  const byName = Object.fromEntries(envelope.character.items.map((i) => [i.name, i]));
  assert.equal(byName["Farming equipment"].id, "d6f16549-672f-4c09-8718-2aba1ddf24e9");
  assert.equal(byName["Farming equipment"].bookId, "farming-equipment");
  assert.equal(byName["Farming equipment"].custom, false);
  assert.equal(byName["Farming equipment"].kind, "gear");
  assert.equal(byName.Arrows.kind, "ammo");
  assert.equal(byName.Arrows.bookId, "ammo-arrows");
  assert.equal(byName.Arrows.quantity, 20);
  assert.deepEqual(byName.Quiver.quiver, { capacity: 20, loaded: 0 });
  assert.equal(byName.Quiver.id, "ac8e0db0-9016-46cf-880d-809771ce2c9d");
});

test("a legacy book weapon keeps its id and takes its capacity from `ammo`", () => {
  const { envelope } = run();
  const rifle = envelope.character.items.find((i) => i.kind === "weapon");
  assert.equal(rifle.id, "feef8aa8-4c3f-4da8-a165-0225657d1726");
  assert.equal(rifle.bookId, "sharps-rifle-1874");
  assert.equal(rifle.custom, false);
  assert.equal(rifle.weapon.capacity, 1);
  assert.equal(rifle.weapon.loaded, 1);
  assert.equal(rifle.holder.type, "elsewhere");
  assert.equal(rifle.weapon.state, "stowed");
});

test("a legacy PC still exports as Unassigned and the user is told", () => {
  const { envelope, warnings } = run();
  assert.equal(envelope.campaign.kind, "unassigned");
  assert.ok(warnings.some((w) => w.code === "exported-as-unassigned"));
  assert.ok(!warnings.some((w) => w.code === "weapon-exported-as-custom"));
});

test("a legacy item with no book entry stays custom but keeps its id", () => {
  const snap = snapshot((items) => [
    ...items,
    { type: "item", name: "Lucky Charm", flagId: null, legacy: { ref: "Lucky Charm", kind: "gear", id: "c1", rank: "basic", book: false }, system: { quantity: 2, weight: 0, stored: false } },
    { type: "talent", name: "Home Brewed", flagId: null, legacy: { ref: "Home Brewed", kind: "talent", id: null, rank: "advanced", book: false }, system: { advisActive: true } },
  ]);
  const { envelope } = run(snap);
  const charm = envelope.character.items.find((i) => i.name === "Lucky Charm");
  assert.deepEqual([charm.id, charm.bookId, charm.custom, charm.quantity], ["c1", null, true, 2]);
  const brewed = envelope.character.talents.find((t) => t.name === "Home Brewed");
  assert.deepEqual([brewed.talentId, brewed.custom, brewed.rank], [null, true, "advanced"]);
});

test("items without a legacy tag still export as custom gear", () => {
  const snap = snapshot((items) => [...items, { type: "item", name: "Rope", flagId: null, legacy: null, system: { quantity: 1, weight: 1, stored: false } }]);
  const rope = run(snap).envelope.character.items.find((i) => i.name === "Rope");
  assert.equal(rope.custom, true);
  assert.equal(rope.bookId, null);
});

test("the legacy export survives JSON", () => {
  const { envelope } = run();
  assert.deepEqual(JSON.parse(JSON.stringify(envelope)), envelope);
});
