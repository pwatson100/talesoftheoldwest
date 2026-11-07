import { parseSaddlebagMarkdown } from "../../helpers/saddlebag/parse.mjs";
import { toFoundry } from "../../helpers/saddlebag/toFoundry.mjs";
import { toFoundryNpcs } from "../../helpers/saddlebag/npc.mjs";
import { readSaddlebagZip, ZipError } from "../../helpers/saddlebag/zip.mjs";
import {
  findExistingBySaddlebagId,
  findExistingNpc,
  importCharacter,
  importNpc,
  uploadPortrait,
  SaddlebagImportError,
} from "../../helpers/saddlebag/apply.mjs";
import { logger } from "../../helpers/logger.mjs";

const { DialogV2 } = foundry.applications.api;
const S = (key, data) => {
  const full = `TALESOFTHEOLDWEST.Saddlebag.${key}`;
  return data ? game.i18n.format(full, data) : game.i18n.localize(full);
};
const esc = (value) => foundry.utils.escapeHTML(String(value ?? ""));

async function pickFile() {
  const result = await DialogV2.prompt({
    window: { title: S("ImportTitle"), icon: "fa-solid fa-file-import" },
    content: `
      <p>${esc(S("ChooseFile"))}</p>
      <div class="form-group">
        <input type="file" name="file" accept=".md,.zip,text/markdown,text/plain,application/zip" autofocus>
      </div>`,
    ok: {
      label: S("Next"),
      icon: "fa-solid fa-arrow-right",
      callback: (_event, button) => {
        const file = button.form.elements.file?.files?.[0];
        if (!file) ui.notifications.warn(S("Error.no-file"));
        return file ?? null;
      },
    },
    rejectClose: false,
  });
  return result instanceof File ? result : null;
}

const isZip = (file) => /\.zip$/i.test(file.name) || file.type === "application/zip";

/** The small "has a portrait" icon shown beside an archive entry. */
function portraitIconHtml() {
  return `<i class="fa-solid fa-image" title="${esc(S("HasPortrait"))}"></i>`;
}

/**
 * Choose what to import from an archive: characters and campaign NPCs.
 * @param {object[]} characters
 * @param {{plan: object, existing: Actor|null}[]} npcs
 * @returns {Promise<{characters: object[], npcs: object[]}|null>}  null when nothing was chosen.
 */
async function pickFromArchive(characters, npcs) {
  const rows = characters
    .map((c, i) => {
      const errorText = c.parsed.ok ? "" : S(`Error.${c.parsed.error}`);
      const label = c.parsed.ok ? c.parsed.data.character.name || c.path : `${c.path} (${errorText})`;
      const portraitIcon = c.portrait ? portraitIconHtml() : "";
      return `<label class="checkbox" style="display: block;">
        <input type="checkbox" name="pick" value="${i}" ${c.parsed.ok ? "checked" : "disabled"}> ${esc(label)}
        ${portraitIcon}
      </label>`;
    })
    .join("");

  const canCreate = game.user.can("ACTOR_CREATE");
  const npcRows = npcs
    .map(({ plan, existing }, i) => {
      const allowed = existing ? existing.isOwner : canCreate;
      let status = "";
      if (existing) {
        const statusKey = existing.isOwner ? "NpcExisting" : "NpcNotOwner";
        status = ` <em>${esc(S(statusKey))}</em>`;
      }
      const portraitIcon = plan.portraitId ? portraitIconHtml() : "";
      return `<label class="checkbox" style="display: block;">
        <input type="checkbox" name="pickNpc" value="${i}" ${allowed ? "checked" : "disabled"}> ${esc(plan.name)}${status}
        ${portraitIcon}
      </label>`;
    })
    .join("");
  let npcSection = "";
  if (npcs.length) {
    const replaceNote = npcs.some((n) => n.existing)
      ? `<p class="hint">${esc(S("NpcReplaceNote"))}</p>`
      : "";
    npcSection = `<h4>${esc(S("NpcHeading"))}</h4>${npcRows}${replaceNote}`;
  }

  const result = await DialogV2.prompt({
    window: { title: S("ZipTitle"), icon: "fa-solid fa-file-zipper" },
    position: { width: 420 },
    content: `<p>${esc(S("ZipChoose"))}</p>${rows}${npcSection}`,
    ok: {
      label: S("Next"),
      icon: "fa-solid fa-arrow-right",
      callback: (_event, button) => ({
        characters: [...button.form.querySelectorAll("input[name=pick]:checked")].map((el) => characters[Number(el.value)]),
        npcs: [...button.form.querySelectorAll("input[name=pickNpc]:checked")].map((el) => npcs[Number(el.value)]),
      }),
    },
    rejectClose: false,
  });
  return result && (result.characters.length || result.npcs.length) ? result : null;
}

