import type { Card, CardCombatEffect } from "@/types/game";
import { drawCards } from "./deck";
import { getGiantDamageBonus, getLowHealthAttackBonus } from "./memorials";
import { gainResource } from "./resources";
import type { CombatContext, CombatState } from "./types";

type CardEffect = (state: CombatState, card: Card, context: CombatContext) => CombatState;

export const cardEffects: Record<string, CardEffect> = {
  "card-sling-stone": (state, card) => {
    const traitBonus = state.enemy.traits.some(
      (trait) => trait === "Giant" || trait === "Nephilim",
    )
      ? card.isUpgraded
        ? 5
        : 3
      : 0;
    const damage =
      (card.isUpgraded ? 8 : 6) + traitBonus + state.nextAttackBonus;

    return dealEnemyDamage(
      {
        ...state,
        nextAttackBonus: 0,
      },
      damage,
      traitBonus > 0 ? "Sling Stone strikes a giant-blooded foe." : "Sling Stone hits.",
    );
  },
  "card-shepherds-guard": (state, card) =>
    gainPlayerGuard(state, card.isUpgraded ? 8 : 5, "Shepherd's Guard"),
  "card-psalm-of-courage": (state, _card, context) => {
    const guarded = gainPlayerGuard(
      {
        ...state,
        hasFear: false,
      },
      _card.isUpgraded ? 6 : 4,
      "Psalm of Courage",
    );

    return drawCards(guarded, 1, context.random);
  },
  "card-smooth-stone": (state, card) => ({
    ...state,
    nextAttackBonus: state.nextAttackBonus + (card.isUpgraded ? 5 : 3),
    feedback: [
      ...state.feedback,
      {
        id: state.feedback.length + 1,
        kind: "system",
        message: `Next attack gains +${card.isUpgraded ? 5 : 3} damage.`,
      },
    ],
  }),
  "card-forbidden-watcher-diagram": (state, card, context) =>
    drawCards(gainCorruption(state, card.isUpgraded ? 1 : 2), 3, context.random),
  "card-blessing-of-the-most-high": (state, card) => {
    const blessed = gainPlayerGuard(
      {
        ...state,
        hasFear: false,
      },
      card.isUpgraded ? 8 : 6,
      "Blessing of the Most High",
    );

    return blessed.resources.corruption === 0
      ? gainAuthority(blessed, card.isUpgraded ? 2 : 1)
      : blessed;
  },
  "card-bread-and-wine": (state, card, context) => {
    const healed = healPlayer(state, card.isUpgraded ? 7 : 5);

    return drawCards(
      {
        ...healed,
        nextPrayerCostReduction: Math.max(healed.nextPrayerCostReduction, 1),
        feedback: [
          ...healed.feedback,
          {
            id: healed.feedback.length + 1,
            kind: "system",
            message: "Next Prayer costs 1 less.",
          },
        ],
      },
      1,
      context.random,
    );
  },
  "card-order-of-the-king-priest": (state, card, context) =>
    drawCards(
      gainAuthority(
        {
          ...state,
          covenantCardsTriggerTwice: true,
        },
        card.isUpgraded ? 3 : 2,
      ),
      0,
      context.random,
    ),
  "card-forbidden-consultation": (state, card, context) => {
    const corrupted = gainCorruption(state, card.isUpgraded ? 1 : 2);

    return drawCards(
      {
        ...corrupted,
        feedback: [
          ...corrupted.feedback,
          {
            id: corrupted.feedback.length + 1,
            kind: "enemy",
            message: "Enemy intent revealed for 3 turns.",
          },
        ],
      },
      2,
      context.random,
    );
  },
  "card-discernment": (state) =>
    ({
      ...state,
      hasFear: false,
      feedback: [
        ...state.feedback,
        {
          id: state.feedback.length + 1,
          kind: "system",
          message: "Discernment reveals intent and removes Fear, Deception, or one hidden trap.",
        },
      ],
    }),
};

export function applyCardEffect(
  state: CombatState,
  card: Card,
  context: CombatContext,
): CombatState {
  const bespokeEffect = cardEffects[card.id];

  if (bespokeEffect) {
    return bespokeEffect(state, card, context);
  }

  return applyConfiguredEffect(state, card, card.combatEffect, context);
}

