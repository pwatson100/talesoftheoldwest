// PURE module: no Foundry globals, no DOM.
// Converts a Saddlebag character's `compadres[]` into neutral import plans: a human becomes an `npc` actor
// and an animal an `animal` actor. The whole original record is kept in the flag so nothing is lost.

import {
  ANIMAL_ABILITY_KEYS,
  ATTRIBUTE_TRACKS,
  COMPADRE_CATEGORIES,
  DAMAGE_CAPS,
  abilityKeyFromSaddlebag,
} from "./catalog.mjs";
import { escapeHtml, paragraphs, setTalents, titleCase } from "./shared.mjs";

export const MAX_COMPADRES = 3;

const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const text = (v) => (typeof v === "string" ? v.trim() : "");
const GENDER_LABEL = { male: "Male", female: "Female" };

/** Attributes written per kind, and the highest value Foundry accepts for each. */
const HUMAN_ATTRIBUTES = ["grit", "quick", "cunning", "docity"];
const ANIMAL_ATTRIBUTES = ["grit", "quick", "cunning"];
const HUMAN_ATTRIBUTE_CAP = 5;
const ANIMAL_ATTRIBUTE_CAP = 10;

/**
 * Guess an animal compadre's Foundry subtype from free text. Never `horse`: a horse is a horse, not a compadre.
 * @param {...string} texts  Name, coat, description, notes.
 * @returns {"wolf"|"dog"|"critters"}
 */
export function animalSubtype(...texts) {
  const t = texts.filter((s) => typeof s === "string").join(" ").toLowerCase();
  if (/\b(?:wolf|wolves)\b/.test(t)) return "wolf";
  if (/\bdogs?\b|hound|\bpup(?:py|pies|s)?\b/.test(t)) return "dog";
  return "critters";
}

/**
 * @param {object} character  The Saddlebag character (may lack `compadres`).
 * @param {{now?: string, portraits?: {has(id: string): boolean}}} [options]  `portraits`: the portrait ids present in the archive.
 * @returns {{compadres: object[], warnings: {code: string, message: string, path?: string}[]}}
 */
export function toFoundryCompadres(character, options = {}) {
  const list = Array.isArray(character?.compadres) ? character.compadres : [];
  const importedAt = options.now ?? new Date().toISOString();
  const topWarnings = [];
  const kept = new Map();

  list.forEach((comp, i) => {
    if (!isObject(comp) || typeof comp.id !== "string" || !comp.id) return;
    if (kept.has(comp.id)) {
      topWarnings.push({ code: "compadre-duplicate-id", message: `Two compadres share the id ${comp.id}; the second was skipped.`, path: `compadres.${i}` });
      return;
    }
    const { plan, warnings } = buildCompadre(comp, i, character, importedAt, options);
    if (plan) kept.set(comp.id, { plan, warnings });
    else topWarnings.push(...warnings);
  });

  let entries = [...kept.values()];
  if (entries.length > MAX_COMPADRES) {
    topWarnings.push({
      code: "too-many-compadres",
      message: `${entries.length} compadres in the file; only the first ${MAX_COMPADRES} are imported.`,
      path: "compadres",
    });
    entries = entries.slice(0, MAX_COMPADRES);
  }

  return { compadres: entries.map((e) => e.plan), warnings: [...topWarnings, ...entries.flatMap((e) => e.warnings)] };
}

/** @returns {{plan: object|null, warnings: object[]}}  `plan` is null when the entry has to be skipped. */
function buildCompadre(comp, i, character, importedAt, options) {
  const path = `compadres.${i}`;
  const warnings = [];
  const warn = (code, message, p = path) => warnings.push({ code, message, path: p });

  if (comp.kind !== "human" && comp.kind !== "animal") {
    warn("compadre-unknown-kind", `A compadre has kind "${comp.kind}", which is not known; skipped.`);
    return { plan: null, warnings };
  }
  const animal = comp.kind === "animal";

  const rawName = text(comp.name);
  const fallbackName = animal ? "Animal compadre" : "Compadre";
  const name = rawName || fallbackName;
  if (!rawName) warn("compadre-unnamed", `A compadre has no name; it was called "${fallbackName}".`);

  const clamp = (raw, min, max, p, fallback = min) => {
    if (!isNum(raw)) return fallback;
    const value = Math.min(max, Math.max(min, Math.round(raw)));
    if (value !== raw) warn("clamped", `${name}: ${p} was ${raw}; using ${value} (allowed ${min}-${max}).`, `${path}.${p}`);
    return value;
  };

  const { attributes, damage } = mapAttributes(comp, animal, name, warn, clamp);
  const abilities = mapAbilities(comp, animal, warn, clamp, path);

  const portraitId = typeof comp.portraitId === "string" && comp.portraitId ? comp.portraitId : null;
  if (portraitId && options.portraits && !options.portraits.has(portraitId)) {
    warn("compadre-portrait-missing", `${name}: the portrait is not in the archive; the default image was kept.`, `${path}.portraitId`);
  }

  const parts = [];
  if (animal && text(comp.coat)) parts.push(`<p>Coat &amp; markings: ${escapeHtml(text(comp.coat))}</p>`);
  const gender = GENDER_LABEL[comp.gender];
  if (gender) parts.push(`<p>${gender}${text(comp.genderNote) ? ` (${escapeHtml(text(comp.genderNote))})` : ""}</p>`);
  if (!animal && text(comp.publicReputation)) parts.push(`<p>Public reputation: ${escapeHtml(text(comp.publicReputation))}</p>`);
  if (!animal && text(comp.privatePersonality)) parts.push(`<p>Private personality: ${escapeHtml(text(comp.privatePersonality))}</p>`);
  parts.push(paragraphs(comp.description), paragraphs(comp.notes));
  if (comp.accompanying === false) {
    parts.push(`<p>Not with the PC${text(comp.where) ? `: ${escapeHtml(text(comp.where))}` : ""}</p>`);
  }
  const biography = parts.join("");

  const system = { attributes, damage, abilities, biography };
  let talents = [];
  let qualityNames = [];
  if (animal) {
    system.general = {
      subtype: animalSubtype(rawName, comp.coat, comp.description, comp.notes),
      attacks: attackHtml(comp.attack),
    };
    qualityNames = [...(comp.tags?.builtIn ?? []), ...(comp.tags?.acquired ?? [])].map(titleCase);
  } else {
    let archetype = "";
    if (comp.categoryId != null) {
      archetype = COMPADRE_CATEGORIES[comp.categoryId] ?? "";
      if (!archetype) warn("compadre-unknown-category", `${name}: category "${comp.categoryId}" is not known; left blank.`, `${path}.categoryId`);
    }
    system.general = { archetype };
    talents = setTalents(comp);
  }

  const plan = {
    saddlebagId: comp.id,
    kind: comp.kind,
    name,
    portraitId,
    accompanying: comp.accompanying !== false,
    actorData: { name, type: animal ? "animal" : "npc", system },
    talents,
    qualityNames,
    flag: {
      id: comp.id,
      characterId: typeof character?.id === "string" ? character.id : null,
      characterName: typeof character?.name === "string" ? character.name : null,
      importedAt,
      compadre: structuredClone(comp),
    },
  };
  return { plan, warnings };
}

