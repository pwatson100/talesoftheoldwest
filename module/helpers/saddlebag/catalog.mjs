// PURE module: no Foundry globals, no DOM. The only import from the rest of the system is config.mjs,
// which is itself free of Foundry globals. Slug / name / key tables and normalisers. Ids, names and keys only; no rules text.

import { TALESOFTHEOLDWEST } from "../config.mjs";

export const ABILITY_KEYS = Object.freeze(Object.keys(TALESOFTHEOLDWEST.abilities));

/** Attribute -> damage track it feeds. */
export const ATTRIBUTE_TRACKS = Object.freeze(
  Object.fromEntries(Object.entries(TALESOFTHEOLDWEST.damageTracks).map(([track, { attr }]) => [attr, track]))
);

/** Damage track -> highest damage a PC or NPC can take on it. */
export const DAMAGE_CAPS = Object.freeze(
  Object.fromEntries(Object.entries(TALESOFTHEOLDWEST.damageTracks).map(([track, { max }]) => [track, max]))
);

export const ARCHETYPE_IDS = Object.freeze(Object.keys(TALESOFTHEOLDWEST.archetype_list));

export const BREED_KEYS = Object.freeze(Object.keys(TALESOFTHEOLDWEST.animal_breed_list));

/** Animal ability keys (a subset of ABILITY_KEYS). */
export const ANIMAL_ABILITY_KEYS = Object.freeze(Object.keys(TALESOFTHEOLDWEST.animalabilities));

/** Ability key -> the attribute it belongs to. */
export const ABILITY_ATTRIBUTE = Object.freeze(
  Object.fromEntries(Object.entries(TALESOFTHEOLDWEST.abilities).map(([key, { atob }]) => [key, atob]))
);

/** Conditions shared by Saddlebag and Foundry status ids. */
export const CONDITION_IDS = Object.freeze(["starving", "dehydrated", "exhausted", "freezing", "heatstroke"]);

/** Keys are `normaliseName` output of the Saddlebag name; values are the Foundry item name. */
export const WEAPON_ALIASES = Object.freeze({
  "winchester model 1866": "Winchester 1866",
  "winchester model 1873": "Winchester 1873",
});

export const GEAR_ALIASES = Object.freeze({});

/**
 * Saddlebag's weapon book entries: ids, names and structural fields only (kind, action, ability, ammo types). No damage, crit, range or other numbers:
 * an exported weapon takes those from the Foundry item.
 */
