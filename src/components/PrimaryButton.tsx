interface PrimaryButtonProps {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  tone?: "primary" | "secondary" | "danger";
}

const toneClass = {
  primary:
    "border-[rgba(255,224,145,0.76)] bg-[linear-gradient(180deg,#e0ba63,#9a682d)] text-[#160e08] shadow-[0_0_34px_rgba(215,180,93,0.22)] hover:brightness-110",
  secondary:
    "border-[rgba(215,180,93,0.28)] bg-[rgba(255,255,255,0.055)] text-[#fff3cf] hover:border-[rgba(215,180,93,0.52)] hover:bg-[rgba(215,180,93,0.1)]",
  danger:
    "border-[rgba(159,61,40,0.5)] bg-[rgba(159,61,40,0.18)] text-[#ffd7c9] hover:border-[rgba(210,82,57,0.7)]",
};

export function PrimaryButton({
  children,
  disabled = false,
  onClick,
  tone = "primary",
}: PrimaryButtonProps) {
  return (
    <button
      className={`min-h-11 rounded-sm border px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] transition disabled:cursor-not-allowed disabled:opacity-45 ${toneClass[tone]}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
