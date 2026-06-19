import type { Memorial } from "@/types/game";

export const memorials: Memorial[] = [
  {
    id: "memorial-smooth-stone-pouch",
    name: "Smooth Stone Pouch",
    rarity: "Common",
    effectText: "Start each combat with a Smooth Stone in hand.",
    effect: {
      startCombatCardId: "card-smooth-stone",
    },
    sourceTier: "Scripture",
    references: ["1 Samuel 17"],
    theologyNote:
      "The pouch remembers prepared faithfulness before a battle too large for human strength.",
    gameplayRole: "Memorial",
  },
  {
    id: "memorial-harp-of-the-shepherd",
    name: "Harp of the Shepherd",
    rarity: "Uncommon",
    effectText: "The first Psalm card each turn costs 1 less.",
    effect: {
      firstPsalmCostReduction: 1,
    },
    sourceTier: "Scripture",
    references: ["1 Samuel 16", "Psalms"],
    theologyNote:
      "The harp points to worship as formation of courage and peace, not performance magic.",
    gameplayRole: "Memorial",
  },
  {
    id: "memorial-memorial-stone",
    name: "Memorial Stone",
    rarity: "Rare",
    effectText: "After defeating an Elite, gain +1 starting Faith for the rest of the run.",
    effect: {
      eliteStartingFaithBonus: 1,
    },
    sourceTier: "Scripture",
    references: ["Joshua 4"],
    theologyNote:
      "A stone of remembrance marks deliverance so future battles begin from testimony.",
    gameplayRole: "Memorial",
  },
  {
    id: "memorial-altar-stone-of-carmel",
    name: "Altar Stone of Carmel",
    rarity: "Rare",
    effectText: "Whenever you play a Judgment card, remove 1 Corruption.",
    effect: {
      judgmentRemoveCorruption: 1,
    },
    sourceTier: "Scripture",
    references: ["1 Kings 18"],
    theologyNote:
      "The altar stone remembers the Lord's public vindication over idolatry.",
    gameplayRole: "Memorial",
  },
  {
    id: "memorial-shepherds-staff",
    name: "Shepherd's Staff",
    rarity: "Common",
    effectText: "Gain 3 Guard at the start of each turn.",
    effect: {
      startTurnGuard: 3,
    },
    sourceTier: "Scripture",
    references: ["Psalm 23"],
    theologyNote:
      "The staff represents guidance and protection through dangerous terrain.",
    gameplayRole: "Memorial",
  },
  {
    id: "memorial-torn-banner",
    name: "Torn Banner",
    rarity: "Uncommon",
    effectText: "When below 50% health, attacks deal +2 damage.",
    effect: {
      lowHealthAttackDamage: 2,
    },
    sourceTier: "Speculative Fiction",
    references: ["Original battle remembrance"],
    theologyNote:
      "The torn banner remembers costly endurance without glorifying ruin.",
    gameplayRole: "Memorial",
  },
  {
    id: "memorial-scroll-fragment",
    name: "Scroll Fragment",
    rarity: "Common",
    effectText: "At the start of combat, draw 1 extra card.",
    effect: {
      startCombatDraw: 1,
    },
    sourceTier: "Scripture",
    references: ["Deuteronomy 17:18-20", "Psalms"],
    theologyNote:
      "The fragment represents remembered instruction carried into battle.",
    gameplayRole: "Memorial",
  },
  {
    id: "memorial-oil-of-gladness",
    name: "Oil of Gladness",
    rarity: "Uncommon",
    effectText: "The first time you remove Fear each combat, heal 5.",
    effect: {
      firstFearRemovalHeal: 5,
    },
    sourceTier: "Scripture",
    references: ["Psalm 45:7", "Isaiah 61:3"],
    theologyNote:
      "Gladness is framed as restoration after fear, not denial of suffering.",
    gameplayRole: "Memorial",
  },
  {
    id: "memorial-broken-idol-fragment",
    name: "Broken Idol Fragment",
    rarity: "Rare",
    effectText: "Gain +1 Resolve each turn, but gain 1 Corruption after every battle.",
    effect: {
      turnResolveBonus: 1,
      postBattleCorruption: 1,
    },
    sourceTier: "Speculative Fiction",
    references: ["Idolatry as broad biblical theme"],
    theologyNote:
      "The fragment is tempting but dangerous, making compromise mechanically costly rather than wise.",
    gameplayRole: "Memorial",
  },
  {
    id: "memorial-watcher-forged-chain",
    name: "Watcher-Forged Chain",
    rarity: "Mystery",
    effectText:
      "Deal +3 damage to Giants, but Forbidden Knowledge cards appear more often.",
    effect: {
      giantDamageBonus: 3,
      forbiddenKnowledgeRewardBias: 2,
    },
    sourceTier: "Speculative Fiction",
    references: ["Genesis 6:1-4 as interpretive inspiration"],
    theologyNote:
      "The chain is deliberately double-edged: power gained from forbidden craft carries spiritual risk and is not a valid path to wisdom.",
    gameplayRole: "Memorial",
  },
  {
    id: "memorial-sling-cord",
    name: "Sling Cord",
    rarity: "Uncommon",
    effectText: "Start each combat with Valley Aim in hand.",
    effect: {
      startCombatCardId: "card-valley-aim",
    },
    sourceTier: "Biblical Inference",
    references: ["1 Samuel 17:40", "1 Samuel 17:49"],
    theologyNote:
      "The cord remembers practiced readiness with ordinary tools, not a blessed charm.",
    gameplayRole: "Memorial",
    representationMode: "Legacy",
  },
  {
    id: "memorial-lions-memory",
    name: "Lion's Memory",
    rarity: "Uncommon",
    effectText: "When below 50% health, attacks deal +2 damage.",
    effect: {
      lowHealthAttackDamage: 2,
    },
    sourceTier: "Scripture",
    references: ["1 Samuel 17:34-37"],
    theologyNote:
      "The memory of the lion points to past deliverance forming present courage.",
    gameplayRole: "Memorial",
    representationMode: "CovenantMemory",
  },
  {
    id: "memorial-valley-witness",
    name: "Valley Witness",
    rarity: "Common",
    effectText: "The first time you remove Fear each combat, heal 3.",
    effect: {
      firstFearRemovalHeal: 3,
    },
    sourceTier: "Biblical Inference",
    references: ["1 Samuel 17:32-37", "1 Samuel 17:45-47"],
    theologyNote:
      "Witness in the valley is testimony to the Lord's deliverance, not self-exalting fame.",
    gameplayRole: "Memorial",
    representationMode: "CovenantMemory",
  },
];
