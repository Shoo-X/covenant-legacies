"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { cards } from "@/data/cards";
import { enemies } from "@/data/enemies";
import { heroes } from "@/data/heroes";
import { CollectibleCard } from "@/components/CollectibleCard";
import { GamePanel } from "@/components/GamePanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import {
  getResourceBarTooltip,
  ResourceBadge,
  resourceOrder,
  resourceVisuals,
} from "@/components/ResourceBadge";
import { ScreenFrame } from "@/components/ScreenFrame";
import { SymbolicArt } from "@/components/SymbolicArt";
import {
  getCombatPresentationDelay,
  getEnemyIntentDetails,
  shouldAutoAdvanceCombatPresentation,
} from "@/game/combat/actionQueue";
import {
  combatReducer,
  createCombatState,
  getCardAffordability,
} from "@/game/combat/engine";
import { hasCardEffectType } from "@/game/combat/effectResolver";
import { getUpgradedCombatCard } from "@/game/cardUpgrades";
import { getEnemyEncounterPresentation } from "@/game/combat/enemyPatterns";
import { getCorruptionThreshold } from "@/game/corruption";
import type {
  CombatAction,
  CombatCardInstance,
  CombatFeedback,
  CombatFeedbackKind,
  CombatPhase,
  QueuedCombatAction,
} from "@/game/combat/types";
import type {
  Card,
  Enemy,
  Encounter,
  GameScreen,
  Memorial,
  ResourceName,
  ResourceState,
  StartingDeckCard,
} from "@/types/game";

interface CombatScreenProps {
  encounter: Encounter;
  onNavigate: (screen: GameScreen) => void;
  onVictory: (
    encounter: Encounter,
    remainingHealth: number,
    resources: ResourceState,
  ) => void;
  runDeck: StartingDeckCard[];
  runHealth: number;
  runMemorials: Memorial[];
  runResources: ResourceState;
  startingFaithBonus: number;
  upgradedCardIds: string[];
}

const feedbackTone: Record<CombatFeedbackKind, string> = {
  damage: "border-[rgba(159,61,40,0.45)] text-[#ffd7c9]",
  guard: "border-[rgba(215,180,93,0.4)] text-[#fff3cf]",
  resource: "border-[rgba(86,100,132,0.55)] text-[#dce6ff]",
  draw: "border-[rgba(203,185,143,0.32)] text-[rgba(241,228,194,0.78)]",
  enemy: "border-[rgba(159,61,40,0.5)] text-[#ffcab8]",
  system: "border-[rgba(215,180,93,0.24)] text-[rgba(241,228,194,0.7)]",
};

type CombatCueTone = "attack" | "guard" | "prayer" | "forbidden" | "mystery";
type CombatCueTarget = "enemy" | "player" | "center";

interface PlayedCue {
  cardName: string;
  id: string;
  target: CombatCueTarget;
  tone: CombatCueTone;
}