function warningList(warnings) {
  if (!warnings.length) return "";
  const items = warnings.map((w) => `<li>${esc(w.message)}</li>`).join("");
  return `<h4>${esc(S("Warnings"))} (${warnings.length})</h4>
    <ul style="max-height: 14em; overflow-y: auto; margin: 0; padding-left: 1.25em;">${items}</ul>`;
}

async function confirmPlan(plan, existing) {
  const canReplace = Boolean(existing?.isOwner);
  const row = (label, value) =>
    `<tr><th style="text-align: left; padding-right: 1em;">${esc(label)}</th><td>${esc(value)}</td></tr>`;
  const counts = [
    row(S("Archetype"), plan.actorData.system.general.archetype || "–"),
    row(S("Talents"), plan.talents.length),
    row(S("Weapons"), plan.weapons.length),
    row(S("Gear"), plan.gear.length),
    row(S("Injuries"), plan.injuries.length),
    row(S("Conditions"), plan.conditions.length),
    row(S("Horses"), plan.horses.length),
    row(S("Compadres"), plan.compadres.length),
  ].join("");

  let note = "";
  if (existing) {
    note = `<p><strong>${esc(S("ExistingNote", { name: existing.name }))}</strong></p>`;
    if (!canReplace) note += `<p>${esc(S("ExistingNotOwner"))}</p>`;
    else if (plan.compadres.length) note += `<p>${esc(S("CompadreReplaceNote"))}</p>`;
  }

  const buttons = [];
  if (existing) {
    if (canReplace) buttons.push({ action: "replace", label: S("Replace"), icon: "fa-solid fa-rotate", default: true });
    buttons.push({ action: "copy", label: S("ImportCopy"), icon: "fa-solid fa-copy", default: !canReplace });
  } else {
    buttons.push({ action: "new", label: S("Import"), icon: "fa-solid fa-file-import", default: true });
  }
  buttons.push({ action: "cancel", label: S("Cancel"), icon: "fa-solid fa-xmark" });

  const result = await DialogV2.wait({
    window: { title: `${S("ImportTitle")}: ${plan.actorName}`, icon: "fa-solid fa-file-import" },
    position: { width: 480 },
    content: `${note}<table>${counts}</table>${warningList(plan.warnings)}`,
    buttons,
    rejectClose: false,
  });
  return result === "cancel" ? null : (result ?? null);
}

function showError(err) {
  if (err instanceof SaddlebagImportError) {
    ui.notifications.error(S(`Error.${err.code}`), { console: false });
    return;
  }
  console.error("Saddlebag import failed", err);
  ui.notifications.error(S("Error.failed"), { console: false });
}

/**
 * Preview and import one parsed character.
 * @param {{ok: true, data: object}} parsed
 * @param {{zip: object, portrait: object|null, portraits: Map<string, object>}|null} [archive]  Where to fetch portraits from, for zip imports.
 */
async function importParsed(parsed, archive = null) {
  const plan = toFoundry(parsed.data.character, parsed.data.campaign, {
    dollarSign: game.settings.get("talesoftheoldwest", "dollar"),
    portraits: archive?.portraits,
  });
  const existing = findExistingBySaddlebagId(plan.flag.id);
  const canReplace = Boolean(existing?.isOwner);
  if (!canReplace && !game.user.can("ACTOR_CREATE")) {
    ui.notifications.error(S("Error.no-permission"), { console: false });
    return;
  }

  if (archive?.portrait) plan.warnings = plan.warnings.filter((w) => w.code !== "portrait-not-imported");

  const choice = await confirmPlan(plan, existing);
  if (!choice) return;

  let img = null;
  if (archive?.portrait) {
    img = await uploadPortrait(archive.zip, archive.portrait);
    if (!img) {
      plan.warnings.push({ code: "portrait-upload-failed", message: S("PortraitFailed") });
    }
  }

  // Compadre portraits: one failed upload warns and does not stop the import.
  const compadreImgs = {};
  const uploads = plan.compadres
    .map((c) => ({ c, portrait: c.portraitId ? archive?.portraits?.get(c.portraitId) : null }))
    .filter(({ portrait }) => portrait);
  const paths = await Promise.all(uploads.map(({ portrait }) => uploadPortrait(archive.zip, portrait)));
  uploads.forEach(({ c }, i) => {
    if (paths[i]) compadreImgs[c.saddlebagId] = paths[i];
    else plan.warnings.push({ code: "portrait-upload-failed", message: `${c.name}: ${S("PortraitFailed")}` });
  });

  const { actor, warnings } = await importCharacter(plan, {
    replace: choice === "replace" ? existing : null,
    asCopy: choice === "copy",
    img,
    compadreImgs,
  });

  ui.notifications.info(S("Imported", { name: actor.name }));
  if (warnings.length) {
    await DialogV2.prompt({
      window: { title: S("WarningsTitle", { name: actor.name }), icon: "fa-solid fa-triangle-exclamation" },
      position: { width: 480 },
      content: warningList(warnings),
      ok: { label: S("Close") },
      rejectClose: false,
    });
  }
  actor.sheet?.render({ force: true });
}

