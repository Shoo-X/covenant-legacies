import Image from "next/image";
import { SymbolicArt } from "@/components/SymbolicArt";
import type { Card } from "@/types/game";

interface CardArtworkProps {
  card: Card;
  className?: string;
  imageFit?: "contain" | "cover";
  loading?: "eager" | "lazy";
  priority?: boolean;
  showLabel?: boolean;
  variant?:
    | "card"
    | "hand"
    | "preview"
    | "reward"
    | "inspect"
    | "collection"
    | "gallery"
    | "galleryLarge"
    | "keyArt"
    | "banner";
}

const imageSizesByVariant: Record<NonNullable<CardArtworkProps["variant"]>, string> = {
  banner: "(max-width: 900px) 90vw, 45vw",
  card: "180px",
  collection: "220px",
  gallery: "(max-width: 768px) 90vw, 360px",
  galleryLarge: "(max-width: 900px) 95vw, 70vw",
  hand: "120px",
  inspect: "420px",
  keyArt: "(max-width: 900px) 90vw, 45vw",
  preview: "160px",
  reward: "260px",
};

export function CardArtwork({
  card,
  className = "",
  imageFit,
  loading = "lazy",
  priority = false,
  showLabel = true,
  variant = "card",
}: CardArtworkProps) {
  if (!card.imagePath) {
    return (
      <SymbolicArt
        className={`card-artwork card-artwork-${variant} ${className}`}
        kind="card"
        label={card.artworkTitle ?? card.name}
        showLabel={showLabel}
        subject={card}
        variant={
          variant === "banner" || variant === "galleryLarge" || variant === "keyArt"
            ? "wide"
            : "card"
        }
      />
    );
  }

  const resolvedImageFit = imageFit ?? card.imageObjectFit ?? (variant === "inspect" ? "contain" : "cover");
  const imageObjectPosition = card.imageObjectPosition ?? "50% 50%";
  const preserveComposition = resolvedImageFit === "contain";

  return (
    <div className={`card-artwork card-artwork-${variant} ${className}`}>
      {preserveComposition && (
        <Image
          alt=""
          aria-hidden="true"
          className="card-artwork-image card-artwork-image-backdrop"
          fill
          loading={priority ? undefined : loading}
          priority={priority}
          sizes={imageSizesByVariant[variant]}
          src={card.imagePath}
          style={{
            objectFit: "cover",
            objectPosition: imageObjectPosition,
          }}
        />
      )}
      <Image
        alt={card.artworkTitle ?? card.name}
        className={`card-artwork-image ${preserveComposition ? "card-artwork-image-contained" : ""}`}
        fill
        loading={priority ? undefined : loading}
        priority={priority}
        sizes={imageSizesByVariant[variant]}
        src={card.imagePath}
        style={{
          objectFit: resolvedImageFit,
          objectPosition: imageObjectPosition,
        }}
      />
      <div className="card-artwork-vignette" aria-hidden="true" />
    </div>
  );
}
