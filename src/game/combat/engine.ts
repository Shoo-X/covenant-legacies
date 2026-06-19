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
import { hasCourageMechanic, startingCourage } from "./courage";
import { buildStartingDeck, drawCards, shuffleDeck } from "./deck";
import { getEnemyMaxHealth } from "./enemyPatterns";
import {
  applyStartOfCombatMemorials,
  applyStartOfTurnMemorials,
  getFirstFearRemovalHeal,
  getFirstPsalmCostReduction,
  getJudgmentCorruptionRemoval,
  getTurnStartResources,
} from "./memorials";
import { getResourceValue, spendResource } from "./resources";
import type {
  CombatAction,
  CombatCardInstance,
  CombatContext,
  CombatFeedback,
  CombatStartSnapshot,
  CombatState,
  CombatantState,
  CombatTargetId,
} from "./types";
import { createEncounterStructures } from "./structures";

const defaultOpeningHandSize = 5;

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
  const enemyMaxHealth = getEnemyMaxHealth(enemy.id, enemy.maxHealth);
  const playerStartHealth = Math.max(1, Math.min(hero.maxHealth, runHealth));
  const turnStartResources = getTurnStartResources(memorials, startingFaithBonus);
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
    (enemy.traits.includes("Watcher") || enemy.traits.includes("Nephilim")) &&
    isCorruptionAtLeast(runResources.corruption, "Marked")
  ) {
    initialFeedback.push({
      id: initialFeedback.length + 1,
      kind: "enemy",
      message: "Marked: Shadow of the Watchers is already near.",
    });
  }

  const initialStructures = createEncounterStructures(enemy.id);
  const initialState: CombatState = {
    hero,
    enemy,
    runDeck,
    runHealth,
    runResources,
    memorials,
    startingFaithBonus,
    player: {
      health: playerStartHealth,
      maxHealth: hero.maxHealth,
      guard: 0,
      might: 0,
    },
    enemyState: {
      health: enemyMaxHealth,
      maxHealth: enemyMaxHealth,
      guard: 0,
      might: oppressedMight,
    },
    resources: {
      resolve: Math.max(runResources.resolve, turnStartResources.resolve),
      faith: Math.max(runResources.faith, turnStartResources.faith),
      wisdom: runResources.wisdom,
      authority: runResources.authority,
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
    courage: hasCourageMechanic(hero) ? startingCourage : 0,
    heartOfCourageUsed: false,
    bossPhase: enemy.traits.includes("Boss") ? 1 : 0,
    destroyedAltarOrStructure: initialStructures.length === 0,
    structures: initialStructures,
    status: "active",
    phase: "BattleIntro",
    actionQueue: [],
    activeAction: undefined,
    lastResolvedAction: undefined,
    metrics: {
      roundsTaken: 1,
      startingHealth: playerStartHealth,
      endingHealth: playerStartHealth,
      damageDealt: 0,
      damageReceived: 0,
      guardGenerated: 0,
      corruptionGained: 0,
      cardsPlayed: 0,
    },
    feedback: initialFeedback,
  };

  const readyState = applyStartOfCombatCards(
    applyStartOfCombatMemorials(
      applyStartOfTurnMemorials(
        drawCards(
          applyHeartOfCourageRevealBonus(initialState),
          getOpeningHandSize(hero),
          random,
        ),
      ),
      cardsById,
      random,
    ),
  );

  return {
    ...readyState,
    startSnapshot: createCombatStartSnapshot(readyState),
  };
}

export function combatReducer(
  state: CombatState,
  action: CombatAction,
  context: CombatContext,
): CombatState {
  if (action.type === "restart") {
    if (state.startSnapshot) {
      return restoreCombatStartSnapshot(state.startSnapshot);
    }

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
    return playCard(state, action.instanceId, context, action.targetId);
  }

  return endTurn(state);
}

