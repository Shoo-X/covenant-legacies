import type {
  Card,
  Encounter,
  GameScreen,
  Hero,
  Memorial,
  MysteryEncounter,
  ResourceState,
  StartingDeckCard,
} from "@/types/game";
import {
  createRunSeed,
  deriveSeed,
  normalizeSeed,
  type RunSeed,
} from "@/game/random";
import {
  appendFinalizedRunSummary,
  createEmptyRunTracking,
  createLegacyRunSummary,
  finalizedRunSummaryRetentionLimit,
  finalizeRunSummary,
  sanitizeFinalizedRunSummary,
  sanitizeRunTracking,
  type FinalizedRunSummary,
  type RunTrackingState,
} from "@/game/runSummary";

export const activeRunSchemaVersion = 4;
export const runProfileSchemaVersion = 3;
export const activeRunStorageKey = "covenant-legacies:active-run";
export const runProfileStorageKey = "covenant-legacies:run-profile";
export const starterCampaignId = "david-valley-of-the-giant";

export type RunOutcome = "victory" | "defeat" | "abandoned";
export type RunHistoryEntry = FinalizedRunSummary;
export type ActiveRunScreen = Extract<
  GameScreen,
  "map" | "combat" | "mystery" | "rest" | "reward" | "memorial-reward"
>;

export const combatCheckpointSchemaVersion = 1;

export interface CombatCheckpoint {
  schemaVersion: typeof combatCheckpointSchemaVersion;
  createdAt: string;
  encounterId: string;
  runDeck: StartingDeckCard[];
  runHealth: number;
  runId: string;
  runMemorialIds: string[];
  runResources: ResourceState;
  runSeed: RunSeed;
  startingFaithBonus: number;
  upgradedCardIds: string[];
}

export interface ActiveRunSave {
  schemaVersion: typeof activeRunSchemaVersion;
  campaignId: typeof starterCampaignId;
  completedEncounterIds: string[];
  createdAt: string;
  currentScreen: ActiveRunScreen;
  combatCheckpoint?: CombatCheckpoint;
  hasFear: boolean;
  heroId: string;
  pendingMemorialRewardIds: string[];
  pendingRewardCardIds: string[];
  revealedMapNodeCount: number;
  rewardPoolCardIds: string[];
  runDeck: StartingDeckCard[];
  runHealth: number;
  runId: string;
  runMemorialIds: string[];
  runResources: ResourceState;
  runSeed: RunSeed;
  runTracking: RunTrackingState;
  selectedEncounterId: string;
  selectedMysteryEncounterId: string;
  startingFaithBonus: number;
  unlockedCodexEntryIds: string[];
  updatedAt: string;
  upgradedCardIds: string[];
}

export interface RunProfileSave {
  schemaVersion: typeof runProfileSchemaVersion;
  runHistory: RunHistoryEntry[];
}

export interface RunLifecycleContent {
  baseRewardPoolCardIds: string[];
  cards: Card[];
  codexEntryIds: string[];
  encounters: Encounter[];
  encounterIds: string[];
  firstEncounterId: string;
  firstMysteryEncounterId: string;
  hero: Hero;
  memorials: Memorial[];
  mysteryEncounters: MysteryEncounter[];
}

export interface SanitizedRunResult {
  issues: string[];
  run?: ActiveRunSave;
}

export interface SanitizedProfileResult {
  issues: string[];
  profile: RunProfileSave;
}

export function createDefaultRunProfile(): RunProfileSave {
  return {
    schemaVersion: runProfileSchemaVersion,
    runHistory: [],
  };
}

