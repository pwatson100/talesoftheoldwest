// PURE module: no Foundry globals, no DOM.
// Converts a Saddlebag campaign's NPC list (`campaign.npcs`, format 4+; `notes` from format 5) into neutral import plans.
// Saddlebag NPCs carry no game statistics: a name, a one-line `about`, a `description`, an optional gender
// and an optional portrait. The whole original record is kept in the flag so nothing is lost.

import { escapeHtml, paragraphs } from "./shared.mjs";

const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const GENDER_LABEL = { male: "Male", female: "Female" };
const UNNAMED = "Unnamed NPC";

/**
 * @param {object|null} campaign  The `campaign` object from `campaign.json` (may be null or lack `npcs`).
 * @param {{now?: string, portraits?: {has(id: string): boolean}}} [options]  `portraits`: the portrait ids present in the archive.
 * @returns {{
 *   saddlebagId: string, name: string, portraitId: string|null,
 *   actorData: {name: string, type: "npc", system: {biography: string}},
 *   flag: {id: string, campaignId: string|null, campaignName: string|null, importedAt: string, npc: object},
 *   warnings: {code: string, message: string, path?: string}[]
 * }[]}
 */
export function toFoundryNpcs(campaign, options = {}) {
  const list = Array.isArray(campaign?.npcs) ? campaign.npcs : [];
  const importedAt = options.now ?? new Date().toISOString();
  const byId = new Map();

  list.forEach((npc, i) => {
    const path = `npcs.${i}`;
    if (typeof npc?.id !== "string" || !npc.id) return;
    if (byId.has(npc.id)) {
      // Keep the first; the warning travels with it.
      byId.get(npc.id).warnings.push({ code: "npc-duplicate-id", message: `Two NPCs share the id ${npc.id}; the second was skipped.`, path });
      return;
    }

    const warnings = [];
    const warn = (code, message, p = path) => warnings.push({ code, message, path: p });

    const name = setName(npc, warn);
    const gender = (npc.gender === "male" || npc.gender === "female") ? npc.gender : null;
    const about = typeof npc.about === "string" ? npc.about.trim() : "";
    const note = typeof npc.genderNote === "string" ? npc.genderNote.trim() : "";
    const parts = [];
    if (about) parts.push(`<p><strong>${escapeHtml(about)}</strong></p>`);
    if (gender) {
      const noteHtml = note ? " (" + escapeHtml(note) + ")" : "";
      parts.push(`<p>${GENDER_LABEL[gender]}${noteHtml}</p>`);
    }
    parts.push(paragraphs(npc.description), paragraphs(npc.notes));

    const portraitId = setPortraitId(npc, options, warn, name, path);

    byId.set(npc.id, {
      saddlebagId: npc.id,
      name,
      portraitId,
      actorData: { name, type: "npc", system: { biography: parts.join("") } },
      flag: {
        id: npc.id,
        campaignId: typeof campaign.id === "string" ? campaign.id : null,
        campaignName: typeof campaign.name === "string" ? campaign.name : null,
        importedAt,
        npc: structuredClone(npc),
      },
      warnings,
    });
  });

  return [...byId.values()];
}

function setPortraitId(npc, options, warn, name, path) {
  const portraitId = typeof npc.portraitId === "string" && npc.portraitId ? npc.portraitId : null;
  if (portraitId && options.portraits && !options.portraits.has(portraitId)) {
    warn("npc-portrait-missing", `${name}: the portrait is not in the archive; the default image was kept.`, `${path}.portraitId`);
  }
  return portraitId;
}

function setName(npc, warn) {
  const rawName = typeof npc.name === "string" ? npc.name.trim() : "";
  const name = rawName || UNNAMED;
  if (!rawName) warn("npc-unnamed", `An NPC has no name; it was called "${UNNAMED}".`);
  return name;
}

