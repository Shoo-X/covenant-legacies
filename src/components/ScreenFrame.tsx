import { SceneBackdrop } from "@/components/SceneBackdrop";

interface ScreenFrameProps {
  children: React.ReactNode;
  className?: string;
  variant?: "title" | "game";
}

export function ScreenFrame({
  children,
  className = "",
  variant = "game",
}: ScreenFrameProps) {
  return (
    <div className={`relative h-full min-h-0 overflow-hidden ${className}`}>
      <SceneBackdrop variant={variant} />
      <div className="relative z-10 h-full min-h-0">{children}</div>
    </div>
  );
}
