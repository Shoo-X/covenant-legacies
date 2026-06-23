import {
  artAssets,
  getArtAsset,
  getArtAssetByPath,
  type ArtAsset,
} from "@/data/artAssets";
import { cards } from "@/data/cards";
import { encounters } from "@/data/encounters";
import { enemies } from "@/data/enemies";
import { heroes } from "@/data/heroes";
import type { Card, Encounter, Enemy, SourceTier } from "@/types/game";

export type ArtAssetType =
  | "card"
  | "enemy"
  | "gallery-art"
  | "map-node"
  | "resource-icon"
  | "ui-panel";

export type ArtCurrentStatus = "missing" | "placeholder" | "final";

export type ArtAspectRatio = "portrait" | "landscape" | "square";

export type ArtPriority = "P0" | "P1" | "P2" | "P3" | "P4";

export interface ArtRegistryItem {
  assetId: string;
  displayName: string;
  assetType: ArtAssetType;
  targetFilePath: string;
  currentStatus: ArtCurrentStatus;
  recommendedPrompt: string;
  aspectRatio: ArtAspectRatio;
  usageLocations: string[];
  priority: ArtPriority;
}

const covenantArtStyle =
  "Animated biblical fantasy, Prince of Egypt / DreamWorks inspired, painterly TCG art, warm divine lighting, ancient Near Eastern authenticity, family-friendly, readable at small card size.";

const davidStartingDeckIds = new Set(
  heroes
    .find((hero) => hero.id === "hero-david-shepherd-of-bethlehem")
    ?.startingDeck.map((entry) => entry.cardId) ?? [],
);

const currentEncounterEnemyIds = new Set(
  encounters.flatMap((encounter) => encounter.enemyIds),
);

const representedRuntimeArtPaths = new Set(
  [
    ...cards.map((card) => card.imagePath),
    ...enemies.map((enemy) => enemy.imagePath),
  ].filter(isDefined),
);

const standaloneGalleryAssets = artAssets.filter(
  (asset) =>
    asset.relatedScreens.includes("Gallery") &&
    !representedRuntimeArtPaths.has(asset.path),
);

const resourceIconNeeds = [
  {
    displayName: "Resolve",
    description:
      "bronze courage and steady grit, a simple weapon-and-path mark that reads clearly as action energy",
  },
  {
    displayName: "Faith",
    description:
      "warm gold trust and prayer, a humble lamp-light or lifted-hands mark without spellcasting imagery",
  },
  {
    displayName: "Wisdom",
    description:
      "cool blue discernment and careful judgment, a scroll-and-light mark with restrained clarity",
  },
  {
    displayName: "Authority",
    description:
      "royal command under covenant, a seal or staff mark that feels ordered and submitted",
  },
  {
    displayName: "Corruption",
    description:
      "restrained crimson warning pressure, fractured stain motif that feels dangerous and cautionary, not alluring",
  },
];