function applyConfiguredEffect(
  state: CombatState,
  card: Card,
  effect: CardCombatEffect | undefined,
  context: CombatContext,
): CombatState {
  if (!effect) {
    return state;
  }

  let nextState = state;

  if (effect.damage) {
    const antiGiantBonus =
      effect.antiGiantDamage &&
      nextState.enemy.traits.some((trait) => trait === "Giant" || trait === "Nephilim")
        ? effect.antiGiantDamage
        : 0;
    const totalDamage = effect.damage + antiGiantBonus + nextState.nextAttackBonus;

    nextState = dealEnemyDamage(
      {
        ...nextState,
        nextAttackBonus: 0,
      },
      totalDamage,
      antiGiantBonus > 0 ? "Anti-giant strike lands." : "Attack lands.",
    );
  }

  if (effect.guard) {
    const cleanHandsBonus =
      nextState.resources.corruption === 0 && card.type.includes("Covenant") ? 1 : 0;

    nextState = gainPlayerGuard(
      nextState,
      effect.guard + cleanHandsBonus,
      cleanHandsBonus > 0 ? "Clean Hands covenant bonus" : "Card",
    );
  }

  if (effect.heal) {
    const cleanHandsBonus =
      nextState.resources.corruption === 0 && card.type.includes("Covenant") ? 1 : 0;

    nextState = healPlayer(nextState, effect.heal + cleanHandsBonus);
  }

  if (effect.removeFear) {
    nextState = {
      ...nextState,
      hasFear: false,
      feedback: [
        ...nextState.feedback,
        {
          id: nextState.feedback.length + 1,
          kind: "system",
          message: "Fear removed.",
        },
      ],
    };
  }

  if (effect.removeCorruption) {
    const removed = Math.min(nextState.resources.corruption, effect.removeCorruption);
    nextState = {
      ...nextState,
      resources: {
        ...nextState.resources,
        corruption: nextState.resources.corruption - removed,
      },
      feedback: [
        ...nextState.feedback,
        {
          id: nextState.feedback.length + 1,
          kind: "resource",
          message: `Removed ${removed} Corruption.`,
        },
      ],
    };
  }

  if (effect.gainResolve) {
    nextState = gainNamedResource(nextState, "Resolve", effect.gainResolve);
  }

  if (effect.gainFaith) {
    nextState = gainNamedResource(nextState, "Faith", effect.gainFaith);
  }

  if (effect.gainWisdom) {
    nextState = gainNamedResource(nextState, "Wisdom", effect.gainWisdom);
  }

  if (effect.gainAuthority) {
    nextState = gainAuthority(nextState, effect.gainAuthority);
  }

  if (effect.gainCorruption) {
    nextState = gainCorruption(nextState, effect.gainCorruption);
  }

  if (effect.nextAttackBonus) {
    nextState = {
      ...nextState,
      nextAttackBonus: nextState.nextAttackBonus + effect.nextAttackBonus,
      feedback: [
        ...nextState.feedback,
        {
          id: nextState.feedback.length + 1,
          kind: "system",
          message: `Next attack gains +${effect.nextAttackBonus} damage.`,
        },
      ],
    };
  }

  if (effect.nextPrayerCostReduction) {
    nextState = {
      ...nextState,
      nextPrayerCostReduction: Math.max(
        nextState.nextPrayerCostReduction,
        effect.nextPrayerCostReduction,
      ),
      feedback: [
        ...nextState.feedback,
        {
          id: nextState.feedback.length + 1,
          kind: "system",
          message: `Next Prayer costs ${effect.nextPrayerCostReduction} less.`,
        },
      ],
    };
  }

  if (effect.note) {
    nextState = {
      ...nextState,
      feedback: [
        ...nextState.feedback,
        {
          id: nextState.feedback.length + 1,
          kind: "system",
          message: effect.note,
        },
      ],
    };
  }

  if (effect.ifCorruptionZero && nextState.resources.corruption === 0) {
    nextState = applyConfiguredEffect(nextState, card, effect.ifCorruptionZero, context);
  }

  if (effect.draw) {
    nextState = drawCards(nextState, effect.draw, context.random);
  }

  return nextState;
}

function gainCorruption(state: CombatState, amount: number): CombatState {
  const bossMightGain =
    state.enemy.traits.includes("Boss") && state.bossPhase >= 3 ? amount : 0;

  return {
    ...state,
    resources: gainResource(state.resources, "Corruption", amount),
    enemyState: {
      ...state.enemyState,
      might: state.enemyState.might + bossMightGain,
    },
    feedback: [
      ...state.feedback,
      {
        id: state.feedback.length + 1,
        kind: "resource",
        message: `+${amount} Corruption.`,
      },
      ...(bossMightGain > 0
        ? [
            {
              id: state.feedback.length + 2,
              kind: "enemy" as const,
              message: `${state.enemy.name} gains ${bossMightGain} Might from Corruption.`,
            },
          ]
        : []),
    ],
  };
}

