import { OrnamentalDivider } from "@/components/OrnamentalDivider";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenFrame } from "@/components/ScreenFrame";

interface LandingPageProps {
  onOpenCodex: () => void;
  onStart: () => void;
}

export function LandingPage({ onOpenCodex, onStart }: LandingPageProps) {
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
                Legacies
              </span>
            </h1>
            <OrnamentalDivider />
            <p className="max-w-2xl text-xl leading-8 text-[#fff3cf] md:text-2xl">
              Build your deck. Guard the covenant. Shape a legacy through giants,
              altars, prophecy, and spiritual war.
            </p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[rgba(241,228,194,0.72)]">
              A biblical supernatural deck battler where War of the Watchers begins
              the first playable saga.
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

          <div className="key-art-frame h-[min(74dvh,48rem)] min-h-[26rem]">
            <div className="key-art-scene">
              <div className="key-art-sky" />
              <div className="key-art-threat" />
              <div className="key-art-mountains" />
              <div className="key-art-high-place" />
              <div className="key-art-seal-glow" />
              <div className="key-art-arch" />
              <div className="key-art-gate" />
              <div className="key-art-foreground" />
            </div>
          </div>
        </section>
      </ScreenFrame>
    </main>
  );
}
