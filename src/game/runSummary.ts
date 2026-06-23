import type { Card, Encounter, Hero, Memorial, ResourceState, StartingDeckCard } from "@/types/game";

export const runTrackingSchemaVersion = 1;
export const finalizedRunSummarySchemaVersion = 1;
export const finalizedRunSummaryRetentionLimit = 20;

export type FinalizedRunOutcome = "completed" | "defeated" | "abandoned";
export type RunCardChangeKind = "gained" | "removed" | "upgraded";
export type RunDecisionKind =
  | "reward-card"
  | "reward-skip"
  | "memorial"
  | "memorial-skip"
  | "mystery"
  | "rest";

export interface CompactEntityRef {
  id: string;
  name: string;
}

export interface SummaryDeckCard extends CompactEntityRef {
  quantity: number;
  upgraded?: boolean;
}

export interface SummaryCountedEntity extends CompactEntityRef {
  quantity: number;
}

export interface SummaryEncounterRef extends CompactEntityRef {
  isBoss: boolean;
  status: "completed" | "reached" | "unresolved";
}

export interface RunCardChangeRecord {
  occurrenceKey: string;
  kind: RunCardChangeKind;
  cardId: string;
  quantity: number;
  encounterId?: string;
  source: "reward" | "mystery" | "rest" | "collection";
}

export interface RunMemorialChangeRecord {
  occurrenceKey: string;
  memorialId: string;
  encounterId?: string;
}

export interface RunDecisionRecord {
  occurrenceKey: string;
  kind: RunDecisionKind;
  encounterId?: string;
  choiceId?: string;
  cardId?: string;
  memorialId?: string;
}

export interface RunEncounterRecord {
  occurrenceKey: string;
  encounterId: string;
}

export interface RunTrackingState {
  schemaVersion: typeof runTrackingSchemaVersion;
  hasDetailedDeckChanges: boolean;
  cardChanges: RunCardChangeRecord[];
  decisions: RunDecisionRecord[];
  encounterCompletions: RunEncounterRecord[];
  memorialChanges: RunMemorialChangeRecord[];
}

export interface FinalizedRunSummary {
  schemaVersion: typeof finalizedRunSummarySchemaVersion;
  bossCompleted?: boolean;
  bossReached?: boolean;
  campaignId: string;
  cardsGained?: SummaryCountedEntity[];
  cardsRemoved?: SummaryCountedEntity[];
  cardsUpgraded?: SummaryCountedEntity[];
  combatVictories?: number;
  createdAt?: string;
  dataStatus: {
    deckChanges: "complete" | "unavailable";
    migrated: boolean;
  };
  decisions?: RunDecisionRecord[];
  encounterPath?: SummaryEncounterRef[];
  encountersCompleted?: number;
  endedAt: string;
  finalDeck?: SummaryDeckCard[];
  finalDeckCardCount?: number;
  finalHealth?: number;
  finalMemorials?: SummaryCountedEntity[];
  finalResources?: ResourceState;
  hero: CompactEntityRef;
  lastEncounter?: SummaryEncounterRef;
  outcome: FinalizedRunOutcome;
  runId: string;
  runSeed: string;
}

export interface RunSummaryContent {
  cards: Card[];
  encounters: Encounter[];
  hero: Hero;
  memorials: Memorial[];
}

export interface FinalizeRunSummaryInput {
  campaignId: string;
  completedEncounterIds: string[];
  createdAt: string;
  endedAt: string;
  finalDeck: StartingDeckCard[];
  finalHealth: number;
  finalResources: ResourceState;
  heroId: string;
  outcome: FinalizedRunOutcome;
  runId: string;
  runMemorialIds: string[];
  runSeed: string;
  runTracking: RunTrackingState;
  selectedEncounterId?: string;
  upgradedCardIds: string[];
}

export function createEmptyRunTracking(
  hasDetailedDeckChanges = true,
): RunTrackingState {
  return {
    schemaVersion: runTrackingSchemaVersion,
    hasDetailedDeckChanges,
    cardChanges: [],
    decisions: [],
    encounterCompletions: [],
    memorialChanges: [],
  };
}

