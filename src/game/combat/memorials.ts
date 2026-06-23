import type { Card, Memorial, ResourceState } from "@/types/game";
import { drawCards } from "./deck";
import type { CombatState } from "./types";

export function hasMemorial(state: CombatState, memorialId: string) {
  return state.memorials.some((memorial) => memorial.id === memorialId);
}

export function getTurnStartResources(
  memorials: Memorial[],
  startingFaithBonus: number,
): ResourceState {
  const resolveBonus = memorials.reduce(
    (total, memorial) => total + (memorial.effect.turnResolveBonus ?? 0),
    0,
  );

  return {
    resolve: 3 + resolveBonus,
    faith: 1 + startingFaithBonus,
    wisdom: 0,
    authority: 0,
    corruption: 0,
  };
}

export function applyStartOfCombatMemorials(
  state: CombatState,
  cardsById: Map<string, Card>,
  random: () => number,
): CombatState {
  let nextState = state;

  state.memorials.forEach((memorial) => {
    if (memorial.effect.startCombatCardId && cardsById.has(memorial.effect.startCombatCardId)) {
      nextState = {
        ...nextState,
        hand: [
          ...nextState.hand,
          {
            cardId: memorial.effect.startCombatCardId,
            instanceId: `${memorial.effect.startCombatCardId}-memorial-${memorial.id}`,
          },
        ],
        feedback: [
          ...nextState.feedback,
          {
            id: nextState.feedback.length + 1,
            kind: "draw" as const,
            message: `${memorial.name}: ${cardsById.get(memorial.effect.startCombatCardId)?.name} added to hand.`,
          },
        ],
      };
    }

    if (memorial.effect.startCombatDraw) {
      nextState = drawCards(nextState, memorial.effect.startCombatDraw, random);
      nextState = {
        ...nextState,
        feedback: [
          ...nextState.feedback,
          {
            id: nextState.feedback.length + 1,
            kind: "draw" as const,
            message: `${memorial.name}: drew ${memorial.effect.startCombatDraw} extra card.`,
          },
        ],
      };
    }
  });

  return nextState;
}

export function applyStartOfTurnMemorials(state: CombatState): CombatState {
  const guard = state.memorials.reduce(
    (total, memorial) => total + (memorial.effect.startTurnGuard ?? 0),
    0,
  );

  if (guard <= 0) {
    return state;
  }

  return {
    ...state,
    player: {
      ...state.player,
      guard: state.player.guard + guard,
    },
    feedback: [
      ...state.feedback,
      {
        id: state.feedback.length + 1,
        kind: "guard" as const,
        message: `Memorials: +${guard} Guard at start of turn.`,
      },
    ],
  };
}

export function getFirstPsalmCostReduction(state: CombatState) {
  if (state.firstPsalmDiscountUsed) {
    return 0;
  }

  return state.memorials.reduce(
    (total, memorial) => Math.max(total, memorial.effect.firstPsalmCostReduction ?? 0),
    0,
  );
}

export function getLowHealthAttackBonus(state: CombatState) {
  if (state.player.health >= state.player.maxHealth / 2) {
    return 0;
  }

  return state.memorials.reduce(
    (total, memorial) => total + (memorial.effect.lowHealthAttackDamage ?? 0),
    0,
  );
}

export function getGiantDamageBonus(state: CombatState) {
  const isGiant = state.enemy.traits.some(
    (trait) => trait === "Giant" || trait === "Nephilim",
  );

  if (!isGiant) {
    return 0;
  }

  return state.memorials.reduce(
    (total, memorial) => total + (memorial.effect.giantDamageBonus ?? 0),
    0,
  );
}

export function getJudgmentCorruptionRemoval(state: CombatState) {
  return state.memorials.reduce(
    (total, memorial) => total + (memorial.effect.judgmentRemoveCorruption ?? 0),
    0,
  );
}

export function getFirstFearRemovalHeal(state: CombatState) {
  if (state.oilOfGladnessUsed) {
    return 0;
  }

  return state.memorials.reduce(
    (total, memorial) => Math.max(total, memorial.effect.firstFearRemovalHeal ?? 0),
    0,
  );
}
