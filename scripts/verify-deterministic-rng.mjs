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
const rewards = await importTypescriptModule("src/game/rewards.ts");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const seed = random.normalizeSeed("DAVID-7JX2-K93M");
const sameShuffleA = random.createRng(random.deriveSeed(seed, "combat:test")).shuffle([
  "sling",
  "guard",
  "psalm",
  "stone",
  "harp",
]);
const sameShuffleB = random.createRng(random.deriveSeed(seed, "combat:test")).shuffle([
  "sling",
  "guard",
  "psalm",
  "stone",
  "harp",
]);
const differentShuffle = random
  .createRng(random.deriveSeed("DAVID-AAAA-BBBB", "combat:test"))
  .shuffle(["sling", "guard", "psalm", "stone", "harp"]);

assert(
  JSON.stringify(sameShuffleA) === JSON.stringify(sameShuffleB),
  "same seed did not reproduce the same shuffle",
);
assert(
  JSON.stringify(sameShuffleA) !== JSON.stringify(differentShuffle),
  "different seed unexpectedly produced the same shuffle",
);

const sampleCards = [
  card("card-sling-stone", "Common", ["Courage"], "Attack", "Attack"),
  card("card-shepherds-guard", "Common", ["Courage"], "Defense", "Guard"),
  card("card-psalm-of-courage", "Uncommon", ["Psalm"], "Prayer", "Psalm"),
  card("card-smooth-stone", "Common", ["Courage"], "Attack", "Attack"),
  card("card-watchful-shepherd", "Uncommon", ["Covenant"], "Support", "Covenant"),
  card("card-stone-of-defiance", "Rare", ["Courage"], "Anti-Giant", "Attack"),
  card("card-clean-hands", "Rare", ["Covenant"], "Defense", "Covenant"),
  card("card-forbidden-warning", "Rare", ["Forbidden"], "Corruption", "Forbidden"),
];
const sampleDeck = [
  { cardId: "card-sling-stone", quantity: 2 },
  { cardId: "card-shepherds-guard", quantity: 2 },
  { cardId: "card-psalm-of-courage", quantity: 1 },
];
const rewardSeed = random.deriveSeed(seed, "reward:encounter-valley-battle-1:cards");
const offerA = rewards
  .chooseRewardCards(
    sampleCards,
    3,
    random.createRng(rewardSeed).randomFloat,
    sampleDeck,
    [],
  )
  .map((rewardCard) => rewardCard.id);
const offerB = rewards
  .chooseRewardCards(
    sampleCards,
    3,
    random.createRng(rewardSeed).randomFloat,
    sampleDeck,
    [],
  )
  .map((rewardCard) => rewardCard.id);
const offerC = rewards
  .chooseRewardCards(
    sampleCards,
    3,
    random.createRng(random.deriveSeed(seed, "reward:encounter-valley-battle-2:cards"))
      .randomFloat,
    sampleDeck,
    [],
  )
  .map((rewardCard) => rewardCard.id);

assert(
  JSON.stringify(offerA) === JSON.stringify(offerB),
  "same seed and reward context did not reproduce the same offer",
);
assert(
  JSON.stringify(offerA) !== JSON.stringify(offerC),
  "different reward context unexpectedly produced the same offer",
);

console.log("Deterministic RNG verification passed.");
console.log(`Seed: ${seed}`);
console.log(`Shuffle: ${sameShuffleA.join(", ")}`);
console.log(`Reward offer: ${offerA.join(", ")}`);

function card(id, rarity, archetypeTags, gameplayRole, type) {
  return {
    id,
    name: id,
    cost: [{ amount: 1, resource: "Resolve" }],
    text: "",
    type,
    rarity,
    archetypeTags,
    gameplayRole,
    sourceTier: "Biblical Inference",
    references: [],
    theologyNote: "",
  };
}