function playCard(
  state: CombatState,
  instanceId: string,
  context: CombatContext,
  targetId: CombatTargetId = "enemy",
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
    metrics: {
      ...paidState.metrics,
      cardsPlayed: paidState.metrics.cardsPlayed + 1,
      notableArchetype: card.archetypeTags?.[0] ?? card.type.split("/")[0],
      notableCardName: card.name,
    },
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
  const effectedState = applyCardEffect(movedState, card, context, targetId);
  const memorialState = applyPostCardMemorialTriggers(
    movedState,
    effectedState,
    card,
  );

  if (state.covenantCardsTriggerTwice && card.type.includes("Covenant")) {
    const secondEffect = applyCardEffect(memorialState, card, context, targetId);
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
  const nextResources: ResourceState = {
    resolve: turnStartResources.resolve,
    faith: Math.max(state.resources.faith, turnStartResources.faith),
    wisdom: state.resources.wisdom,
    authority: state.resources.authority,
    corruption: state.resources.corruption,
  };
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
      resources: nextResources,
      turn: state.turn + 1,
      nextAttackBonus: 0,
      nextPrayerCostReduction: 0,
      covenantCardsTriggerTwice: false,
      firstPsalmDiscountUsed: false,
      metrics: {
        ...state.metrics,
        roundsTaken: state.turn + 1,
      },
      lastPlayedInstanceId: undefined,
    },
    "system",
    `New turn: Guard reset. Resolve ${nextResources.resolve}, Faith ${nextResources.faith}. Wisdom ${nextResources.wisdom}, Authority ${nextResources.authority}. Corruption ${nextResources.corruption}.`,
  );
  const nextIntent = getEnemyIntentDetails(nextState);

  nextState = applyHeartOfCourageRevealBonus(nextState);

  const beforeDrawState = applyStartOfTurnMemorials(nextState);
  const drawnState = drawCards(
    beforeDrawState,
    getOpeningHandSize(state.hero),
    context.random,
  );
  const drawnCount = Math.max(0, drawnState.hand.length - beforeDrawState.hand.length);
  const readyState =
    drawnCount > 0
      ? addFeedback(
          drawnState,
          "draw",
          `Drew ${drawnCount} ${drawnCount === 1 ? "card" : "cards"}.`,
        )
      : drawnState;

  return addFeedback(
    readyState,
    "enemy",
    `Next intent: ${nextIntent.actionName} - ${nextIntent.summary}.`,
  );
}

function applyHeartOfCourageRevealBonus(state: CombatState): CombatState {
  if (state.heartOfCourageUsed || !hasCourageMechanic(state.hero)) {
    return state;
  }

  const intent = getEnemyIntentDetails(state);
  const hasGiantThreat = state.enemy.traits.some(
    (trait) => trait === "Giant" || trait === "Nephilim",
  );
  const revealsHeavyAttack = intent.intentType === "Heavy Attack";

  if (!hasGiantThreat && !revealsHeavyAttack) {
    return state;
  }

  return addFeedback(
    {
      ...state,
      heartOfCourageUsed: true,
      resources: {
        ...state.resources,
        faith: state.resources.faith + 1,
        resolve: state.resources.resolve + 1,
      },
    },
    "resource",
    hasGiantThreat
      ? "Heart of Courage: giant threat revealed. +1 Faith and +1 Resolve."
      : "Heart of Courage: heavy attack revealed. +1 Faith and +1 Resolve.",
  );
}

function getOpeningHandSize(hero: Hero) {
  return hero.openingHandSize ?? defaultOpeningHandSize;
}

function syncTerminalPhase(state: CombatState): CombatState {
  if (state.status === "victory") {
    return {
      ...state,
      phase: "Victory",
      actionQueue: [],
      activeAction: undefined,
      metrics: {
        ...state.metrics,
        endingHealth: state.player.health,
        roundsTaken: state.turn,
      },
    };
  }

  if (state.status === "defeat") {
    return {
      ...state,
      phase: "Defeat",
      actionQueue: [],
      activeAction: undefined,
      metrics: {
        ...state.metrics,
        endingHealth: state.player.health,
        roundsTaken: state.turn,
      },
    };
  }

  return state;
}

