import type { CombatStatusName, ResourceState } from "@/types/game";
import { getEnemyPatternStep } from "./enemyPatterns";
import type {
  CombatFeedbackKind,
  CombatIntentType,
  CombatPhase,
  CombatState,
  CombatStructureState,
  EndTurnRiskAssessment,
  EnemyIntentDetails,
  QueuedCombatAction,
} from "./types";
import { hasCourageMechanic, maxCourage } from "./courage";
import { getActiveStructures, hasActiveAltarPressure } from "./structures";

export function getEnemyIntentDetails(state: CombatState): EnemyIntentDetails {
  const step = getEnemyPatternStep(state);
  const expectedDamage = getStepDamage(state, step.damage);
  const summaryParts = [step.summary];

  if (step.damage) {
    summaryParts[0] = `${expectedDamage} damage`;
  }

  if (step.statusesApplied?.length) {
    summaryParts.push(`applies ${step.statusesApplied.join(", ")}`);
  }

  if (step.guard) {
    summaryParts.push(`gains ${step.guard} Guard`);
  }

  if (step.mightChange && step.mightChange > 0) {
    summaryParts.push(`gains ${step.mightChange} Might`);
  }

  if (step.corruptionIfAltarActive && hasActiveAltarPressure(state)) {
    summaryParts.push(
      `+${step.corruptionIfAltarActive} Corruption if structure remains`,
    );
  }

  return {
    actionName: step.actionName,
    expectedDamage,
    guardGain: step.guard,
    iconTone: getIntentTone(step.intentType),
    intentType: step.intentType,
    resourceChanges:
      step.corruptionIfAltarActive && hasActiveAltarPressure(state)
        ? { corruption: step.corruptionIfAltarActive }
        : undefined,
    statusesApplied: step.statusesApplied,
    summary: summaryParts.join(" - "),
  };
}

export function getEndTurnRiskAssessment(
  state: CombatState,
): EndTurnRiskAssessment {
  const intent = getEnemyIntentDetails(state);
  const step = getEnemyPatternStep(state);
  const damagePreview = getIncomingDamagePreview(state, intent.expectedDamage);
  const projectedHealth = Math.max(0, state.player.health - damagePreview.hpDamage);
  const reasons: string[] = [];
  const altarWillTrigger =
    hasActiveAltarPressure(state) &&
    (Boolean(step.corruptionIfAltarActive || step.requiresActiveAltar) ||
      getActiveStructures(state).some(structureWillTrigger));
  const bossSpecial =
    state.enemy.traits.includes("Boss") &&
    (intent.intentType === "Special" || intent.intentType === "Ritual");
  const majorStatusApplied = intent.statusesApplied?.length
    ? intent.statusesApplied.filter((status) =>
        ["Fear", "Weaken", "Might", "Burning"].includes(status),
      )
    : [];

  if (damagePreview.hpDamage >= 10) {
    reasons.push(
      `Enemy intends ${intent.expectedDamage} damage. You have ${state.player.guard} Guard. Expected damage: ${damagePreview.hpDamage}.`,
    );
  }

  if (damagePreview.hpDamage >= state.player.health && damagePreview.hpDamage > 0) {
    reasons.push("This attack may defeat you.");
  } else if (
    damagePreview.hpDamage > 0 &&
    projectedHealth <= Math.ceil(state.player.maxHealth * 0.25)
  ) {
    reasons.push("This attack may leave you below 25% health.");
  }

  if (altarWillTrigger) {
    reasons.push("An enemy structure is about to trigger.");
  }

  if (majorStatusApplied.length > 0) {
    reasons.push(`Enemy will apply ${majorStatusApplied.join(", ")}.`);
  }

  if ((intent.resourceChanges?.corruption ?? 0) > 0) {
    reasons.push(`You may gain ${intent.resourceChanges?.corruption} Corruption.`);
  }

  if (bossSpecial) {
    reasons.push("Boss special action incoming.");
  }

  return {
    actionName: intent.actionName,
    blockedByGuard: damagePreview.guardBlocked,
    expectedDamage: intent.expectedDamage,
    expectedHpDamage: damagePreview.hpDamage,
    projectedHealth,
    reasons,
    severity:
      damagePreview.hpDamage >= state.player.health || bossSpecial ? "danger" : "warning",
    shouldWarn: reasons.length > 0,
  };
}

