"use client";

import { useMemo, useState } from "react";
import { CardArtwork } from "@/components/CardArtwork";
import { GamePanel } from "@/components/GamePanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenFrame } from "@/components/ScreenFrame";
import { cards } from "@/data/cards";
import {
  cardRarityFilters,
  cardSetFilters,
  getArtworkCards,
  getCardSet,
  sortCardsForShowcase,
} from "@/game/cardArt";
import type { Card, CardRarity, CardSet } from "@/types/game";

type GallerySort = "Showcase" | "Rarity" | "Set";

export function GalleryScreen() {
  const [rarity, setRarity] = useState<CardRarity | "All">("All");
  const [cardSet, setCardSet] = useState<CardSet | "All">("All");
  const [sortMode, setSortMode] = useState<GallerySort>("Showcase");
  const [expandedCard, setExpandedCard] = useState<Card>();

  const artworkCards = useMemo(() => {
    const filtered = getArtworkCards(cards).filter((card) => {
      const matchesRarity = rarity === "All" || card.rarity === rarity;
      const matchesSet = cardSet === "All" || getCardSet(card) === cardSet;

      return matchesRarity && matchesSet;
    });

    if (sortMode === "Set") {
      return [...filtered].sort((first, second) => {
        const setDifference = getCardSet(first).localeCompare(getCardSet(second));

        return setDifference === 0
          ? first.name.localeCompare(second.name)
          : setDifference;
      });
    }

    return sortMode === "Rarity" ? sortCardsForShowcase(filtered) : filtered;
  }, [cardSet, rarity, sortMode]);

  return (
    <ScreenFrame>
      <div className="gallery-screen">
        <GamePanel className="gallery-header-panel">
          <div>
            <p>Art Gallery</p>
            <h2>Unlocked Artwork</h2>
          </div>

          <div className="gallery-controls">
            <SelectRail
              active={sortMode}
              label="Sort"
              onChange={setSortMode}
              options={["Showcase", "Rarity", "Set"]}
            />
            <SelectRail
              active={rarity}
              label="Rarity"
              onChange={setRarity}
              options={cardRarityFilters}
            />
            <SelectRail
              active={cardSet}
              label="Set"
              onChange={setCardSet}
              options={cardSetFilters}
            />
          </div>
        </GamePanel>

        <div className="gallery-grid game-scroll">
          {artworkCards.map((card) => (
            <button
              className={`gallery-art-tile gallery-art-${card.rarity.toLowerCase().replaceAll(" ", "-")}`}
              key={card.id}
              onClick={() => setExpandedCard(card)}
              type="button"
            >
              <CardArtwork card={card} variant="gallery" />
              <span>{card.rarity}</span>
              <strong>{card.artworkTitle ?? card.name}</strong>
              <em>{card.flavorText}</em>
            </button>
          ))}
        </div>
      </div>

      {expandedCard && (
        <div className="gallery-fullscreen" role="dialog" aria-modal="true">
          <div className="gallery-fullscreen-art">
            <CardArtwork card={expandedCard} priority variant="gallery" />
          </div>
          <GamePanel className="gallery-fullscreen-copy game-scroll">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p>{expandedCard.rarity}</p>
                <h2>{expandedCard.artworkTitle ?? expandedCard.name}</h2>
              </div>
              <PrimaryButton onClick={() => setExpandedCard(undefined)} tone="secondary">
                Close
              </PrimaryButton>
            </div>
            <p className="gallery-flavor">{expandedCard.flavorText}</p>
            <p>{expandedCard.theologyNote}</p>
            <div className="card-tag-row">
              {(expandedCard.visualTags ?? []).map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <p className="card-detail-credit">
              {getCardSet(expandedCard)} / {expandedCard.artistCredit ?? "Art pending"}
            </p>
          </GamePanel>
        </div>
      )}
    </ScreenFrame>
  );
}

interface SelectRailProps<T extends string> {
  active: T;
  label: string;
  onChange: (value: T) => void;
  options: T[];
}

function SelectRail<T extends string>({
  active,
  label,
  onChange,
  options,
}: SelectRailProps<T>) {
  return (
    <label>
      <span>{label}</span>
      <select onChange={(event) => onChange(event.target.value as T)} value={active}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
