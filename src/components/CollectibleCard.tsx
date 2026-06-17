import { formatCardCost } from "@/game/cardText";
import { CardArtwork } from "@/components/CardArtwork";
import type { Card } from "@/types/game";

interface CollectibleCardProps {
  as?: "article" | "button";
  card: Card;
  disabled?: boolean;
  isPlayable?: boolean;
  isSelected?: boolean;
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

  return "altar";
}

function getRarityClass(card: Card) {
  return card.rarity.toLowerCase().replaceAll(" ", "-");
}

function getSourceAbbreviation(card: Card) {
  if (card.sourceTier === "Interpretive Tradition") {
    return "Trad.";
  }

  if (card.sourceTier === "Speculative Fiction") {
    return "Spec.";
  }

  return "Script.";
}

export function CollectibleCard({
  as,
  card,
  disabled = false,
  isPlayable = true,
  isSelected = false,
  onBlur,
  onClick,
  onFocus,
  onMouseEnter,
  onMouseLeave,
  size = "reward",
}: CollectibleCardProps) {
  const tone = getCardTone(card);
  const artSymbol = getArtSymbol(card);
  const rarityClass = getRarityClass(card);
  const displaySize = size === "viewer" ? "inspect" : size;
  const isInteractive = as
    ? as === "button"
    : Boolean(onClick || onFocus || onMouseEnter || onMouseLeave);
  const frameClass = `tcg-card tcg-card-${displaySize} tcg-card-${tone} tcg-card-rarity-${rarityClass} ${
    isPlayable ? "is-playable" : "is-unplayable"
  } ${isSelected ? "is-selected" : ""}`;
  const body = (
    <div className="tcg-card-inner">
      <div className="tcg-card-header">
        <h3 className="tcg-card-title">{card.name}</h3>
        <span className="tcg-card-cost-gem" aria-label={`Cost ${formatCardCost(card)}`}>
          {formatCardCost(card)}
        </span>
      </div>

      <CardArtwork
        card={card}
        className={`tcg-card-art tcg-card-art-${artSymbol}`}
        loading={displaySize === "hand" ? "eager" : "lazy"}
        priority={card.imagePath !== undefined && displaySize === "reward"}
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

  if (!isInteractive) {
    return (
      <article className={frameClass} title={card.text}>
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
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      title={card.text}
      type="button"
    >
      {body}
    </button>
  );
}
