import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { openZip, readSaddlebagZip, createZipArchive, crc32, ZipError } from "../module/helpers/saddlebag/zip.mjs";

const fixturePath = (name) => fileURLToPath(new URL(`./fixtures/saddlebag/${name}`, import.meta.url));
const zipBytes = () => new Uint8Array(readFileSync(fixturePath("great-western.zip")));

test("openZip lists every file entry", () => {
  const names = openZip(zipBytes()).entries.map((e) => e.name).sort();
  assert.deepEqual(names, [
    "campaign.json",
    "characters/bluey.md",
    "characters/clem-hale.md",
    "characters/mr-green.md",
    "portraits/d1471d51-e5d0-4b33-89bb-96aca3a0711b.jpg",
  ]);
});

test("openZip reads deflated and stored entries and matches the originals", async () => {
  const zip = openZip(zipBytes());
  const md = await zip.readText("characters/clem-hale.md");
  assert.equal(md, readFileSync(fixturePath("clem-hale.md"), "utf8"));
  const jpg = await zip.read("portraits/d1471d51-e5d0-4b33-89bb-96aca3a0711b.jpg");
  assert.equal(jpg[0], 0xff);
  assert.equal(jpg[1], 0xd8);
});

test("openZip accepts an ArrayBuffer", () => {
  const bytes = zipBytes();
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  assert.equal(openZip(buffer).entries.length, 5);
});

test("openZip rejects things that are not zips", () => {
  assert.throws(() => openZip(new TextEncoder().encode("# not a zip at all, just some text to fill space")), (e) => e instanceof ZipError && e.code === "not-a-zip");
  assert.throws(() => openZip(new Uint8Array(0)), (e) => e.code === "not-a-zip");
});

test("openZip rejects a corrupt central directory", () => {
  const bytes = zipBytes().slice();
  const view = new DataView(bytes.buffer);
  let eocd = bytes.length - 22;
  while (view.getUint32(eocd, true) !== 0x06054b50) eocd--;
  const dir = view.getUint32(eocd + 16, true);
  view.setUint32(dir, 0, true);
  assert.throws(() => openZip(bytes), (e) => e.code === "corrupt-directory");
});

test("read reports a missing entry", async () => {
  await assert.rejects(openZip(zipBytes()).read("nope.txt"), (e) => e.code === "no-such-entry");
});

test("readSaddlebagZip returns the campaign, characters and portrait links", async () => {
  const { campaign, characters } = await readSaddlebagZip(zipBytes());
  assert.equal(campaign.name, "Great Western");
  assert.deepEqual(
    characters.map((c) => c.path),
    ["characters/bluey.md", "characters/clem-hale.md", "characters/mr-green.md"],
  );
  assert.ok(characters.every((c) => c.parsed.ok));
  assert.equal((await readSaddlebagZip(zipBytes())).campaignError, null);

  const clem = characters.find((c) => c.path.endsWith("clem-hale.md"));
  assert.equal(clem.portrait.entry, "portraits/d1471d51-e5d0-4b33-89bb-96aca3a0711b.jpg");
  assert.equal(clem.portrait.mime, "image/jpeg");
  assert.equal(clem.portrait.filename, "d1471d51-e5d0-4b33-89bb-96aca3a0711b.jpg");
  assert.equal(characters.find((c) => c.path.endsWith("bluey.md")).portrait, null);
});

test("readSaddlebagZip keeps a broken character as an error entry", async () => {
  // A zip with a single stored "characters/bad.md" entry, built by hand.
  const name = new TextEncoder().encode("characters/bad.md");
  const body = new TextEncoder().encode("no marker here");
  const local = new Uint8Array(30 + name.length + body.length);
  const lv = new DataView(local.buffer);
  lv.setUint32(0, 0x04034b50, true);
  lv.setUint16(26, name.length, true);
  lv.setUint32(18, body.length, true);
  lv.setUint32(22, body.length, true);
  local.set(name, 30);
  local.set(body, 30 + name.length);
  const central = new Uint8Array(46 + name.length);
  const cv = new DataView(central.buffer);
  cv.setUint32(0, 0x02014b50, true);
  cv.setUint32(20, body.length, true);
  cv.setUint32(24, body.length, true);
  cv.setUint16(28, name.length, true);
  central.set(name, 46);
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, 1, true);
  ev.setUint16(10, 1, true);
  ev.setUint32(12, central.length, true);
  ev.setUint32(16, local.length, true);
  const zip = new Uint8Array(local.length + central.length + end.length);
  zip.set(local, 0);
  zip.set(central, local.length);
  zip.set(end, local.length + central.length);

  const { characters } = await readSaddlebagZip(zip);
  assert.equal(characters.length, 1);
  assert.equal(characters[0].parsed.ok, false);
  assert.equal(characters[0].parsed.error, "no-marker");
});

