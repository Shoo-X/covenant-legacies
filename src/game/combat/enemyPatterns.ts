import type { CombatStatusName } from "@/types/game";
import type { CombatIntentType, CombatState } from "./types";

export interface EnemyPatternStep {
  actionName: string;
  intentType: CombatIntentType;
  damage?: number;
  guard?: number;
  mightChange?: number;
  statusesApplied?: CombatStatusName[];
  corruptionIfAltarActive?: number;
  requiresActiveAltar?: boolean;
  summary: string;
}

export interface EnemyCombatConfig {
  maxHealth: number;
  dangerLevel: "Low" | "Moderate" | "High" | "Boss";
  tacticalIdentity: string;
  definingMechanic: string;
  phaseThresholds?: {
    phase2: number;
    phase3: number;
  };
  patterns: {
    default: EnemyPatternStep[];
    phase2?: EnemyPatternStep[];
    phase3?: EnemyPatternStep[];
  };
}

export const enemyCombatConfigs: Record<string, EnemyCombatConfig> = {
  "enemy-corrupted-raider": {
    maxHealth: 42,
    dangerLevel: "Moderate",
    tacticalIdentity: "Mounting physical pressure",
    definingMechanic: "Relentless attacks culminate in a heavy strike.",
    patterns: {
      default: [
        {
          actionName: "Raid",
          damage: 8,
          intentType: "Attack",
          summary: "8 damage",
        },
        {
          actionName: "Press the Attack",
          damage: 10,
          intentType: "Attack",
          summary: "10 damage",
        },
        {
          actionName: "Brutal Swing",
          damage: 15,
          intentType: "Heavy Attack",
          summary: "15 damage",
        },
      ],
    },
  },
  "enemy-idol-priest": {
    maxHealth: 46,
    dangerLevel: "High",
    tacticalIdentity: "Idol-standard structure pressure",
    definingMechanic:
      "Break the Idol Standard before its battlefield pressure completes.",
    patterns: {
      default: [
        {
          actionName: "Standard Chant",
          damage: 6,
          intentType: "Debuff",
          statusesApplied: ["Weaken"],
          summary: "6 damage and Weaken",
        },
        {
          actionName: "Raise Idol Standard",
          intentType: "Ritual",
          mightChange: 2,
          requiresActiveAltar: true,
          summary: "active standard: +2 Might",
        },
        {
          actionName: "Standard-Bound Strike",
          corruptionIfAltarActive: 1,
          damage: 14,
          intentType: "Special",
          summary: "14 damage; +1 Corruption if standard remains",
        },
      ],
    },
  },
  "enemy-giant-blooded-brute": {
    maxHealth: 62,
    dangerLevel: "High",
    tacticalIdentity: "Shield protection and interception",
    definingMechanic:
      "The shield-bearer builds Guard, then turns defense into pressure.",
    patterns: {
      default: [
        {
          actionName: "Raise the Great Shield",
          guard: 14,
          intentType: "Buff",
          summary: "Gain 14 Guard",
        },
        {
          actionName: "Shield Bash",
          damage: 11,
          intentType: "Attack",
          statusesApplied: ["Weaken"],
          summary: "11 damage and Weaken",
        },
        {
          actionName: "Interpose",
          damage: 8,
          guard: 8,
          intentType: "Buff",
          summary: "Gain 8 Guard and deal 8",
        },
      ],
    },
  },
  "enemy-gathite-armor-bearer": {
    maxHealth: 58,
    dangerLevel: "Moderate",
    tacticalIdentity: "Armor and Guard pressure",
    definingMechanic:
      "High Guard punishes scattered attacks and rewards focused timing.",
    patterns: {
      default: [
        {
          actionName: "Brace in Bronze",
          guard: 12,
          intentType: "Buff",
          summary: "Gain 12 Guard",
        },
        {
          actionName: "Weighted Advance",
          damage: 10,
          guard: 6,
          intentType: "Attack",
          summary: "10 damage and gain 6 Guard",
        },
        {
          actionName: "Punish Weak Blows",
          damage: 14,
          intentType: "Heavy Attack",
          summary: "14 damage",
        },
      ],
    },
  },
  "enemy-watcher-taught-smith": {
    maxHealth: 78,
    dangerLevel: "High",
    tacticalIdentity: "Scaling Might",
    definingMechanic: "Unchecked forge work turns each strike heavier.",
    patterns: {
      default: [
        {
          actionName: "Stoke the Forge",
          intentType: "Buff",
          mightChange: 2,
          summary: "+2 Might",
        },
        {
          actionName: "Hammer Blow",
          damage: 12,
          intentType: "Attack",
          summary: "12 damage",
        },
        {
          actionName: "Tempered Guard",
          damage: 8,
          guard: 10,
          intentType: "Buff",
          summary: "Gain 10 Guard and deal 8",
        },
        {
          actionName: "Overhead Strike",
          damage: 20,
          intentType: "Heavy Attack",
          summary: "20 damage",
        },
      ],
    },
  },
  "enemy-giant-of-the-high-place": {
    maxHealth: 128,
    dangerLevel: "Boss",
    tacticalIdentity: "Fear, heavy attacks, and the giant challenge",
    definingMechanic:
      "Goliath's taunts and heavy strikes test Guard, Courage, and timing.",
    phaseThresholds: {
      phase2: 0.6,
      phase3: 0.3,
    },
    patterns: {
      default: [
        {
          actionName: "Champion's Challenge",
          damage: 12,
          intentType: "Attack",
          summary: "12 damage",
        },
        {
          actionName: "Taunt the Battle Line",
          intentType: "Debuff",
          statusesApplied: ["Fear"],
          mightChange: 1,
          summary: "Apply Fear and gain 1 Might",
        },
        {
          actionName: "Spear Like a Weaver's Beam",
          damage: 15,
          intentType: "Heavy Attack",
          summary: "15 damage",
        },
      ],
      phase2: [
        {
          actionName: "Goliath's Terror",
          damage: 10,
          intentType: "Debuff",
          statusesApplied: ["Fear"],
          summary: "10 damage and Fear",
        },
        {
          actionName: "Bronze Spear Thrust",
          damage: 18,
          intentType: "Heavy Attack",
          summary: "18 damage",
        },
        {
          actionName: "Defy the Ranks",
          damage: 14,
          intentType: "Attack",
          mightChange: 1,
          summary: "14 damage; gains 1 Might",
        },
      ],
      phase3: [
        {
          actionName: "Champion's Fury",
          intentType: "Buff",
          mightChange: 2,
          summary: "+2 Might",
        },
        {
          actionName: "Defiant Advance",
          damage: 16,
          intentType: "Attack",
          statusesApplied: ["Fear"],
          summary: "16 damage and Fear",
        },
        {
          actionName: "Champion's Crushing Blow",
          damage: 22,
          intentType: "Heavy Attack",
          summary: "22 damage",
        },
      ],
    },
  },
};