export const WEAPON_BOOK = Object.freeze([
  { bookId: "colt-1860-new-army", name: "Colt 1860 New Army", kind: "pistol", action: "single", ability: "SHOOTIN\u2019", ammoTypes: ["ammo-44-percussion", "ammo-44-colt"] },
  { bookId: "colt-45-peacemaker", name: "Colt 45 Peacemaker", kind: "pistol", action: "single", ability: "SHOOTIN\u2019", ammoTypes: ["ammo-45-colt"] },
  { bookId: "colt-walker", name: "Colt Walker", kind: "pistol", action: "single", ability: "SHOOTIN\u2019", ammoTypes: ["ammo-44-percussion"] },
  { bookId: "cooper", name: "Cooper", kind: "pistol", action: "double", ability: "SHOOTIN\u2019", ammoTypes: ["ammo-31-percussion"] },
  { bookId: "manhattan-navy", name: "Manhattan Navy", kind: "pistol", action: "single", ability: "SHOOTIN\u2019", ammoTypes: ["ammo-36-percussion"] },
  { bookId: "metropolitan-navy-1864", name: "Metropolitan Navy 1864", kind: "pistol", action: "single", ability: "SHOOTIN\u2019", ammoTypes: ["ammo-36-percussion"] },
  { bookId: "remington-1858", name: "Remington 1858", kind: "pistol", action: "single", ability: "SHOOTIN\u2019", ammoTypes: ["ammo-44-percussion", "ammo-36-percussion"] },
  { bookId: "smith-and-wesson-model-3", name: "Smith & Wesson Model 3", kind: "pistol", action: "single", ability: "SHOOTIN\u2019", ammoTypes: ["ammo-44-sw-american", "ammo-44-henry", "ammo-44-russian"] },
  { bookId: "starr-revolver", name: "Starr Revolver", kind: "pistol", action: "double", ability: "SHOOTIN\u2019", ammoTypes: ["ammo-44-percussion"] },
  { bookId: "webley-british-bulldog", name: "Webley British Bulldog", kind: "pistol", action: "double", ability: "SHOOTIN\u2019", ammoTypes: ["ammo-442-webley", "ammo-450-adams"] },
  { bookId: "deringer", name: "Deringer", kind: "pistol", action: "single", ability: "SHOOTIN\u2019", ammoTypes: ["ammo-41-percussion"] },
  { bookId: "remington-elliot-pepperbox", name: "Remington Elliot Pepperbox", kind: "pistol", action: "double", ability: "SHOOTIN\u2019", ammoTypes: ["ammo-32-rimfire", "ammo-22-rimfire"] },
  { bookId: "standard-rifle", name: "Standard Rifle", kind: "rifle", action: "lever", ability: "SHOOTIN\u2019", ammoTypes: ["ammo-44-40", "ammo-44-henry", "ammo-56-56-spencer", "ammo-50-percussion", "ammo-54-percussion"] },
  { bookId: "sharps-rifle-1874", name: "Sharps Rifle 1874", kind: "rifle", action: "breech", ability: "SHOOTIN\u2019", ammoTypes: ["ammo-50-70", "ammo-45-70"] },
  { bookId: "spencer-carbine", name: "Spencer Carbine", kind: "rifle", action: "lever", ability: "SHOOTIN\u2019", ammoTypes: ["ammo-56-56-spencer"] },
  { bookId: "winchester-model-1866", name: "Winchester Model 1866", kind: "rifle", action: "lever", ability: "SHOOTIN\u2019", ammoTypes: ["ammo-44-henry"] },
  { bookId: "winchester-model-1873", name: "Winchester Model 1873", kind: "rifle", action: "lever", ability: "SHOOTIN\u2019", ammoTypes: ["ammo-44-40"] },
  { bookId: "standard-shotgun", name: "Standard Shotgun", kind: "shotgun", action: "breech", ability: "SHOOTIN\u2019", ammoTypes: ["ammo-12-gauge", "ammo-10-gauge", "ammo-16-gauge", "ammo-12-gauge-loads", "ammo-10-gauge-loads"] },
  { bookId: "hartford-coachgun", name: "Hartford Coachgun", kind: "shotgun", action: "breech", ability: "SHOOTIN\u2019", ammoTypes: ["ammo-12-gauge", "ammo-10-gauge", "ammo-12-gauge-loads", "ammo-10-gauge-loads"] },
  { bookId: "roper-repeating-shotgun", name: "Roper Repeating Shotgun", kind: "shotgun", action: "lever", ability: "SHOOTIN\u2019", ammoTypes: ["ammo-16-gauge", "ammo-12-gauge"] },
  { bookId: "wells-fargo-coachgun", name: "Wells Fargo Coachgun", kind: "shotgun", action: "breech", ability: "SHOOTIN\u2019", ammoTypes: ["ammo-12-gauge", "ammo-10-gauge", "ammo-12-gauge-loads", "ammo-10-gauge-loads"] },
  { bookId: "standard-bow", name: "Standard Bow", kind: "bow", action: "special", ability: "SHOOTIN\u2019", ammoTypes: ["ammo-arrows"] },
  { bookId: "quality-bow", name: "Quality Bow", kind: "bow", action: "special", ability: "SHOOTIN\u2019", ammoTypes: ["ammo-arrows"] },
  { bookId: "bullwhip", name: "Bullwhip", kind: "melee", action: null, ability: "LIGHT-FINGERED", ammoTypes: [] },
  { bookId: "cavalry-sword", name: "Cavalry Sword", kind: "melee", action: null, ability: "FIGHTIN\u2019", ammoTypes: [] },
  { bookId: "club", name: "Club", kind: "melee", action: null, ability: "FIGHTIN\u2019", ammoTypes: [] },
  { bookId: "knife", name: "Knife", kind: "melee", action: null, ability: "FIGHTIN\u2019", ammoTypes: [] },
  { bookId: "lance-wah-keza", name: "Lance (Wah\u00fakeza)", kind: "melee", action: null, ability: "FIGHTIN\u2019", ammoTypes: [] },
  { bookId: "lasso", name: "Lasso", kind: "melee", action: null, ability: "ANIMAL HANDLIN\u2019", ammoTypes: [] },
  { bookId: "quality-blade", name: "Quality Blade", kind: "melee", action: null, ability: "FIGHTIN\u2019", ammoTypes: [] },
  { bookId: "tomahawk", name: "Tomahawk", kind: "melee", action: null, ability: "FIGHTIN\u2019", ammoTypes: [] },
  { bookId: "dynamite-one-stick", name: "Dynamite (one stick)", kind: "explosive", action: null, ability: "OPERATE", ammoTypes: [] },
  { bookId: "fist", name: "Fist", kind: "unarmed", action: null, ability: "FIGHTIN\u2019", ammoTypes: [] },
]);

