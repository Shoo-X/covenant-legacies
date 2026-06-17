export type ArtAssetUsageStatus =
  | "prototype-concept"
  | "approved-for-demo"
  | "needs-review-before-commercial-release"
  | "final-licensed-art";

export type ArtAssetSourceType = "ai-generated-openai";

export type TheologicalSensitivity = "low" | "moderate" | "high";

export interface ArtAsset {
  id: string;
  title: string;
  path: string;
  sourceType: ArtAssetSourceType;
  generationTool: string;
  generatedForProject: boolean;
  usageStatus: ArtAssetUsageStatus;
  saga: "War of the Watchers";
  relatedCards: string[];
  relatedScreens: string[];
  tags: string[];
  notes: string;
  theologicalSensitivity: TheologicalSensitivity;
}

const openAiConceptDefaults = {
  sourceType: "ai-generated-openai",
  generationTool: "ChatGPT / OpenAI image generation",
  generatedForProject: true,
  usageStatus: "prototype-concept",
  saga: "War of the Watchers",
} satisfies Pick<
  ArtAsset,
  | "sourceType"
  | "generationTool"
  | "generatedForProject"
  | "usageStatus"
  | "saga"
>;

export const artAssets: ArtAsset[] = [
  {
    ...openAiConceptDefaults,
    id: "art-throne-room-vision",
    title: "Throne Room Vision",
    path: "/art/showcase/throne-room-vision.png",
    relatedCards: [],
    relatedScreens: ["Gallery", "Codex"],
    tags: ["vision", "reverence", "heavenly court", "divine glory"],
    notes:
      "High-sensitivity throne-room atmosphere concept for reverent gallery or codex use only after review.",
    theologicalSensitivity: "high",
  },
  {
    ...openAiConceptDefaults,
    id: "art-moses-divider-of-seas",
    title: "Moses, Divider of Seas",
    path: "/art/showcase/moses-divider-of-seas.png",
    relatedCards: ["card-moses-divider-of-seas"],
    relatedScreens: ["Gallery", "Collection", "Card Inspect"],
    tags: ["moses", "red sea", "deliverance", "prophet"],
    notes:
      "Prototype concept for the Red Sea deliverance theme; present as divine rescue through obedience, not human magic.",
    theologicalSensitivity: "moderate",
  },
  {
    ...openAiConceptDefaults,
    id: "art-archangel-michael",
    title: "Archangel Michael",
    path: "/art/showcase/archangel-michael.png",
    relatedCards: ["card-archangel-michael"],
    relatedScreens: ["Gallery", "Collection", "Card Inspect"],
    tags: ["archangel", "heavenly host", "judgment", "radiance"],
    notes:
      "High-sensitivity angelic concept; frame Michael as a servant under God's authority and avoid angelic worship.",
    theologicalSensitivity: "high",
  },
  {
    ...openAiConceptDefaults,
    id: "art-david-goliath-portrait",
    title: "David vs Goliath",
    path: "/art/showcase/david-goliath-portrait.png",
    relatedCards: ["card-david-vs-goliath"],
    relatedScreens: ["Gallery", "Collection", "Card Inspect"],
    tags: ["david", "goliath", "giant", "courage", "valley"],
    notes:
      "Combat-scale concept for covenant courage against a giant threat; emphasize trust and deliverance over spectacle.",
    theologicalSensitivity: "moderate",
  },
  {
    ...openAiConceptDefaults,
    id: "art-mary-empty-tomb",
    title: "Mary Magdalene at the Empty Tomb",
    path: "/art/showcase/mary-empty-tomb.png",
    relatedCards: ["card-mary-witness-to-glory"],
    relatedScreens: ["Gallery", "Collection", "Card Inspect", "Codex"],
    tags: ["mary magdalene", "empty tomb", "witness", "hope"],
    notes:
      "High-sensitivity resurrection witness concept; use reverently as testimony, not as a player-controlled power object.",
    theologicalSensitivity: "high",
  },
  {
    ...openAiConceptDefaults,
    id: "art-resurrection-empty-tomb",
    title: "The Resurrection Witness",
    path: "/art/showcase/resurrection-empty-tomb.png",
    relatedCards: [],
    relatedScreens: ["Gallery", "Codex"],
    tags: ["empty tomb", "resurrection", "witness", "hope"],
    notes:
      "High-sensitivity resurrection concept for gallery or codex reflection after review; avoid reducing divine glory to a collectible effect.",
    theologicalSensitivity: "high",
  },
  {
    ...openAiConceptDefaults,
    id: "art-abraham-stars",
    title: "Abraham",
    path: "/art/gallery/abraham-stars.png",
    relatedCards: [],
    relatedScreens: ["Gallery", "Codex"],
    tags: ["abraham", "stars", "promise", "covenant"],
    notes:
      "Covenant promise concept for future gallery, codex, or witness-card exploration.",
    theologicalSensitivity: "moderate",
  },
  {
    ...openAiConceptDefaults,
    id: "art-elijah-fire-from-heaven",
    title: "Elijah",
    path: "/art/gallery/elijah-fire-from-heaven.png",
    relatedCards: [],
    relatedScreens: ["Gallery", "Codex"],
    tags: ["elijah", "prophet", "fire", "judgment"],
    notes:
      "Prophetic judgment concept; use with care so divine intervention remains reverent, not spellcasting.",
    theologicalSensitivity: "moderate",
  },
  {
    ...openAiConceptDefaults,
    id: "art-noah-ark-covenant",
    title: "Noah",
    path: "/art/gallery/noah-ark-covenant.png",
    relatedCards: [],
    relatedScreens: ["Gallery", "Codex"],
    tags: ["noah", "ark", "covenant", "judgment", "mercy"],
    notes:
      "Covenant preservation concept for future gallery or codex use.",
    theologicalSensitivity: "moderate",
  },
  {
    ...openAiConceptDefaults,
    id: "art-samuel-temple",
    title: "Samuel",
    path: "/art/gallery/samuel-temple.png",
    relatedCards: [],
    relatedScreens: ["Gallery", "Codex"],
    tags: ["samuel", "temple", "calling", "prophet"],
    notes:
      "Calling and obedience concept for future gallery or codex use.",
    theologicalSensitivity: "moderate",
  },
  {
    ...openAiConceptDefaults,
    id: "art-peter-witness",
    title: "Peter",
    path: "/art/gallery/peter-witness.png",
    relatedCards: [],
    relatedScreens: ["Gallery", "Codex"],
    tags: ["peter", "witness", "apostle", "restoration"],
    notes:
      "Apostolic witness concept; handle as testimony and restoration rather than spectacle.",
    theologicalSensitivity: "moderate",
  },
  {
    ...openAiConceptDefaults,
    id: "art-samson-pillars",
    title: "Samson",
    path: "/art/heroes/samson-pillars.png",
    relatedCards: [],
    relatedScreens: ["Gallery"],
    tags: ["samson", "pillars", "strength", "judgment"],
    notes:
      "Heroic judgment concept for gallery review; future gameplay use should avoid glamorizing vengeance.",
    theologicalSensitivity: "moderate",
  },
  {
    ...openAiConceptDefaults,
    id: "art-ruth-fields",
    title: "Ruth",
    path: "/art/heroes/ruth-fields.png",
    relatedCards: [],
    relatedScreens: ["Gallery", "Codex"],
    tags: ["ruth", "fields", "loyalty", "provision"],
    notes:
      "Loyalty and provision concept for future gallery, codex, or support-card exploration.",
    theologicalSensitivity: "moderate",
  },
  {
    ...openAiConceptDefaults,
    id: "art-shepherd-david",
    title: "Shepherd David",
    path: "/art/heroes/shepherd-david.png",
    relatedCards: ["card-sling-stone", "card-shepherds-guard"],
    relatedScreens: ["Gallery", "Hero Select"],
    tags: ["david", "shepherd", "harp", "sling", "courage"],
    notes:
      "Shepherd-era David concept; useful for hero presentation and covenant courage references.",
    theologicalSensitivity: "moderate",
  },
  {
    ...openAiConceptDefaults,
    id: "art-daniel-lions-den",
    title: "Daniel in the Lions' Den",
    path: "/art/heroes/daniel-lions-den.png",
    relatedCards: [],
    relatedScreens: ["Gallery", "Codex"],
    tags: ["daniel", "lions", "faithfulness", "deliverance"],
    notes:
      "Faithfulness under pressure concept for gallery and codex review.",
    theologicalSensitivity: "moderate",
  },
];