export function CombatScreen({
  encounter,
  onNavigate,
  onVictory,
  runDeck,
  runHealth,
  runMemorials,
  runResources,
  startingFaithBonus,
  upgradedCardIds,
}: CombatScreenProps) {
  const hero = heroes[0];
  const enemy =
    enemies.find((candidate) => candidate.id === encounter.enemyIds[0]) ?? enemies[0];
  const combatCards = useMemo(
    () => cards.map((card) => getUpgradedCombatCard(card, upgradedCardIds)),
    [upgradedCardIds],
  );
  const cardsById = useMemo(
    () => new Map(combatCards.map((card) => [card.id, card])),
    [combatCards],
  );
  const cueIdRef = useRef(0);
  const [selectedCardId, setSelectedCardId] = useState<string>();
  const [playedCue, setPlayedCue] = useState<PlayedCue>();
  const [hasSeenEncounterIntro, setHasSeenEncounterIntro] = useState(() =>
    hasStoredEncounterIntro(enemy.id),
  );
  const [combat, setCombat] = useState(() =>
    createCombatState(
      hero,
      enemy,
      cardsById,
      Math.random,
      runDeck,
      runMemorials,
      startingFaithBonus,
      runResources,
      runHealth,
    ),
  );
  const corruptionThreshold = getCorruptionThreshold(combat.resources.corruption);
  const intentDetails = getEnemyIntentDetails(combat);
  const encounterPresentation = getEnemyEncounterPresentation(enemy.id);
  const prefersReducedMotion = usePrefersReducedMotion();
  const isPlayerInputLocked =
    combat.status !== "active" || combat.phase !== "PlayerMain";
  const isHighDangerIntent = getIsHighDangerIntent(intentDetails);
  const hasLowGuardForIntent =
    isHighDangerIntent &&
    intentDetails.expectedDamage > 0 &&
    combat.player.guard < intentDetails.expectedDamage;
  const phaseBanner = getCombatPhaseBanner(combat.phase);
  const lastResolvedAction = combat.lastResolvedAction;
  const shouldAutoAdvancePresentation = shouldAutoAdvanceCombatPresentation(combat);
  const presentationDelay = getCombatPresentationDelay(
    combat.phase,
    combat.activeAction,
    prefersReducedMotion,
  );
  const presentationStepKey = `${combat.status}-${combat.phase}-${
    combat.activeAction?.id ?? "idle"
  }-${combat.actionQueue.length}`;

  function dispatch(action: CombatAction) {
    setCombat((current) =>
      combatReducer(current, action, {
        cardsById,
        random: Math.random,
      }),
    );
  }

  useEffect(() => {
    if (!shouldAutoAdvancePresentation) {
      return;
    }

    if (combat.phase === "BattleIntro" && !hasSeenEncounterIntro) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setCombat((current) =>
        combatReducer(
          current,
          { type: "advance-presentation" },
          {
            cardsById,
            random: Math.random,
          },
        ),
      );
    }, presentationDelay);

    return () => window.clearTimeout(timeout);
  }, [
    cardsById,
    combat.phase,
    hasSeenEncounterIntro,
    presentationDelay,
    presentationStepKey,
    shouldAutoAdvancePresentation,
  ]);

  function enterBattle() {
    setHasSeenEncounterIntro(true);
    storeEncounterIntro(enemy.id);
    dispatch({ type: "advance-presentation" });
  }

  function playCard(instanceId: string) {
    if (isPlayerInputLocked) {
      return;
    }

    const card = cardsById.get(
      combat.hand.find((instance) => instance.instanceId === instanceId)?.cardId ?? "",
    );

    if (card) {
      const affordability = getCardAffordability(combat, card);

      if (!affordability.canPay) {
        setSelectedCardId(instanceId);
        dispatch({
          type: "play-card",
          instanceId,
        });
        return;
      }

      cueIdRef.current += 1;
      setPlayedCue({
        cardName: card.name,
        id: `${instanceId}-${combat.feedback.length + 1}-${cueIdRef.current}`,
        target: getCardCueTarget(card),
        tone: getCardCueTone(card),
      });
    }

    setSelectedCardId(instanceId);
    dispatch({
      type: "play-card",
      instanceId,
    });
  }

  const handCards = combat.hand
    .map((instance) => ({
      instance,
      card: cardsById.get(instance.cardId),
    }))
    .filter((entry): entry is { instance: CombatCardInstance; card: Card } =>
      Boolean(entry.card),
    );
  const selectedHandEntry = handCards.find(
    ({ instance }) => instance.instanceId === selectedCardId,
  );
  const selectedHandCard = selectedHandEntry?.card;
  const selectedHandAffordability = selectedHandCard
    ? getCardAffordability(combat, selectedHandCard)
    : undefined;

  const latestFeedback = [...combat.feedback].slice(-8).reverse();
  const feedbackByNewest = [...combat.feedback].reverse();
  const latestEnemyDamageFeedback = feedbackByNewest.find(
    (item) => item.kind === "damage" && item.message.includes("enemy health"),
  );
  const latestPlayerDamageFeedback = feedbackByNewest.find(
    (item) => item.kind === "damage" && item.message.includes("Player loses"),
  );
  const latestGuardFeedback = feedbackByNewest.find(
    (item) => item.kind === "guard" && !item.message.includes("Healed"),
  );
  const latestHealingFeedback = feedbackByNewest.find((item) =>
    item.message.includes("Healed"),
  );
  const latestPlayerFeedback = latestHealingFeedback ?? latestGuardFeedback;
  const latestResourceFeedback = feedbackByNewest.find(
    (item) => item.kind === "resource",
  );
  const latestPrayerFeedback =
    feedbackByNewest.find(
      (item) =>
        item.kind === "draw" ||
        item.message.includes("Fear removed") ||
        item.message.includes("Prayer") ||
        item.message.includes("Corruption"),
    ) ?? latestResourceFeedback;
  const battlefieldFeedback = [...combat.feedback]
    .filter((item) => item.kind === "damage" || item.kind === "guard")
    .slice(-3)
    .reverse();

  return (
    <ScreenFrame>
      <div className="combat-board-grid">
        <section className="combat-main-board" aria-label="Combat board">
          <GamePanel className="combat-enemy-zone">
            <div className="combat-portrait combat-portrait-enemy">
              {enemy.imagePath ? (
                <CombatArtPortrait
                  alt={enemy.artworkTitle ?? enemy.name}
                  imagePath={enemy.imagePath}
                  objectPosition={enemy.imageObjectPosition}
                  sizes="96px"
                />
              ) : (
                <SymbolicArt kind="enemy" subject={enemy} variant="portrait" />
              )}
              {latestEnemyDamageFeedback && (
                <span
                  className="combat-portrait-hit-flash"
                  key={`enemy-hit-${latestEnemyDamageFeedback.id}`}
                />
              )}
              {combat.activeAction?.actor === "Enemy" && (
                <span
                  className="combat-enemy-action-flash"
                  key={`enemy-action-${combat.activeAction.id}`}
                />
              )}
            </div>

            <div className="min-w-0">
              <p className="text-[0.65rem] uppercase tracking-[0.24em] text-[var(--color-gold)]">
                {enemy.title}
              </p>
              <h2 className="mt-1 truncate text-2xl font-black leading-tight text-[#fff3cf]">
                {enemy.name}
              </h2>
              <Meter
                current={combat.enemyState.health}
                label="Enemy Health"
                max={combat.enemyState.maxHealth}
                tone="enemy"
              />
            </div>

            <div
              className={`combat-intent-panel combat-intent-${intentDetails.iconTone} ${
                combat.phase === "EnemyTurnStart" || combat.phase === "EnemyActing"
                  ? "combat-intent-active"
                  : ""
              } ${isHighDangerIntent ? "combat-intent-high-danger" : ""}`}
            >
              <span className="combat-intent-icon" aria-hidden="true" />
              <div className="combat-intent-copy">
                <p>Intent</p>
                <h3>{intentDetails.actionName}</h3>
                <span>
                  {intentDetails.intentType} - {intentDetails.summary}
                </span>
              </div>
            </div>

            <div className="combat-chip-bank">
              {enemy.traits.map((trait) => (
                <Chip key={trait} label={trait} tone="gold" />
              ))}
              <Chip label={`Might ${combat.enemyState.might}`} tone="crimson" />
              {combat.enemyState.guard > 0 && (
                <Chip label={`Guard ${combat.enemyState.guard}`} tone="blue" />
              )}
              {combat.hasFear && <Chip label="Fear" tone="violet" />}
              {combat.bossPhase > 0 && (
                <Chip label={`Phase ${combat.bossPhase}`} tone="crimson" />
              )}
            </div>
          </GamePanel>

            <div
              className={`combat-battlefield-zone combat-battlefield-${getBattlefieldTone(
                combat.phase,
              )}`}
            >
            <div className="combat-valley-bg" aria-hidden="true" />
            <div className="combat-high-place-bg" aria-hidden="true" />
            <div className="combat-battlefield-glow" aria-hidden="true" />
            {phaseBanner && (
              <div className={`combat-turn-banner combat-turn-${phaseBanner.tone}`}>
                <p>{phaseBanner.title}</p>
                <span>{phaseBanner.subtitle}</span>
              </div>
            )}
            {combat.activeAction && (
              <div
                className={`combat-action-title combat-action-${combat.activeAction.presentation} ${
                  getIsHighDangerIntent(combat.activeAction)
                    ? "combat-action-high-danger"
                    : ""
                }`}
                key={`active-action-${combat.activeAction.id}`}
              >
                <p>{combat.activeAction.intentType}</p>
                <strong>{combat.activeAction.actionName}</strong>
                <span>{formatQueuedActionSummary(combat.activeAction)}</span>
              </div>
            )}
            {playedCue && (
              <div
                className={`combat-played-card-cue combat-played-card-${playedCue.tone} combat-played-card-to-${playedCue.target}`}
                key={playedCue.id}
              >
                <span>{playedCue.cardName}</span>
              </div>
            )}
            {!phaseBanner && combat.bossPhase > 1 && (
              <div className="combat-phase-banner">
                <p>Boss Phase {combat.bossPhase}</p>
                <span>
                  {combat.bossPhase >= 3
                    ? "Shadow of the Watchers answers Corruption."
                    : "Fear pressure rises from the high place."}
                </span>
              </div>
            )}
            {latestEnemyDamageFeedback && (
              <CombatPopup
                feedback={latestEnemyDamageFeedback}
                key={`damage-${latestEnemyDamageFeedback.id}`}
                tone="damage"
              />
            )}
            {lastResolvedAction?.blockedValue ? (
              <ActionPopup
                key={`blocked-${lastResolvedAction.id}`}
                label={`${lastResolvedAction.blockedValue} Blocked`}
                tone="block"
              />
            ) : null}
            {lastResolvedAction?.hpDamage ? (
              <ActionPopup
                key={`hp-${lastResolvedAction.id}`}
                label={`-${lastResolvedAction.hpDamage} Health`}
                tone="hit"
              />
            ) : null}
            {lastResolvedAction?.mightChange ? (
              <ActionPopup
                key={`might-${lastResolvedAction.id}`}
                label={`+${lastResolvedAction.mightChange} Might`}
                tone="status"
              />
            ) : null}
            {latestPlayerFeedback && (
              <CombatPopup
                feedback={latestPlayerFeedback}
                key={`player-${latestPlayerFeedback.id}`}
                tone={latestHealingFeedback ? "heal" : "guard"}
              />
            )}
            <div className="combat-field-slot combat-field-slot-left">
              <p>Attack Effects</p>
              {(latestEnemyDamageFeedback ?? battlefieldFeedback[0]) && (
                <span className="combat-float-number">
                  {(latestEnemyDamageFeedback ?? battlefieldFeedback[0])?.message}
                </span>
              )}
            </div>
            <div className="combat-confrontation-line" aria-hidden="true" />
            <div className="combat-field-slot combat-field-slot-center">
              <p>Prayer / Covenant</p>
              {latestPrayerFeedback && (
                <span className="combat-float-number combat-float-prayer">
                  {latestPrayerFeedback.message}
                </span>
              )}
            </div>
            <div className="combat-field-slot combat-field-slot-right">
              <p>Altar / Structure</p>
              {(latestGuardFeedback ?? battlefieldFeedback[1]) && (
                <span className="combat-float-number">
                  {(latestGuardFeedback ?? battlefieldFeedback[1])?.message}
                </span>
              )}
            </div>
            <div className="combat-field-caption">
              Turn {combat.turn} / {formatCombatPhase(combat.phase)}
            </div>
          </div>

          <GamePanel
            className={`combat-player-zone ${
              latestGuardFeedback ? "combat-player-guard-pulse" : ""
            } ${latestHealingFeedback ? "combat-player-heal-pulse" : ""} ${
              latestPlayerDamageFeedback || lastResolvedAction?.hpDamage
                ? "combat-player-hit-pulse"
                : ""
            }`}
          >
            <div className="combat-player-identity">
              {hero.imagePath && (
                <div className="combat-portrait combat-portrait-player">
                  <CombatArtPortrait
                    alt={hero.artworkTitle ?? hero.name}
                    imagePath={hero.imagePath}
                    objectPosition={hero.imageObjectPosition}
                    sizes="72px"
                  />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-[0.65rem] uppercase tracking-[0.24em] text-[var(--color-gold)]">
                  Champion
                </p>
                <h3 className="mt-1 truncate text-xl font-black text-[#fff3cf]">
                  {hero.name}
                </h3>
                <Meter
                  current={combat.player.health}
                  label="Player Health"
                  max={combat.player.maxHealth}
                  tone="player"
                />
              </div>
            </div>

            <div className="combat-player-stats">
              <Stat
                isChanged={Boolean(latestGuardFeedback || latestHealingFeedback)}
                key={`guard-${latestGuardFeedback?.id ?? latestHealingFeedback?.id ?? "stable"}`}
                label="Guard"
                value={combat.player.guard}
                tone="blue"
              />
              <Stat label="Draw" value={combat.drawPile.length} />
              <Stat label="Discard" value={combat.discardPile.length} />
            </div>

            <div className="combat-resource-bank">
              {resourceOrder.map((resource) => (
                <ResourcePip
                  isChanged={Boolean(
                    latestResourceFeedback?.message
                      .toLowerCase()
                      .includes(resource.toLowerCase()),
                  )}
                  key={`${resource}-${
                    latestResourceFeedback?.message
                      .toLowerCase()
                      .includes(resource.toLowerCase())
                      ? latestResourceFeedback.id
                      : "stable"
                  }`}
                  resource={resource}
                  thresholdName={
                    resource === "Corruption" ? corruptionThreshold.name : undefined
                  }
                  value={combat.resources[resourceVisuals[resource].key]}
                />
              ))}
            </div>

            <div className="combat-memorial-bank">
              {combat.hasFear && <Chip label="Fear" tone="violet" />}
              {combat.playerStatuses.map((status) => (
                <Chip key={status} label={status} tone="blue" />
              ))}
              {combat.memorials.length === 0 && !combat.hasFear && combat.playerStatuses.length === 0 ? (
                <Chip label="No Memorials" tone="muted" />
              ) : (
                combat.memorials.map((memorial) => (
                  <Chip key={memorial.id} label={memorial.name} tone="gold" />
                ))
              )}
            </div>

            {(latestGuardFeedback || latestHealingFeedback) && (
              <span
                className="combat-player-feedback-ring"
                key={`player-ring-${
                  latestGuardFeedback?.id ?? latestHealingFeedback?.id
                }`}
              />
            )}
          </GamePanel>

          <GamePanel className="combat-hand-tray">
            <div className="combat-hand-header">
              <p>Hand</p>
              <span>{handCards.length} cards</span>
            </div>
            {selectedHandCard && (
              <div className="combat-hand-inspector" aria-live="polite">
                <CollectibleCard
                  affordabilityNote={selectedHandAffordability?.missingSummary}
                  as="article"
                  card={selectedHandCard}
                  costs={selectedHandAffordability?.costs}
                  missingCosts={selectedHandAffordability?.missingCosts}
                  size="inspect"
                />
              </div>
            )}
            <div className="combat-hand-scroll" aria-label="Card hand">
              {handCards.map(({ instance, card }) => {
                const affordability = getCardAffordability(combat, card);
                const playable = affordability.canPay && !isPlayerInputLocked;

                return (
                  <CollectibleCard
                    affordabilityNote={affordability.missingSummary}
                    card={card}
                    costs={affordability.costs}
                    isPlayable={playable}
                    isSelected={selectedCardId === instance.instanceId}
                    key={instance.instanceId}
                    missingCosts={affordability.missingCosts}
                    onBlur={() => setSelectedCardId(undefined)}
                    onFocus={() => setSelectedCardId(instance.instanceId)}
                    onMouseEnter={() => setSelectedCardId(instance.instanceId)}
                    onMouseLeave={() => setSelectedCardId(undefined)}
                    onClick={() => playCard(instance.instanceId)}
                    size="hand"
                  />
                );
              })}
            </div>
          </GamePanel>
        </section>

        <aside className="combat-command-rail" aria-label="Combat command rail">
          <GamePanel className="combat-actions-panel">
            <p className="text-[0.65rem] uppercase tracking-[0.22em] text-[var(--color-gold)]">
              Command
            </p>
            <PrimaryButton
              disabled={isPlayerInputLocked}
              onClick={() => dispatch({ type: "end-turn" })}
            >
              End Turn
            </PrimaryButton>
            {combat.phase === "PlayerMain" && hasLowGuardForIntent && (
              <p className="combat-end-turn-warning">
                Warning: {intentDetails.actionName} can break through current Guard.
              </p>
            )}
            {combat.status === "active" && (
              <PrimaryButton
                disabled={isPlayerInputLocked}
                onClick={() => onNavigate("map")}
                tone="secondary"
              >
                Return to Map
              </PrimaryButton>
            )}
          </GamePanel>

          <GamePanel className="combat-log-panel" scroll>
            <div className="combat-log-header">
              <p>Battle Record</p>
              <span>Latest</span>
            </div>
            <div className="mt-2 space-y-2">
              {latestFeedback.map((item, index) => (
                <p
                  className={`combat-feedback-pop ${
                    index === 0 ? "combat-log-entry-latest" : ""
                  } rounded-sm border bg-[rgba(255,255,255,0.035)] px-3 py-2 text-xs leading-5 ${feedbackTone[item.kind]}`}
                  key={item.id}
                >
                  {item.message}
                </p>
              ))}
            </div>
          </GamePanel>

          <GamePanel className="combat-piles-panel">
            <Stat label="Draw Pile" value={combat.drawPile.length} />
            <Stat label="Discard" value={combat.discardPile.length} />
            <Stat label="Turn" value={combat.turn} />
          </GamePanel>
        </aside>

        {combat.status !== "active" && (
          <div className="combat-result-overlay">
            <div className="combat-result-modal">
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-gold)]">
                {combat.status === "victory" ? "Victory" : "Defeat"}
              </p>
              <h2 className="mt-2 text-3xl font-black text-[#fff3cf]">
                {combat.status === "victory"
                  ? `${enemy.name} has fallen.`
                  : "The champion has fallen."}
              </h2>
              <div className="combat-result-metrics" aria-label="Combat summary">
                <Stat label="Starting HP" value={combat.metrics.startingHealth} />
                <Stat label="Ending HP" value={combat.metrics.endingHealth} />
                <Stat label="Damage Taken" value={combat.metrics.damageReceived} />
                <Stat label="Rounds" value={combat.metrics.roundsTaken} />
                <Stat label="Corruption" value={combat.metrics.corruptionGained} />
                <Stat label="Cards Played" value={combat.metrics.cardsPlayed} />
              </div>
              {(combat.metrics.notableCardName || combat.metrics.notableArchetype) && (
                <p className="combat-result-note">
                  Notable: {combat.metrics.notableCardName ?? "No card played"}
                  {combat.metrics.notableArchetype
                    ? ` / ${combat.metrics.notableArchetype}`
                    : ""}
                </p>
              )}
              <div className="mt-5">
                <PrimaryButton
                  onClick={() =>
                    combat.status === "victory"
                      ? onVictory(
                          encounter,
                          combat.player.health,
                          combat.resources,
                        )
                      : dispatch({ type: "restart" })
                  }
                  tone={combat.status === "victory" ? "primary" : "danger"}
                >
                  {combat.status === "victory"
                    ? "Continue to Reward"
                    : "Retry Battle From Start"}
                </PrimaryButton>
                {combat.status === "defeat" && (
                  <div className="mt-3">
                    <PrimaryButton onClick={() => onNavigate("map")} tone="secondary">
                      Return to Map
                    </PrimaryButton>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {combat.phase === "BattleIntro" && !hasSeenEncounterIntro && (
          <EncounterIntroOverlay
            dangerLevel={encounterPresentation.dangerLevel}
            definingMechanic={encounterPresentation.definingMechanic}
            enemy={enemy}
            onEnterBattle={enterBattle}
            tacticalIdentity={encounterPresentation.tacticalIdentity}
          />
        )}
      </div>
    </ScreenFrame>
  );
}

interface MeterProps {
  label: string;
  current: number;
  max: number;
  tone: "enemy" | "player";
}

function Meter({ current, label, max, tone }: MeterProps) {
  const width = `${Math.max(0, Math.min(100, (current / max) * 100))}%`;
  const barClass =
    tone === "enemy"
      ? "bg-[linear-gradient(90deg,#7f235f,#9f3d28,#d7b45d)]"
      : "bg-[linear-gradient(90deg,#5db7e8,#d7b45d)]";

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="uppercase tracking-[0.16em] text-[rgba(241,228,194,0.62)]">
          {label}
        </span>
        <span className="font-semibold text-[#fff3cf]">
          {current} / {max}
        </span>
      </div>
      <div className="mt-1 h-2.5 overflow-hidden rounded-full border border-[rgba(215,180,93,0.18)] bg-[rgba(0,0,0,0.36)]">
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${barClass}`}
          style={{ width }}
        />
      </div>
    </div>
  );
}

interface StatProps {
  isChanged?: boolean;
  label: string;
  value: number | string;
  tone?: "blue" | "default";
}

function Stat({ isChanged = false, label, value, tone = "default" }: StatProps) {
  const toneClass =
    tone === "blue"
      ? "border-[rgba(93,183,232,0.24)] bg-[rgba(93,183,232,0.08)]"
      : "border-[rgba(215,180,93,0.16)] bg-[rgba(255,255,255,0.04)]";

  return (
    <div
      className={`rounded-sm border p-2 ${
        isChanged ? "combat-stat-pulse" : ""
      } ${toneClass}`}
    >
      <p className="text-[0.65rem] uppercase tracking-[0.16em] text-[rgba(241,228,194,0.5)]">
        {label}
      </p>
      <p className="mt-1 text-base font-semibold leading-none text-[#fff3cf]">
        {value}
      </p>
    </div>
  );
}

function ResourcePip({
  isChanged = false,
  resource,
  thresholdName,
  value,
}: {
  isChanged?: boolean;
  resource: ResourceName;
  thresholdName?: string;
  value: number;
}) {
  const danger = resource === "Corruption";

  return (
    <div
      className={`combat-resource-pip ${
        danger ? "combat-resource-corruption" : "combat-resource-faith"
      } ${isChanged ? "combat-resource-pulse" : ""}`}
      title={getResourceBarTooltip(resource, value, thresholdName)}
    >
      <ResourceBadge
        amount={value}
        resource={resource}
        showLabel
        title={getResourceBarTooltip(resource, value, thresholdName)}
        variant="bar"
      />
      {thresholdName && <em>{thresholdName}</em>}
    </div>
  );
}

function CombatArtPortrait({
  alt,
  imagePath,
  objectPosition,
  sizes,
}: {
  alt: string;
  imagePath: string;
  objectPosition?: string;
  sizes: string;
}) {
  return (
    <>
      <Image
        alt={alt}
        className="combat-portrait-image"
        fill
        sizes={sizes}
        src={imagePath}
        style={{
          objectFit: "cover",
          objectPosition: objectPosition ?? "50% 38%",
        }}
      />
      <div className="combat-portrait-vignette" aria-hidden="true" />
    </>
  );
}

function EncounterIntroOverlay({
  dangerLevel,
  definingMechanic,
  enemy,
  onEnterBattle,
  tacticalIdentity,
}: {
  dangerLevel: string;
  definingMechanic: string;
  enemy: Enemy;
  onEnterBattle: () => void;
  tacticalIdentity: string;
}) {
  return (
    <div className="combat-intro-overlay">
      <div className="combat-intro-card">
        <div className="combat-intro-art">
          {enemy.imagePath ? (
            <CombatArtPortrait
              alt={enemy.artworkTitle ?? enemy.name}
              imagePath={enemy.imagePath}
              objectPosition={enemy.imageObjectPosition}
              sizes="220px"
            />
          ) : (
            <SymbolicArt kind="enemy" subject={enemy} variant="portrait" />
          )}
        </div>
        <div className="combat-intro-copy">
          <p>Encounter</p>
          <h2>{enemy.name}</h2>
          <div className="combat-intro-traits">
            {enemy.traits.map((trait) => (
              <Chip key={trait} label={trait} tone="gold" />
            ))}
            <Chip label={dangerLevel} tone={dangerLevel === "Boss" ? "crimson" : "violet"} />
          </div>
          <dl>
            <div>
              <dt>Tactical Identity</dt>
              <dd>{tacticalIdentity}</dd>
            </div>
            <div>
              <dt>Defining Mechanic</dt>
              <dd>{definingMechanic}</dd>
            </div>
          </dl>
          <PrimaryButton onClick={onEnterBattle}>Enter Battle</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function CombatPopup({
  feedback,
  tone,
}: {
  feedback: CombatFeedback;
  tone: "damage" | "guard" | "heal";
}) {
  return (
    <span className={`combat-popup combat-popup-${tone}`}>
      {formatFeedbackPopup(feedback, tone)}
    </span>
  );
}

function ActionPopup({
  label,
  tone,
}: {
  label: string;
  tone: "block" | "hit" | "status";
}) {
  return <span className={`combat-popup combat-popup-${tone}`}>{label}</span>;
}

function formatFeedbackPopup(feedback: CombatFeedback, tone: "damage" | "guard" | "heal") {
  if (tone === "damage") {
    const damage = feedback.message.match(/-(\d+)/)?.[1];
    return damage ? `-${damage}` : "Hit";
  }

  if (tone === "heal") {
    const healing = feedback.message.match(/Healed\s+(\d+)/)?.[1];
    return healing ? `+${healing} Health` : "Healed";
  }

  const guard = feedback.message.match(/\+(\d+)\s+Guard/)?.[1];
  return guard ? `+${guard} Guard` : "Guard";
}

function formatQueuedActionSummary(action: QueuedCombatAction) {
  const parts: string[] = [];

  if (action.damage) {
    parts.push(`${action.damage} incoming damage`);
  }

  if (action.hpDamage) {
    parts.push(`${action.hpDamage} health damage`);
  }

  if (action.blockedValue) {
    parts.push(`${action.blockedValue} blocked`);
  }

  if (action.guardValue) {
    parts.push(`enemy gains ${action.guardValue} Guard`);
  }

  if (action.mightChange) {
    parts.push(`${action.mightChange > 0 ? "+" : ""}${action.mightChange} Might`);
  }

  if (action.statusesApplied?.length) {
    parts.push(`applies ${action.statusesApplied.join(", ")}`);
  }

  if (action.resourceChanges?.corruption) {
    parts.push(`+${action.resourceChanges.corruption} Corruption`);
  }

  if (parts.length > 0) {
    return parts.join(" - ");
  }

  return action.logMessage;
}

function getIsHighDangerIntent(
  intent: {
    damage?: number;
    expectedDamage?: number;
    hpDamage?: number;
    intentType: string;
    resourceChanges?: Partial<ResourceState>;
  },
) {
  const expectedDamage = intent.damage ?? intent.hpDamage ?? intent.expectedDamage ?? 0;

  return (
    intent.intentType === "Heavy Attack" ||
    intent.intentType === "Ritual" ||
    intent.intentType === "Special" ||
    (intent.resourceChanges?.corruption ?? 0) > 0 ||
    expectedDamage >= 15
  );
}

function getBattlefieldTone(phase: CombatPhase) {
  if (phase === "EnemyTurnStart" || phase === "EnemyActing") {
    return "enemy";
  }

  if (phase === "PlayerTurnStart" || phase === "PlayerMain") {
    return "player";
  }

  return "neutral";
}

function hasStoredEncounterIntro(enemyId: string) {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(getEncounterIntroStorageKey(enemyId)) === "seen";
}

function storeEncounterIntro(enemyId: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(getEncounterIntroStorageKey(enemyId), "seen");
}

function getEncounterIntroStorageKey(enemyId: string) {
  return `covenant-legacies:encounter-intro:${enemyId}`;
}

function getCombatPhaseBanner(phase: CombatPhase) {
  switch (phase) {
    case "BattleIntro":
      return {
        title: "Battle Begins",
        subtitle: "The field is set.",
        tone: "neutral" as const,
      };
    case "PlayerTurnStart":
      return {
        title: "Player Turn",
        subtitle: "Choose your action.",
        tone: "player" as const,
      };
    case "PlayerTurnEnd":
      return {
        title: "Turn Ends",
        subtitle: "The enemy prepares to answer.",
        tone: "neutral" as const,
      };
    case "EnemyTurnStart":
      return {
        title: "Enemy Turn",
        subtitle: "The intent is revealed.",
        tone: "enemy" as const,
      };
    case "RoundCleanup":
      return {
        title: "Round Cleanup",
        subtitle: "Guard falls away and resources renew.",
        tone: "neutral" as const,
      };
    default:
      return undefined;
  }
}

function formatCombatPhase(phase: CombatPhase) {
  return phase
    .replace(/([A-Z])/g, " $1")
    .trim()
    .toUpperCase();
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  return prefersReducedMotion;
}

function getCardCueTone(card: Card): CombatCueTone {
  if (card.type.includes("Forbidden") || card.rarity === "Mystery") {
    return card.type.includes("Forbidden") ? "forbidden" : "mystery";
  }

  if (
    card.type.includes("Prayer") ||
    card.type.includes("Psalm") ||
    card.type.includes("Covenant") ||
    card.type.includes("Blessing")
  ) {
    return "prayer";
  }

  if (hasCardEffectType(card, ["GainGuard"]) || card.type.includes("Guard")) {
    return "guard";
  }

  return "attack";
}

function getCardCueTarget(card: Card): CombatCueTarget {
  if (hasCardEffectType(card, ["DealDamage"]) || card.type.includes("Attack")) {
    return "enemy";
  }

  if (
    hasCardEffectType(card, [
      "GainGuard",
      "Heal",
      "RemoveStatus",
      "RemoveCorruption",
    ]) ||
    card.type.includes("Guard") ||
    card.type.includes("Prayer") ||
    card.type.includes("Psalm")
  ) {
    return "player";
  }

  return "center";
}

function Chip({
  label,
  tone,
}: {
  label: string;
  tone: "gold" | "crimson" | "violet" | "blue" | "muted";
}) {
  const toneClass = {
    gold: "border-[rgba(215,180,93,0.3)] text-[#fff3cf]",
    crimson: "border-[rgba(159,61,40,0.42)] text-[#ffd7c9]",
    violet: "border-[rgba(127,35,95,0.48)] text-[#f0d4ff]",
    blue: "border-[rgba(93,183,232,0.34)] text-[#d8f2ff]",
    muted: "border-[rgba(203,185,143,0.16)] text-[rgba(241,228,194,0.58)]",
  }[tone];

  return (
    <span
      className={`rounded-full border bg-[rgba(8,7,5,0.34)] px-2 py-1 text-[0.68rem] uppercase tracking-[0.12em] ${toneClass}`}
    >
      {label}
    </span>
  );
}
