import { formatCardCost } from "@/game/cardText";
import type { Card } from "@/types/game";

interface CollectibleCardProps {
  card: Card;
  disabled?: boolean;
  isPlayable?: boolean;
  isSelected?: boolean;
  onBlur?: () => void;
  onClick?: () => void;
  onFocus?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  size?: "reward" | "hand";
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

export function CollectibleCard({
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

  return (
    <button
      className={`tcg-card tcg-card-${size} tcg-card-${tone} ${
        isPlayable ? "is-playable" : "is-unplayable"
      } ${isSelected ? "is-selected" : ""}`}
      disabled={disabled || !isPlayable}
      onBlur={onBlur}
      onClick={onClick}
      onFocus={onFocus}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      title={card.text}
      type="button"
    >
      <div className="tcg-card-inner">
        <div className="tcg-card-header">
          <h3>{card.name}</h3>
          <span>{formatCardCost(card)}</span>
        </div>

        <div className={`tcg-card-art tcg-card-art-${artSymbol}`} aria-hidden="true">
          <div className="tcg-card-sigil" />
        </div>

        <div className="tcg-card-type-line">{card.type}</div>

        <div className="tcg-card-effect">
          <p>{card.text}</p>
        </div>

        <div className="tcg-card-footer">
          <span>{card.rarity}</span>
          <span>{card.sourceTier}</span>
        </div>
      </div>
    </button>
  );
}
