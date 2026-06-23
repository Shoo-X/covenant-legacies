"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useAudio } from "@/audio/useAudio";
import { cards } from "@/data/cards";
import { starterCampaign } from "@/data/campaigns";
import { codexEntries } from "@/data/codexEntries";
import { enemies } from "@/data/enemies";
import { encounters } from "@/data/encounters";
import { heroes } from "@/data/heroes";
import { memorials } from "@/data/memorials";
import { mysteryEncounters } from "@/data/mysteryEncounters";
import { CombatScreen } from "@/game/screens/CombatScreen";
import { CodexScreen } from "@/game/screens/CodexScreen";
import { CollectionScreen } from "@/game/screens/CollectionScreen";
import { GalleryScreen } from "@/game/screens/GalleryScreen";
import { GamePanel } from "@/components/GamePanel";
import { HeroSelectScreen } from "@/game/screens/HeroSelectScreen";
import { HomeScreen } from "@/game/screens/HomeScreen";
import { MapScreen } from "@/game/screens/MapScreen";
import { MemorialRewardScreen } from "@/game/screens/MemorialRewardScreen";
import { MysteryEncounterScreen } from "@/game/screens/MysteryEncounterScreen";
import { RestNodeScreen } from "@/game/screens/RestNodeScreen";
import { RewardScreen } from "@/game/screens/RewardScreen";
import { RunSummaryScreen } from "@/game/screens/RunSummaryScreen";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ModalSummaryFrame } from "@/components/DecisionPrimitives";
import { PillTag } from "@/components/UiPrimitives";
import { applyMysteryChoice } from "@/game/mysteryEffects";
import { screens } from "@/game/navigation";
import { createRng, createRunSeed, deriveSeed, normalizeSeed } from "@/game/random";
import { chooseMemorialRewards, chooseRewardCards } from "@/game/rewards";
import { applyRestChoice, type RestChoiceId } from "@/game/rest";
import {
  activeRunStorageKey,
  activeRunSchemaVersion,
  createCombatCheckpoint,
  createFinalizedRunSummary,
  createDefaultRunProfile,
  createNewActiveRun,
  getLastRunOutcome,
  getResumableRunScreen,
  recordRunOutcome,
  runProfileStorageKey,
  sanitizeActiveRunSave,
  sanitizeRunProfileSave,
  starterCampaignId,
  type ActiveRunSave,
  type ActiveRunScreen,
  type CombatCheckpoint,
  type RunLifecycleContent,
  type RunOutcome,
  type RunProfileSave,
} from "@/game/runLifecycle";
import {
  getNavigationDecision,
  type NavigationDecision,
  type NavigationRunPhase,
} from "@/game/navigationPolicy";
import {
  createEmptyRunTracking,
  recordCardChange,
  recordDecision,
  recordEncounterCompletion,
  recordMemorialChange,
  type RunTrackingState,
} from "@/game/runSummary";
import type {
  Card,
  Encounter,
  GameScreen,
  Memorial,
  MysteryEncounterChoice,
  ResourceState,
  StartingDeckCard,
} from "@/types/game";

const baseRewardPoolCardIds = cards
  .filter((card) => card.rarity !== "Mystery" && card.isPlayable !== false)
  .map((card) => card.id);

