import type {
  Card,
  Enemy,
  Hero,
  Memorial,
  ResourceCost,
  ResourceState,
  StartingDeckCard,
} from "@/types/game";
import { getCorruptionThreshold, isCorruptionAtLeast } from "@/game/corruption";
import {
  createEnemyActionQueue,
  getEnemyIntentDetails,
  resolveQueuedCombatAction,
} from "./actionQueue";
import { applyCardEffect } from "./cardEffects";
import { buildStartingDeck, drawCards, shuffleDeck } from "./deck";
import {
  applyStartOfCombatMemorials,
  applyStartOfTurnMemorials,
  getFirstFearRemovalHeal,
  getFirstPsalmCostReduction,
  getJudgmentCorruptionRemoval,
  getTurnStartResources,
} from "./memorials";
import { getResourceValue, spendResource } from "./resources";
import type { CombatAction, CombatContext, CombatFeedback, CombatState } from "./types";

const startingHandSize = 5;

export function createCombatState(
  hero: Hero,
  enemy: Enemy,
  cardsById: Map<string, Card>,
  random: () => number = Math.random,
  runDeck: StartingDeckCard[] = hero.startingDeck,
  memorials: Memorial[] = [],
  startingFaithBonus = 0,
  runResources: ResourceState = hero.resourceState,
  runHealth = hero.maxHealth,
): CombatState {
  const deck = shuffleDeck(buildStartingDeck(runDeck, cardsById), random);
  const turnStartResources = getTurnStartResources(memorials, startingFaithBonus);
  const hasGiantThreat = enemy.traits.some(
    (trait) => trait === "Giant" || trait === "Nephilim",
  );
  const courageResources = hasGiantThreat
    ? {
        ...turnStartResources,
        resolve: turnStartResources.resolve + 1,
        faith: turnStartResources.faith + 1,
      }
    : turnStartResources;
  const corruptionThreshold = getCorruptionThreshold(runResources.corruption);
  const oppressedMight =
    isCorruptionAtLeast(runResources.corruption, "Oppressed") &&
    enemy.traits.some(
      (trait) =>
        trait === "Watcher" ||
        trait === "Giant" ||
        trait === "Nephilim" ||
        trait === "Demon",
    )
      ? 1
      : 0;
  const initialFeedback: CombatFeedback[] = [];

  if (hasGiantThreat) {
    initialFeedback.push({
      id: initialFeedback.length + 1,
      kind: "resource",
      message: "Heart of Courage: +1 Faith and +1 Resolve.",
    });
  }

  if (enemy.traits.includes("Boss")) {
    initialFeedback.push({
      id: initialFeedback.length + 1,
      kind: "enemy",
      message: "Fear pressure fills the high place.",
    });
  }

  if (runResources.corruption === 0) {
    initialFeedback.push({
      id: initialFeedback.length + 1,
      kind: "resource",
      message: "Clean Hands: Covenant guard and healing effects gain +1.",
    });
  } else if (isCorruptionAtLeast(runResources.corruption, "Tainted")) {
    initialFeedback.push({
      id: initialFeedback.length + 1,
      kind: "resource",
      message: `${corruptionThreshold.name}: Prayer and Psalm cards cost +1 Faith.`,
    });
  }

  if (oppressedMight > 0) {
    initialFeedback.push({
      id: initialFeedback.length + 1,
      kind: "enemy",
      message: `${corruptionThreshold.name}: ${enemy.name} begins with +1 Might.`,
    });
  }

  if (
    enemy.traits.includes("Boss") &&
    isCorruptionAtLeast(runResources.corruption, "Marked")
  ) {
    initialFeedback.push({
      id: initialFeedback.length + 1,
      kind: "enemy",
      message: "Marked: Shadow of the Watchers is already near.",
    });
  }

  const initialState: CombatState = {
    hero,
    enemy,
    runDeck,
    runHealth,
    runResources,
    memorials,
    startingFaithBonus,
    player: {
      health: Math.max(1, Math.min(hero.maxHealth, runHealth)),
      maxHealth: hero.maxHealth,
      guard: 0,
      might: 0,
    },
    enemyState: {
      health: enemy.maxHealth,
      maxHealth: enemy.maxHealth,
      guard: 0,
      might: oppressedMight,
    },
    resources: {
      ...courageResources,
      corruption: runResources.corruption,
    },
    drawPile: deck,
    hand: [],
    discardPile: [],
    turn: 1,
    nextAttackBonus: 0,
    nextPrayerCostReduction: 0,
    covenantCardsTriggerTwice: false,
    firstPsalmDiscountUsed: false,
    oilOfGladnessUsed: false,
    hasFear: enemy.traits.includes("Boss"),
    playerStatuses: [],
    enemyStatuses: [],
    heartOfCourageUsed: hasGiantThreat,
    bossPhase: enemy.traits.includes("Boss") ? 1 : 0,
    destroyedAltarOrStructure: false,
    status: "active",
    phase: "BattleIntro",
    actionQueue: [],
    activeAction: undefined,
    lastResolvedAction: undefined,
    feedback: initialFeedback,
  };

  return applyStartOfCombatCards(
    applyStartOfCombatMemorials(
      applyStartOfTurnMemorials(drawCards(initialState, startingHandSize, random)),
      cardsById,
      random,
    ),
  );
}