export function sanitizeRunTracking(value: unknown): RunTrackingState {
  if (!isRecord(value) || value.schemaVersion !== runTrackingSchemaVersion) {
    return createEmptyRunTracking(false);
  }

  return {
    schemaVersion: runTrackingSchemaVersion,
    hasDetailedDeckChanges: value.hasDetailedDeckChanges === true,
    cardChanges: Array.isArray(value.cardChanges)
      ? value.cardChanges.map(sanitizeCardChange).filter(isDefined).slice(-80)
      : [],
    decisions: Array.isArray(value.decisions)
      ? value.decisions.map(sanitizeDecision).filter(isDefined).slice(-80)
      : [],
    encounterCompletions: Array.isArray(value.encounterCompletions)
      ? value.encounterCompletions.map(sanitizeEncounterRecord).filter(isDefined).slice(-40)
      : [],
    memorialChanges: Array.isArray(value.memorialChanges)
      ? value.memorialChanges.map(sanitizeMemorialChange).filter(isDefined).slice(-40)
      : [],
  };
}

export function recordCardChange(
  tracking: RunTrackingState,
  record: RunCardChangeRecord,
): RunTrackingState {
  const sanitized = sanitizeCardChange(record);

  if (!sanitized || tracking.cardChanges.some((entry) => entry.occurrenceKey === sanitized.occurrenceKey)) {
    return tracking;
  }

  return {
    ...tracking,
    cardChanges: [...tracking.cardChanges, sanitized].slice(-80),
  };
}

export function recordDecision(
  tracking: RunTrackingState,
  record: RunDecisionRecord,
): RunTrackingState {
  const sanitized = sanitizeDecision(record);

  if (!sanitized || tracking.decisions.some((entry) => entry.occurrenceKey === sanitized.occurrenceKey)) {
    return tracking;
  }

  return {
    ...tracking,
    decisions: [...tracking.decisions, sanitized].slice(-80),
  };
}

export function recordEncounterCompletion(
  tracking: RunTrackingState,
  encounterId: string,
): RunTrackingState {
  const record = sanitizeEncounterRecord({
    occurrenceKey: `encounter-complete:${encounterId}`,
    encounterId,
  });

  if (!record || tracking.encounterCompletions.some((entry) => entry.occurrenceKey === record.occurrenceKey)) {
    return tracking;
  }

  return {
    ...tracking,
    encounterCompletions: [...tracking.encounterCompletions, record].slice(-40),
  };
}

export function recordMemorialChange(
  tracking: RunTrackingState,
  record: RunMemorialChangeRecord,
): RunTrackingState {
  const sanitized = sanitizeMemorialChange(record);

  if (!sanitized || tracking.memorialChanges.some((entry) => entry.occurrenceKey === sanitized.occurrenceKey)) {
    return tracking;
  }

  return {
    ...tracking,
    memorialChanges: [...tracking.memorialChanges, sanitized].slice(-40),
  };
}

