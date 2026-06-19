import Image from "next/image";
import { cards } from "@/data/cards";
import { starterCampaign } from "@/data/campaigns";
import { heroes } from "@/data/heroes";
import { CollectibleCard } from "@/components/CollectibleCard";
import { PlaceholderArt } from "@/components/PlaceholderArt";
import { ResourceStrip } from "@/components/ResourceStrip";
import { ScreenFrame } from "@/components/ScreenFrame";
import {
  ContentPanel,
  DetailPanel,
  InfoPanel,
  PageHeader,
  PageLayout,
  PillTag,
  PrimaryButton,
  ScrollPanel,
  StatChip,
  StatusBadge,
} from "@/components/UiPrimitives";
import type { Hero } from "@/types/game";

interface HeroSelectScreenProps {
  onStartRun: () => void;
}

export function HeroSelectScreen({ onStartRun }: HeroSelectScreenProps) {
  const cardsById = new Map(cards.map((card) => [card.id, card]));
  const playableHero = heroes.find((hero) => hero.unlockState === "unlocked") ?? heroes[0];
  const previewHeroes = heroes.filter((hero) => hero.id !== playableHero.id);

  return (
    <ScreenFrame>
      <PageLayout className="hero-roster-screen" variant="choice">
        <InfoPanel className="hero-roster-intro">
          <div>
            <PageHeader
              copy={
                <>
                  Covenant: Legacies will follow biblical witnesses with
                  distinct playstyles. David begins unlocked for{" "}
                  {starterCampaign.campaignName}, the beginner campaign anchored
                  in {starterCampaign.biblicalAnchor}.
                </>
              }
              eyebrow="Playable Heroes"
              title="Select a covenant bearer."
            />
          </div>
          <div className="hero-roster-rule">
            <PillTag tone="gold">Biblical Identity</PillTag>
            <span>
              Power is framed through covenant, prayer, testimony, judgment,
              obedience, and divine intervention, never player-controlled magic.
            </span>
          </div>
          <PrimaryButton onClick={onStartRun}>
            Begin With {playableHero.shortName ?? playableHero.name}
          </PrimaryButton>
        </InfoPanel>

        <ContentPanel className="hero-feature-panel" variant="sacred">
          <div className="hero-art-panel">
            <HeroPortrait hero={playableHero} tone="gold" />
          </div>
          <div className="hero-feature-copy">
            <div>
              <StatusBadge tone="sacred">Unlocked Starter</StatusBadge>
              <p className="hero-feature-kicker">
                {playableHero.roleSubtitle ?? playableHero.epithet}
              </p>
              <h3>{playableHero.canonicalName ?? playableHero.name}</h3>
              {playableHero.legacyTitle && (
                <p className="hero-legacy-note">
                  Future legacy: {playableHero.legacyTitle}
                </p>
              )}
              <p className="hero-calling">{playableHero.calling}</p>
            </div>

            <HeroTraitGrid hero={playableHero} />

            <div className="hero-passive-panel">
              <PillTag tone="gold">Signature Mechanic</PillTag>
              <strong>{playableHero.passiveName ?? playableHero.passive.name}</strong>
              <span>{playableHero.passiveText ?? playableHero.passive.text}</span>
            </div>

            <ResourceStrip resources={playableHero.resourceState} />

            <div className="hero-starting-deck-panel">
              <PillTag tone="gold">Starting Deck</PillTag>
              <div className="starting-deck-preview-grid" aria-label="David starting deck">
                {playableHero.startingDeck.map((deckCard) => {
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
        </ContentPanel>

        <DetailPanel className="hero-preview-rail">
          <div className="hero-preview-header">
            <p>Coming Heroes</p>
            <span>{previewHeroes.length} previews</span>
          </div>
          <ScrollPanel className="hero-preview-list">
            {previewHeroes.map((hero) => (
              <HeroPreviewCard hero={hero} key={hero.id} />
            ))}
          </ScrollPanel>
        </DetailPanel>
      </PageLayout>
    </ScreenFrame>
  );
}

function HeroTraitGrid({ hero }: { hero: Hero }) {
  return (
    <div className="hero-trait-grid">
      <Fact label="Difficulty" value={hero.difficulty ?? "Tactical"} />
      <Fact label="Tags" value={hero.playstyleTags?.join(" / ") ?? hero.epithet} />
      <Fact
        label="References"
        value={hero.references.length > 0 ? hero.references.join("; ") : "Scripture"}
      />
      <Fact label="Source" value={hero.sourceTier} />
    </div>
  );
}

function HeroPreviewCard({ hero }: { hero: Hero }) {
  return (
    <article className="hero-preview-card">
      <div className="hero-preview-art">
        <HeroMiniArt hero={hero} />
      </div>
      <div className="hero-preview-copy">
        <div className="hero-preview-title-row">
          <div>
            <p>{hero.roleSubtitle}</p>
            <h3>{hero.canonicalName ?? hero.name}</h3>
          </div>
          <StatusBadge tone="muted">{formatUnlockState(hero.unlockState)}</StatusBadge>
        </div>
        <div className="hero-preview-tags">
          {hero.playstyleTags?.slice(0, 4).map((tag) => (
            <PillTag key={tag}>{tag}</PillTag>
          ))}
        </div>
        <p className="hero-preview-mechanic">{hero.signatureMechanic}</p>
        <div className="hero-preview-lists">
          <MiniList title="Strengths" values={hero.strengths} />
          <MiniList title="Weaknesses" values={hero.weaknesses} />
        </div>
        <p className="hero-preview-references">
          References: {hero.references.join("; ")}
        </p>
      </div>
    </article>
  );
}

function HeroPortrait({ hero, tone }: { hero: Hero; tone: "gold" | "indigo" }) {
  if (!hero.imagePath) {
    return <PlaceholderArt label={hero.name} subject={hero} tone={tone} />;
  }

  return (
    <div className="hero-portrait-art" role="img" aria-label={hero.artworkTitle ?? hero.name}>
      <Image
        alt={hero.artworkTitle ?? hero.name}
        className="hero-portrait-image"
        fill
        priority
        sizes="(max-width: 900px) 90vw, 34vw"
        src={hero.imagePath}
        style={{ objectPosition: hero.imageObjectPosition ?? "50% 30%" }}
      />
      <div className="hero-portrait-vignette" aria-hidden="true" />
      <span>{hero.shortName ?? hero.name}</span>
    </div>
  );
}

function HeroMiniArt({ hero }: { hero: Hero }) {
  if (!hero.imagePath) {
    return <PlaceholderArt label={hero.shortName ?? hero.name} subject={hero} tone="indigo" />;
  }

  return (
    <Image
      alt={hero.artworkTitle ?? hero.name}
      className="hero-preview-image"
      fill
      sizes="96px"
      src={hero.imagePath}
      style={{ objectPosition: hero.imageObjectPosition ?? "50% 30%" }}
    />
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return <StatChip label={label} value={value} />;
}

function MiniList({
  title,
  values = [],
}: {
  title: string;
  values?: string[];
}) {
  return (
    <div>
      <p>{title}</p>
      <span>{values.slice(0, 2).join("; ")}</span>
    </div>
  );
}

function formatUnlockState(state: Hero["unlockState"]) {
  if (state === "unlocked") {
    return "Unlocked";
  }

  return "Coming Soon";
}
