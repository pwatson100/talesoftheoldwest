import { legacySaddlebagId, normaliseName } from "../../helpers/saddlebag/catalog.mjs";

const { DialogV2 } = foundry.applications.api;
const NS = "talesoftheoldwest";
const S = (key, data) => {
  const full = `TALESOFTHEOLDWEST.Saddlebag.${key}`;
  return data ? game.i18n.format(full, data) : game.i18n.localize(full);
};
const esc = (value) => foundry.utils.escapeHTML(String(value ?? ""));

/**
 * For a single horse from the import plan, determine which world animal actor to use (or create).
 *
 * - **Sure:** an animal actor already flagged with `saddlebagHorseId === horse.saddlebagId` →
 *   link silently, no dialog.
 * - **Candidates exist:** show a dialog with Use selected / Create new / Skip.
 * - **No candidates:** return `{ action: "create" }` immediately.
 *
 * @param {object} horse  A `horses[]` entry from the toFoundry plan.
 * @returns {Promise<{action: "existing"|"create"|"skip", actor?: Actor}>}
 */
export async function matchHorse(horse) {
  // Sure match: already flagged with this Saddlebag id.
  if (horse.saddlebagId) {
    const sure = game.actors.find(
      (a) =>
        a.type === "animal" &&
        (a.getFlag(NS, "saddlebagHorseId") === horse.saddlebagId || legacySaddlebagId(a.flags) === horse.saddlebagId),
    );
    if (sure) return { action: "existing", actor: sure };
  }

  // Collect candidates: visible horse-subtype animal actors.
  const normHorse = normaliseName(horse.name);
  const candidates = game.actors
    .filter((a) => {
      if (a.type !== "animal") return false;
      if (a.system.general?.subtype !== "horse") return false;
      return a.testUserPermission(game.user, "OBSERVER");
    })
    .sort((a, b) => {
      // Exact-name matches first, same-breed second.
      const aExact = normaliseName(a.name) === normHorse ? 0 : 1;
      const bExact = normaliseName(b.name) === normHorse ? 0 : 1;
      if (aExact !== bExact) return aExact - bExact;
      const aBreed = a.system.general?.breed === horse.breedKey ? 0 : 1;
      const bBreed = b.system.general?.breed === horse.breedKey ? 0 : 1;
      return aBreed - bBreed;
    });

  if (candidates.length === 0) return { action: "create" };

  // Show the match dialog.
  const options = candidates
    .map((a) => {
      const breed = a.system.general?.breed;
      const breedLabel = breed ? " (" + esc(breed) + ")" : "";
      return `<option value="${esc(a.id)}">${esc(a.name)}${breedLabel}</option>`;
    })
    .join("");

  let selectedId = candidates[0].id;

  const result = await DialogV2.wait({
    window: { title: S("HorseMatchTitle", { name: horse.name }), icon: "fa-solid fa-horse" },
    position: { width: 440 },
    content: `
      <p>${esc(S("HorseMatchPrompt", { name: horse.name }))}</p>
      <div class="form-group">
        <label>${esc(S("HorseMatchSelect"))}</label>
        <select name="actorId">${options}</select>
      </div>`,
    buttons: [
      {
        action: "use",
        label: S("HorseMatchUse"),
        icon: "fa-solid fa-link",
        default: true,
        callback: (_event, button) => {
          selectedId = button.form?.elements?.actorId?.value ?? candidates[0].id;
          return "use";
        },
      },
      { action: "create", label: S("HorseMatchCreate"), icon: "fa-solid fa-plus" },
      { action: "skip", label: S("HorseMatchSkip"), icon: "fa-solid fa-xmark" },
    ],
    rejectClose: false,
  });

  if (result === "use") {
    return { action: "existing", actor: game.actors.get(selectedId) ?? candidates[0] };
  }
  if (result === "create") return { action: "create" };
  // "skip" or dialog dismissed
  return { action: "skip" };
}
