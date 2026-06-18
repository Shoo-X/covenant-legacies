import type {
  Card,
  CombatStatusName,
  Enemy,
  Hero,
  Memorial,
  ResourceState,
  StartingDeckCard,
} from "@/types/game";

export interface CombatCardInstance {
  instanceId: string;
  cardId: string;
}

export interface CombatantState {
  health: number;
  maxHealth: number;
  guard: number;
  might: number;
}

export type CombatStatus = "active" | "victory" | "defeat";

export type CombatPhase =
  | "BattleIntro"
  | "PlayerTurnStart"
  | "PlayerMain"
  | "PlayerTurnEnd"
  | "EnemyTurnStart"
  | "EnemyActing"
  | "RoundCleanup"
  | "Victory"
  | "Defeat";

export type CombatFeedbackKind =
  | "damage"
  | "guard"
  | "resource"
  | "draw"
  | "enemy"
  | "system";

export type CombatIntentType =
  | "Attack"
  | "Heavy Attack"
  | "Buff"
  | "Debuff"
  | "Ritual"
  | "Special";

export type CombatActionActor = "Enemy" | "Player" | "System";
export type CombatActionTarget = "Enemy" | "Player" | "Self" | "All";

export type CombatActionPresentation =
  | "banner"
  | "windup"
  | "block"
  | "damage"
  | "status"
  | "buff"
  | "resource"
  | "cleanup"
  | "intent";

export interface CombatFeedback {
  id: number;
  kind: CombatFeedbackKind;
  message: string;
}

export interface QueuedCombatAction {
  id: string;
  actor: CombatActionActor;
  actionName: string;
  intentType: CombatIntentType;
  target: CombatActionTarget;
  presentation: CombatActionPresentation;
  damage?: number;
  blockedValue?: number;
  guardLoss?: number;
  hpDamage?: number;
  guardValue?: number;
  statusesApplied?: CombatStatusName[];
  statusesRemoved?: CombatStatusName[];
  resourceChanges?: Partial<ResourceState>;
  mightChange?: number;
  logKind: CombatFeedbackKind;
  logMessage: string;
}

export interface EnemyIntentDetails {
  actionName: string;
  expectedDamage: number;
  guardGain?: number;
  iconTone: "attack" | "buff" | "debuff" | "ritual" | "special";
  intentType: CombatIntentType;
  statusesApplied?: CombatStatusName[];
  resourceChanges?: Partial<ResourceState>;
  summary: string;
}

export interface CombatMetrics {
  roundsTaken: number;
  startingHealth: number;
  endingHealth: number;
  damageDealt: number;
  damageReceived: number;
  guardGenerated: number;
  corruptionGained: number;
  cardsPlayed: number;
  notableCardName?: string;
  notableArchetype?: string;
}

export interface CombatStartSnapshot {
  hero: Hero;
  enemy: Enemy;
  runDeck: StartingDeckCard[];
  runHealth: number;
  runResources: ResourceState;
  memorials: Memorial[];
  startingFaithBonus: number;
  player: CombatantState;
  enemyState: CombatantState;
  resources: ResourceState;
  drawPile: CombatCardInstance[];
  hand: CombatCardInstance[];
  discardPile: CombatCardInstance[];
  turn: number;
  nextAttackBonus: number;
  nextPrayerCostReduction: number;
  covenantCardsTriggerTwice: boolean;
  firstPsalmDiscountUsed: boolean;
  oilOfGladnessUsed: boolean;
  hasFear: boolean;
  playerStatuses: CombatStatusName[];
  enemyStatuses: CombatStatusName[];
  heartOfCourageUsed: boolean;
  bossPhase: number;
  destroyedAltarOrStructure: boolean;
  metrics: CombatMetrics;
  feedback: CombatFeedback[];
}

export interface CombatState {
  hero: Hero;
  enemy: Enemy;
  runDeck: StartingDeckCard[];
  runHealth: number;
  runResources: ResourceState;
  memorials: Memorial[];
  startingFaithBonus: number;
  player: CombatantState;
  enemyState: CombatantState;
  resources: ResourceState;
  drawPile: CombatCardInstance[];
  hand: CombatCardInstance[];
  discardPile: CombatCardInstance[];
  turn: number;
  nextAttackBonus: number;
  nextPrayerCostReduction: number;
  covenantCardsTriggerTwice: boolean;
  firstPsalmDiscountUsed: boolean;
  oilOfGladnessUsed: boolean;
  hasFear: boolean;
  playerStatuses: CombatStatusName[];
  enemyStatuses: CombatStatusName[];
  heartOfCourageUsed: boolean;
  bossPhase: number;
  destroyedAltarOrStructure: boolean;
  status: CombatStatus;
  phase: CombatPhase;
  actionQueue: QueuedCombatAction[];
  activeAction?: QueuedCombatAction;
  lastResolvedAction?: QueuedCombatAction;
  metrics: CombatMetrics;
  feedback: CombatFeedback[];
  lastPlayedInstanceId?: string;
  startSnapshot?: CombatStartSnapshot;
}

export interface CombatContext {
  cardsById: Map<string, Card>;
  memorials?: Memorial[];
  startingFaithBonus?: number;
  random?: () => number;
}

export type CombatAction =
  | { type: "play-card"; instanceId: string }
  | { type: "end-turn" }
  | { type: "advance-presentation" }
  | { type: "restart" };
