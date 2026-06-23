import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();

async function importTypescriptModule(relativePath) {
  const sourcePath = path.join(root, relativePath);
  const source = fs.readFileSync(sourcePath, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
      verbatimModuleSyntax: true,
    },
    fileName: sourcePath,
  }).outputText;
  const encoded = Buffer.from(transpiled, "utf8").toString("base64");

  return import(`data:text/javascript;base64,${encoded}`);
}

const random = await importTypescriptModule("src/game/random.ts");
const summary = await importTypescriptModule("src/game/runSummary.ts");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const seed = random.normalizeSeed("DAVID-7JX2-K93M");
const content = {
  cards: [
    card("card-sling-stone", "Sling Stone"),
    card("card-psalm-of-courage", "Psalm of Courage"),
    card("card-lion-and-bear", "Lion and Bear"),
  ],
  encounters: [
    encounter("encounter-valley-battle-1", "Raiders at the Valley Mouth", "Battle", ["enemy-raider"]),
    encounter("encounter-valley-rest", "The Brook of Stones", "Rest / Upgrade", []),
    encounter("encounter-valley-boss", "Goliath of Gath", "Boss", ["enemy-goliath"]),
  ],
  hero: {
    id: "hero-david",
    name: "David",
  },
  memorials: [
    {
      id: "memorial-smooth-stone-pouch",
      name: "Smooth Stone Pouch",
    },
  ],
};
const tracking = summary.recordEncounterCompletion(
  summary.recordMemorialChange(
    summary.recordDecision(
      summary.recordCardChange(
        summary.recordCardChange(
          summary.recordCardChange(summary.createEmptyRunTracking(true), {
            occurrenceKey: "reward:encounter-valley-battle-1:card",
            kind: "gained",
            cardId: "card-psalm-of-courage",
            quantity: 1,
            encounterId: "encounter-valley-battle-1",
            source: "reward",
          }),
          {
            occurrenceKey: "mystery:test:remove",
            kind: "removed",
            cardId: "card-psalm-of-courage",
            quantity: 1,
            encounterId: "encounter-valley-rest",
            source: "mystery",
          },
        ),
        {
          occurrenceKey: "rest:encounter-valley-rest:upgrade:card-sling-stone",
          kind: "upgraded",
          cardId: "card-sling-stone",
          quantity: 1,
          encounterId: "encounter-valley-rest",
          source: "rest",
        },
      ),
      {
        occurrenceKey: "reward:encounter-valley-battle-1",
        kind: "reward-card",
        encounterId: "encounter-valley-battle-1",
        cardId: "card-psalm-of-courage",
      },
    ),
    {
      occurrenceKey: "memorial:encounter-valley-battle-1",
      memorialId: "memorial-smooth-stone-pouch",
      encounterId: "encounter-valley-battle-1",
    },
  ),
  "encounter-valley-battle-1",
);
const baseRun = {
  campaignId: "david-valley-of-the-giant",
  completedEncounterIds: ["encounter-valley-battle-1"],
  createdAt: "2026-06-23T12:00:00.000Z",
  endedAt: "2026-06-23T12:10:00.000Z",
  finalDeck: [
    { cardId: "card-sling-stone", quantity: 2 },
    { cardId: "card-lion-and-bear", quantity: 1 },
  ],
  finalHealth: 47,
  finalResources: {
    authority: 0,
    corruption: 1,
    faith: 1,
    resolve: 2,
    wisdom: 0,
  },
  heroId: "hero-david",
  runId: "run-summary-test",
  runMemorialIds: ["memorial-smooth-stone-pouch"],
  runSeed: seed,
  runTracking: tracking,
  selectedEncounterId: "encounter-valley-boss",
  upgradedCardIds: ["card-sling-stone"],
};

const completed = summary.finalizeRunSummary(
  { ...baseRun, outcome: "completed", completedEncounterIds: ["encounter-valley-battle-1", "encounter-valley-boss"] },
  content,
);
const defeated = summary.finalizeRunSummary(
  { ...baseRun, outcome: "defeated" },
  content,
);
const abandoned = summary.finalizeRunSummary(
  { ...baseRun, outcome: "abandoned", selectedEncounterId: "encounter-valley-rest" },
  content,
);

assert(completed.outcome === "completed", "completed outcome was not preserved");
assert(defeated.outcome === "defeated", "defeated outcome was not preserved");
assert(abandoned.outcome === "abandoned", "abandoned outcome was not preserved");
assert(completed.bossCompleted === true, "completed boss state was not recorded");
assert(defeated.bossReached === true, "defeated boss reach was not recorded");

