import type { ArchetypeTag, Card, Memorial, StartingDeckCard } from "@/types/game";

const deckArchetypeTags: ArchetypeTag[] = [
  "Courage",
  "Psalm",
  "Kingdom",
  "Covenant",
  "Forbidden",
];

const adjacentArchetypes: Record<ArchetypeTag, ArchetypeTag[]> = {
  Courage: ["Psalm", "Kingdom"],
  Psalm: ["Courage", "Covenant"],
  Kingdom: ["Courage", "Covenant"],
  Covenant: ["Psalm", "Kingdom"],
  Forbidden: ["Covenant", "Psalm"],
};

const rarityWeights = {
  Common: 1,
  Uncommon: 1.35,
  Rare: 1.9,
  Epic: 2.35,
  Legendary: 2.8,
  "Mythic Legendary": 3.1,
  Mystery: 3,
} satisfies Record<Card["rarity"], number>;

export function chooseRewardCards(
  cards: Card[],
  count: number,
  random: () => number = Math.random,
  runDeck: StartingDeckCard[] = [],
  memorials: Memorial[] = [],
) {
  const profile = getDeckArchetypeProfile(cards, runDeck);
  const strongestTag = chooseStrongestArchetype(profile, random);
  const forbiddenBias = memorials.reduce(
    (total, memorial) => total + (memorial.effect.forbiddenKnowledgeRewardBias ?? 0),
    0,
  );
  const excludedCardIds = new Set<string>();
  const picks: Card[] = [];

  const addPick = (candidateCards: Card[], weightCard: (card: Card) => number) => {
    if (picks.length >= count) {
      return;
    }

    const nextPick = pickWeightedCard(candidateCards, excludedCardIds, random, weightCard);

    if (nextPick) {
      picks.push(nextPick);
      excludedCardIds.add(nextPick.id);
    }
  };

  if (strongestTag) {
    addPick(
      cards.filter((card) => hasArchetype(card, strongestTag)),
      (card) => 6 + getRarityWeight(card) + getDeckTagPressure(card, profile),
    );
  }

  const supportTags = strongestTag ? adjacentArchetypes[strongestTag] : [];
  addPick(
    cards.filter(
      (card) => hasAnyArchetype(card, supportTags) || isSupportCard(card),
    ),
    (card) =>
      2 +
      getRarityWeight(card) +
      getDeckTagPressure(card, profile) +
      (hasAnyArchetype(card, supportTags) ? 2.5 : 0) +
      (isSupportCard(card) ? 1.5 : 0),
  );

  addPick(
    cards.filter((card) => isWildcardCard(card)),
    (card) =>
      1.5 +
      getRarityWeight(card) +
      (isForbiddenCard(card) ? 2 + forbiddenBias * 2 : 0) +
      (card.rarity === "Mystery" ? 2 : 0),
  );

  while (picks.length < count && excludedCardIds.size < cards.length) {
    addPick(
      cards,
      (card) =>
        1 +
        getRarityWeight(card) +
        getDeckTagPressure(card, profile) +
        (isForbiddenCard(card) ? forbiddenBias : 0),
    );
  }

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

interface DeckArchetypeProfile {
  counts: Map<ArchetypeTag, number>;
  strongestTags: ArchetypeTag[];
}

function getDeckArchetypeProfile(
  cards: Card[],
  runDeck: StartingDeckCard[],
): DeckArchetypeProfile {
  const cardsById = new Map(cards.map((card) => [card.id, card]));
  const counts = new Map<ArchetypeTag, number>(
    deckArchetypeTags.map((tag) => [tag, 0]),
  );

  runDeck.forEach((entry) => {
    const card = cardsById.get(entry.cardId);

    getCardArchetypeTags(card).forEach((tag) => {
      counts.set(tag, (counts.get(tag) ?? 0) + entry.quantity);
    });
  });

  const strongestTags = [...counts.entries()]
    .filter(([, value]) => value > 0)
    .sort((left, right) => right[1] - left[1])
    .map(([tag]) => tag);

  return { counts, strongestTags };
}

function chooseStrongestArchetype(
  profile: DeckArchetypeProfile,
  random: () => number,
) {
  const [strongest, runnerUp] = profile.strongestTags;

  if (!strongest) {
    return undefined;
  }

  if (!runnerUp || random() < 0.76) {
    return strongest;
  }

  return runnerUp;
}

function pickWeightedCard(
  cards: Card[],
  excludedCardIds: Set<string>,
  random: () => number,
  getWeight: (card: Card) => number,
) {
  const weightedCards = cards
    .filter((card) => !excludedCardIds.has(card.id))
    .map((card) => ({ card, weight: Math.max(0, getWeight(card)) }))
    .filter((entry) => entry.weight > 0);

  const totalWeight = weightedCards.reduce((total, entry) => total + entry.weight, 0);

  if (totalWeight <= 0) {
    return undefined;
  }

  let roll = random() * totalWeight;

  for (const entry of weightedCards) {
    roll -= entry.weight;

    if (roll <= 0) {
      return entry.card;
    }
  }

  return weightedCards.at(-1)?.card;
}

function getDeckTagPressure(card: Card, profile: DeckArchetypeProfile) {
  return getCardArchetypeTags(card).reduce(
    (total, tag) => total + (profile.counts.get(tag) ?? 0) * 0.35,
    0,
  );
}

function getRarityWeight(card: Card) {
  return rarityWeights[card.rarity];
}

function hasArchetype(card: Card, tag: ArchetypeTag) {
  return getCardArchetypeTags(card).includes(tag);
}

function hasAnyArchetype(card: Card, tags: ArchetypeTag[]) {
  return getCardArchetypeTags(card).some((tag) => tags.includes(tag));
}

function getCardArchetypeTags(card: Card | undefined) {
  if (!card) {
    return [];
  }

  const tags = new Set(card.archetypeTags ?? []);

  if (isForbiddenCard(card)) {
    tags.add("Forbidden");
  }

  return [...tags];
}

function isSupportCard(card: Card) {
  return (
    card.gameplayRole.includes("Support") ||
    card.gameplayRole.includes("Defense") ||
    card.gameplayRole.includes("Prayer") ||
    card.gameplayRole.includes("Draw") ||
    card.type.includes("Prayer") ||
    card.type.includes("Psalm") ||
    card.type.includes("Guard") ||
    card.type.includes("Covenant") ||
    card.type.includes("Blessing")
  );
}

function isWildcardCard(card: Card) {
  return (
    isForbiddenCard(card) ||
    card.rarity === "Rare" ||
    card.rarity === "Epic" ||
    card.rarity === "Legendary" ||
    card.rarity === "Mythic Legendary" ||
    card.rarity === "Mystery"
  );
}

function isForbiddenCard(card: Card) {
  return (
    card.type.includes("Forbidden") ||
    card.archetypeTags?.includes("Forbidden") === true ||
    card.representationMode === "ForbiddenWarning"
  );
}

function shuffleMemorials(memorials: Memorial[], random: () => number) {
  const pool = [...memorials];

  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }

  return pool;
}
