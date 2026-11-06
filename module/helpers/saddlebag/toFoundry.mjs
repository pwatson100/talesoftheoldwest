// PURE module: no Foundry globals, no DOM. Its only link to the rest of the system is config.mjs, via catalog.mjs.
// Converts a Saddlebag character into a neutral import plan. It never talks to compendiums;
// it only produces names and references that apply.mjs resolves later.

import {
  ATTRIBUTE_TRACKS,
  CONDITION_IDS,
  DAMAGE_CAPS,
  WEAPON_ALIASES,
  GEAR_ALIASES,
  abilityKeyFromSaddlebag,
  archetypeFromSlug,
  breedKeyFromSlug,
  normaliseName,
} from "./catalog.mjs";

const MAX_HORSES = 3;
const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const isNum = (v) => typeof v === "number" && Number.isFinite(v);

const escapeHtml = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");

/** Plain text -> `<p>` paragraphs (blank-line separated; single newlines become `<br>`). */
function paragraphs(text) {
  return String(text ?? "")
    .replaceAll("\r\n", "\n")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p).replaceAll("\n", "<br>")}</p>`)
    .join("");
}

/** `easy-to-ride` -> `Easy To Ride`. */
const titleCase = (slug) =>
  String(slug)
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

/** A valid d66 result: two digits, each 1-6. */
const isD66 = (n) => Number.isInteger(n) && /^[1-6][1-6]$/.test(String(n));

export function toFoundry(character, campaign, options = {}) {
  const warnings = [];
  const warn = (code, message, path) => warnings.push(path === undefined ? { code, message } : { code, message, path });

  /** Round to an integer and clamp; warns when the value had to change. */
  const clamp = (raw, min, max, path, fallback = min) => {
    if (!isNum(raw)) return fallback;
    const rounded = Math.round(raw);
    const value = Math.min(max, Math.max(min, rounded));
    if (value !== raw) warn("clamped", `${path} was ${raw}; using ${value} (allowed ${min}-${max}).`, path);
    return value;
  };

  const c = isObject(character) ? character : {};
  const name = typeof c.name === "string" && c.name.trim() ? c.name.trim() : "Unnamed";
  const { attributes, damage } = setAttrs(c, warn, clamp);
  const abilities = setAbilities(c, warn, clamp);
  const archetype = setArchetype(c, warn);
  const xp = setXP(c, warn);
  const cash = setCash(c, warn, options);
  const yourpardner = setPardner(c, warn);
  const description = paragraphs(c.description);
  const backstory = paragraphs(c.backstory);
  const biographyHtml = description + (backstory ? `<h3>Backstory</h3>${backstory}` : "");
  const conditions = setConditions(c, warn);
  const injuries = setInjuries(c, warn);
  const talents = setTalents(c);
  const { weapons, gear } = setItems(c, warn);

  // Horses
  const horses = setHorses(c, warn);

  // Things that are kept only in the flag
  (c.compadres ?? []).forEach((comp, i) => {
    const compadreLabel = comp?.name || `#${i + 1}`;
    warn("unsupported-compadre", `Compadre "${compadreLabel}" is not imported; its shape is not yet supported.`, `compadres.${i}`);
  });
  if (c.advancement?.length) warn("advancement-not-imported", "Advancement entries are kept in the flag only.", "advancement");
  if (c.relationships?.length) warn("relationships-not-imported", "Relationships are kept in the flag only.", "relationships");
  if (c.portraitId) warn("portrait-not-imported", "The portrait is not part of a standalone .md file.", "portraitId");

  const actorData = {
    name,
    type: "pc",
    system: {
      biography: biographyHtml,
      general: {
        archetype,
        faith: c.faith?.text ?? "",
        bigdream: c.bigDream ?? "",
        yourpardner,
        cash,
        faithpoints: { value: clamp(c.faith?.points, 0, 10, "faith.points", 4) },
        age: { value: clamp(c.ageAtCreation, 0, Infinity, "ageAtCreation", 0) },
        fame: { value: clamp(c.fame, 0, Infinity, "fame", 0) },
        morals: { value: clamp(c.reputation?.morals, 1, 6, "reputation.morals", 3) },
        publicspirit: { value: clamp(c.reputation?.publicSpirit, 1, 6, "reputation.publicSpirit", 3) },
        xp: { value: xp },
      },
      attributes,
      abilities,
      damage,
    },
  };

  return {
    actorName: name,
    actorData,
    conditions,
    injuries,
    talents,
    weapons,
    gear,
    horses,
    compadres: [],
    biographyHtml,
    flag: {
      id: c.id ?? null,
      formatVersion: c.formatVersion ?? 1,
      importedAt: options.now ?? new Date().toISOString(),
      character: structuredClone(character),
      campaign: structuredClone(campaign),
    },
    warnings,
  };
}
function setHorses(c, warn) {
  const allHorses = Array.isArray(c.horses) ? c.horses : [];
  if (allHorses.length > MAX_HORSES) {
    warn("too-many-horses", `${allHorses.length} horses in the file; only the first ${MAX_HORSES} are imported.`, "horses");
  }
  const horses = allHorses.slice(0, MAX_HORSES).map((h, i) => {
    let breedKey = null;
    if (h.breedId) {
      breedKey = breedKeyFromSlug(h.breedId);
      if (!breedKey) {
        breedKey = "other";
        warn("unknown-breed", `Breed "${h.breedId}" is not known; using "other".`, `horses.${i}.breedId`);
      }
    }
    return {
      saddlebagId: h.id ?? null,
      name: h.name ?? "",
      breedKey,
      breedName: h.breedName ?? "",
      ridingModifier: isNum(h.ridingModifier) ? h.ridingModifier : 0,
      attributes: structuredClone(h.attributes ?? {}),
      abilities: structuredClone(h.abilities ?? {}),
      qualityNames: [...(h.tags?.builtIn ?? []), ...(h.tags?.acquired ?? [])].map(titleCase),
      isCurrentMount: Boolean(h.id) && h.id === c.currentMountId,
    };
  });
  return horses;
}

