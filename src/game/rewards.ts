import type { ArchetypeTag, Card, Memorial, StartingDeckCard } from "@/types/game";

export function chooseRewardCards(
  cards: Card[],
  count: number,
  random: () => number = Math.random,
  runDeck: StartingDeckCard[] = [],
  memorials: Memorial[] = [],
) {
  const topTags = getEmergingArchetypes(cards, runDeck);
  const forbiddenBias = memorials.reduce(
    (total, memorial) => total + (memorial.effect.forbiddenKnowledgeRewardBias ?? 0),
    0,
  );
  const biasedCards = [
    ...cards,
    ...cards
      .filter((card) => card.type.includes("Forbidden Knowledge"))
      .flatMap((card) => Array.from({ length: forbiddenBias }, () => card)),
  ];
  const synergyPool = cards.filter((card) =>
    card.archetypeTags?.some((tag) => topTags.includes(tag)),
  );
  const variedPool = cards.filter((card) => !synergyPool.includes(card));
  const picks: Card[] = [];

  shuffleCards(synergyPool, random).some((card) => {
    if (picks.length >= Math.max(0, count - 1)) {
      return true;
    }

    picks.push(card);
    return false;
  });

  shuffleCards([...variedPool, ...biasedCards], random).some((card) => {
    if (picks.length >= count) {
      return true;
    }

    if (!picks.includes(card)) {
      picks.push(card);
    }

    return false;
  });

  return picks;
}

export function chooseMemorialRewards(
  memorials: Memorial[],
  ownedMemorialIds: string[],
  count: number,
  random: () => number = Math.random,
) {
  return shuffleMemorials(
    memorials.filter((memorial) => !ownedMemorialIds.includes(memorial.id)),
    random,
  ).slice(0, count);
}

function getEmergingArchetypes(cards: Card[], runDeck: StartingDeckCard[]) {
  const cardsById = new Map(cards.map((card) => [card.id, card]));
  const counts = new Map<ArchetypeTag, number>();

  runDeck.forEach((entry) => {
    const card = cardsById.get(entry.cardId);

    card?.archetypeTags?.forEach((tag) => {
      counts.set(tag, (counts.get(tag) ?? 0) + entry.quantity);
    });
  });

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 2)
    .map(([tag]) => tag);
}

function shuffleCards(cards: Card[], random: () => number) {
  const pool = [...cards];

  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }

  return pool;
}

function shuffleMemorials(memorials: Memorial[], random: () => number) {
  const pool = [...memorials];

  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }

  return pool;
}
