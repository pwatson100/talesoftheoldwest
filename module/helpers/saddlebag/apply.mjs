// GLUE module: this is the only file in this folder that uses Foundry globals.
// It turns the neutral import plan from toFoundry.mjs into documents.

import { CRIT_MODIFIERS } from "../../documents/actor.mjs";
import { logger } from "../logger.mjs";
import { ANIMAL_ABILITY_KEYS, CONDITION_IDS, BREED_KEYS, normaliseName } from "./catalog.mjs";
import { parseCritResult } from "./crit.mjs";
import { fromFoundry } from "./fromFoundry.mjs";
import { renderSaddlebagMarkdown } from "./markdown.mjs";
import { matchHorse } from "../../applications/apps/saddlebag-match-dialog.mjs";

const NS = "talesoftheoldwest";
const ITEM_TYPE = { talent: "talent", weapon: "weapon", gear: "item" };

/** Thrown for failures the user should see as a plain message. `code` maps to a localised string. */
export class SaddlebagImportError extends Error {
  constructor(code, detail) {
    super(detail ? `${code}: ${detail}` : code);
    this.name = "SaddlebagImportError";
    this.code = code;
  }
}

const L = (key) => game.i18n.localize(key);

/**
 * Load the index of every compendium pack of one document type in parallel.
 * Returns `[{ pack, index }]` in pack order.
 */
async function loadPackIndexes(documentName, options) {
  const packs = game.packs.filter((p) => p.documentName === documentName);
  const indexes = await Promise.all(packs.map((pack) => pack.getIndex(options)));
  return packs.map((pack, i) => ({ pack, index: indexes[i] }));
}

/**
 * Find the first index entry accepted by `test` in the packs of one document type and load it.
 * Returns a plain copy of the document (still carrying `_id`, `folder`, `ownership`) or null.
 */
async function findPackDocument(documentName, test, options) {
  const matches = (await loadPackIndexes(documentName, options)).flatMap(({ pack, index }) => {
    const entry = index.find(test);
    return entry ? [{ pack, entry }] : [];
  });
  const docs = await Promise.all(matches.map(({ pack, entry }) => pack.getDocument(entry._id)));
  return docs.find(Boolean)?.toObject() ?? null;
}

/* -------------------------------------------- */
/*  Lookups                                     */
/* -------------------------------------------- */

/** The PC actor already linked to this Saddlebag character id, or null. */
export function findExistingBySaddlebagId(id) {
  if (!id) return null;
  return game.actors.find((a) => a.type === "pc" && a.getFlag(NS, "saddlebag")?.id === id) ?? null;
}

/** Candidate entries for one search tier. The promise is cached in `cache` for the duration of an import. */
function tierEntries(tier, type, cache) {
  const key = `${tier}:${type}`;
  if (!cache.has(key)) cache.set(key, buildTierEntries(tier, type, cache));
  return cache.get(key);
}

async function buildTierEntries(tier, type, cache) {
  const entries = [];

  switch (tier) {
    case 0:
      for (const item of game.items.filter(i => i.type === type)) {
      entries.push({ name: item.name, reference: item.system.reference, load: async () => item.toObject() });
      }
      break;
    case 1:
      for (const { pack, index } of await loadPackIndexes("Item", { fields: ["system.reference"] })) {
        for (const e of index.filter(i => i.type === type)) {
          entries.push({
            name: e.name,
            reference: e.system?.reference,
            load: async () => (await pack.getDocument(e._id))?.toObject() ?? null,
          });
        }
      }
      break;
    default:
      await processAdventures();
      break;
  }
  return entries;

  async function processAdventures() {
    const packs = game.packs.filter((p) => p.documentName === "Adventure");
    const adventureLists = await Promise.all(
      packs.map((pack) => {
        const docsKey = `adventure:${pack.collection}`;
        if (!cache.has(docsKey)) cache.set(docsKey, pack.getDocuments());
        return cache.get(docsKey);
      })
    );
    for (const adventures of adventureLists) {
      for (const adventure of adventures) {
        for (const item of adventure.items.filter(i => i.type === type)) {
          entries.push({ name: item.name, reference: item.system?.reference, load: async () => item.toObject() });
        }
      }
    }
  }
}

