// PURE module: no Foundry globals, no DOM, no imports from the rest of the system.
// Turns a neutral snapshot of a Foundry PC into a Saddlebag export envelope.
//
// Snapshot shape (built by snapshotActor in apply.mjs):
// {
//   name: string,
//   system: <actor.toObject().system>,
//   flag: null | { id, formatVersion, importedAt, character, campaign },
//   exportIds: null | { characterId, campaignId },   // ids minted by an earlier export of a native PC
//   statuses: string[],                        // active status ids
//   legacyCharacterId: string|null,          // `flags.saddlebag.id` written by Saddlebag's own Foundry export
//   items: [{ type, name, flagId|null, legacy: null | {ref, kind, id|null, rank, book}, system: { quantity, weight, ammo, ammoMax, stored,
//                                                 basicisActive, advisActive,
//                                                 // weapons only:
//                                                 subtype, range, damage, crit, attackbonus, bonusdraw,
//                                                 qualities: string[] } }],
//   horses: [{ name, saddlebagHorseId|null, ridingModifier, attributes: {grit:{value,max},…},
//              abilities: {fightin:{value},…} }]
// }

import {
  ABILITY_KEYS,
  ATTRIBUTE_TRACKS,
  CONDITION_IDS,
  abilityKeyToSaddlebag,
  weaponBookEntry,
  weaponBookEntryById,
  weaponQualityId,
} from "./catalog.mjs";

const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const isD66 = (n) => Number.isInteger(n) && /^[1-6][1-6]$/.test(String(n));
const clampInt = (n, min, max) => Math.min(max, Math.max(min, Math.round(n)));

/** `$3.00`, `3.00`, `3` -> cents. Returns null when the text is not a plain amount. */
function parseCashCents(text) {
  const s = String(text ?? "").replace(/[$,\s]/g, "");
  if (s === "") return 0;
  if (!/^\d+(\.\d+)?$/.test(s)) return null;
  return Math.round(Number.parseFloat(s) * 100);
}