test("readSaddlebagZip fails when the archive holds no characters", async () => {
  // Reuse the real zip but drop the characters by pointing at a zip with only the eocd.
  const empty = new Uint8Array(22);
  new DataView(empty.buffer).setUint32(0, 0x06054b50, true);
  await assert.rejects(readSaddlebagZip(empty), (e) => e.code === "no-characters");
});

/** Build a zip of stored (uncompressed) entries. */
function storedZip(files) {
  const enc = new TextEncoder();
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const [name, text] of Object.entries(files)) {
    const n = enc.encode(name);
    const b = enc.encode(text);
    const local = new Uint8Array(30 + n.length + b.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(26, n.length, true);
    lv.setUint32(18, b.length, true);
    lv.setUint32(22, b.length, true);
    local.set(n, 30);
    local.set(b, 30 + n.length);
    const central = new Uint8Array(46 + n.length);
    const cv = new DataView(central.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint32(20, b.length, true);
    cv.setUint32(24, b.length, true);
    cv.setUint16(28, n.length, true);
    cv.setUint32(42, offset, true);
    central.set(n, 46);
    locals.push(local);
    centrals.push(central);
    offset += local.length;
  }
  const centralSize = centrals.reduce((t, c) => t + c.length, 0);
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, centrals.length, true);
  ev.setUint16(10, centrals.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);
  return Uint8Array.from([...locals, ...centrals, end].flatMap((a) => [...a]));
}

const v4Character = readFileSync(fixturePath("v4/mr-green.md"), "utf8");

test("readSaddlebagZip reads a format 4 archive", async () => {
  const campaign = JSON.stringify({ app: "saddlebag", kind: "campaign", formatVersion: 4, campaign: { name: "Great Western", npcs: [] } });
  const { campaign: read, campaignError, characters } = await readSaddlebagZip(
    storedZip({ "campaign.json": campaign, "characters/mr-green.md": v4Character }),
  );
  assert.equal(read.name, "Great Western");
  assert.equal(campaignError, null);
  assert.equal(characters[0].parsed.ok, true);
});

test("readSaddlebagZip reports an unreadable campaign.json instead of hiding it", async () => {
  const result = await readSaddlebagZip(storedZip({ "campaign.json": "not json", "characters/mr-green.md": v4Character }));
  assert.equal(result.campaign, null);
  assert.equal(result.campaignError, "bad-json");
  assert.equal(result.characters[0].parsed.ok, true);
});

test("readSaddlebagZip exposes portraits that no character uses (campaign NPC portraits)", async () => {
  const { portraits, characters } = await readSaddlebagZip(
    storedZip({ "characters/mr-green.md": v4Character, "portraits/npc-1.jpg": "x", "portraits/npc-2.PNG": "y", "portraits/readme.txt": "z" }),
  );
  assert.deepEqual([...portraits.keys()].sort(), ["npc-1", "npc-2"]);
  assert.deepEqual(portraits.get("npc-1"), { entry: "portraits/npc-1.jpg", mime: "image/jpeg", filename: "npc-1.jpg" });
  assert.equal(portraits.get("npc-2").mime, "image/png");
  assert.equal(characters[0].portrait, null);
});

test("crc32 calculates standard IEEE 802.3 checksums", () => {
  assert.equal(crc32(new Uint8Array(0)), 0);
  assert.equal(crc32(new TextEncoder().encode("123456789")), 0xcbf43926);
});

test("createZipArchive builds a valid zip that openZip reads back", async () => {
  const mdContent = "# Test Character\n\nSome bio text";
  const jsonContent = JSON.stringify({ app: "saddlebag", kind: "campaign", formatVersion: 5 });
  const rawBytes = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

  const zipBuffer = await createZipArchive([
    { name: "campaign.json", data: jsonContent },
    { name: "characters/test.md", data: mdContent },
    { name: "portraits/test.bin", data: rawBytes },
  ]);

  const zip = openZip(zipBuffer);
  assert.deepEqual(zip.entries.map((e) => e.name).sort(), [
    "campaign.json",
    "characters/test.md",
    "portraits/test.bin",
  ]);
  assert.equal(await zip.readText("campaign.json"), jsonContent);
  assert.equal(await zip.readText("characters/test.md"), mdContent);
  assert.deepEqual(await zip.read("portraits/test.bin"), rawBytes);
});

test("createZipArchive accepts object map of files", async () => {
  const zipBuffer = await createZipArchive({
    "file1.txt": "hello world",
    "file2.txt": "another test",
  }, { compress: false });

  const zip = openZip(zipBuffer);
  assert.equal(await zip.readText("file1.txt"), "hello world");
  assert.equal(await zip.readText("file2.txt"), "another test");
  assert.ok(zip.entries.every((e) => e.method === 0));
});
