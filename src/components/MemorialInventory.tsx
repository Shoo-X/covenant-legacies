import type { Memorial } from "@/types/game";

interface MemorialInventoryProps {
  memorials: Memorial[];
  compact?: boolean;
}

export function MemorialInventory({ compact = false, memorials }: MemorialInventoryProps) {
  return (
    <div className="rounded-lg border border-[rgba(215,180,93,0.18)] bg-[rgba(255,255,255,0.04)] p-4">
      <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-gold)]">
        Memorials
      </p>
      {memorials.length === 0 ? (
        <p className="mt-3 text-sm leading-6 text-[rgba(241,228,194,0.62)]">
          No Memorials raised yet.
        </p>
      ) : (
        <div className={`mt-3 grid gap-3 ${compact ? "" : "md:grid-cols-2"}`}>
          {memorials.map((memorial) => (
            <div
              className="rounded-md border border-[rgba(215,180,93,0.16)] bg-[rgba(8,7,5,0.26)] p-3"
              key={memorial.id}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold text-[#fff3cf]">{memorial.name}</p>
                <span className="text-xs uppercase tracking-[0.14em] text-[var(--color-gold)]">
                  {memorial.rarity}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-[rgba(241,228,194,0.66)]">
                {memorial.effectText}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
