// PURE module: no Foundry globals, no DOM. Small helpers shared by toFoundry.mjs, npc.mjs and compadre.mjs.

export const escapeHtml = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");

/** Plain text -> `<p>` paragraphs (blank-line separated; single newlines become `<br>`). */
export function paragraphs(text) {
  return String(text ?? "")
    .replaceAll("\r\n", "\n")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p).replaceAll("\n", "<br>")}</p>`)
    .join("");
}

/** `easy-to-ride` -> `Easy To Ride`. */
export const titleCase = (slug) =>
  String(slug)
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

/** The talents of a character-like object (`{ talents: [...] }`) as plan entries. */
export function setTalents(c) {
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
