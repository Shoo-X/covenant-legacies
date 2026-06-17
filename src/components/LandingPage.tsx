import { CardArtwork } from "@/components/CardArtwork";
import { OrnamentalDivider } from "@/components/OrnamentalDivider";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenFrame } from "@/components/ScreenFrame";
import { cards, showcaseCardIds } from "@/data/cards";

interface LandingPageProps {
  onOpenCodex: () => void;
  onStart: () => void;
}

export function LandingPage({ onOpenCodex, onStart }: LandingPageProps) {
  const showcaseCards = showcaseCardIds
    .map((id) => cards.find((card) => card.id === id))
    .filter((card): card is NonNullable<typeof card> => Boolean(card));
  const featuredCard = showcaseCards[0];

  return (
    <main className="h-[100dvh] w-screen overflow-hidden bg-[var(--color-void)] text-[var(--color-ink)]">
      <ScreenFrame variant="title">
        <section className="landing-title-screen">
          <div className="landing-copy-panel">
            <p className="mb-4 text-[0.68rem] uppercase tracking-[0.36em] text-[var(--color-gold)]">
              First Saga: War of the Watchers
            </p>
            <h1 className="title-lockup landing-title">
              COVENANT:
              <span>
                LEGACIES
              </span>
            </h1>
            <OrnamentalDivider />
            <p className="max-w-2xl text-xl leading-8 text-[#fff3cf] md:text-2xl">
              A Biblical Fantasy Trading Card Game
            </p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[rgba(241,228,194,0.72)]">
              Build your deck, guard the covenant, and enter an epic saga of
              giants, deliverance, witness, and heavenly judgment.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <PrimaryButton onClick={onStart}>Start Run</PrimaryButton>
              <PrimaryButton disabled tone="secondary">
                No Saved Run
              </PrimaryButton>
              <PrimaryButton onClick={onOpenCodex} tone="secondary">
                Codex
              </PrimaryButton>
            </div>
          </div>

          <div className="key-art-frame landing-showcase-frame h-[min(74dvh,48rem)] min-h-[26rem]">
            {featuredCard && (
              <CardArtwork card={featuredCard} priority variant="banner" />
            )}
            <div className="landing-showcase-strip" aria-hidden="true">
              {showcaseCards.slice(1).map((card) => (
                <CardArtwork card={card} key={card.id} variant="gallery" />
              ))}
            </div>
          </div>
        </section>
      </ScreenFrame>
    </main>
  );
}
