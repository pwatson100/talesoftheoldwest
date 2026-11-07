import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseSaddlebagMarkdown, parseCampaignJson } from "../module/helpers/saddlebag/parse.mjs";

const fixture = (name) =>
  readFileSync(fileURLToPath(new URL(`./fixtures/saddlebag/${name}.md`, import.meta.url)), "utf8");

const marker = (json) =>
  `# Test\n\n<!-- saddlebag:data v1\nThis block lets Saddlebag open this file again. Leave it as it is.\n${json}\n-->\n`;

const envelope = (overrides = {}) => ({
  app: "saddlebag",
  formatVersion: 1,
  exportedAt: "2026-01-01T00:00:00.000Z",
  character: { id: "c1", name: "Test" },
  campaign: { id: "k1" },
  ...overrides,
});

test("parses the Clem Hale fixture", () => {
  const result = parseSaddlebagMarkdown(fixture("clem-hale"));
  assert.equal(result.ok, true);
  assert.equal(result.data.character.name, "Clem Hale");
  assert.equal(result.data.campaign.name, "Great Western");
  assert.equal(result.data.formatVersion, 1);
});

test("parses the Bluey fixture", () => {
  const result = parseSaddlebagMarkdown(fixture("bluey"));
  assert.equal(result.ok, true);
  assert.equal(result.data.character.name, "Bluey");
  assert.deepEqual(result.data.character.conditions, ["starving"]);
});

test("fails with no-marker when the marker is absent", () => {
  assert.deepEqual(parseSaddlebagMarkdown("# Just markdown\n"), { ok: false, error: "no-marker" });
});

test("fails when the data block is truncated (no closing -->)", () => {
  const text = marker(JSON.stringify(envelope())).replace(/-->\n$/, "");
  const result = parseSaddlebagMarkdown(text);
  assert.equal(result.ok, false);
  assert.equal(result.error, "bad-json");
});

test("fails with bad-json on invalid JSON", () => {
  const result = parseSaddlebagMarkdown(marker("{ not json"));
  assert.equal(result.ok, false);
  assert.equal(result.error, "bad-json");
});

test("fails with wrong-app", () => {
  const result = parseSaddlebagMarkdown(marker(JSON.stringify(envelope({ app: "other" }))));
  assert.equal(result.ok, false);
  assert.equal(result.error, "wrong-app");
});

test("fails with missing-character", () => {
  const { character, ...rest } = envelope();
  const result = parseSaddlebagMarkdown(marker(JSON.stringify(rest)));
  assert.equal(result.ok, false);
  assert.equal(result.error, "missing-character");
});

test("fails with missing-campaign", () => {
  const { campaign, ...rest } = envelope();
  const result = parseSaddlebagMarkdown(marker(JSON.stringify(rest)));
  assert.equal(result.ok, false);
  assert.equal(result.error, "missing-campaign");
});

test("fails with unsupported-version for formatVersion 6", () => {
  const result = parseSaddlebagMarkdown(marker(JSON.stringify(envelope({ formatVersion: 6 }))));
  assert.equal(result.ok, false);
  assert.equal(result.error, "unsupported-version");
});

test("handles CRLF line endings", () => {
  const text = fixture("bluey").replace(/\n/g, "\r\n");
  const result = parseSaddlebagMarkdown(text);
  assert.equal(result.ok, true);
  assert.equal(result.data.character.name, "Bluey");
});

test("handles a leading BOM", () => {
  const result = parseSaddlebagMarkdown("\uFEFF" + fixture("clem-hale"));
  assert.equal(result.ok, true);
});

test("ignores a --> in the body before the marker", () => {
  const text = "# Title\n\nSome text --> with an arrow\n\n" + marker(JSON.stringify(envelope(), null, 1));
  const result = parseSaddlebagMarkdown(text);
  assert.equal(result.ok, true);
  assert.equal(result.data.character.name, "Test");
});

test("keeps unknown fields untouched", () => {
  const character = { id: "c1", name: "Test", somethingNew: { nested: [1, 2, 3] } };
  const result = parseSaddlebagMarkdown(marker(JSON.stringify(envelope({ character }))));
  assert.equal(result.ok, true);
  assert.deepEqual(result.data.character, character);
});

test("parseCampaignJson accepts a campaign envelope", () => {
  const json = JSON.stringify({ app: "saddlebag", kind: "campaign", formatVersion: 1, campaign: { id: "k1" } });
  const result = parseCampaignJson(json);
  assert.equal(result.ok, true);
  assert.equal(result.data.campaign.id, "k1");
});

test("parseCampaignJson rejects bad input", () => {
  assert.equal(parseCampaignJson("nope").error, "bad-json");
  assert.equal(parseCampaignJson(JSON.stringify({ app: "x", formatVersion: 1 })).error, "wrong-app");
  assert.equal(
    parseCampaignJson(JSON.stringify({ app: "saddlebag", formatVersion: 6, kind: "campaign", campaign: {} })).error,
    "unsupported-version",
  );
  assert.equal(
    parseCampaignJson(JSON.stringify({ app: "saddlebag", formatVersion: 1, kind: "campaign" })).error,
    "missing-campaign",
  );
});
