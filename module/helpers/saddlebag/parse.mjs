// PURE module: no Foundry globals, no DOM, no imports from the rest of the system.
// Extracts and validates the `saddlebag:data` block of a Saddlebag export.

const MARKER = "<!-- saddlebag:data";
const CLOSE = "-->";
const SUPPORTED_FORMAT_VERSION = 4;

const fail = (error, detail) => (detail === undefined ? { ok: false, error } : { ok: false, error, detail });

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

const clean = (text) => String(text ?? "").replace(/^\uFEFF/, "").replaceAll("\r\n", "\n");

function parseJson(raw) {
  try {
    return { value: JSON.parse(raw) };
  } catch (err) {
    return { error: fail("bad-json", err.message) };
  }
}

function checkEnvelope(json) {
  if (!isObject(json)) return fail("bad-json", "Top-level value is not an object");
  if (json.app !== "saddlebag") return fail("wrong-app", String(json.app));
  const version = json.formatVersion;
  if (!Number.isInteger(version) || version > SUPPORTED_FORMAT_VERSION) {
    return fail("unsupported-version", String(version));
  }
  return null;
}

/**
 * Parse a Saddlebag Markdown export.
 * @param {string} text
 * @returns {{ok: true, data: object} | {ok: false, error: string, detail?: string}}
 */
export function parseSaddlebagMarkdown(text) {
  const source = clean(text);
  const markerIndex = source.indexOf(MARKER);
  if (markerIndex === -1) return fail("no-marker");

  const start = source.indexOf("{", markerIndex + MARKER.length);
  const end = source.lastIndexOf(CLOSE);
  if (start === -1 || end < start) return fail("bad-json", "Data block is truncated");

  const parsed = parseJson(source.slice(start, end));
  if (parsed.error) return parsed.error;
  const json = parsed.value;

  const envelopeError = checkEnvelope(json);
  if (envelopeError) return envelopeError;
  if (!isObject(json.character)) return fail("missing-character");
  if (!isObject(json.campaign)) return fail("missing-campaign");

  return {
    ok: true,
    data: {
      app: json.app,
      formatVersion: json.formatVersion,
      exportedAt: json.exportedAt ?? null,
      character: json.character,
      campaign: json.campaign,
      residence: json.residence ?? null,
    },
  };
}

/**
 * Validate the envelope of a Saddlebag `campaign.json` string.
 * @param {string} text
 * @returns {{ok: true, data: object} | {ok: false, error: string, detail?: string}}
 */
export function parseCampaignJson(text) {
  const parsed = parseJson(clean(text));
  if (parsed.error) return parsed.error;
  const json = parsed.value;

  const envelopeError = checkEnvelope(json);
  if (envelopeError) return envelopeError;
  if (json.kind !== "campaign" || !isObject(json.campaign)) return fail("missing-campaign");

  return {
    ok: true,
    data: {
      app: json.app,
      formatVersion: json.formatVersion,
      exportedAt: json.exportedAt ?? null,
      campaign: json.campaign,
    },
  };
}