function findMatch(entries, { name, reference, aliasName }) {
  const norm = normaliseName(name);
  const tries = [
    reference ? (e) => e.reference === reference : null,
    (e) => e.name === name,
    (e) => normaliseName(e.name) === norm,
    aliasName ? (e) => normaliseName(e.name) === normaliseName(aliasName) : null,
  ];
  for (const test of tries) {
    const hit = test && entries.find(test);
    if (hit) return hit;
  }
  return null;
}

/**
 * Find a Foundry item for a Saddlebag entry. Search order: world items, Item packs, Adventure packs.
 * Returns a plain copy of the item data (without `_id`) or null.
 * @param {{kind: "talent"|"weapon"|"gear", name: string, reference?: string, aliasName?: string}} query
 * @param {Map} [cache]  Pass the same Map for every call of one import to avoid reloading packs.
 */
export function resolveItem({ kind, name, reference, aliasName }, cache = new Map()) {
  return resolveFromTier(0, ITEM_TYPE[kind], { name, reference, aliasName }, cache);
}

/** Try `tier`, falling through to the next tier on a miss. Tiers are lazy: later ones only load when needed. */
async function resolveFromTier(tier, type, query, cache) {
  if (tier > 2) return null;
  const hit = findMatch(await tierEntries(tier, type, cache), query);
  const data = hit ? await hit.load() : null;
  if (!data) return resolveFromTier(tier + 1, type, query, cache);
  delete data._id;
  delete data.folder;
  delete data.ownership;
  return data;
}

/* -------------------------------------------- */
/*  Building item data                          */
/* -------------------------------------------- */

const tag = (data, id) => foundry.utils.setProperty(data, `flags.${NS}.saddlebagItemId`, id);
const notesHtml = (notes) => (notes ? `<p>${foundry.utils.escapeHTML(notes)}</p>` : "");

/**
 * How each plan list becomes item data.
 * - `sought`: entries we try to find in the Core Rules items; a miss is reported as unmatched.
 * - `counted`: whether sought entries count towards the "core" totals.
 * - `query`/`fallback`/`apply`/`id`: lookup arguments, bare item when nothing resolves,
 *   per-entry fields written onto the data, and the `saddlebagItemId` tag.
 */
const BUILDERS = [
  {
    list: "talents", kind: "talent", label: "Talent", counted: true,
    sought: (t) => !t.custom,
    query: (t) => ({ name: t.name, reference: t.reference }),
    fallback: (t) => ({ name: t.name, type: "talent", system: { description: notesHtml(t.notes) } }),
    apply: (data, t) => foundry.utils.mergeObject(data, { system: { basicisActive: t.rank === "basic", advisActive: t.rank === "advanced" } }),
    id: (t) => `talent:${t.slug || t.name}`,
  },
  {
    list: "weapons", kind: "weapon", label: "Weapon", counted: true,
    sought: (w) => Boolean(w.bookId),
    query: (w) => ({ name: w.name, aliasName: w.aliasName }),
    fallback: (w) => ({ name: w.name, type: "weapon", system: {} }),
    apply: (data, w) => {
      const max = Number(data.system.ammoMax) || 0;
      data.system.ammo = max > 0 ? Math.min(w.loaded, max) : w.loaded;
      data.system.stored = w.stored;
    },
    id: (w) => w.saddlebagItemId,
  },
  {
    list: "gear", kind: "gear", label: "Gear", counted: false,
    sought: (g) => !g.custom && Boolean(g.bookId),
    query: (g) => ({ name: g.name, aliasName: g.aliasName }),
    fallback: (g) => ({ name: g.name, type: "item", system: { weight: g.weight ?? 0, description: notesHtml(g.notes) } }),
    apply: (data, g) => {
      data.system.quantity = g.quantity;
      data.system.stored = g.stored;
    },
    id: (g) => g.saddlebagItemId,
  },
];

