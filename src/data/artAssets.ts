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
  additionalPaths?: string[];
  objectFit?: "contain" | "cover";
  objectPosition?: string;
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
    additionalPaths: ["/art/incoming/throne-room-vision.png"],
    objectPosition: "50% 42%",
    relatedCards: [],
    relatedScreens: ["Gallery", "Codex"],
    tags: [
      "vision",
      "reverence",
      "heavenly court",
      "divine glory",
      "mystery",
      "throne-room-vision",
    ],
    notes:
      "High-sensitivity throne-room atmosphere concept for reverent gallery or codex use only after review.",
    theologicalSensitivity: "high",
  },
  {
    ...openAiConceptDefaults,
    id: "art-moses-divider-of-seas",
    title: "Moses, Divider of Seas",
    path: "/art/showcase/moses-divider-of-seas.png",
    additionalPaths: [
      "/art/cards/moses-divider-of-seas.png",
      "/art/incoming/moses-divider-of-seas.png",
    ],
    objectPosition: "46% 36%",
    relatedCards: ["card-moses-divider-of-seas", "card-psalm-of-deliverance"],
    relatedScreens: ["Home", "Gallery", "Collection", "Card Inspect", "Combat"],
    tags: ["moses", "red sea", "deliverance", "prophet", "covenant"],
    notes:
      "Prototype concept for the Red Sea deliverance theme; present as divine rescue through obedience, not human magic.",
    theologicalSensitivity: "moderate",
  },
  {
    ...openAiConceptDefaults,
    id: "art-archangel-michael",
    title: "Archangel Michael",
    path: "/art/showcase/archangel-michael.png",
    additionalPaths: [
      "/art/cards/archangel-michael.png",
      "/art/incoming/archangel-michael.png",
    ],
    objectPosition: "52% 36%",
    relatedCards: ["card-archangel-michael"],
    relatedScreens: ["Home", "Gallery", "Collection", "Card Inspect", "Combat"],
    tags: ["archangel", "heavenly host", "judgment", "radiance", "mystery"],
    notes:
      "High-sensitivity angelic concept; frame Michael as a servant under God's authority and avoid angelic worship.",
    theologicalSensitivity: "high",
  },
  {
    ...openAiConceptDefaults,
    id: "art-david-goliath-portrait",
    title: "David vs Goliath",
    path: "/art/showcase/david-goliath-portrait.png",
    additionalPaths: [
      "/art/cards/david-vs-goliath.png",
      "/art/incoming/david-goliath-portrait.png",
    ],
    objectPosition: "44% 32%",
    relatedCards: ["card-david-vs-goliath", "card-giant-toppler"],
    relatedScreens: ["Home", "Gallery", "Collection", "Card Inspect", "Combat"],
    tags: ["david", "goliath", "giant", "courage", "valley", "covenant"],
    notes:
      "Combat-scale concept for covenant courage against a giant threat; emphasize trust and deliverance over spectacle.",
    theologicalSensitivity: "moderate",
  },
  {
    ...openAiConceptDefaults,
    id: "art-mary-empty-tomb",
    title: "Mary Magdalene at the Empty Tomb",
    path: "/art/showcase/mary-empty-tomb.png",
    additionalPaths: [
      "/art/cards/mary-magdalene-empty-tomb.png",
      "/art/incoming/mary-empty-tomb.png",
    ],
    objectPosition: "42% 30%",
    relatedCards: ["card-mary-witness-to-glory"],
    relatedScreens: ["Home", "Gallery", "Collection", "Card Inspect", "Codex", "Combat"],
    tags: ["mary magdalene", "empty tomb", "witness", "hope", "resurrection"],
    notes:
      "High-sensitivity resurrection witness concept; use reverently as testimony, not as a player-controlled power object.",
    theologicalSensitivity: "high",
  },
  {
    ...openAiConceptDefaults,
    id: "art-resurrection-empty-tomb",
    title: "The Resurrection Witness",
    path: "/art/showcase/resurrection-empty-tomb.png",
    additionalPaths: ["/art/incoming/resurrection-empty-tomb.png"],
    objectPosition: "50% 42%",
    relatedCards: [],
    relatedScreens: ["Gallery", "Codex"],
    tags: ["empty tomb", "resurrection", "witness", "hope", "mystery"],
    notes:
      "High-sensitivity resurrection concept for gallery or codex reflection after review; avoid reducing divine glory to a collectible effect.",
    theologicalSensitivity: "high",
  },
  {
    ...openAiConceptDefaults,
    id: "art-abraham-stars",
    title: "Abraham",
    path: "/art/gallery/abraham-stars.png",
    additionalPaths: ["/art/incoming/abraham-stars.png"],
    objectPosition: "50% 34%",
    relatedCards: [],
    relatedScreens: ["Gallery", "Codex"],
    tags: ["abraham", "stars", "promise", "covenant", "witness"],
    notes:
      "Covenant promise concept for future gallery, codex, or witness-card exploration.",
    theologicalSensitivity: "moderate",
  },
  {
    ...openAiConceptDefaults,
    id: "art-elijah-fire-from-heaven",
    title: "Elijah",
    path: "/art/gallery/elijah-fire-from-heaven.png",
    additionalPaths: ["/art/incoming/elijah-fire-from-heaven.png"],
    objectPosition: "50% 38%",
    relatedCards: [],
    relatedScreens: ["Gallery", "Codex"],
    tags: ["elijah", "prophet", "fire", "judgment", "covenant"],
    notes:
      "Prophetic judgment concept; use with care so divine intervention remains reverent, not spellcasting.",
    theologicalSensitivity: "moderate",
  },
  {
    ...openAiConceptDefaults,
    id: "art-noah-ark-covenant",
    title: "Noah",
    path: "/art/gallery/noah-ark-covenant.png",
    additionalPaths: ["/art/incoming/noah-ark-covenant.png"],
    objectPosition: "50% 36%",
    relatedCards: [],
    relatedScreens: ["Gallery", "Codex"],
    tags: ["noah", "ark", "covenant", "judgment", "deliverance", "mercy"],
    notes:
      "Covenant preservation concept for future gallery or codex use.",
    theologicalSensitivity: "moderate",
  },
  {
    ...openAiConceptDefaults,
    id: "art-samuel-temple",
    title: "Samuel",
    path: "/art/gallery/samuel-temple.png",
    additionalPaths: ["/art/incoming/samuel-temple.png"],
    objectPosition: "50% 34%",
    relatedCards: [],
    relatedScreens: ["Gallery", "Codex"],
    tags: ["samuel", "temple", "calling", "prophet", "witness"],
    notes:
      "Calling and obedience concept for future gallery or codex use.",
    theologicalSensitivity: "moderate",
  },
  {
    ...openAiConceptDefaults,
    id: "art-peter-witness",
    title: "Peter",
    path: "/art/gallery/peter-witness.png",
    additionalPaths: ["/art/incoming/peter-witness.png"],
    objectPosition: "48% 34%",
    relatedCards: [],
    relatedScreens: ["Gallery", "Codex"],
    tags: ["peter", "witness", "apostle", "restoration", "covenant"],
    notes:
      "Apostolic witness concept; handle as testimony and restoration rather than spectacle.",
    theologicalSensitivity: "moderate",
  },
  {
    ...openAiConceptDefaults,
    id: "art-samson-pillars",
    title: "Samson",
    path: "/art/heroes/samson-pillars.png",
    additionalPaths: ["/art/incoming/samson-pillars.png"],
    objectPosition: "50% 36%",
    relatedCards: [],
    relatedScreens: ["Gallery"],
    tags: ["samson", "pillars", "strength", "judgment", "deliverance"],
    notes:
      "Heroic judgment concept for gallery review; future gameplay use should avoid glamorizing vengeance.",
    theologicalSensitivity: "moderate",
  },
  {
    ...openAiConceptDefaults,
    id: "art-ruth-fields",
    title: "Ruth",
    path: "/art/heroes/ruth-fields.png",
    additionalPaths: ["/art/incoming/ruth-fields.png"],
    objectPosition: "48% 35%",
    relatedCards: [],
    relatedScreens: ["Gallery", "Codex"],
    tags: ["ruth", "fields", "loyalty", "provision", "witness"],
    notes:
      "Loyalty and provision concept for future gallery, codex, or support-card exploration.",
    theologicalSensitivity: "moderate",
  },
  {
    ...openAiConceptDefaults,
    id: "art-shepherd-david",
    title: "Shepherd David",
    path: "/art/heroes/shepherd-david.png",
    additionalPaths: ["/art/incoming/shepard-david.png"],
    objectPosition: "48% 26%",
    relatedCards: ["card-sling-stone", "card-shepherds-guard"],
    relatedScreens: ["Gallery", "Hero Select"],
    tags: ["david", "shepherd", "harp", "sling", "courage", "covenant", "giant"],
    notes:
      "Shepherd-era David concept; useful for hero presentation and covenant courage references.",
    theologicalSensitivity: "moderate",
  },
  {
    ...openAiConceptDefaults,
    id: "art-daniel-lions-den",
    title: "Daniel in the Lions' Den",
    path: "/art/heroes/daniel-lions-den.png",
    additionalPaths: ["/art/incoming/daniel-lions-den.png"],
    objectPosition: "50% 36%",
    relatedCards: [],
    relatedScreens: ["Gallery", "Codex"],
    tags: ["daniel", "lions", "faithfulness", "deliverance", "witness"],
    notes:
      "Faithfulness under pressure concept for gallery and codex review.",
    theologicalSensitivity: "moderate",
  },
];

export function getArtAsset(assetId: string) {
  return artAssets.find((asset) => asset.id === assetId);
}

export function getArtAssetPath(assetId: string) {
  return getArtAsset(assetId)?.path;
}

export function getArtAssetByPath(path?: string) {
  if (!path) {
    return undefined;
  }

  return artAssets.find(
    (asset) => asset.path === path || asset.additionalPaths?.includes(path),
  );
}

export function getAllTrackedArtPaths() {
  return artAssets.flatMap((asset) => [
    asset.path,
    ...(asset.additionalPaths ?? []),
  ]);
}