const once = summary.appendFinalizedRunSummary([], defeated);
const twice = summary.appendFinalizedRunSummary(once, defeated);
assert(twice.length === 1, "same run was appended twice");

const replaySameSeed = summary.finalizeRunSummary(
  { ...baseRun, runId: "run-summary-test-replay", outcome: "defeated" },
  content,
);
assert(replaySameSeed.runSeed === defeated.runSeed, "same-seed replay did not retain seed");
assert(replaySameSeed.runId !== defeated.runId, "same-seed replay reused run id");

const newSeed = random.createRunSeed(() => 0.25);
const replayNewSeed = summary.finalizeRunSummary(
  { ...baseRun, runId: "run-summary-test-new-seed", runSeed: newSeed, outcome: "defeated" },
  content,
);
assert(replayNewSeed.runSeed !== defeated.runSeed, "new-seed replay did not change seed");

assert(
  defeated.cardsGained?.some((entry) => entry.id === "card-psalm-of-courage"),
  "gained card was not represented",
);
assert(
  defeated.cardsRemoved?.some((entry) => entry.id === "card-psalm-of-courage"),
  "gained-then-removed card was not represented as removed",
);
assert(
  defeated.finalDeck?.find((entry) => entry.id === "card-sling-stone")?.quantity === 2,
  "duplicate final deck card count was not preserved",
);

const legacy = summary.createLegacyRunSummary(
  {
    campaignId: "david-valley-of-the-giant",
    completedEncounterIds: ["encounter-valley-battle-1"],
    createdAt: "2026-06-23T12:00:00.000Z",
    endedAt: "2026-06-23T12:05:00.000Z",
    finalDeckCardCount: 9,
    outcome: "defeat",
    runId: "legacy-run",
    runMemorialIds: ["unknown-memorial"],
    runSeed: seed,
  },
  "2026-06-23T12:05:00.000Z",
);
assert(legacy, "legacy record did not sanitize");
assert(legacy.outcome === "defeated", "legacy defeat outcome did not migrate");
assert(legacy.dataStatus.deckChanges === "unavailable", "legacy deck changes were not marked unavailable");
assert(legacy.cardsGained === undefined, "legacy missing gained cards became a false zero");

const unknown = summary.sanitizeFinalizedRunSummary({
  ...defeated,
  finalDeck: [{ id: "retired-card", name: "Retired Card", quantity: 1 }],
  finalMemorials: [{ id: "retired-memorial", name: "Retired Memorial", quantity: 1 }],
  encounterPath: [{ id: "retired-encounter", name: "Retired Encounter", isBoss: false, status: "completed" }],
});
assert(unknown?.finalDeck?.[0]?.name === "Retired Card", "unknown card fallback failed");
assert(unknown?.finalMemorials?.[0]?.name === "Retired Memorial", "unknown Memorial fallback failed");
assert(unknown?.encounterPath?.[0]?.name === "Retired Encounter", "unknown encounter fallback failed");

const retained = Array.from({ length: 25 }, (_, index) => ({
  ...defeated,
  runId: `retained-${index}`,
}));
const retentionResult = retained.reduce(
  (history, entry) => summary.appendFinalizedRunSummary(history, entry, 20),
  [],
);
assert(retentionResult.length === 20, "retention limit was not enforced");
assert(retentionResult.at(-1).runId === "retained-24", "latest retained record was not preserved");

const malformed = summary.sanitizeFinalizedRunSummary({ runId: 1, outcome: "lost" });
assert(malformed === undefined, "malformed summary was not rejected safely");

console.log("Run summary verification passed.");
console.log(`Seed: ${seed}`);
console.log(`Completed title state: ${completed.outcome}`);
console.log(`Final deck size: ${defeated.finalDeckCardCount}`);

function card(id, name) {
  return {
    id,
    name,
    cost: [{ amount: 1, resource: "Resolve" }],
    text: "",
    type: "Attack",
    rarity: "Common",
    gameplayRole: "Attack",
    sourceTier: "Biblical Inference",
    references: [],
    theologyNote: "",
  };
}

function encounter(id, name, nodeType, enemyIds) {
  return {
    id,
    name,
    nodeType,
    region: "The Valley of the Giant",
    enemyIds,
    rewardPreview: "",
    difficulty: nodeType === "Boss" ? "Boss" : "Low",
    sourceTier: "Biblical Inference",
    references: [],
    theologyNote: "",
    gameplayRole: "Map Node",
  };
}
