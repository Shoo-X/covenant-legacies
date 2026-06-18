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
    patterns: {
      default: [
        {
          actionName: "Desecrating Chant",
          damage: 6,
          intentType: "Debuff",
          statusesApplied: ["Weaken"],
          summary: "6 damage and Weaken",
        },
        {
          actionName: "Empower Altar",
          intentType: "Ritual",
          mightChange: 2,
          requiresActiveAltar: true,
          summary: "active altar: +2 Might",
        },
        {
          actionName: "Ritual Strike",
          corruptionIfAltarActive: 1,
          damage: 14,
          intentType: "Special",
          summary: "14 damage; +1 Corruption if altar remains",
        },
      ],
    },
  },
  "enemy-giant-blooded-brute": {
    maxHealth: 62,
    patterns: {
      default: [
        {
          actionName: "Menacing Roar",
          intentType: "Debuff",
          statusesApplied: ["Fear"],
          summary: "Apply Fear",
        },
        {
          actionName: "Crushing Blow",
          damage: 18,
          intentType: "Heavy Attack",
          summary: "18 damage",
        },
        {
          actionName: "Recovery Strike",
          damage: 7,
          intentType: "Attack",
          mightChange: -1,
          summary: "7 damage; loses 1 Might",
        },
      ],
    },
  },
  "enemy-watcher-taught-smith": {
    maxHealth: 78,
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
    phaseThresholds: {
      phase2: 0.6,
      phase3: 0.3,
    },
    patterns: {
      default: [
        {
          actionName: "High-Place Strike",
          damage: 12,
          intentType: "Attack",
          summary: "12 damage",
        },
        {
          actionName: "Empower the High Place",
          intentType: "Ritual",
          mightChange: 1,
          requiresActiveAltar: true,
          summary: "active altar: +1 Might",
        },
        {
          actionName: "Altar Crush",
          corruptionIfAltarActive: 1,
          damage: 15,
          intentType: "Special",
          summary: "15 damage; +1 Corruption if altar remains",
        },
      ],
      phase2: [
        {
          actionName: "Giant's Terror",
          damage: 10,
          intentType: "Debuff",
          statusesApplied: ["Fear"],
          summary: "10 damage and Fear",
        },
        {
          actionName: "Crushing Blow",
          damage: 18,
          intentType: "Heavy Attack",
          summary: "18 damage",
        },
        {
          actionName: "High-Place Strike",
          corruptionIfAltarActive: 1,
          damage: 14,
          intentType: "Special",
          summary: "14 damage; +1 Corruption if altar remains",
        },
      ],
      phase3: [
        {
          actionName: "Watcher-Blood Rage",
          intentType: "Buff",
          mightChange: 2,
          summary: "+2 Might",
        },
        {
          actionName: "Shadow of the Watchers",
          corruptionIfAltarActive: 1,
          damage: 16,
          intentType: "Special",
          summary: "16 damage; +1 Corruption if altar remains",
        },
        {
          actionName: "Crushing Blow",
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