export function combatReducer(
  state: CombatState,
  action: CombatAction,
  context: CombatContext,
): CombatState {
  if (action.type === "restart") {
    return createCombatState(
      state.hero,
      state.enemy,
      context.cardsById,
      context.random,
      state.runDeck,
      state.memorials,
      state.startingFaithBonus,
      state.runResources,
      state.runHealth,
    );
  }

  if (action.type === "advance-presentation") {
    return advanceCombatPresentation(state, context);
  }

  if (state.status !== "active") {
    return state;
  }

  if (action.type === "play-card") {
    return playCard(state, action.instanceId, context);
  }

  return endTurn(state);
}

function playCard(
  state: CombatState,
  instanceId: string,
  context: CombatContext,
): CombatState {
  if (state.phase !== "PlayerMain") {
    return state;
  }

  const handIndex = state.hand.findIndex((card) => card.instanceId === instanceId);
  const instance = state.hand[handIndex];

  if (handIndex === -1 || !instance) {
    return state;
  }

  const card = context.cardsById.get(instance.cardId);

  if (!card) {
    return state;
  }

  if (!canPayForCard(state, card)) {
    return addFeedback(state, "resource", `Cannot pay for ${card.name}.`);
  }

  const hand = state.hand.filter((item) => item.instanceId !== instanceId);
  const costs = getAdjustedCosts(state, card);
  const paidState = costs.reduce(
    (current, cost) =>
      cost.resource && cost.amount > 0
        ? {
            ...current,
            resources: spendResource(current.resources, cost.resource, cost.amount),
          }
        : current,
    state,
  );
  const paymentFeedback = costs
    .filter((cost) => cost.resource && cost.amount > 0)
    .map((cost, index) => ({
      id: paidState.feedback.length + index + 1,
      kind: "resource" as const,
      message: `-${cost.amount} ${cost.resource}.`,
    }));

  const movedState: CombatState = {
    ...paidState,
    hand,
    discardPile: [...paidState.discardPile, instance],
    feedback: [...paidState.feedback, ...paymentFeedback],
    nextPrayerCostReduction:
      card.type.includes("Prayer") && state.nextPrayerCostReduction > 0
        ? 0
        : state.nextPrayerCostReduction,
    firstPsalmDiscountUsed:
      isPsalmCard(card) && getFirstPsalmCostReduction(state) > 0
        ? true
        : state.firstPsalmDiscountUsed,
    lastPlayedInstanceId: instanceId,
  };

  const beforeEffectHadFear = movedState.hasFear;
  const effectedState = applyCardEffect(movedState, card, context);
  const memorialState = applyPostCardMemorialTriggers(
    movedState,
    effectedState,
    card,
  );

  if (state.covenantCardsTriggerTwice && card.type.includes("Covenant")) {
    const secondEffect = applyCardEffect(memorialState, card, context);
    return syncTerminalPhase(
      applyFearRemovalMemorial(
        {
          ...secondEffect,
          oilOfGladnessUsed: memorialState.oilOfGladnessUsed,
        },
        beforeEffectHadFear || memorialState.hasFear,
      ),
    );
  }

  return syncTerminalPhase(
    applyFearRemovalMemorial(memorialState, beforeEffectHadFear),
  );
}

function endTurn(state: CombatState): CombatState {
  if (state.phase !== "PlayerMain") {
    return state;
  }

  const actionQueue = createEnemyActionQueue(state);

  return addFeedback(
    {
      ...state,
      phase: "PlayerTurnEnd",
      actionQueue,
      activeAction: undefined,
      lastResolvedAction: undefined,
      hand: [],
      discardPile: [...state.discardPile, ...state.hand],
      lastPlayedInstanceId: undefined,
    },
    "system",
    "Player ends turn.",
  );
}

