interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  copy: string;
}

export function SectionHeader({ eyebrow, title, copy }: SectionHeaderProps) {
  return (
    <div className="mb-6 max-w-3xl">
      <p className="mb-3 text-xs uppercase tracking-[0.28em] text-[var(--color-gold)]">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-semibold text-[#fff3cf] md:text-4xl">{title}</h2>
      <p className="mt-3 leading-7 text-[rgba(241,228,194,0.72)]">{copy}</p>
    </div>
  );
}