/**
 * Resolve every talent, weapon and gear entry to item data. Nothing is created here.
 * Items come out in plan order: talents, then weapons, then gear.
 * @returns {{items: object[], warnings: object[], resolvedCore: number, expectedCore: number}}
 */
async function buildItems(plan) {
  const cache = new Map();
  const warnings = [];
  const items = [];
  const core = { expected: 0, resolved: 0 };

  // Look everything up across all builders in parallel, then build items in plan order.
  const allFound = await Promise.all(
    BUILDERS.map((spec) => {
      const entries = plan[spec.list];
      return Promise.all(
        entries.map((e) => (spec.sought(e) ? resolveItem({ kind: spec.kind, ...spec.query(e) }, cache) : null)),
      );
    }),
  );

  BUILDERS.forEach((spec, specIdx) => {
    const entries = plan[spec.list];
    const found = allFound[specIdx];
    entries.forEach((entry, i) => {
      let data = found[i];
      if (spec.sought(entry)) {
        if (spec.counted) core.expected++;
        if (data) {
          if (spec.counted) core.resolved++;
        } else {
          warnings.push({
            code: "unmatched-item",
            message: `${spec.label} "${entry.name}" was not found in the Core Rules items; imported as a plain item.`,
          });
        }
      }
      data ??= spec.fallback(entry);
      data.system ??= {};
      spec.apply(data, entry);
      tag(data, spec.id(entry));
      items.push(data);
    });
  });

  return { items, warnings, resolvedCore: core.resolved, expectedCore: core.expected };
}

/**
 * Build the Critical Injury item for a Saddlebag injury roll. Dice in the table text are not rolled:
 * the healing time uses Saddlebag's recorded roll and fatal dice stay as text.
 * @returns {{itemData: object, itemModifiers: object, missing: boolean}}
 */
export function buildCritItemData(actor, roll, healingRoll) {
  const table = actor.getCritTable(false);
  const result = table?.results.find((r) => r.range[0] <= roll && roll <= r.range[1]);
  if (!result) {
    return { itemData: { type: "crit", name: `#${roll}`, system: {} }, itemModifiers: {}, missing: true };
  }

  const c = parseCritResult(result.description ?? result.text ?? "", healingRoll);

  let fatalMessage;
  if (!c.fatal) fatalMessage = L("TALESOFTHEOLDWEST.General.no");
  else if (c.instant) {
    fatalMessage = `<strong style="color: red;">YES</strong><br>${L("TALESOFTHEOLDWEST.Criticals.endOfTheTrail")}`;
  } else {
    fatalMessage =
      `<strong style="color: red;">${L("TALESOFTHEOLDWEST.General.yes").toUpperCase()}</strong><br>` +
      L("TALESOFTHEOLDWEST.Criticals.rollResilience") +
      c.fatalDuration;
    if (c.fatalPenalty) {
      fatalMessage += `<br> -1 to <strong>${L("TALESOFTHEOLDWEST.Ability.Doctorin.long")}</strong> roll.`;
    }
  }

  // Keys are written as `[0]`, `[1]` to match totowActor#determineCritResults exactly.
  const itemModifiers = {};
  (CRIT_MODIFIERS[roll] ?? []).forEach((mod, i) => {
    itemModifiers[`[${i}]`] = { name: L(mod.name), value: mod.value, state: mod.state };
  });

  const itemData = {
    type: "crit",
    img: result.img,
    name: `#${roll} ${c.location} - ${c.injury}`,
    system: {
      location: c.location.toLowerCase().replace(/\s/g, ""),
      injury: c.injury,
      healingtime: c.healingTime ?? L("TALESOFTHEOLDWEST.ItemModifierSelect.none"),
      fatal: c.fatal,
      fatalmessage: fatalMessage,
      imediateeffect: c.immediateEffect,
      longtermeffect: c.longTermEffect,
      itemModifiers,
    },
  };
  return { itemData, itemModifiers, missing: false };
}

/* -------------------------------------------- */
/*  Applying to an actor                        */
/* -------------------------------------------- */

/** Turn the five Saddlebag-owned conditions on or off so that exactly `ids` are active. */
export async function applyConditions(actor, ids) {
  await Promise.all(CONDITION_IDS.map((id) => actor.toggleStatusEffect(id, { active: ids.includes(id) })));
}