export function finalizeRunSummary(
  input: FinalizeRunSummaryInput,
  content: RunSummaryContent,
): FinalizedRunSummary {
  const cardsById = new Map(content.cards.map((card) => [card.id, card]));
  const encountersById = new Map(content.encounters.map((encounter) => [encounter.id, encounter]));
  const memorialsById = new Map(content.memorials.map((memorial) => [memorial.id, memorial]));
  const completedEncounterIds = uniqueStrings(input.completedEncounterIds);
  const encounterPathIds = getEncounterPathIds(
    input.runTracking,
    completedEncounterIds,
    input.selectedEncounterId,
  );
  const bossEncounter = content.encounters.find((encounter) => encounter.nodeType === "Boss");
  const bossReached = Boolean(
    bossEncounter &&
      (encounterPathIds.includes(bossEncounter.id) ||
        input.selectedEncounterId === bossEncounter.id),
  );
  const bossCompleted = Boolean(
    bossEncounter && completedEncounterIds.includes(bossEncounter.id),
  );
  const finalDeck = groupFinalDeck(
    input.finalDeck,
    cardsById,
    new Set(input.upgradedCardIds),
  );
  const changeGroups = groupCardChanges(input.runTracking.cardChanges, cardsById);

  return sanitizeFinalizedRunSummary(
    {
      schemaVersion: finalizedRunSummarySchemaVersion,
      bossCompleted,
      bossReached,
      campaignId: input.campaignId,
      cardsGained:
        input.runTracking.hasDetailedDeckChanges ? changeGroups.gained : undefined,
      cardsRemoved:
        input.runTracking.hasDetailedDeckChanges ? changeGroups.removed : undefined,
      cardsUpgraded:
        input.runTracking.hasDetailedDeckChanges ? changeGroups.upgraded : undefined,
      combatVictories: getCombatVictories(completedEncounterIds, encountersById),
      createdAt: input.createdAt,
      dataStatus: {
        deckChanges: input.runTracking.hasDetailedDeckChanges ? "complete" : "unavailable",
        migrated: !input.runTracking.hasDetailedDeckChanges,
      },
      decisions: input.runTracking.decisions,
      encounterPath: encounterPathIds.map((encounterId) =>
        getEncounterRef(
          encounterId,
          encountersById,
          completedEncounterIds.includes(encounterId),
          encounterId === input.selectedEncounterId && !completedEncounterIds.includes(encounterId),
        ),
      ),
      encountersCompleted: completedEncounterIds.length,
      endedAt: input.endedAt,
      finalDeck,
      finalDeckCardCount: finalDeck.reduce(
        (total, entry) => total + entry.quantity,
        0,
      ),
      finalHealth: Math.max(0, Math.floor(input.finalHealth)),
      finalMemorials: groupIdCounts(input.runMemorialIds, memorialsById),
      finalResources: sanitizeResources(input.finalResources),
      hero: getEntityRef(input.heroId, new Map([[content.hero.id, content.hero]]), content.hero.name),
      lastEncounter: input.selectedEncounterId
        ? getEncounterRef(
            input.selectedEncounterId,
            encountersById,
            completedEncounterIds.includes(input.selectedEncounterId),
            !completedEncounterIds.includes(input.selectedEncounterId),
          )
        : undefined,
      outcome: input.outcome,
      runId: input.runId,
      runSeed: input.runSeed,
    },
    content,
  ) ?? createMalformedSummaryFallback(input.endedAt);
}

export function sanitizeFinalizedRunSummary(
  value: unknown,
  content?: RunSummaryContent,
): FinalizedRunSummary | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const outcome = sanitizeOutcome(value.outcome);
  const runId = sanitizeString(value.runId);
  const endedAt = sanitizeIsoDate(value.endedAt);
  const campaignId = sanitizeString(value.campaignId);
  const runSeed = sanitizeString(value.runSeed);

  if (!outcome || !runId || !endedAt || !campaignId || !runSeed) {
    return undefined;
  }

  const cardsById = content ? new Map(content.cards.map((card) => [card.id, card])) : undefined;
  const encountersById = content ? new Map(content.encounters.map((encounter) => [encounter.id, encounter])) : undefined;
  const memorialsById = content ? new Map(content.memorials.map((memorial) => [memorial.id, memorial])) : undefined;
  const heroFallback = content?.hero.name ?? "David";

  return {
    schemaVersion: finalizedRunSummarySchemaVersion,
    bossCompleted: sanitizeOptionalBoolean(value.bossCompleted),
    bossReached: sanitizeOptionalBoolean(value.bossReached),
    campaignId,
    cardsGained: sanitizeCountedEntities(value.cardsGained, cardsById),
    cardsRemoved: sanitizeCountedEntities(value.cardsRemoved, cardsById),
    cardsUpgraded: sanitizeCountedEntities(value.cardsUpgraded, cardsById),
    combatVictories: sanitizeOptionalInteger(value.combatVictories),
    createdAt: sanitizeIsoDate(value.createdAt),
    dataStatus: sanitizeDataStatus(value.dataStatus),
    decisions: Array.isArray(value.decisions)
      ? value.decisions.map(sanitizeDecision).filter(isDefined).slice(-80)
      : undefined,
    encounterPath: sanitizeEncounterPath(value.encounterPath, encountersById),
    encountersCompleted: sanitizeOptionalInteger(value.encountersCompleted),
    endedAt,
    finalDeck: sanitizeDeckSummary(value.finalDeck, cardsById),
    finalDeckCardCount: sanitizeOptionalInteger(value.finalDeckCardCount),
    finalHealth: sanitizeOptionalInteger(value.finalHealth),
    finalMemorials: sanitizeCountedEntities(value.finalMemorials, memorialsById),
    finalResources: sanitizeOptionalResources(value.finalResources),
    hero: sanitizeEntityRef(value.hero, content?.hero.id, heroFallback),
    lastEncounter: sanitizeEncounterRef(value.lastEncounter, encountersById),
    outcome,
    runId,
    runSeed,
  };
}

