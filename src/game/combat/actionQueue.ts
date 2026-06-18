import type { CombatStatusName, ResourceState } from "@/types/game";
import { getEnemyPatternStep } from "./enemyPatterns";
import type {
  CombatFeedbackKind,
  CombatIntentType,
  CombatPhase,
  CombatState,
  EnemyIntentDetails,
  QueuedCombatAction,
} from "./types";

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

  if (step.corruptionIfAltarActive && !state.destroyedAltarOrStructure) {
    summaryParts.push(`+${step.corruptionIfAltarActive} Corruption if altar remains`);
  }

  return {
    actionName: step.actionName,
    expectedDamage,
    guardGain: step.guard,
    iconTone: getIntentTone(step.intentType),
    intentType: step.intentType,
    resourceChanges:
      step.corruptionIfAltarActive && !state.destroyedAltarOrStructure
        ? { corruption: step.corruptionIfAltarActive }
        : undefined,
    statusesApplied: step.statusesApplied,
    summary: summaryParts.join(" - "),
  };
}

export function createEnemyActionQueue(state: CombatState): QueuedCombatAction[] {
  const intent = getEnemyIntentDetails(state);
  const step = getEnemyPatternStep(state);
  const altarIsActive = !state.destroyedAltarOrStructure;
  const damage = getStepDamage(state, step.damage);
  const guardBlocked = Math.min(state.player.guard, damage);
  const afterGuardDamage = Math.max(0, damage - guardBlocked);
  const protectedBlocked =
    afterGuardDamage > 0 && state.playerStatuses.includes("Protected")
      ? Math.min(4, afterGuardDamage)
      : 0;
  const hpDamage = Math.max(0, afterGuardDamage - protectedBlocked);
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
        actionName: "Altar Broken",
        intentType: "Special",
        logKind: "system",
        logMessage: "The broken altar cannot empower the enemy.",
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
    queue.push(
      createQueuedAction(state, "guard-holds", {
        actionName: "Guard Holds",
        intentType: intent.intentType,
        logKind: "guard",
        logMessage: "Guard holds. No health lost.",
        presentation: "block",
        target: "Player",
      }),
    );
  }

  if (step.corruptionIfAltarActive && altarIsActive) {
    queue.push(
      createQueuedAction(state, "corruption", {
        actionName: "Altar Corruption",
        intentType: "Special",
        logKind: "resource",
        logMessage: `+${step.corruptionIfAltarActive} Corruption from the active altar.`,
        presentation: "resource",
        resourceChanges: { corruption: step.corruptionIfAltarActive },
        target: "Player",
      }),
    );
  }

  if (state.enemy.traits.includes("Boss") && state.bossPhase >= 3) {
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

  return queue;
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
    switch (activeAction.presentation) {
      case "windup":
        return 620;
      case "damage":
        return 620;
      case "block":
      case "buff":
      case "status":
        return 560;
      case "cleanup":
      case "intent":
      case "resource":
      case "banner":
        return 540;
    }
  }

  switch (phase) {
    case "BattleIntro":
      return 680;
    case "PlayerTurnStart":
      return 560;
    case "PlayerTurnEnd":
      return 420;
    case "EnemyTurnStart":
      return 620;
    case "EnemyActing":
      return 180;
    case "RoundCleanup":
      return 560;
    default:
      return 0;
  }
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
