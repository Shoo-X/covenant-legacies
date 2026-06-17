import type { Card, CardCombatEffect, StartingDeckCard } from "@/types/game";

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
  "card-shepherds-guard": { guard: 8 },
  "card-psalm-of-courage": { guard: 6, draw: 1, removeFear: true },
  "card-smooth-stone": { nextAttackBonus: 5 },
  "card-forbidden-watcher-diagram": { draw: 3, gainCorruption: 1 },
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
  "card-stone-of-defiance": { removeFear: true, nextAttackBonus: 6 },
  "card-harp-of-watchfulness": { guard: 5, draw: 1 },
  "card-song-in-the-night": { heal: 6, draw: 1 },
  "card-waters-of-rest": { heal: 8, removeFear: true },
  "card-psalm-of-deliverance": { guard: 8, removeFear: true, draw: 1 },
  "card-lament-into-praise": { heal: 4, draw: 2 },
  "card-shield-bearer": { guard: 12 },
  "card-captains-formation": { guard: 5, nextAttackBonus: 3 },
  "card-banner-of-the-king": { guard: 7, gainAuthority: 1 },
  "card-royal-decree": { draw: 2, gainFaith: 1 },
  "card-vanguard-spearmen": { damage: 10, guard: 5 },
  "card-clean-hands": { removeCorruption: 3, guard: 5 },
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

export function getUpgradedCombatCard(card: Card, upgradedCardIds: string[]): Card {
  if (!upgradedCardIds.includes(card.id)) {
    return card;
  }

  return {
    ...card,
    combatEffect: upgradedEffectsByCardId[card.id] ?? card.combatEffect,
    isUpgraded: true,
    name: `${card.name} +`,
    text: card.upgradedVersion ?? card.text,
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
        Boolean(card.upgradedVersion) &&
        !upgradedCardIds.includes(card.id),
    );
}
