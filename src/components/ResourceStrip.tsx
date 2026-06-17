import type { ResourceState } from "@/types/game";

interface ResourceStripProps {
  resources: ResourceState;
}

export function ResourceStrip({ resources }: ResourceStripProps) {
  const entries = [
    ["Resolve", resources.resolve],
    ["Faith", resources.faith],
    ["Wisdom", resources.wisdom],
    ["Authority", resources.authority],
    ["Corruption", resources.corruption],
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
      {entries.map(([label, value]) => (
        <div
          className="rounded-md border border-[rgba(215,180,93,0.18)] bg-[rgba(255,255,255,0.04)] px-3 py-2"
          key={label}
        >
          <p className="text-xs uppercase tracking-[0.18em] text-[rgba(241,228,194,0.52)]">
            {label}
          </p>
          <p className="text-2xl font-semibold text-[#fff3cf]">{value}</p>
        </div>
      ))}
    </div>
  );
}