async function createCrits(actor, plan, warnings) {
  const created = [];
  for (const injury of plan.injuries) {
    const { itemData, missing } = buildCritItemData(actor, injury.roll, injury.healingRoll);
    if (missing) {
      warnings.push({
        code: "table-missing",
        message: `Injury #${injury.roll} could not be looked up (Critical Injuries table not found); a bare entry was added.`,
      });
    }
    tag(itemData, injury.saddlebagId);
    created.push(itemData);
  }
  if (created.length) await actor.createEmbeddedDocuments("Item", created);
}

/* -------------------------------------------- */
/*  Horse helpers                               */
/* -------------------------------------------- */

/**
 * Find an `animalquality` item by normalised name, searching Item packs.
 * Returns a plain copy (no `_id`) or null.
 */
async function resolveAnimalQuality(name, cache) {
  const norm = normaliseName(name);
  const key = `animalquality:${norm}`;
  if (cache.has(key)) return cache.get(key) ?? null;

  // Search Item packs for animalquality items.
  const data = await findPackDocument("Item", (e) => e.type === "animalquality" && normaliseName(e.name) === norm);
  if (data) {
    delete data._id;
    delete data.folder;
    delete data.ownership;
  }
  cache.set(key, data);
  return data;
}

/**
 * Build and create an animal actor for one horse from the import plan.
 * Prefers cloning the breed actor from the Actors pack (if the breed matches),
 * then falls back to a bare actor.
 * Returns the new Actor document.
 */
async function createHorseActor(horse, warnings) {
  const actorData = await getByBreed(horse);
  setHorseAttrs(actorData, horse);

  const actor = await Actor.create(actorData, { renderSheet: false });

  // Resolve and attach quality items.
  const qualityItems = await getHorseQualities(horse, warnings);
  if (qualityItems.length) await actor.createEmbeddedDocuments("Item", qualityItems);

  return actor;
}

async function getHorseQualities(horse, warnings) {
  const cache = new Map();
  const qualityItems = [];
  const qualityNames = horse.qualityNames ?? [];
  const qualityData = await Promise.all(qualityNames.map((qName) => resolveAnimalQuality(qName, cache)));
  for (const [i, qName] of qualityNames.entries()) {
    const data = qualityData[i];
    if (data) {
      qualityItems.push(data);
    } else {
      warnings.push({
        code: "unmatched-quality",
        message: `Animal quality "${qName}" for horse "${horse.name}" was not found in any Item pack; skipped.`,
      });
    }
  }
  return qualityItems;
}

function setHorseAttrs(actorData, horse) {
  actorData.system.attributes ??= {};
  for (const attr of ["grit", "quick", "cunning"]) {
    const src = horse.attributes?.[attr];
    if (src && typeof src === "object") {
      const max = Math.min(10, Math.max(0, Math.round(src.max ?? 0)));
      const value = Math.min(max, Math.max(0, Math.round(src.current ?? max)));
      actorData.system.attributes[attr] = { value, max };
    }
  }

  actorData.system.abilities ??= {};
  for (const abl of ANIMAL_ABILITY_KEYS) {
    const raw = horse.abilities?.[abl];
    if (typeof raw === "number" && Number.isFinite(raw)) {
      actorData.system.abilities[abl] = { value: Math.min(5, Math.max(0, Math.round(raw))) };
    }
  }

  actorData.flags ??= {};
  actorData.flags[NS] ??= {};
  actorData.flags[NS].saddlebagHorseId = horse.saddlebagId;
}

