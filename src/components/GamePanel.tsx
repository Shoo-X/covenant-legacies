interface GamePanelProps {
  children: React.ReactNode;
  className?: string;
  scroll?: boolean;
  variant?: "raised" | "subtle" | "sacred" | "danger" | "inset";
}

const variantClass = {
  raised: "",
  subtle: "ui-panel-subtle",
  sacred: "ui-panel-sacred",
  danger: "ui-panel-danger",
  inset: "ui-panel-inset",
};

export function GamePanel({
  children,
  className = "",
  scroll = false,
  variant = "raised",
}: GamePanelProps) {
  return (
    <section
      className={`game-panel ui-panel ${variantClass[variant]} ${scroll ? "game-scroll" : "overflow-hidden"} ${className}`}
    >
      {children}
    </section>
  );
}

export function ContentPanel(props: GamePanelProps) {
  return <GamePanel {...props} variant={props.variant ?? "raised"} />;
}

export function InfoPanel(props: GamePanelProps) {
  return <GamePanel {...props} variant={props.variant ?? "subtle"} />;
}

export function DetailPanel(props: GamePanelProps) {
  return <GamePanel {...props} variant={props.variant ?? "inset"} />;
}