function advanceCombatPresentation(
  state: CombatState,
  context: CombatContext,
): CombatState {
  if (state.status !== "active") {
    return syncTerminalPhase(state);
  }

  switch (state.phase) {
    case "BattleIntro":
      return {
        ...state,
        phase: "PlayerTurnStart",
        activeAction: undefined,
        lastResolvedAction: undefined,
      };

    case "PlayerTurnStart":
      return {
        ...state,
        phase: "PlayerMain",
        activeAction: undefined,
        lastResolvedAction: undefined,
      };

    case "PlayerTurnEnd":
      return {
        ...state,
        phase: "EnemyTurnStart",
        activeAction: undefined,
        lastResolvedAction: undefined,
      };

    case "EnemyTurnStart":
      return {
        ...state,
        phase: "EnemyActing",
        activeAction: undefined,
        lastResolvedAction: undefined,
      };

    case "EnemyActing": {
      if (state.activeAction) {
        const resolvedState = syncTerminalPhase(
          resolveQueuedCombatAction(state, state.activeAction),
        );

        if (resolvedState.status !== "active") {
          return resolvedState;
        }

        return {
          ...resolvedState,
          phase:
            resolvedState.actionQueue.length > 0 ? "EnemyActing" : "RoundCleanup",
          activeAction: undefined,
        };
      }

      if (state.actionQueue.length > 0) {
        const [activeAction, ...actionQueue] = state.actionQueue;

        return {
          ...state,
          actionQueue,
          activeAction,
          lastResolvedAction: undefined,
        };
      }

      return {
        ...state,
        phase: "RoundCleanup",
        activeAction: undefined,
      };
    }

    case "RoundCleanup":
      return startNextPlayerTurn(state, context);

    case "PlayerMain":
    case "Victory":
    case "Defeat":
      return state;
  }
}

function startNextPlayerTurn(
  state: CombatState,
  context: CombatContext,
): CombatState {
  const turnStartResources = getTurnStartResources(
    state.memorials,
    state.startingFaithBonus,
  );
  let nextState = addFeedback(
    {
      ...state,
      phase: "PlayerTurnStart",
      actionQueue: [],
      activeAction: undefined,
      lastResolvedAction: undefined,
      player: {
        ...state.player,
        guard: 0,
      },
      runHealth: state.player.health,
      runResources: {
        ...state.runResources,
        corruption: state.resources.corruption,
      },
      resources: {
        ...turnStartResources,
        corruption: state.resources.corruption,
      },
      turn: state.turn + 1,
      nextAttackBonus: 0,
      nextPrayerCostReduction: 0,
      covenantCardsTriggerTwice: false,
      firstPsalmDiscountUsed: false,
      lastPlayedInstanceId: undefined,
    },
    "system",
    `New turn: Guard reset. Resolve ${turnStartResources.resolve}, Faith ${turnStartResources.faith}. Corruption ${state.resources.corruption}.`,
  );
  const nextIntent = getEnemyIntentDetails(nextState);

  nextState = addFeedback(
    nextState,
    "enemy",
    `Next intent: ${nextIntent.actionName} - ${nextIntent.summary}.`,
  );

  return drawCards(
    applyStartOfTurnMemorials(nextState),
    startingHandSize,
    context.random,
  );
}

function syncTerminalPhase(state: CombatState): CombatState {
  if (state.status === "victory") {
    return {
      ...state,
      phase: "Victory",
      actionQueue: [],
      activeAction: undefined,
    };
  }

  if (state.status === "defeat") {
    return {
      ...state,
      phase: "Defeat",
      actionQueue: [],
      activeAction: undefined,
    };
  }

  return state;
}

export function canPayForCard(state: CombatState, card: Card) {
  return getCardAffordability(state, card).canPay;
}

export function getCardAffordability(state: CombatState, card: Card) {
  const costs = getAdjustedCardCosts(state, card);
  const missingCosts = getMissingCardCosts(state, card);

  return {
    canPay: card.isPlayable !== false && missingCosts.length === 0,
    costs,
    missingCosts,
    missingSummary:
      card.isPlayable === false
        ? "This card cannot be played."
        : formatMissingResourceSummary(missingCosts),
  };
}

export function getAdjustedCardCosts(state: CombatState, card: Card) {
  return getAdjustedCosts(state, card);
}

