interface PrimaryButtonProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  tone?: ButtonTone;
}

export type ButtonTone = "primary" | "secondary" | "tertiary" | "danger";

const toneClass = {
  primary: "ui-button-primary",
  secondary: "ui-button-secondary",
  tertiary: "ui-button-tertiary",
  danger: "ui-button-danger",
};

export function PrimaryButton({
  children,
  className = "",
  disabled = false,
  onClick,
  tone = "primary",
}: PrimaryButtonProps) {
  return (
    <button
      className={`ui-button ${toneClass[tone]} ${className}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

export function SecondaryButton(props: Omit<PrimaryButtonProps, "tone">) {
  return <PrimaryButton {...props} tone="secondary" />;
}

export function TertiaryButton(props: Omit<PrimaryButtonProps, "tone">) {
  return <PrimaryButton {...props} tone="tertiary" />;
}