export function createLegacyRunSummary(
  value: unknown,
  endedAtFallback: string,
): FinalizedRunSummary | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const outcome = mapLegacyOutcome(value.outcome);
  const runId = sanitizeString(value.runId);
  const campaignId = sanitizeString(value.campaignId);
  const endedAt = sanitizeIsoDate(value.endedAt) ?? endedAtFallback;
  const runSeed = sanitizeString(value.runSeed) ?? "DAVID-0000-0000";

  if (!outcome || !runId || !campaignId) {
    return undefined;
  }

  const completedEncounterIds = Array.isArray(value.completedEncounterIds)
    ? value.completedEncounterIds.filter((id): id is string => typeof id === "string")
    : undefined;

  return sanitizeFinalizedRunSummary({
    schemaVersion: finalizedRunSummarySchemaVersion,
    bossCompleted: undefined,
    bossReached: undefined,
    campaignId,
    combatVictories: undefined,
    createdAt: sanitizeIsoDate(value.createdAt),
    dataStatus: {
      deckChanges: "unavailable",
      migrated: true,
    },
    encounterPath: completedEncounterIds?.map((encounterId) => ({
      id: encounterId,
      name: encounterId,
      isBoss: false,
      status: "completed",
    })),
    encountersCompleted: completedEncounterIds?.length,
    endedAt,
    finalDeckCardCount: sanitizeOptionalInteger(value.finalDeckCardCount),
    finalHealth: sanitizeOptionalInteger(value.finalHealth),
    finalMemorials: Array.isArray(value.runMemorialIds)
      ? value.runMemorialIds
          .filter((id): id is string => typeof id === "string")
          .map((id) => ({ id, name: id, quantity: 1 }))
      : undefined,
    hero: { id: "hero-david", name: "David" },
    outcome,
    runId,
    runSeed,
  });
}

export function appendFinalizedRunSummary(
  runHistory: FinalizedRunSummary[],
  summary: FinalizedRunSummary,
  limit = finalizedRunSummaryRetentionLimit,
) {
  if (runHistory.some((entry) => entry.runId === summary.runId)) {
    return runHistory;
  }

  return [...runHistory, summary].slice(-limit);
}

function groupFinalDeck(
  deck: StartingDeckCard[],
  cardsById: Map<string, Card>,
  upgradedCardIds: Set<string>,
): SummaryDeckCard[] {
  const quantities = new Map<string, number>();

  deck.forEach((entry) => {
    if (!entry.cardId || entry.quantity <= 0) {
      return;
    }

    quantities.set(entry.cardId, (quantities.get(entry.cardId) ?? 0) + entry.quantity);
  });

  return [...quantities.entries()].map(([cardId, quantity]) => ({
    ...getEntityRef(cardId, cardsById, cardId),
    quantity,
    upgraded: upgradedCardIds.has(cardId) || undefined,
  }));
}

function groupCardChanges(
  changes: RunCardChangeRecord[],
  cardsById: Map<string, Card>,
) {
  return {
    gained: groupIdCounts(
      changes
        .filter((change) => change.kind === "gained")
        .flatMap((change) => Array.from({ length: change.quantity }, () => change.cardId)),
      cardsById,
    ),
    removed: groupIdCounts(
      changes
        .filter((change) => change.kind === "removed")
        .flatMap((change) => Array.from({ length: change.quantity }, () => change.cardId)),
      cardsById,
    ),
    upgraded: groupIdCounts(
      changes
        .filter((change) => change.kind === "upgraded")
        .flatMap((change) => Array.from({ length: change.quantity }, () => change.cardId)),
      cardsById,
    ),
  };
}

function groupIdCounts<T extends { id: string; name: string }>(
  ids: string[],
  lookup: Map<string, T>,
): SummaryCountedEntity[] {
  const quantities = new Map<string, number>();

  ids.forEach((id) => {
    if (id) {
      quantities.set(id, (quantities.get(id) ?? 0) + 1);
    }
  });

  return [...quantities.entries()].map(([id, quantity]) => ({
    ...getEntityRef(id, lookup, id),
    quantity,
  }));
}

