import { parseSaddlebagMarkdown } from "../../helpers/saddlebag/parse.mjs";
import { toFoundry } from "../../helpers/saddlebag/toFoundry.mjs";
import { readSaddlebagZip, ZipError } from "../../helpers/saddlebag/zip.mjs";
import {
  findExistingBySaddlebagId,
  importCharacter,
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

async function pickCharacters(characters) {
  const rows = characters
    .map((c, i) => {
      const errorText = c.parsed.ok ? "" : S(`Error.${c.parsed.error}`);
      const label = c.parsed.ok ? c.parsed.data.character.name || c.path : `${c.path} (${errorText})`;
      return `<label class="checkbox" style="display: block;">
        <input type="checkbox" name="pick" value="${i}" ${c.parsed.ok ? "checked" : "disabled"}> ${esc(label)}
        ${c.portrait ? `<i class="fa-solid fa-image" title="${esc(S("HasPortrait"))}"></i>` : ""}
      </label>`;
    })
    .join("");
  const result = await DialogV2.prompt({
    window: { title: S("ZipTitle"), icon: "fa-solid fa-file-zipper" },
    position: { width: 420 },
    content: `<p>${esc(S("ZipChoose"))}</p>${rows}`,
    ok: {
      label: S("Next"),
      icon: "fa-solid fa-arrow-right",
      callback: (_event, button) =>
        [...button.form.querySelectorAll("input[name=pick]:checked")].map((el) => characters[Number(el.value)]),
    },
    rejectClose: false,
  });
  return Array.isArray(result) && result.length ? result : null;
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
  ].join("");

  let note = "";
  if (existing) {
    note = `<p><strong>${esc(S("ExistingNote", { name: existing.name }))}</strong></p>`;
    if (!canReplace) note += `<p>${esc(S("ExistingNotOwner"))}</p>`;
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
 * @param {{zip: object, portrait: object}|null} [archive]  Where to fetch the portrait from, for zip imports.
 */
async function importParsed(parsed, archive = null) {
  const plan = toFoundry(parsed.data.character, parsed.data.campaign, {
    dollarSign: game.settings.get("talesoftheoldwest", "dollar"),
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

  const { actor, warnings } = await importCharacter(plan, {
    replace: choice === "replace" ? existing : null,
    asCopy: choice === "copy",
    img,
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

export async function importFile() {
  try {
    const file = await pickFile();
    if (!file) return;

    if (isZip(file)) {
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
      const chosen = await pickCharacters(archive.characters);
      if (!chosen) return;
      await chosen.reduce(
        (chain, entry) =>
          chain.then(async () => {
            try {
              await importParsed(entry.parsed, entry.portrait ? { zip: archive.zip, portrait: entry.portrait } : null);
            } catch (err) {
              showError(err);
            }
          }),
        Promise.resolve()
      );
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
