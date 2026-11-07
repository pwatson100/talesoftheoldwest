// PURE module: no Foundry globals, no DOM. Its only link to the rest of the system is config.mjs, via catalog.mjs.
// Renders the Saddlebag Markdown export: a short human-readable body (names and numbers only,
// never rules text) followed by the `saddlebag:data` block that Saddlebag reads back.

import { ABILITY_ATTRIBUTE, ABILITY_KEYS, ATTRIBUTE_TRACKS, abilityKeyToSaddlebag } from "./catalog.mjs";

const isNum = (v) => typeof v === "number" && Number.isFinite(v);

const cap = (s) => String(s).charAt(0).toUpperCase() + String(s).slice(1);

/** `ranch-hand` -> `Ranch Hand`. */
const titleCase = (slug) =>
  String(slug ?? "")
    .split("-")
    .filter(Boolean)
    .map(cap)
    .join(" ");

const money = (cents) => `${cents < 0 ? "-" : ""}$${(Math.abs(cents) / 100).toFixed(2)}`;

/** One-line text: collapse newlines so a value cannot break out of its table cell or bullet. */
const oneLine = (s) => String(s ?? "").replace(/\s+/g, " ").trim();

/** `-->` inside the JSON would close the HTML comment early. */
export function escapeCommentClose(json) {
  return json.replaceAll("-->", String.raw`--\u003e`);
}

function body(c) {
  const out = [];
  out.push(`# ${oneLine(c.name)}`, "");
  const archetype = c.creation?.archetypeId ? titleCase(c.creation.archetypeId) : "";
  const parts = [archetype, isNum(c.ageAtCreation) ? `age ${c.ageAtCreation}` : ""].filter(Boolean);
  if (parts.length) out.push(parts.join(" · "), "");
  if (c.description) out.push(`> ${oneLine(c.description)}`, "");
  addAttrs(out, c);
  addTalents(c, out);
  addDescriptives(out, c);
  addInjuries(out, c);
  addWeapons(c, out);
  addGear(c, out);
  addHorses(c, out);
  addMoneyXP(c, out);
  return out.join("\n");
}

function addMoneyXP(c, out) {
  const cents = (c.ledger ?? []).reduce((sum, e) => sum + (isNum(e?.amount) ? e.amount : 0), 0);
  out.push("## Money and living", "", `- **Cash in hand:** ${money(cents)}`, `- **In the bank:** ${money(isNum(c.bank) ? c.bank : 0)}`, "");
  const earned = c.xp?.earned ?? 0;
  const spent = c.xp?.spent ?? 0;
  out.push("## Experience", "", `- **XP:** ${earned} earned, ${spent} spent, ${earned - spent} unspent`, "");
}

function addAttrs(out, c) {
  out.push("## Attributes", "", "| Grit | Quick | Cunning | Docity | Faith |", "|---|---|---|---|---|");
  const cells = Object.keys(ATTRIBUTE_TRACKS).map((a) => {
    const at = c.attributes?.[a] ?? {};
    return `${at.current ?? at.max ?? 0}/${at.max ?? 0}`;
  });
  const faithCell = `${c.faith?.points ?? 0}/10`;
  out.push(`| ${[...cells, faithCell].join(" | ")} |`, "", "## Abilities", "", "| Ability | Attribute | Rank | Dice |", "|---|---|---|---|");
  for (const key of ABILITY_KEYS) {
    const attr = ABILITY_ATTRIBUTE[key];
    const rank = c.abilities?.[abilityKeyToSaddlebag(key)] ?? 0;
    const base = c.attributes?.[attr]?.current ?? c.attributes?.[attr]?.max ?? 0;
    out.push(`| ${titleCase(abilityKeyToSaddlebag(key))} | ${cap(attr)} | ${rank} | ${base + rank}D |`);
  }
  out.push("");
}

function addInjuries(out, c) {
  out.push("", "## Injuries and conditions", "");
  const injuries = (c.injuries ?? []).map((i) => `- Critical injury #${i.roll}`);
  const conditions = (c.conditions ?? []).map((id) => `- ${titleCase(id)}`);
  out.push(...(injuries.length || conditions.length ? [...injuries, ...conditions] : ["None."]), "");
}

function addDescriptives(out, c) {
  out.push("## Fame, Reputation and Faith", "", `- **Fame:** ${c.fame ?? 0}`, `- **Reputation:** ${c.reputation?.morals ?? 0} · ${c.reputation?.publicSpirit ?? 0}`);
  if (c.faith?.text) out.push(`- **Faith:** ${oneLine(c.faith.text)}`);
  if (c.bigDream) out.push(`- **Big Dream:** ${oneLine(c.bigDream)}`);
  if (c.pardner?.name) out.push(`- **Pardner:** ${oneLine(c.pardner.name)}`);
}

function addTalents(c, out) {
  if (c.talents?.length) {
    out.push("## Talents", "");
    for (const t of c.talents) out.push(`- **${oneLine(t.name)}** (${cap(t.rank ?? "basic")})`);
    out.push("");
  }
}

function addHorses(c, out) {
  if (c.horses?.length) {
    out.push("## Posse", "");
    for (const h of c.horses) {
      const mount = h.id && h.id === c.currentMountId ? ", current mount" : "";
      out.push(`- **${oneLine(h.name)}** (${oneLine(h.breedName)}${mount})`);
    }
    out.push("");
  }
}

function addGear(c, out) {
  const gear = (c.items ?? []).filter((i) => i.kind !== "weapon");
  if (gear.length) {
    out.push("## Gear", "");
    for (const g of gear) {
      const quantitySuffix = g.quantity > 1 ? " ×" + g.quantity : "";
      out.push(`- ${oneLine(g.name)}${quantitySuffix}`);
    }
    out.push("");
  }
}

function addWeapons(c, out) {
  const weapons = (c.items ?? []).filter((i) => i.kind === "weapon");
  if (weapons.length) {
    out.push("## Weapons", "");
    for (const w of weapons) {
      const capacity = w.weapon?.capacity;
      const capacitySuffix = isNum(capacity) && capacity > 0 ? "/" + capacity : "";
      out.push(`- **${oneLine(w.name)}** · loaded ${w.weapon?.loaded ?? 0}${capacitySuffix}`);
    }
    out.push("");
  }
}

/**
 * @param {object} envelope  `{app, formatVersion, exportedAt, character, campaign, residence}`
 * @returns {string} The complete `.md` file.
 */
export function renderSaddlebagMarkdown(envelope) {
  const json = escapeCommentClose(JSON.stringify(envelope, null, 1));
  const exported = new Date(envelope.exportedAt ?? Date.now()).toUTCString().slice(5, 16);
  return [
    body(envelope.character),
    "---",
    `*Exported from Foundry VTT (Tales of the Old West system), ${exported}.*`,
    "",
    "<!-- saddlebag:data v1",
    "This block lets Saddlebag open this file again. Leave it as it is.",
    json,
    "-->",
    "",
  ].join("\n");
}
