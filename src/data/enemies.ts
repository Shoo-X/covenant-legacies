import type { Enemy } from "@/types/game";
import { getArtAsset } from "@/data/artAssets";

const davidGoliathArt = getArtAsset("art-david-goliath-portrait");
const giantHighPlaceArt = getArtAsset("art-giant-of-high-place");
const giantsShieldBearerArt = getArtAsset("art-giants-shield-bearer");
const idolPriestArt = getArtAsset("art-idol-priest");
const philistineRaiderArt = getArtAsset("art-philistine-raider");
const watcherTouchedRaiderArt = getArtAsset("art-watcher-touched-raider");

export const enemies: Enemy[] = [
  {
    id: "enemy-corrupted-raider",
    name: "Philistine Raider",
    title: "Skirmisher of the Valley Mouth",
    maxHealth: 40,
    attackDamage: 6,
    intent: "Raid pattern",
    traits: ["Human", "Philistine"],
    imagePath: philistineRaiderArt?.path,
    artworkTitle: philistineRaiderArt?.title ?? "Philistine Raider",
    imageObjectPosition: philistineRaiderArt?.objectPosition ?? "50% 34%",
    mechanics: [
      "Mounting physical pressure with a telegraphed heavy strike.",
      "Teaches Guard timing before the campaign introduces stranger threats.",
    ],
    sourceTier: "Biblical Inference",
    references: ["1 Samuel 17:1-3"],
    theologyNote:
      "A Scripture-adjacent skirmisher inferred from the Philistine battle line at the Valley of Elah, not a named biblical individual.",
    gameplayRole: "Attack",
  },
  {
    id: "enemy-idol-priest",
    name: "Keeper of the Idol Standard",
    title: "Bearer of False Victory",
    maxHealth: 44,
    attackDamage: 5,
    intent: "Idol-standard pressure",
    traits: ["Human", "Philistine", "Idol"],
    imagePath: idolPriestArt?.path,
    artworkTitle: idolPriestArt?.title ?? "Keeper of the Idol Standard",
    imageObjectPosition: idolPriestArt?.objectPosition ?? "50% 34%",
    mechanics: [
      "Charges an Idol Standard structure while making weaker direct attacks.",
      "Destroying altar or structure effects can stop setup turns and Corruption pressure.",
    ],
    sourceTier: "Biblical Inference",
    references: ["1 Samuel 5", "1 Samuel 31:8-10"],
    theologyNote:
      "The Idol Standard is a game abstraction from Philistine idol contexts, representing false worship pressure rather than spiritual power to admire.",
    gameplayRole: "Trial",
  },
  {
    id: "enemy-giant-blooded-brute",
    name: "Giant's Shield-Bearer",
    title: "Shield Before the Champion",
    maxHealth: 58,
    attackDamage: 10,
    intent: "Shield and interception pattern",
    traits: ["Human", "Philistine"],
    imagePath: giantsShieldBearerArt?.path ?? davidGoliathArt?.path,
    artworkTitle:
      giantsShieldBearerArt?.title ?? davidGoliathArt?.title ?? "Giant's Shield-Bearer",
    imageObjectPosition: giantsShieldBearerArt?.objectPosition ?? "50% 34%",
    mechanics: [
      "Builds Guard before shield-bashing and protecting stronger threats.",
      "Teaches players that not every threat is solved by raw damage.",
    ],
    sourceTier: "Scripture",
    references: ["1 Samuel 17:7", "1 Samuel 17:41"],
    theologyNote:
      "The shield-bearer is named in the biblical account and represented as battlefield support, not as a disposable fantasy creature.",
    gameplayRole: "Defense",
  },
  {
    id: "enemy-gathite-armor-bearer",
    name: "Gathite Armor-Bearer",
    title: "Bronze-Ranked Guard of Gath",
    maxHealth: 56,
    attackDamage: 9,
    intent: "Armor and Guard pressure",
    traits: ["Human", "Philistine", "Gath"],
    imagePath: davidGoliathArt?.path,
    artworkTitle: davidGoliathArt?.title ?? "David vs Goliath",
    imageObjectPosition: "80% 36%",
    mechanics: [
      "Builds high Guard and punishes weak, unfocused attacks.",
      "Represents Gathite military pressure without naming an extra biblical character.",
    ],
    sourceTier: "Biblical Inference",
    references: ["1 Samuel 17", "2 Samuel 21:15-22"],
    theologyNote:
      "This enemy is inferred from Gath's military and giant-associated context, while avoiding claims beyond the biblical text.",
    gameplayRole: "Defense",
  },
  {
    id: "enemy-watcher-taught-smith",
    name: "Watcher-Taught Smith",
    title: "Speculative Forge of the Watchers",
    maxHealth: 68,
    attackDamage: 8,
    intent: "Forge scaling pattern",
    traits: ["Human", "Watcher"],
    imagePath: watcherTouchedRaiderArt?.path,
    artworkTitle: watcherTouchedRaiderArt?.title ?? "Watcher-Touched Raider",
    imageObjectPosition: watcherTouchedRaiderArt?.objectPosition ?? "50% 34%",
    mechanics: ["Gains Might before attacking."],
    sourceTier: "Speculative Fiction",
    references: ["Genesis 6:1-4", "Joshua 11:22", "2 Samuel 21:15-22"],
    theologyNote:
      "This is a speculative War of the Watchers layer encounter, not a direct claim about 1 Samuel 17 or Goliath's ancestry.",
    gameplayRole: "Trial",
  },
  {
    id: "enemy-giant-of-the-high-place",
    name: "Goliath of Gath",
    title: "Champion of the Philistines",
    maxHealth: 118,
    attackDamage: 12,
    intent: "Phased giant challenge",
    traits: ["Giant", "Philistine", "Champion", "Gath", "Boss"],
    imagePath: giantHighPlaceArt?.path ?? davidGoliathArt?.path,
    artworkTitle: giantHighPlaceArt?.title ?? davidGoliathArt?.title ?? "David vs Goliath",
    imageObjectPosition: giantHighPlaceArt?.objectPosition ?? "75% 33%",
    mechanics: [
      "Phase 1, The Challenge: taunts, moderate attacks, Spear Advance, and Armor of Gath Guard pressure.",
      "Phase 2, Spear Like a Weaver's Beam: heavy spear attacks become more common and more dangerous if Fear remains.",
      "Phase 3, The Battle Belongs: dangerous final pressure creates Exposed openings that reward Courage, Sling, and Faith timing.",
      "High Corruption in the final phase can harden the boss with Might or renewed Fear pressure.",
    ],
    sourceTier: "Scripture",
    references: ["1 Samuel 17", "Joshua 11:22", "2 Samuel 21:15-22"],
    theologyNote:
      "Goliath is represented as the Philistine champion from Gath in 1 Samuel 17. Joshua 11:22 and 2 Samuel 21:15-22 provide related Gath and giant-legacy context, but the game does not state that Goliath is Nephilim or Watcher-descended.",
    gameplayRole: "Boss",
  },
];
