import { encounters } from "@/data/encounters";
import { heroes } from "@/data/heroes";
import { GamePanel } from "@/components/GamePanel";
import { OrnamentalDivider } from "@/components/OrnamentalDivider";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenFrame } from "@/components/ScreenFrame";
import type { GameScreen } from "@/types/game";

interface HomeScreenProps {
  onNavigate: (screen: GameScreen) => void;
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  return (
    <ScreenFrame>
      <div className="grid h-full min-h-0 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <GamePanel className="flex flex-col justify-between p-6 md:p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.34em] text-[var(--color-gold)]">
              Sanctuary Gate
            </p>
            <h2 className="mt-3 max-w-3xl text-4xl font-black leading-[0.95] text-[#fff3cf] md:text-6xl">
              Prepare the covenant company.
            </h2>
            <OrnamentalDivider />
            <p className="max-w-2xl text-lg leading-8 text-[rgba(241,228,194,0.76)]">
              Choose a champion, enter the valley, and keep the record of every
              mystery, memorial, and battle.
            </p>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <PrimaryButton onClick={() => onNavigate("hero-select")}>
              Choose Hero
            </PrimaryButton>
            <PrimaryButton onClick={() => onNavigate("map")} tone="secondary">
              View Map
            </PrimaryButton>
            <PrimaryButton onClick={() => onNavigate("codex")} tone="secondary">
              Codex
            </PrimaryButton>
          </div>
        </GamePanel>

        <GamePanel className="p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-gold)]">
            Run Foundation
          </p>
          <dl className="mt-5 grid gap-3">
            <RunFact label="Heroes" value={heroes.length} />
            <RunFact label="Encounters" value={encounters.length} />
            <RunFact label="Campaign" value="The Valley of the Giant" />
            <RunFact label="Current Shell" value="Full-screen game UI" />
          </dl>
        </GamePanel>
      </div>
    </ScreenFrame>
  );
}

function RunFact({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border border-[rgba(215,180,93,0.16)] bg-[rgba(255,255,255,0.04)] p-4">
      <dt className="text-xs uppercase tracking-[0.18em] text-[rgba(241,228,194,0.5)]">
        {label}
      </dt>
      <dd className="mt-2 text-2xl font-semibold text-[#fff3cf]">{value}</dd>
    </div>
  );
}