async function getByBreed(horse) {
  let actorData = null;
  if (horse.breedKey && BREED_KEYS.includes(horse.breedKey) && horse.breedKey !== "other") {
    const breedName = normaliseName(horse.breedName || horse.breedKey);
    actorData = await findPackDocument("Actor", (e) => e.type === "animal" && normaliseName(e.name) === breedName, {
      fields: ["system.general"],
    });
    if (actorData) {
      delete actorData._id;
      delete actorData.folder;
      delete actorData.ownership;
      // Strip embedded qualities from the clone; the qualityNames loop below
      // adds exactly what the Saddlebag file specifies, preventing duplicates.
      if (Array.isArray(actorData.items)) {
        actorData.items = actorData.items.filter((i) => i.type !== "animalquality");
      }
    }
  }

  if (!actorData) {
    actorData = { type: "animal", system: { general: {}, attributes: {}, abilities: {}, damage: {} } };
  }

  // Overwrite name and identity fields.
  actorData.name = horse.name;
  actorData.type = "animal";
  actorData.system ??= {};
  actorData.system.general ??= {};
  actorData.system.general.subtype = "horse";
  actorData.system.general.mounted = false;
  if (horse.breedKey) actorData.system.general.breed = horse.breedKey;
  actorData.system.general.ridingmodifier = { value: horse.ridingModifier };
  return actorData;
}

/**
 * Build a warning listing stat differences between a horse plan entry and an existing actor.
 */
function statDiffWarning(horse, actor) {
  const diffs = [];
  for (const attr of ["grit", "quick", "cunning"]) {
    const src = horse.attributes?.[attr];
    const live = actor.system.attributes?.[attr];
    if (!src || !live) continue;
    const srcMax = Math.round(src.max ?? 0);
    const srcVal = Math.round(src.current ?? srcMax);
    if (live.max !== srcMax) diffs.push(`${attr}.max: file ${srcMax} vs world ${live.max}`);
    if (live.value !== srcVal) diffs.push(`${attr}.value: file ${srcVal} vs world ${live.value}`);
  }
  for (const abl of ANIMAL_ABILITY_KEYS) {
    const srcVal = horse.abilities?.[abl];
    const liveVal = actor.system.abilities?.[abl]?.value;
    if (typeof srcVal === "number" && srcVal !== liveVal) {
      diffs.push(`${abl}: file ${srcVal} vs world ${liveVal}`);
    }
  }
  const ridingMod = horse.ridingModifier;
  const liveRiding = actor.system.general?.ridingmodifier?.value;
  if (typeof ridingMod === "number" && ridingMod !== liveRiding) {
    diffs.push(`ridingModifier: file ${ridingMod} vs world ${liveRiding}`);
  }
  return diffs;
}

/**
 * Process all horses in the import plan: match / create, link, mount.
 * Returns warnings generated during horse handling.
 */
async function importHorses(pc, plan, warnings, { replacing }) {
  if (!plan.horses.length) return;

  // On Replace: unlink horses that are no longer in the file.
  if (replacing) {
    cleanupRemuda(plan, pc);
  }

  let mountedActorId = null;

  // Horses are processed one at a time on purpose: each may open a dialog the user must answer in order,
  // and they all update the same PC's remuda list.
  for (const horse of plan.horses) {
    const { action, actor: existingActor } = await matchHorse(horse); // NOSONAR - sequential by design

    if (action === "skip") {
      warnings.push({ code: "horse-skipped", message: `Horse "${horse.name}" was skipped.` });
      continue;
    }

    const horseActor = (action === "existing") ? linkExistingHorse(existingActor, horse, warnings) : await createHorseActor(horse, warnings); // NOSONAR - sequential by design

    await pc.addRemuda(horseActor.id); // NOSONAR - sequential by design

    if (horse.isCurrentMount) mountedActorId = horseActor.id;
  }

  // Set mounted state.
  const updates = {};
  if (mountedActorId) {
    updates["system.remuda.remudaMounted"] = mountedActorId;
    await game.actors.get(mountedActorId)?.update({ "system.general.mounted": true });
  } else {
    updates["system.remuda.remudaMounted"] = "false";
  }
  await pc.update(updates);
}

function linkExistingHorse(existingActor, horse, warnings) {
  const diffs = statDiffWarning(horse, existingActor);
  if (diffs.length) {
    warnings.push({
      code: "horse-stats-differ",
      message: `Horse "${horse.name}": the world actor's stats differ from the file: ${diffs.join("; ")}.`,
    });
  }
  return existingActor;
}

