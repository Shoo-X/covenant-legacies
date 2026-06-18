export type SourceTier =
  | "Scripture"
  | "Interpretive Tradition"
  | "Speculative Fiction";

export type GameplayRole =
  | "Attack"
  | "Anti-Giant"
  | "Defense"
  | "Card Draw"
  | "Corruption"
  | "Prayer"
  | "Judgment"
  | "Tactic"
  | "Trial"
  | "Support"
  | "Memorial"
  | "Boss"
  | "Map Node";

export type RepresentationMode =
  | "Legacy"
  | "Witness"
  | "Intervention"
  | "Prayer"
  | "CovenantMemory"
  | "MysteryEncounter"
  | "ForbiddenWarning"
  | "Enemy"
  | "SpeculativeEnemy";

export type ResourceName =
  | "Resolve"
  | "Faith"
  | "Wisdom"
  | "Authority"
  | "Corruption";

export type EnemyTrait =
  | "Beast"
  | "Boss"
  | "Demon"
  | "Empire"
  | "False Prophet"
  | "Human"
  | "Idol"
  | "Giant"
  | "Nephilim"
  | "Principality"
  | "Spirit"
  | "Watcher";

export type CombatStatusName =
  | "Fear"
  | "Weaken"
  | "Courage"
  | "Might"
  | "Protected"
  | "Burning"
  | "Discerned";

export type CardEffectTarget = "Player" | "Enemy";

export type TemporaryCardDestination = "Hand" | "DrawPile" | "DiscardPile";

export type MapNodeType =
  | "Battle"
  | "Mystery Encounter"
  | "Elite"
  | "Rest / Upgrade"
  | "Boss";

export type MysteryEncounterType =
  | "MysteryEncounter"
  | "ForbiddenMysteryEncounter";

export interface SourceBackedContent {
  sourceTier: SourceTier;
  references: string[];
  theologyNote: string;
  gameplayRole: GameplayRole;
  representationMode?: RepresentationMode;
}

export interface ResourceCost {
  amount: number;
  resource?: ResourceName;
}

export type ArchetypeTag =
  | "Courage"
  | "Psalm"
  | "Kingdom"
  | "Covenant"
  | "Forbidden";

export type CardRarity =
  | "Common"
  | "Uncommon"
  | "Rare"
  | "Epic"
  | "Legendary"
  | "Mythic Legendary"
  | "Mystery";

export type CardSet = "War of the Watchers" | "Core Covenant";

export interface CardArtMetadata {
  artAssetId?: string;
  imagePath?: string;
  artworkTitle?: string;
  imageObjectFit?: "contain" | "cover";
  imageObjectPosition?: string;
  artistCredit?: string;
  cardSet?: CardSet;
  flavorText?: string;
  visualTags?: string[];
}

export interface CardCombatEffect {
  damage?: number;
  antiGiantDamage?: number;
  guard?: number;
  heal?: number;
  draw?: number;
  removeFear?: boolean;
  removeCorruption?: number;
  gainResolve?: number;
  gainFaith?: number;
  gainWisdom?: number;
  gainAuthority?: number;
  gainCorruption?: number;
  nextAttackBonus?: number;
  nextPrayerCostReduction?: number;
  ifCorruptionZero?: Omit<CardCombatEffect, "ifCorruptionZero">;
  note?: string;
}

export interface BonusAgainstTraitEffect {
  type: "BonusAgainstTrait";
  amount: number;
  traits: EnemyTrait[];
  message?: string;
}

export type CardEffect =
  | {
      type: "DealDamage";
      amount: number;
      bonuses?: BonusAgainstTraitEffect[];
      message?: string;
    }
  | { type: "GainGuard"; amount: number; source?: string }
  | { type: "Heal"; amount: number }
  | { type: "DrawCards"; amount: number }
  | { type: "GainResource"; amount: number; resource: ResourceName }
  | { type: "LoseResource"; amount: number; resource: ResourceName }
  | {
      type: "ApplyStatus";
      amount?: number;
      status: CombatStatusName;
      target: CardEffectTarget;
    }
  | {
      type: "RemoveStatus";
      amount?: number;
      status: CombatStatusName;
      target: CardEffectTarget;
    }
  | { type: "GainCorruption"; amount: number }
  | { type: "RemoveCorruption"; amount: number }
  | {
      type: "AddTemporaryCard";
      cardId: string;
      destination: TemporaryCardDestination;
      quantity?: number;
    }
  | { type: "ModifyNextAttack"; amount: number }
  | BonusAgainstTraitEffect
  | { type: "TriggerIfEnemyTrait"; effects: CardEffect[]; traits: EnemyTrait[] }
  | { type: "TriggerIfCorruptionAtMost"; amount: number; effects: CardEffect[] }
  | { type: "TriggerIfCorruptionAtLeast"; amount: number; effects: CardEffect[] }
  | {
      type: "TriggerIfStatusPresent";
      effects: CardEffect[];
      status: CombatStatusName;
      target: CardEffectTarget;
    }
  | { type: "RevealIntent" }
  | { type: "DestroyAltarOrStructure"; label?: string }
  | { type: "ModifyNextPrayerCost"; amount: number }
  | { type: "DoubleCovenantEffectsThisTurn" }
  | { type: "AddFeedback"; message: string };

