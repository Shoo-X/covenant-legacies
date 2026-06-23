import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();

function transpileTypescript(relativePath, replacements = {}) {
  const sourcePath = path.join(root, relativePath);
  let source = fs.readFileSync(sourcePath, "utf8");

  for (const [from, to] of Object.entries(replacements)) {
    source = source.replaceAll(from, to);
  }

  return ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
      verbatimModuleSyntax: true,
    },
    fileName: sourcePath,
  }).outputText;
}

async function importSource(relativePath, replacements = {}) {
  const transpiled = transpileTypescript(relativePath, replacements);
  const encoded = Buffer.from(transpiled, "utf8").toString("base64");

  return import(`data:text/javascript;base64,${encoded}`);
}

function toDataUrl(source) {
  return `data:text/javascript;base64,${Buffer.from(source, "utf8").toString("base64")}`;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const randomSource = transpileTypescript("src/game/random.ts");
const summarySource = transpileTypescript("src/game/runSummary.ts");
const random = await import(`data:text/javascript;base64,${Buffer.from(randomSource, "utf8").toString("base64")}`);
const summaryUrl = toDataUrl(summarySource);
const randomUrl = toDataUrl(randomSource);
const lifecycle = await importSource("src/game/runLifecycle.ts", {
  '"@/game/random"': `"${randomUrl}"`,
  '"@/game/runSummary"': `"${summaryUrl}"`,
});
const navigation = await importSource("src/game/navigationPolicy.ts");

const now = "2026-06-23T12:00:00.000Z";
const content = {
  baseRewardPoolCardIds: ["card-psalm-of-courage", "card-lion-and-bear"],
  cards: [
    card("card-sling-stone", "Sling Stone"),
    card("card-psalm-of-courage", "Psalm of Courage"),
    card("card-lion-and-bear", "Lion and Bear"),
  ],
  codexEntryIds: ["codex-david"],
  encounterIds: [
    "encounter-valley-battle-1",
    "encounter-valley-rest",
    "encounter-valley-boss",
  ],
  encounters: [
    encounter("encounter-valley-battle-1", "Raiders at the Valley Mouth", "Battle", ["enemy-raider"]),
    encounter("encounter-valley-rest", "The Brook of Stones", "Rest / Upgrade", []),
    encounter("encounter-valley-boss", "Goliath of Gath", "Boss", ["enemy-goliath"]),
  ],
  firstEncounterId: "encounter-valley-battle-1",
  firstMysteryEncounterId: "mystery-valley",
  hero: {
    id: "hero-david",
    maxHealth: 57,
    name: "David",
    resourceState: {
      authority: 0,
      corruption: 0,
      faith: 1,
      resolve: 2,
      wisdom: 0,
    },
    startingDeck: [
      { cardId: "card-sling-stone", quantity: 2 },
      { cardId: "card-psalm-of-courage", quantity: 1 },
    ],
  },
  memorials: [
    {
      id: "memorial-smooth-stone-pouch",
      name: "Smooth Stone Pouch",
    },
  ],
  mysteryEncounters: [
    {
      id: "mystery-valley",
      title: "A Quiet Choice",
    },
  ],
};

const runSeed = random.normalizeSeed("DAVID-7JX2-K93M");
const run = lifecycle.createNewActiveRun(content, now, "navigation-run", runSeed);
const checkpoint = lifecycle.createCombatCheckpoint(
  {
    ...run,
    runHealth: 41,
    runResources: {
      authority: 0,
      corruption: 1,
      faith: 2,
      resolve: 1,
      wisdom: 0,
    },
  },
  "encounter-valley-battle-1",
  now,
);

assert(
  !navigation.getNavigationDecision({
    destination: "map",
    hasCombatCheckpoint: false,
    runPhase: "none",
  }).allowed,
  "map was reachable without an active run",
);
assert(
  navigation.getNavigationDecision({
    destination: "collection",
    hasCombatCheckpoint: false,
    runPhase: "map",
  }).allowed,
  "collection should remain reachable from a clean map phase",
);
assert(
  !navigation.getNavigationDecision({
    destination: "combat",
    hasCombatCheckpoint: false,
    runPhase: "map",
  }).allowed,
  "combat was reachable from map without a checkpoint",
);

const combatHomeDecision = navigation.getNavigationDecision({
  destination: "home",
  hasCombatCheckpoint: true,
  runPhase: "combat",
});
assert(
  combatHomeDecision.confirmation?.confirmLabel === "Leave Battle View",
  "leaving combat for home did not require the checkpoint warning",
);
assert(
  navigation.getNavigationDecision({
    destination: "combat",
    hasCombatCheckpoint: true,
    runPhase: "combat",
  }).resumeTarget === "combat",
  "combat resume target was not preserved",
);
assert(
  !navigation.getNavigationDecision({
    destination: "map",
    hasCombatCheckpoint: true,
    runPhase: "combat",
  }).allowed,
  "map was reachable during unresolved combat",
);
assert(
  navigation.getCombatReturnToMapState({
    phase: "PlayerMain",
    status: "active",
  }).enabled,
  "Return to Map was not visibly enabled during the player command step",
);
assert(
  !navigation.getCombatReturnToMapState({
    phase: "EnemyActing",
    status: "active",
  }).enabled,
  "Return to Map was enabled during enemy-turn resolution",
);
assert(
  !navigation.getCombatReturnToMapState({
    phase: "Victory",
    status: "victory",
  }).enabled,
  "Return to Map was enabled after a terminal combat outcome",
);
assert(
  !navigation.getNavigationDecision({
    destination: "collection",
    hasCombatCheckpoint: true,
    runPhase: "combat",
  }).allowed,
  "support screens were reachable during unresolved combat",
);
assert(
  navigation.getNavigationDecision({
    destination: "hero-select",
    hasCombatCheckpoint: true,
    runPhase: "combat",
  }).confirmation?.confirmLabel === "Abandon and View Summary",
  "new-run route did not require an abandon confirmation",
);

assert(
  navigation.getNavigationDecision({
    destination: "reward",
    hasCombatCheckpoint: false,
    runPhase: "reward",
  }).allowed,
  "pending reward phase could not resume reward screen",
);
assert(
  !navigation.getNavigationDecision({
    destination: "map",
    hasCombatCheckpoint: false,
    runPhase: "reward",
  }).allowed,
  "map was reachable before a reward decision was resolved",
);
assert(
  navigation.getNavigationDecision({
    destination: "home",
    hasCombatCheckpoint: false,
    runPhase: "rest",
  }).confirmation?.confirmLabel === "Leave Decision View",
  "pending rest decision did not require confirmation before home",
);
assert(
  !navigation.getNavigationDecision({
    destination: "combat",
    hasCombatCheckpoint: false,
    runPhase: "summary",
  }).allowed,
  "finalized summary allowed stale combat navigation",
);

const checkpointedRun = {
  ...run,
  combatCheckpoint: checkpoint,
  currentScreen: "combat",
  runHealth: 24,
  selectedEncounterId: "encounter-valley-battle-1",
};
const sanitizedCombat = lifecycle.sanitizeActiveRunSave(checkpointedRun, content, now);
assert(sanitizedCombat.run?.currentScreen === "combat", "combat checkpoint did not survive sanitization");
assert(sanitizedCombat.run?.combatCheckpoint?.runHealth === 41, "checkpoint health was not restored independently");
assert(
  sanitizedCombat.run?.completedEncounterIds.length === 0,
  "reload checkpoint incorrectly completed an encounter",
);
assert(
  lifecycle.getResumableRunScreen(sanitizedCombat.run) === "combat",
  "checkpointed run did not resume to combat",
);

const missingCheckpoint = lifecycle.sanitizeActiveRunSave(
  {
    ...run,
    currentScreen: "combat",
    combatCheckpoint: undefined,
  },
  content,
  now,
);
assert(missingCheckpoint.run?.currentScreen === "map", "missing checkpoint did not return safely to map");
assert(
  missingCheckpoint.issues.some((issue) => issue.includes("combat checkpoint")),
  "missing checkpoint did not report a recovery issue",
);

const pendingReward = lifecycle.sanitizeActiveRunSave(
  {
    ...run,
    currentScreen: "reward",
    pendingRewardCardIds: ["card-psalm-of-courage"],
  },
  content,
  now,
);
assert(pendingReward.run?.currentScreen === "reward", "pending reward was not authoritative after reload");
assert(pendingReward.run?.pendingRewardCardIds[0] === "card-psalm-of-courage", "pending reward card was lost");

const malformedCheckpoint = lifecycle.sanitizeActiveRunSave(
  {
    ...run,
    currentScreen: "combat",
    combatCheckpoint: {
      ...checkpoint,
      encounterId: "missing-encounter",
      runDeck: [{ cardId: "missing-card", quantity: 2 }],
    },
  },
  content,
  now,
);
assert(
  malformedCheckpoint.run?.currentScreen === "map",
  "malformed checkpoint did not recover to map",
);

const profile = lifecycle.createDefaultRunProfile();
const finalizedRun = {
  ...run,
  combatCheckpoint: checkpoint,
  completedEncounterIds: ["encounter-valley-battle-1"],
  currentScreen: "combat",
  runHealth: 30,
};
const recordedOnce = lifecycle.recordRunOutcome(
  profile,
  finalizedRun,
  "defeat",
  "2026-06-23T12:30:00.000Z",
  content,
);
const recordedTwice = lifecycle.recordRunOutcome(
  recordedOnce,
  finalizedRun,
  "defeat",
  "2026-06-23T12:31:00.000Z",
  content,
);
assert(recordedTwice.runHistory.length === 1, "duplicate run outcome was recorded");

console.log("Navigation integrity verification passed.");
console.log(`Checkpoint encounter: ${checkpoint.encounterId}`);
console.log(`Pending reward resumes: ${pendingReward.run.currentScreen}`);

function card(id, name) {
  return {
    cost: {},
    effect: {},
    id,
    name,
    sourceTier: "Scripture",
    type: "Action",
  };
}

function encounter(id, title, nodeType, enemyIds) {
  return {
    enemyIds,
    id,
    nodeType,
    title,
  };
}
