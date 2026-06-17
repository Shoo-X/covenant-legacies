import { GamePanel } from "@/components/GamePanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenFrame } from "@/components/ScreenFrame";
import type { Memorial } from "@/types/game";

interface MemorialRewardScreenProps {
  memorialRewards: Memorial[];
  onChooseMemorial: (memorialId: string) => void;
  onSkip: () => void;
}

export function MemorialRewardScreen({
  memorialRewards,
  onChooseMemorial,
  onSkip,
}: MemorialRewardScreenProps) {
  return (
    <ScreenFrame>
      <GamePanel className="flex h-full min-h-0 flex-col p-5 md:p-6">
      <div className="mb-4 max-w-3xl shrink-0">
        <p className="mb-3 text-xs uppercase tracking-[0.28em] text-[var(--color-gold)]">
          Memorial Reward
        </p>
        <h2 className="text-3xl font-semibold text-[#fff3cf] md:text-4xl">
          Raise a remembrance for the road ahead.
        </h2>
        <p className="mt-3 leading-7 text-[rgba(241,228,194,0.72)]">
          Memorials are passive run modifiers: stones, signs, instruments, and
          battle remembrances that shape every future combat.
        </p>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 md:grid-cols-3">
        {memorialRewards.map((memorial) => (
          <button
            className="min-h-0 overflow-hidden rounded-lg border border-[rgba(215,180,93,0.34)] bg-[linear-gradient(180deg,rgba(42,31,20,0.96),rgba(17,14,13,0.98))] p-4 text-left shadow-xl transition hover:translate-y-[-2px] hover:border-[rgba(255,226,150,0.58)]"
            key={memorial.id}
            onClick={() => onChooseMemorial(memorial.id)}
            type="button"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-semibold text-[#fff3cf]">
                {memorial.name}
              </h3>
              <span className="rounded-full border border-[rgba(215,180,93,0.3)] px-3 py-1 text-sm text-[var(--color-gold)]">
                {memorial.rarity}
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-[rgba(241,228,194,0.78)]">
              {memorial.effectText}
            </p>
            <div className="mt-4 rounded-md border border-[rgba(215,180,93,0.16)] bg-[rgba(255,255,255,0.04)] p-3">
              <p className="text-xs uppercase tracking-[0.18em] text-[rgba(241,228,194,0.48)]">
                Theology Note
              </p>
              <p className="mt-2 text-sm leading-6 text-[rgba(241,228,194,0.68)]">
                {memorial.theologyNote}
              </p>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-4 shrink-0">
        <PrimaryButton onClick={onSkip} tone="secondary">
        Skip Memorial
        </PrimaryButton>
      </div>
      </GamePanel>
    </ScreenFrame>
  );
}
