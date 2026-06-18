import { isCorruptionAtLeast } from "@/game/corruption";
import type { CombatStatusName, ResourceState } from "@/types/game";
import type {
  CombatFeedbackKind,
  CombatIntentType,
  CombatPhase,
  CombatState,
  EnemyIntentDetails,
  QueuedCombatAction,
} from "./types";

export function getEnemyIntentDetails(state: CombatState): EnemyIntentDetails {
  const intentText = state.enemy.intent.toLowerCase();
  const selfBuff = getEnemySelfBuff(state);
  const expectedDamage = getEnemyAttackDamage(state);
  const shadowDamage = getMarkedShadowDamage(state);
  const hasDebuffPressure = intentText.includes("weaken");
  const isHeavy =
    intentText.includes("heavy") ||
    intentText.includes("crush") ||
    state.enemy.traits.includes("Boss");
  const intentType: CombatIntentType = selfBuff
    ? "Buff"
    : hasDebuffPressure
      ? "Debuff"
      : isHeavy
        ? "Heavy Attack"
        : "Attack";
  const actionName = getEnemyActionName(state, intentType);
  const summaryParts = [`${expectedDamage} damage`];

  if (selfBuff > 0) {
    summaryParts.unshift(`+${selfBuff} Might first`);
  }

  if (hasDebuffPressure) {
    summaryParts.push("fear pressure");
  }

  if (shadowDamage > 0) {
    summaryParts.push(`+${shadowDamage} Shadow damage`);
  }

  return {
    actionName,
    expectedDamage,
    iconTone: getIntentTone(intentType, shadowDamage),
    intentType,
    summary: summaryParts.join(" - "),
  };
}

export function createEnemyActionQueue(state: CombatState): QueuedCombatAction[] {
  const intent = getEnemyIntentDetails(state);
  const selfBuff = getEnemySelfBuff(state);
  const attackDamage = getEnemyAttackDamage(state);
  const blockedValue = Math.min(state.player.guard, attackDamage);
  const hpDamage = Math.max(0, attackDamage - state.player.guard);
  const shadowDamage = getMarkedShadowDamage(state);
  const queue: QueuedCombatAction[] = [
    createQueuedAction(state, "windup", {
      actionName: intent.actionName,
      damage: attackDamage,
      intentType: intent.intentType,
      logKind: "enemy",
      logMessage: `${state.enemy.name} begins ${intent.actionName}.`,
      presentation: "windup",
      target: "Player",
    }),
  ];

  if (selfBuff > 0) {
    queue.push(
      createQueuedAction(state, "buff", {
        actionName: "Forbidden Tempering",
        intentType: "Buff",
        logKind: "enemy",
        logMessage: `${state.enemy.name} gains ${selfBuff} Might.`,
        mightChange: selfBuff,
        presentation: "buff",
        target: "Self",
      }),
    );
  }

  if (blockedValue > 0) {
    queue.push(
      createQueuedAction(state, "block", {
        actionName: "Guard Absorbs",
        blockedValue,
        intentType: intent.intentType,
        logKind: "guard",
        logMessage: `${blockedValue} damage blocked by Guard.`,
        presentation: "block",
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
        logMessage: `Player loses ${hpDamage} health.`,
        presentation: "damage",
        target: "Player",
      }),
    );
  } else {
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

  if (shadowDamage > 0) {
    queue.push(
      createQueuedAction(state, "shadow", {
        actionName: "Shadow of the Watchers",
        hpDamage: shadowDamage,
        intentType: "Special",
        logKind: "enemy",
        logMessage: `Shadow of the Watchers deals ${shadowDamage} damage.`,
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

  if (action.blockedValue) {
    nextState = {
      ...nextState,
      player: {
        ...nextState.player,
        guard: Math.max(0, nextState.player.guard - action.blockedValue),
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
      status: nextHealth === 0 ? "defeat" : nextState.status,
    };
  }

  if (action.resourceChanges) {
    nextState = {
      ...nextState,
      resources: applyResourceChanges(nextState.resources, action.resourceChanges),
    };
  }

  if (action.statusesApplied?.length) {
    nextState = applyStatuses(nextState, action.target, action.statusesApplied);
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
        return 1250;
      case "damage":
        return 1250;
      case "block":
      case "buff":
      case "status":
        return 1100;
      case "cleanup":
      case "intent":
      case "resource":
      case "banner":
        return 900;
    }
  }

  switch (phase) {
    case "BattleIntro":
      return 900;
    case "PlayerTurnStart":
      return 760;
    case "PlayerTurnEnd":
      return 520;
    case "EnemyTurnStart":
      return 1050;
    case "EnemyActing":
      return 260;
    case "RoundCleanup":
      return 900;
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

function getEnemyActionName(state: CombatState, intentType: CombatIntentType) {
  const intentText = state.enemy.intent.toLowerCase();

  if (state.enemy.traits.includes("Boss")) {
    return state.bossPhase >= 3 ? "Shadowed Crush" : "Crushing Blow";
  }

  if (intentText.includes("buff")) {
    return "Forbidden Tempering";
  }

  if (intentText.includes("weaken")) {
    return "Intimidating Cut";
  }

  if (intentType === "Heavy Attack") {
    return "Crushing Blow";
  }

  return "Strike";
}

function getIntentTone(
  intentType: CombatIntentType,
  shadowDamage: number,
): EnemyIntentDetails["iconTone"] {
  if (shadowDamage > 0 || intentType === "Special") {
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

function getEnemySelfBuff(state: CombatState) {
  return state.enemy.intent.toLowerCase().includes("buff") ? 2 : 0;
}

function getEnemyAttackDamage(state: CombatState) {
  return state.enemy.attackDamage + state.enemyState.might + getEnemySelfBuff(state);
}

function getMarkedShadowDamage(state: CombatState) {
  return state.enemy.traits.includes("Boss") &&
    (state.bossPhase >= 3 || isCorruptionAtLeast(state.resources.corruption, "Marked"))
    ? 3
    : 0;
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