export function getMissingCardCosts(state: CombatState, card: Card): ResourceCost[] {
  if (card.isPlayable === false) {
    return [];
  }

  return getAdjustedCosts(state, card)
    .filter((cost) => cost.resource && cost.amount > 0)
    .map((cost) => ({
      ...cost,
      amount: Math.max(
        0,
        cost.amount - getResourceValue(state.resources, cost.resource!),
      ),
    }))
    .filter((cost) => cost.amount > 0);
}

function getAdjustedCosts(state: CombatState, card: Card): ResourceCost[] {
  let remainingReduction =
    (card.type.includes("Prayer") ? state.nextPrayerCostReduction : 0) +
    (isPsalmCard(card) ? getFirstPsalmCostReduction(state) : 0);
  const taintedPrayerPenalty =
    isCorruptionAtLeast(state.resources.corruption, "Tainted") &&
    (card.type.includes("Prayer") || card.type.includes("Psalm"))
      ? 1
      : 0;

  const adjustedCosts = card.cost.map((cost) => {
    if (cost.resource !== "Faith" || remainingReduction <= 0) {
      return cost;
    }

    const reduction = Math.min(cost.amount, remainingReduction);
    remainingReduction -= reduction;

    return {
      ...cost,
      amount: cost.amount - reduction,
    };
  });

  if (taintedPrayerPenalty <= 0) {
    return adjustedCosts;
  }

  const faithCost = adjustedCosts.find((cost) => cost.resource === "Faith");

  if (faithCost) {
    return adjustedCosts.map((cost) =>
      cost.resource === "Faith"
        ? { ...cost, amount: cost.amount + taintedPrayerPenalty }
        : cost,
    );
  }

  return [...adjustedCosts, { amount: taintedPrayerPenalty, resource: "Faith" as const }];
}

function formatMissingResourceSummary(missingCosts: ResourceCost[]) {
  if (missingCosts.length === 0) {
    return undefined;
  }

  return missingCosts
    .map((cost) => `Need ${cost.amount} more ${cost.resource}`)
    .join(", ");
}

function isPsalmCard(card: Card) {
  return card.type.includes("Psalm") || card.archetypeTags?.includes("Psalm");
}

function applyPostCardMemorialTriggers(
  beforeEffect: CombatState,
  afterEffect: CombatState,
  card: Card,
): CombatState {
  if (!card.type.includes("Judgment")) {
    return afterEffect;
  }

  const removal = getJudgmentCorruptionRemoval(beforeEffect);
  const removed = Math.min(afterEffect.resources.corruption, removal);

  if (removed <= 0) {
    return afterEffect;
  }

  return {
    ...afterEffect,
    resources: {
      ...afterEffect.resources,
      corruption: afterEffect.resources.corruption - removed,
    },
    feedback: [
      ...afterEffect.feedback,
      {
        id: afterEffect.feedback.length + 1,
        kind: "resource" as const,
        message: `Altar memorial: removed ${removed} Corruption.`,
      },
    ],
  };
}

function applyFearRemovalMemorial(state: CombatState, hadFearBeforeEffect: boolean) {
  const heal = getFirstFearRemovalHeal(state);

  if (!hadFearBeforeEffect || state.hasFear || heal <= 0) {
    return state;
  }

  const nextHealth = Math.min(state.player.maxHealth, state.player.health + heal);
  const healed = nextHealth - state.player.health;

  return {
    ...state,
    oilOfGladnessUsed: true,
    player: {
      ...state.player,
      health: nextHealth,
    },
    feedback: [
      ...state.feedback,
      {
        id: state.feedback.length + 1,
        kind: "guard" as const,
        message: `Oil of Gladness: healed ${healed}.`,
      },
    ],
  };
}

function applyStartOfCombatCards(state: CombatState): CombatState {
  const hasDreadPronouncement = [...state.hand, ...state.drawPile, ...state.discardPile].some(
    (instance) => instance.cardId === "card-dread-pronouncement",
  );

  if (!hasDreadPronouncement) {
    return state;
  }

  return {
    ...state,
    resources: {
      ...state.resources,
      faith: Math.max(0, state.resources.faith - 1),
    },
    feedback: [
      ...state.feedback,
      {
        id: state.feedback.length + 1,
        kind: "resource" as const,
        message: "Dread Pronouncement: -1 Faith at start of combat.",
      },
    ],
  };
}

function addFeedback(
  state: CombatState,
  kind: CombatFeedback["kind"],
  message: string,
): CombatState {
  return {
    ...state,
    feedback: [
      ...state.feedback,
      {
        id: state.feedback.length + 1,
        kind,
        message,
      },
    ],
  };
}
