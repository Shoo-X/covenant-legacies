import type { Hero } from "@/types/game";
import { getArtAsset } from "@/data/artAssets";

const shepherdDavidArt = getArtAsset("art-shepherd-david");

export const heroes: Hero[] = [
  {
    id: "hero-shepherd-king",
    name: "The Shepherd King",
    epithet: "Courage, worship, and the guarded flock",
    calling:
      "A David-inspired covenant champion who stands before giants with song, resolve, and a shepherd's defiant care.",
    imagePath: shepherdDavidArt?.path,
    artworkTitle: shepherdDavidArt?.title ?? "Shepherd David",
    imageObjectPosition: shepherdDavidArt?.objectPosition ?? "48% 26%",
    maxHealth: 72,
    passive: {
      name: "Heart of Courage",
      text: "The first time each battle you face an enemy with the Giant or Nephilim trait, gain 1 Faith and 1 Resolve.",
    },
    startingDeck: [
      { cardId: "card-sling-stone", quantity: 4 },
      { cardId: "card-shepherds-guard", quantity: 4 },
      { cardId: "card-psalm-of-courage", quantity: 2 },
    ],
    resourceState: {
      resolve: 3,
      faith: 2,
      wisdom: 0,
      authority: 1,
      corruption: 0,
    },
    sourceTier: "Speculative Fiction",
    references: ["Original hero archetype", "1 Samuel 16-17", "Psalms"],
    theologyNote:
      "This is an originalized David-inspired archetype, not a direct depiction of the biblical David.",
    gameplayRole: "Anti-Giant",
  },
];