const uiPanelNeeds = [
  {
    id: "ui-panel-card-frame-ornament",
    displayName: "Collectible Card Frame Ornament",
    targetFilePath: "/art/ui/panels/card-frame-ornament.png",
    aspectRatio: "portrait" as const,
    locations: ["CollectibleCard", "RewardScreen", "Collection", "Gallery"],
    description:
      "ornamental bronze and parchment card-frame treatment for readable TCG cards",
    priority: "P1" as const,
  },
  {
    id: "ui-panel-campaign-map-parchment",
    displayName: "Campaign Map Parchment Overlay",
    targetFilePath: "/art/ui/panels/campaign-map-parchment.png",
    aspectRatio: "landscape" as const,
    locations: ["Campaign Map"],
    description:
      "subtle parchment route-map overlay with valley ridges, brook marks, battle-line scoring, and bronze edge wear",
    priority: "P1" as const,
  },
  {
    id: "ui-panel-combat-battlefield-frame",
    displayName: "Combat Battlefield Frame",
    targetFilePath: "/art/ui/panels/combat-battlefield-frame.png",
    aspectRatio: "landscape" as const,
    locations: ["Combat"],
    description:
      "cinematic battlefield panel frame that supports enemy, intent, David state, hand, and battle log readability",
    priority: "P1" as const,
  },
  {
    id: "ui-panel-decision-modal-ornament",
    displayName: "Decision Modal Ornament",
    targetFilePath: "/art/ui/panels/decision-modal-ornament.png",
    aspectRatio: "landscape" as const,
    locations: ["RewardScreen", "MysteryEncounterScreen", "RestNodeScreen"],
    description:
      "restrained bronze divider and parchment warmth for choice screens, weighty but not flashy",
    priority: "P2" as const,
  },
  {
    id: "ui-panel-gallery-archive-frame",
    displayName: "Gallery Archive Frame",
    targetFilePath: "/art/ui/panels/gallery-archive-frame.png",
    aspectRatio: "landscape" as const,
    locations: ["Gallery"],
    description:
      "premium archive frame for art browsing, dark charcoal with bronze/gold gallery accents",
    priority: "P3" as const,
  },
  {
    id: "ui-panel-codex-archive-frame",
    displayName: "Codex Archive Frame",
    targetFilePath: "/art/ui/panels/codex-archive-frame.png",
    aspectRatio: "landscape" as const,
    locations: ["Codex"],
    description:
      "scripture-and-lore archive frame with reverent parchment warmth and readable source-tier structure",
    priority: "P3" as const,
  },
  {
    id: "ui-panel-audio-settings-frame",
    displayName: "Settings Panel Frame",
    targetFilePath: "/art/ui/panels/settings-panel-frame.png",
    aspectRatio: "landscape" as const,
    locations: ["Settings", "AudioSettingsPanel"],
    description:
      "small premium settings panel treatment for sliders and toggles without breaking the top navigation",
    priority: "P3" as const,
  },
];

export const artRegistry: ArtRegistryItem[] = [
  ...cards.map(createCardRegistryItem),
  ...enemies.map(createEnemyRegistryItem),
  ...standaloneGalleryAssets.map(createGalleryArtRegistryItem),
  ...encounters.map(createMapNodeRegistryItem),
  ...resourceIconNeeds.map(createResourceIconRegistryItem),
  ...uiPanelNeeds.map(createUiPanelRegistryItem),
];

export const artRegistrySummary = {
  total: artRegistry.length,
  missing: artRegistry.filter((item) => item.currentStatus === "missing").length,
  placeholder: artRegistry.filter((item) => item.currentStatus === "placeholder").length,
  final: artRegistry.filter((item) => item.currentStatus === "final").length,
};

export function getArtNeedsByStatus(status: ArtCurrentStatus) {
  return artRegistry.filter((item) => item.currentStatus === status);
}

function createCardRegistryItem(card: Card): ArtRegistryItem {
  const status = getStatusFromArt(card.artAssetId, card.imagePath);
  const targetFilePath = card.imagePath ?? `/art/cards/${slugify(card.name)}.png`;
  const isDavidCard = card.cardSet === "David's Legacy";
  const isStarterCard = davidStartingDeckIds.has(card.id);

  return {
    assetId: card.artAssetId ?? `art-card-${card.id.replace(/^card-/, "")}`,
    displayName: card.name,
    assetType: "card",
    targetFilePath,
    currentStatus: status,
    recommendedPrompt: createCardPrompt(card),
    aspectRatio: "portrait",
    usageLocations: [
      "Collection",
      "Gallery",
      "Card Detail",
      "Combat Hand",
      ...(isStarterCard ? ["David Starting Deck"] : []),
      ...(card.cardSet ? [card.cardSet] : []),
    ],
    priority: getCardPriority(card, status, isStarterCard, isDavidCard),
  };
}