function cleanupRemuda(plan, pc) {
  const fileIds = new Set(plan.horses.map((h) => h.saddlebagId).filter(Boolean));
  const remuda = pc.system.remuda?.details ?? [];
  for (const entry of remuda) {
    const horseActor = game.actors.get(entry.id);
    if (!horseActor) continue;
    const horseFlag = horseActor.getFlag(NS, "saddlebagHorseId");
    // Only unlink if the actor came from Saddlebag and its id is no longer in the file.
    if (horseFlag && !fileIds.has(horseFlag)) {
      pc.removeRemuda(entry.id);
    }
  }
}

async function populate(actor, plan, items, warnings, { replacing }) {
  if (items.length) await actor.createEmbeddedDocuments("Item", items);
  await createCrits(actor, plan, warnings);

  await applyConditions(actor, plan.conditions);

  const hasCrit = actor.items.some((i) => i.type === "crit");
  if (hasCrit) await actor.toggleStatusEffect("criticalinj", { active: true });
  else if (replacing) await actor.toggleStatusEffect("criticalinj", { active: false });

  const broken = Object.values(plan.actorData.system.attributes).some((a) => a.value === 0);
  if (broken) await actor.toggleStatusEffect("broken", { active: true });
  else if (replacing) await actor.toggleStatusEffect("broken", { active: false });

  await importHorses(actor, plan, warnings, { replacing });
}

/**
 * Upload a portrait from a Saddlebag archive into the world's `assets/saddlebag` folder.
 * @param {{read(name: string): Promise<Uint8Array>}} zip
 * @param {{entry: string, mime: string, filename: string}} portrait
 * @returns {Promise<string|null>}  The stored path, or null when it could not be uploaded.
 */
export async function uploadPortrait(zip, portrait) {
  if (!game.user.can("FILES_UPLOAD")) return null;
  const { FilePicker } = foundry.applications.apps;
  const root = `worlds/${game.world.id}/assets`;
  const target = `${root}/saddlebag`;
  try {
    // Each level may already exist, which the server reports as an error. Upload decides whether it worked.
    const makeDir = (dir) => FilePicker.createDirectory("data", dir).catch(() => {});
    await makeDir(root);
    await makeDir(target);
    const file = new File([await zip.read(portrait.entry)], portrait.filename, { type: portrait.mime });
    const response = await FilePicker.implementation.upload("data", target, file, {}, { notify: false });
    return response?.path ?? null;
  } catch (err) {
    logger.warning(false, "Saddlebag portrait upload failed", err);
    return null;
  }
}

/**
 * Create or update a PC from an import plan (the output of `toFoundry`).
 * @param {object} plan
 * @param {object} [options]
 * @param {Actor|null} [options.replace]  Existing actor to update in place.
 * @param {boolean} [options.asCopy]      Create a new actor with a fresh Saddlebag id.
 * @param {string|null} [options.img]     Portrait path to set as the actor image.
 * @returns {Promise<{actor: Actor, warnings: object[]}>}
 */
export async function importCharacter(plan, { replace = null, asCopy = false, img = null } = {}) {
  if (replace && asCopy) throw new Error("replace and asCopy are mutually exclusive");
  if (replace ? !replace.isOwner : !game.user.can("ACTOR_CREATE")) {
    throw new SaddlebagImportError(replace ? "not-owner" : "no-permission");
  }

  // Read-only phase: nothing is created until every item has been looked up.
  const { items, warnings: itemWarnings, resolvedCore, expectedCore } = await buildItems(plan);
  if (expectedCore > 0 && resolvedCore === 0) throw new SaddlebagImportError("core-rules-missing");
  const warnings = [...plan.warnings, ...itemWarnings];

  const flag = foundry.utils.deepClone(plan.flag);
  if (asCopy) {
    // A copy must not collide with the original character on a later export.
    flag.id = crypto.randomUUID();
    flag.character.id = flag.id;
  }

  if (replace) {
    const { name, system } = plan.actorData;
    await replace.update({ name, system, ...(img && { img }) });
    await replace.unsetFlag(NS, "saddlebag");
    await replace.setFlag(NS, "saddlebag", flag);
    const stale = replace.items.filter((i) => i.getFlag(NS, "saddlebagItemId") !== undefined).map((i) => i.id);
    if (stale.length) await replace.deleteEmbeddedDocuments("Item", stale);
    await populate(replace, plan, items, warnings, { replacing: true });
    return { actor: replace, warnings };
  }

  const actorData = foundry.utils.deepClone(plan.actorData);
  actorData.flags = { [NS]: { saddlebag: flag } };
  if (img) actorData.img = img;
  const actor = await Actor.create(actorData, { renderSheet: false });
  try {
    await populate(actor, plan, items, warnings, { replacing: false });
  } catch (err) {
    // Creation is not transactional: remove the half-built actor.
    logger.warning(false, "Saddlebag import failed; removing the partial actor", err);
    await actor.delete();
    throw err;
  }
  return { actor, warnings };
}

