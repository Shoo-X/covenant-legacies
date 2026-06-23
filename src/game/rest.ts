import type { Card, ResourceState, StartingDeckCard } from "@/types/game";
import { getCardUpgradeText, getUpgradeTarget } from "@/game/cardUpgrades";

export type RestChoiceId = "rest" | "upgrade" | "remember" | "cleanse";

export interface RestRunState {
  hasFear: boolean;
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
  details?: RestChoiceDetail[];
  effectSummary: string;
}

export interface RestChoiceDetail {
  label: string;
  value: string;
}

export interface RestResolution {
  message: string;
  state: RestRunState;
}

const restHealAmount = 24;
const corruptionCleanseAmount = 2;
const lionAndBearCardId = "card-lion-and-bear";

export function getRestChoices(
  state: RestRunState,
  cardsById: Map<string, Card>,
): RestChoice[] {
  const upgradeTarget = getCourageUpgradeTarget(
    state.runDeck,
    state.upgradedCardIds,
    cardsById,
  );

  return [
    {
      id: "rest",
      label: "Rest by the Brook",
      description: `Heal ${restHealAmount} Health before the final ascent.`,
      disabled: state.runHealth >= state.maxHealth,
      effectSummary:
        state.runHealth >= state.maxHealth
          ? "Health is already full."
          : `Heal up to ${restHealAmount} Health.`,
    },
    {
      id: "upgrade",
      label: "Choose a Smooth Stone",
      description: upgradeTarget
        ? `Upgrade all copies of ${upgradeTarget.name}, a Courage card, for the rest of this run.`
        : "No upgradeable Courage cards remain in the run deck.",
      disabled: !upgradeTarget,
      effectSummary: upgradeTarget
        ? `Every ${upgradeTarget.name} copy will use upgraded card text in combat.`
        : "No Courage card can be upgraded.",
      details: upgradeTarget
        ? [
            { label: "Original", value: upgradeTarget.text },
            { label: "Upgraded", value: getCardUpgradeText(upgradeTarget) },
            { label: "Source", value: upgradeTarget.sourceTier },
            {
              label: "References",
              value: upgradeTarget.references.join(", "),
            },
          ]
        : undefined,
    },
    {
      id: "remember",
      label: "Remember the Lion and Bear",
      description:
        "Carry the memory of former deliverance into the public battle.",
      effectSummary: "Add Lion and Bear to the run deck.",
      details: [
        { label: "Reference", value: "1 Samuel 17:34-37" },
        { label: "Role", value: "Courage attack with Guard" },
      ],
    },
    {
      id: "cleanse",
      label: "Pray in the Valley",
      description: state.hasFear
        ? "Remove Fear before Goliath's challenge."
        : `Cleanse up to ${corruptionCleanseAmount} Corruption before Goliath's challenge.`,
      disabled: !state.hasFear && state.runResources.corruption <= 0,
      effectSummary:
        state.hasFear
          ? "Remove Fear."
          : state.runResources.corruption <= 0
            ? "There is no Fear or Corruption to cleanse."
            : `Remove up to ${corruptionCleanseAmount} Corruption.`,
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

  if (choiceId === "remember") {
    return {
      message: "Lion and Bear added to your run deck.",
      state: {
        ...state,
        runDeck: addCardToDeck(state.runDeck, lionAndBearCardId),
      },
    };
  }

  if (choiceId === "cleanse") {
    if (state.hasFear) {
      return {
        message: "Fear removed.",
        state: {
          ...state,
          hasFear: false,
        },
      };
    }

    const nextCorruption = Math.max(
      0,
      state.runResources.corruption - corruptionCleanseAmount,
    );

    return {
      message:
        nextCorruption === state.runResources.corruption
          ? "There was no Corruption to cleanse."
          : `Removed ${state.runResources.corruption - nextCorruption} Corruption.`,
      state: {
        ...state,
        runResources: {
          ...state.runResources,
          corruption: nextCorruption,
        },
      },
    };
  }

  const upgradeTarget = getCourageUpgradeTarget(
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
    message: `All copies of ${upgradeTarget.name} upgraded.`,
    state: {
      ...state,
      upgradedCardIds: [...state.upgradedCardIds, upgradeTarget.id],
    },
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

function getCourageUpgradeTarget(
  runDeck: StartingDeckCard[],
  upgradedCardIds: string[],
  cardsById: Map<string, Card>,
) {
  const courageTarget = getUpgradeTarget(
    runDeck.filter((entry) => {
      const card = cardsById.get(entry.cardId);

      return card?.archetypeTags?.includes("Courage");
    }),
    upgradedCardIds,
    cardsById,
  );

  return courageTarget ?? getUpgradeTarget(runDeck, upgradedCardIds, cardsById);
}
