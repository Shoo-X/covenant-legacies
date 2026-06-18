import type { Card, CardEffect } from "@/types/game";

export function getCardCorruptionGain(card: Card) {
  const structuredGain = getEffectCorruptionGain(card.effects ?? []);

  if (structuredGain > 0) {
    return structuredGain;
  }

  return card.combatEffect?.gainCorruption ?? 0;
}

function getEffectCorruptionGain(effects: CardEffect[]): number {
  return effects.reduce((total, effect) => {
    if (effect.type === "GainCorruption") {
      return total + effect.amount;
    }

    if (
      effect.type === "TriggerIfEnemyTrait" ||
      effect.type === "TriggerIfCorruptionAtMost" ||
      effect.type === "TriggerIfCorruptionAtLeast" ||
      effect.type === "TriggerIfStatusPresent"
    ) {
      return total + getEffectCorruptionGain(effect.effects);
    }

    return total;
  }, 0);
}