export function createEnemyActionQueue(state: CombatState): QueuedCombatAction[] {
  const intent = getEnemyIntentDetails(state);
  const step = getEnemyPatternStep(state);
  const altarIsActive = hasActiveAltarPressure(state);
  const damage = getStepDamage(state, step.damage);
  const { guardBlocked, hpDamage, protectedBlocked } = getIncomingDamagePreview(
    state,
    damage,
  );
  const queue: QueuedCombatAction[] = [
    createQueuedAction(state, "windup", {
      actionName: intent.actionName,
      damage,
      intentType: intent.intentType,
      logKind: "enemy",
      logMessage: `${state.enemy.name} begins ${intent.actionName}: ${intent.summary}.`,
      presentation: "windup",
      target: "Player",
    }),
  ];

  if (step.requiresActiveAltar && !altarIsActive) {
    queue.push(
      createQueuedAction(state, "altar-broken", {
        actionName: "Structure Broken",
        intentType: "Special",
        logKind: "system",
        logMessage: "The broken structure cannot empower the enemy.",
        presentation: "status",
        target: "Self",
      }),
    );
  }

  if (step.mightChange && (!step.requiresActiveAltar || altarIsActive)) {
    queue.push(
      createQueuedAction(state, "buff", {
        actionName: step.mightChange > 0 ? step.actionName : "Recovery Falters",
        intentType: step.intentType,
        logKind: "enemy",
        logMessage:
          step.mightChange > 0
            ? `${state.enemy.name} gains ${step.mightChange} Might.`
            : `${state.enemy.name} loses ${Math.abs(step.mightChange)} Might.`,
        mightChange: step.mightChange,
        presentation: "buff",
        target: "Self",
      }),
    );
  }

  if (step.guard && (!step.requiresActiveAltar || altarIsActive)) {
    queue.push(
      createQueuedAction(state, "enemy-guard", {
        actionName: step.actionName,
        guardValue: step.guard,
        intentType: step.intentType,
        logKind: "guard",
        logMessage: `${state.enemy.name} gains ${step.guard} Guard.`,
        presentation: "buff",
        target: "Self",
      }),
    );
  }

  if (step.statusesApplied?.length) {
    queue.push(
      createQueuedAction(state, "status", {
        actionName: step.actionName,
        intentType: step.intentType,
        logKind: "enemy",
        logMessage: formatStatusesApplied(step.statusesApplied),
        presentation: "status",
        statusesApplied: step.statusesApplied,
        target: "Player",
      }),
    );
  }

  if (guardBlocked > 0) {
    queue.push(
      createQueuedAction(state, "block", {
        actionName: "Guard Absorbs",
        blockedValue: guardBlocked,
        guardLoss: guardBlocked,
        intentType: intent.intentType,
        logKind: "guard",
        logMessage: `${guardBlocked} damage blocked by Guard.`,
        presentation: "block",
        target: "Player",
      }),
    );
  }

  if (protectedBlocked > 0) {
    queue.push(
      createQueuedAction(state, "protected", {
        actionName: "Protected",
        blockedValue: protectedBlocked,
        intentType: intent.intentType,
        logKind: "guard",
        logMessage: `Protected absorbs ${protectedBlocked} damage.`,
        presentation: "block",
        statusesRemoved: ["Protected"],
        target: "Player",
      }),
    );
  }

  if (hpDamage > 0) {
    queue.push(
      createQueuedAction(state, "damage", {
        actionName: "Impact",
        hpDamage,
        intentType: intent.intentType,
        logKind: "damage",
        logMessage: `${hpDamage} damage taken.`,
        presentation: "damage",
        target: "Player",
      }),
    );
  } else if (damage > 0) {
    const courageMessage = hasCourageMechanic(state.hero)
      ? state.courage >= maxCourage
        ? " Courage is already full."
        : " David gains 1 Courage."
      : "";

    queue.push(
      createQueuedAction(state, "guard-holds", {
        actionName: "Guard Holds",
        courageChange: hasCourageMechanic(state.hero) ? 1 : undefined,
        intentType: intent.intentType,
        logKind: "guard",
        logMessage: `Guard holds. No health lost.${courageMessage}`,
        presentation: "block",
        target: "Player",
      }),
    );
  }

  if (step.corruptionIfAltarActive && altarIsActive) {
    queue.push(
      createQueuedAction(state, "corruption", {
        actionName: "Structure Corruption",
        intentType: "Special",
        logKind: "resource",
        logMessage: `+${step.corruptionIfAltarActive} Corruption from the active structure.`,
        presentation: "resource",
        resourceChanges: { corruption: step.corruptionIfAltarActive },
        target: "Player",
      }),
    );
  }

  if (
    state.enemy.traits.includes("Boss") &&
    state.bossPhase >= 3 &&
    (state.enemy.traits.includes("Watcher") || state.enemy.traits.includes("Nephilim"))
  ) {
    queue.push(
      createQueuedAction(state, "shadow", {
        actionName: "Shadow of the Watchers",
        hpDamage: 3,
        intentType: "Special",
        logKind: "enemy",
        logMessage: "Shadow of the Watchers: 3 damage taken.",
        presentation: "damage",
        target: "Player",
      }),
    );
  }

  return [...queue, ...createStructureActionQueue(state)];
}

