"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { cards } from "@/data/cards";
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
import { RewardScreen } from "@/game/screens/RewardScreen";
import { PrimaryButton } from "@/components/PrimaryButton";
import { applyMysteryChoice } from "@/game/mysteryEffects";
import { chooseMemorialRewards, chooseRewardCards } from "@/game/rewards";
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
  const [screen, setScreen] = useState<GameScreen>("home");
  const [runStarted, setRunStarted] = useState(false);
  const [selectedEncounterId, setSelectedEncounterId] = useState(encounters[0].id);
  const [activeCombatEncounterId, setActiveCombatEncounterId] = useState<string>();
  const [selectedMysteryEncounterId, setSelectedMysteryEncounterId] = useState(
    mysteryEncounters[0].id,
  );
  const [completedEncounterIds, setCompletedEncounterIds] = useState<string[]>([]);
  const [runDeck, setRunDeck] = useState<StartingDeckCard[]>([]);
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

  const selectedEncounter =
    encounters.find((encounter) => encounter.id === selectedEncounterId) ??
    encounters[0];
  const activeCombatEncounter = encounters.find(
    (encounter) => encounter.id === activeCombatEncounterId,
  );
  const selectedMysteryEncounter =
    mysteryEncounters.find((encounter) => encounter.id === selectedMysteryEncounterId) ??
    mysteryEncounters[0];

  function startRun() {
    setRunStarted(true);
    setScreen("map");
    setSelectedEncounterId(encounters[0].id);
    setActiveCombatEncounterId(undefined);
    setSelectedMysteryEncounterId(mysteryEncounters[0].id);
    setCompletedEncounterIds([]);
    setRunDeck(heroes[0].startingDeck);
    setRunResources(heroes[0].resourceState);
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

  function continueRun() {
    if (runStarted) {
      setScreen("map");
    }
  }

  function navigate(screenId: GameScreen) {
    setScreen(screenId);
  }

  function startEncounter(encounter: Encounter) {
    setSelectedEncounterId(encounter.id);
    setActiveCombatEncounterId(undefined);

    if (encounter.mysteryEncounterIds && encounter.mysteryEncounterIds.length > 0) {
      const mysteryIndex = Math.floor(Math.random() * encounter.mysteryEncounterIds.length);
      setSelectedMysteryEncounterId(encounter.mysteryEncounterIds[mysteryIndex]);
      setScreen("mystery");
      return;
    }

    if (encounter.enemyIds.length > 0) {
      setActiveCombatEncounterId(encounter.id);
      setScreen("combat");
    }
  }

  function completeEncounter(encounter: Encounter) {
    const runMemorials = getRunMemorials();

    setActiveCombatEncounterId(undefined);
    setCompletedEncounterIds((current) =>
      current.includes(encounter.id) ? current : [...current, encounter.id],
    );

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

      const nextMemorialRewards = chooseMemorialRewards(memorials, runMemorialIds, 3);

      if (nextMemorialRewards.length === 0) {
        setRewardCards(
          chooseRewardCards(getRewardPoolCards(), 3, Math.random, runDeck, runMemorials),
        );
        setScreen("reward");
        return;
      }

      setMemorialRewards(nextMemorialRewards);
      setScreen("memorial-reward");
      return;
    }

    if (encounter.nodeType === "Boss") {
      setScreen("map");
      return;
    }

    setRewardCards(
      chooseRewardCards(getRewardPoolCards(), 3, Math.random, runDeck, runMemorials),
    );
    setScreen("reward");
  }

  function addCardToRunDeck(cardId: string) {
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
  }

  function removeCardFromRunDeck(cardId: string) {
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
  }

  function addRewardCard(cardId: string) {
    addCardToRunDeck(cardId);
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
    setScreen("map");
  }

  function getRewardPoolCards() {
    return cards.filter((card) => rewardPoolCardIds.includes(card.id));
  }

  function getRunMemorials() {
    return memorials.filter((memorial) => runMemorialIds.includes(memorial.id));
  }

  function addMemorialReward(memorialId: string) {
    const nextMemorialIds = runMemorialIds.includes(memorialId)
      ? runMemorialIds
      : [...runMemorialIds, memorialId];
    const nextRunMemorials = memorials.filter((memorial) =>
      nextMemorialIds.includes(memorial.id),
    );

    setRunMemorialIds((current) =>
      current.includes(memorialId) ? current : [...current, memorialId],
    );
    setRewardCards(
      chooseRewardCards(getRewardPoolCards(), 3, Math.random, runDeck, nextRunMemorials),
    );
    setScreen("reward");
  }

  function skipMemorialReward() {
    setRewardCards(
      chooseRewardCards(getRewardPoolCards(), 3, Math.random, runDeck, getRunMemorials()),
    );
    setScreen("reward");
  }

  return (
    <AppShell currentScreen={screen} onNavigate={navigate}>
      {screen === "home" && (
        <HomeScreen
          hasRun={runStarted}
          onContinueRun={continueRun}
          onNavigate={navigate}
          onStartRun={() => setScreen("hero-select")}
        />
      )}
      {screen === "hero-select" && <HeroSelectScreen onStartRun={startRun} />}
      {screen === "map" &&
        (runStarted ? (
          <MapScreen
            completedEncounterIds={completedEncounterIds}
            onStartEncounter={startEncounter}
            revealedMapNodeCount={revealedMapNodeCount}
            runMemorials={getRunMemorials()}
            runResources={runResources}
            upgradedCardIds={upgradedCardIds}
          />
        ) : (
          <RunRequiredState
            body="Choose a covenant bearer before entering The Valley of the Giant."
            cta="Choose Hero"
            onAction={() => setScreen("hero-select")}
            title="No active run"
          />
        ))}
      {screen === "combat" && (
        runStarted && activeCombatEncounter ? (
          <CombatScreen
            encounter={activeCombatEncounter}
            key={activeCombatEncounter.id}
            onNavigate={navigate}
            onVictory={completeEncounter}
            runDeck={runDeck}
            runMemorials={getRunMemorials()}
            startingFaithBonus={startingFaithBonus}
          />
        ) : (
          <RunRequiredState
            body={
              runStarted
                ? "Select an available encounter from The Valley of the Giant before entering combat."
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
            body="Mystery encounters appear along The Valley of the Giant during a run."
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
            onSkip={() => setScreen("map")}
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
    </AppShell>
  );
}

function RunRequiredState({
  body,
  cta,
  onAction,
  title,
}: {
  body: string;
  cta: string;
  onAction: () => void;
  title: string;
}) {
  return (
    <div className="grid h-full min-h-0 place-items-center p-4">
      <GamePanel className="demo-empty-state">
        <p>War of the Watchers</p>
        <h2>{title}</h2>
        <span>{body}</span>
        <PrimaryButton onClick={onAction}>{cta}</PrimaryButton>
      </GamePanel>
    </div>
  );
}