export function getEnemyCombatConfig(enemyId: string): EnemyCombatConfig | undefined {
  return enemyCombatConfigs[enemyId];
}

export function getEnemyMaxHealth(enemyId: string, fallbackMaxHealth: number) {
  return getEnemyCombatConfig(enemyId)?.maxHealth ?? fallbackMaxHealth;
}

export function getEnemyEncounterPresentation(enemyId: string) {
  const config = getEnemyCombatConfig(enemyId);

  return {
    dangerLevel: config?.dangerLevel ?? "Moderate",
    tacticalIdentity: config?.tacticalIdentity ?? "Direct combat pressure",
    definingMechanic:
      config?.definingMechanic ?? "Watch the intent and prepare your Guard.",
  };
}

export function getEnemyPatternStep(state: CombatState): EnemyPatternStep {
  const config = getEnemyCombatConfig(state.enemy.id);
  const fallbackStep: EnemyPatternStep = {
    actionName: state.enemy.intent || "Strike",
    damage: state.enemy.attackDamage,
    intentType: state.enemy.attackDamage >= 12 ? "Heavy Attack" : "Attack",
    summary: `${state.enemy.attackDamage} damage`,
  };

  if (!config) {
    return fallbackStep;
  }

  const phasePattern =
    state.bossPhase >= 3
      ? config.patterns.phase3
      : state.bossPhase >= 2
        ? config.patterns.phase2
        : undefined;
  const pattern = phasePattern?.length ? phasePattern : config.patterns.default;

  return pattern[(state.turn - 1) % pattern.length] ?? fallbackStep;
}
