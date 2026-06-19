import { CardArtwork } from "@/components/CardArtwork";
import { cards, showcaseCardIds } from "@/data/cards";
import { starterCampaign } from "@/data/campaigns";
import { ScreenFrame } from "@/components/ScreenFrame";
import {
  ContentPanel,
  Divider,
  InfoPanel,
  PageHeader,
  PageLayout,
  PillTag,
  PrimaryButton,
  SecondaryButton,
  TertiaryButton,
} from "@/components/UiPrimitives";
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
      <PageLayout className="home-screen-grid" variant="home">
        <ContentPanel className="home-identity-panel" variant="sacred">
          {featuredCard && (
            <CardArtwork card={featuredCard} priority variant="keyArt" />
          )}
          <div className="home-identity-copy">
            <p>Covenant: Legacies</p>
            <h2>COVENANT: LEGACIES</h2>
            <span>A Biblical Fantasy Trading Card Game</span>
          </div>
        </ContentPanel>

        <ContentPanel className="home-primary-panel">
          <div>
            <PageHeader
              copy={
                <>
                  Choose David, enter {starterCampaign.campaignName}, and learn
                  the starter path through battle, reward, and return to the map.
                </>
              }
              eyebrow={starterCampaign.campaignLabel}
              title="Begin David's first trial."
            />
            <Divider />
            <div className="home-demo-tags">
              <PillTag tone="gold">{starterCampaign.campaignName}</PillTag>
              <PillTag tone="sacred">
                Biblical Anchor: {starterCampaign.biblicalAnchor}
              </PillTag>
            </div>
            <div className="home-demo-act">
              <PillTag tone="gold">First Playable Demo Act</PillTag>
              <p>
                Learn Guard, Courage, Faith, rewards, corruption, and
                Goliath&apos;s challenge in David&apos;s starter campaign.
              </p>
              <div className="home-demo-flow" aria-label="Demo act flow">
                <span>Choose David</span>
                <span>Enter the Valley</span>
                <span>Face Goliath</span>
              </div>
            </div>
          </div>

          <div className="home-action-grid mt-6">
            <PrimaryButton onClick={onStartRun}>
              Start Run
            </PrimaryButton>
            <SecondaryButton disabled={!hasRun} onClick={onContinueRun}>
              Continue
            </SecondaryButton>
            <SecondaryButton onClick={() => onNavigate("collection")}>
              Collection
            </SecondaryButton>
            <TertiaryButton onClick={() => onNavigate("gallery")}>
              Gallery
            </TertiaryButton>
            <TertiaryButton onClick={() => onNavigate("codex")}>
              Codex
            </TertiaryButton>
          </div>
        </ContentPanel>

        <InfoPanel className="home-flow-panel">
          <p className="ui-kicker">Demo Path</p>
          <h3>{starterCampaign.campaignName}</h3>
          <span>
            {starterCampaign.campaignSubtitle} / Biblical Anchor:{" "}
            {starterCampaign.biblicalAnchor}
          </span>
          <div className="home-role-list mt-5">
            <HomeRole label="Start Run" value="Hero Select / Campaign Map / Combat" />
            <HomeRole label="Collection" value="Card archive and future deck-building home" />
            <HomeRole label="Gallery" value="Showcase art and concept pieces" />
            <HomeRole label="Codex" value="Scripture, lore, theology notes, and references" />
          </div>
        </InfoPanel>
      </PageLayout>
    </ScreenFrame>
  );
}

function HomeRole({ label, value }: { label: string; value: string }) {
  return (
    <div className="home-role-card">
      <PillTag>{label}</PillTag>
      <p>{value}</p>
    </div>
  );
}
