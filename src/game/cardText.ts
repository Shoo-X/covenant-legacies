import type { Card } from "@/types/game";

export function formatCardCost(card: Card) {
  if (card.isPlayable === false) {
    return "Unplayable";
  }

  if (card.cost.length === 0) {
    return "0";
  }

  return card.cost
    .map((cost) => (cost.resource ? `${cost.amount} ${cost.resource}` : `${cost.amount}`))
    .join(", ");
}