export function GameApp() {
  const { playMusic, playSound } = useAudio();
  const [screen, setScreen] = useState<GameScreen>("home");
  const [activeRunPhase, setActiveRunPhase] = useState<ActiveRunScreen>("map");
  const [persistenceReady, setPersistenceReady] = useState(false);
  const [persistenceNotice, setPersistenceNotice] = useState<string>();
  const [navigationNotice, setNavigationNotice] = useState<string>();
  const [pendingNavigation, setPendingNavigation] = useState<{
    decision: NavigationDecision;
    destination: GameScreen;
  }>();
  const [profile, setProfile] = useState<RunProfileSave>(createDefaultRunProfile);
  const [selectedSummaryRunId, setSelectedSummaryRunId] = useState<string>();
  const [activeRunId, setActiveRunId] = useState("");
  const [activeRunCreatedAt, setActiveRunCreatedAt] = useState("");
  const [combatCheckpoint, setCombatCheckpoint] = useState<CombatCheckpoint>();
  const [runSeed, setRunSeed] = useState(createRunSeed);
  const [isNewRunConfirmOpen, setIsNewRunConfirmOpen] = useState(false);
  const [isAbandonConfirmOpen, setIsAbandonConfirmOpen] = useState(false);
  const [isFinalizingRun, setIsFinalizingRun] = useState(false);
  const [runStarted, setRunStarted] = useState(false);
  const [selectedEncounterId, setSelectedEncounterId] = useState(encounters[0].id);
  const [activeCombatEncounterId, setActiveCombatEncounterId] = useState<string>();
  const [selectedMysteryEncounterId, setSelectedMysteryEncounterId] = useState(
    mysteryEncounters[0].id,
  );
  const [completedEncounterIds, setCompletedEncounterIds] = useState<string[]>([]);
  const [runDeck, setRunDeck] = useState<StartingDeckCard[]>([]);
  const [runHealth, setRunHealth] = useState(heroes[0].maxHealth);
  const [runResources, setRunResources] = useState<ResourceState>(
    heroes[0].resourceState,
  );
  const [rewardPoolCardIds, setRewardPoolCardIds] = useState(baseRewardPoolCardIds);
  const [unlockedCodexEntryIds, setUnlockedCodexEntryIds] = useState<string[]>([]);
  const [upgradedCardIds, setUpgradedCardIds] = useState<string[]>([]);
  const [revealedMapNodeCount, setRevealedMapNodeCount] = useState(0);
  const [hasFear, setHasFear] = useState(false);
  const [rewardCards, setRewardCards] = useState<Card[]>([]);
  const [runMemorialIds, setRunMemorialIds] = useState<string[]>([]);
  const [memorialRewards, setMemorialRewards] = useState<Memorial[]>([]);
  const [startingFaithBonus, setStartingFaithBonus] = useState(0);
  const [runTracking, setRunTracking] = useState<RunTrackingState>(() =>
    createEmptyRunTracking(true),
  );
  const combatResolutionRef = useRef<string | undefined>(undefined);
  const finalizingRunRef = useRef(false);
  const runActionSequenceRef = useRef(0);
  const resolvedRunActionKeysRef = useRef<Set<string>>(new Set());
  const lifecycleContent = useMemo<RunLifecycleContent>(
    () => ({
      baseRewardPoolCardIds,
      cards,
      codexEntryIds: codexEntries.map((entry) => entry.id),
      encounters,
      encounterIds: encounters.map((encounter) => encounter.id),
      firstEncounterId: encounters[0].id,
      firstMysteryEncounterId: mysteryEncounters[0].id,
      hero: heroes[0],
      memorials,
      mysteryEncounters,
    }),
    [],
  );

  const selectedEncounter =
    encounters.find((encounter) => encounter.id === selectedEncounterId) ??
    encounters[0];
  const activeCombatEncounter = encounters.find(
    (encounter) => encounter.id === activeCombatEncounterId,
  );
  const activeCombatIsReady = Boolean(
    activeCombatEncounter &&
      hasValidCombatEnemy(activeCombatEncounter) &&
      hasValidRunDeck(runDeck),
  );
  const selectedMysteryEncounter =
    mysteryEncounters.find((encounter) => encounter.id === selectedMysteryEncounterId) ??
    mysteryEncounters[0];
  const applyActiveRun = useCallback((run: ActiveRunSave) => {
    const resumeScreen = getResumableRunScreen(run);
    const checkpoint = resumeScreen === "combat" ? run.combatCheckpoint : undefined;
    setActiveRunId(run.runId);
    setActiveRunCreatedAt(run.createdAt);
    setCombatCheckpoint(checkpoint);
    setRunStarted(true);
    runActionSequenceRef.current = 0;
    resolvedRunActionKeysRef.current = new Set(
      run.runTracking.decisions.map((decision) => decision.occurrenceKey),
    );
    setActiveRunPhase(resumeScreen);
    setScreen(resumeScreen);
    setSelectedEncounterId(checkpoint?.encounterId ?? run.selectedEncounterId);
    setActiveCombatEncounterId(checkpoint?.encounterId);
    setSelectedMysteryEncounterId(run.selectedMysteryEncounterId);
    setCompletedEncounterIds(run.completedEncounterIds);
    setRunDeck(checkpoint?.runDeck ?? run.runDeck);
    setRunHealth(checkpoint?.runHealth ?? run.runHealth);
    setRunResources(checkpoint?.runResources ?? run.runResources);
    setRewardPoolCardIds(run.rewardPoolCardIds);
    setUnlockedCodexEntryIds(run.unlockedCodexEntryIds);
    setUpgradedCardIds(checkpoint?.upgradedCardIds ?? run.upgradedCardIds);
    setRevealedMapNodeCount(run.revealedMapNodeCount);
    setHasFear(run.hasFear);
    setRewardCards(
      run.pendingRewardCardIds
        .map((cardId) => cards.find((card) => card.id === cardId))
        .filter((card): card is Card => Boolean(card)),
    );
    setRunMemorialIds(checkpoint?.runMemorialIds ?? run.runMemorialIds);
    setRunSeed(checkpoint?.runSeed ?? run.runSeed);
    setRunTracking(run.runTracking);
    setMemorialRewards(
      run.pendingMemorialRewardIds
        .map((memorialId) =>
          memorials.find((memorial) => memorial.id === memorialId),
        )
        .filter((memorial): memorial is Memorial => Boolean(memorial)),
    );
    setStartingFaithBonus(checkpoint?.startingFaithBonus ?? run.startingFaithBonus);
  }, []);
  const activeRunSnapshot = useMemo<ActiveRunSave>(() => {
    const now = new Date().toISOString();

    return {
      schemaVersion: activeRunSchemaVersion,
      campaignId: starterCampaignId,
      combatCheckpoint,
      completedEncounterIds,
      createdAt: activeRunCreatedAt || now,
      currentScreen: activeRunPhase,
      hasFear,
      heroId: heroes[0].id,
      pendingMemorialRewardIds: memorialRewards.map((memorial) => memorial.id),
      pendingRewardCardIds: rewardCards.map((card) => card.id),
      revealedMapNodeCount,
      rewardPoolCardIds,
      runDeck,
      runHealth,
      runId: activeRunId || createRunId(),
      runMemorialIds,
      runResources,
      runSeed,
      runTracking,
      selectedEncounterId,
      selectedMysteryEncounterId,
      startingFaithBonus,
      unlockedCodexEntryIds,
      updatedAt: now,
      upgradedCardIds,
    };
  }, [
    activeRunCreatedAt,
    activeRunId,
    activeRunPhase,
    combatCheckpoint,
    completedEncounterIds,
    hasFear,
    memorialRewards,
    revealedMapNodeCount,
    rewardCards,
    rewardPoolCardIds,
    runDeck,
    runHealth,
    runMemorialIds,
    runResources,
    runSeed,
    runTracking,
    selectedEncounterId,
    selectedMysteryEncounterId,
    startingFaithBonus,
    unlockedCodexEntryIds,
    upgradedCardIds,
  ]);

  useEffect(() => {
    playMusic(getScreenMusicEvent(screen));
  }, [playMusic, screen]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const now = new Date().toISOString();
      const profileResult = sanitizeRunProfileSave(
        readJsonFromStorage(runProfileStorageKey),
        lifecycleContent,
      );
      const runResult = sanitizeActiveRunSave(
        readJsonFromStorage(activeRunStorageKey),
        lifecycleContent,
        now,
      );
      const issues = [
        ...profileResult.issues.filter((issue) => !issue.startsWith("No run profile")),
        ...runResult.issues.filter((issue) => !issue.startsWith("No active run")),
      ];

      setProfile(profileResult.profile);

      if (runResult.run) {
        applyActiveRun(runResult.run);
      }

      if (issues.length > 0) {
        setPersistenceNotice("Some saved run data was recovered safely.");
      }

      setPersistenceReady(true);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [applyActiveRun, lifecycleContent]);

  useEffect(() => {
    if (!persistenceReady) {
      return;
    }

    writeJsonToStorage(runProfileStorageKey, profile);

    if (!runStarted) {
      removeFromStorage(activeRunStorageKey);
      return;
    }

    writeJsonToStorage(activeRunStorageKey, activeRunSnapshot);
  }, [
    activeRunSnapshot,
    persistenceReady,
    profile,
    runStarted,
  ]);

  function startRun(seedOverride?: string) {
    if (runStarted) {
      setIsNewRunConfirmOpen(true);
      return;
    }

    startFreshRun(seedOverride);
  }

  function startFreshRun(seedOverride?: string) {
    const now = new Date().toISOString();
    const nextRun = createNewActiveRun(
      lifecycleContent,
      now,
      createRunId(),
      seedOverride ? normalizeSeed(seedOverride) : getRequestedRunSeed(),
    );

    combatResolutionRef.current = undefined;
    finalizingRunRef.current = false;
    setIsFinalizingRun(false);
    setSelectedSummaryRunId(undefined);
    setNavigationNotice(undefined);
    setPendingNavigation(undefined);
    applyActiveRun(nextRun);
    setRunStarted(true);
    setScreen("map");
    setIsNewRunConfirmOpen(false);
    setIsAbandonConfirmOpen(false);
  }

  function continueRun() {
    if (runStarted) {
      resumeActiveRun();
    }
  }

  function navigate(screenId: GameScreen) {
    const decision = getNavigationDecision({
      destination: screenId,
      hasCombatCheckpoint: Boolean(combatCheckpoint),
      runPhase: getCurrentRunPhase(),
      viewingHistoricalSummary: screen === "run-summary" && Boolean(selectedSummaryRunId),
    });

    if (decision.confirmation) {
      setPendingNavigation({ decision, destination: screenId });
      setNavigationNotice(undefined);
      return;
    }

    if (!decision.allowed) {
      playSound("ui.disabled");
      setNavigationNotice(decision.reason ?? "That route is unavailable right now.");
      return;
    }

    setNavigationNotice(undefined);
    setScreen(screenId);
  }

  function startEncounter(encounter: Encounter) {
    combatResolutionRef.current = undefined;
    setSelectedEncounterId(encounter.id);

    if (!canStartEncounter(encounter, completedEncounterIds)) {
      playSound("ui.disabled");
      return;
    }

    playSound(getCampaignNodeAudioEvent(encounter));

    if (encounter.nodeType === "Rest / Upgrade") {
      setCombatCheckpoint(undefined);
      setActiveCombatEncounterId(undefined);
      setActiveRunPhase("rest");
      setScreen("rest");
      return;
    }

    if (encounter.mysteryEncounterIds && encounter.mysteryEncounterIds.length > 0) {
      const mysteryRng = createRng(deriveSeed(runSeed, `mystery:${encounter.id}`));
      const mysteryIndex = mysteryRng.randomInt(0, encounter.mysteryEncounterIds.length);
      setCombatCheckpoint(undefined);
      setActiveCombatEncounterId(undefined);
      setSelectedMysteryEncounterId(encounter.mysteryEncounterIds[mysteryIndex]);
      setActiveRunPhase("mystery");
      setScreen("mystery");
      return;
    }

    if (encounter.enemyIds.length > 0) {
      if (!hasValidCombatEnemy(encounter) || !hasValidRunDeck(runDeck)) {
        setActiveCombatEncounterId(undefined);
        setActiveRunPhase("map");
        setScreen("map");
        return;
      }

      const now = new Date().toISOString();
      const nextCheckpoint = createCombatCheckpoint(activeRunSnapshot, encounter.id, now);
      const nextRun = {
        ...activeRunSnapshot,
        combatCheckpoint: nextCheckpoint,
        currentScreen: "combat" as const,
        selectedEncounterId: encounter.id,
        updatedAt: now,
      };

      writeJsonToStorage(activeRunStorageKey, nextRun);
      setCombatCheckpoint(nextCheckpoint);
      setActiveCombatEncounterId(encounter.id);
      setActiveRunPhase("combat");
      setScreen("combat");
    }
  }

  function completeEncounter(
    encounter: Encounter,
    remainingHealth?: number,
    finalResources?: ResourceState,
  ) {
    if (combatResolutionRef.current === encounter.id) {
      return;
    }

    combatResolutionRef.current = encounter.id;
    const runMemorials = getRunMemorials();
    const nextCompletedEncounterIds = completedEncounterIds.includes(encounter.id)
      ? completedEncounterIds
      : [...completedEncounterIds, encounter.id];
    const nextRunHealth =
      remainingHealth !== undefined ? Math.max(1, remainingHealth) : runHealth;
    const nextRunResources = finalResources
      ? {
          ...runResources,
          resolve: heroes[0].resourceState.resolve,
          corruption: finalResources.corruption,
        }
      : runResources;
    const nextRunTracking = recordEncounterCompletion(runTracking, encounter.id);

    setActiveCombatEncounterId(undefined);
    setCombatCheckpoint(undefined);
    if (remainingHealth !== undefined) {
      setRunHealth(nextRunHealth);
    }
    if (finalResources) {
      setRunResources(nextRunResources);
    }
    setCompletedEncounterIds(nextCompletedEncounterIds);
    setRunTracking(nextRunTracking);

    const postBattleCorruption = runMemorials.reduce(
      (total, memorial) => total + (memorial.effect.postBattleCorruption ?? 0),
      0,
    );

    if (postBattleCorruption > 0) {
      setRunResources((current) => ({
        ...current,
        corruption: current.corruption + postBattleCorruption,
      }));
    }

    if (encounter.nodeType === "Elite") {
      const eliteFaithBonus = runMemorials.reduce(
        (total, memorial) => total + (memorial.effect.eliteStartingFaithBonus ?? 0),
        0,
      );

      if (eliteFaithBonus > 0) {
        setStartingFaithBonus((current) => current + eliteFaithBonus);
      }

      const nextMemorialRewards = chooseMemorialRewards(
        memorials,
        runMemorialIds,
        3,
        createRng(deriveSeed(runSeed, `memorial:${encounter.id}`)).randomFloat,
      );

      if (nextMemorialRewards.length === 0) {
        setRewardCards(
          chooseRewardCards(
            getRewardPoolCards(),
            3,
            createRng(deriveSeed(runSeed, `reward:${encounter.id}:cards`)).randomFloat,
            runDeck,
            runMemorials,
          ),
        );
        setActiveRunPhase("reward");
        setScreen("reward");
        return;
      }

      setMemorialRewards(nextMemorialRewards);
      setActiveRunPhase("memorial-reward");
      setScreen("memorial-reward");
      return;
    }

    if (encounter.nodeType === "Boss") {
      finishRun("victory", {
        completedEncounterIds: nextCompletedEncounterIds,
        runHealth: nextRunHealth,
        runResources: nextRunResources,
        runTracking: nextRunTracking,
      });
      return;
    }

    setRewardCards(
      chooseRewardCards(
        getRewardPoolCards(),
        3,
        createRng(deriveSeed(runSeed, `reward:${encounter.id}:cards`)).randomFloat,
        runDeck,
        runMemorials,
      ),
    );
    setActiveRunPhase("reward");
    setScreen("reward");
  }

  function addCardToRunDeck(cardId: string) {
    const occurrenceKey = `collection:add:${activeRunId}:${cardId}:${nextRunActionSequence()}`;

    applyCardGain(cardId, "collection", occurrenceKey);
  }

  function applyCardGain(
    cardId: string,
    source: "reward" | "mystery" | "rest" | "collection",
    occurrenceKey: string,
    encounterId?: string,
  ) {
    setRunDeck((current) => {
      const existing = current.find((entry) => entry.cardId === cardId);

      if (existing) {
        return current.map((entry) =>
          entry.cardId === cardId
            ? { ...entry, quantity: entry.quantity + 1 }
            : entry,
        );
      }

      return [...current, { cardId, quantity: 1 }];
    });

    if (runStarted) {
      setRunTracking((current) =>
        recordCardChange(current, {
          occurrenceKey,
          kind: "gained",
          cardId,
          quantity: 1,
          encounterId,
          source,
        }),
      );
    }
  }

  function removeCardFromRunDeck(cardId: string) {
    const occurrenceKey = `collection:remove:${activeRunId}:${cardId}:${nextRunActionSequence()}`;
    const canRemove = runDeck.some(
      (entry) => entry.cardId === cardId && entry.quantity > 0,
    );

    setRunDeck((current) => {
      const existing = current.find((entry) => entry.cardId === cardId);

      if (!existing) {
        return current;
      }

      if (existing.quantity <= 1) {
        return current.filter((entry) => entry.cardId !== cardId);
      }

      return current.map((entry) =>
        entry.cardId === cardId
          ? { ...entry, quantity: entry.quantity - 1 }
          : entry,
      );
    });

    if (runStarted && canRemove) {
      setRunTracking((current) =>
        recordCardChange(current, {
          occurrenceKey,
          kind: "removed",
          cardId,
          quantity: 1,
          source: "collection",
        }),
      );
    }
  }

  function addRewardCard(cardId: string) {
    const rewardOccurrenceKey = `reward:${selectedEncounter.id}`;

    if (!claimRunAction(rewardOccurrenceKey)) {
      return;
    }

    playSound("card.play");
    applyCardGain(
      cardId,
      "reward",
      `${rewardOccurrenceKey}:card`,
      selectedEncounter.id,
    );
    setRunTracking((current) =>
      recordDecision(current, {
        occurrenceKey: rewardOccurrenceKey,
        kind: "reward-card",
        encounterId: selectedEncounter.id,
        cardId,
      }),
    );
    setRewardCards([]);
    setActiveRunPhase("map");
    setScreen("map");
  }

  function skipReward() {
    const rewardOccurrenceKey = `reward:${selectedEncounter.id}`;

    if (!claimRunAction(rewardOccurrenceKey)) {
      return;
    }

    setRunTracking((current) =>
      recordDecision(current, {
        occurrenceKey: rewardOccurrenceKey,
        kind: "reward-skip",
        encounterId: selectedEncounter.id,
      }),
    );
    setRewardCards([]);
    setActiveRunPhase("map");
    setScreen("map");
  }

  function resolveRestChoice(choiceId: RestChoiceId) {
    const resolution = applyRestChoice(
      {
        hasFear,
        maxHealth: heroes[0].maxHealth,
        runDeck,
        runHealth,
        runResources,
        upgradedCardIds,
      },
      choiceId,
      new Map(cards.map((card) => [card.id, card])),
    );
    playSound(getRestChoiceAudioEvent(choiceId));
    const gainedCardIds = getAddedCardIds(runDeck, resolution.state.runDeck);
    const upgradedIds = resolution.state.upgradedCardIds.filter(
      (cardId) => !upgradedCardIds.includes(cardId),
    );
    const restOccurrenceKey = `rest:${selectedEncounter.id}:${choiceId}`;

    if (!claimRunAction(restOccurrenceKey)) {
      return;
    }

    setRunHealth(resolution.state.runHealth);
    setRunDeck(resolution.state.runDeck);
    setRunResources(resolution.state.runResources);
    setUpgradedCardIds(resolution.state.upgradedCardIds);
    setHasFear(resolution.state.hasFear);
    setCompletedEncounterIds((current) =>
      current.includes(selectedEncounter.id)
        ? current
        : [...current, selectedEncounter.id],
    );
    setRunTracking((current) => {
      let next = recordDecision(current, {
        occurrenceKey: restOccurrenceKey,
        kind: "rest",
        encounterId: selectedEncounter.id,
        choiceId,
      });

      gainedCardIds.forEach((cardId, index) => {
        next = recordCardChange(next, {
          occurrenceKey: `${restOccurrenceKey}:gain:${cardId}:${index}`,
          kind: "gained",
          cardId,
          quantity: 1,
          encounterId: selectedEncounter.id,
          source: "rest",
        });
      });
      upgradedIds.forEach((cardId) => {
        next = recordCardChange(next, {
          occurrenceKey: `${restOccurrenceKey}:upgrade:${cardId}`,
          kind: "upgraded",
          cardId,
          quantity: 1,
          encounterId: selectedEncounter.id,
          source: "rest",
        });
      });

      return recordEncounterCompletion(next, selectedEncounter.id);
    });
    setActiveRunPhase("map");
    setScreen("map");
  }

  function resolveMysteryChoice(choice: MysteryEncounterChoice) {
    const resolution = applyMysteryChoice(
      {
        hasFear,
        revealedMapNodeCount,
        rewardPoolCardIds,
        runDeck,
        runResources,
        unlockedCodexEntryIds,
        upgradedCardIds,
      },
      choice,
    );
    playSound("ui.confirm");
    const gainedCardIds = getAddedCardIds(runDeck, resolution.state.runDeck);
    const upgradedIds = resolution.state.upgradedCardIds.filter(
      (cardId) => !upgradedCardIds.includes(cardId),
    );
    const mysteryOccurrenceKey = `mystery:${selectedEncounter.id}:${selectedMysteryEncounter.id}:${choice.id}`;

    if (!claimRunAction(mysteryOccurrenceKey)) {
      return;
    }

    setRunDeck(resolution.state.runDeck);
    setRunResources(resolution.state.runResources);
    setRewardPoolCardIds(resolution.state.rewardPoolCardIds);
    setUnlockedCodexEntryIds(resolution.state.unlockedCodexEntryIds);
    setUpgradedCardIds(resolution.state.upgradedCardIds);
    setRevealedMapNodeCount(resolution.state.revealedMapNodeCount);
    setHasFear(resolution.state.hasFear);
    setCompletedEncounterIds((current) =>
      current.includes(selectedEncounter.id)
        ? current
        : [...current, selectedEncounter.id],
    );
    setRunTracking((current) => {
      let next = recordDecision(current, {
        occurrenceKey: mysteryOccurrenceKey,
        kind: "mystery",
        encounterId: selectedEncounter.id,
        choiceId: choice.id,
      });

      gainedCardIds.forEach((cardId, index) => {
        next = recordCardChange(next, {
          occurrenceKey: `${mysteryOccurrenceKey}:gain:${cardId}:${index}`,
          kind: "gained",
          cardId,
          quantity: 1,
          encounterId: selectedEncounter.id,
          source: "mystery",
        });
      });
      upgradedIds.forEach((cardId) => {
        next = recordCardChange(next, {
          occurrenceKey: `${mysteryOccurrenceKey}:upgrade:${cardId}`,
          kind: "upgraded",
          cardId,
          quantity: 1,
          encounterId: selectedEncounter.id,
          source: "mystery",
        });
      });

      return recordEncounterCompletion(next, selectedEncounter.id);
    });
    setActiveRunPhase("map");
    setScreen("map");
  }

  function getRewardPoolCards() {
    return cards.filter((card) => rewardPoolCardIds.includes(card.id));
  }

  function getRunMemorials() {
    return memorials.filter((memorial) => runMemorialIds.includes(memorial.id));
  }

  function addMemorialReward(memorialId: string) {
    const memorialOccurrenceKey = `memorial:${selectedEncounter.id}`;

    if (!claimRunAction(memorialOccurrenceKey)) {
      return;
    }

    playSound("ui.confirm");
    const nextMemorialIds = runMemorialIds.includes(memorialId)
      ? runMemorialIds
      : [...runMemorialIds, memorialId];
    const nextRunMemorials = memorials.filter((memorial) =>
      nextMemorialIds.includes(memorial.id),
    );

    setRunMemorialIds((current) =>
      current.includes(memorialId) ? current : [...current, memorialId],
    );
    setRunTracking((current) =>
      recordDecision(
        recordMemorialChange(current, {
          occurrenceKey: memorialOccurrenceKey,
          memorialId,
          encounterId: selectedEncounter.id,
        }),
        {
          occurrenceKey: memorialOccurrenceKey,
          kind: "memorial",
          encounterId: selectedEncounter.id,
          memorialId,
        },
      ),
    );
    setRewardCards(
      chooseRewardCards(
        getRewardPoolCards(),
        3,
        createRng(
          deriveSeed(runSeed, `reward:${selectedEncounter.id}:memorial:${memorialId}`),
        ).randomFloat,
        runDeck,
        nextRunMemorials,
      ),
    );
    setActiveRunPhase("reward");
    setScreen("reward");
  }

  function skipMemorialReward() {
    const memorialOccurrenceKey = `memorial:${selectedEncounter.id}`;

    if (!claimRunAction(memorialOccurrenceKey)) {
      return;
    }

    setRunTracking((current) =>
      recordDecision(current, {
        occurrenceKey: memorialOccurrenceKey,
        kind: "memorial-skip",
        encounterId: selectedEncounter.id,
      }),
    );
    setRewardCards(
      chooseRewardCards(
        getRewardPoolCards(),
        3,
        createRng(deriveSeed(runSeed, `reward:${selectedEncounter.id}:memorial:skip`))
          .randomFloat,
        runDeck,
        getRunMemorials(),
      ),
    );
    setActiveRunPhase("reward");
    setScreen("reward");
  }

  function confirmNewRun() {
    finishRun("abandoned");
  }

  function confirmPendingNavigation() {
    if (!pendingNavigation) {
      return;
    }

    const destination = pendingNavigation.destination;

    setPendingNavigation(undefined);
    setNavigationNotice(undefined);

    if (destination === "hero-select" && runStarted) {
      finishRun("abandoned");
      return;
    }

    setScreen(destination);
  }

  function cancelPendingNavigation() {
    setPendingNavigation(undefined);
  }

  function abandonRun() {
    setIsAbandonConfirmOpen(true);
  }

  function confirmAbandonRun() {
    finishRun("abandoned");
  }

  function finishRun(
    outcome: RunOutcome,
    overrides: Partial<
      Pick<
        ActiveRunSave,
        | "combatCheckpoint"
        | "completedEncounterIds"
        | "currentScreen"
        | "runHealth"
        | "runResources"
        | "runTracking"
      >
    > = {},
  ) {
    if (!runStarted || finalizingRunRef.current) {
      setScreen("home");
      return;
    }

    finalizingRunRef.current = true;
    setIsFinalizingRun(true);
    const endedAt = new Date().toISOString();
    const activeRun = {
      ...activeRunSnapshot,
      combatCheckpoint: undefined,
      currentScreen: activeRunPhase,
      ...overrides,
      updatedAt: endedAt,
    };
    const nextSummary = createFinalizedRunSummary(
      activeRun,
      outcome,
      endedAt,
      lifecycleContent,
    );
    const nextProfile = recordRunOutcome(
      profile,
      activeRun,
      outcome,
      endedAt,
      lifecycleContent,
    );

    writeJsonToStorage(runProfileStorageKey, nextProfile);
    setProfile(nextProfile);
    setSelectedSummaryRunId(nextSummary.runId);
    clearActiveRunState();
    setScreen("run-summary");
    setIsNewRunConfirmOpen(false);
    setIsAbandonConfirmOpen(false);
    setIsFinalizingRun(false);
  }

  function clearActiveRunState() {
    combatResolutionRef.current = undefined;
    setActiveRunId("");
    setActiveRunCreatedAt("");
    setActiveRunPhase("map");
    setCombatCheckpoint(undefined);
    setRunStarted(false);
    setSelectedEncounterId(encounters[0].id);
    setActiveCombatEncounterId(undefined);
    setSelectedMysteryEncounterId(mysteryEncounters[0].id);
    setCompletedEncounterIds([]);
    setRunDeck([]);
    setRunHealth(heroes[0].maxHealth);
    setRunResources(heroes[0].resourceState);
    setRunSeed(createRunSeed());
    setRunTracking(createEmptyRunTracking(true));
    runActionSequenceRef.current = 0;
    resolvedRunActionKeysRef.current = new Set();
    setRewardPoolCardIds(baseRewardPoolCardIds);
    setUnlockedCodexEntryIds([]);
    setUpgradedCardIds([]);
    setRevealedMapNodeCount(0);
    setHasFear(false);
    setRewardCards([]);
    setRunMemorialIds([]);
    setMemorialRewards([]);
    setStartingFaithBonus(0);
  }

  const lastRunOutcome = getLastRunOutcome(profile);
  const selectedRunSummary =
    profile.runHistory.find((entry) => entry.runId === selectedSummaryRunId) ??
    lastRunOutcome;
  const currentNavigationRunPhase = getCurrentRunPhase();
  const navigationState = Object.fromEntries(
    screens.map((entry) => {
      const decision = getNavigationDecision({
        destination: entry.id,
        hasCombatCheckpoint: Boolean(combatCheckpoint),
        runPhase: currentNavigationRunPhase,
        viewingHistoricalSummary:
          screen === "run-summary" && Boolean(selectedSummaryRunId),
      });

      return [
        entry.id,
        {
          disabled: !decision.allowed && !decision.confirmation,
          reason: decision.reason,
        },
      ];
    }),
  );

  function nextRunActionSequence() {
    runActionSequenceRef.current += 1;

    return runActionSequenceRef.current;
  }

  function claimRunAction(occurrenceKey: string) {
    if (resolvedRunActionKeysRef.current.has(occurrenceKey)) {
      playSound("ui.disabled");
      return false;
    }

    resolvedRunActionKeysRef.current.add(occurrenceKey);
    return true;
  }

  function getCurrentRunPhase(): NavigationRunPhase {
    if (screen === "run-summary" && !runStarted) {
      return "summary";
    }

    if (!runStarted) {
      return "none";
    }

    return activeRunPhase;
  }

  function resumeActiveRun() {
    const resumeScreen = getResumableRunScreen(activeRunSnapshot);

    setNavigationNotice(undefined);
    setActiveRunPhase(resumeScreen);

    if (resumeScreen === "combat") {
      setActiveCombatEncounterId(combatCheckpoint?.encounterId);
    }

    setScreen(resumeScreen);
  }

  return (
    <AppShell
      currentScreen={screen}
      navigationState={navigationState}
      onNavigate={navigate}
    >
      {screen === "home" && (
        <HomeScreen
          hasRun={runStarted}
          lastRunOutcome={lastRunOutcome}
          onAbandonRun={abandonRun}
          onContinueRun={continueRun}
          onNavigate={navigate}
          onStartRun={() => setScreen("hero-select")}
          onViewLastRun={() => {
            if (lastRunOutcome) {
              setSelectedSummaryRunId(lastRunOutcome.runId);
              setScreen("run-summary");
            }
          }}
          persistenceNotice={persistenceNotice}
          runSeed={runStarted ? runSeed : undefined}
        />
      )}
      {screen === "hero-select" && <HeroSelectScreen onStartRun={startRun} />}
      {screen === "run-summary" && (
        <RunSummaryScreen
          onBeginNewSeed={() => startRun(createRunSeed())}
          onReplaySeed={(seed) => startRun(seed)}
          onReturnHome={() => setScreen("home")}
          summary={selectedRunSummary}
        />
      )}
      {screen === "map" &&
        (runStarted ? (
          <MapScreen
            completedEncounterIds={completedEncounterIds}
            heroDisplayName={heroes[0].shortName ?? heroes[0].name}
            maxRunHealth={heroes[0].maxHealth}
            onStartEncounter={startEncounter}
            revealedMapNodeCount={revealedMapNodeCount}
            runDeck={runDeck}
            runHealth={runHealth}
            runMemorials={getRunMemorials()}
            runResources={runResources}
            upgradedCardIds={upgradedCardIds}
          />
        ) : (
          <RunRequiredState
            body={`Choose David before entering ${starterCampaign.campaignName}. David's path begins at the valley mouth.`}
            context="The Valley of the Giant / 1 Samuel 17"
            cta="Choose Hero"
            onAction={() => setScreen("hero-select")}
            title="No active run"
          />
        ))}
      {screen === "combat" && (
        runStarted && activeCombatEncounter && activeCombatIsReady ? (
          <CombatScreen
            encounter={activeCombatEncounter}
            key={`${runSeed}:${activeCombatEncounter.id}`}
            onDefeat={(remainingHealth, finalResources) =>
              finishRun("defeat", {
                runHealth: remainingHealth,
                runResources: {
                  ...runResources,
                  corruption: finalResources.corruption,
                },
              })
            }
            onNavigate={navigate}
            onVictory={completeEncounter}
            runDeck={runDeck}
            runHealth={runHealth}
            runMemorials={getRunMemorials()}
            runResources={runResources}
            runSeed={runSeed}
            startingFaithBonus={startingFaithBonus}
            upgradedCardIds={upgradedCardIds}
          />
        ) : (
          <RunRequiredState
            body={
              runStarted
                ? `Select an available encounter from ${starterCampaign.campaignName} with a valid run deck before entering combat.`
                : "Start a run before entering combat."
            }
            cta={runStarted ? "Open Map" : "Choose Hero"}
            onAction={() => setScreen(runStarted ? "map" : "hero-select")}
            title="No battle selected"
          />
        )
      )}
      {screen === "memorial-reward" && (
        runStarted ? (
          <MemorialRewardScreen
            memorialRewards={memorialRewards}
            onChooseMemorial={addMemorialReward}
            onSkip={skipMemorialReward}
          />
        ) : (
          <RunRequiredState
            body="Memorial rewards appear after elite trials during a run."
            cta="Choose Hero"
            onAction={() => setScreen("hero-select")}
            title="No active run"
          />
        )
      )}
      {screen === "mystery" && (
        runStarted ? (
          <MysteryEncounterScreen
            encounter={selectedMysteryEncounter}
            onChoose={resolveMysteryChoice}
            runResources={runResources}
          />
        ) : (
          <RunRequiredState
            body={`Mystery encounters appear along ${starterCampaign.campaignName} during a run.`}
            cta="Choose Hero"
            onAction={() => setScreen("hero-select")}
            title="No active run"
          />
        )
      )}
      {screen === "rest" && (
        runStarted ? (
          <RestNodeScreen
            hasFear={hasFear}
            maxHealth={heroes[0].maxHealth}
            onChoose={resolveRestChoice}
            runDeck={runDeck}
            runHealth={runHealth}
            runResources={runResources}
            upgradedCardIds={upgradedCardIds}
          />
        ) : (
          <RunRequiredState
            body="Rest and upgrade choices appear during an active run."
            cta="Choose Hero"
            onAction={() => setScreen("hero-select")}
            title="No active run"
          />
        )
      )}
      {screen === "reward" && (
        runStarted && rewardCards.length > 0 ? (
          <RewardScreen
            onChooseCard={addRewardCard}
            onSkip={skipReward}
            rewardCards={rewardCards}
          />
        ) : (
          <RunRequiredState
            body="Card rewards appear after victorious encounters."
            cta={runStarted ? "Open Map" : "Choose Hero"}
            onAction={() => setScreen(runStarted ? "map" : "hero-select")}
            title="No reward available"
          />
        )
      )}
      {screen === "collection" && (
        <CollectionScreen
          onAddToDeck={addCardToRunDeck}
          onRemoveFromDeck={removeCardFromRunDeck}
          runDeck={runDeck}
        />
      )}
      {screen === "gallery" && <GalleryScreen />}
      {screen === "codex" && (
        <CodexScreen
          runMemorials={getRunMemorials()}
          unlockedCodexEntryIds={unlockedCodexEntryIds}
        />
      )}
      {navigationNotice && (
        <div className="game-route-notice" role="status" aria-live="polite">
          {navigationNotice}
        </div>
      )}
      {pendingNavigation?.decision.confirmation && (
        <ConfirmRunLifecycleModal
          body={pendingNavigation.decision.confirmation.body}
          confirmLabel={pendingNavigation.decision.confirmation.confirmLabel}
          disabled={isFinalizingRun}
          onCancel={cancelPendingNavigation}
          onConfirm={confirmPendingNavigation}
          title={pendingNavigation.decision.confirmation.title}
        />
      )}
      {isNewRunConfirmOpen && (
        <ConfirmRunLifecycleModal
          body="Starting again will close the current run, record it as abandoned, and open its run summary. Collection, Codex, Gallery, and audio settings remain intact."
          confirmLabel="Abandon and View Summary"
          disabled={isFinalizingRun}
          onCancel={() => setIsNewRunConfirmOpen(false)}
          onConfirm={confirmNewRun}
          title="Start a new run?"
        />
      )}
      {isAbandonConfirmOpen && (
        <ConfirmRunLifecycleModal
          body="This closes the active run and opens a run summary. Persistent profile history remains, but this run cannot be resumed."
          disabled={isFinalizingRun}
          confirmLabel="Abandon Run"
          onCancel={() => setIsAbandonConfirmOpen(false)}
          onConfirm={confirmAbandonRun}
          title="Abandon this run?"
        />
      )}
    </AppShell>
  );

}

