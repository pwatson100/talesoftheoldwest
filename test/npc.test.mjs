import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { toFoundryNpcs } from "../module/helpers/saddlebag/npc.mjs";
import { parseCampaignJson } from "../module/helpers/saddlebag/parse.mjs";

// campaign-with-npcs.json is a real Saddlebag export (6 Nov 2026): Joseph Pike has only a name and a portrait,
// Prescott Delaney has `about` and `description`. Gendered NPCs are hand-built below: the 7 Nov v5 export has none either.
const text = readFileSync(fileURLToPath(new URL("./fixtures/saddlebag/v4/campaign-with-npcs.json", import.meta.url)), "utf8");
const loadCampaign = () => {
  const result = parseCampaignJson(text);
  assert.equal(result.ok, true);
  return result.data.campaign;
};
const NOW = "2026-11-06T22:00:00.000Z";
const blank = (extra) => ({ id: "x", name: "N", gender: null, genderNote: "", about: "", description: "", portraitId: null, ...extra });
const codes = (plan) => plan.warnings.map((w) => w.code);

test("the real campaign file maps to two NPC plans", () => {
  const plans = toFoundryNpcs(loadCampaign(), { now: NOW });
  assert.equal(plans.length, 2);
  const [pike, delaney] = plans;
  assert.equal(pike.name, "Joseph Pike");
  assert.equal(pike.portraitId, "cd53032b-04a3-46f2-9af5-9a150950a7fb");
  assert.equal(pike.actorData.type, "npc");
  assert.equal(pike.actorData.system.biography, "");
  assert.equal(delaney.portraitId, null);
  assert.equal(delaney.actorData.system.biography, "<p><strong>Sherrif</strong></p><p>Tall</p>");
  assert.deepEqual(pike.warnings, []);
});

test("the flag keeps the whole original record and the campaign identity", () => {
  const campaign = loadCampaign();
  const [pike] = toFoundryNpcs(campaign, { now: NOW });
  assert.deepEqual(pike.flag.npc, campaign.npcs[0]);
  assert.notEqual(pike.flag.npc, campaign.npcs[0]);
  assert.equal(pike.flag.id, campaign.npcs[0].id);
  assert.equal(pike.flag.campaignName, "Great Western");
  assert.equal(pike.flag.campaignId, campaign.id);
  assert.equal(pike.flag.importedAt, NOW);
});

test("plans are JSON-serialisable and write no stats", () => {
  for (const plan of toFoundryNpcs(loadCampaign(), { now: NOW })) {
    assert.deepEqual(JSON.parse(JSON.stringify(plan)), plan);
    assert.deepEqual(Object.keys(plan.actorData.system), ["biography"]);
  }
});

test("gender and its note become a biography line", () => {
  const [a, b, c] = toFoundryNpcs(
    { npcs: [
      blank({ id: "a", gender: "female", genderNote: "goes by Jo", about: "Cook", description: "Short." }),
      blank({ id: "b", gender: "male" }),
      blank({ id: "c", gender: null, genderNote: "ignored without a gender" }),
    ] },
    { now: NOW },
  );
  assert.equal(a.actorData.system.biography, "<p><strong>Cook</strong></p><p>Female (goes by Jo)</p><p>Short.</p>");
  assert.equal(b.actorData.system.biography, "<p>Male</p>");
  assert.equal(c.actorData.system.biography, "");
});

test("v5 notes follow the description in the biography and are escaped", () => {
  const [a, b] = toFoundryNpcs(
    { npcs: [blank({ id: "a", about: "Cook", description: "Short.", notes: "Owes <i>money</i>.\n\nSecond" }), blank({ id: "b", notes: "Only notes" })] },
    { now: NOW },
  );
  assert.equal(a.actorData.system.biography, "<p><strong>Cook</strong></p><p>Short.</p><p>Owes &lt;i&gt;money&lt;/i&gt;.</p><p>Second</p>");
  assert.equal(b.actorData.system.biography, "<p>Only notes</p>");
});

test("the real v5 campaign file (7 Nov) maps to the same two NPCs", () => {
  const v5 = parseCampaignJson(readFileSync(fileURLToPath(new URL("./fixtures/saddlebag/v5/campaign-with-npcs.json", import.meta.url)), "utf8"));
  assert.equal(v5.ok, true);
  const plans = toFoundryNpcs(v5.data.campaign, { now: NOW });
  assert.deepEqual(plans.map((p) => p.name), ["Joseph Pike", "Prescott Delaney"]);
  assert.equal(plans[1].actorData.system.biography, "<p><strong>Sherrif</strong></p><p>Tall</p>");
  assert.deepEqual(plans.flatMap((p) => p.warnings), []);
});

test("a blank name becomes Unnamed NPC with a warning", () => {
  const [plan] = toFoundryNpcs({ npcs: [blank({ name: "   " })] }, { now: NOW });
  assert.equal(plan.name, "Unnamed NPC");
  assert.equal(plan.actorData.name, "Unnamed NPC");
  assert.deepEqual(codes(plan), ["npc-unnamed"]);
});

test("HTML in any text field is escaped", () => {
  const [plan] = toFoundryNpcs(
    { npcs: [blank({ about: "<b>x</b>", genderNote: "<i>", gender: "male", description: "<script>alert(1)</script>\n\nSecond" })] },
    { now: NOW },
  );
  const html = plan.actorData.system.biography;
  assert.ok(!html.includes("<script"));
  assert.ok(!html.includes("<b>x"));
  assert.ok(!html.includes("<i>"));
  assert.ok(html.includes("&lt;script&gt;"));
  assert.ok(html.endsWith("<p>Second</p>"));
});

test("missing, empty or malformed npcs give no plans and never throw", () => {
  assert.deepEqual(toFoundryNpcs(null), []);
  assert.deepEqual(toFoundryNpcs({}), []);
  assert.deepEqual(toFoundryNpcs({ npcs: [] }), []);
  assert.deepEqual(toFoundryNpcs({ npcs: "nope" }), []);
  const plans = toFoundryNpcs({ npcs: [null, 7, "x", [], {}, { id: "" }, { id: 5 }, blank({ id: "ok" })] }, { now: NOW });
  assert.deepEqual(plans.map((p) => p.saddlebagId), ["ok"]);
});

test("a duplicate id keeps the first NPC and warns on it", () => {
  const plans = toFoundryNpcs({ npcs: [blank({ id: "d", name: "First" }), blank({ id: "d", name: "Second" })] }, { now: NOW });
  assert.equal(plans.length, 1);
  assert.equal(plans[0].name, "First");
  assert.deepEqual(codes(plans[0]), ["npc-duplicate-id"]);
});

test("a portrait missing from the archive warns; present or unchecked does not", () => {
  const npcs = [blank({ id: "p", portraitId: "abc" })];
  assert.deepEqual(codes(toFoundryNpcs({ npcs }, { portraits: new Map() })[0]), ["npc-portrait-missing"]);
  assert.deepEqual(toFoundryNpcs({ npcs }, { portraits: new Map([["abc", {}]]) })[0].warnings, []);
  assert.deepEqual(toFoundryNpcs({ npcs })[0].warnings, []);
});