function setItems(c, warn) {
  const weapons = [];
  const gear = [];
  (c.items ?? []).forEach((item, i) => {
    const holder = isObject(item.holder) ? item.holder : { type: "pc", id: null, note: "" };
    const stored = holder.type !== "pc";
    if (holder.type === "horse") {
      warn("horse-held-gear", `"${item.name}" is carried by a horse; imported as stored because horses are not linked to items.`, `items.${i}`);
    } else if (stored && holder.type !== "elsewhere") {
      warn("held-by-other", `"${item.name}" is held by "${holder.type}"; imported as stored.`, `items.${i}`);
    }
    if (isObject(item.quiver) && item.quiver.loaded > 0) {
      warn("quiver-contents", `"${item.name}" has arrows in its quiver; quiver contents are not imported.`, `items.${i}`);
    }
    const norm = normaliseName(item.name);
    if (item.kind === "weapon") {
      weapons.push({
        bookId: item.bookId ?? null,
        name: item.name,
        aliasName: WEAPON_ALIASES[norm] ?? null,
        loaded: isNum(item.weapon?.loaded) ? item.weapon.loaded : 0,
        saddlebagItemId: item.id ?? null,
        holder: { type: holder.type, id: holder.id ?? null },
        stored,
        notes: item.notes ?? "",
      });
    } else {
      gear.push({
        bookId: item.bookId ?? null,
        name: item.name,
        aliasName: GEAR_ALIASES[norm] ?? null,
        quantity: isNum(item.quantity) ? Math.max(1, Math.round(item.quantity)) : 1,
        weight: isNum(item.weight) ? item.weight : null,
        custom: Boolean(item.custom),
        holder: { type: holder.type, id: holder.id ?? null },
        stored,
        saddlebagItemId: item.id ?? null,
        notes: item.notes ?? "",
      });
    }
  });
  return { weapons, gear };
}

function setTalents(c) {
  return (c.talents ?? []).map((t) => {
    const custom = Boolean(t.custom) || !t.talentId;
    const slug = custom ? "" : String(t.talentId);
    return {
      slug,
      reference: slug.replaceAll("-", ""),
      name: t.name ?? "",
      rank: t.rank === "advanced" ? "advanced" : "basic",
      custom,
      notes: t.notes ?? "",
    };
  });
}

