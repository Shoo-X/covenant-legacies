interface GamePanelProps {
  children: React.ReactNode;
  className?: string;
  scroll?: boolean;
}

export function GamePanel({ children, className = "", scroll = false }: GamePanelProps) {
  return (
    <section
      className={`game-panel min-h-0 border border-[rgba(215,180,93,0.2)] bg-[linear-gradient(180deg,rgba(28,23,20,0.92),rgba(9,9,12,0.94))] shadow-[0_24px_80px_rgba(0,0,0,0.34)] ${scroll ? "game-scroll" : "overflow-hidden"} ${className}`}
    >
      {children}
    </section>
  );
}