export interface Card extends SourceBackedContent, CardArtMetadata {
  id: string;
  name: string;
  cost: ResourceCost[];
  isUpgraded?: boolean;
  isPlayable?: boolean;
  text: string;
  type: string;
  rarity: CardRarity;
  archetypeTags?: ArchetypeTag[];
  synergyNotes?: string;
  strategyNotes?: string;
  scriptureAnchors?: string[];
  upgradeId?: string;
  upgradedVersion?: string;
  upgradeText?: string;
  combatEffect?: CardCombatEffect;
  effects?: CardEffect[];
  upgradedEffects?: CardEffect[];
}

export type MemorialRarity = "Common" | "Uncommon" | "Rare" | "Mystery";

export interface MemorialEffect {
  startCombatCardId?: string;
  firstPsalmCostReduction?: number;
  eliteStartingFaithBonus?: number;
  judgmentRemoveCorruption?: number;
  startTurnGuard?: number;
  lowHealthAttackDamage?: number;
  startCombatDraw?: number;
  firstFearRemovalHeal?: number;
  turnResolveBonus?: number;
  postBattleCorruption?: number;
  giantDamageBonus?: number;
  forbiddenKnowledgeRewardBias?: number;
}

export interface Memorial extends SourceBackedContent {
  id: string;
  name: string;
  rarity: MemorialRarity;
  effectText: string;
  effect: MemorialEffect;
}

export interface StartingDeckCard {
  cardId: string;
  quantity: number;
}

export interface HeroPassive {
  name: string;
  text: string;
}

export interface Hero extends SourceBackedContent {
  id: string;
  name: string;
  epithet: string;
  calling: string;
  imagePath?: string;
  artworkTitle?: string;
  imageObjectPosition?: string;
  maxHealth: number;
  passive: HeroPassive;
  startingDeck: StartingDeckCard[];
  resourceState: ResourceState;
}

export interface Enemy extends SourceBackedContent {
  id: string;
  name: string;
  title: string;
  maxHealth: number;
  attackDamage: number;
  intent: string;
  traits: EnemyTrait[];
  imagePath?: string;
  artworkTitle?: string;
  imageObjectPosition?: string;
  mechanics?: string[];
}

export interface Encounter extends SourceBackedContent {
  id: string;
  name: string;
  nodeType: MapNodeType;
  region: string;
  enemyIds: string[];
  mysteryEncounterIds?: string[];
  rewardPreview: string;
  difficulty: "Low" | "Medium" | "High" | "Boss";
}

export interface MysteryEncounterChoice {
  id: string;
  label: string;
  description: string;
  effectSummary: string;
  addCardId?: string;
  addRewardPoolCardId?: string;
  unlockCodexEntryId?: string;
  resourceChanges?: Partial<ResourceState>;
  removeFear?: boolean;
  revealMapNodes?: number;
  upgradeCovenantCards?: number;
}

export interface MysteryEncounter extends SourceBackedContent {
  id: string;
  name: string;
  encounterType: MysteryEncounterType;
  tone: string;
  scene: string;
  cautionNote?: string;
  choices: MysteryEncounterChoice[];
}

export interface CodexSectionSet {
  whatTheBibleSays: string;
  whyItIsMysterious: string;
  interpretiveTraditions: string;
  gameInterpretation: string;
}

export interface CodexLoreEntry extends SourceBackedContent {
  id: string;
  title: string;
  imagePath?: string;
  artworkTitle?: string;
  sections: CodexSectionSet;
}

export interface ResourceState {
  resolve: number;
  faith: number;
  wisdom: number;
  authority: number;
  corruption: number;
}

export type GameScreen =
  | "home"
  | "hero-select"
  | "map"
  | "combat"
  | "mystery"
  | "rest"
  | "reward"
  | "memorial-reward"
  | "collection"
  | "gallery"
  | "codex";
