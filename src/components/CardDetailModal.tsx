"use client";

import { CardArtwork } from "@/components/CardArtwork";
import { CollectibleCard } from "@/components/CollectibleCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import type { Card } from "@/types/game";

interface CardDetailModalProps {
  card: Card;
  onClose: () => void;
}

export function CardDetailModal({ card, onClose }: CardDetailModalProps) {
  return (
    <div className="card-detail-overlay" role="dialog" aria-modal="true">
      <div className="card-detail-modal">
        <div className="card-detail-preview">
          <CollectibleCard as="article" card={card} size="inspect" />
        </div>

        <div className="card-detail-copy game-scroll">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-gold)]">
                {card.cardSet ?? "Core Covenant"}
              </p>
              <h2>{card.name}</h2>
            </div>
            <PrimaryButton onClick={onClose} tone="secondary">
              Close
            </PrimaryButton>
          </div>

          <CardArtwork card={card} className="card-detail-art" />

          <dl className="card-detail-facts">
            <Fact label="Rarity" value={card.rarity} />
            <Fact label="Type" value={card.type} />
            <Fact label="Source Tier" value={card.sourceTier} />
            <Fact label="Gameplay Role" value={card.gameplayRole} />
          </dl>

          <section>
            <h3>Card Text</h3>
            <p>{card.text}</p>
          </section>

          {card.flavorText && (
            <section>
              <h3>Flavor</h3>
              <p className="card-detail-flavor">{card.flavorText}</p>
            </section>
          )}

          <section>
            <h3>Theology Note</h3>
            <p>{card.theologyNote}</p>
          </section>

          <section>
            <h3>References</h3>
            <p>{card.references.join(", ")}</p>
          </section>

          {card.visualTags && card.visualTags.length > 0 && (
            <section>
              <h3>Visual Tags</h3>
              <div className="card-tag-row">
                {card.visualTags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </section>
          )}

          <p className="card-detail-credit">
            {card.artworkTitle ?? "Placeholder artwork"} /{" "}
            {card.artistCredit ?? "Art pending"}
          </p>
        </div>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
