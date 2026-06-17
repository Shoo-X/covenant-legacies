import type {
  MysteryEncounterChoice,
  ResourceState,
  StartingDeckCard,
} from "@/types/game";

export interface MysteryRunState {
  runDeck: StartingDeckCard[];
  runResources: ResourceState;
  rewardPoolCardIds: string[];
  unlockedCodexEntryIds: string[];
  upgradedCardIds: string[];
  revealedMapNodeCount: number;
  hasFear: boolean;
}

export interface MysteryResolution {
  state: MysteryRunState;
  messages: string[];
}

export function applyMysteryChoice(
  current: MysteryRunState,
  choice: MysteryEncounterChoice,
): MysteryResolution {
  let nextState: MysteryRunState = {
    ...current,
    runDeck: [...current.runDeck],
    rewardPoolCardIds: [...current.rewardPoolCardIds],
    unlockedCodexEntryIds: [...current.unlockedCodexEntryIds],
    upgradedCardIds: [...current.upgradedCardIds],
    runResources: { ...current.runResources },
  };
  const messages: string[] = [choice.effectSummary];

  if (choice.resourceChanges) {
    nextState = {
      ...nextState,
      runResources: applyResourceChanges(nextState.runResources, choice.resourceChanges),
    };
  }

  if (choice.addCardId) {
    nextState = {
      ...nextState,
      runDeck: addCardToDeck(nextState.runDeck, choice.addCardId),
    };
    messages.push("Card added to your run deck.");
  }

  if (
    choice.addRewardPoolCardId &&
    !nextState.rewardPoolCardIds.includes(choice.addRewardPoolCardId)
  ) {
    nextState = {
      ...nextState,
      rewardPoolCardIds: [
        ...nextState.rewardPoolCardIds,
        choice.addRewardPoolCardId,
      ],
    };
    messages.push("A new card can now appear in future rewards.");
  }

  if (
    choice.unlockCodexEntryId &&
    !nextState.unlockedCodexEntryIds.includes(choice.unlockCodexEntryId)
  ) {
    nextState = {
      ...nextState,
      unlockedCodexEntryIds: [
        ...nextState.unlockedCodexEntryIds,
        choice.unlockCodexEntryId,
      ],
    };
    messages.push("Codex entry unlocked.");
  }

  if (choice.removeFear) {
    nextState = {
      ...nextState,
      hasFear: false,
    };
    messages.push("Fear removed.");
  }

  if (choice.revealMapNodes) {
    nextState = {
      ...nextState,
      revealedMapNodeCount: Math.max(
        nextState.revealedMapNodeCount,
        choice.revealMapNodes,
      ),
    };
    messages.push(`Next ${choice.revealMapNodes} map nodes revealed.`);
  }

  if (choice.upgradeCovenantCards) {
    const upgradedCardIds = chooseUpgradeTargets(
      nextState.runDeck,
      nextState.upgradedCardIds,
      choice.upgradeCovenantCards,
    );

    nextState = {
      ...nextState,
      upgradedCardIds: [...nextState.upgradedCardIds, ...upgradedCardIds],
    };
    messages.push(`${upgradedCardIds.length} Covenant cards upgraded.`);
  }

  return {
    state: nextState,
    messages,
  };
}

function applyResourceChanges(
  resources: ResourceState,
  changes: Partial<ResourceState>,
): ResourceState {
  return {
    resolve: Math.max(0, resources.resolve + (changes.resolve ?? 0)),
    faith: Math.max(0, resources.faith + (changes.faith ?? 0)),
    wisdom: Math.max(0, resources.wisdom + (changes.wisdom ?? 0)),
    authority: Math.max(0, resources.authority + (changes.authority ?? 0)),
    corruption: Math.max(0, resources.corruption + (changes.corruption ?? 0)),
  };
}

function addCardToDeck(deck: StartingDeckCard[], cardId: string) {
  const existing = deck.find((entry) => entry.cardId === cardId);

  if (existing) {
    return deck.map((entry) =>
      entry.cardId === cardId ? { ...entry, quantity: entry.quantity + 1 } : entry,
    );
  }

  return [...deck, { cardId, quantity: 1 }];
}

function chooseUpgradeTargets(
  deck: StartingDeckCard[],
  upgradedCardIds: string[],
  count: number,
) {
  return deck
    .map((entry) => entry.cardId)
    .filter((cardId) => !upgradedCardIds.includes(cardId))
    .slice(0, count);
}
