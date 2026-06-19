import type { Card, CardCombatEffect, CardEffect, StartingDeckCard } from "@/types/game";

const upgradedEffectsByCardId: Record<string, CardCombatEffect> = {
  "card-david-vs-goliath": {
    damage: 22,
    antiGiantDamage: 16,
    removeFear: true,
    note: "The battle belongs to the Lord.",
  },
  "card-moses-divider-of-seas": {
    guard: 18,
    draw: 2,
    removeFear: true,
    gainFaith: 1,
    note: "A way opens where no road stood before.",
  },
  "card-mary-witness-to-glory": {
    heal: 10,
    draw: 2,
    removeFear: true,
    removeCorruption: 1,
    note: "Hope rises at the empty tomb.",
  },
  "card-archangel-michael": {
    damage: 18,
    guard: 15,
    removeCorruption: 3,
    note: "Heavenly authority stands under the command of God.",
  },
  "card-sling-stone": { damage: 8, antiGiantDamage: 5 },
  "card-shepherds-guard": { guard: 9 },
  "card-psalm-of-courage": {
    guard: 7,
    draw: 1,
    removeFear: true,
    gainFaith: 1,
  },
  "card-smooth-stone": { nextAttackBonus: 5 },
  "card-forbidden-watcher-diagram": { draw: 4, gainCorruption: 2 },
  "card-blessing-of-the-most-high": {
    guard: 8,
    removeFear: true,
    ifCorruptionZero: { gainAuthority: 2 },
  },
  "card-bread-and-wine": {
    heal: 7,
    draw: 1,
    nextPrayerCostReduction: 1,
  },
  "card-order-of-the-king-priest": {
    gainAuthority: 3,
    note: "Covenant cards trigger twice this turn.",
  },
  "card-forbidden-consultation": {
    draw: 2,
    gainCorruption: 1,
    note: "Enemy intent revealed for 3 turns.",
  },
  "card-discernment": {
    removeFear: true,
    note: "Discernment reveals intent and removes Fear, Deception, and one hidden trap.",
  },
  "card-fearless-charge": { damage: 9, removeFear: true },
  "card-giant-toppler": { damage: 11, antiGiantDamage: 8 },
  "card-courage-before-the-host": { removeFear: true, guard: 7, draw: 1 },
  "card-shepherds-stand": { guard: 10, gainResolve: 1 },
  "card-stone-of-defiance": { removeFear: true, nextAttackBonus: 7 },
  "card-harp-of-watchfulness": { guard: 5, draw: 1 },
  "card-song-in-the-night": { heal: 6, draw: 1 },
  "card-waters-of-rest": { heal: 8, removeFear: true },
  "card-psalm-of-deliverance": { guard: 8, removeFear: true, draw: 1 },
  "card-lament-into-praise": { heal: 4, draw: 2 },
  "card-shield-bearer": { guard: 12 },
  "card-captains-formation": { guard: 5, nextAttackBonus: 3 },
  "card-banner-of-the-king": { guard: 7, gainAuthority: 1 },
  "card-royal-decree": { draw: 2, gainFaith: 1, gainWisdom: 1 },
  "card-vanguard-spearmen": { damage: 10, guard: 5 },
  "card-clean-hands": { removeCorruption: 2, guard: 5, draw: 2 },
  "card-renewed-oath": {
    removeCorruption: 2,
    gainFaith: 1,
    gainAuthority: 1,
  },
  "card-altar-of-mercy": { heal: 10, removeCorruption: 1 },
  "card-seal-of-faith": { guard: 7, ifCorruptionZero: { draw: 1 } },
  "card-remember-the-promise": {
    removeCorruption: 2,
    nextPrayerCostReduction: 1,
  },
};