function getAddedCardIds(
  previousDeck: StartingDeckCard[],
  nextDeck: StartingDeckCard[],
) {
  const previousQuantities = new Map(
    previousDeck.map((entry) => [entry.cardId, entry.quantity]),
  );
  const addedIds: string[] = [];

  nextDeck.forEach((entry) => {
    const addedQuantity = entry.quantity - (previousQuantities.get(entry.cardId) ?? 0);

    for (let index = 0; index < addedQuantity; index += 1) {
      addedIds.push(entry.cardId);
    }
  });

  return addedIds;
}

function getCampaignNodeAudioEvent(encounter: Encounter) {
  if (encounter.nodeType === "Rest / Upgrade") {
    return "campaign.nodeRest" as const;
  }

  if (encounter.mysteryEncounterIds?.length) {
    return "campaign.nodeMystery" as const;
  }

  if (encounter.nodeType === "Boss") {
    return "campaign.giantPresence" as const;
  }

  if (encounter.enemyIds.length > 0) {
    return "campaign.nodeBattle" as const;
  }

  return "campaign.nodeSelect" as const;
}

function createRunId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `run-${Date.now()}`;
}

function getRequestedRunSeed() {
  if (typeof window === "undefined") {
    return createRunSeed();
  }

  const requestedSeed = new URLSearchParams(window.location.search).get("seed");

  return requestedSeed ? normalizeSeed(requestedSeed) : createRunSeed();
}