/** HTML -> plain text (paragraph breaks kept). */
export function htmlToText(html) {
  return String(html ?? "")
    .replace(/<\/(p|h[1-6]|li|div)>|<br\s*\/?>/gi, "\n")
    .replace(/<[^<>]*>/g, "")
    .replaceAll("&nbsp;", " ")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&amp;", "&")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** The roll in a crit item name such as `#46 Gut - Lacerated Intestines`, or null. */
const critRoll = (name) => {
  const m = /^#(\d{2})\b/.exec(String(name ?? ""));
  const roll = m ? Number.parseInt(m[1], 10) : Number.NaN;
  return isD66(roll) ? roll : null;
};

const talentKey = (t) => `talent:${t.talentId || t.name}`;

function customGear({ name, quantity, weight, stored }, uuid) {
  return {
    id: uuid(),
    bookId: null,
    custom: true,
    kind: "gear",
    name,
    quantity: isNum(quantity) ? Math.max(1, Math.round(quantity)) : 1,
    holder: stored ? { type: "elsewhere", id: null, note: "stored in Foundry" } : { type: "pc", id: null, note: "" },
    weight: isNum(weight) && weight > 0 ? weight : null,
    value: null,
    tack: false,
    tags: { builtIn: [], acquired: [] },
    weapon: null,
    quiver: null,
    notes: "",
  };
}

/** Gear or ammo that Saddlebag's own Foundry export wrote: its Saddlebag id and book id are kept. */
function legacyGear(item, uuid) {
  const { ref, kind, id, book } = item.legacy;
  return {
    ...customGear({ name: item.name, quantity: item.system?.quantity, weight: item.system?.weight, stored: item.system?.stored }, () => id ?? uuid()),
    bookId: book ? ref : null,
    custom: !book,
    kind: kind === "ammo" ? "ammo" : "gear",
    // Saddlebag's own export drops the quiver's contents; a book quiver is rebuilt empty.
    quiver: book && ref === "quiver" ? { capacity: 20, loaded: 0 } : null,
  };
}

const WEAPON_RANGES = { armslength: "arms-length" };
const handsFor = (kind) => {
  if (kind === "unarmed") return 0;
  if (["rifle", "shotgun", "bow"].includes(kind)) return 2;
  return 1;
};

/** Best-guess Saddlebag weapon kind for a Foundry weapon that is not in the weapon book. */
function inferWeaponKind(sys, ammoMax) {
  if (sys.subtype !== "shootin") return "melee";
  if (ammoMax === 0) return "bow";
  if (["long", "distant"].includes(sys.range)) return "rifle";
  return "pistol";
}

/** Default action for a custom (non-book) weapon of the given kind. */
function inferWeaponAction(kind) {
  if (kind === "melee") return null;
  if (kind === "bow") return "special";
  return "single";
}

/** The Saddlebag weapon item for a Foundry weapon. Numbers come from the Foundry item; the book entry gives identity and structure. */
function weaponItem(item, ctx) {
  const sys = item.system ?? {};
  const entry = (item.legacy?.book && weaponBookEntryById(item.legacy.ref)) || weaponBookEntry(item.name);
  const num = (v) => (isNum(v) ? v : 0);

  let kind;
  let action;
  let ability;
  let ammoTypes;
  if (entry) {
    ({ kind, action, ability, ammoTypes } = entry);
  } else {
    kind = inferWeaponKind(sys, num(sys.ammoMax));
    action = inferWeaponAction(kind);
    ability = kind === "melee" ? "FIGHTIN\u2019" : "SHOOTIN\u2019";
    ammoTypes = [];
    ctx.warn(
      "weapon-exported-as-custom",
      `Weapon "${item.name}" is not in the Saddlebag weapon book; exported as a custom ${kind} using its Foundry numbers.`,
    );
  }

  const builtIn = [];
  for (const q of sys.qualities ?? []) {
    processWeaponQuality(q, kind, ctx, item, builtIn);
  }

  // Saddlebag's own export writes the capacity into `ammo` and leaves `ammoMax` at 0.
  const capacity = Math.max(0, Math.round(num(sys.ammoMax) || (item.legacy ? num(sys.ammo) : 0)));
  const ammoType = capacity > 0 ? (ammoTypes[0] ?? null) : null;
  const loaded = Math.max(0, Math.round(num(sys.ammo)));
  const stored = Boolean(sys.stored);
  return {
    id: item.legacy?.id ?? ctx.uuid(),
    bookId: entry ? entry.bookId : null,
    custom: !entry,
    kind: "weapon",
    name: entry ? entry.name : item.name,
    quantity: 1,
    holder: stored ? { type: "elsewhere", id: null, note: "stored in Foundry" } : { type: "pc", id: null, note: "" },
    weight: isNum(sys.weight) && sys.weight > 0 ? sys.weight : null,
    value: null,
    tack: false,
    tags: { builtIn, acquired: [] },
    weapon: {
      weaponKind: kind,
      action,
      ability,
      drawMod: num(sys.bonusdraw),
      attackMod: num(sys.attackbonus),
      damage: num(sys.damage),
      crit: num(sys.crit),
      range: WEAPON_RANGES[sys.range] ?? sys.range ?? "arms-length",
      capacity,
      hands: handsFor(kind),
      ammoTypes: [...ammoTypes],
      ammoType,
      loaded: capacity > 0 ? Math.min(loaded, capacity) : 0,
      state: stored ? "stowed" : "carried",
    },
    quiver: null,
    notes: "",
  };
}

function processWeaponQuality(q, kind, ctx, item, builtIn) {
  const id = weaponQualityId(q, kind);
  if (!id) ctx.warn("quality-not-exported", `Quality "${q}" on "${item.name}" has no Saddlebag equivalent; left out.`);
  else if (!builtIn.includes(id)) builtIn.push(id);
}

function customTalent(item) {
  return {
    talentId: null,
    name: item.name,
    rank: item.system?.advisActive ? "advanced" : "basic",
    custom: true,
    notes: "",
  };
}

const talentRank = (item) => (item.system?.advisActive ? "advanced" : "basic");

/** A talent that Saddlebag's own Foundry export wrote: a book talent keeps its id, any other stays custom. */
const legacyTalent = (item) =>
  item.legacy.book
    ? { talentId: item.legacy.ref, name: item.name, rank: talentRank(item), custom: false, notes: "" }
    : customTalent(item);

/** Injuries, items and talents are shared by both branches; each takes the stored lists (or empty ones). */
function mergeInjuries(stored, snap, ctx) {
  const crits = snap.items.filter((i) => i.type === "crit");
  const storedIds = new Set(stored.map((s) => s.id));
  const liveIds = new Set(crits.map((c) => c.flagId).filter(Boolean));

  const kept = stored.filter((inj) => {
    const roll = typeof inj.roll === "number" ? inj.roll : Number.parseInt(inj.roll, 10);
    if (!isD66(roll)) return true; // never imported; leave it alone
    return liveIds.has(inj.id);
  });

  for (const crit of crits) {
    if (crit.flagId && storedIds.has(crit.flagId)) continue;
    const roll = critRoll(crit.name);
    if (roll === null) {
      ctx.warn("unrecognised-injury", `Critical injury "${crit.name}" has no roll number in its name; not exported.`);
      continue;
    }
    kept.push({
      id: ctx.uuid(),
      roll: String(roll),
      date: ctx.date,
      healingRoll: null,
      longTermPrevented: false,
      stabilized: false,
      notes: "",
    });
  }
  return kept;
}

function mergeTalents(stored, snap) {
  const live = new Map(snap.items.filter((i) => i.type === "talent" && i.flagId).map((i) => [i.flagId, i]));
  const storedKeys = new Set(stored.map(talentKey));
  const out = [];
  for (const t of stored) {
    const item = live.get(talentKey(t));
    if (!item) continue; // deleted in Foundry
    const next = structuredClone(t);
    // Only change the rank when Foundry disagrees with it.
    if (talentRank(item) !== t.rank) next.rank = talentRank(item);
    out.push(next);
  }
  for (const item of snap.items) {
    if (item.type !== "talent") continue;
    if (item.flagId && storedKeys.has(item.flagId)) continue;
    out.push(item.legacy ? legacyTalent(item) : customTalent(item));
  }
  return out;
}

function mergeItems(stored, snap, ctx) {
  const foundry = snap.items.filter((i) => i.type === "item" || i.type === "weapon");
  const live = new Map(foundry.filter((i) => i.flagId).map((i) => [i.flagId, i]));
  const storedIds = new Set(stored.map((s) => s.id));
  const out = [];

  for (const s of stored) {
    const item = live.get(s.id);
    if (!item) continue; // deleted in Foundry
    const next = processNextItem(s, item);
    out.push(next);
  }

  for (const item of foundry) {
    if (item.flagId && storedIds.has(item.flagId)) continue;
    if (item.type === "weapon") {
      out.push(weaponItem(item, ctx));
      continue;
    }
    if (item.legacy) {
      out.push(legacyGear(item, ctx.uuid));
      continue;
    }
    out.push(customGear({ name: item.name, quantity: item.system?.quantity, weight: item.system?.weight, stored: item.system?.stored }, ctx.uuid));
  }
  return out;
}

function processNextItem(s, item) {
  const next = structuredClone(s);
  if (item.type === "weapon" && isObject(next.weapon)) {
    processWeaponItem(item, next);
  } else if (item.type === "item" && isNum(item.system?.quantity)) {
    const was = isNum(next.quantity) ? Math.max(1, Math.round(next.quantity)) : 1;
    if (item.system.quantity !== was) next.quantity = item.system.quantity;
  }
  return next;
}

function processWeaponItem(item, next) {
  const ammo = item.system?.ammo;
  const max = Number(item.system?.ammoMax) || 0;
  const importClamped = max > 0 && next.weapon.loaded > max && ammo === max;
  if (isNum(ammo) && ammo !== next.weapon.loaded && !importClamped) next.weapon.loaded = ammo;

  // Weapon numbers belong to Foundry. Saddlebag's "tiny" (or null) counts as 0 when comparing.
  const foundryWeight = item.system?.weight;
  const currentWeight = isNum(next.weight) ? next.weight : 0;
  if (isNum(foundryWeight) && foundryWeight !== currentWeight) next.weight = foundryWeight > 0 ? foundryWeight : null;

  // Only act when `stored` changed in Foundry; otherwise keep Saddlebag's own holder and state.
  const stored = Boolean(item.system?.stored);
  if (stored !== (isObject(next.holder) && next.holder.type !== "pc")) {
    next.holder = stored ? { type: "elsewhere", id: null, note: "stored in Foundry" } : { type: "pc", id: null, note: "" };
    next.weapon.state = stored ? "stowed" : "carried";
  }
}

function mergeConditions(stored, snap) {
  const live = CONDITION_IDS.filter((id) => snap.statuses.includes(id));
  const kept = stored.filter((id) => !CONDITION_IDS.includes(id) || live.includes(id));
  for (const id of live) if (!kept.includes(id)) kept.push(id);
  return kept;
}

/** Overlay the fields Foundry owns onto a stored Saddlebag character (flag present). */
function overlayCharacter(char, snap, ctx) {
  const sys = snap.system ?? {};

  if (typeof snap.name === "string" && snap.name.trim() && snap.name.trim() !== char.name) char.name = snap.name.trim();

  setCharacterAttrs(char, sys, ctx);

  const general = setGeneralProps(char, sys);

  // XP: unspent = earned - spent. Import clamped it to 0-10, so only act when Foundry differs from that.
  setMoneyAndXP(general, char, ctx);

  char.conditions = mergeConditions(char.conditions ?? [], snap);
  char.injuries = mergeInjuries(char.injuries ?? [], snap, { ...ctx, date: char.date ?? null });
  char.talents = mergeTalents(char.talents ?? [], snap);
  char.items = mergeItems(char.items ?? [], snap, ctx);

  // Horses: overlay stats for horses that came from Saddlebag. Never invent new ones.
  for (const stored of char.horses ?? []) {
    processHorse(stored, snap);
  }
  const unlinked = (snap.horses ?? []).filter(
    (h) => !(char.horses ?? []).some((s) => h.saddlebagHorseId && s.id === h.saddlebagHorseId),
  );
  for (const h of unlinked) {
    ctx.warn("horse-not-exported", `Horse "${h.name}" did not come from Saddlebag; it is not exported.`);
  }

  char.updatedAt = ctx.now;
}

function processHorse(stored, snap) {
  const live = snap.horses?.find((h) => h.saddlebagHorseId && h.saddlebagHorseId === stored.id);
  if (!live) return;
  for (const attr of ["grit", "quick", "cunning"]) {
    const a = live.attributes?.[attr];
    if (!a || !isObject(stored.attributes?.[attr])) continue;
    stored.attributes[attr].max = a.max;
    stored.attributes[attr].current = a.value;
  }
  for (const key of Object.keys(stored.abilities ?? {})) {
    const v = live.abilities?.[key]?.value;
    if (isNum(v)) stored.abilities[key] = v;
  }
  if (isNum(live.ridingModifier)) stored.ridingModifier = live.ridingModifier;
}

function setMoneyAndXP(general, char, ctx) {
  const unspent = general.xp?.value;
  if (isNum(unspent)) {
    char.xp ??= { earned: 0, spent: 0 };
    const earned = isNum(char.xp.earned) ? char.xp.earned : 0;
    const spent = isNum(char.xp.spent) ? char.xp.spent : 0;
    if (clampInt(earned - spent, 0, 10) !== unspent) {
      if (earned - unspent >= 0) char.xp.spent = earned - unspent;
      else char.xp.earned = unspent + spent; // unspent exceeds earned: raise earned, keep spent
    }
  }

  // Cash: compare with the ledger (V4); record any difference as a ledger entry.
  const cents = parseCashCents(general.cash);
  if (cents === null) {
    ctx.warn("cash-unreadable", `Cash "${general.cash}" is not a plain amount; the ledger was left unchanged.`, "general.cash");
  } else {
    char.ledger ??= [];
    const ledgerCents = char.ledger.reduce((sum, e) => sum + (isNum(e?.amount) ? e.amount : 0), 0);
    if (cents !== Math.max(0, ledgerCents)) {
      char.ledger.push({ id: ctx.uuid(), date: char.date ?? null, text: "Adjusted in Foundry", amount: cents - ledgerCents });
    }
  }
}

function setGeneralProps(char, sys) {
  const general = sys.general ?? {};
  if (isNum(general.fame?.value)) char.fame = general.fame.value;
  char.reputation ??= {};
  if (isNum(general.morals?.value)) char.reputation.morals = general.morals.value;
  if (isNum(general.publicspirit?.value)) char.reputation.publicSpirit = general.publicspirit.value;
  char.faith ??= {};
  if (typeof general.faith === "string") char.faith.text = general.faith;
  if (isNum(general.faithpoints?.value)) char.faith.points = general.faithpoints.value;
  if (typeof general.bigdream === "string") char.bigDream = general.bigdream;
  return general;
}

function setCharacterAttrs(char, sys, ctx) {
  char.attributes ??= {};
  for (const [attr, track] of Object.entries(ATTRIBUTE_TRACKS)) {
    const a = sys.attributes?.[attr];
    if (!a) continue;
    const taken = sys.damage?.[track]?.value ?? 0;
    if (a.value !== a.max - taken) {
      ctx.warn(
        "damage-mismatch",
        `${attr}: current ${a.value} does not match max ${a.max} minus ${taken} damage; using the current value.`,
        `attributes.${attr}`
      );
    }
    const target = (char.attributes[attr] ??= {});
    target.max = a.max;
    // A stored `current: null` means "full"; keep it that way while that is still true.
    if (!(target.current === null && a.value === a.max)) target.current = a.value;
  }

  char.abilities ??= {};
  for (const key of ABILITY_KEYS) {
    const v = sys.abilities?.[key]?.value;
    if (isNum(v)) char.abilities[abilityKeyToSaddlebag(key)] = v;
  }
}

/** A character built from scratch for a PC that never came from Saddlebag. */
function buildFreshCharacter(snap, campaignId, characterId, ctx) {
  const sys = snap.system ?? {};
  const general = sys.general ?? {};
  const attributes = {};
  for (const attr of Object.keys(ATTRIBUTE_TRACKS)) {
    const a = sys.attributes?.[attr] ?? { value: 3, max: 3 };
    attributes[attr] = { max: a.max, current: a.value };
  }
  const abilities = {};
  for (const key of ABILITY_KEYS) abilities[abilityKeyToSaddlebag(key)] = sys.abilities?.[key]?.value ?? 0;

  const cents = parseCashCents(general.cash);
  if (cents === null) ctx.warn("cash-unreadable", `Cash "${general.cash}" is not a plain amount; exported as zero.`, "general.cash");
  const ledger =
    cents > 0 ? [{ id: ctx.uuid(), date: null, text: "Cash in Foundry", amount: cents }] : [];

  if (general.yourpardner) {
    ctx.warn("pardner-not-exported", `Pardner "${general.yourpardner}" is a plain name in Foundry; it is not exported.`);
  }
  for (const h of snap.horses ?? []) {
    ctx.warn("horse-not-exported", `Horse "${h.name}" did not come from Saddlebag; it is not exported.`);
  }

  const character = {
    formatVersion: 1,
    id: characterId,
    campaignId,
    name: (snap.name ?? "").trim() || "Unnamed",
    gender: null,
    genderNote: "",
    description: "",
    portraitId: null,
    birth: { month: 1, day: 1, year: null },
    ageAtCreation: isNum(general.age?.value) ? general.age.value : 0,
    date: null,
    attributes,
    abilities,
    talents: [],
    conditions: [],
    injuries: [],
    faith: { text: general.faith ?? "", points: general.faithpoints?.value ?? 4, shaken: false },
    bigDream: general.bigdream ?? "",
    pardner: { kind: "none", id: null, ownerId: null, name: "", note: "", gender: null, genderNote: "" },
    relationships: [],
    fame: general.fame?.value ?? 0,
    reputation: { morals: general.morals?.value ?? 3, publicSpirit: general.publicspirit?.value ?? 3 },
    xp: { earned: general.xp?.value ?? 0, spent: 0 },
    advancement: [],
    items: [],
    horses: [],
    currentMountId: null,
    compadres: [],
    ledger,
    bank: 0,
    bankNote: "",
    capital: { points: 0, note: "" },
    employment: { jobId: null, job: "", wage: "", placeToSleep: false, employer: "" },
    lifestyle: null,
    residenceId: "on-the-trail",
    turnOfSeasonDone: null,
    journal: [],
    backstory: htmlToText(sys.biography),
    creation: { method: "blank", archetypeId: null, ageBracketId: null, livings: [], log: [] },
    reserved: { ownSeason: null },
    createdAt: ctx.now,
    updatedAt: ctx.now,
  };

  character.conditions = mergeConditions([], snap);
  character.injuries = mergeInjuries([], snap, { ...ctx, date: null });
  character.talents = mergeTalents([], snap);
  character.items = mergeItems([], snap, ctx);
  return character;
}

function unassignedCampaign(id) {
  return {
    id,
    kind: "unassigned",
    name: "Unassigned",
    eraId: "1873-rulebook",
    season: { season: "spring", year: 1873 },
    settings: {
      holsterLimits: true,
      bulkRule: true,
      compadreLoadLimits: true,
      animalCompadres: true,
      drifterMode: false,
    },
  };
}

/**
 * @param {object} snapshot  See the header comment.
 * @param {{now?: string, uuid?: () => string}} [options]
 * @returns {{envelope: object, warnings: {code: string, message: string, path?: string}[]}}
 */
export function fromFoundry(snapshot, options = {}) {
  const warnings = [];
  const ctx = {
    now: options.now ?? new Date().toISOString(),
    uuid: options.uuid ?? (() => globalThis.crypto.randomUUID()),
    warn: (code, message, path) => warnings.push(path === undefined ? { code, message } : { code, message, path }),
  };
  const snap = { statuses: [], items: [], horses: [], ...snapshot };

  let character;
  let campaign;
  const flag = snap.flag;
  if (isObject(flag) && isObject(flag.character) && isObject(flag.campaign)) {
    character = structuredClone(flag.character);
    campaign = structuredClone(flag.campaign);
    overlayCharacter(character, snap, ctx);
  } else {
    // Reuse the ids from the first export so Saddlebag recognises a later export as the same character.
    // A PC made by Saddlebag's own Foundry export has no stored ids; its `flags.saddlebag.id` is the character id.
    const ids = snap.exportIds;
    campaign = unassignedCampaign(ids?.campaignId || ctx.uuid());
    character = buildFreshCharacter(snap, campaign.id, ids?.characterId || snap.legacyCharacterId || ctx.uuid(), ctx);
    ctx.warn("exported-as-unassigned", "This character did not come from Saddlebag; it is exported as Unassigned.");
  }

  if (snap.portraitId !== undefined) {
    character.portraitId = snap.portraitId;
  }

  return {
    envelope: {
      app: "saddlebag",
      formatVersion: 1,
      exportedAt: ctx.now,
      character,
      campaign,
      residence: null,
    },
    warnings,
  };
}
