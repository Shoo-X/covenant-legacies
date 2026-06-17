export function OrnamentalDivider() {
  return (
    <div className="my-4 flex items-center gap-3" aria-hidden="true">
      <div className="h-px flex-1 bg-[linear-gradient(90deg,transparent,rgba(215,180,93,0.62))]" />
      <div className="h-2 w-2 rotate-45 border border-[rgba(215,180,93,0.74)] bg-[rgba(215,180,93,0.24)]" />
      <div className="h-px flex-1 bg-[linear-gradient(90deg,rgba(215,180,93,0.62),transparent)]" />
    </div>
  );
}
