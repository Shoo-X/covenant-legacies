"use client";

import { CardArtwork } from "@/components/CardArtwork";
import {
  ResourceConsequenceBadge,
  ResourceCostDisplay,
} from "@/components/ResourceBadge";
import { getCardCorruptionGain } from "@/game/cardCosts";
import { useAudio } from "@/audio/useAudio";
import Image from "next/image";
import type { Card, ResourceCost } from "@/types/game";

interface CollectibleCardProps {
  as?: "article" | "button";
  card: Card;
  costs?: ResourceCost[];
  disabled?: boolean;
  affordabilityNote?: string;
  isPlayable?: boolean;
  isSelected?: boolean;
  missingCosts?: ResourceCost[];
  onBlur?: () => void;
  onClick?: () => void;
  onFocus?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  size?: "reward" | "hand" | "collection" | "preview" | "inspect" | "viewer";
}

function getCardTone(card: Card) {
  if (card.type.includes("Forbidden")) {
    return "forbidden";
  }

  if (card.rarity === "Mystery") {
    return "mystery";
  }

  if (card.type.includes("Prayer") || card.type.includes("Psalm")) {
    return "sacred";
  }

  if (
    card.type.includes("Intervention") ||
    card.type.includes("Judgment") ||
    card.type.includes("Legacy") ||
    card.type.includes("Witness")
  ) {
    return "sacred";
  }

  if (card.type.includes("Attack")) {
    return "attack";
  }

  return "covenant";
}

function getArtSymbol(card: Card) {
  if (card.type.includes("Forbidden")) {
    return "warning";
  }

  if (card.type.includes("Prayer") || card.type.includes("Psalm")) {
    return "song";
  }

  if (card.type.includes("Guard")) {
    return "shield";
  }

  if (card.type.includes("Attack")) {
    return "stone";
  }

  if (card.type.includes("Covenant")) {
    return "seal";
  }

  if (
    card.type.includes("Intervention") ||
    card.type.includes("Legacy") ||
    card.type.includes("Witness")
  ) {
    return "seal";
  }

  return "altar";
}

function getRarityClass(card: Card) {
  return card.rarity.toLowerCase().replaceAll(" ", "-");
}

function getSourceAbbreviation(card: Card) {
  if (card.sourceTier === "Interpretive Tradition") {
    return "Trad.";
  }

  if (card.sourceTier === "Biblical Inference") {
    return "Infer.";
  }

  if (card.sourceTier === "Speculative Fiction") {
    return "Spec.";
  }

  return "Script.";
}

const fullArtSizesByDisplaySize: Record<string, string> = {
  collection: "220px",
  hand: "120px",
  inspect: "420px",
  preview: "160px",
  reward: "260px",
};

export function CollectibleCard({
  affordabilityNote,
  as,
  card,
  costs,
  disabled = false,
  isPlayable = true,
  isSelected = false,
  missingCosts = [],
  onBlur,
  onClick,
  onFocus,
  onMouseEnter,
  onMouseLeave,
  size = "reward",
}: CollectibleCardProps) {
  const { playSound } = useAudio();
  const tone = getCardTone(card);
  const artSymbol = getArtSymbol(card);
  const rarityClass = getRarityClass(card);
  const displaySize = size === "viewer" ? "inspect" : size;
  const displayedCosts = costs ?? card.cost;
  const showResourceLabels = displaySize === "inspect" || displaySize === "reward";
  const costVariant =
    displaySize === "hand" ? "hand" : showResourceLabels ? "full" : "compact";
  const corruptionConsequence = getCardCorruptionGain(card);
  const hasFullCardArt = Boolean(card.imagePath);
  const isInteractive = as
    ? as === "button"
    : Boolean(onClick || onFocus || onMouseEnter || onMouseLeave);
  const frameClass = `tcg-card tcg-card-${displaySize} tcg-card-${tone} tcg-card-rarity-${rarityClass} ${
    isPlayable ? "is-playable" : "is-unplayable"
  } ${isSelected ? "is-selected" : ""} ${hasFullCardArt ? "is-full-art" : ""}`;
  const body = (
    <div className="tcg-card-inner">
      {card.imagePath && (
        <div className="tcg-card-background-art" aria-hidden="true">
          <Image
            alt=""
            className="tcg-card-background-backdrop"
            fill
            loading={displaySize === "hand" ? "eager" : "lazy"}
            sizes={fullArtSizesByDisplaySize[displaySize] ?? "220px"}
            src={card.imagePath}
            style={{
              objectFit: "cover",
              objectPosition: card.imageObjectPosition ?? "50% 50%",
            }}
          />
          <Image
            alt=""
            className="tcg-card-background-image"
            fill
            loading={displaySize === "hand" ? "eager" : "lazy"}
            sizes={fullArtSizesByDisplaySize[displaySize] ?? "220px"}
            src={card.imagePath}
            style={{
              objectFit: "contain",
              objectPosition: card.imageObjectPosition ?? "50% 50%",
            }}
          />
          <div className="tcg-card-background-vignette" />
        </div>
      )}

      <div className="tcg-card-header">
        <h3 className="tcg-card-title">{card.name}</h3>
        <span className="tcg-card-cost-cluster">
          <ResourceCostDisplay
            costs={displayedCosts}
            missingCosts={missingCosts}
            showLabels={showResourceLabels}
            unplayable={card.isPlayable === false}
            variant={costVariant}
          />
          <ResourceConsequenceBadge
            amount={corruptionConsequence}
            showLabel={showResourceLabels}
            variant={costVariant}
          />
        </span>
      </div>

      {hasFullCardArt ? (
        <div
          aria-hidden="true"
          className={`tcg-card-art tcg-card-art-full-reveal tcg-card-art-${artSymbol}`}
        />
      ) : (
        <CardArtwork
          card={card}
          className={`tcg-card-art tcg-card-art-${artSymbol}`}
          loading={displaySize === "hand" ? "eager" : "lazy"}
          priority={card.imagePath !== undefined && displaySize === "reward"}
          showLabel={false}
          variant={
            displaySize === "collection" ||
            displaySize === "hand" ||
            displaySize === "inspect" ||
            displaySize === "preview" ||
            displaySize === "reward"
              ? displaySize
              : "card"
          }
        />
      )}

      <div className="tcg-card-type-line">{card.type}</div>

      <div className="tcg-card-effect">
        <p>{card.text}</p>
        {card.flavorText && <em>{card.flavorText}</em>}
      </div>

      <div className="tcg-card-footer">
        <span className="tcg-card-rarity-label">{card.rarity}</span>
        <span
          className="tcg-card-source-badge"
          data-short-source={getSourceAbbreviation(card)}
          title={card.sourceTier}
        >
          {card.sourceTier}
        </span>
      </div>

      {displaySize === "reward" && <span className="tcg-card-choose">Choose Card</span>}
    </div>
  );
  const handleMouseEnter = () => {
    playSound("card.hover");
    onMouseEnter?.();
  };

  if (!isInteractive) {
    return (
      <article className={frameClass} title={affordabilityNote ?? card.text}>
        {body}
      </article>
    );
  }

  return (
    <button
      className={frameClass}
      aria-disabled={!isPlayable}
      disabled={disabled}
      onBlur={onBlur}
      onClick={isPlayable ? onClick : undefined}
      onFocus={onFocus}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onMouseLeave}
      title={affordabilityNote ? `${affordabilityNote} ${card.text}` : card.text}
      type="button"
    >
      {body}
    </button>
  );
}
