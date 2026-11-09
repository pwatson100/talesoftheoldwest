import { actorCampaignInfo, detectCampaigns, exportCampaign } from "../../helpers/saddlebag/apply.mjs";

const { DialogV2 } = foundry.applications.api;
const { renderTemplate } = foundry.applications.handlebars;
const TEMPLATE = "systems/talesoftheoldwest/templates/dialog/saddlebag/export-campaign.hbs";

const S = (key, data) =>
  data ? game.i18n.format(`TALESOFTHEOLDWEST.Saddlebag.Export.${key}`, data) : game.i18n.localize(`TALESOFTHEOLDWEST.Saddlebag.Export.${key}`);

/**
 * Open the Saddlebag Campaign Export dialog.
 * Scans world actors, groups them by detected campaign, and exports a campaign ZIP.
 */
const NS = "talesoftheoldwest";

export async function exportCampaignDialog() {
  const allPcs = game.actors.filter((a) => a.type === "pc");
  // Compadres belong to their PC and export inside the character's markdown file; exclude them from campaign NPCs.
  const allNpcs = game.actors.filter((a) => a.type === "npc" && !a.getFlag(NS, "saddlebagCompadre"));

  if (!allPcs.length && !allNpcs.length) {
    ui.notifications.warn(game.i18n.localize("TALESOFTHEOLDWEST.Saddlebag.Error.export-no-actors"));
    return null;
  }

  const detectedCampaigns = detectCampaigns();
  const defaultCampaign = detectedCampaigns[0] ?? null;
  const initialCampaignId = defaultCampaign?.id ?? "custom";
  const initialCampaignName = defaultCampaign?.name ?? game.world.title ?? "My Campaign";

  const campaigns = detectedCampaigns.map((c) => ({
    id: c.id,
    name: c.name,
    pcCount: c.pcCount,
    npcCount: c.npcCount,
    selected: c.id === initialCampaignId,
  }));

  const actorRows = (actors) => {
    const rows = actors.map((actor) => {
      const info = actorCampaignInfo(actor);
      const campaignId = info?.id ?? null;
      return {
        id: actor.id,
        name: actor.name,
        campaignId: campaignId ?? "",
        badge: info?.name ?? "",
        visible: initialCampaignId === "custom" || campaignId === initialCampaignId,
      };
    });
    return { rows, visible: rows.filter((r) => r.visible).length };
  };
  const pcs = actorRows(allPcs);
  const npcs = actorRows(allNpcs);

  const content = await renderTemplate(TEMPLATE, {
    campaigns,
    customSelected: initialCampaignId === "custom",
    campaignName: initialCampaignName,
    pcs: pcs.rows,
    visiblePcs: pcs.visible,
    npcs: npcs.rows,
    visibleNpcs: npcs.visible,
  });

  return DialogV2.prompt({
    window: { title: S("DialogTitle"), icon: "fa-solid fa-file-export" },
    position: { width: 440 },
    content,
    render: (event) => {
      const root = event?.target?.element ?? (event?.target instanceof HTMLElement ? event.target : null);
      if (!root) return;

      const updateCounts = () => {
        const visiblePcs = [...root.querySelectorAll(".actor-row[data-actor-type=pc]")].filter((el) => el.style.display !== "none");
        const checkedPcs = visiblePcs.filter((el) => el.querySelector("input[name=pcPick]")?.checked);
        const pcCountEl = root.querySelector(".pc-count");
        if (pcCountEl) {
          pcCountEl.textContent = `${checkedPcs.length}/${visiblePcs.length}`;
        }

        const visibleNpcs = [...root.querySelectorAll(".actor-row[data-actor-type=npc]")].filter((el) => el.style.display !== "none");
        const checkedNpcs = visibleNpcs.filter((el) => el.querySelector("input[name=npcPick]")?.checked);
        const npcCountEl = root.querySelector(".npc-count");
        if (npcCountEl) {
          npcCountEl.textContent = `${checkedNpcs.length}/${visibleNpcs.length}`;
        }
      };

      const select = root.querySelector("select[name=campaignSelect]");
      const nameInput = root.querySelector("input[name=campaignName]");
      const filterCb = root.querySelector("input[name=filterByCampaign]");

      const applyFilter = (checkMatching = false) => {
        const selectedId = select?.value ?? "custom";
        const shouldFilter = filterCb ? filterCb.checked : true;

        // Filter PC rows
        root.querySelectorAll(".actor-row[data-actor-type=pc]").forEach((row) => {
          const campId = row.dataset.campaignId;
          const matches = selectedId === "custom" || campId === selectedId;
          const isVisible = !shouldFilter || matches;
          row.style.display = isVisible ? "flex" : "none";
          if (checkMatching) {
            const cb = row.querySelector("input[name=pcPick]");
            if (cb) cb.checked = matches;
          }
        });

        // Filter NPC rows
        root.querySelectorAll(".actor-row[data-actor-type=npc]").forEach((row) => {
          const campId = row.dataset.campaignId;
          const matches = selectedId === "custom" || campId === selectedId;
          const isVisible = !shouldFilter || matches;
          row.style.display = isVisible ? "flex" : "none";
          if (checkMatching) {
            const cb = row.querySelector("input[name=npcPick]");
            if (cb) cb.checked = matches;
          }
        });

        updateCounts();
      };

      root.addEventListener("change", (e) => {
        if (e.target.name === "pcPick" || e.target.name === "npcPick") {
          updateCounts();
        } else if (e.target.name === "filterByCampaign") {
          applyFilter(false);
        }
      });

      if (select) {
        select.addEventListener("change", () => {
          const selectedId = select.value;
          const matchedCamp = detectedCampaigns.find((c) => c.id === selectedId);

          if (matchedCamp && nameInput) {
            nameInput.value = matchedCamp.name;
          } else if (nameInput && selectedId === "custom") {
            nameInput.value = game.world.title || "My Campaign";
          }

          applyFilter(true);
        });
      }
    },
    ok: {
      label: S("ExportButton"),
      icon: "fa-solid fa-download",
      callback: async (event, button, dialog) => {
        const form = button?.form ?? dialog?.element?.querySelector("form") ?? dialog?.element ?? (button instanceof HTMLElement ? button.closest("form") : null);
        if (!form) return null;
        const campaignSelect = form.querySelector("select[name=campaignSelect]")?.value;
        const campaignName = form.querySelector("input[name=campaignName]")?.value?.trim() || "Campaign";
        const season = form.querySelector("select[name=season]")?.value || "spring";
        const year = Number(form.querySelector("input[name=year]")?.value) || 1873;
        const includePortraits = Boolean(form.querySelector("input[name=includePortraits]")?.checked);

        const chosenPcs = [...form.querySelectorAll("input[name=pcPick]:checked")]
          .map((el) => game.actors.get(el.value))
          .filter(Boolean);

        const chosenNpcs = [...form.querySelectorAll("input[name=npcPick]:checked")]
          .map((el) => game.actors.get(el.value))
          .filter(Boolean);

        if (!chosenPcs.length && !chosenNpcs.length) {
          ui.notifications.warn(S("NoActorsSelected"));
          return null;
        }

        const matchedCamp = detectedCampaigns.find((c) => c.id === campaignSelect);
        const campaignMeta = matchedCamp?.campaignMeta ? foundry.utils.deepClone(matchedCamp.campaignMeta) : {};
        campaignMeta.name = campaignName;
        campaignMeta.season = { season, year };
        if (campaignSelect && campaignSelect !== "custom") {
          campaignMeta.id = campaignSelect;
        }

        return exportCampaign({
          campaign: campaignMeta,
          pcs: chosenPcs,
          npcs: chosenNpcs,
          includePortraits,
        });
      },
    },
    rejectClose: false,
  });
}
