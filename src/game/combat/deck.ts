import type { Card, StartingDeckCard } from "@/types/game";
import type { CombatCardInstance, CombatState } from "./types";

export function buildStartingDeck(deckCards: StartingDeckCard[], cardsById: Map<string, Card>) {
  const deck: CombatCardInstance[] = [];

  deckCards.forEach((entry) => {
    if (!cardsById.has(entry.cardId)) {
      return;
    }

    for (let index = 0; index < entry.quantity; index += 1) {
      deck.push({
        cardId: entry.cardId,
        instanceId: `${entry.cardId}-${index + 1}`,
      });
    }
  });

  return deck;
}

export function shuffleDeck<T>(items: T[], random: () => number = Math.random) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

export function drawCards(
  state: CombatState,
  count: number,
  random: () => number = Math.random,
) {
  let drawPile = [...state.drawPile];
  let discardPile = [...state.discardPile];
  const hand = [...state.hand];
  const feedback = [...state.feedback];

  for (let index = 0; index < count; index += 1) {
    if (drawPile.length === 0 && discardPile.length > 0) {
      drawPile = shuffleDeck(discardPile, random);
      discardPile = [];
      feedback.push({
        id: feedback.length + 1,
        kind: "draw",
        message: "Discard shuffled into draw pile.",
      });
    }

    const nextCard = drawPile.shift();

    if (!nextCard) {
      break;
    }

    hand.push(nextCard);
  }

  return {
    ...state,
    drawPile,
    hand,
    discardPile,
    feedback,
  };
}
