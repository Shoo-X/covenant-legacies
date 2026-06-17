import Image from "next/image";
import type { Card } from "@/types/game";

interface CardArtworkProps {
  card: Card;
  className?: string;
  loading?: "eager" | "lazy";
  priority?: boolean;
  variant?: "card" | "gallery" | "banner";
}

export function CardArtwork({
  card,
  className = "",
  loading = "lazy",
  priority = false,
  variant = "card",
}: CardArtworkProps) {
  if (!card.imagePath) {
    return (
      <div className={`card-artwork card-artwork-placeholder card-artwork-${variant} ${className}`}>
        <span>{card.artworkTitle ?? card.name}</span>
      </div>
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
        sizes={
          variant === "banner"
            ? "100vw"
            : "(max-width: 768px) 72vw, (max-width: 1280px) 28vw, 22vw"
        }
        src={card.imagePath}
      />
      <div className="card-artwork-vignette" aria-hidden="true" />
    </div>
  );
}
