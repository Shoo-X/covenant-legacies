import type {
  BonusAgainstTraitEffect,
  Card,
  CardCombatEffect,
  CardEffect,
  CombatStatusName,
  EnemyTrait,
  ResourceName,
  TemporaryCardDestination,
} from "@/types/game";
import { drawCards } from "./deck";
import { getGiantDamageBonus, getLowHealthAttackBonus } from "./memorials";
import { gainResource, getResourceValue, spendResource } from "./resources";
import type {
  CombatCardInstance,
  CombatContext,
  CombatFeedback,
  CombatState,
} from "./types";

export function applyCardEffect(
  state: CombatState,
  card: Card,
  context: CombatContext,
): CombatState {
  return resolveCardEffects(state, card, context);
}

export function resolveCardEffects(
  state: CombatState,
  card: Card,
  context: CombatContext,
): CombatState {
  return getCardEffects(card).reduce(
    (currentState, effect) => resolveEffect(currentState, card, effect, context),
    state,
  );
}

export function getCardEffects(card: Card): CardEffect[] {
  if (card.effects?.length) {
    return card.effects;
  }

  return legacyCombatEffectToCardEffects(card.combatEffect);
}

export function hasCardEffectType(
  card: Card,
  effectTypes: CardEffect["type"][],
): boolean {
  const typeSet = new Set(effectTypes);

  return getCardEffects(card).some((effect) => effectIncludesType(effect, typeSet));
}

function effectIncludesType(
  effect: CardEffect,
  effectTypes: Set<CardEffect["type"]>,
): boolean {
  if (effectTypes.has(effect.type)) {
    return true;
  }

  if (
    effect.type === "TriggerIfEnemyTrait" ||
    effect.type === "TriggerIfCorruptionAtMost" ||
    effect.type === "TriggerIfCorruptionAtLeast" ||
    effect.type === "TriggerIfStatusPresent"
  ) {
    return effect.effects.some((nestedEffect) =>
      effectIncludesType(nestedEffect, effectTypes),
    );
  }

  if (effect.type === "DealDamage") {
    return (
      effect.bonuses?.some((bonus) => effectIncludesType(bonus, effectTypes)) ?? false
    );
  }

  return false;
}

function legacyCombatEffectToCardEffects(
  effect: CardCombatEffect | undefined,
): CardEffect[] {
  if (!effect) {
    return [];
  }

  const effects: CardEffect[] = [];

  if (effect.damage) {
    effects.push({
      type: "DealDamage",
      amount: effect.damage,
      bonuses: effect.antiGiantDamage
        ? [
            {
              type: "BonusAgainstTrait",
              amount: effect.antiGiantDamage,
              traits: ["Giant", "Nephilim"],
              message: "Anti-giant strike lands.",
            },
          ]
        : undefined,
      message: "Attack lands.",
    });
  }

  if (effect.guard) {
    effects.push({ type: "GainGuard", amount: effect.guard });
  }

  if (effect.heal) {
    effects.push({ type: "Heal", amount: effect.heal });
  }

  if (effect.removeFear) {
    effects.push({ type: "RemoveStatus", status: "Fear", target: "Player" });
  }

  if (effect.removeCorruption) {
    effects.push({ type: "RemoveCorruption", amount: effect.removeCorruption });
  }

  if (effect.gainResolve) {
    effects.push({
      type: "GainResource",
      resource: "Resolve",
      amount: effect.gainResolve,
    });
  }

  if (effect.gainFaith) {
    effects.push({
      type: "GainResource",
      resource: "Faith",
      amount: effect.gainFaith,
    });
  }

  if (effect.gainWisdom) {
    effects.push({
      type: "GainResource",
      resource: "Wisdom",
      amount: effect.gainWisdom,
    });
  }

  if (effect.gainAuthority) {
    effects.push({
      type: "GainResource",
      resource: "Authority",
      amount: effect.gainAuthority,
    });
  }

  if (effect.gainCorruption) {
    effects.push({ type: "GainCorruption", amount: effect.gainCorruption });
  }

  if (effect.nextAttackBonus) {
    effects.push({ type: "ModifyNextAttack", amount: effect.nextAttackBonus });
  }

  if (effect.nextPrayerCostReduction) {
    effects.push({
      type: "ModifyNextPrayerCost",
      amount: effect.nextPrayerCostReduction,
    });
  }

  if (effect.note) {
    effects.push({ type: "AddFeedback", message: effect.note });
  }

  if (effect.ifCorruptionZero) {
    effects.push({
      type: "TriggerIfCorruptionAtMost",
      amount: 0,
      effects: legacyCombatEffectToCardEffects(effect.ifCorruptionZero),
    });
  }

  if (effect.draw) {
    effects.push({ type: "DrawCards", amount: effect.draw });
  }

  return effects;
}

