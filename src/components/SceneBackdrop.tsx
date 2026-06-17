interface SceneBackdropProps {
  variant?: "title" | "game";
}

export function SceneBackdrop({ variant = "game" }: SceneBackdropProps) {
  return (
    <div className={`scene-backdrop scene-backdrop-${variant}`} aria-hidden="true">
      <div className="scene-ray scene-ray-one" />
      <div className="scene-ray scene-ray-two" />
      <div className="scene-dust scene-dust-one" />
      <div className="scene-dust scene-dust-two" />
      <div className="scene-ember scene-ember-one" />
      <div className="scene-ember scene-ember-two" />
    </div>
  );
}