function createCombatStartSnapshot(state: CombatState): CombatStartSnapshot {
  return {
    hero: state.hero,
    enemy: state.enemy,
    runDeck: cloneStartingDeck(state.runDeck),
    runHealth: state.runHealth,
    runResources: cloneResources(state.runResources),
    memorials: [...state.memorials],
    startingFaithBonus: state.startingFaithBonus,
    player: cloneCombatant(state.player),
    enemyState: cloneCombatant(state.enemyState),
    resources: cloneResources(state.resources),
    drawPile: cloneCardInstances(state.drawPile),
    hand: cloneCardInstances(state.hand),
    discardPile: cloneCardInstances(state.discardPile),
    turn: state.turn,
    nextAttackBonus: state.nextAttackBonus,
    nextPrayerCostReduction: state.nextPrayerCostReduction,
    covenantCardsTriggerTwice: state.covenantCardsTriggerTwice,
    firstPsalmDiscountUsed: state.firstPsalmDiscountUsed,
    oilOfGladnessUsed: state.oilOfGladnessUsed,
    hasFear: state.hasFear,
    playerStatuses: [...state.playerStatuses],
    enemyStatuses: [...state.enemyStatuses],
    courage: state.courage,
    heartOfCourageUsed: state.heartOfCourageUsed,
    bossPhase: state.bossPhase,
    destroyedAltarOrStructure: state.destroyedAltarOrStructure,
    structures: cloneStructures(state.structures),
    metrics: { ...state.metrics },
    feedback: state.feedback.map((item) => ({ ...item })),
  };
}

function restoreCombatStartSnapshot(snapshot: CombatStartSnapshot): CombatState {
  const restoredState: CombatState = {
    hero: snapshot.hero,
    enemy: snapshot.enemy,
    runDeck: cloneStartingDeck(snapshot.runDeck),
    runHealth: snapshot.runHealth,
    runResources: cloneResources(snapshot.runResources),
    memorials: [...snapshot.memorials],
    startingFaithBonus: snapshot.startingFaithBonus,
    player: cloneCombatant(snapshot.player),
    enemyState: cloneCombatant(snapshot.enemyState),
    resources: cloneResources(snapshot.resources),
    drawPile: cloneCardInstances(snapshot.drawPile),
    hand: cloneCardInstances(snapshot.hand),
    discardPile: cloneCardInstances(snapshot.discardPile),
    turn: snapshot.turn,
    nextAttackBonus: snapshot.nextAttackBonus,
    nextPrayerCostReduction: snapshot.nextPrayerCostReduction,
    covenantCardsTriggerTwice: snapshot.covenantCardsTriggerTwice,
    firstPsalmDiscountUsed: snapshot.firstPsalmDiscountUsed,
    oilOfGladnessUsed: snapshot.oilOfGladnessUsed,
    hasFear: snapshot.hasFear,
    playerStatuses: [...snapshot.playerStatuses],
    enemyStatuses: [...snapshot.enemyStatuses],
    courage: snapshot.courage,
    heartOfCourageUsed: snapshot.heartOfCourageUsed,
    bossPhase: snapshot.bossPhase,
    destroyedAltarOrStructure: snapshot.destroyedAltarOrStructure,
    structures: cloneStructures(snapshot.structures),
    status: "active",
    phase: "BattleIntro",
    actionQueue: [],
    activeAction: undefined,
    lastResolvedAction: undefined,
    metrics: { ...snapshot.metrics },
    feedback: snapshot.feedback.map((item) => ({ ...item })),
    lastPlayedInstanceId: undefined,
  };

  return {
    ...restoredState,
    startSnapshot: createCombatStartSnapshot(restoredState),
  };
}

function cloneResources(resources: ResourceState): ResourceState {
  return { ...resources };
}

function cloneStartingDeck(runDeck: StartingDeckCard[]) {
  return runDeck.map((entry) => ({ ...entry }));
}

function cloneCardInstances(instances: CombatCardInstance[]) {
  return instances.map((instance) => ({ ...instance }));
}

function cloneCombatant(combatant: CombatantState) {
  return { ...combatant };
}

function cloneStructures(structures: CombatState["structures"]) {
  return structures.map((structure) => ({ ...structure }));
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