export function dealEnemyDamage(
  state: CombatState,
  damage: number,
  message: string,
): CombatState {
  const memorialBonus = getLowHealthAttackBonus(state) + getGiantDamageBonus(state);
  const totalDamage = damage + memorialBonus;
  const nextHealth = Math.max(0, state.enemyState.health - totalDamage);
  const status = nextHealth === 0 ? "victory" : state.status;
  const nextBossPhase = getNextBossPhase(state, nextHealth);
  const phaseChanged = nextBossPhase > state.bossPhase;
  const phaseFeedback = getBossPhaseFeedback(state, nextBossPhase, phaseChanged);

  return {
    ...state,
    enemyState: {
      ...state.enemyState,
      health: nextHealth,
      might:
        phaseChanged && nextBossPhase >= 3
          ? state.enemyState.might + 1
          : state.enemyState.might,
    },
    bossPhase: nextBossPhase,
    hasFear: phaseChanged && nextBossPhase >= 2 ? true : state.hasFear,
    status,
    feedback: [
      ...state.feedback,
      {
        id: state.feedback.length + 1,
        kind: "damage",
        message: `${message} -${totalDamage} enemy health${
          memorialBonus > 0 ? ` (${memorialBonus} from Memorials)` : ""
        }.`,
      },
      ...phaseFeedback,
      ...(status === "victory"
        ? [
            {
              id: state.feedback.length + 2 + phaseFeedback.length,
              kind: "system" as const,
              message: "Enemy defeated.",
            },
          ]
        : []),
    ],
  };
}

function getNextBossPhase(state: CombatState, nextHealth: number) {
  if (!state.enemy.traits.includes("Boss")) {
    return state.bossPhase;
  }

  const healthRatio = nextHealth / state.enemyState.maxHealth;

  if (healthRatio <= 0.3) {
    return 3;
  }

  if (healthRatio <= 0.6) {
    return 2;
  }

  return 1;
}

function getBossPhaseFeedback(
  state: CombatState,
  nextBossPhase: number,
  phaseChanged: boolean,
): CombatState["feedback"] {
  if (!phaseChanged || !state.enemy.traits.includes("Boss")) {
    return [];
  }

  if (nextBossPhase >= 3) {
    return [
      {
        id: state.feedback.length + 2,
        kind: "enemy",
        message: "Phase 3: Shadow of the Watchers gathers. The Giant gains 1 Might.",
      },
    ];
  }

  if (nextBossPhase >= 2) {
    return [
      {
        id: state.feedback.length + 2,
        kind: "enemy",
        message: "Phase 2: Fear rises from the high place.",
      },
    ];
  }

  return [];
}

export function gainPlayerGuard(
  state: CombatState,
  amount: number,
  source: string,
): CombatState {
  return {
    ...state,
    player: {
      ...state.player,
      guard: state.player.guard + amount,
    },
    feedback: [
      ...state.feedback,
      {
        id: state.feedback.length + 1,
        kind: "guard",
        message: `${source}: +${amount} Guard.`,
      },
    ],
  };
}

function gainAuthority(state: CombatState, amount: number): CombatState {
  return {
    ...state,
    resources: gainResource(state.resources, "Authority", amount),
    feedback: [
      ...state.feedback,
      {
        id: state.feedback.length + 1,
        kind: "resource",
        message: `+${amount} Authority.`,
      },
    ],
  };
}

function gainNamedResource(
  state: CombatState,
  resource: "Resolve" | "Faith" | "Wisdom",
  amount: number,
): CombatState {
  return {
    ...state,
    resources: gainResource(state.resources, resource, amount),
    feedback: [
      ...state.feedback,
      {
        id: state.feedback.length + 1,
        kind: "resource",
        message: `+${amount} ${resource}.`,
      },
    ],
  };
}

function healPlayer(state: CombatState, amount: number): CombatState {
  const nextHealth = Math.min(state.player.maxHealth, state.player.health + amount);
  const healed = nextHealth - state.player.health;

  return {
    ...state,
    player: {
      ...state.player,
      health: nextHealth,
    },
    feedback: [
      ...state.feedback,
      {
        id: state.feedback.length + 1,
        kind: "guard",
        message: `Healed ${healed} health.`,
      },
    ],
  };
}