function setInjuries(c, warn) {
  const injuries = [];
  for (const inj of c.injuries ?? []) {
    const roll = typeof inj?.roll === "number" ? inj.roll : Number.parseInt(inj?.roll, 10);
    if (!isD66(roll)) {
      warn("invalid-injury", `Injury roll "${inj?.roll}" is not a valid d66 result; skipped.`, "injuries");
      continue;
    }
    injuries.push({ saddlebagId: inj.id ?? null, roll, healingRoll: isNum(inj.healingRoll) ? inj.healingRoll : null });
  }
  return injuries;
}

function setConditions(c, warn) {
  const conditions = [];
  for (const id of c.conditions ?? []) {
    if (CONDITION_IDS.includes(id)) conditions.push(id);
    else warn("unknown-condition", `Condition "${id}" is not supported; skipped.`, "conditions");
  }
  return conditions;
}

function setPardner(c, warn) {
  let yourpardner = "";
  const pardner = c.pardner;
  if (isObject(pardner) && pardner.kind && pardner.kind !== "none") {
    yourpardner = typeof pardner.name === "string" ? pardner.name : "";
    if (pardner.kind !== "pc") {
      warn("unsupported-pardner", `Pardner kind "${pardner.kind}" has not been seen before; used its name only.`, "pardner");
    }
  }
  return yourpardner;
}

function setCash(c, warn, options) {
  const cents = Array.isArray(c.ledger) ? c.ledger.reduce((sum, e) => sum + (isNum(e?.amount) ? e.amount : 0), 0) : 0;
  if (cents < 0) warn("clamped", "Ledger total is negative; using 0.", "ledger");
  const cash = `${options.dollarSign ? "$" : ""}${(Math.max(0, cents) / 100).toFixed(2)}`;
  return cash;
}

function setXP(c, warn) {
  const earned = isNum(c.xp?.earned) ? c.xp.earned : 0;
  const spent = isNum(c.xp?.spent) ? c.xp.spent : 0;
  const rawXp = earned - spent;
  if (rawXp > 10) warn("xp-overflow", `Unspent XP is ${rawXp}; the sheet holds at most 10.`, "xp");
  else if (rawXp < 0) warn("clamped", `Unspent XP is ${rawXp}; using 0.`, "xp");
  const xp = Math.min(10, Math.max(0, Math.round(rawXp)));
  return xp;
}

function setArchetype(c, warn) {
  let archetype = "";
  if (c.creation?.archetypeId) {
    const match = archetypeFromSlug(c.creation.archetypeId);
    if (match) archetype = match;
    else warn("unknown-archetype", `Archetype "${c.creation.archetypeId}" has no match.`, "creation.archetypeId");
  }
  if (c.creation?.method && c.creation.method !== "archetype") {
    warn("creation-method", `Character was built by "${c.creation.method}"; stats map but the archetype is blank.`, "creation.method");
  }
  return archetype;
}

function setAbilities(c, warn, clamp) {
  const abilities = {};
  for (const [key, rank] of Object.entries(c.abilities ?? {})) {
    const mapped = abilityKeyFromSaddlebag(key);
    if (!mapped) {
      warn("unknown-ability", `Ability "${key}" is not a known ability; skipped.`, `abilities.${key}`);
      continue;
    }
    abilities[mapped] = { value: clamp(rank, 0, 5, `abilities.${key}`) };
  }
  return abilities;
}

function setAttrs(c, warn, clamp) {
  const attributes = {};
  const damage = {};
  for (const [attr, track] of Object.entries(ATTRIBUTE_TRACKS)) {
    const src = c.attributes?.[attr];
    if (!isObject(src) || !isNum(src.max)) {
      warn("missing-attribute", `Attribute ${attr} is missing.`, `attributes.${attr}`);
      continue;
    }
    const max = clamp(src.max, 0, 5, `attributes.${attr}.max`);
    const value = clamp(src.current ?? max, 0, 5, `attributes.${attr}.current`, max);
    let taken = max - value;
    if (taken < 0) {
      warn("clamped", `attributes.${attr}.current is above its maximum; no damage recorded.`, `attributes.${attr}`);
      taken = 0;
    }
    if (taken > DAMAGE_CAPS[track]) {
      warn("clamped", `damage.${track} was ${taken}; using ${DAMAGE_CAPS[track]}.`, `damage.${track}`);
      taken = DAMAGE_CAPS[track];
    }
    attributes[attr] = { value, max };
    damage[track] = { value: taken };
  }
  return { attributes, damage };
}

