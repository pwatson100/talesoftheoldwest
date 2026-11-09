import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  buildCampaignEnvelope,
  htmlToPlainText,
  npcSnapshotToSaddlebag,
  planCampaignExport,
} from "../module/helpers/saddlebag/campaignExport.mjs";
import { parseCampaignJson, parseSaddlebagMarkdown } from "../module/helpers/saddlebag/parse.mjs";
import { toFoundry } from "../module/helpers/saddlebag/toFoundry.mjs";

const fixture = (name) =>
  parseSaddlebagMarkdown(readFileSync(fileURLToPath(new URL(`./fixtures/saddlebag/${name}.md`, import.meta.url)), "utf8")).data;

test("htmlToPlainText strips tags and handles breaks", () => {
  assert.equal(htmlToPlainText("<p>First line</p><p>Second<br>line</p>"), "First line\n\nSecond\nline");
  assert.equal(htmlToPlainText("Tom &amp; Jerry &lt;3"), "Tom & Jerry <3");
  assert.equal(htmlToPlainText(""), "");
});

test("buildCampaignEnvelope produces valid v5 envelope with defaults", () => {
  const env = buildCampaignEnvelope({ name: "Desert Trail" }, [], {
    now: "2026-11-09T12:00:00.000Z",
    uuid: () => "test-campaign-id",
  });
  assert.equal(env.app, "saddlebag");
  assert.equal(env.kind, "campaign");
  assert.equal(env.formatVersion, 5);
  assert.equal(env.campaign.name, "Desert Trail");
  assert.equal(env.campaign.id, "test-campaign-id");
  assert.equal(env.campaign.season.season, "spring");
  assert.equal(env.campaign.eraId, "1873-rulebook");
  assert.deepEqual(env.campaign.npcs, []);

  // Validate with parseCampaignJson
  const parsed = parseCampaignJson(JSON.stringify(env));
  assert.equal(parsed.ok, true);
  assert.equal(parsed.data.campaign.name, "Desert Trail");
});

test("npcSnapshotToSaddlebag preserves flagged NPC properties and updates name", () => {
  const originalNpc = {
    id: "npc-123",
    name: "Original Name",
    gender: "female",
    genderNote: "Old Timer",
    about: "Saloon keeper",
    description: "Gray hair",
    portraitId: "port-1",
    portraitFace: { x: 0.5, y: 0.5, size: 0.5 },
    portraitPrompt: null,
    createdAt: "2026-11-01T00:00:00.000Z",
    notes: "Friendly",
  };
  const snap = {
    name: "Updated Name",
    system: { biography: "<p>Updated bio</p>" },
    flag: { id: "npc-123", npc: originalNpc },
  };

  const saddlebagNpc = npcSnapshotToSaddlebag(snap);
  assert.equal(saddlebagNpc.id, "npc-123");
  assert.equal(saddlebagNpc.name, "Updated Name");
  assert.equal(saddlebagNpc.gender, "female");
  assert.equal(saddlebagNpc.portraitFace.x, 0.5);
  assert.equal(saddlebagNpc.notes, "Friendly");
});

test("npcSnapshotToSaddlebag creates a new NPC for native unflagged actor", () => {
  const snap = {
    name: "Doc Holiday",
    system: { biography: "<p>A dentist<br>turned gambler.</p>" },
    portraitId: "doc-port-uuid",
  };

  const saddlebagNpc = npcSnapshotToSaddlebag(snap, {
    now: "2026-11-09T12:00:00.000Z",
    uuid: () => "doc-uuid",
  });
  assert.equal(saddlebagNpc.id, "doc-uuid");
  assert.equal(saddlebagNpc.name, "Doc Holiday");
  assert.equal(saddlebagNpc.about, "A dentist\nturned gambler.");
  assert.equal(saddlebagNpc.portraitId, "doc-port-uuid");
});

test("planCampaignExport generates campaign.json and character markdown files", () => {
  const clemData = fixture("clem-hale");
  const clemPlan = toFoundry(clemData.character, clemData.campaign);

  const pcSnap = {
    name: "Clem Hale",
    system: clemPlan.actorData.system,
    flag: clemPlan.flag,
    exportIds: null,
    legacyCharacterId: null,
    statuses: [],
    items: [],
    horses: [],
  };

  const npcSnap = {
    name: "Sheriff Delaney",
    system: { biography: "<p>Town lawman.</p>" },
    flag: null,
    portraitId: null,
  };

  const plan = planCampaignExport({
    campaign: { id: "camp-1", name: "Rio Grande" },
    pcs: [pcSnap],
    npcs: [npcSnap],
  }, {
    now: "2026-11-09T12:00:00.000Z",
    uuid: () => "test-uuid",
  });

  assert.equal(plan.files.length, 2);
  assert.equal(plan.files[0].name, "campaign.json");
  assert.equal(plan.files[1].name, "characters/clem-hale.md");

  // Verify campaign.json parses
  const parsedCampaign = parseCampaignJson(plan.files[0].data);
  assert.equal(parsedCampaign.ok, true);
  assert.equal(parsedCampaign.data.campaign.name, "Rio Grande");
  assert.equal(parsedCampaign.data.campaign.npcs.length, 1);
  assert.equal(parsedCampaign.data.campaign.npcs[0].name, "Sheriff Delaney");

  // Verify character markdown parses
  const parsedChar = parseSaddlebagMarkdown(plan.files[1].data);
  assert.equal(parsedChar.ok, true);
  assert.equal(parsedChar.data.character.name, "Clem Hale");
  assert.equal(parsedChar.data.campaign.id, "camp-1");
});

test("planCampaignExport handles duplicate character names with suffix", () => {
  const clemData = fixture("clem-hale");
  const clemPlan = toFoundry(clemData.character, clemData.campaign);

  const makePc = () => ({
    name: "Clem Hale",
    system: clemPlan.actorData.system,
    flag: clemPlan.flag,
    exportIds: null,
    legacyCharacterId: null,
    statuses: [],
    items: [],
    horses: [],
  });

  const plan = planCampaignExport({
    campaign: { id: "camp-1", name: "Rio Grande" },
    pcs: [makePc(), makePc()],
  });

  const filenames = plan.files.map((f) => f.name);
  assert.ok(filenames.includes("characters/clem-hale.md"));
  assert.ok(filenames.includes("characters/clem-hale-2.md"));
});
