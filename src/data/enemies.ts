import type { Enemy } from "@/types/game";
import { getArtAsset } from "@/data/artAssets";

const davidGoliathArt = getArtAsset("art-david-goliath-portrait");

export const enemies: Enemy[] = [
  {
    id: "enemy-corrupted-raider",
    name: "Corrupted Raider",
    title: "Spoiler of the Valley Road",
    maxHealth: 32,
    attackDamage: 6,
    intent: "Attack",
    traits: ["Human"],
    sourceTier: "Speculative Fiction",
    references: ["Original adversary"],
    theologyNote:
      "A fictional human enemy showing moral corruption without treating evil as glamorous.",
    gameplayRole: "Attack",
  },
  {
    id: "enemy-idol-priest",
    name: "Idol-Priest",
    title: "Keeper of the Carved High Place",
    maxHealth: 28,
    attackDamage: 5,
    intent: "Weaken and attack",
    traits: ["Human", "Idol"],
    mechanics: ["Applies Fear pressure through idolatrous intimidation."],
    sourceTier: "Speculative Fiction",
    references: ["Original adversary", "Idolatry as broad biblical theme"],
    theologyNote:
      "Idolatry is handled as spiritual rebellion and fear pressure, not as occult spectacle.",
    gameplayRole: "Trial",
  },
  {
    id: "enemy-giant-blooded-brute",
    name: "Giant-Blooded Brute",
    title: "Breaker of the Lower Pass",
    maxHealth: 48,
    attackDamage: 11,
    intent: "Heavy attack",
    traits: ["Giant"],
    imagePath: davidGoliathArt?.path,
    artworkTitle: davidGoliathArt?.title ?? "David vs Goliath",
    imageObjectPosition: "74% 34%",
    mechanics: ["Takes extra damage from Sling Stone and anti-Giant effects."],
    sourceTier: "Speculative Fiction",
    references: ["Original adversary", "1 Samuel 17 as thematic inspiration"],
    theologyNote:
      "A fictional giant-class enemy used to support the Shepherd King's anti-giant combat identity.",
    gameplayRole: "Attack",
  },
  {
    id: "enemy-watcher-taught-smith",
    name: "Watcher-Taught Smith",
    title: "Forger of Forbidden Edges",
    maxHealth: 42,
    attackDamage: 8,
    intent: "Buff self and attack",
    traits: ["Human", "Watcher"],
    mechanics: ["Gains Might before attacking."],
    sourceTier: "Interpretive Tradition",
    references: ["Genesis 6:1-4 as interpretive inspiration"],
    theologyNote:
      "Forbidden knowledge is presented as corrupting instruction rather than admirable mastery.",
    gameplayRole: "Trial",
  },
  {
    id: "enemy-giant-of-the-high-place",
    name: "The Giant of the High Place",
    title: "Idol-Crowned Nephilim Tyrant",
    maxHealth: 90,
    attackDamage: 12,
    intent: "Crush through fear and accumulated Might",
    traits: ["Nephilim", "Giant", "Idol", "Boss"],
    imagePath: davidGoliathArt?.path,
    artworkTitle: davidGoliathArt?.title ?? "David vs Goliath",
    imageObjectPosition: "75% 33%",
    mechanics: [
      "Starts combat with Fear pressure.",
      "Gains Might when the player gains Corruption.",
      "Takes extra damage from Sling Stone and anti-Giant effects.",
    ],
    sourceTier: "Speculative Fiction",
    references: ["Genesis 6:1-4", "1 Samuel 17 as thematic inspiration"],
    theologyNote:
      "This boss is original speculative fiction, combining high-place idolatry and giant imagery without depicting a named biblical person.",
    gameplayRole: "Boss",
  },
];
