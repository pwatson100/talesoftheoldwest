// PURE module: no Foundry globals, no DOM, no imports from the rest of the system.
// Reads one result of the Critical Injuries table without rolling any dice.
// Mirrors the extraction in totowActor#determineCritResults (module/documents/actor.mjs),
// but uses the healing roll Saddlebag recorded and leaves fatal dice unrolled.

const DICE = /\[\[(\d+d\d+)\]\]\s*(.*)/i;

const isNum = (v) => typeof v === "number" && Number.isFinite(v);

/** The text of one `<strong>Label</strong>: …` field, with tags removed. */
function extractField(html, label) {
  const pattern = new RegExp(String.raw`<strong>${label}</strong>:\s*([\s\S]*?)(?=(?:<p><strong>|<\/p>|$))`, "i");
  const match = pattern.exec(html ?? "");
  return match ? match[1].replace(/<[^<>]*>/g, "").trim() : "";
}

/**
 * @param {string} html            The table result text.
 * @param {number|null} healingRoll  The roll Saddlebag recorded for the healing time, if any.
 * @returns {{location: string, injury: string, fatal: boolean, instant: boolean, fatalPenalty: boolean,
 *            fatalDuration: string|null, fatalText: string|null,
 *            healingTime: string|null, immediateEffect: string, longTermEffect: string}}
 *   `fatalText` and `fatalDuration` are null when the injury is not fatal; `fatalDuration` keeps
 *   any dice as text (never rolled). `healingTime` is null when there is none (the caller supplies
 *   the localised "none").
 */
export function parseCritResult(html, healingRoll = null) {
  const location = extractField(html, "Location") || "Body";
  const injury = extractField(html, "Injury") || "Critical Injury";
  const rawFatal = extractField(html, "Fatal") || "No";
  const rawHealing = extractField(html, "Healing Time") || "-";
  const immediateEffect = extractField(html, "Immediate Effect") || "None";
  let longTermEffect = extractField(html, "Long-Term Effect") || extractField(html, "Long Term Effect") || "None";

  const fatal = /^yes/i.test(rawFatal);
  const instant = fatal && /instant/i.test(rawFatal);
  // Dice are shown as plain text (2d6), never rolled.
  const fatalText = fatal ? rawFatal.replace(/\[\[([^[\]]+)\]\]/g, "$1") : null;
  const fatalPenalty = fatal && !instant && /[-−]1/.test(rawFatal);
  let fatalDuration = null;
  if (fatal && !instant) {
    const dice = DICE.exec(rawFatal);
    fatalDuration = dice ? `${dice[1]} ${dice[2] ?? ""}`.trim() : rawFatal;
  }
  if (instant) longTermEffect = `<strong style="color: red;">${longTermEffect}</strong>`;

  let healingTime = null;
  if (rawHealing !== "-" && !/instant/i.test(rawFatal)) {
    const dice = DICE.exec(rawHealing);
    if (dice) {
      const amount = isNum(healingRoll) ? String(healingRoll) : dice[1];
      healingTime = `${amount} ${dice[2] ?? ""}`.trim();
    } else {
      healingTime = rawHealing;
    }
  }

  return {
    location,
    injury,
    fatal,
    instant,
    fatalPenalty,
    fatalDuration,
    fatalText,
    healingTime,
    immediateEffect,
    longTermEffect,
  };
}