function createEnemyRegistryItem(enemy: Enemy): ArtRegistryItem {
  const status = getStatusFromArt(undefined, enemy.imagePath);
  const isCampaignEnemy = currentEncounterEnemyIds.has(enemy.id);

  return {
    assetId: `art-${enemy.id.replace(/^enemy-/, "")}`,
    displayName: enemy.name,
    assetType: "enemy",
    targetFilePath: enemy.imagePath ?? `/art/enemies/${slugify(enemy.name)}.png`,
    currentStatus: status,
    recommendedPrompt: createEnemyPrompt(enemy),
    aspectRatio: "portrait",
    usageLocations: [
      "Combat",
      "Gallery",
      "Codex",
      ...(isCampaignEnemy ? ["The Valley of the Giant"] : []),
    ],
    priority: status === "final" ? "P4" : isCampaignEnemy ? "P0" : "P2",
  };
}

function createGalleryArtRegistryItem(asset: ArtAsset): ArtRegistryItem {
  const status: ArtCurrentStatus =
    asset.usageStatus === "final-licensed-art" ? "final" : "placeholder";

  return {
    assetId: asset.id,
    displayName: asset.title,
    assetType: "gallery-art",
    targetFilePath: asset.path,
    currentStatus: status,
    recommendedPrompt: [
      covenantArtStyle,
      `Standalone gallery or codex showcase art for "${asset.title}".`,
      `Tags: ${asset.tags.join(", ")}. Usage: ${asset.relatedScreens.join(", ")}.`,
      asset.notes,
      asset.theologicalSensitivity === "high"
        ? "High-sensitivity imagery must be especially reverent, restrained, and reviewed before use."
        : "Keep the image reverent, readable, and consistent with the Covenant: Legacies art direction.",
    ].join(" "),
    aspectRatio: "portrait",
    usageLocations: asset.relatedScreens,
    priority: status === "final" ? "P4" : "P3",
  };
}

function createMapNodeRegistryItem(encounter: Encounter): ArtRegistryItem {
  return {
    assetId: `art-node-${encounter.id.replace(/^encounter-/, "")}`,
    displayName: encounter.name,
    assetType: "map-node",
    targetFilePath: `/art/campaign/nodes/${slugify(encounter.name)}.png`,
    currentStatus: "missing",
    recommendedPrompt: createMapNodePrompt(encounter),
    aspectRatio: "landscape",
    usageLocations: ["Campaign Map", encounter.region, encounter.nodeType],
    priority: encounter.difficulty === "Boss" ? "P0" : "P1",
  };
}

function createResourceIconRegistryItem(resource: (typeof resourceIconNeeds)[number]): ArtRegistryItem {
  return {
    assetId: `art-icon-resource-${slugify(resource.displayName)}`,
    displayName: `${resource.displayName} Resource Icon`,
    assetType: "resource-icon",
    targetFilePath: `/art/icons/resources/${slugify(resource.displayName)}.png`,
    currentStatus: "placeholder",
    recommendedPrompt: [
      covenantArtStyle,
      `Square UI icon for ${resource.displayName}: ${resource.description}.`,
      "Simple silhouette, readable at 18-32 px, transparent-friendly edges, no occult symbols, no magic circles.",
    ].join(" "),
    aspectRatio: "square",
    usageLocations: ["ResourceBadge", "ResourceStrip", "Combat", "Cards"],
    priority: "P1",
  };
}

function createUiPanelRegistryItem(panel: (typeof uiPanelNeeds)[number]): ArtRegistryItem {
  return {
    assetId: panel.id,
    displayName: panel.displayName,
    assetType: "ui-panel",
    targetFilePath: panel.targetFilePath,
    currentStatus: "missing",
    recommendedPrompt: [
      covenantArtStyle,
      `Reusable UI panel asset: ${panel.description}.`,
      "Dark charcoal foundation, bronze/gold accents, subtle parchment warmth, refined depth, no occult symbols.",
    ].join(" "),
    aspectRatio: panel.aspectRatio,
    usageLocations: panel.locations,
    priority: panel.priority,
  };
}

