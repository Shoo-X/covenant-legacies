import { CardArtwork } from "@/components/CardArtwork";
import { cards, showcaseCardIds } from "@/data/cards";
import { GamePanel } from "@/components/GamePanel";
import { OrnamentalDivider } from "@/components/OrnamentalDivider";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenFrame } from "@/components/ScreenFrame";
import type { GameScreen } from "@/types/game";

interface HomeScreenProps {
  hasRun: boolean;
  onContinueRun: () => void;
  onNavigate: (screen: GameScreen) => void;
  onStartRun: () => void;
}

export function HomeScreen({
  hasRun,
  onContinueRun,
  onNavigate,
  onStartRun,
}: HomeScreenProps) {
  const showcaseCards = showcaseCardIds
    .map((id) => cards.find((card) => card.id === id))
    .filter((card): card is NonNullable<typeof card> => Boolean(card));
  const featuredCard = showcaseCards[1] ?? showcaseCards[0];

  return (
    <ScreenFrame>
      <div className="home-screen-grid">
        <GamePanel className="home-identity-panel">
          {featuredCard && (
            <CardArtwork card={featuredCard} priority variant="keyArt" />
          )}
          <div className="home-identity-copy">
            <p>Covenant: Legacies</p>
            <h2>COVENANT: LEGACIES</h2>
            <span>A Biblical Fantasy Trading Card Game</span>
          </div>
        </GamePanel>

        <GamePanel className="flex flex-col justify-between p-6 md:p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.34em] text-[var(--color-gold)]">
              War of the Watchers
            </p>
            <h2 className="mt-3 max-w-3xl text-4xl font-black leading-[0.95] text-[#fff3cf] md:text-6xl">
              Begin the first saga.
            </h2>
            <OrnamentalDivider />
            <p className="max-w-2xl text-lg leading-8 text-[rgba(241,228,194,0.76)]">
              Choose a covenant bearer, enter The Valley of the Giant, and
              carry the run through battle, reward, and return to the map.
            </p>
          </div>

          <div className="home-action-grid mt-6">
            <PrimaryButton onClick={onStartRun}>
              Start Run
            </PrimaryButton>
            <PrimaryButton
              disabled={!hasRun}
              onClick={onContinueRun}
              tone="secondary"
            >
              Continue
            </PrimaryButton>
            <PrimaryButton onClick={() => onNavigate("collection")} tone="secondary">
              Collection
            </PrimaryButton>
            <PrimaryButton onClick={() => onNavigate("gallery")} tone="secondary">
              Gallery
            </PrimaryButton>
            <PrimaryButton onClick={() => onNavigate("codex")} tone="secondary">
              Codex
            </PrimaryButton>
          </div>
        </GamePanel>

        <GamePanel className="home-flow-panel p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-gold)]">
            Demo Path
          </p>
          <h3>War of the Watchers</h3>
          <span>The Valley of the Giant is the first campaign map.</span>
          <div className="home-role-list mt-5">
            <HomeRole label="Start Run" value="Hero Select / Campaign Map / Combat" />
            <HomeRole label="Collection" value="Card archive and future deck-building home" />
            <HomeRole label="Gallery" value="Showcase art and concept pieces" />
            <HomeRole label="Codex" value="Scripture, lore, theology notes, and references" />
          </div>
        </GamePanel>
      </div>
    </ScreenFrame>
  );
}

function HomeRole({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[rgba(215,180,93,0.16)] bg-[rgba(255,255,255,0.04)] p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-[rgba(241,228,194,0.5)]">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 text-[rgba(241,228,194,0.76)]">{value}</p>
    </div>
  );
}