export function createNewActiveRun(
  content: RunLifecycleContent,
  now: string,
  runId: string,
  runSeed: RunSeed = createRunSeed(),
): ActiveRunSave {
  return {
    schemaVersion: activeRunSchemaVersion,
    campaignId: starterCampaignId,
    combatCheckpoint: undefined,
    completedEncounterIds: [],
    createdAt: now,
    currentScreen: "map",
    hasFear: false,
    heroId: content.hero.id,
    pendingMemorialRewardIds: [],
    pendingRewardCardIds: [],
    revealedMapNodeCount: 0,
    rewardPoolCardIds: [...content.baseRewardPoolCardIds],
    runDeck: sanitizeDeck(content.hero.startingDeck, content),
    runHealth: content.hero.maxHealth,
    runId,
    runMemorialIds: [],
    runResources: { ...content.hero.resourceState },
    runSeed,
    runTracking: createEmptyRunTracking(true),
    selectedEncounterId: content.firstEncounterId,
    selectedMysteryEncounterId: content.firstMysteryEncounterId,
    startingFaithBonus: 0,
    unlockedCodexEntryIds: [],
    updatedAt: now,
    upgradedCardIds: [],
  };
}

export function sanitizeActiveRunSave(
  value: unknown,
  content: RunLifecycleContent,
  now: string,
): SanitizedRunResult {
  const issues: string[] = [];

  if (!isRecord(value)) {
    return { issues: ["No active run save was present."] };
  }

  if (!isSupportedActiveRunSchema(value.schemaVersion)) {
    return {
      issues: [`Unsupported active run schema: ${String(value.schemaVersion)}.`],
    };
  }

  if (value.campaignId !== starterCampaignId || value.heroId !== content.hero.id) {
    return { issues: ["Saved run belongs to unsupported campaign or hero."] };
  }

  const runDeck = sanitizeDeck(value.runDeck, content);

  if (runDeck.length === 0) {
    issues.push("Saved deck had no valid playable cards; restored David's starter deck.");
  }

  const pendingRewardCardIds = filterKnownIds(
    value.pendingRewardCardIds,
    new Set(content.cards.filter((card) => card.isPlayable !== false).map((card) => card.id)),
  );
  const pendingMemorialRewardIds = filterKnownIds(
    value.pendingMemorialRewardIds,
    new Set(content.memorials.map((memorial) => memorial.id)),
  );
  let currentScreen = sanitizeRunScreen(value.currentScreen);
  const combatCheckpoint = sanitizeCombatCheckpoint(value.combatCheckpoint, content, now);

  if (currentScreen === "reward" && pendingRewardCardIds.length === 0) {
    currentScreen = "map";
    issues.push("Saved reward screen had no valid reward cards; returned to map.");
  }

  if (currentScreen === "memorial-reward" && pendingMemorialRewardIds.length === 0) {
    currentScreen = "map";
    issues.push("Saved Memorial reward screen had no valid Memorials; returned to map.");
  }

  if (currentScreen === "combat" && !combatCheckpoint) {
    currentScreen = "map";
    issues.push("Saved combat checkpoint was missing or invalid; returned to map.");
  }

  const run: ActiveRunSave = {
    schemaVersion: activeRunSchemaVersion,
    campaignId: starterCampaignId,
    combatCheckpoint,
    completedEncounterIds: filterKnownIds(
      value.completedEncounterIds,
      new Set(content.encounterIds),
    ),
    createdAt: sanitizeIsoDate(value.createdAt, now),
    currentScreen,
    hasFear: Boolean(value.hasFear),
    heroId: content.hero.id,
    pendingMemorialRewardIds,
    pendingRewardCardIds,
    revealedMapNodeCount: sanitizeNonNegativeInteger(value.revealedMapNodeCount, 0),
    rewardPoolCardIds: sanitizeRewardPool(value.rewardPoolCardIds, content),
    runDeck: runDeck.length > 0 ? runDeck : sanitizeDeck(content.hero.startingDeck, content),
    runHealth: sanitizeHealth(value.runHealth, content.hero.maxHealth),
    runId: typeof value.runId === "string" && value.runId ? value.runId : createFallbackRunId(now),
    runMemorialIds: filterKnownIds(
      value.runMemorialIds,
      new Set(content.memorials.map((memorial) => memorial.id)),
    ),
    runResources: sanitizeResources(value.runResources, content.hero.resourceState),
    runSeed: sanitizeRunSeed(value.runSeed, value.runId, now),
    runTracking: sanitizeRunTracking(value.runTracking),
    selectedEncounterId: sanitizeKnownId(
      value.selectedEncounterId,
      new Set(content.encounterIds),
      content.firstEncounterId,
    ),
    selectedMysteryEncounterId: sanitizeKnownId(
      value.selectedMysteryEncounterId,
      new Set(content.mysteryEncounters.map((encounter) => encounter.id)),
      content.firstMysteryEncounterId,
    ),
    startingFaithBonus: sanitizeNonNegativeInteger(value.startingFaithBonus, 0),
    unlockedCodexEntryIds: filterKnownIds(value.unlockedCodexEntryIds, new Set(content.codexEntryIds)),
    updatedAt: sanitizeIsoDate(value.updatedAt, now),
    upgradedCardIds: filterKnownIds(
      value.upgradedCardIds,
      new Set(content.cards.filter((card) => card.upgradeId).map((card) => card.id)),
    ),
  };

  return { issues, run };
}