function getStatusFromArt(assetId?: string, imagePath?: string): ArtCurrentStatus {
  const asset = assetId ? getArtAsset(assetId) : getArtAssetByPath(imagePath);

  if (asset?.usageStatus === "final-licensed-art") {
    return "final";
  }

  if (asset || imagePath) {
    return "placeholder";
  }

  return "missing";
}

function getCardPriority(
  card: Card,
  status: ArtCurrentStatus,
  isStarterCard: boolean,
  isDavidCard: boolean,
): ArtPriority {
  if (status === "final") {
    return "P4";
  }

  if (isStarterCard || card.id === "card-david-vs-goliath") {
    return "P0";
  }

  if (status === "missing" && isDavidCard) {
    return "P1";
  }

  if (status === "missing") {
    return "P2";
  }

  return isDavidCard ? "P2" : "P3";
}

function createCardPrompt(card: Card) {
  const caution = getCautionText(card.sourceTier, card.name, card.type);

  return [
    covenantArtStyle,
    `Portrait TCG card art for "${card.name}", a ${card.rarity} ${card.type} card.`,
    `Gameplay read: ${card.gameplayRole}. Visual tags: ${(card.visualTags ?? card.archetypeTags ?? []).join(", ") || "covenant adventure"}.`,
    `Card text inspiration: ${card.text}`,
    referencesLine(card.references, card.sourceTier),
    caution,
  ]
    .filter(Boolean)
    .join(" ");
}

function createEnemyPrompt(enemy: Enemy) {
  const caution = getCautionText(enemy.sourceTier, enemy.name, enemy.traits.join(" "));

  return [
    covenantArtStyle,
    `Portrait enemy art for "${enemy.name}", ${enemy.title}.`,
    `Traits: ${enemy.traits.join(", ")}. Mechanics: ${(enemy.mechanics ?? []).join(" ")}`,
    referencesLine(enemy.references, enemy.sourceTier),
    "Make the silhouette clear for combat targeting and readable at medium UI size.",
    caution,
  ]
    .filter(Boolean)
    .join(" ");
}

function createMapNodePrompt(encounter: Encounter) {
  return [
    covenantArtStyle,
    `Landscape campaign node/location art for "${encounter.name}" in ${encounter.region}.`,
    `Node type: ${encounter.nodeType}. Scene: ${encounter.description ?? encounter.rewardPreview}`,
    referencesLine(encounter.references, encounter.sourceTier),
    "Designed as a route-map vignette: clear focal point, enough negative space for node labels, no browser-like UI elements.",
    getCautionText(encounter.sourceTier, encounter.name, encounter.nodeType),
  ]
    .filter(Boolean)
    .join(" ");
}

function referencesLine(references: string[], sourceTier: SourceTier) {
  return `Source tier: ${sourceTier}. References: ${references.join("; ")}.`;
}

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

function getCautionText(sourceTier: SourceTier, name: string, context: string) {
  const source = `${name} ${context}`.toLowerCase();

  if (source.includes("forbidden") || source.includes("watcher")) {
    return "Forbidden or Watcher material must feel cautionary and spiritually dangerous, not glamorous or doctrinal.";
  }

  if (source.includes("goliath") || source.includes("giant")) {
    return "Do not state or imply that Goliath is Nephilim or Watcher-descended as fact.";
  }

  if (sourceTier === "Speculative Fiction") {
    return "Clearly treat speculative material as fiction and avoid presenting it as doctrine.";
  }

  if (source.includes("angel")) {
    return "Angelic imagery should feel like delegated divine intervention, not player-controlled magic.";
  }

  return "Prayer, covenant, courage, and divine help should feel reverent rather than spellcasting.";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