export function resolveQueuedCombatAction(
  state: CombatState,
  action: QueuedCombatAction,
): CombatState {
  let nextState = state;

  if (action.mightChange) {
    nextState = {
      ...nextState,
      enemyState: {
        ...nextState.enemyState,
        might: Math.max(0, nextState.enemyState.might + action.mightChange),
      },
    };
  }

  if (action.guardValue) {
    nextState = {
      ...nextState,
      enemyState: {
        ...nextState.enemyState,
        guard: nextState.enemyState.guard + action.guardValue,
      },
    };
  }

  if (action.guardLoss) {
    nextState = {
      ...nextState,
      player: {
        ...nextState.player,
        guard: Math.max(0, nextState.player.guard - action.guardLoss),
      },
    };
  }

  if (action.hpDamage) {
    const nextHealth = Math.max(0, nextState.player.health - action.hpDamage);

    nextState = {
      ...nextState,
      player: {
        ...nextState.player,
        health: nextHealth,
      },
      runHealth: nextHealth,
      metrics: {
        ...nextState.metrics,
        damageReceived: nextState.metrics.damageReceived + action.hpDamage,
      },
      status: nextHealth === 0 ? "defeat" : nextState.status,
    };
  }

  if (action.resourceChanges) {
    const corruptionGained = Math.max(0, action.resourceChanges.corruption ?? 0);

    nextState = {
      ...nextState,
      resources: applyResourceChanges(nextState.resources, action.resourceChanges),
      metrics: {
        ...nextState.metrics,
        corruptionGained: nextState.metrics.corruptionGained + corruptionGained,
      },
    };
  }

  if (action.courageChange) {
    nextState = gainQueuedCourage(nextState, action.courageChange);
  }

  if (action.structureId && action.structureChargeReset) {
    nextState = {
      ...nextState,
      structures: nextState.structures.map((structure) =>
        structure.instanceId === action.structureId
          ? { ...structure, charge: 0 }
          : structure,
      ),
    };
  } else if (action.structureId && action.structureChargeChange) {
    nextState = {
      ...nextState,
      structures: nextState.structures.map((structure) =>
        structure.instanceId === action.structureId
          ? {
              ...structure,
              charge: Math.max(0, structure.charge + action.structureChargeChange!),
            }
          : structure,
      ),
    };
  }

  if (action.statusesApplied?.length) {
    nextState = applyStatuses(nextState, action.target, action.statusesApplied);
  }

  if (action.statusesRemoved?.length) {
    nextState = removeStatuses(nextState, action.target, action.statusesRemoved);
  }

  const loggedState = appendFeedback(
    {
      ...nextState,
      lastResolvedAction: action,
    },
    action.logKind,
    action.logMessage,
  );

  if (loggedState.status === "defeat" && state.status !== "defeat") {
    return appendFeedback(loggedState, "system", "The hero has fallen.");
  }

  return loggedState;
}