export function sanitizeRunProfileSave(
  value: unknown,
  content?: RunLifecycleContent,
): SanitizedProfileResult {
  const issues: string[] = [];

  if (!isRecord(value)) {
    return { issues: ["No run profile was present."], profile: createDefaultRunProfile() };
  }

  if (!isSupportedRunProfileSchema(value.schemaVersion)) {
    return {
      issues: [`Unsupported run profile schema: ${String(value.schemaVersion)}.`],
      profile: createDefaultRunProfile(),
    };
  }

  const runHistory = Array.isArray(value.runHistory)
    ? value.runHistory
        .map((entry) => sanitizeRunHistoryEntry(entry, content))
        .filter((entry): entry is RunHistoryEntry => Boolean(entry))
        .slice(-finalizedRunSummaryRetentionLimit)
    : [];

  if (!Array.isArray(value.runHistory)) {
    issues.push("Run history was missing or invalid.");
  }

  return {
    issues,
    profile: {
      schemaVersion: runProfileSchemaVersion,
      runHistory,
    },
  };
}

export function recordRunOutcome(
  profile: RunProfileSave,
  activeRun: ActiveRunSave,
  outcome: RunOutcome,
  endedAt: string,
  content: RunLifecycleContent,
): RunProfileSave {
  if (profile.runHistory.some((entry) => entry.runId === activeRun.runId)) {
    return profile;
  }

  const nextEntry = createFinalizedRunSummary(activeRun, outcome, endedAt, content);

  return {
    ...profile,
    runHistory: appendFinalizedRunSummary(profile.runHistory, nextEntry),
  };
}

export function createFinalizedRunSummary(
  activeRun: ActiveRunSave,
  outcome: RunOutcome,
  endedAt: string,
  content: RunLifecycleContent,
): FinalizedRunSummary {
  return finalizeRunSummary(
    {
      campaignId: activeRun.campaignId,
      completedEncounterIds: activeRun.completedEncounterIds,
      createdAt: activeRun.createdAt,
      endedAt,
      finalDeck: activeRun.runDeck,
      finalHealth: activeRun.runHealth,
      finalResources: activeRun.runResources,
      heroId: activeRun.heroId,
      outcome: mapRunOutcome(outcome),
      runId: activeRun.runId,
      runMemorialIds: activeRun.runMemorialIds,
      runSeed: activeRun.runSeed,
      runTracking: activeRun.runTracking,
      selectedEncounterId: activeRun.selectedEncounterId,
      upgradedCardIds: activeRun.upgradedCardIds,
    },
    {
      cards: content.cards,
      encounters: content.encounters,
      hero: content.hero,
      memorials: content.memorials,
    },
  );
}

export function mapRunOutcome(outcome: RunOutcome) {
  if (outcome === "victory") {
    return "completed" as const;
  }

  if (outcome === "defeat") {
    return "defeated" as const;
  }

  return "abandoned" as const;
}

export function getRunOutcomeLabel(outcome: RunHistoryEntry["outcome"]) {
  if (outcome === "completed") {
    return "Campaign completed";
  }

  if (outcome === "defeated") {
    return "Run ended";
  }

  return "Run abandoned";
}

