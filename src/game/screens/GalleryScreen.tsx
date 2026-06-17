"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { CardArtwork } from "@/components/CardArtwork";
import { GamePanel } from "@/components/GamePanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenFrame } from "@/components/ScreenFrame";
import { artAssets, type ArtAsset } from "@/data/artAssets";
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

type GalleryEntry =
  | {
      kind: "asset";
      asset: ArtAsset;
      id: string;
      title: string;
      saga: CardSet;
      eyebrow: string;
      description: string;
      tags: string[];
    }
  | {
      kind: "card";
      card: Card;
      id: string;
      title: string;
      saga: CardSet;
      eyebrow: string;
      description: string;
      tags: string[];
    };

export function GalleryScreen() {
  const [rarity, setRarity] = useState<CardRarity | "All">("All");
  const [cardSet, setCardSet] = useState<CardSet | "All">("All");
  const [sortMode, setSortMode] = useState<GallerySort>("Showcase");
  const [expandedEntry, setExpandedEntry] = useState<GalleryEntry>();

  const galleryEntries = useMemo(() => {
    const filteredAssets = artAssets.filter((asset) => {
      const matchesRarity = rarity === "All";
      const matchesSet = cardSet === "All" || asset.saga === cardSet;

      return matchesRarity && matchesSet;
    });

    const assetEntries = filteredAssets.map(toAssetGalleryEntry);

    const filteredCards = getArtworkCards(cards).filter((card) => {
      const matchesRarity = rarity === "All" || card.rarity === rarity;
      const matchesSet = cardSet === "All" || getCardSet(card) === cardSet;

      return matchesRarity && matchesSet;
    });

    const cardEntries = filteredCards.map(toCardGalleryEntry);

    if (sortMode === "Set") {
      return [...assetEntries, ...cardEntries].sort((first, second) => {
        const setDifference = first.saga.localeCompare(second.saga);

        return setDifference === 0
          ? first.title.localeCompare(second.title)
          : setDifference;
      });
    }

    if (sortMode === "Rarity") {
      return [
        ...assetEntries,
        ...sortCardsForShowcase(filteredCards).map(toCardGalleryEntry),
      ];
    }

    return [...assetEntries, ...cardEntries];
  }, [cardSet, rarity, sortMode]);

  return (
    <ScreenFrame>
      <div className="gallery-screen">
        <GamePanel className="gallery-header-panel">
          <div>
            <p>Showcase Art</p>
            <h2>Gallery</h2>
            <span>
              Artwork and concept pieces for Covenant: Legacies, separate from
              deck-building and codex records.
            </span>
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
          {galleryEntries.map((entry) => (
            <button
              className={getGalleryTileClassName(entry)}
              key={entry.id}
              onClick={() => setExpandedEntry(entry)}
              type="button"
            >
              {entry.kind === "card" ? (
                <CardArtwork card={entry.card} variant="gallery" />
              ) : (
                <GalleryAssetArtwork asset={entry.asset} variant="gallery" />
              )}
              <span>{entry.eyebrow}</span>
              <strong>{entry.title}</strong>
              <small>{entry.saga}</small>
              <em>{entry.description}</em>
              <div className="gallery-tile-tags" aria-label="Gallery tags">
                {entry.tags.slice(0, 3).map((tag) => (
                  <b key={tag}>{tag}</b>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {expandedEntry && (
        <div className="gallery-fullscreen" role="dialog" aria-modal="true">
          <div className="gallery-fullscreen-art">
            {expandedEntry.kind === "card" ? (
              <CardArtwork card={expandedEntry.card} priority variant="galleryLarge" />
            ) : (
              <GalleryAssetArtwork
                asset={expandedEntry.asset}
                priority
                variant="galleryLarge"
              />
            )}
          </div>
          <GamePanel className="gallery-fullscreen-copy game-scroll">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p>{expandedEntry.eyebrow}</p>
                <h2>{expandedEntry.title}</h2>
              </div>
              <PrimaryButton onClick={() => setExpandedEntry(undefined)} tone="secondary">
                Close
              </PrimaryButton>
            </div>
            {expandedEntry.kind === "card" ? (
              <CardGalleryDetails card={expandedEntry.card} />
            ) : (
              <AssetGalleryDetails asset={expandedEntry.asset} />
            )}
          </GamePanel>
        </div>
      )}
    </ScreenFrame>
  );
}

function toCardGalleryEntry(card: Card): GalleryEntry {
  return {
    kind: "card",
    card,
    id: card.id,
    title: card.artworkTitle ?? card.name,
    saga: getCardSet(card),
    eyebrow: card.rarity,
    description: card.flavorText ?? card.text,
    tags: card.visualTags ?? [],
  };
}

function toAssetGalleryEntry(asset: ArtAsset): GalleryEntry {
  return {
    kind: "asset",
    asset,
    id: asset.id,
    title: asset.title,
    saga: asset.saga,
    eyebrow: formatUsageStatus(asset.usageStatus),
    description: asset.notes,
    tags: asset.tags,
  };
}

function getGalleryTileClassName(entry: GalleryEntry) {
  if (entry.kind === "card") {
    return `gallery-art-tile gallery-art-${entry.card.rarity.toLowerCase().replaceAll(" ", "-")}`;
  }

  return `gallery-art-tile gallery-art-concept gallery-art-sensitivity-${entry.asset.theologicalSensitivity}`;
}

function GalleryAssetArtwork({
  asset,
  priority = false,
  variant,
}: {
  asset: ArtAsset;
  priority?: boolean;
  variant: "gallery" | "galleryLarge";
}) {
  const sizes =
    variant === "galleryLarge" ? "(max-width: 900px) 95vw, 70vw" : "360px";

  return (
    <div className={`card-artwork card-artwork-${variant} gallery-asset-art`}>
      <Image
        alt={asset.title}
        className="card-artwork-image"
        fill
        loading={priority ? undefined : "lazy"}
        priority={priority}
        sizes={sizes}
        src={asset.path}
      />
      <div className="card-artwork-vignette" aria-hidden="true" />
    </div>
  );
}

function CardGalleryDetails({ card }: { card: Card }) {
  return (
    <>
      <p className="gallery-flavor">{card.flavorText}</p>
      <p>{card.theologyNote}</p>
      <div className="card-tag-row">
        {(card.visualTags ?? []).map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <p className="card-detail-credit">
        {getCardSet(card)} / {card.artistCredit ?? "Art pending"}
      </p>
    </>
  );
}

function AssetGalleryDetails({ asset }: { asset: ArtAsset }) {
  return (
    <>
      <p className="gallery-flavor">{asset.notes}</p>
      <p className="gallery-meta-note">
        {asset.saga} / {formatSourceType(asset.sourceType)} /{" "}
        {formatUsageStatus(asset.usageStatus)}
      </p>
      <div className="card-tag-row">
        {asset.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <p className="card-detail-credit">
        {asset.generationTool} / {formatSensitivity(asset.theologicalSensitivity)}{" "}
        sensitivity / Generated for Covenant: Legacies
      </p>
    </>
  );
}

function formatUsageStatus(status: ArtAsset["usageStatus"]) {
  return status
    .split("-")
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}

function formatSourceType(sourceType: ArtAsset["sourceType"]) {
  if (sourceType === "ai-generated-openai") {
    return "OpenAI concept art";
  }

  return sourceType;
}

function formatSensitivity(sensitivity: ArtAsset["theologicalSensitivity"]) {
  return sensitivity[0]?.toUpperCase() + sensitivity.slice(1);
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