function gainQueuedCourage(state: CombatState, amount: number): CombatState {
  return {
    ...state,
    courage: Math.min(maxCourage, state.courage + amount),
  };
}

export function shouldAutoAdvanceCombatPresentation(state: CombatState) {
  return (
    state.status === "active" &&
    state.phase !== "PlayerMain" &&
    state.phase !== "Victory" &&
    state.phase !== "Defeat"
  );
}

export function getCombatPresentationDelay(
  phase: CombatPhase,
  activeAction: QueuedCombatAction | undefined,
  reducedMotion: boolean,
) {
  if (reducedMotion) {
    return phase === "PlayerMain" ? 0 : 80;
  }

  if (activeAction) {
    const readabilityBonus = getActionReadabilityBonus(activeAction);

    switch (activeAction.presentation) {
      case "windup":
        return 1180 + readabilityBonus;
      case "damage":
        return 1120 + readabilityBonus;
      case "block":
        return 980 + readabilityBonus;
      case "buff":
      case "status":
        return 1040 + readabilityBonus;
      case "cleanup":
      case "intent":
      case "resource":
      case "banner":
        return 980 + readabilityBonus;
    }
  }

  switch (phase) {
    case "BattleIntro":
      return 900;
    case "PlayerTurnStart":
      return 960;
    case "PlayerTurnEnd":
      return 760;
    case "EnemyTurnStart":
      return 1040;
    case "EnemyActing":
      return 260;
    case "RoundCleanup":
      return 900;
    default:
      return 0;
  }
}

function getActionReadabilityBonus(action: QueuedCombatAction) {
  const isMajorAction =
    action.intentType === "Heavy Attack" ||
    action.intentType === "Ritual" ||
    action.intentType === "Special" ||
    (action.hpDamage ?? action.damage ?? 0) >= 12 ||
    (action.blockedValue ?? 0) >= 10 ||
    Math.abs(action.mightChange ?? 0) >= 2 ||
    Boolean(action.resourceChanges?.corruption);

  if (action.actionName.includes("Shadow of the Watchers")) {
    return 520;
  }

  return isMajorAction ? 340 : 0;
}

function createQueuedAction(
  state: CombatState,
  suffix: string,
  action: Omit<QueuedCombatAction, "actor" | "id">,
): QueuedCombatAction {
  return {
    actor: "Enemy",
    id: `enemy-${state.turn}-${state.feedback.length}-${suffix}`,
    ...action,
  };
}

function getIntentTone(intentType: CombatIntentType): EnemyIntentDetails["iconTone"] {
  if (intentType === "Special") {
    return "special";
  }

  if (intentType === "Buff") {
    return "buff";
  }

  if (intentType === "Debuff") {
    return "debuff";
  }

  if (intentType === "Ritual") {
    return "ritual";
  }

  return "attack";
}

function getStepDamage(state: CombatState, baseDamage = 0) {
  if (baseDamage <= 0) {
    return 0;
  }

  return baseDamage + state.enemyState.might;
}