export function getRunSummaryLine(summary: RunHistoryEntry) {
  const steps =
    summary.encountersCompleted === undefined
      ? "earlier record"
      : `${summary.encountersCompleted} steps`;
  const cards =
    summary.finalDeckCardCount === undefined
      ? undefined
      : `${summary.finalDeckCardCount} cards`;

  return [getRunOutcomeLabel(summary.outcome), steps, cards, `Seed ${summary.runSeed}`]
    .filter(Boolean)
    .join(" / ");
}

export function getResumableRunScreen(run: ActiveRunSave): ActiveRunScreen {
  if (run.currentScreen === "combat" && !run.combatCheckpoint) {
    return "map";
  }

  if (run.currentScreen === "reward" && run.pendingRewardCardIds.length === 0) {
    return "map";
  }

  if (
    run.currentScreen === "memorial-reward" &&
    run.pendingMemorialRewardIds.length === 0
  ) {
    return "map";
  }

  return run.currentScreen;
}

export function getLastRunOutcome(profile: RunProfileSave) {
  return profile.runHistory.at(-1);
}

function sanitizeDeck(
  value: unknown,
  content: RunLifecycleContent,
): StartingDeckCard[] {
  const playableCardIds = new Set(
    content.cards.filter((card) => card.isPlayable !== false).map((card) => card.id),
  );

  if (!Array.isArray(value)) {
    return [];
  }

  const quantities = new Map<string, number>();

  value.forEach((entry) => {
    if (!isRecord(entry) || typeof entry.cardId !== "string") {
      return;
    }

    if (!playableCardIds.has(entry.cardId)) {
      return;
    }

    const quantity = sanitizeNonNegativeInteger(entry.quantity, 0);

    if (quantity <= 0) {
      return;
    }

    quantities.set(entry.cardId, (quantities.get(entry.cardId) ?? 0) + quantity);
  });

  return [...quantities.entries()].map(([cardId, quantity]) => ({ cardId, quantity }));
}

function sanitizeRewardPool(value: unknown, content: RunLifecycleContent) {
  const basePool = new Set(content.baseRewardPoolCardIds);
  const playableCardIds = new Set(
    content.cards.filter((card) => card.isPlayable !== false).map((card) => card.id),
  );
  const savedIds = filterKnownIds(value, playableCardIds);
  const mergedIds = [...new Set([...content.baseRewardPoolCardIds, ...savedIds])];

  return mergedIds.filter((cardId) => basePool.has(cardId) || playableCardIds.has(cardId));
}

function sanitizeResources(
  value: unknown,
  fallback: ResourceState,
): ResourceState {
  const record = isRecord(value) ? value : {};

  return {
    authority: sanitizeNonNegativeInteger(record.authority, fallback.authority),
    corruption: sanitizeNonNegativeInteger(record.corruption, fallback.corruption),
    faith: sanitizeNonNegativeInteger(record.faith, fallback.faith),
    resolve: sanitizeNonNegativeInteger(record.resolve, fallback.resolve),
    wisdom: sanitizeNonNegativeInteger(record.wisdom, fallback.wisdom),
  };
}

function sanitizeHealth(value: unknown, maxHealth: number) {
  return Math.max(1, Math.min(maxHealth, sanitizeNonNegativeInteger(value, maxHealth)));
}

function sanitizeKnownId(value: unknown, validIds: Set<string>, fallback: string) {
  return typeof value === "string" && validIds.has(value) ? value : fallback;
}

function filterKnownIds(value: unknown, validIds: Set<string>) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.filter((id): id is string => typeof id === "string"))].filter(
    (id) => validIds.has(id),
  );
}

function sanitizeRunScreen(value: unknown): ActiveRunScreen {
  if (
    value === "map" ||
    value === "combat" ||
    value === "mystery" ||
    value === "rest" ||
    value === "reward" ||
    value === "memorial-reward"
  ) {
    return value;
  }

  return "map";
}