/* -------------------------------------------- */
/*  Export                                      */
/* -------------------------------------------- */

/** The plain-data view of a PC that `fromFoundry` expects. */
export function snapshotActor(actor) {
  const data = actor.toObject();
  const items = actor.items.map((i) => ({
    type: i.type,
    name: i.name,
    flagId: i.getFlag(NS, "saddlebagItemId") ?? null,
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
        qualities: Object.values(i.system.featureModifiers ?? {}).map((q) => q.name),
      }),
    },
  }));
  const horses = (actor.system.remuda?.details ?? [])
    .map((entry) => game.actors.get(entry.id))
    .filter((h) => h?.type === "animal")
    .map((h) => ({
      name: h.name,
      saddlebagHorseId: h.getFlag(NS, "saddlebagHorseId") ?? null,
      ridingModifier: h.system.general?.ridingmodifier?.value,
      attributes: Object.fromEntries(
        ["grit", "quick", "cunning"].map((a) => [a, { value: h.system.attributes?.[a]?.value, max: h.system.attributes?.[a]?.max }]),
      ),
      abilities: Object.fromEntries(Object.entries(h.system.abilities ?? {}).map(([k, v]) => [k, { value: v.value }])),
    }));
  return {
    name: actor.name,
    system: data.system,
    flag: foundry.utils.deepClone(actor.getFlag(NS, "saddlebag") ?? null),
    exportIds: foundry.utils.deepClone(actor.getFlag(NS, "saddlebagExport") ?? null),
    statuses: [...actor.statuses],
    items,
    horses,
  };
}

const fileSlug = (name) =>
  String(name ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "character";

/**
 * Build a Saddlebag Markdown export for a PC and download it.
 * @returns {Promise<{filename: string, warnings: object[]}|null>}  null when the actor is not a PC.
 */
export async function exportActor(actor) {
  if (actor?.type !== "pc") {
    ui.notifications.warn(L("TALESOFTHEOLDWEST.Saddlebag.Error.export-not-pc"));
    return null;
  }
  try {
    const snapshot = snapshotActor(actor);
    const { envelope, warnings } = fromFoundry(snapshot);
    if (!snapshot.flag && !snapshot.exportIds && actor.isOwner) {
      // Remember the ids so the next export of this PC is recognised as the same character.
      await actor.setFlag(NS, "saddlebagExport", { characterId: envelope.character.id, campaignId: envelope.campaign.id });
    }
    const filename = `${fileSlug(actor.name)}.md`;
    foundry.utils.saveDataToFile(renderSaddlebagMarkdown(envelope), "text/markdown", filename);
    if (warnings.length) {
      console.warn(`Saddlebag export of ${actor.name}:`, warnings);
      ui.notifications.warn(game.i18n.format("TALESOFTHEOLDWEST.Saddlebag.ExportedWarnings", { name: actor.name, count: warnings.length }));
    } else {
      ui.notifications.info(game.i18n.format("TALESOFTHEOLDWEST.Saddlebag.Exported", { name: actor.name }));
    }
    return { filename, warnings };
  } catch (err) {
    logger.warning(false, "Saddlebag export failed", err);
    ui.notifications.error(L("TALESOFTHEOLDWEST.Saddlebag.Error.export-failed"), { console: false });
    return null;
  }
}