function resolveEffect(
  state: CombatState,
  card: Card,
  effect: CardEffect,
  context: CombatContext,
): CombatState {
  // To add a new card effect, extend CardEffect in src/types/game.ts,
  // handle it here, then reference that effect from card data instead of UI code.
  switch (effect.type) {
    case "DealDamage": {
      const traitBonus = getTraitDamageBonus(state, effect.bonuses);
      const totalDamage = effect.amount + traitBonus.amount + state.nextAttackBonus;

      return dealEnemyDamage(
        {
          ...state,
          nextAttackBonus: 0,
        },
        totalDamage,
        traitBonus.message ?? effect.message ?? "Attack lands.",
      );
    }

    case "GainGuard": {
      const cleanHandsBonus =
        state.resources.corruption === 0 && card.type.includes("Covenant") ? 1 : 0;

      return gainPlayerGuard(
        state,
        effect.amount + cleanHandsBonus,
        effect.source ?? (cleanHandsBonus > 0 ? "Clean Hands covenant bonus" : "Card"),
      );
    }

    case "Heal": {
      const cleanHandsBonus =
        state.resources.corruption === 0 && card.type.includes("Covenant") ? 1 : 0;

      return healPlayer(state, effect.amount + cleanHandsBonus);
    }

    case "DrawCards":
      return drawCards(state, effect.amount, context.random);

    case "GainResource":
      return gainNamedResource(state, effect.resource, effect.amount);

    case "LoseResource":
      return loseNamedResource(state, effect.resource, effect.amount);

    case "ApplyStatus":
      return applyStatus(state, effect.target, effect.status, effect.amount);

    case "RemoveStatus":
      return removeStatus(state, effect.target, effect.status, effect.amount);

    case "GainCorruption":
      return gainCorruption(state, effect.amount);

    case "RemoveCorruption":
      return removeCorruption(state, effect.amount);

    case "AddTemporaryCard":
      return addTemporaryCard(
        state,
        context,
        effect.cardId,
        effect.destination,
        effect.quantity ?? 1,
      );

    case "ModifyNextAttack":
      return modifyNextAttack(state, effect.amount);

    case "BonusAgainstTrait": {
      if (!enemyHasAnyTrait(state, effect.traits)) {
        return state;
      }

      return modifyNextAttack(
        appendFeedback(
          state,
          "system",
          effect.message ?? `Enemy trait exposed: next attack gains +${effect.amount}.`,
        ),
        effect.amount,
      );
    }

    case "TriggerIfEnemyTrait":
      return enemyHasAnyTrait(state, effect.traits)
        ? effect.effects.reduce(
            (nextState, nestedEffect) =>
              resolveEffect(nextState, card, nestedEffect, context),
            state,
          )
        : state;

    case "TriggerIfCorruptionAtMost":
      return state.resources.corruption <= effect.amount
        ? effect.effects.reduce(
            (nextState, nestedEffect) =>
              resolveEffect(nextState, card, nestedEffect, context),
            state,
          )
        : state;

    case "TriggerIfCorruptionAtLeast":
      return state.resources.corruption >= effect.amount
        ? effect.effects.reduce(
            (nextState, nestedEffect) =>
              resolveEffect(nextState, card, nestedEffect, context),
            state,
          )
        : state;

    case "TriggerIfStatusPresent":
      return hasStatus(state, effect.target, effect.status)
        ? effect.effects.reduce(
            (nextState, nestedEffect) =>
              resolveEffect(nextState, card, nestedEffect, context),
            state,
          )
        : state;

    case "RevealIntent":
      return applyStatus(
        appendFeedback(state, "enemy", "Enemy intent revealed."),
        "Enemy",
        "Discerned",
      );

    case "DestroyAltarOrStructure":
      return appendFeedback(
        {
          ...state,
          destroyedAltarOrStructure: true,
        },
        "system",
        `${effect.label ?? "Altar or structure"} destroyed.`,
      );

    case "ModifyNextPrayerCost":
      return appendFeedback(
        {
          ...state,
          nextPrayerCostReduction: Math.max(
            state.nextPrayerCostReduction,
            effect.amount,
          ),
        },
        "system",
        `Next Prayer costs ${effect.amount} less.`,
      );

    case "DoubleCovenantEffectsThisTurn":
      return appendFeedback(
        {
          ...state,
          covenantCardsTriggerTwice: true,
        },
        "system",
        "Covenant cards trigger twice this turn.",
      );

    case "AddFeedback":
      return appendFeedback(state, "system", effect.message);
  }
}

