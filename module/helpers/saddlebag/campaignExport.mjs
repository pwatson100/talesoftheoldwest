// PURE module: no Foundry globals, no DOM.
// Assembles a Saddlebag campaign archive (campaign.json and characters/*.md files).

import { fromFoundry } from "./fromFoundry.mjs";
import { renderSaddlebagMarkdown } from "./markdown.mjs";
import { fileSlug } from "./shared.mjs";

const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

/** Remove anything between "<" and the next ">" in a single linear pass (no regex backtracking). */
function stripTags(text) {
  let out = "";
  let pos = 0;
  while (pos < text.length) {
    const open = text.indexOf("<", pos);
    if (open === -1) break;
    const close = text.indexOf(">", open + 1);
    if (close === -1) break; // unterminated "<": keep the remaining text as-is
    out += text.slice(pos, open);
    pos = close + 1;
  }
  return out + text.slice(pos);
}

/** Convert basic HTML biography to clean plain text. */
export function htmlToPlainText(html) {
  if (!html) return "";
  return stripTags(
    String(html)
      .replaceAll(/<br\s*\/?>/gi, "\n")
      .replaceAll(/<\/p>/gi, "\n\n")
  )
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#39;", "'")
    .trim();
}

/**
 * Format a campaign envelope for campaign.json (formatVersion 5).
 * @param {object} [campaignMeta]
 * @param {object[]} [npcs]
 * @param {{now?: string, uuid?: () => string}} [options]
 * @returns {object}
 */
export function buildCampaignEnvelope(campaignMeta = {}, npcs = [], options = {}) {
  const now = options.now ?? new Date().toISOString();
  const uuid = options.uuid ?? (() => globalThis.crypto.randomUUID());

  const meta = isObject(campaignMeta) ? campaignMeta : {};

  return {
    app: "saddlebag",
    kind: "campaign",
    formatVersion: 5,
    exportedAt: now,
    campaign: {
      formatVersion: 5,
      id: meta.id || uuid(),
      kind: "campaign",
      name: meta.name || "Campaign",
      notes: meta.notes ?? "",
      eraId: meta.eraId ?? "1873-rulebook",
      season: meta.season ?? { season: "spring", year: 1873 },
      settings: meta.settings ?? {
        holsterLimits: true,
        bulkRule: true,
        compadreLoadLimits: true,
        animalCompadres: true,
        drifterMode: false,
      },
      lodgings: Array.isArray(meta.lodgings) ? structuredClone(meta.lodgings) : [],
      createdAt: meta.createdAt ?? now,
      updatedAt: now,
      npcs: Array.isArray(npcs) ? npcs : [],
    },
  };
}

/**
 * Convert a Foundry NPC actor snapshot into a Saddlebag NPC record.
 * @param {object} snapshot
 * @param {{now?: string, uuid?: () => string}} [options]
 * @returns {object}
 */
export function npcSnapshotToSaddlebag(snapshot, options = {}) {
  const now = options.now ?? new Date().toISOString();
  const uuid = options.uuid ?? (() => globalThis.crypto.randomUUID());

  const flagNpc = snapshot.flag?.npc;
  if (isObject(flagNpc)) {
    const npc = structuredClone(flagNpc);
    npc.name = snapshot.name || npc.name || "Unnamed NPC";
    if (snapshot.portraitId !== undefined) {
      npc.portraitId = snapshot.portraitId;
    }
    return npc;
  }

  return {
    id: snapshot.flag?.id || snapshot.id || uuid(),
    name: snapshot.name || "Unnamed NPC",
    gender: null,
    genderNote: "",
    about: htmlToPlainText(snapshot.system?.biography ?? ""),
    description: "",
    portraitId: snapshot.portraitId ?? null,
    portraitFace: null,
    portraitPrompt: {
      outfit: "",
      hair: "",
      hairstyle: "",
      haircut: "",
      facialHair: "",
      expression: "",
      pose: "",
      background: "",
      tack: "",
      prompt: null,
      negative: null,
    },
    createdAt: now,
    notes: "",
  };
}

/**
 * Plan the export of a Saddlebag campaign archive.
 * @param {{campaign?: object, pcs?: object[], npcs?: object[]}} input
 * @param {{now?: string, uuid?: () => string}} [options]
 * @returns {{
 *   files: Array<{name: string, data: string}>,
 *   campaignEnvelope: object,
 *   characterEnvelopes: object[],
 *   warnings: Array<{actorName?: string, code: string, message: string}>
 * }}
 */
export function planCampaignExport(input = {}, options = {}) {
  const now = options.now ?? new Date().toISOString();
  const uuid = options.uuid ?? (() => globalThis.crypto.randomUUID());
  const warnings = [];

  const pcs = Array.isArray(input.pcs) ? input.pcs : [];
  const npcs = Array.isArray(input.npcs) ? input.npcs : [];

  // Determine campaign metadata from input or first flagged PC
  let campaignMeta = input.campaign;
  if (!campaignMeta) {
    const flaggedPc = pcs.find((p) => isObject(p.flag?.campaign));
    if (flaggedPc) {
      campaignMeta = flaggedPc.flag.campaign;
    }
  }

  const saddlebagNpcs = npcs.map((npcSnap) => npcSnapshotToSaddlebag(npcSnap, { now, uuid }));
  const campaignEnvelope = buildCampaignEnvelope(campaignMeta, saddlebagNpcs, { now, uuid });
  const campaignData = campaignEnvelope.campaign;

  const characterEnvelopes = [];
  const characterFiles = [];
  const usedSlugs = new Map();

  for (const pcSnap of pcs) {
    const { envelope, warnings: pcWarnings } = fromFoundry(pcSnap, { now, uuid });
    for (const w of pcWarnings) {
      warnings.push({ actorName: pcSnap.name, ...w });
    }

    // Ensure the character's campaign matches the exported campaign
    if (campaignData.id) {
      envelope.campaign = {
        formatVersion: campaignData.formatVersion,
        id: campaignData.id,
        kind: "campaign",
        name: campaignData.name,
        notes: campaignData.notes,
        eraId: campaignData.eraId,
        season: campaignData.season,
        settings: campaignData.settings,
        lodgings: campaignData.lodgings,
        createdAt: campaignData.createdAt,
        updatedAt: campaignData.updatedAt,
      };
      envelope.character.campaignId = campaignData.id;
    }

    characterEnvelopes.push(envelope);

    const baseSlug = fileSlug(pcSnap.name);
    const count = (usedSlugs.get(baseSlug) ?? 0) + 1;
    usedSlugs.set(baseSlug, count);
    const slug = count > 1 ? `${baseSlug}-${count}` : baseSlug;
    const filename = `characters/${slug}.md`;

    characterFiles.push({
      name: filename,
      data: renderSaddlebagMarkdown(envelope),
    });
  }

  const files = [
    {
      name: "campaign.json",
      data: JSON.stringify(campaignEnvelope, null, 1),
    },
    ...characterFiles,
  ];

  return {
    files,
    campaignEnvelope,
    characterEnvelopes,
    warnings,
  };
}