/**
 * Import the chosen campaign NPCs. A failure on one NPC is reported and does not stop the rest.
 * @param {{plan: object, existing: Actor|null}[]} chosen
 * @param {{zip: object, portraits: Map<string, object>}} archive
 */
async function importNpcs(chosen, archive) {
  // Each NPC is independent (a separate actor), so run them concurrently. Results keep the input order.
  const outcomes = await Promise.all(
    chosen.map(async ({ plan, existing }) => {
      try {
        const warn = [];
        let img = null;
        const portrait = plan.portraitId ? archive.portraits.get(plan.portraitId) : null;
        if (portrait) {
          img = await uploadPortrait(archive.zip, portrait);
          if (!img) warn.push({ code: "portrait-upload-failed", message: `${plan.name}: ${S("PortraitFailed")}` });
        }
        const result = await importNpc(plan, { replace: existing, img });
        return { name: result.actor.name, warnings: [...warn, ...result.warnings] };
      } catch (err) {
        showError(err);
        return null;
      }
    })
  );
  const done = outcomes.filter(Boolean);
  const names = done.map((o) => o.name);
  const warnings = done.flatMap((o) => o.warnings);
  if (names.length) ui.notifications.info(S("NpcsImported", { count: names.length }));
  if (warnings.length) {
    await DialogV2.prompt({
      window: { title: S("NpcWarningsTitle"), icon: "fa-solid fa-triangle-exclamation" },
      position: { width: 480 },
      content: warningList(warnings),
      ok: { label: S("Close") },
      rejectClose: false,
    });
  }
}

/**
 * Import a Saddlebag zip: read it, let the user pick characters and NPCs, then import the choices.
 * Characters go in one at a time, followed by the NPCs. A failure on one character does not stop the rest.
 * @param {File} file
 */
async function importZip(file) {
  let archive;
  try {
    archive = await readSaddlebagZip(await file.arrayBuffer());
  } catch (err) {
    if (!(err instanceof ZipError)) throw err;
    logger.warning(false, "Saddlebag zip failed", err);
    ui.notifications.error(S(err.code === "no-characters" ? "Error.zip-empty" : "Error.zip-bad"), { console: false });
    return;
  }
  if (archive.campaignError) {
    logger.warning(false, "Saddlebag campaign.json failed", archive.campaignError);
    ui.notifications.warn(S("CampaignFileUnreadable", { reason: S(`Error.${archive.campaignError}`) }));
  }
  const npcs = toFoundryNpcs(archive.campaign, { portraits: archive.portraits }).map((plan) => ({
    plan,
    existing: findExistingNpc(plan.saddlebagId),
  }));
  const chosen = await pickFromArchive(archive.characters, npcs);
  if (!chosen) return;
  await chosen.characters.reduce(
    (chain, entry) =>
      chain.then(async () => {
        try {
          await importParsed(entry.parsed, { zip: archive.zip, portrait: entry.portrait ?? null, portraits: archive.portraits });
        } catch (err) {
          showError(err);
        }
      }),
    Promise.resolve()
  );
  if (chosen.npcs.length) await importNpcs(chosen.npcs, archive);
}

export async function importFile() {
  try {
    const file = await pickFile();
    if (!file) return;

    if (isZip(file)) {
      await importZip(file);
      return;
    }

    const parsed = parseSaddlebagMarkdown(await foundry.utils.readTextFromFile(file));
    if (!parsed.ok) {
      logger.warning(false, "Saddlebag parse failed", parsed.error, parsed.detail ?? "");
      ui.notifications.error(S(`Error.${parsed.error}`), { console: false });
      return;
    }
    await importParsed(parsed);
  } catch (err) {
    showError(err);
  }
}

export function registerSaddlebagDirectoryButton() {
  Hooks.on("renderActorDirectory", (_app, element) => {
    const root = element instanceof HTMLElement ? element : element?.[0];
    if (!root || root.querySelector("[data-saddlebag-import]")) return;

    const button = document.createElement("button");
    button.type = "button";
    button.dataset.saddlebagImport = "true";
    button.innerHTML = `<i class="fa-solid fa-file-import"></i> ${esc(S("ImportButton"))}`;
    button.addEventListener("click", () => importFile());

    // The header markup is Foundry's. Fall back to the top of the tab if its action row is not found.
    const target = root.querySelector(".header-actions") ?? root.querySelector("header");
    if (target) target.append(button);
    else root.prepend(button);
  });
}
