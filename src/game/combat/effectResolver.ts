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
import { consumeCourageForAttack, gainCourage } from "./courage";
import { getEnemyCombatConfig } from "./enemyPatterns";
import { getGiantDamageBonus, getLowHealthAttackBonus } from "./memorials";
import { gainResource, getResourceValue, spendResource } from "./resources";
import type {
  CombatCardInstance,
  CombatContext,
  CombatFeedback,
  CombatState,
  CombatTargetId,
} from "./types";
import {
  getFirstActiveStructure,
  getTargetedStructure,
  syncDestroyedStructureFlag,
} from "./structures";

export function applyCardEffect(
  state: CombatState,
  card: Card,
  context: CombatContext,
  targetId: CombatTargetId = "enemy",
): CombatState {
  return resolveCardEffects(state, card, context, targetId);
}

export function resolveCardEffects(
  state: CombatState,
  card: Card,
  context: CombatContext,
  targetId: CombatTargetId = "enemy",
): CombatState {
  return getCardEffects(card).reduce(
    (currentState, effect) =>
      resolveEffect(currentState, card, effect, context, targetId),
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
  targetId: CombatTargetId,
): CombatState {
  // To add a new card effect, extend CardEffect in src/types/game.ts,
  // handle it here, then reference that effect from card data instead of UI code.
  switch (effect.type) {
    case "DealDamage": {
      const traitBonus = getTraitDamageBonus(state, effect.bonuses, targetId);
      const courageSpend = card.type.includes("Attack")
        ? consumeCourageForAttack(state)
        : { state, bonus: 0, consumed: 0 };
      const totalDamage =
        effect.amount + traitBonus.amount + state.nextAttackBonus + courageSpend.bonus;

      return dealEnemyDamage(
        {
          ...courageSpend.state,
          nextAttackBonus: 0,
        },
        totalDamage,
        traitBonus.message ?? effect.message ?? "Attack lands.",
        targetId,
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

    case "GainCourage":
      return gainCourage(state, effect.amount, effect.source ?? card.name);

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
      if (!targetHasAnyTrait(state, targetId, effect.traits)) {
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
      return targetHasAnyTrait(state, targetId, effect.traits)
        ? effect.effects.reduce(
            (nextState, nestedEffect) =>
              resolveEffect(nextState, card, nestedEffect, context, targetId),
            state,
          )
        : state;

    case "TriggerIfCorruptionAtMost":
      return state.resources.corruption <= effect.amount
        ? effect.effects.reduce(
            (nextState, nestedEffect) =>
              resolveEffect(nextState, card, nestedEffect, context, targetId),
            state,
          )
        : state;

    case "TriggerIfCorruptionAtLeast":
      return state.resources.corruption >= effect.amount
        ? effect.effects.reduce(
            (nextState, nestedEffect) =>
              resolveEffect(nextState, card, nestedEffect, context, targetId),
            state,
          )
        : state;

    case "TriggerIfStatusPresent":
      return hasStatus(state, effect.target, effect.status)
        ? effect.effects.reduce(
            (nextState, nestedEffect) =>
              resolveEffect(nextState, card, nestedEffect, context, targetId),
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
      return destroyTargetStructure(state, targetId, effect.label);

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
  targetId: CombatTargetId,
) {
  if (!bonuses?.length) {
    return { amount: 0, message: undefined as string | undefined };
  }

  const matchingBonuses = bonuses.filter((bonus) =>
    targetHasAnyTrait(state, targetId, bonus.traits),
  );

  return {
    amount: matchingBonuses.reduce((total, bonus) => total + bonus.amount, 0),
    message: matchingBonuses.find((bonus) => bonus.message)?.message,
  };
}

function enemyHasAnyTrait(state: CombatState, traits: EnemyTrait[]) {
  return traits.some((trait) => state.enemy.traits.includes(trait));
}

function targetHasAnyTrait(
  state: CombatState,
  targetId: CombatTargetId,
  traits: EnemyTrait[],
) {
  const structure = getTargetedStructure(state, targetId);

  if (structure) {
    return traits.some((trait) => structure.traits.includes(trait));
  }

  return enemyHasAnyTrait(state, traits);
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
  targetId: CombatTargetId = "enemy",
): CombatState {
  const structure = getTargetedStructure(state, targetId);

  if (structure) {
    return dealStructureDamage(state, structure.instanceId, damage, message);
  }

  const memorialBonus = getLowHealthAttackBonus(state) + getGiantDamageBonus(state);
  const exposedBonus = state.enemyStatuses.includes("Exposed")
    ? getExposedDamageBonus(state)
    : 0;
  const fearPenalty = state.hasFear ? Math.min(3, damage + memorialBonus) : 0;
  const totalDamage = Math.max(0, damage + memorialBonus + exposedBonus - fearPenalty);
  const guardBlocked = Math.min(state.enemyState.guard, totalDamage);
  const healthDamage = Math.max(0, totalDamage - guardBlocked);
  const nextHealth = Math.max(0, state.enemyState.health - healthDamage);
  const status = nextHealth === 0 ? "victory" : state.status;
  const nextBossPhase = getNextBossPhase(state, nextHealth);
  const phaseChanged = nextBossPhase > state.bossPhase;

  let nextState: CombatState = {
    ...state,
    enemyState: {
      ...state.enemyState,
      guard: Math.max(0, state.enemyState.guard - guardBlocked),
      health: nextHealth,
      might:
        phaseChanged && nextBossPhase >= 3
          ? state.enemyState.might + 1
          : state.enemyState.might,
    },
    enemyStatuses:
      exposedBonus > 0
        ? state.enemyStatuses.filter((currentStatus) => currentStatus !== "Exposed")
        : state.enemyStatuses,
    bossPhase: nextBossPhase,
    hasFear: phaseChanged && nextBossPhase >= 2 ? true : state.hasFear,
    metrics: {
      ...state.metrics,
      damageDealt: state.metrics.damageDealt + healthDamage,
      roundsTaken: status === "victory" ? state.turn : state.metrics.roundsTaken,
    },
    status,
  };

  nextState = appendFeedback(
    nextState,
    "damage",
    `${message} -${healthDamage} enemy health${
      guardBlocked > 0 ? ` (${guardBlocked} blocked by Guard)` : ""
    }${exposedBonus > 0 ? ` (${exposedBonus} from Exposed)` : ""}${
      state.enemyStatuses.includes("Exposed") ? " Exposed is spent." : ""
    }${fearPenalty > 0 ? ` (${fearPenalty} lost to Fear)` : ""}${
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

function getExposedDamageBonus(state: CombatState) {
  const courageBonus = state.courage > 0 ? 2 : 0;
  const faithBonus = state.resources.faith > 0 ? 2 : 0;

  return 4 + courageBonus + faithBonus;
}

function dealStructureDamage(
  state: CombatState,
  structureId: string,
  damage: number,
  message: string,
): CombatState {
  const structure = getTargetedStructure(state, `structure:${structureId}`);

  if (!structure) {
    return dealEnemyDamage(state, damage, message, "enemy");
  }

  const memorialBonus = getLowHealthAttackBonus(state);
  const totalDamage = Math.max(0, damage + memorialBonus + state.nextAttackBonus);
  const nextHealth = Math.max(0, structure.health - totalDamage);
  const wasDestroyed = nextHealth === 0;
  let nextState = syncDestroyedStructureFlag({
    ...state,
    nextAttackBonus: 0,
    structures: state.structures.map((currentStructure) =>
      currentStructure.instanceId === structureId
        ? {
            ...currentStructure,
            charge: wasDestroyed ? 0 : currentStructure.charge,
            health: nextHealth,
          }
        : currentStructure,
    ),
    metrics: {
      ...state.metrics,
      damageDealt: state.metrics.damageDealt + Math.min(structure.health, totalDamage),
    },
  });

  nextState = appendFeedback(
    nextState,
    "damage",
    `${message} -${Math.min(structure.health, totalDamage)} ${structure.name} health${
      memorialBonus > 0 ? ` (${memorialBonus} from Memorials)` : ""
    }.`,
  );

  if (wasDestroyed) {
    nextState = appendFeedback(
      syncDestroyedStructureFlag(nextState),
      "system",
      `The ${structure.name.toLowerCase()} is broken.`,
    );
  }

  return nextState;
}

function destroyTargetStructure(
  state: CombatState,
  targetId: CombatTargetId,
  label?: string,
) {
  const structure =
    getTargetedStructure(state, targetId) ?? getFirstActiveStructure(state);

  if (!structure) {
    return appendFeedback(
      {
        ...state,
        destroyedAltarOrStructure: true,
      },
      "system",
      `${label ?? "Enemy structure"} suppressed.`,
    );
  }

  return appendFeedback(
    syncDestroyedStructureFlag({
      ...state,
      structures: state.structures.map((currentStructure) =>
        currentStructure.instanceId === structure.instanceId
          ? { ...currentStructure, charge: 0, health: 0 }
          : currentStructure,
      ),
    }),
    "system",
    `The ${structure.name.toLowerCase()} is broken.`,
  );
}

function getNextBossPhase(state: CombatState, nextHealth: number) {
  if (!state.enemy.traits.includes("Boss")) {
    return state.bossPhase;
  }

  const healthRatio = nextHealth / state.enemyState.maxHealth;
  const thresholds = getEnemyCombatConfig(state.enemy.id)?.phaseThresholds;
  const phase2Threshold = thresholds?.phase2 ?? 0.6;
  const phase3Threshold = thresholds?.phase3 ?? 0.3;

  if (healthRatio <= phase3Threshold) {
    return 3;
  }

  if (healthRatio <= phase2Threshold) {
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
    if (
      state.enemy.traits.includes("Watcher") ||
      state.enemy.traits.includes("Nephilim")
    ) {
      return ["Phase 3: Shadow of the Watchers gathers. The enemy gains 1 Might."];
    }

    return [
      "Phase 3: The battle belongs to the Lord. Watch for the opening and answer with Courage.",
    ];
  }

  if (nextBossPhase >= 2) {
    return ["Phase 2: Spear like a weaver's beam. Heavy attacks become more dangerous."];
  }

  return [];
}

export function gainPlayerGuard(
  state: CombatState,
  amount: number,
  source: string,
): CombatState {
  const weakenPenalty = state.playerStatuses.includes("Weaken")
    ? Math.min(2, amount)
    : 0;
  const guardGained = Math.max(0, amount - weakenPenalty);
  const playerStatuses =
    weakenPenalty > 0
      ? state.playerStatuses.filter((status) => status !== "Weaken")
      : state.playerStatuses;

  return appendFeedback(
    {
      ...state,
      player: {
        ...state.player,
        guard: state.player.guard + guardGained,
      },
      playerStatuses,
      metrics: {
        ...state.metrics,
        guardGenerated: state.metrics.guardGenerated + guardGained,
      },
    },
    "guard",
    `${source}: +${guardGained} Guard${
      weakenPenalty > 0 ? ` (${weakenPenalty} reduced by Weaken)` : ""
    }.`,
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
      metrics: {
        ...state.metrics,
        corruptionGained: state.metrics.corruptionGained + amount,
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
