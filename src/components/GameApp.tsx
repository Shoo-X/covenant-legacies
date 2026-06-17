"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { cards } from "@/data/cards";
import { encounters } from "@/data/encounters";
import { heroes } from "@/data/heroes";
import { memorials } from "@/data/memorials";
import { mysteryEncounters } from "@/data/mysteryEncounters";
import { LandingPage } from "@/components/LandingPage";
import { CombatScreen } from "@/game/screens/CombatScreen";
import { CodexScreen } from "@/game/screens/CodexScreen";
import { HeroSelectScreen } from "@/game/screens/HeroSelectScreen";
import { HomeScreen } from "@/game/screens/HomeScreen";
import { MapScreen } from "@/game/screens/MapScreen";
import { MemorialRewardScreen } from "@/game/screens/MemorialRewardScreen";
import { MysteryEncounterScreen } from "@/game/screens/MysteryEncounterScreen";
import { RewardScreen } from "@/game/screens/RewardScreen";
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
  const [hasStarted, setHasStarted] = useState(false);
  const [screen, setScreen] = useState<GameScreen>("home");
  const [selectedEncounterId, setSelectedEncounterId] = useState(encounters[0].id);
  const [selectedMysteryEncounterId, setSelectedMysteryEncounterId] = useState(
    mysteryEncounters[0].id,
  );
  const [completedEncounterIds, setCompletedEncounterIds] = useState<string[]>([]);
  const [runDeck, setRunDeck] = useState<StartingDeckCard[]>(heroes[0].startingDeck);
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
  const selectedMysteryEncounter =
    mysteryEncounters.find((encounter) => encounter.id === selectedMysteryEncounterId) ??
    mysteryEncounters[0];

  function startEncounter(encounter: Encounter) {
    setSelectedEncounterId(encounter.id);

    if (encounter.mysteryEncounterIds && encounter.mysteryEncounterIds.length > 0) {
      const mysteryIndex = Math.floor(Math.random() * encounter.mysteryEncounterIds.length);
      setSelectedMysteryEncounterId(encounter.mysteryEncounterIds[mysteryIndex]);
      setScreen("mystery");
      return;
    }

    if (encounter.enemyIds.length > 0) {
      setScreen("combat");
    }
  }

  function completeEncounter(encounter: Encounter) {
    const runMemorials = getRunMemorials();

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

  function addRewardCard(cardId: string) {
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

  if (!hasStarted) {
    return (
      <LandingPage
        onOpenCodex={() => {
          setHasStarted(true);
          setScreen("codex");
        }}
        onStart={() => {
          setHasStarted(true);
          setScreen("hero-select");
        }}
      />
    );
  }

  return (
    <AppShell currentScreen={screen} onNavigate={setScreen}>
      {screen === "home" && <HomeScreen onNavigate={setScreen} />}
      {screen === "hero-select" && <HeroSelectScreen onNavigate={setScreen} />}
      {screen === "map" && (
        <MapScreen
          completedEncounterIds={completedEncounterIds}
          onStartEncounter={startEncounter}
          revealedMapNodeCount={revealedMapNodeCount}
          runMemorials={getRunMemorials()}
          runResources={runResources}
          upgradedCardIds={upgradedCardIds}
        />
      )}
      {screen === "combat" && (
        <CombatScreen
          encounter={selectedEncounter}
          key={selectedEncounter.id}
          onNavigate={setScreen}
          onVictory={completeEncounter}
          runDeck={runDeck}
          runMemorials={getRunMemorials()}
          startingFaithBonus={startingFaithBonus}
        />
      )}
      {screen === "memorial-reward" && (
        <MemorialRewardScreen
          memorialRewards={memorialRewards}
          onChooseMemorial={addMemorialReward}
          onSkip={skipMemorialReward}
        />
      )}
      {screen === "mystery" && (
        <MysteryEncounterScreen
          encounter={selectedMysteryEncounter}
          onChoose={resolveMysteryChoice}
          runResources={runResources}
        />
      )}
      {screen === "reward" && (
        <RewardScreen
          onChooseCard={addRewardCard}
          onSkip={() => setScreen("map")}
          rewardCards={rewardCards}
        />
      )}
      {screen === "codex" && (
        <CodexScreen
          runMemorials={getRunMemorials()}
          unlockedCodexEntryIds={unlockedCodexEntryIds}
        />
      )}
    </AppShell>
  );
}