/** The Saddlebag book entry for a Foundry weapon name, or null. Matches the Saddlebag name or its WEAPON_ALIASES form. */
export function weaponBookEntry(name) {
  const n = normaliseName(name);
  if (!n) return null;
  return (
    WEAPON_BOOK.find((e) => {
      const own = normaliseName(e.name);
      return own === n || normaliseName(WEAPON_ALIASES[own]) === n;
    }) ?? null
  );
}

/** Foundry weapon quality name -> Saddlebag quality id, or null when Saddlebag has no such quality. */
export function weaponQualityId(name, kind) {
  const slug = String(name ?? "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const melee = kind === "melee" || kind === "unarmed";
  const suffix = melee ? "melee" : "ranged";
  const full = slug === "piercing" || slug === "balanced" ? `${slug}-${suffix}` : slug;
  return WEAPON_QUALITY_IDS.includes(full) ? full : null;
}

const WEAPON_QUALITY_IDS = Object.freeze([
  "calibrated", "concealable", "fanning", "fast-draw", "heavy", "hidden", "hot-loader", "light", "long-barrel",
  "short-barrel", "sights", "balanced-ranged", "maintained", "piercing-ranged", "powerful", "reliable", "sawn-off",
  "balanced-melee", "forgiving", "mounted", "piercing-melee", "sharpened", "sleek", "toughened", "weighted",
]);

/** Lower-case, strip diacritics and non-alphanumerics, collapse spaces. */
export function normaliseName(s) {
  return String(s ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const stripHyphens = (s) => String(s ?? "").toLowerCase().replaceAll("-", "");

/** `light-fingered` -> `lightfingered`. Returns null when it is not one of the 16 keys. */
export function abilityKeyFromSaddlebag(key) {
  const k = stripHyphens(key);
  return ABILITY_KEYS.includes(k) ? k : null;
}

const HYPHENATED_ABILITIES = Object.freeze({ lightfingered: "light-fingered", animalhandlin: "animal-handlin" });

/** `lightfingered` -> `light-fingered`. Returns null when it is not one of the 16 keys. */
export function abilityKeyToSaddlebag(key) {
  return ABILITY_KEYS.includes(key) ? (HYPHENATED_ABILITIES[key] ?? key) : null;
}

/** `ranch-hand` -> `RanchHand`. Returns null when there is no match. */
export function archetypeFromSlug(slug) {
  const k = String(slug ?? "").toLowerCase().replace(/[^a-z]/g, "");
  return ARCHETYPE_IDS.find((id) => id.toLowerCase() === k) ?? null;
}

/** `missouri-fox-trotter` -> `missourifoxtrotter`. Returns null when there is no match. */
export function breedKeyFromSlug(slug) {
  const k = stripHyphens(slug);
  return BREED_KEYS.includes(k) ? k : null;
}
