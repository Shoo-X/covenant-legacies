import type { GameScreen } from "@/types/game";
import type { CombatPhase, CombatStatus } from "@/game/combat/types";

export type NavigationRunPhase =
  | "none"
  | "map"
  | "combat"
  | "reward"
  | "memorial-reward"
  | "mystery"
  | "rest"
  | "summary";

export interface NavigationPolicyContext {
  destination: GameScreen;
  hasCombatCheckpoint: boolean;
  runPhase: NavigationRunPhase;
  viewingHistoricalSummary?: boolean;
}

export interface NavigationDecision {
  allowed: boolean;
  confirmation?: {
    body: string;
    confirmLabel: string;
    title: string;
  };
  reason?: string;
  resumeTarget?: GameScreen;
}

export interface CombatReturnToMapState {
  enabled: boolean;
  reason?: string;
}

const supportScreens = new Set<GameScreen>(["collection", "gallery", "codex"]);

export function getCombatReturnToMapState({
  phase,
  status,
}: {
  phase: CombatPhase;
  status: CombatStatus;
}): CombatReturnToMapState {
  if (status !== "active") {
    return {
      enabled: false,
      reason: "The battle result must be resolved from the outcome prompt.",
    };
  }

  if (phase !== "PlayerMain") {
    return {
      enabled: false,
      reason: "Return to Map is available during David's command step.",
    };
  }

  return { enabled: true };
}

export function getNavigationDecision({
  destination,
  hasCombatCheckpoint,
  runPhase,
  viewingHistoricalSummary = false,
}: NavigationPolicyContext): NavigationDecision {
  if (destination === "run-summary") {
    return {
      allowed: viewingHistoricalSummary || runPhase === "summary",
      reason: viewingHistoricalSummary
        ? undefined
        : "Run summaries open from completed, ended, or abandoned runs.",
    };
  }

  if (runPhase === "none") {
    if (destination === "map" || destination === "combat") {
      return {
        allowed: false,
        reason: "Start or continue a run before opening this screen.",
      };
    }

    return { allowed: true };
  }

  if (runPhase === "summary") {
    if (destination === "map" || destination === "combat") {
      return {
        allowed: false,
        reason: "This run is finalized. Start a new run before returning to the valley.",
      };
    }

    return { allowed: true };
  }

  if (destination === "hero-select") {
    return {
      allowed: false,
      confirmation: {
        title: "Start a new run?",
        body:
          "Starting again will close the current run and preserve its summary. The active run cannot be resumed afterward.",
        confirmLabel: "Abandon and View Summary",
      },
      reason: "A run is already active.",
    };
  }

  if (runPhase === "map") {
    if (destination === "combat" && !hasCombatCheckpoint) {
      return {
        allowed: false,
        reason: "Choose the next encounter from the campaign map before entering combat.",
      };
    }

    return { allowed: true };
  }

  if (runPhase === "combat") {
    if (destination === "combat") {
      return {
        allowed: true,
        resumeTarget: "combat",
      };
    }

    if (destination === "home") {
      return {
        allowed: false,
        confirmation: {
          title: "Leave battle view?",
          body:
            "Current turn progress is not saved. This encounter will restart from its beginning when resumed.",
          confirmLabel: "Leave Battle View",
        },
        resumeTarget: "combat",
      };
    }

    return {
      allowed: false,
      reason:
        supportScreens.has(destination)
          ? "Finish or resume the current battle before opening support screens."
          : "The current battle must be resolved or deliberately ended before using this route.",
      resumeTarget: "combat",
    };
  }

  if (runPhase === "reward" || runPhase === "memorial-reward") {
    return getPendingDecisionNavigationDecision(destination, runPhase);
  }

  if (runPhase === "mystery" || runPhase === "rest") {
    return getPendingDecisionNavigationDecision(destination, runPhase);
  }

  return { allowed: true };
}

function getPendingDecisionNavigationDecision(
  destination: GameScreen,
  runPhase: Exclude<NavigationRunPhase, "none" | "map" | "combat" | "summary">,
): NavigationDecision {
  if (destination === runPhase) {
    return {
      allowed: true,
      resumeTarget: runPhase,
    };
  }

  if (destination === "home") {
    return {
      allowed: false,
      confirmation: {
        title: "Leave decision view?",
        body:
          "This run has an unresolved decision. It will remain saved, and Continue will return here.",
        confirmLabel: "Leave Decision View",
      },
      resumeTarget: runPhase,
    };
  }

  return {
    allowed: false,
    reason:
      "Resolve the current run decision before opening another gameplay or support screen.",
    resumeTarget: runPhase,
  };
}
