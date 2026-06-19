interface TutorialHintProps {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  tone?: "default" | "sacred" | "danger";
}

export function TutorialHint({
  children,
  className = "",
  title = "First Run Guide",
  tone = "default",
}: TutorialHintProps) {
  return (
    <aside className={`tutorial-hint tutorial-hint-${tone} ${className}`}>
      <p>{title}</p>
      <div>{children}</div>
    </aside>
  );
}
