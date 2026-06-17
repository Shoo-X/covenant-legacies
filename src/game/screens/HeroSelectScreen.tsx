import { cards } from "@/data/cards";
import { heroes } from "@/data/heroes";
import { CollectibleCard } from "@/components/CollectibleCard";
import { GamePanel } from "@/components/GamePanel";
import { PlaceholderArt } from "@/components/PlaceholderArt";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ResourceStrip } from "@/components/ResourceStrip";
import { ScreenFrame } from "@/components/ScreenFrame";
import type { GameScreen } from "@/types/game";

interface HeroSelectScreenProps {
  onNavigate: (screen: GameScreen) => void;
}

export function HeroSelectScreen({ onNavigate }: HeroSelectScreenProps) {
  const cardsById = new Map(cards.map((card) => [card.id, card]));

  return (
    <ScreenFrame>
      <div className="grid h-full min-h-0 gap-3 xl:grid-cols-[0.76fr_1.24fr]">
        <GamePanel className="flex min-h-0 flex-col justify-between p-4 md:p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)]">
              Calling
            </p>
            <h2 className="mt-2 text-3xl font-black leading-tight text-[#fff3cf] md:text-5xl">
              Select a covenant bearer.
            </h2>
            <p className="mt-3 text-sm leading-6 text-[rgba(241,228,194,0.7)]">
              The Shepherd King is a courage, worship, guard, and anti-giant
              archetype.
            </p>
          </div>
          <div className="mt-4">
            <PrimaryButton onClick={() => onNavigate("map")}>
              Begin With {heroes[0].name}
            </PrimaryButton>
          </div>
        </GamePanel>

        <div className="grid h-full min-h-0 gap-3">
        {heroes.map((hero, index) => (
          <article className="grid h-full min-h-0 gap-3 overflow-hidden border border-[rgba(215,180,93,0.18)] bg-[rgba(255,255,255,0.035)] p-4 lg:grid-cols-[0.7fr_1.3fr]" key={hero.id}>
            <div className="min-h-0">
              <PlaceholderArt
                label={hero.name}
                subject={hero}
                tone={index === 0 ? "gold" : "indigo"}
              />
            </div>
            <div className="flex min-h-0 flex-col gap-3 overflow-hidden">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-[var(--color-gold)]">
                  {hero.epithet}
                </p>
                <h3 className="mt-1 text-2xl font-semibold text-[#fff3cf] md:text-3xl">
                  {hero.name}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[rgba(241,228,194,0.72)]">
                  {hero.calling}
                </p>
                <div className="mt-3 rounded-md border border-[rgba(215,180,93,0.18)] bg-[rgba(255,255,255,0.04)] p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-gold)]">
                    Passive
                  </p>
                  <p className="mt-2 font-semibold text-[#fff3cf]">
                    {hero.passive.name}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[rgba(241,228,194,0.7)]">
                    {hero.passive.text}
                  </p>
                </div>
                <div className="mt-5">
                  <ResourceStrip resources={hero.resourceState} />
                </div>
              </div>

            <div className="min-h-0 rounded-md border border-[rgba(215,180,93,0.18)] bg-[rgba(255,255,255,0.035)] p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-gold)]">
                Starting Deck
              </p>
              <div className="starting-deck-preview-grid game-scroll mt-3">
                {hero.startingDeck.map((deckCard) => {
                  const card = cardsById.get(deckCard.cardId);

                  if (!card) {
                    return null;
                  }

                  return (
                    <div className="starting-deck-preview-card" key={deckCard.cardId}>
                      <CollectibleCard as="article" card={card} size="preview" />
                      <span className="starting-deck-quantity">x{deckCard.quantity}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            </div>
          </article>
        ))}
      </div>
      </div>
    </ScreenFrame>
  );
}
