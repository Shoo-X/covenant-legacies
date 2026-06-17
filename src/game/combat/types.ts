import type {
  Card,
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

export type CombatFeedbackKind =
  | "damage"
  | "guard"
  | "resource"
  | "draw"
  | "enemy"
  | "system";

export interface CombatFeedback {
  id: number;
  kind: CombatFeedbackKind;
  message: string;
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
  heartOfCourageUsed: boolean;
  bossPhase: number;
  status: CombatStatus;
  feedback: CombatFeedback[];
  lastPlayedInstanceId?: string;
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
  | { type: "restart" };
