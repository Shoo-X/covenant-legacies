import Image from "next/image";
import { SymbolicArt } from "@/components/SymbolicArt";
import type { Card } from "@/types/game";

interface CardArtworkProps {
  card: Card;
  className?: string;
  loading?: "eager" | "lazy";
  priority?: boolean;
  variant?:
    | "card"
    | "hand"
    | "preview"
    | "reward"
    | "inspect"
    | "collection"
    | "gallery"
    | "banner";
}

const imageSizesByVariant: Record<NonNullable<CardArtworkProps["variant"]>, string> = {
  banner: "(max-width: 900px) 90vw, 45vw",
  card: "180px",
  collection: "(max-width: 768px) 45vw, 220px",
  gallery: "(max-width: 768px) 90vw, 360px",
  hand: "120px",
  inspect: "420px",
  preview: "160px",
  reward: "260px",
};

export function CardArtwork({
  card,
  className = "",
  loading = "lazy",
  priority = false,
  variant = "card",
}: CardArtworkProps) {
  if (!card.imagePath) {
    return (
      <SymbolicArt
        className={`card-artwork card-artwork-${variant} ${className}`}
        kind="card"
        label={card.artworkTitle ?? card.name}
        subject={card}
        variant={variant === "banner" ? "wide" : "card"}
      />
    );
  }

  return (
    <div className={`card-artwork card-artwork-${variant} ${className}`}>
      <Image
        alt={card.artworkTitle ?? card.name}
        className="card-artwork-image"
        fill
        loading={priority ? undefined : loading}
        priority={priority}
        sizes={imageSizesByVariant[variant]}
        src={card.imagePath}
      />
      <div className="card-artwork-vignette" aria-hidden="true" />
    </div>
  );
}
