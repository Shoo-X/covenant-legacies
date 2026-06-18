import type { Card, ResourceState, StartingDeckCard } from "@/types/game";
import { getUpgradeTarget } from "@/game/cardUpgrades";

export type RestChoiceId = "rest" | "upgrade" | "cleanse";

export interface RestRunState {
  maxHealth: number;
  runDeck: StartingDeckCard[];
  runHealth: number;
  runResources: ResourceState;
  upgradedCardIds: string[];
}

export interface RestChoice {
  id: RestChoiceId;
  label: string;
  description: string;
  disabled?: boolean;
  effectSummary: string;
}

export interface RestResolution {
  message: string;
  state: RestRunState;
}

const restHealAmount = 18;

export function getRestChoices(
  state: RestRunState,
  cardsById: Map<string, Card>,
): RestChoice[] {
  const upgradeTarget = getUpgradeTarget(
    state.runDeck,
    state.upgradedCardIds,
    cardsById,
  );

  return [
    {
      id: "rest",
      label: "Rest",
      description: `Heal ${restHealAmount} Health at the spring.`,
      disabled: state.runHealth >= state.maxHealth,
      effectSummary:
        state.runHealth >= state.maxHealth
          ? "Health is already full."
          : `Heal up to ${restHealAmount} Health.`,
    },
    {
      id: "upgrade",
      label: "Upgrade",
      description: upgradeTarget
        ? `Improve ${upgradeTarget.name} for the rest of this run.`
        : "No upgradeable cards remain in the run deck.",
      disabled: !upgradeTarget,
      effectSummary: upgradeTarget
        ? `${upgradeTarget.name} will use its upgraded text in combat.`
        : "No card can be upgraded.",
    },
    {
      id: "cleanse",
      label: "Cleanse",
      description: "Remove 1 Corruption before climbing higher.",
      disabled: state.runResources.corruption <= 0,
      effectSummary:
        state.runResources.corruption <= 0
          ? "There is no Corruption to cleanse."
          : "Remove 1 Corruption.",
    },
  ];
}

export function applyRestChoice(
  state: RestRunState,
  choiceId: RestChoiceId,
  cardsById: Map<string, Card>,
): RestResolution {
  if (choiceId === "rest") {
    const nextHealth = Math.min(state.maxHealth, state.runHealth + restHealAmount);
    const healed = nextHealth - state.runHealth;

    return {
      message: healed > 0 ? `Restored ${healed} Health.` : "Health was already full.",
      state: {
        ...state,
        runHealth: nextHealth,
      },
    };
  }

  if (choiceId === "cleanse") {
    const nextCorruption = Math.max(0, state.runResources.corruption - 1);

    return {
      message:
        nextCorruption === state.runResources.corruption
          ? "There was no Corruption to cleanse."
          : "Removed 1 Corruption.",
      state: {
        ...state,
        runResources: {
          ...state.runResources,
          corruption: nextCorruption,
        },
      },
    };
  }

  const upgradeTarget = getUpgradeTarget(
    state.runDeck,
    state.upgradedCardIds,
    cardsById,
  );

  if (!upgradeTarget) {
    return {
      message: "No upgradeable cards remain.",
      state,
    };
  }

  return {
    message: `${upgradeTarget.name} upgraded.`,
    state: {
      ...state,
      upgradedCardIds: [...state.upgradedCardIds, upgradeTarget.id],
    },
  };
}
