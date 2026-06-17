"use client";

import { useMemo, useRef, useState } from "react";
import { cards } from "@/data/cards";
import { enemies } from "@/data/enemies";
import { heroes } from "@/data/heroes";
import { CollectibleCard } from "@/components/CollectibleCard";
import { GamePanel } from "@/components/GamePanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenFrame } from "@/components/ScreenFrame";
import { SymbolicArt } from "@/components/SymbolicArt";
import {
  canPayForCard,
  combatReducer,
  createCombatState,
} from "@/game/combat/engine";
import type {
  CombatAction,
  CombatCardInstance,
  CombatFeedback,
  CombatFeedbackKind,
} from "@/game/combat/types";
import type {
  Card,
  Encounter,
  GameScreen,
  Memorial,
  ResourceState,
  StartingDeckCard,
} from "@/types/game";

interface CombatScreenProps {
  encounter: Encounter;
  onNavigate: (screen: GameScreen) => void;
  onVictory: (encounter: Encounter) => void;
  runDeck: StartingDeckCard[];
  runMemorials: Memorial[];
  startingFaithBonus: number;
}

const resourceLabels: Array<[keyof ResourceState, string]> = [
  ["resolve", "Resolve"],
  ["faith", "Faith"],
  ["wisdom", "Wisdom"],
  ["authority", "Authority"],
  ["corruption", "Corruption"],
];

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
  runMemorials,
  startingFaithBonus,
}: CombatScreenProps) {
  const hero = heroes[0];
  const enemy =
    enemies.find((candidate) => candidate.id === encounter.enemyIds[0]) ?? enemies[0];
  const cardsById = useMemo(() => new Map(cards.map((card) => [card.id, card])), []);
  const cueIdRef = useRef(0);
  const [selectedCardId, setSelectedCardId] = useState<string>();
  const [playedCue, setPlayedCue] = useState<PlayedCue>();
  const [combat, setCombat] = useState(() =>
    createCombatState(
      hero,
      enemy,
      cardsById,
      Math.random,
      runDeck,
      runMemorials,
      startingFaithBonus,
    ),
  );

  function dispatch(action: CombatAction) {
    setCombat((current) =>
      combatReducer(current, action, {
        cardsById,
      }),
    );
  }

  function playCard(instanceId: string) {
    const card = cardsById.get(
      combat.hand.find((instance) => instance.instanceId === instanceId)?.cardId ?? "",
    );

    if (card) {
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
  const selectedHandCard = handCards.find(
    ({ instance }) => instance.instanceId === selectedCardId,
  )?.card;

  const latestFeedback = [...combat.feedback].slice(-8).reverse();
  const feedbackByNewest = [...combat.feedback].reverse();
  const latestDamageFeedback = feedbackByNewest.find((item) => item.kind === "damage");
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
              <SymbolicArt kind="enemy" subject={enemy} variant="portrait" />
              {latestDamageFeedback && (
                <span
                  className="combat-portrait-hit-flash"
                  key={`enemy-hit-${latestDamageFeedback.id}`}
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

            <div className="combat-intent-panel">
              <p className="text-[0.65rem] uppercase tracking-[0.18em] text-[rgba(241,228,194,0.52)]">
                Intent
              </p>
              <p className="mt-1 text-sm font-semibold leading-5 text-[#fff3cf]">
                {enemy.intent}
              </p>
            </div>

            <div className="combat-chip-bank">
              {enemy.traits.map((trait) => (
                <Chip key={trait} label={trait} tone="gold" />
              ))}
              <Chip label={`Might ${combat.enemyState.might}`} tone="crimson" />
              {combat.hasFear && <Chip label="Fear" tone="violet" />}
            </div>
          </GamePanel>

          <div className="combat-battlefield-zone">
            <div className="combat-valley-bg" aria-hidden="true" />
            <div className="combat-high-place-bg" aria-hidden="true" />
            <div className="combat-battlefield-glow" aria-hidden="true" />
            {playedCue && (
              <div
                className={`combat-played-card-cue combat-played-card-${playedCue.tone} combat-played-card-to-${playedCue.target}`}
                key={playedCue.id}
              >
                <span>{playedCue.cardName}</span>
              </div>
            )}
            {latestDamageFeedback && (
              <CombatPopup
                feedback={latestDamageFeedback}
                key={`damage-${latestDamageFeedback.id}`}
                tone="damage"
              />
            )}
            {latestPlayerFeedback && (
              <CombatPopup
                feedback={latestPlayerFeedback}
                key={`player-${latestPlayerFeedback.id}`}
                tone={latestHealingFeedback ? "heal" : "guard"}
              />
            )}
            <div className="combat-field-slot combat-field-slot-left">
              <p>Attack Effects</p>
              {(latestDamageFeedback ?? battlefieldFeedback[0]) && (
                <span className="combat-float-number">
                  {(latestDamageFeedback ?? battlefieldFeedback[0])?.message}
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
              Turn {combat.turn} / {encounter.nodeType} / {combat.status}
            </div>
          </div>

          <GamePanel
            className={`combat-player-zone ${
              latestGuardFeedback ? "combat-player-guard-pulse" : ""
            } ${latestHealingFeedback ? "combat-player-heal-pulse" : ""}`}
          >
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
              {resourceLabels.map(([key, label]) => (
                <ResourcePip
                  isChanged={Boolean(
                    latestResourceFeedback?.message
                      .toLowerCase()
                      .includes(label.toLowerCase()),
                  )}
                  key={`${key}-${
                    latestResourceFeedback?.message
                      .toLowerCase()
                      .includes(label.toLowerCase())
                      ? latestResourceFeedback.id
                      : "stable"
                  }`}
                  label={label}
                  value={combat.resources[key]}
                />
              ))}
            </div>

            <div className="combat-memorial-bank">
              {combat.memorials.length === 0 ? (
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
                <CollectibleCard as="article" card={selectedHandCard} size="inspect" />
              </div>
            )}
            <div className="combat-hand-scroll" aria-label="Card hand">
              {handCards.map(({ instance, card }) => {
                const playable =
                  canPayForCard(combat, card) && combat.status === "active";

                return (
                  <CollectibleCard
                    card={card}
                    isPlayable={playable}
                    isSelected={selectedCardId === instance.instanceId}
                    key={instance.instanceId}
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
              disabled={combat.status !== "active"}
              onClick={() => dispatch({ type: "end-turn" })}
            >
              End Turn
            </PrimaryButton>
            {combat.status === "active" && (
              <PrimaryButton onClick={() => onNavigate("map")} tone="secondary">
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
              <div className="mt-5">
                <PrimaryButton
                  onClick={() =>
                    combat.status === "victory"
                      ? onVictory(encounter)
                      : dispatch({ type: "restart" })
                  }
                  tone={combat.status === "victory" ? "primary" : "danger"}
                >
                  {combat.status === "victory" ? "Claim Reward" : "Restart Combat"}
                </PrimaryButton>
              </div>
            </div>
          </div>
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
  label,
  value,
}: {
  isChanged?: boolean;
  label: string;
  value: number;
}) {
  const danger = label === "Corruption";

  return (
    <div
      className={`combat-resource-pip ${
        danger ? "combat-resource-corruption" : "combat-resource-faith"
      } ${isChanged ? "combat-resource-pulse" : ""}`}
    >
      <span>{label}</span>
      <strong>{value}</strong>
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

  if (card.combatEffect?.guard || card.type.includes("Guard")) {
    return "guard";
  }

  return "attack";
}

function getCardCueTarget(card: Card): CombatCueTarget {
  if (card.combatEffect?.damage || card.type.includes("Attack")) {
    return "enemy";
  }

  if (
    card.combatEffect?.guard ||
    card.combatEffect?.heal ||
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
  tone: "gold" | "crimson" | "violet" | "muted";
}) {
  const toneClass = {
    gold: "border-[rgba(215,180,93,0.3)] text-[#fff3cf]",
    crimson: "border-[rgba(159,61,40,0.42)] text-[#ffd7c9]",
    violet: "border-[rgba(127,35,95,0.48)] text-[#f0d4ff]",
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
