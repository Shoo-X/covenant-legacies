"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { starterCampaign } from "@/data/campaigns";
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
  getEndTurnRiskAssessment,
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
  CombatStructureState,
  CombatTargetId,
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

type CombatCueTone =
  | "attack"
  | "covenant"
  | "forbidden"
  | "guard"
  | "mystery"
  | "prayer"
  | "wisdom";
type CombatCueTarget = "enemy" | "player" | "center" | "structure";
type CombatImpactIntensity = "minor" | "normal" | "heavy" | "boss";

interface PlayedCue {
  cardName: string;
  effectLabel: string;
  impact: CombatImpactIntensity;
  id: string;
  target: CombatCueTarget;
  targetLabel: string;
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
  const [selectedCombatTargetId, setSelectedCombatTargetId] =
    useState<CombatTargetId>("enemy");
  const [playedCue, setPlayedCue] = useState<PlayedCue>();
  const [isEndTurnWarningOpen, setIsEndTurnWarningOpen] = useState(false);
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
  const activeStructures = combat.structures.filter(
    (structure) => structure.health > 0,
  );
  const spendableResources = resourceOrder.filter(
    (resource) => resource !== "Corruption",
  );
  const activeStateLabels = [
    ...(combat.hasFear ? ["Fear"] : []),
    ...combat.playerStatuses,
  ];
  const primaryStructure = activeStructures[0];
  const activeCombatTargetId = getActiveCombatTargetId(
    selectedCombatTargetId,
    activeStructures,
  );
  const encounterPresentation = getEnemyEncounterPresentation(enemy.id);
  const prefersReducedMotion = usePrefersReducedMotion();
  const isPlayerInputLocked =
    combat.status !== "active" || combat.phase !== "PlayerMain";
  const isHighDangerIntent = getIsHighDangerIntent(intentDetails);
  const endTurnRisk = getEndTurnRiskAssessment(combat);
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

  function requestEndTurn() {
    if (isPlayerInputLocked) {
      return;
    }

    if (endTurnRisk.shouldWarn) {
      setIsEndTurnWarningOpen(true);
      return;
    }

    dispatch({ type: "end-turn" });
  }

  function confirmEndTurn() {
    setIsEndTurnWarningOpen(false);
    dispatch({ type: "end-turn" });
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
      const targetId = getCardTargetId(card, activeCombatTargetId);

      if (!affordability.canPay) {
        setSelectedCardId(instanceId);
        dispatch({
          type: "play-card",
          instanceId,
          targetId,
        });
        return;
      }

      cueIdRef.current += 1;
      setPlayedCue({
        cardName: card.name,
        effectLabel: getCardCueLabel(card),
        impact: getCardCueImpact(card),
        id: `${instanceId}-${combat.feedback.length + 1}-${cueIdRef.current}`,
        target: getCardCueTarget(card, targetId),
        targetLabel: getCardTargetLabel(targetId, enemy, activeStructures),
        tone: getCardCueTone(card),
      });
    }

