import { showcaseCardIds } from "@/data/cards";
import type { Card, CardRarity, CardSet } from "@/types/game";

export const cardRarityFilters: Array<CardRarity | "All"> = [
  "All",
  "Common",
  "Uncommon",
  "Rare",
  "Epic",
  "Legendary",
  "Mythic Legendary",
  "Mystery",
];

export const cardSetFilters: Array<CardSet | "All"> = [
  "All",
  "David's Legacy",
  "Core Covenant",
];

const rarityRank: Record<CardRarity, number> = {
  "Mythic Legendary": 0,
  Legendary: 1,
  Epic: 2,
  Rare: 3,
  Uncommon: 4,
  Common: 5,
  Mystery: 6,
};

export function getCardSet(card: Card): CardSet {
  if (card.cardSet === "War of the Watchers") {
    return "David's Legacy";
  }

  return card.cardSet ?? "Core Covenant";
}

export function isShowcaseCard(card: Card) {
  return showcaseCardIds.includes(card.id);
}

export function sortCardsForShowcase(cardList: Card[]) {
  return [...cardList].sort((first, second) => {
    const firstShowcaseIndex = showcaseCardIds.indexOf(first.id);
    const secondShowcaseIndex = showcaseCardIds.indexOf(second.id);

    if (firstShowcaseIndex !== -1 || secondShowcaseIndex !== -1) {
      return (
        (firstShowcaseIndex === -1 ? Number.MAX_SAFE_INTEGER : firstShowcaseIndex) -
        (secondShowcaseIndex === -1 ? Number.MAX_SAFE_INTEGER : secondShowcaseIndex)
      );
    }

    const rarityDifference = rarityRank[first.rarity] - rarityRank[second.rarity];

    return rarityDifference === 0
      ? first.name.localeCompare(second.name)
      : rarityDifference;
  });
}

export function getArtworkCards(cardList: Card[]) {
  return sortCardsForShowcase(cardList.filter((card) => Boolean(card.imagePath)));
}
