interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  copy: string;
}

export function SectionHeader({ eyebrow, title, copy }: SectionHeaderProps) {
  return (
    <div className="ui-section-header mb-6 max-w-3xl">
      <p className="ui-kicker">{eyebrow}</p>
      <h2 className="ui-title">{title}</h2>
      <p className="ui-body">{copy}</p>
    </div>
  );
}
