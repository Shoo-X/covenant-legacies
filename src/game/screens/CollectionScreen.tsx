"use client";

import { useMemo, useState } from "react";
import { CardDetailModal } from "@/components/CardDetailModal";
import { CollectibleCard } from "@/components/CollectibleCard";
import { GamePanel } from "@/components/GamePanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenFrame } from "@/components/ScreenFrame";
import { cards } from "@/data/cards";
import {
  cardRarityFilters,
  cardSetFilters,
  getCardSet,
  isShowcaseCard,
  sortCardsForShowcase,
} from "@/game/cardArt";
import type { Card, CardRarity, CardSet, StartingDeckCard } from "@/types/game";

interface CollectionScreenProps {
  onAddToDeck: (cardId: string) => void;
  onRemoveFromDeck: (cardId: string) => void;
  runDeck: StartingDeckCard[];
}

type CollectionMode = "collection" | "deck";

export function CollectionScreen({
  onAddToDeck,
  onRemoveFromDeck,
  runDeck,
}: CollectionScreenProps) {
  const [mode, setMode] = useState<CollectionMode>("collection");
  const [query, setQuery] = useState("");
  const [rarity, setRarity] = useState<CardRarity | "All">("All");
  const [cardSet, setCardSet] = useState<CardSet | "All">("All");
  const [selectedCard, setSelectedCard] = useState<Card>();

  const deckCounts = useMemo(() => {
    return new Map(runDeck.map((entry) => [entry.cardId, entry.quantity]));
  }, [runDeck]);

  const filteredCards = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return sortCardsForShowcase(cards).filter((card) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [card.name, card.type, card.text, card.flavorText, card.artworkTitle]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(normalizedQuery));
      const matchesRarity = rarity === "All" || card.rarity === rarity;
      const matchesSet = cardSet === "All" || getCardSet(card) === cardSet;

      return matchesQuery && matchesRarity && matchesSet;
    });
  }, [cardSet, query, rarity]);

  const deckCards = sortCardsForShowcase(
    runDeck
      .map((entry) => cards.find((card) => card.id === entry.cardId))
      .filter((card): card is Card => Boolean(card)),
  );

  return (
    <ScreenFrame>
      <div className="collection-screen">
        <GamePanel className="collection-toolbar">
          <div className="collection-title-block">
            <p>Card Archive</p>
            <h2>Collection</h2>
          </div>

          <div className="collection-mode-toggle" role="tablist" aria-label="Collection mode">
            <button
              className={mode === "collection" ? "is-active" : ""}
              onClick={() => setMode("collection")}
              type="button"
            >
              Collection
            </button>
            <button
              className={mode === "deck" ? "is-active" : ""}
              onClick={() => setMode("deck")}
              type="button"
            >
              Deck Builder
            </button>
          </div>

          <label className="collection-search">
            <span>Search</span>
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name, type, text, tag"
              value={query}
            />
          </label>

          <FilterRail
            active={rarity}
            label="Rarity"
            options={cardRarityFilters}
            onChange={setRarity}
          />
          <FilterRail
            active={cardSet}
            label="Set"
            options={cardSetFilters}
            onChange={setCardSet}
          />
        </GamePanel>

        <GamePanel className="collection-card-stage game-scroll">
          <div className="collection-card-grid">
            {filteredCards.map((card) => (
              <div
                className={`collection-card-cell ${
                  isShowcaseCard(card) ? "is-showcase-card" : ""
                }`}
                key={card.id}
              >
                <CollectibleCard
                  card={card}
                  onClick={() => setSelectedCard(card)}
                  size="collection"
                />
                {mode === "deck" && (
                  <div className="collection-deck-actions">
                    <button onClick={() => onRemoveFromDeck(card.id)} type="button">
                      -
                    </button>
                    <span>{deckCounts.get(card.id) ?? 0}</span>
                    <button onClick={() => onAddToDeck(card.id)} type="button">
                      +
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </GamePanel>

        <GamePanel className="collection-deck-panel">
          <p className="collection-panel-eyebrow">
            {mode === "deck" ? "Current Run Deck" : "Card Viewer"}
          </p>
          {mode === "deck" ? (
            <>
              <h3>{runDeck.reduce((total, entry) => total + entry.quantity, 0)} cards</h3>
              <div className="collection-deck-list game-scroll">
                {deckCards.map((card) => (
                  <button
                    className="collection-deck-row"
                    key={card.id}
                    onClick={() => setSelectedCard(card)}
                    type="button"
                  >
                    <span>{card.name}</span>
                    <strong>x{deckCounts.get(card.id) ?? 0}</strong>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <h3>The collectible foundation.</h3>
              <p className="collection-panel-copy">
                Showcase cards appear first. This archive is the future home
                for deck-building while preserving art, lore fields, source
                tier, references, theology note, and gameplay role.
              </p>
              <PrimaryButton
                disabled={!filteredCards[0]}
                onClick={() => filteredCards[0] && setSelectedCard(filteredCards[0])}
                tone="secondary"
              >
                View First Card
              </PrimaryButton>
            </>
          )}
        </GamePanel>
      </div>

      {selectedCard && (
        <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(undefined)} />
      )}
    </ScreenFrame>
  );
}

interface FilterRailProps<T extends string> {
  active: T;
  label: string;
  onChange: (value: T) => void;
  options: T[];
}

function FilterRail<T extends string>({
  active,
  label,
  onChange,
  options,
}: FilterRailProps<T>) {
  return (
    <div className="collection-filter-rail">
      <span>{label}</span>
      <div>
        {options.map((option) => (
          <button
            className={option === active ? "is-active" : ""}
            key={option}
            onClick={() => onChange(option)}
            type="button"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