function mapAttributes(comp, animal, name, warn, clamp) {
  const attributes = {};
  const damage = {};
  const names = animal ? ANIMAL_ATTRIBUTES : HUMAN_ATTRIBUTES;
  const cap = animal ? ANIMAL_ATTRIBUTE_CAP : HUMAN_ATTRIBUTE_CAP;
  for (const attr of names) {
    const src = comp.attributes?.[attr];
    const rawMax = isObject(src) ? (isNum(src.max) ? src.max : src.current) : null;
    if (!isNum(rawMax)) {
      warn("compadre-missing-attribute", `${name}: ${attr} is blank; the Foundry default was kept.`, `attributes.${attr}`);
      continue;
    }
    const max = clamp(rawMax, 0, cap, `attributes.${attr}.max`);
    const value = clamp(src.current ?? max, 0, max, `attributes.${attr}.current`, max);
    const track = ATTRIBUTE_TRACKS[attr];
    attributes[attr] = { value, max };
    damage[track] = { value: Math.min(max - value, animal ? ANIMAL_ATTRIBUTE_CAP : DAMAGE_CAPS[track]) };
  }
  return { attributes, damage };
}

function mapAbilities(comp, animal, warn, clamp, path) {
  const abilities = {};
  if (!isObject(comp.abilities)) return abilities;
  for (const [key, rank] of Object.entries(comp.abilities)) {
    const mapped = abilityKeyFromSaddlebag(key);
    if (!mapped) {
      warn("unknown-ability", `Ability "${key}" is not a known ability; skipped.`, `${path}.abilities.${key}`);
      continue;
    }
    if (animal && !ANIMAL_ABILITY_KEYS.includes(mapped)) continue;
    abilities[mapped] = { value: clamp(rank, 0, 5, `abilities.${key}`) };
  }
  return abilities;
}

/** `<p>NAME · damage N · crit N</p>`, or "" when the animal has no attack worth showing. */
function attackHtml(attack) {
  if (!isObject(attack)) return "";
  const label = text(attack.name);
  const damage = isNum(attack.damage) ? attack.damage : 0;
  const crit = isNum(attack.crit) ? attack.crit : 0;
  if (!label && damage === 0 && crit === 0) return "";
  return `<p>${escapeHtml(label || "Attack")} · damage ${damage} · crit ${crit}</p>`;
}

/**
 * Give every compadre a new id: `compadres[].id`, the holder of a compadre-held item and a compadre pardner.
 * @param {object} character
 * @param {Map<string,string>} idMap  old id -> new id. Ids not in the map are left alone.
 * @returns {object}  A deep clone; the input is not changed.
 */
export function remapCompadreIds(character, idMap) {
  const out = structuredClone(character);
  const swap = (id) => (idMap.has(id) ? idMap.get(id) : id);
  for (const comp of Array.isArray(out.compadres) ? out.compadres : []) {
    if (isObject(comp) && typeof comp.id === "string") comp.id = swap(comp.id);
  }
  for (const item of Array.isArray(out.items) ? out.items : []) {
    if (isObject(item?.holder) && item.holder.type === "compadre" && typeof item.holder.id === "string") {
      item.holder.id = swap(item.holder.id);
    }
  }
  if (isObject(out.pardner) && out.pardner.kind === "compadre" && typeof out.pardner.id === "string") {
    out.pardner.id = swap(out.pardner.id);
  }
  return out;
}