    setSelectedCardId(instanceId);
    setIsEndTurnWarningOpen(false);
    dispatch({
      type: "play-card",
      instanceId,
      targetId: card ? getCardTargetId(card, activeCombatTargetId) : "enemy",
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
  const latestStructureDamageFeedback = feedbackByNewest.find(
    (item) =>
      item.kind === "damage" &&
      item.message.includes(" health") &&
      !item.message.includes("enemy health"),
  );
  const latestPlayerDamageFeedback = feedbackByNewest.find(
    (item) => item.kind === "damage" && item.message.includes("damage taken"),
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
  const latestSpendFeedback = feedbackByNewest.find(
    (item) => item.kind === "resource" && /^-\d+/.test(item.message),
  );
  const latestCourageFeedback = feedbackByNewest.find((item) =>
    item.message.toLowerCase().includes("courage"),
  );
  const latestCorruptionFeedback = feedbackByNewest.find((item) =>
    item.message.toLowerCase().includes("corruption"),
  );
  const activeActionImpact = combat.activeAction
    ? getActionImpactIntensity(combat.activeAction, enemy)
    : undefined;
  const latestEnemyDamageImpact = latestEnemyDamageFeedback
    ? getFeedbackImpactIntensity(latestEnemyDamageFeedback)
    : undefined;
  const latestStructureDamageImpact = latestStructureDamageFeedback
    ? getFeedbackImpactIntensity(latestStructureDamageFeedback)
    : undefined;
  const latestPlayerImpact = latestPlayerDamageFeedback
    ? getFeedbackImpactIntensity(latestPlayerDamageFeedback)
    : undefined;
  const latestGuardImpact = latestGuardFeedback
    ? getFeedbackImpactIntensity(latestGuardFeedback)
    : undefined;
  const latestCorruptionImpact =
    latestCorruptionFeedback && !latestCorruptionFeedback.message.includes("New turn")
      ? getFeedbackImpactIntensity(latestCorruptionFeedback)
      : undefined;
  const currentImpact = getDominantImpact([
    activeActionImpact,
    playedCue?.impact,
    latestEnemyDamageImpact,
    latestStructureDamageImpact,
    latestPlayerImpact,
    latestCorruptionImpact,
  ]);
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
      <div
        className={`combat-board-grid combat-phase-${getCombatPhaseClass(
          combat.phase,
        )} ${isPlayerInputLocked ? "combat-input-locked" : ""} ${
          currentImpact ? `combat-impact-${currentImpact}` : ""
        } ${playedCue ? `combat-card-impact-${playedCue.tone}` : ""} ${
          latestCorruptionImpact ? "combat-corruption-warning" : ""
        } ${latestStructureDamageFeedback ? "combat-structure-impact" : ""}`}
      >
        <section className="combat-main-board" aria-label="Combat board">
          <GamePanel
            className={`combat-enemy-zone ${
              latestEnemyDamageImpact
                ? `combat-enemy-hit-${latestEnemyDamageImpact}`
                : ""
            }`}
          >
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

            <div className="combat-enemy-summary">
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
              } ${
                combat.phase === "PlayerTurnStart" ? "combat-intent-next-reveal" : ""
              } ${isHighDangerIntent ? "combat-intent-high-danger" : ""}`}
              title={`Enemy intent: ${intentDetails.actionName}. ${formatIntentTypeLabel(
                intentDetails,
                enemy,
              )}. ${intentDetails.summary}`}
            >
              <span className="combat-intent-icon" aria-hidden="true" />
              <div className="combat-intent-copy">
                <p>Enemy Intent</p>
                <h3>{intentDetails.actionName}</h3>
                <span>
                  {formatIntentTypeLabel(intentDetails, enemy)} -{" "}
                  {intentDetails.summary}
                </span>
              </div>
            </div>

            <div className="combat-chip-bank">
              {enemy.traits.map((trait) => (
                <Chip
                  key={trait}
                  label={trait}
                  tone="gold"
                  title={getKeywordTooltip(trait)}
                />
              ))}
              <Chip
                label={`Might ${combat.enemyState.might}`}
                tone="crimson"
                title={getKeywordTooltip("Might")}
              />
              {combat.enemyState.guard > 0 && (
                <Chip
                  label={`Guard ${combat.enemyState.guard}`}
                  tone="blue"
                  title={getKeywordTooltip("Guard")}
                />
              )}
              {combat.hasFear && (
                <Chip label="Fear" tone="violet" title={getKeywordTooltip("Fear")} />
              )}
              {combat.bossPhase > 0 && (
                <Chip
                  label={`Phase ${combat.bossPhase}`}
                  tone="crimson"
                  title="Boss phase: this enemy changes behavior as its health falls."
                />
              )}
            </div>
          </GamePanel>

          <div
            className={`combat-battlefield-zone combat-battlefield-${getBattlefieldTone(
              combat.phase,
            )} ${playedCue ? `combat-cast-${playedCue.tone}` : ""}`}
          >
            <div className="combat-valley-bg" aria-hidden="true" />
            <div className="combat-high-place-bg" aria-hidden="true" />
            <div className="combat-battlefield-glow" aria-hidden="true" />
            {phaseBanner && (
              <div
                className={`combat-turn-banner combat-turn-${phaseBanner.tone}`}
                key={`phase-${combat.phase}-${combat.turn}`}
                role="status"
                aria-live="polite"
              >
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
                } ${
                  activeActionImpact
                    ? `combat-action-impact-${activeActionImpact}`
                    : ""
                }`}
                data-impact-sound={getImpactSoundHook(
                  combat.activeAction,
                  activeActionImpact ?? "normal",
                )}
                key={`active-action-${combat.activeAction.id}`}
                role="status"
                aria-live="polite"
              >
                <p>{formatIntentTypeLabel(combat.activeAction, enemy)}</p>
                <strong>{formatQueuedActionHeading(combat.activeAction)}</strong>
                <span>{formatQueuedActionSubtext(combat.activeAction)}</span>
              </div>
            )}
            {playedCue && (
              <div
                className={`combat-played-card-cue combat-played-card-${playedCue.tone} combat-played-card-to-${playedCue.target} combat-played-card-impact-${playedCue.impact}`}
                data-impact-sound={getCardSoundHook(playedCue)}
                key={playedCue.id}
              >
                <p>{playedCue.effectLabel}</p>
                <strong>{playedCue.cardName}</strong>
                <span>{playedCue.targetLabel}</span>
              </div>
            )}
            {!phaseBanner && combat.bossPhase > 1 && (
              <div className="combat-phase-banner">
                <p>Boss Phase {combat.bossPhase}</p>
                <span>
                  {combat.bossPhase >= 3
                    ? "The champion presses the challenge."
                    : "Fear pressure rises from the battle line."}
                </span>
              </div>
            )}
            {latestEnemyDamageFeedback && (
              <CombatPopup
                feedback={latestEnemyDamageFeedback}
                intensity={latestEnemyDamageImpact}
                key={`damage-${latestEnemyDamageFeedback.id}`}
                tone="damage"
              />
            )}
            {latestStructureDamageFeedback && (
              <ActionPopup
                key={`structure-damage-${latestStructureDamageFeedback.id}`}
                label={formatStructureDamagePopup(latestStructureDamageFeedback)}
                intensity={latestStructureDamageImpact}
                tone="structure-hit"
              />
            )}
            {lastResolvedAction?.blockedValue ? (
              <ActionPopup
                key={`blocked-${lastResolvedAction.id}`}
                label={`${lastResolvedAction.blockedValue} Blocked`}
                intensity={activeActionImpact}
                tone="block"
              />
            ) : null}
            {lastResolvedAction?.hpDamage ? (
              <ActionPopup
                key={`hp-${lastResolvedAction.id}`}
                label={`-${lastResolvedAction.hpDamage} Health`}
                intensity={activeActionImpact}
                tone="hit"
              />
            ) : null}
            {lastResolvedAction?.mightChange ? (
              <ActionPopup
                key={`might-${lastResolvedAction.id}`}
                label={formatMightPopup(lastResolvedAction)}
                intensity={activeActionImpact}
                tone="status"
              />
            ) : null}
            {lastResolvedAction?.guardValue ? (
              <ActionPopup
                key={`enemy-guard-${lastResolvedAction.id}`}
                label={`Enemy +${lastResolvedAction.guardValue} Guard`}
                intensity={activeActionImpact}
                tone="enemy-guard"
              />
            ) : null}
            {lastResolvedAction?.statusesApplied?.length ? (
              <ActionPopup
                key={`status-${lastResolvedAction.id}`}
                label={formatStatusPopup(lastResolvedAction)}
                intensity={activeActionImpact}
                tone="status"
              />
            ) : null}
            {lastResolvedAction?.resourceChanges?.corruption ? (
              <ActionPopup
                key={`corruption-${lastResolvedAction.id}`}
                label={`+${lastResolvedAction.resourceChanges.corruption} Corruption`}
                intensity="heavy"
                tone="corruption"
              />
            ) : null}
            {latestCourageFeedback && (
              <ActionPopup
                key={`courage-${latestCourageFeedback.id}`}
                label={formatShortFeedback(latestCourageFeedback)}
                intensity={getFeedbackImpactIntensity(latestCourageFeedback)}
                tone="courage"
              />
            )}
            {latestSpendFeedback && (
              <ActionPopup
                key={`resource-${latestSpendFeedback.id}`}
                label={formatShortFeedback(latestSpendFeedback)}
                intensity="minor"
                tone="resource"
              />
            )}
            {latestCorruptionFeedback && !latestCorruptionFeedback.message.includes("New turn") && (
              <ActionPopup
                key={`resource-corruption-${latestCorruptionFeedback.id}`}
                label={formatShortFeedback(latestCorruptionFeedback)}
                intensity={latestCorruptionImpact}
                tone={
                  latestCorruptionFeedback.message.toLowerCase().includes("removed")
                    ? "cleansing"
                    : "corruption"
                }
              />
            )}
            {latestPlayerFeedback && (
              <CombatPopup
                feedback={latestPlayerFeedback}
                intensity={
                  latestHealingFeedback
                    ? getFeedbackImpactIntensity(latestHealingFeedback)
                    : latestGuardImpact
                }
                key={`player-${latestPlayerFeedback.id}`}
                tone={latestHealingFeedback ? "heal" : "guard"}
              />
            )}
            <div className="combat-field-slot combat-field-slot-left">
              <p>Target / Damage</p>
              <button
                className={`combat-target-card combat-target-enemy ${
                  activeCombatTargetId === "enemy" ? "is-selected" : ""
                }`}
                disabled={isPlayerInputLocked}
                onClick={() => setSelectedCombatTargetId("enemy")}
                type="button"
              >
                <span>Main Enemy</span>
                <strong>{enemy.name}</strong>
                <em>
                  {combat.enemyState.health}/{combat.enemyState.maxHealth} health
                </em>
              </button>
              {(latestEnemyDamageFeedback ?? battlefieldFeedback[0]) && (
                <span className="combat-float-number">
                  {(latestEnemyDamageFeedback ?? battlefieldFeedback[0])?.message}
                </span>
              )}
            </div>
            <div className="combat-confrontation-line" aria-hidden="true" />
            <div className="combat-field-slot combat-field-slot-center">
              <p>This Turn</p>
              {latestPrayerFeedback ? (
                <span className="combat-float-number combat-float-prayer">
                  {latestPrayerFeedback.message}
                </span>
              ) : (
                <span className="combat-structure-empty">
                  {combat.phase === "PlayerMain"
                    ? "Choose a card or end the turn."
                    : formatCombatPhase(combat.phase)}
                </span>
              )}
            </div>
            <div className="combat-field-slot combat-field-slot-right">
              <p>Structure Pressure</p>
              {activeStructures.length > 0 ? (
                <div className="combat-structure-list">
                  {activeStructures.map((structure) => (
                    <StructureTargetCard
                      isDisabled={isPlayerInputLocked}
                      isSelected={
                        activeCombatTargetId ===
                        getStructureTargetId(structure.instanceId)
                      }
                      key={structure.instanceId}
                      onSelect={() =>
                        setSelectedCombatTargetId(
                          getStructureTargetId(structure.instanceId),
                        )
                      }
                      structure={structure}
                    />
                  ))}
                </div>
              ) : (
                <span className="combat-structure-empty">
                  No active structure pressure.
                </span>
              )}
              {(latestStructureDamageFeedback ??
                latestGuardFeedback ??
                battlefieldFeedback[1]) && (
                <span className="combat-float-number">
                  {(
                    latestStructureDamageFeedback ??
                    latestGuardFeedback ??
                    battlefieldFeedback[1]
                  )?.message}
                </span>
              )}
            </div>
            <div className="combat-field-caption">
              Turn {combat.turn} / {formatCombatPhase(combat.phase)}
            </div>
          </div>

          <GamePanel
            className={`combat-hand-tray ${
              isPlayerInputLocked ? "combat-hand-locked" : ""
            }`}
          >
            <div className="combat-hand-header">
              <p>Hand</p>
              <span>{handCards.length} cards</span>
            </div>
            {isPlayerInputLocked && combat.status === "active" && (
              <div className="combat-hand-lock-caption" aria-live="polite">
                {getInputLockLabel(combat.phase)}
              </div>
            )}
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
                    disabled={isPlayerInputLocked}
                    size="hand"
                  />
                );
              })}
            </div>
          </GamePanel>

          <GamePanel
            className={`combat-player-zone ${
              latestGuardFeedback ? "combat-player-guard-pulse" : ""
            } ${latestHealingFeedback ? "combat-player-heal-pulse" : ""} ${
              latestPlayerDamageFeedback || lastResolvedAction?.hpDamage
                ? "combat-player-hit-pulse"
                : ""
            } ${
              latestGuardImpact ? `combat-player-guard-${latestGuardImpact}` : ""
            } ${
              latestPlayerImpact ? `combat-player-hit-${latestPlayerImpact}` : ""
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
                  {hero.shortName ?? hero.name}
                </h3>
                <Meter
                  current={combat.player.health}
                  label="Player Health"
                  max={combat.player.maxHealth}
                  tone="player"
                />
              </div>
            </div>

            <div className="combat-defense-bank" aria-label="Defense and Courage">
              <DefenseMetric
                detail="Blocks damage"
                helpText={getKeywordTooltip("Guard")}
                isChanged={Boolean(latestGuardFeedback || latestHealingFeedback)}
                impact={latestGuardImpact}
                kind="guard"
                key={`guard-${latestGuardFeedback?.id ?? latestHealingFeedback?.id ?? "stable"}`}
                label="Guard"
                value={combat.player.guard}
              />
              <DefenseMetric
                detail="Attack focus"
                helpText={getKeywordTooltip("Courage")}
                isChanged={Boolean(
                  latestResourceFeedback?.message.toLowerCase().includes("courage"),
                )}
                impact={
                  latestCourageFeedback
                    ? getFeedbackImpactIntensity(latestCourageFeedback)
                    : undefined
                }
                kind="courage"
                key={`courage-${
                  latestResourceFeedback?.message.toLowerCase().includes("courage")
                    ? latestResourceFeedback.id
                    : "stable"
                }`}
                label="Courage"
                value={`${combat.courage}/3`}
              />
            </div>

            <ResourceGroup className="combat-spendable-bank" title="Spend">
              {spendableResources.map((resource) => (
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
                  value={combat.resources[resourceVisuals[resource].key]}
                />
              ))}
            </ResourceGroup>

            <ResourceGroup className="combat-state-bank" title="State">
              <ResourcePip
                isChanged={Boolean(
                  latestResourceFeedback?.message.toLowerCase().includes("corruption"),
                )}
                impact={latestCorruptionImpact}
                key={`corruption-${
                  latestResourceFeedback?.message.toLowerCase().includes("corruption")
                    ? latestResourceFeedback.id
                    : "stable"
                }`}
                resource="Corruption"
                thresholdName={corruptionThreshold.name}
                value={combat.resources.corruption}
              />
              {activeStateLabels.length === 0 ? (
                <StateChip
                  label="No Harmful Status"
                  tone="muted"
                  title="David has no active harmful status right now."
                />
              ) : (
                activeStateLabels.map((status) => (
                  <StateChip
                    key={status}
                    label={status}
                    tone="danger"
                    title={getKeywordTooltip(status)}
                  />
                ))
              )}
            </ResourceGroup>

            <ResourceGroup className="combat-context-bank" title="Run">
              {combat.memorials.length === 0 ? (
                <StateChip
                  label="No Memorials"
                  tone="muted"
                  title="No memorial effects are active in this run."
                />
              ) : (
                combat.memorials.map((memorial) => (
                  <StateChip
                    key={memorial.id}
                    label={memorial.name}
                    tone="gold"
                    title="Active run memorial."
                  />
                ))
              )}
              <StateChip
                label={primaryStructure ? primaryStructure.name : "No Structure"}
                tone={primaryStructure ? "warning" : "muted"}
                title={
                  primaryStructure
                    ? "A targetable enemy structure is active on the battlefield."
                    : "No targetable enemy structure is active."
                }
              />
            </ResourceGroup>

            {(latestGuardFeedback || latestHealingFeedback) && (
              <span
                className="combat-player-feedback-ring"
                key={`player-ring-${
                  latestGuardFeedback?.id ?? latestHealingFeedback?.id
                }`}
              />
            )}
          </GamePanel>
        </section>

        <aside className="combat-command-rail" aria-label="Combat command rail">
          <GamePanel className="combat-log-panel" scroll>
            <div className="combat-log-header">
              <p>Recent Battle Events</p>
              <span>Newest first</span>
            </div>
            <div className="combat-log-list">
              {latestFeedback.map((item, index) => {
                const impact = getFeedbackImpactIntensity(item);

                return (
                  <p
                    className={`combat-feedback-pop combat-log-entry ${
                      index === 0 ? "combat-log-entry-latest" : ""
                    } ${feedbackTone[item.kind]} combat-log-impact-${impact}`}
                    key={item.id}
                  >
                    {index === 0 && <span>Latest</span>}
                    {item.message}
                  </p>
                );
              })}
            </div>
          </GamePanel>

          <div className="combat-lower-command-stack">
            <GamePanel className="combat-piles-panel">
              <Stat label="Draw Pile" value={combat.drawPile.length} />
              <Stat label="Discard" value={combat.discardPile.length} />
              <Stat label="Turn" value={combat.turn} />
            </GamePanel>

            <GamePanel className="combat-actions-panel">
              <p className="text-[0.65rem] uppercase tracking-[0.22em] text-[var(--color-gold)]">
                Command
              </p>
              <PrimaryButton
                disabled={isPlayerInputLocked}
                onClick={requestEndTurn}
              >
                {isPlayerInputLocked ? getCommandLockLabel(combat.phase) : "End Turn"}
              </PrimaryButton>
              {combat.phase === "PlayerMain" && isEndTurnWarningOpen && (
                <div
                  className={`combat-end-turn-confirm combat-end-turn-${endTurnRisk.severity}`}
                  role="alertdialog"
                  aria-label="End turn risk warning"
                >
                  <div>
                    <p>Danger Before Ending Turn</p>
                    <h3>{endTurnRisk.actionName}</h3>
                  </div>
                  <ul>
                    {endTurnRisk.reasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                  <div className="combat-end-turn-confirm-actions">
                    <PrimaryButton onClick={confirmEndTurn} tone="danger">
                      End Turn Anyway
                    </PrimaryButton>
                    <PrimaryButton
                      onClick={() => setIsEndTurnWarningOpen(false)}
                      tone="secondary"
                    >
                      Stay and Play Cards
                    </PrimaryButton>
                  </div>
                </div>
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
          </div>
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
          className={`h-full rounded-full transition-[width] duration-500 ${barClass}`}
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

function ResourceGroup({
  children,
  className = "",
  title,
}: {
  children: ReactNode;
  className?: string;
  title: string;
}) {
  return (
    <section className={`combat-resource-group ${className}`} aria-label={title}>
      <p className="combat-resource-group-title">{title}</p>
      <div className="combat-resource-group-body">{children}</div>
    </section>
  );
}

function DefenseMetric({
  detail,
  helpText,
  impact,
  isChanged = false,
  kind,
  label,
  value,
}: {
  detail: string;
  helpText: string;
  impact?: CombatImpactIntensity;
  isChanged?: boolean;
  kind: "guard" | "courage";
  label: string;
  value: number | string;
}) {
  return (
    <div
      className={`combat-defense-metric combat-defense-${kind} ${
        isChanged ? "combat-stat-pulse" : ""
      } ${impact ? `combat-defense-impact-${impact}` : ""}`}
      title={`${label}: ${value}. ${helpText}`}
    >
      <span className="combat-defense-symbol" aria-hidden="true" />
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <em>{detail}</em>
      </div>
    </div>
  );
}

function StateChip({
  label,
  title,
  tone,
}: {
  label: string;
  title?: string;
  tone: "danger" | "gold" | "muted" | "warning";
}) {
  return (
    <span className={`combat-state-chip combat-state-${tone}`} title={title}>
      {label}
    </span>
  );
}

function ResourcePip({
  impact,
  isChanged = false,
  resource,
  thresholdName,
  value,
}: {
  impact?: CombatImpactIntensity;
  isChanged?: boolean;
  resource: ResourceName;
  thresholdName?: string;
  value: number;
}) {
  const danger = resource === "Corruption";

  return (
    <div
      className={`combat-resource-pip combat-resource-${
        resourceVisuals[resource].key
      } ${danger ? "combat-resource-danger" : ""} ${
        isChanged ? "combat-resource-pulse" : ""
      } ${impact ? `combat-resource-impact-${impact}` : ""}`}
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
          <p>{starterCampaign.campaignName}</p>
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
            <div>
              <dt>Biblical Anchor</dt>
              <dd>{starterCampaign.biblicalAnchor}</dd>
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
  intensity,
  tone,
}: {
  feedback: CombatFeedback;
  intensity?: CombatImpactIntensity;
  tone: "damage" | "guard" | "heal";
}) {
  return (
    <span
      className={`combat-popup combat-popup-${tone} combat-popup-${
        intensity ?? "normal"
      }`}
    >
      {formatFeedbackPopup(feedback, tone)}
    </span>
  );
}

function StructureTargetCard({
  isDisabled,
  isSelected,
  onSelect,
  structure,
}: {
  isDisabled: boolean;
  isSelected: boolean;
  onSelect: () => void;
  structure: CombatStructureState;
}) {
  const triggerAt = structure.triggerAtCharge ?? 3;
  const isAboutToTrigger = structure.charge + 1 >= triggerAt;
  const healthWidth = `${Math.max(
    0,
    Math.min(100, (structure.health / structure.maxHealth) * 100),
  )}%`;

  return (
    <button
      className={`combat-structure-card ${isSelected ? "is-selected" : ""} ${
        isAboutToTrigger ? "is-danger" : ""
      }`}
      disabled={isDisabled}
      onClick={onSelect}
      title={structure.effectText}
      type="button"
    >
      <span className="combat-structure-kicker">Targetable Structure</span>
      <strong>{structure.name}</strong>
      <span className="combat-structure-health">
        <i style={{ width: healthWidth }} />
      </span>
      <span className="combat-structure-meta">
        {structure.health}/{structure.maxHealth} HP
        <b>
          Charge {structure.charge}/{triggerAt}
        </b>
      </span>
      <em>
        {isAboutToTrigger
          ? "Trigger imminent"
          : "At 3 charges: +1 Might, +1 Corruption"}
      </em>
    </button>
  );
}

function ActionPopup({
  intensity,
  label,
  tone,
}: {
  intensity?: CombatImpactIntensity;
  label: string;
  tone:
    | "block"
    | "cleansing"
    | "corruption"
    | "courage"
    | "enemy-guard"
    | "hit"
    | "resource"
    | "status"
    | "structure-hit";
}) {
  return (
    <span
      className={`combat-popup combat-popup-${tone} combat-popup-${
        intensity ?? "normal"
      }`}
    >
      {label}
    </span>
  );
}

function formatShortFeedback(feedback: CombatFeedback) {
  return feedback.message.replace(/\.$/, "");
}

function formatStructureDamagePopup(feedback: CombatFeedback) {
  const damage = feedback.message.match(/-(\d+)/)?.[1];
  return damage ? `-${damage} Structure` : "Structure Hit";
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
    parts.push(`${action.damage} damage`);
  }

  if (action.hpDamage) {
    parts.push(`${action.hpDamage} damage taken`);
  }

  if (action.blockedValue) {
    parts.push(`${action.blockedValue} blocked by Guard`);
  }

  if (action.guardValue) {
    parts.push(`enemy gains ${action.guardValue} Guard`);
  }

  if (action.mightChange) {
    parts.push(formatMightPopup(action));
  }

  if (action.statusesApplied?.length) {
    parts.push(formatStatusPopup(action));
  }

  if (action.resourceChanges?.corruption) {
    parts.push(`+${action.resourceChanges.corruption} Corruption`);
  }

  if (parts.length > 0) {
    return parts.join(" - ");
  }

  return action.logMessage;
}

const impactRanks: Record<CombatImpactIntensity, number> = {
  minor: 1,
  normal: 2,
  heavy: 3,
  boss: 4,
};

function getDominantImpact(
  impacts: Array<CombatImpactIntensity | undefined>,
): CombatImpactIntensity | undefined {
  return impacts.reduce<CombatImpactIntensity | undefined>((strongest, impact) => {
    if (!impact) {
      return strongest;
    }

    if (!strongest || impactRanks[impact] > impactRanks[strongest]) {
      return impact;
    }

    return strongest;
  }, undefined);
}

function getActionImpactIntensity(
  action: QueuedCombatAction,
  enemy: Enemy,
): CombatImpactIntensity {
  const damageValue = action.damage ?? action.hpDamage ?? 0;
  const blockValue = action.blockedValue ?? 0;
  const isBossAction =
    enemy.traits.includes("Boss") &&
    (action.intentType === "Heavy Attack" ||
      action.intentType === "Special" ||
      action.actionName.toLowerCase().includes("shadow"));

  if (isBossAction) {
    return "boss";
  }

  if (
    action.intentType === "Special" ||
    action.intentType === "Ritual" ||
    action.intentType === "Heavy Attack" ||
    (action.resourceChanges?.corruption ?? 0) > 0 ||
    Math.abs(action.mightChange ?? 0) >= 2 ||
    damageValue >= 15 ||
    blockValue >= 12
  ) {
    return "heavy";
  }

  if (
    damageValue > 0 ||
    blockValue > 0 ||
    action.guardValue ||
    action.statusesApplied?.length ||
    action.structureChargeChange
  ) {
    return "normal";
  }

  return "minor";
}

function getFeedbackImpactIntensity(feedback: CombatFeedback): CombatImpactIntensity {
  const message = feedback.message.toLowerCase();
  const amount =
    Number(feedback.message.match(/[-+](\d+)/)?.[1]) ||
    Number(feedback.message.match(/(\d+)\s+damage/)?.[1]) ||
    0;

  if (
    message.includes("boss phase") ||
    message.includes("shadow of the watchers") ||
    message.includes("enemy defeated")
  ) {
    return "boss";
  }

  if (
    message.includes("corruption") ||
    message.includes("altar is broken") ||
    message.includes("triggers") ||
    message.includes("courage spent") ||
    amount >= 12
  ) {
    return "heavy";
  }

  if (
    amount >= 5 ||
    message.includes("guard") ||
    message.includes("healed") ||
    message.includes("fear")
  ) {
    return "normal";
  }

  return "minor";
}

function getImpactSoundHook(
  action: QueuedCombatAction,
  intensity: CombatImpactIntensity,
) {
  return `${action.presentation}:${intensity}`;
}

function getCardSoundHook(cue: PlayedCue) {
  return `${cue.tone}:${cue.impact}`;
}

function formatQueuedActionHeading(action: QueuedCombatAction) {
  const summary = formatQueuedActionSummary(action);

  if (!summary || summary === action.logMessage) {
    return action.actionName;
  }

  return `${action.actionName} - ${summary}`;
}

function formatQueuedActionSubtext(action: QueuedCombatAction) {
  switch (action.presentation) {
    case "windup":
      return "Enemy action begins.";
    case "block":
      return "Guard resolves before health loss.";
    case "damage":
      return "Health changes now.";
    case "status":
      return "Status changes now.";
    case "buff":
      return "Enemy state changes now.";
    case "resource":
      return "Run pressure changes now.";
    case "cleanup":
      return "The round settles.";
    case "intent":
      return "Next intent is revealed.";
    case "banner":
      return "Phase change.";
  }
}

function formatMightPopup(action: QueuedCombatAction) {
  const amount = action.mightChange ?? 0;

  if (amount > 0) {
    return `${action.target === "Self" ? "Enemy " : ""}+${amount} Might`;
  }

  return `${action.target === "Self" ? "Enemy " : ""}${amount} Might`;
}

function formatStatusPopup(action: QueuedCombatAction) {
  if (!action.statusesApplied?.length) {
    return "Status applied";
  }

  if (action.statusesApplied.length === 1) {
    return `${action.statusesApplied[0]} applied`;
  }

  return `${action.statusesApplied.join(", ")} applied`;
}

function formatIntentTypeLabel(
  intent: {
    intentType: string;
    resourceChanges?: Partial<ResourceState>;
  },
  enemy: Enemy,
) {
  if ((intent.resourceChanges?.corruption ?? 0) > 0) {
    return "Corrupt";
  }

  if (
    enemy.traits.includes("Boss") &&
    (intent.intentType === "Special" || intent.intentType === "Heavy Attack")
  ) {
    return "Boss Action";
  }

  if (intent.intentType === "Heavy Attack") {
    return "Heavy";
  }

  return intent.intentType;
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

function getCombatPhaseClass(phase: CombatPhase) {
  return phase
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .toLowerCase();
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
        subtitle: "Resources refresh, cards are drawn, and the next intent is revealed.",
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
        subtitle: "Player input is locked while the enemy acts.",
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

function getInputLockLabel(phase: CombatPhase) {
  if (phase === "EnemyTurnStart" || phase === "EnemyActing") {
    return "Enemy action resolving";
  }

  if (phase === "PlayerTurnStart") {
    return "Drawing cards and revealing intent";
  }

  if (phase === "PlayerTurnEnd") {
    return "Passing initiative";
  }

  if (phase === "RoundCleanup") {
    return "Preparing next turn";
  }

  return "Battle transition";
}

function getCommandLockLabel(phase: CombatPhase) {
  if (phase === "EnemyTurnStart" || phase === "EnemyActing") {
    return "Enemy Acting";
  }

  if (phase === "PlayerTurnStart" || phase === "RoundCleanup") {
    return "Ready Soon";
  }

  return "Resolving";
}

function formatCombatPhase(phase: CombatPhase) {
  return phase
    .replace(/([A-Z])/g, " $1")
    .trim()
    .toUpperCase();
}

function getActiveCombatTargetId(
  selectedTargetId: CombatTargetId,
  activeStructures: CombatStructureState[],
): CombatTargetId {
  if (selectedTargetId === "enemy") {
    return "enemy";
  }

  const structureId = selectedTargetId.slice("structure:".length);

  return activeStructures.some((structure) => structure.instanceId === structureId)
    ? selectedTargetId
    : "enemy";
}

function getCardTargetId(card: Card, selectedTargetId: CombatTargetId) {
  if (selectedTargetId === "enemy") {
    return "enemy";
  }

  return canCardTargetStructures(card) ? selectedTargetId : "enemy";
}

function canCardTargetStructures(card: Card) {
  return hasCardEffectType(card, ["DealDamage", "DestroyAltarOrStructure"]);
}

function getStructureTargetId(structureId: string): CombatTargetId {
  return `structure:${structureId}`;
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

  if (card.type.includes("Covenant") || card.type.includes("Blessing")) {
    return "covenant";
  }

  if (
    card.type.includes("Wisdom") ||
    card.type.includes("Discernment") ||
    hasCardEffectType(card, ["RevealIntent"])
  ) {
    return "wisdom";
  }

  if (
    card.type.includes("Prayer") ||
    card.type.includes("Psalm")
  ) {
    return "prayer";
  }

  if (hasCardEffectType(card, ["GainGuard"]) || card.type.includes("Guard")) {
    return "guard";
  }

  return "attack";
}

function getCardCueImpact(card: Card): CombatImpactIntensity {
  if (card.rarity === "Mythic Legendary") {
    return "boss";
  }

  if (
    card.rarity === "Legendary" ||
    card.type.includes("Forbidden") ||
    hasCardEffectType(card, ["GainCorruption", "DestroyAltarOrStructure"])
  ) {
    return "heavy";
  }

  if (
    card.type.includes("Attack") ||
    card.type.includes("Prayer") ||
    card.type.includes("Psalm") ||
    card.type.includes("Covenant") ||
    hasCardEffectType(card, ["DealDamage", "GainGuard", "Heal"])
  ) {
    return "normal";
  }

  return "minor";
}

function getCardCueLabel(card: Card) {
  if (card.type.includes("Forbidden")) {
    return "Forbidden Warning";
  }

  if (card.rarity === "Mystery") {
    return "Mystery";
  }

  if (hasCardEffectType(card, ["DealDamage"])) {
    return "Attack";
  }

  if (hasCardEffectType(card, ["GainGuard"])) {
    return "Guard";
  }

  if (hasCardEffectType(card, ["Heal"])) {
    return "Healing";
  }

  if (card.type.includes("Covenant") || card.type.includes("Blessing")) {
    return "Covenant";
  }

  if (
    card.type.includes("Wisdom") ||
    card.type.includes("Discernment") ||
    hasCardEffectType(card, ["RevealIntent"])
  ) {
    return "Discernment";
  }

  if (card.type.includes("Prayer") || card.type.includes("Psalm")) {
    return "Prayer";
  }

  return card.type.split("/")[0] ?? "Card";
}

function getCardTargetLabel(
  targetId: CombatTargetId,
  enemy: Enemy,
  activeStructures: CombatStructureState[],
) {
  if (targetId === "enemy") {
    return `Target: ${enemy.name}`;
  }

  const structureId = targetId.slice("structure:".length);
  const structure = activeStructures.find(
    (candidate) => candidate.instanceId === structureId,
  );

  return `Target: ${structure?.name ?? "Structure"}`;
}

function getCardCueTarget(card: Card, targetId: CombatTargetId): CombatCueTarget {
  if (targetId !== "enemy") {
    return "structure";
  }

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

function getKeywordTooltip(keyword: string) {
  const normalized = keyword.toLowerCase();

  const descriptions: Record<string, string> = {
    authority:
      "Authority: spendable resource for command, kingdom, judgment, and ordered leadership cards.",
    boss: "Boss: major encounter with stronger intent patterns and phase changes.",
    courage:
      "Courage: David's combat focus. Stacks up to 3 and is spent by attacks for bonus damage.",
    corruption:
      "Corruption: dangerous run pressure. It is a consequence to manage, not a normal resource.",
    champion:
      "Champion: named battlefield representative whose defeat carries covenant and morale weight.",
    demon: "Demon: enemy trait used by cards and effects that care about spiritual opposition.",
    empire: "Empire: enemy trait used by cards and effects that care about oppressive powers.",
    faith:
      "Faith: spendable resource for prayer, psalm, covenant, and deliverance cards.",
    fear: "Fear: harmful status that weakens attacks until removed.",
    giant: "Giant: enemy trait. David's sling and courage cards often gain bonuses against Giants.",
    gath: "Gath: Philistine city connected with Goliath and later giant traditions.",
    guard: "Guard: blocks incoming damage first, then usually resets at the next turn.",
    human: "Human: enemy trait used by cards and encounter effects.",
    idol: "Idol: enemy trait tied to altar, structure, and false-worship pressure.",
    might: "Might: enemy power. Each Might usually increases enemy damage or pressure.",
    nephilim:
      "Nephilim: enemy trait. Anti-Giant and judgment effects often care about this threat.",
    philistine:
      "Philistine: enemy trait tied to the battle line opposing Israel in David's starter campaign.",
    oppressed:
      "Oppressed: high Corruption threshold. Enemy pressure becomes more dangerous.",
    resolve:
      "Resolve: spendable resource for attacks, courage cards, and direct pressure.",
    tainted: "Tainted: Corruption threshold where prayer and covenant choices become riskier.",
    watcher:
      "Watcher: enemy trait tied to forbidden knowledge, corruption, and high-place threats.",
    wisdom:
      "Wisdom: spendable resource for discernment, careful support, and planning cards.",
  };

  return (
    descriptions[normalized] ??
    `${keyword}: trait or status that may be referenced by cards, enemies, or encounter effects.`
  );
}

function Chip({
  label,
  title,
  tone,
}: {
  label: string;
  title?: string;
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
      title={title}
    >
      {label}
    </span>
  );
}