export function createCombatCheckpoint(
  run: Pick<
    ActiveRunSave,
    | "runDeck"
    | "runHealth"
    | "runId"
    | "runMemorialIds"
    | "runResources"
    | "runSeed"
    | "startingFaithBonus"
    | "upgradedCardIds"
  >,
  encounterId: string,
  now: string,
): CombatCheckpoint {
  return {
    schemaVersion: combatCheckpointSchemaVersion,
    createdAt: now,
    encounterId,
    runDeck: run.runDeck.map((entry) => ({ ...entry })),
    runHealth: run.runHealth,
    runId: run.runId,
    runMemorialIds: [...run.runMemorialIds],
    runResources: { ...run.runResources },
    runSeed: run.runSeed,
    startingFaithBonus: run.startingFaithBonus,
    upgradedCardIds: [...run.upgradedCardIds],
  };
}

export function sanitizeCombatCheckpoint(
  value: unknown,
  content: RunLifecycleContent,
  now: string,
): CombatCheckpoint | undefined {
  if (!isRecord(value) || value.schemaVersion !== combatCheckpointSchemaVersion) {
    return undefined;
  }

  const encounterId = sanitizeKnownId(
    value.encounterId,
    new Set(
      content.encounters
        .filter((encounter) => encounter.enemyIds.length > 0)
        .map((encounter) => encounter.id),
    ),
    "",
  );
  const runDeck = sanitizeDeck(value.runDeck, content);
  const runId = typeof value.runId === "string" && value.runId ? value.runId : "";

  if (!encounterId || !runId || runDeck.length === 0) {
    return undefined;
  }

  return {
    schemaVersion: combatCheckpointSchemaVersion,
    createdAt: sanitizeIsoDate(value.createdAt, now),
    encounterId,
    runDeck,
    runHealth: sanitizeHealth(value.runHealth, content.hero.maxHealth),
    runId,
    runMemorialIds: filterKnownIds(
      value.runMemorialIds,
      new Set(content.memorials.map((memorial) => memorial.id)),
    ),
    runResources: sanitizeResources(value.runResources, content.hero.resourceState),
    runSeed: sanitizeRunSeed(value.runSeed, runId, now),
    startingFaithBonus: sanitizeNonNegativeInteger(value.startingFaithBonus, 0),
    upgradedCardIds: filterKnownIds(
      value.upgradedCardIds,
      new Set(content.cards.filter((card) => card.upgradeId).map((card) => card.id)),
    ),
  };
}

function sanitizeNonNegativeInteger(value: unknown, fallback: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(0, Math.floor(value));
}

function sanitizeIsoDate(value: unknown, fallback: string) {
  if (typeof value !== "string") {
    return fallback;
  }

  const timestamp = Date.parse(value);

  return Number.isNaN(timestamp) ? fallback : value;
}

function sanitizeRunSeed(value: unknown, runId: unknown, now: string) {
  if (typeof value === "string" && value.trim()) {
    return normalizeSeed(value);
  }

  const stableRunId =
    typeof runId === "string" && runId.trim() ? runId : createFallbackRunId(now);

  return deriveSeed(normalizeSeed(createRunSeed()), `migrated:${stableRunId}`);
}

function sanitizeRunHistoryEntry(
  value: unknown,
  content?: RunLifecycleContent,
): RunHistoryEntry | undefined {
  if (!isRecord(value) || value.campaignId !== starterCampaignId) {
    return undefined;
  }

  const summaryContent = content
    ? {
        cards: content.cards,
        encounters: content.encounters,
        hero: content.hero,
        memorials: content.memorials,
      }
    : undefined;

  return (
    sanitizeFinalizedRunSummary(value, summaryContent) ??
    createLegacyRunSummary(value, new Date().toISOString())
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function createFallbackRunId(now: string) {
  return `run-${Date.parse(now) || Date.now()}`;
}

function isSupportedActiveRunSchema(value: unknown) {
  return value === 1 || value === 2 || value === 3 || value === activeRunSchemaVersion;
}

function isSupportedRunProfileSchema(value: unknown) {
  return value === 1 || value === 2 || value === runProfileSchemaVersion;
}
