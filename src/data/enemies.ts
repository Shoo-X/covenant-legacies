import type { Enemy } from "@/types/game";
import { getArtAsset } from "@/data/artAssets";

const davidGoliathArt = getArtAsset("art-david-goliath-portrait");
const giantHighPlaceArt = getArtAsset("art-giant-of-high-place");

export const enemies: Enemy[] = [
  {
    id: "enemy-corrupted-raider",
    name: "Philistine Raider",
    title: "Skirmisher of the Valley Mouth",
    maxHealth: 42,
    attackDamage: 6,
    intent: "Raid pattern",
    traits: ["Human", "Philistine"],
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
    maxHealth: 46,
    attackDamage: 5,
    intent: "Idol-standard pressure",
    traits: ["Human", "Philistine", "Idol"],
    mechanics: [
      "Charges an Idol Standard structure while making weaker direct attacks.",
      "Destroying altar or structure effects can stop setup turns and Corruption pressure.",
    ],
    sourceTier: "Biblical Inference",
    references: ["1 Samuel 5", "1 Samuel 31:8-10"],
    theologyNote:
      "The Idol Standard is a game abstraction from Philistine idol contexts, framed as false worship pressure rather than spiritual power to admire.",
    gameplayRole: "Trial",
  },
  {
    id: "enemy-giant-blooded-brute",
    name: "Giant's Shield-Bearer",
    title: "Shield Before the Champion",
    maxHealth: 62,
    attackDamage: 11,
    intent: "Shield and interception pattern",
    traits: ["Human", "Philistine"],
    imagePath: davidGoliathArt?.path,
    artworkTitle: davidGoliathArt?.title ?? "David vs Goliath",
    imageObjectPosition: "74% 34%",
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
    maxHealth: 58,
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
    maxHealth: 78,
    attackDamage: 8,
    intent: "Forge scaling pattern",
    traits: ["Human", "Watcher"],
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
    title: "Philistine Champion",
    maxHealth: 128,
    attackDamage: 12,
    intent: "Phased giant challenge",
    traits: ["Giant", "Philistine", "Champion", "Gath", "Boss"],
    imagePath: giantHighPlaceArt?.path ?? davidGoliathArt?.path,
    artworkTitle: giantHighPlaceArt?.title ?? davidGoliathArt?.title ?? "David vs Goliath",
    imageObjectPosition: giantHighPlaceArt?.objectPosition ?? "75% 33%",
    mechanics: [
      "Challenges David with Fear, heavy attacks, and escalating pressure.",
      "Tests Courage timing, Guard preparation, and anti-Giant attacks.",
    ],
    sourceTier: "Scripture",
    references: ["1 Samuel 17"],
    theologyNote:
      "Goliath is represented as the Philistine champion from Gath in 1 Samuel 17. The game does not tag him as Nephilim or Watcher-descended.",
    gameplayRole: "Boss",
  },
];