function getTraitDamageBonus(
  state: CombatState,
  bonuses: BonusAgainstTraitEffect[] | undefined,
) {
  if (!bonuses?.length) {
    return { amount: 0, message: undefined as string | undefined };
  }

  const matchingBonuses = bonuses.filter((bonus) =>
    enemyHasAnyTrait(state, bonus.traits),
  );

  return {
    amount: matchingBonuses.reduce((total, bonus) => total + bonus.amount, 0),
    message: matchingBonuses.find((bonus) => bonus.message)?.message,
  };
}

function enemyHasAnyTrait(state: CombatState, traits: EnemyTrait[]) {
  return traits.some((trait) => state.enemy.traits.includes(trait));
}

function hasStatus(
  state: CombatState,
  target: "Player" | "Enemy",
  status: CombatStatusName,
) {
  if (status === "Fear" && target === "Player") {
    return state.hasFear;
  }

  if (status === "Might") {
    return target === "Player" ? state.player.might > 0 : state.enemyState.might > 0;
  }

  const statusKey = target === "Player" ? "playerStatuses" : "enemyStatuses";

  return state[statusKey].includes(status);
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

  let nextState: CombatState = {
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
  };

  nextState = appendFeedback(
    nextState,
    "damage",
    `${message} -${totalDamage} enemy health${
      memorialBonus > 0 ? ` (${memorialBonus} from Memorials)` : ""
    }.`,
  );

  getBossPhaseMessages(state, nextBossPhase, phaseChanged).forEach((phaseMessage) => {
    nextState = appendFeedback(nextState, "enemy", phaseMessage);
  });

  if (status === "victory") {
    nextState = appendFeedback(nextState, "system", "Enemy defeated.");
  }

  return nextState;
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

function getBossPhaseMessages(
  state: CombatState,
  nextBossPhase: number,
  phaseChanged: boolean,
) {
  if (!phaseChanged || !state.enemy.traits.includes("Boss")) {
    return [];
  }

  if (nextBossPhase >= 3) {
    return ["Phase 3: Shadow of the Watchers gathers. The Giant gains 1 Might."];
  }

  if (nextBossPhase >= 2) {
    return ["Phase 2: Fear rises from the high place."];
  }

  return [];
}

export function gainPlayerGuard(
  state: CombatState,
  amount: number,
  source: string,
): CombatState {
  return appendFeedback(
    {
      ...state,
      player: {
        ...state.player,
        guard: state.player.guard + amount,
      },
    },
    "guard",
    `${source}: +${amount} Guard.`,
  );
}

function healPlayer(state: CombatState, amount: number): CombatState {
  const nextHealth = Math.min(state.player.maxHealth, state.player.health + amount);
  const healed = nextHealth - state.player.health;

  return appendFeedback(
    {
      ...state,
      player: {
        ...state.player,
        health: nextHealth,
      },
    },
    "guard",
    `Healed ${healed} health.`,
  );
}

function gainNamedResource(
  state: CombatState,
  resource: ResourceName,
  amount: number,
): CombatState {
  if (resource === "Corruption") {
    return gainCorruption(state, amount);
  }

  return appendFeedback(
    {
      ...state,
      resources: gainResource(state.resources, resource, amount),
    },
    "resource",
    `+${amount} ${resource}.`,
  );
}

function loseNamedResource(
  state: CombatState,
  resource: ResourceName,
  amount: number,
): CombatState {
  if (resource === "Corruption") {
    return removeCorruption(state, amount);
  }

  const removed = Math.min(getResourceValue(state.resources, resource), amount);

  return appendFeedback(
    {
      ...state,
      resources: spendResource(state.resources, resource, removed),
    },
    "resource",
    `-${removed} ${resource}.`,
  );
}

function gainCorruption(state: CombatState, amount: number): CombatState {
  const bossMightGain =
    state.enemy.traits.includes("Boss") && state.bossPhase >= 3 ? amount : 0;

  let nextState = appendFeedback(
    {
      ...state,
      resources: gainResource(state.resources, "Corruption", amount),
      enemyState: {
        ...state.enemyState,
        might: state.enemyState.might + bossMightGain,
      },
    },
    "resource",
    `+${amount} Corruption.`,
  );

  if (bossMightGain > 0) {
    nextState = appendFeedback(
      nextState,
      "enemy",
      `${state.enemy.name} gains ${bossMightGain} Might from Corruption.`,
    );
  }

  return nextState;
}

function removeCorruption(state: CombatState, amount: number): CombatState {
  const removed = Math.min(state.resources.corruption, amount);

  return appendFeedback(
    {
      ...state,
      resources: {
        ...state.resources,
        corruption: state.resources.corruption - removed,
      },
    },
    "resource",
    `Removed ${removed} Corruption.`,
  );
}

function applyStatus(
  state: CombatState,
  target: "Player" | "Enemy",
  status: CombatStatusName,
  amount = 1,
): CombatState {
  if (status === "Fear" && target === "Player") {
    return appendFeedback({ ...state, hasFear: true }, "enemy", "Fear applied.");
  }

  if (status === "Might") {
    const targetStateKey = target === "Player" ? "player" : "enemyState";

    return appendFeedback(
      {
        ...state,
        [targetStateKey]: {
          ...state[targetStateKey],
          might: state[targetStateKey].might + amount,
        },
      },
      target === "Player" ? "guard" : "enemy",
      `${target} gains ${amount} Might.`,
    );
  }

  const statusKey = target === "Player" ? "playerStatuses" : "enemyStatuses";
  const nextStatuses = state[statusKey].includes(status)
    ? state[statusKey]
    : [...state[statusKey], status];

  return appendFeedback(
    {
      ...state,
      [statusKey]: nextStatuses,
    },
    target === "Player" ? "guard" : "enemy",
    `${target} gains ${status}.`,
  );
}

function removeStatus(
  state: CombatState,
  target: "Player" | "Enemy",
  status: CombatStatusName,
  amount?: number,
): CombatState {
  if (status === "Fear" && target === "Player") {
    return appendFeedback({ ...state, hasFear: false }, "system", "Fear removed.");
  }

  if (status === "Might") {
    const targetStateKey = target === "Player" ? "player" : "enemyState";
    const removed = amount ?? state[targetStateKey].might;

    return appendFeedback(
      {
        ...state,
        [targetStateKey]: {
          ...state[targetStateKey],
          might: Math.max(0, state[targetStateKey].might - removed),
        },
      },
      "system",
      `${target} loses ${status}.`,
    );
  }

  const statusKey = target === "Player" ? "playerStatuses" : "enemyStatuses";

  return appendFeedback(
    {
      ...state,
      [statusKey]: state[statusKey].filter((currentStatus) => currentStatus !== status),
    },
    "system",
    `${status} removed.`,
  );
}

function addTemporaryCard(
  state: CombatState,
  context: CombatContext,
  cardId: string,
  destination: TemporaryCardDestination,
  quantity: number,
): CombatState {
  if (!context.cardsById.has(cardId) || quantity <= 0) {
    return state;
  }

  const instances: CombatCardInstance[] = Array.from({ length: quantity }, (_, index) => ({
    cardId,
    instanceId: `${cardId}-temp-${state.turn}-${state.feedback.length + index + 1}`,
  }));
  const destinationKey = {
    Hand: "hand",
    DrawPile: "drawPile",
    DiscardPile: "discardPile",
  }[destination] as "hand" | "drawPile" | "discardPile";

  return appendFeedback(
    {
      ...state,
      [destinationKey]: [...state[destinationKey], ...instances],
    },
    "draw",
    `Added ${quantity} temporary card${quantity > 1 ? "s" : ""} to ${destination}.`,
  );
}

function modifyNextAttack(state: CombatState, amount: number): CombatState {
  return appendFeedback(
    {
      ...state,
      nextAttackBonus: state.nextAttackBonus + amount,
    },
    "system",
    `Next attack gains +${amount} damage.`,
  );
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
