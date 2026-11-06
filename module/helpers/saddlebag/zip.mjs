// PURE module: no Foundry globals, no DOM. Needs only `DecompressionStream`, which browsers and Node 18+ provide.
// A minimal zip reader plus the layout of a Saddlebag campaign archive.

import { parseCampaignJson, parseSaddlebagMarkdown } from "./parse.mjs";

const SIG_EOCD = 0x06054b50;
const SIG_CENTRAL = 0x02014b50;
const SIG_LOCAL = 0x04034b50;
const MAX_ENTRY_BYTES = 50 * 1024 * 1024;

const CHARACTER_PATH = /^characters\/([^/]+)\.md$/i;
const PORTRAIT_PATH = /^portraits\/([^/]+)\.(jpe?g|png|webp|gif)$/i;
const MIME = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif" };

export class ZipError extends Error {
  constructor(code, detail) {
    super(detail ? `${code}: ${detail}` : code);
    this.name = "ZipError";
    this.code = code;
  }
}

async function inflateRaw(bytes, expectedSize) {
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  const reader = stream.getReader();
  const chunks = [];
  let total = 0;
  let tooLarge = false;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > MAX_ENTRY_BYTES) {
      tooLarge = true;
      break;
    }
    chunks.push(value);
  }
  if (tooLarge) {
    await reader.cancel();
    throw new ZipError("too-large");
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  if (out.length !== expectedSize) throw new ZipError("size-mismatch");
  return out;
}

/**
 * Open a zip archive held in memory.
 * Supports stored and deflated entries. Zip64, encryption and multi-disk archives are rejected.
 * @param {ArrayBuffer|Uint8Array} buffer
 * @returns {{entries: {name: string, size: number, method: number}[], has(name): boolean,
 *            read(name): Promise<Uint8Array>, readText(name): Promise<string>}}
 */
export function openZip(buffer) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  // The end-of-central-directory record is at least 22 bytes and may be followed by a comment (<= 65535).
  let eocd = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 22 - 0xffff); i--) {
    if (view.getUint32(i, true) === SIG_EOCD) {
      eocd = i;
      break;
    }
  }
  if (eocd === -1) throw new ZipError("not-a-zip");

  const count = view.getUint16(eocd + 10, true);
  const dirOffset = view.getUint32(eocd + 16, true);
  if (count === 0xffff || dirOffset === 0xffffffff) throw new ZipError("zip64-unsupported");

  const decoder = new TextDecoder("utf-8");
  const entries = new Map();
  let p = dirOffset;
  for (let n = 0; n < count; n++) {
    if (p + 46 > bytes.length || view.getUint32(p, true) !== SIG_CENTRAL) throw new ZipError("corrupt-directory");
    const flags = view.getUint16(p + 8, true);
    const method = view.getUint16(p + 10, true);
    const compressedSize = view.getUint32(p + 20, true);
    const size = view.getUint32(p + 24, true);
    const nameLength = view.getUint16(p + 28, true);
    const extraLength = view.getUint16(p + 30, true);
    const commentLength = view.getUint16(p + 32, true);
    const localOffset = view.getUint32(p + 42, true);
    const name = decoder.decode(bytes.subarray(p + 46, p + 46 + nameLength));
    p += 46 + nameLength + extraLength + commentLength;
    if (name.endsWith("/")) continue; // directory entry
    entries.set(name, { name, size, method, compressedSize, localOffset, encrypted: Boolean(flags & 1) });
  }

  async function read(name) {
    const entry = entries.get(name);
    if (!entry) throw new ZipError("no-such-entry", name);
    if (entry.encrypted) throw new ZipError("encrypted", name);
    if (entry.size > MAX_ENTRY_BYTES) throw new ZipError("too-large", name);
    const o = entry.localOffset;
    if (o + 30 > bytes.length || view.getUint32(o, true) !== SIG_LOCAL) throw new ZipError("corrupt-entry", name);
    const start = o + 30 + view.getUint16(o + 26, true) + view.getUint16(o + 28, true);
    const data = bytes.subarray(start, start + entry.compressedSize);
    if (data.length !== entry.compressedSize) throw new ZipError("corrupt-entry", name);
    if (entry.method === 0) return data.slice();
    if (entry.method === 8) return inflateRaw(data, entry.size);
    throw new ZipError("unsupported-method", `${name} (${entry.method})`);
  }

  return {
    entries: [...entries.values()].map(({ name, size, method }) => ({ name, size, method })),
    has: (name) => entries.has(name),
    read,
    readText: async (name) => new TextDecoder("utf-8").decode(await read(name)),
  };
}

/**
 * Read a Saddlebag campaign archive: `campaign.json`, `characters/*.md` and `portraits/<portraitId>.<ext>`.
 * A character that fails to parse is listed with its error instead of failing the whole archive.
 * @param {ArrayBuffer|Uint8Array} buffer
 * @returns {Promise<{
 *   campaign: object|null,
 *   characters: {path: string, parsed: object, portrait: {entry: string, mime: string, filename: string}|null}[],
 *   zip: ReturnType<typeof openZip>
 * }>}
 */
export async function readSaddlebagZip(buffer) {
  const zip = openZip(buffer);

  const portraits = new Map();
  for (const { name } of zip.entries) {
    const m = PORTRAIT_PATH.exec(name);
    if (m) portraits.set(m[1], { entry: name, mime: MIME[m[2].toLowerCase()], filename: `${m[1]}.${m[2].toLowerCase()}` });
  }

  let campaign = null;
  if (zip.has("campaign.json")) {
    const result = parseCampaignJson(await zip.readText("campaign.json"));
    if (result.ok) campaign = result.data.campaign;
  }

  const characterEntries = zip.entries.filter(({ name }) => CHARACTER_PATH.test(name));
  const characters = await Promise.all(
    characterEntries.map(async ({ name }) => {
      const parsed = parseSaddlebagMarkdown(await zip.readText(name));
      const portraitId = parsed.ok ? parsed.data.character.portraitId : null;
      return { path: name, parsed, portrait: (portraitId && portraits.get(portraitId)) || null };
    }),
  );
  characters.sort((a, b) => a.path.localeCompare(b.path));

  if (!characters.length) throw new ZipError("no-characters");
  return { campaign, characters, zip };
}
