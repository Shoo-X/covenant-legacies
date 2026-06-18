import type { CombatFeedback, CombatState } from "./types";
import type { Hero } from "@/types/game";

export const maxCourage = 3;
export const startingCourage = 1;

export function hasCourageMechanic(hero: Hero) {
  return hero.passiveName === "Heart of Courage" || hero.passive.name === "Heart of Courage";
}

export function gainCourage(
  state: CombatState,
  amount: number,
  source: string,
): CombatState {
  if (!hasCourageMechanic(state.hero)) {
    return state;
  }

  const nextCourage = Math.min(maxCourage, state.courage + amount);
  const gained = nextCourage - state.courage;

  if (gained <= 0) {
    return appendFeedback(state, "resource", `${source}: Courage is already full.`);
  }

  return appendFeedback(
    {
      ...state,
      courage: nextCourage,
    },
    "resource",
    `${source}: +${gained} Courage (${nextCourage}/${maxCourage}).`,
  );
}

export function consumeCourageForAttack(state: CombatState) {
  if (!hasCourageMechanic(state.hero)) {
    return { state, bonus: 0, consumed: 0 };
  }

  const consumed = Math.min(maxCourage, state.courage);

  if (consumed <= 0) {
    return { state, bonus: 0, consumed: 0 };
  }

  return {
    state: appendFeedback(
      {
        ...state,
        courage: 0,
      },
      "damage",
      `Courage spent: +${consumed * 2} attack damage.`,
    ),
    bonus: consumed * 2,
    consumed,
  };
}

function appendFeedback(
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