function readJsonFromStorage(key: string) {
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    const stored = window.localStorage.getItem(key);

    return stored ? JSON.parse(stored) : undefined;
  } catch {
    return undefined;
  }
}

function writeJsonToStorage(key: string, value: unknown) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // A full or unavailable browser store should not interrupt play.
  }
}

function removeFromStorage(key: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch {
    // A failed cleanup is recoverable on the next sanitized load.
  }
}

function ConfirmRunLifecycleModal({
  body,
  confirmLabel,
  disabled = false,
  onCancel,
  onConfirm,
  title,
}: {
  body: string;
  confirmLabel: string;
  disabled?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
}) {
  return (
    <ModalSummaryFrame
      actions={
        <>
          <PrimaryButton disabled={disabled} onClick={onConfirm} tone="danger">
            {confirmLabel}
          </PrimaryButton>
          <PrimaryButton disabled={disabled} onClick={onCancel} tone="secondary">
            Keep Current Run
          </PrimaryButton>
        </>
      }
      eyebrow="Run Lifecycle"
      title={title}
      tone="defeat"
    >
      <p className="combat-result-note">{body}</p>
    </ModalSummaryFrame>
  );
}

function getScreenMusicEvent(screen: GameScreen) {
  if (screen === "combat") {
    return "music.combat" as const;
  }

  if (
    screen === "map" ||
    screen === "mystery" ||
    screen === "rest" ||
    screen === "reward" ||
    screen === "memorial-reward"
  ) {
    return "music.campaignMap" as const;
  }

  return "music.mainTheme" as const;
}

