// Foundry script macro: fix horse breeds.
//
// Horse actors that came from the Core Rules content all had their breed set
// to "americanquarter". This sets the breed from the actor's name
// (e.g. "Missouri Fox Trotter" -> "missourifoxtrotter").
//
// Paste into a new Script macro and run it as a GM. It reports what it would
// change first and asks before writing anything.
//
// Only `animal` actors with subtype "horse" and a current breed of
// "americanquarter" are changed, and only when the actor's name starts with a
// known breed name. Horses you have named yourself are left alone.
// Actors in locked compendium packs are reported but not changed.

(async () => {
  if (!game.user.isGM) return ui.notifications.warn("Only a GM can run this macro.");

  const BREEDS = [
    "americanquarter", "americansaddlebred", "appaloosa", "arabian", "cayuse", "criollo",
    "missourifoxtrotter", "morgan", "mustang", "paintpinto", "palomino", "tennesseewalker", "donkeymule",
  ];
  const squash = (s) => String(s ?? "").toLowerCase().replace(/[^a-z]/g, "");
  const breedFor = (name) => BREEDS.find((key) => squash(name).startsWith(key)) ?? null;

  /** @returns {string|null} the breed to set, or null when no change is needed. */
  const wanted = (actor) => {
    if (actor.type !== "animal" || actor.system.general.subtype !== "horse") return null;
    if (actor.system.general.breed !== "americanquarter") return null;
    const breed = breedFor(actor.name);
    return breed && breed !== "americanquarter" ? breed : null;
  };

  // Collect candidates: world actors, then every Actor compendium.
  const changes = [];
  for (const actor of game.actors) {
    const breed = wanted(actor);
    if (breed) changes.push({ actor, breed, where: "World", locked: false });
  }
  for (const pack of game.packs.filter((p) => p.documentName === "Actor")) {
    const docs = await pack.getDocuments();
    for (const actor of docs) {
      const breed = wanted(actor);
      if (breed) changes.push({ actor, breed, where: pack.metadata.label, locked: pack.locked });
    }
  }

  if (!changes.length) return ui.notifications.info("No horses need their breed fixed.");

  const esc = foundry.utils.escapeHTML;
  const rows = changes
    .map((c) => `<li>${esc(c.actor.name)} (${esc(c.where)}${c.locked ? ", LOCKED – skipped" : ""}) → <code>${c.breed}</code></li>`)
    .join("");
  const ok = await foundry.applications.api.DialogV2.confirm({
    window: { title: "Fix horse breeds" },
    content: `<p>${changes.length} horse(s) found:</p><ul>${rows}</ul><p>Apply the changes?</p>`,
    rejectClose: false,
  });
  if (!ok) return;

  let done = 0;
  for (const c of changes) {
    if (c.locked) continue;
    await c.actor.update({ "system.general.breed": c.breed });
    done++;
  }
  const skipped = changes.length - done;
  ui.notifications.info(`Fixed ${done} horse(s)${skipped ? `; ${skipped} in locked packs were skipped (unlock the pack and run again)` : ""}.`);
})();