function createStructureActionQueue(state: CombatState): QueuedCombatAction[] {
  return getActiveStructures(state).map((structure) => {
    const triggerAt = structure.triggerAtCharge ?? 3;

    if (structure.charge + 1 >= triggerAt) {
      return createQueuedAction(state, `${structure.instanceId}-trigger`, {
        actionName: `${structure.name} Triggers`,
        intentType: "Ritual",
        logKind: "resource",
        logMessage: `${structure.name} erupts: ${state.enemy.name} gains 1 Might and you gain 1 Corruption.`,
        mightChange: 1,
        presentation: "resource",
        resourceChanges: { corruption: 1 },
        structureChargeReset: true,
        structureId: structure.instanceId,
        target: "All",
      });
    }

    return createQueuedAction(state, `${structure.instanceId}-charge`, {
      actionName: `${structure.name} Charges`,
      intentType: "Ritual",
      logKind: "enemy",
      logMessage: `${structure.name} gains 1 charge (${structure.charge + 1}/${triggerAt}).`,
      presentation: "status",
      structureChargeChange: 1,
      structureId: structure.instanceId,
      target: "Self",
    });
  });
}

function structureWillTrigger(structure: CombatStructureState) {
  return structure.charge + 1 >= (structure.triggerAtCharge ?? 3);
}

function getIncomingDamagePreview(state: CombatState, damage: number) {
  const guardBlocked = Math.min(state.player.guard, damage);
  const afterGuardDamage = Math.max(0, damage - guardBlocked);
  const protectedBlocked =
    afterGuardDamage > 0 && state.playerStatuses.includes("Protected")
      ? Math.min(4, afterGuardDamage)
      : 0;
  const hpDamage = Math.max(0, afterGuardDamage - protectedBlocked);

  return {
    guardBlocked,
    hpDamage,
    protectedBlocked,
  };
}

function formatStatusesApplied(statuses: CombatStatusName[]) {
  if (statuses.length === 1) {
    return `${statuses[0]} applied.`;
  }

  return `${statuses.join(", ")} applied.`;
}

function applyResourceChanges(
  resources: ResourceState,
  changes: Partial<ResourceState>,
): ResourceState {
  return {
    resolve: Math.max(0, resources.resolve + (changes.resolve ?? 0)),
    faith: Math.max(0, resources.faith + (changes.faith ?? 0)),
    wisdom: Math.max(0, resources.wisdom + (changes.wisdom ?? 0)),
    authority: Math.max(0, resources.authority + (changes.authority ?? 0)),
    corruption: Math.max(0, resources.corruption + (changes.corruption ?? 0)),
  };
}

function applyStatuses(
  state: CombatState,
  target: QueuedCombatAction["target"],
  statuses: CombatStatusName[],
): CombatState {
  if (target !== "Player" && target !== "Enemy") {
    return state;
  }

  return statuses.reduce((currentState, status) => {
    if (target === "Player" && status === "Fear") {
      return { ...currentState, hasFear: true };
    }

    if (status === "Might") {
      const stateKey = target === "Player" ? "player" : "enemyState";

      return {
        ...currentState,
        [stateKey]: {
          ...currentState[stateKey],
          might: currentState[stateKey].might + 1,
        },
      };
    }

    const statusKey = target === "Player" ? "playerStatuses" : "enemyStatuses";

    return currentState[statusKey].includes(status)
      ? currentState
      : {
          ...currentState,
          [statusKey]: [...currentState[statusKey], status],
        };
  }, state);
}

function removeStatuses(
  state: CombatState,
  target: QueuedCombatAction["target"],
  statuses: CombatStatusName[],
): CombatState {
  if (target !== "Player" && target !== "Enemy") {
    return state;
  }

  return statuses.reduce((currentState, status) => {
    if (target === "Player" && status === "Fear") {
      return { ...currentState, hasFear: false };
    }

    if (status === "Might") {
      return currentState;
    }

    const statusKey = target === "Player" ? "playerStatuses" : "enemyStatuses";

    return {
      ...currentState,
      [statusKey]: currentState[statusKey].filter(
        (currentStatus) => currentStatus !== status,
      ),
    };
  }, state);
}

function appendFeedback(
  state: CombatState,
  kind: CombatFeedbackKind,
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