function getEncounterPathIds(
  tracking: RunTrackingState,
  completedEncounterIds: string[],
  selectedEncounterId?: string,
) {
  const orderedIds = [
    ...tracking.encounterCompletions.map((entry) => entry.encounterId),
    ...completedEncounterIds,
    ...(selectedEncounterId ? [selectedEncounterId] : []),
  ];

  return uniqueStrings(orderedIds);
}

function getCombatVictories(
  completedEncounterIds: string[],
  encountersById: Map<string, Encounter>,
) {
  return completedEncounterIds.filter((encounterId) => {
    const encounter = encountersById.get(encounterId);

    return Boolean(encounter && encounter.enemyIds.length > 0);
  }).length;
}

function getEncounterRef(
  encounterId: string,
  encountersById: Map<string, Encounter>,
  completed: boolean,
  unresolved: boolean,
): SummaryEncounterRef {
  const encounter = encountersById.get(encounterId);

  return {
    ...getEntityRef(encounterId, encountersById, encounterId),
    isBoss: encounter?.nodeType === "Boss",
    status: completed ? "completed" : unresolved ? "unresolved" : "reached",
  };
}

function getEntityRef<T extends { id: string; name: string }>(
  id: string,
  lookup: Map<string, T>,
  fallbackName: string,
): CompactEntityRef {
  return {
    id,
    name: lookup.get(id)?.name ?? fallbackName,
  };
}

function sanitizeCardChange(value: unknown): RunCardChangeRecord | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const occurrenceKey = sanitizeString(value.occurrenceKey);
  const cardId = sanitizeString(value.cardId);
  const kind = value.kind;
  const quantity = sanitizePositiveInteger(value.quantity);
  const source = value.source;

  if (
    !occurrenceKey ||
    !cardId ||
    quantity <= 0 ||
    !(kind === "gained" || kind === "removed" || kind === "upgraded") ||
    !(source === "reward" || source === "mystery" || source === "rest" || source === "collection")
  ) {
    return undefined;
  }

  return {
    occurrenceKey,
    kind,
    cardId,
    quantity,
    encounterId: sanitizeString(value.encounterId),
    source,
  };
}

function sanitizeDecision(value: unknown): RunDecisionRecord | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const occurrenceKey = sanitizeString(value.occurrenceKey);
  const kind = value.kind;

  if (
    !occurrenceKey ||
    !(
      kind === "reward-card" ||
      kind === "reward-skip" ||
      kind === "memorial" ||
      kind === "memorial-skip" ||
      kind === "mystery" ||
      kind === "rest"
    )
  ) {
    return undefined;
  }

  return {
    occurrenceKey,
    kind,
    encounterId: sanitizeString(value.encounterId),
    choiceId: sanitizeString(value.choiceId),
    cardId: sanitizeString(value.cardId),
    memorialId: sanitizeString(value.memorialId),
  };
}

function sanitizeEncounterRecord(value: unknown): RunEncounterRecord | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const occurrenceKey = sanitizeString(value.occurrenceKey);
  const encounterId = sanitizeString(value.encounterId);

  return occurrenceKey && encounterId ? { occurrenceKey, encounterId } : undefined;
}

function sanitizeMemorialChange(value: unknown): RunMemorialChangeRecord | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const occurrenceKey = sanitizeString(value.occurrenceKey);
  const memorialId = sanitizeString(value.memorialId);

  return occurrenceKey && memorialId
    ? {
        occurrenceKey,
        memorialId,
        encounterId: sanitizeString(value.encounterId),
      }
    : undefined;
}

function sanitizeCountedEntities<T extends { id: string; name: string }>(
  value: unknown,
  lookup?: Map<string, T>,
): SummaryCountedEntity[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value
    .map((entry) => {
      if (!isRecord(entry)) {
        return undefined;
      }

      const id = sanitizeString(entry.id);
      const name = sanitizeString(entry.name) ?? id ?? "Unknown";
      const quantity = sanitizePositiveInteger(entry.quantity);

      if (!id || quantity <= 0) {
        return undefined;
      }

      return {
        ...getEntityRef(id, lookup ?? new Map(), name),
        quantity,
      };
    })
    .filter(isDefined)
    .slice(0, 80);
}