function getRestChoiceAudioEvent(choiceId: RestChoiceId) {
  if (choiceId === "upgrade" || choiceId === "remember") {
    return "campaign.nodeUpgrade" as const;
  }

  if (choiceId === "cleanse") {
    return "campaign.nodeCleanse" as const;
  }

  return "campaign.nodeRest" as const;
}

function canStartEncounter(
  encounter: Encounter,
  completedEncounterIds: string[],
) {
  if (completedEncounterIds.includes(encounter.id) || !hasEncounterAction(encounter)) {
    return false;
  }

  const encounterIndex = encounters.findIndex(
    (candidate) => candidate.id === encounter.id,
  );
  const previousPlayableEncounters = encounters
    .slice(0, Math.max(0, encounterIndex))
    .filter(hasEncounterAction);

  return previousPlayableEncounters.every((previousEncounter) =>
    completedEncounterIds.includes(previousEncounter.id),
  );
}

function hasEncounterAction(encounter: Encounter) {
  return (
    encounter.nodeType === "Rest / Upgrade" ||
    encounter.enemyIds.length > 0 ||
    Boolean(encounter.mysteryEncounterIds?.length)
  );
}

function hasValidCombatEnemy(encounter: Encounter) {
  return encounter.enemyIds.some((enemyId) =>
    enemies.some((enemy) => enemy.id === enemyId),
  );
}

function hasValidRunDeck(runDeck: StartingDeckCard[]) {
  return runDeck.some((entry) =>
    entry.quantity > 0 &&
    cards.some((card) => card.id === entry.cardId && card.isPlayable !== false),
  );
}

function RunRequiredState({
  body,
  context,
  cta,
  onAction,
  title,
}: {
  body: string;
  context?: string;
  cta: string;
  onAction: () => void;
  title: string;
}) {
  return (
    <div className="grid h-full min-h-0 place-items-center p-4">
      <GamePanel className="demo-empty-state">
        <p>{starterCampaign.campaignLabel}</p>
        <h2>{title}</h2>
        <span>{body}</span>
        {context && (
          <div className="demo-empty-context">
            <PillTag tone="gold">{context}</PillTag>
          </div>
        )}
        <PrimaryButton onClick={onAction}>{cta}</PrimaryButton>
      </GamePanel>
    </div>
  );
}
