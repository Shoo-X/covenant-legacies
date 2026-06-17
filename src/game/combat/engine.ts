import type { Card, Enemy, Hero, Memorial, StartingDeckCard } from "@/types/game";
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

  const initialState: CombatState = {
    hero,
    enemy,
    runDeck,
    memorials,
    startingFaithBonus,
    player: {
      health: hero.maxHealth,
      maxHealth: hero.maxHealth,
      guard: 0,
      might: 0,
    },
    enemyState: {
      health: enemy.maxHealth,
      maxHealth: enemy.maxHealth,
      guard: 0,
      might: 0,
    },
    resources: courageResources,
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
    heartOfCourageUsed: hasGiantThreat,
    status: "active",
    feedback: [
      ...(hasGiantThreat
        ? [
            {
              id: 1,
              kind: "resource" as const,
              message: "Heart of Courage: +1 Faith and +1 Resolve.",
            },
          ]
        : []),
      ...(enemy.traits.includes("Boss")
        ? [
            {
              id: hasGiantThreat ? 2 : 1,
              kind: "enemy" as const,
              message: "Fear pressure fills the high place.",
            },
          ]
        : []),
    ],
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
    );
  }

  if (state.status !== "active") {
    return state;
  }

  if (action.type === "play-card") {
    return playCard(state, action.instanceId, context);
  }

  return endTurn(state, context);
}

function playCard(
  state: CombatState,
  instanceId: string,
  context: CombatContext,
): CombatState {
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
    return applyFearRemovalMemorial(
      {
        ...secondEffect,
        oilOfGladnessUsed: memorialState.oilOfGladnessUsed,
      },
      beforeEffectHadFear || memorialState.hasFear,
    );
  }

  return applyFearRemovalMemorial(memorialState, beforeEffectHadFear);
}

function endTurn(state: CombatState, context: CombatContext): CombatState {
  const turnStartResources = getTurnStartResources(
    state.memorials,
    state.startingFaithBonus,
  );
  const selfBuff = state.enemy.intent.toLowerCase().includes("buff") ? 2 : 0;
  const nextEnemyMight = state.enemyState.might + selfBuff;
  const enemyAttackDamage = state.enemy.attackDamage + nextEnemyMight;
  const blockedDamage = Math.min(state.player.guard, enemyAttackDamage);
  const damageTaken = Math.max(0, enemyAttackDamage - state.player.guard);
  const nextHealth = Math.max(0, state.player.health - damageTaken);
  const enemyFeedback: CombatFeedback[] = [
    ...(selfBuff > 0
      ? [
          {
            id: state.feedback.length + 1,
            kind: "enemy" as const,
            message: `${state.enemy.name} gains ${selfBuff} Might.`,
          },
        ]
      : []),
    {
      id: state.feedback.length + (selfBuff > 0 ? 2 : 1),
      kind: "enemy",
      message: `${state.enemy.name} attacks for ${enemyAttackDamage}. ${blockedDamage} blocked, ${damageTaken} taken.`,
    },
  ];

  const afterEnemy: CombatState = {
    ...state,
    player: {
      ...state.player,
      health: nextHealth,
      guard: 0,
    },
    enemyState: {
      ...state.enemyState,
      might: nextEnemyMight,
    },
    hand: [],
    discardPile: [...state.discardPile, ...state.hand],
    resources: turnStartResources,
    turn: state.turn + 1,
    nextAttackBonus: 0,
    nextPrayerCostReduction: 0,
    covenantCardsTriggerTwice: false,
    firstPsalmDiscountUsed: false,
    status: nextHealth === 0 ? "defeat" : state.status,
    feedback: [
      ...state.feedback,
      ...enemyFeedback,
      ...(nextHealth === 0
        ? [
            {
              id: state.feedback.length + enemyFeedback.length + 1,
              kind: "system" as const,
              message: "The hero has fallen.",
            },
          ]
        : [
            {
              id: state.feedback.length + enemyFeedback.length + 1,
              kind: "system" as const,
              message: "New turn: Guard reset. Resolve 3, Faith 1.",
            },
          ]),
    ],
    lastPlayedInstanceId: undefined,
  };

  if (afterEnemy.status === "defeat") {
    return afterEnemy;
  }

  return drawCards(applyStartOfTurnMemorials(afterEnemy), startingHandSize, context.random);
}

export function canPayForCard(state: CombatState, card: Card) {
  if (card.isPlayable === false) {
    return false;
  }

  return getAdjustedCosts(state, card).every((cost) => {
    if (!cost.resource) {
      return true;
    }

    return getResourceValue(state.resources, cost.resource) >= cost.amount;
  });
}

function getAdjustedCosts(state: CombatState, card: Card) {
  let remainingReduction =
    (card.type.includes("Prayer") ? state.nextPrayerCostReduction : 0) +
    (isPsalmCard(card) ? getFirstPsalmCostReduction(state) : 0);

  return card.cost.map((cost) => {
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