function sanitizeDeckSummary<T extends { id: string; name: string }>(
  value: unknown,
  lookup?: Map<string, T>,
): SummaryDeckCard[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value
    .map((entry) => {
      if (!isRecord(entry)) {
        return undefined;
      }

      const id = sanitizeString(entry.id);
      const name = sanitizeString(entry.name) ?? id ?? "Unknown";
      const quantity = sanitizePositiveInteger(entry.quantity);

      if (!id || quantity <= 0) {
        return undefined;
      }

      return {
        ...getEntityRef(id, lookup ?? new Map(), name),
        quantity,
        upgraded: entry.upgraded === true || undefined,
      };
    })
    .filter(isDefined)
    .slice(0, 80);
}

function sanitizeEncounterPath(
  value: unknown,
  lookup?: Map<string, Encounter>,
): SummaryEncounterRef[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value.map((entry) => sanitizeEncounterRef(entry, lookup)).filter(isDefined).slice(0, 60);
}

function sanitizeEncounterRef(
  value: unknown,
  lookup?: Map<string, Encounter>,
): SummaryEncounterRef | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const id = sanitizeString(value.id);
  const name = sanitizeString(value.name) ?? id ?? "Unknown Encounter";
  const status = value.status;

  if (!id || !(status === "completed" || status === "reached" || status === "unresolved")) {
    return undefined;
  }

  const encounter = lookup?.get(id);

  return {
    id,
    name: encounter?.name ?? name,
    isBoss: encounter?.nodeType === "Boss" || value.isBoss === true,
    status,
  };
}

function sanitizeEntityRef(
  value: unknown,
  fallbackId?: string,
  fallbackName = "Unknown",
): CompactEntityRef {
  if (!isRecord(value)) {
    return {
      id: fallbackId ?? "unknown",
      name: fallbackName,
    };
  }

  return {
    id: sanitizeString(value.id) ?? fallbackId ?? "unknown",
    name: sanitizeString(value.name) ?? fallbackName,
  };
}

function sanitizeDataStatus(value: unknown): FinalizedRunSummary["dataStatus"] {
  if (!isRecord(value)) {
    return {
      deckChanges: "unavailable",
      migrated: true,
    };
  }

  return {
    deckChanges: value.deckChanges === "complete" ? "complete" : "unavailable",
    migrated: value.migrated === true,
  };
}

function sanitizeOptionalResources(value: unknown): ResourceState | undefined {
  return isRecord(value) ? sanitizeResources(value) : undefined;
}

function sanitizeResources(value: unknown): ResourceState {
  const record = isRecord(value) ? value : {};

  return {
    authority: sanitizePositiveInteger(record.authority, 0),
    corruption: sanitizePositiveInteger(record.corruption, 0),
    faith: sanitizePositiveInteger(record.faith, 0),
    resolve: sanitizePositiveInteger(record.resolve, 0),
    wisdom: sanitizePositiveInteger(record.wisdom, 0),
  };
}

function sanitizeOutcome(value: unknown): FinalizedRunOutcome | undefined {
  return value === "completed" || value === "defeated" || value === "abandoned"
    ? value
    : undefined;
}

function mapLegacyOutcome(value: unknown): FinalizedRunOutcome | undefined {
  if (value === "victory" || value === "completed") {
    return "completed";
  }

  if (value === "defeat" || value === "defeated") {
    return "defeated";
  }

  if (value === "abandoned") {
    return "abandoned";
  }

  return undefined;
}

function createMalformedSummaryFallback(endedAt: string): FinalizedRunSummary {
  return {
    schemaVersion: finalizedRunSummarySchemaVersion,
    campaignId: "unknown",
    dataStatus: {
      deckChanges: "unavailable",
      migrated: true,
    },
    endedAt,
    hero: {
      id: "unknown",
      name: "Unknown",
    },
    outcome: "abandoned",
    runId: `malformed-${Date.parse(endedAt) || 0}`,
    runSeed: "DAVID-0000-0000",
  };
}

function uniqueStrings(values: string[]) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.trim()))];
}

function sanitizeString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function sanitizePositiveInteger(value: unknown, fallback = 0) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(0, Math.floor(value));
}

function sanitizeOptionalInteger(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return undefined;
  }

  return Math.max(0, Math.floor(value));
}

function sanitizeOptionalBoolean(value: unknown) {
  return typeof value === "boolean" ? value : undefined;
}

function sanitizeIsoDate(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  return Number.isNaN(Date.parse(value)) ? undefined : value;
}

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