const upgradedStructuredEffectsByCardId: Record<string, CardEffect[]> = {
  "card-david-vs-goliath": [
    {
      type: "DealDamage",
      amount: 22,
      message: "David stands in covenant courage.",
      bonuses: [
        {
          type: "BonusAgainstTrait",
          amount: 16,
          traits: ["Giant", "Nephilim"],
          message: "David stands against the giant foe.",
        },
      ],
    },
    { type: "RemoveStatus", status: "Fear", target: "Player" },
    { type: "AddFeedback", message: "The battle belongs to the Lord." },
  ],
  "card-moses-divider-of-seas": [
    { type: "GainGuard", amount: 18, source: "Moses, Divider of Seas" },
    { type: "DrawCards", amount: 2 },
    { type: "RemoveStatus", status: "Fear", target: "Player" },
    { type: "GainResource", resource: "Faith", amount: 1 },
    { type: "AddFeedback", message: "A way opens where no road stood before." },
  ],
  "card-mary-witness-to-glory": [
    { type: "Heal", amount: 10 },
    { type: "DrawCards", amount: 2 },
    { type: "RemoveStatus", status: "Fear", target: "Player" },
    { type: "RemoveCorruption", amount: 1 },
    { type: "AddFeedback", message: "Hope rises at the empty tomb." },
  ],
  "card-archangel-michael": [
    { type: "DealDamage", amount: 18, message: "Heavenly judgment falls." },
    { type: "GainGuard", amount: 15, source: "Archangel Michael" },
    { type: "RemoveCorruption", amount: 3 },
    {
      type: "AddFeedback",
      message: "Heavenly authority stands under the command of God.",
    },
  ],
  "card-sling-stone": [
    {
      type: "DealDamage",
      amount: 8,
      message: "Sling Stone hits.",
      bonuses: [
        {
          type: "BonusAgainstTrait",
          amount: 5,
          traits: ["Giant", "Nephilim"],
          message: "Sling Stone strikes a giant foe.",
        },
      ],
    },
  ],
  "card-shepherds-guard": [
    { type: "GainGuard", amount: 9, source: "Shepherd's Guard" },
  ],
  "card-psalm-of-courage": [
    { type: "GainGuard", amount: 7, source: "Psalm of Courage" },
    { type: "DrawCards", amount: 1 },
    {
      type: "TriggerIfStatusPresent",
      target: "Player",
      status: "Fear",
      effects: [{ type: "GainResource", resource: "Faith", amount: 1 }],
    },
    { type: "RemoveStatus", status: "Fear", target: "Player" },
    { type: "GainCourage", amount: 1, source: "Psalm of Courage" },
  ],
  "card-smooth-stone": [{ type: "ModifyNextAttack", amount: 5 }],
  "card-watchful-shepherd": [
    { type: "RevealIntent" },
    { type: "GainGuard", amount: 6, source: "Watchful Shepherd" },
    { type: "GainCourage", amount: 1, source: "Watchful Shepherd" },
  ],
  "card-forbidden-watcher-diagram": [
    { type: "DrawCards", amount: 4 },
    { type: "GainCorruption", amount: 2 },
  ],
  "card-blessing-of-the-most-high": [
    { type: "GainGuard", amount: 8, source: "Blessing of the Most High" },
    { type: "RemoveStatus", status: "Fear", target: "Player" },
    {
      type: "TriggerIfCorruptionAtMost",
      amount: 0,
      effects: [{ type: "GainResource", resource: "Authority", amount: 2 }],
    },
  ],
  "card-bread-and-wine": [
    { type: "Heal", amount: 7 },
    { type: "DrawCards", amount: 1 },
    { type: "ModifyNextPrayerCost", amount: 1 },
  ],
  "card-order-of-the-king-priest": [
    { type: "GainResource", resource: "Authority", amount: 3 },
    { type: "DoubleCovenantEffectsThisTurn" },
  ],
  "card-forbidden-consultation": [
    { type: "GainCorruption", amount: 1 },
    { type: "RevealIntent" },
    { type: "DrawCards", amount: 2 },
  ],
  "card-discernment": [
    { type: "RevealIntent" },
    { type: "RemoveStatus", status: "Fear", target: "Player" },
    {
      type: "AddFeedback",
      message: "Discernment reveals intent and removes Fear, Deception, and one hidden trap.",
    },
  ],
  "card-clean-hands": [
    { type: "GainGuard", amount: 5, source: "Clean Hands" },
    {
      type: "TriggerIfCorruptionAtMost",
      amount: 0,
      effects: [{ type: "DrawCards", amount: 2 }],
    },
    {
      type: "TriggerIfCorruptionAtLeast",
      amount: 1,
      effects: [{ type: "RemoveCorruption", amount: 2 }],
    },
  ],
};

export function getCardUpgradeText(card: Card) {
  return card.upgradeText ?? card.upgradedVersion ?? card.text;
}

export function getUpgradedCombatCard(card: Card, upgradedCardIds: string[]): Card {
  if (!upgradedCardIds.includes(card.id)) {
    return card;
  }

  const upgradedCombatEffect = upgradedEffectsByCardId[card.id] ?? card.combatEffect;
  const upgradedStructuredEffect = upgradedStructuredEffectsByCardId[card.id];

  return {
    ...card,
    combatEffect: upgradedCombatEffect,
    effects:
      upgradedStructuredEffect ??
      card.upgradedEffects ??
      (upgradedCombatEffect ? undefined : card.effects),
    isUpgraded: true,
    name: `${card.name} +`,
    text: getCardUpgradeText(card),
  };
}

export function getUpgradeTarget(
  runDeck: StartingDeckCard[],
  upgradedCardIds: string[],
  cardsById: Map<string, Card>,
) {
  const uniqueDeckCardIds = runDeck
    .filter((entry) => entry.quantity > 0)
    .map((entry) => entry.cardId)
    .filter((cardId, index, allIds) => allIds.indexOf(cardId) === index);

  return uniqueDeckCardIds
    .map((cardId) => cardsById.get(cardId))
    .find(
      (card): card is Card =>
        card !== undefined &&
        Boolean(card.upgradeText ?? card.upgradedVersion) &&
        !upgradedCardIds.includes(card.id),
    );
}
