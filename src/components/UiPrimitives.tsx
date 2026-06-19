import { GamePanel } from "@/components/GamePanel";
import { OrnamentalDivider } from "@/components/OrnamentalDivider";
import {
  PrimaryButton,
  SecondaryButton,
  TertiaryButton,
} from "@/components/PrimaryButton";

type PanelVariant = "raised" | "subtle" | "sacred" | "danger" | "inset";
type StatusTone = "gold" | "sacred" | "danger" | "corruption" | "muted";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  variant?: "home" | "map" | "archive" | "choice" | "combat";
}

export function PageLayout({
  children,
  className = "",
  variant = "archive",
}: PageLayoutProps) {
  return (
    <div className={cx("ui-page-layout", `ui-page-layout-${variant}`, className)}>
      {children}
    </div>
  );
}

interface PageHeaderProps {
  actions?: React.ReactNode;
  className?: string;
  copy?: React.ReactNode;
  eyebrow: React.ReactNode;
  title: React.ReactNode;
}

export function PageHeader({
  actions,
  className = "",
  copy,
  eyebrow,
  title,
}: PageHeaderProps) {
  return (
    <header className={cx("ui-page-header", className)}>
      <p className="ui-kicker">{eyebrow}</p>
      <h1 className="ui-title">{title}</h1>
      {copy && <p className="ui-body">{copy}</p>}
      {actions && <div className="mt-4 flex flex-wrap gap-3">{actions}</div>}
    </header>
  );
}

interface SectionHeaderProps {
  className?: string;
  copy?: React.ReactNode;
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
}

export function SectionHeader({
  className = "",
  copy,
  eyebrow,
  title,
}: SectionHeaderProps) {
  return (
    <div className={cx("ui-section-header", className)}>
      {eyebrow && <p className="ui-kicker">{eyebrow}</p>}
      <h2 className="ui-title">{title}</h2>
      {copy && <p className="ui-body">{copy}</p>}
    </div>
  );
}

interface PanelProps {
  children: React.ReactNode;
  className?: string;
  scroll?: boolean;
  variant?: PanelVariant;
}

export function ContentPanel(props: PanelProps) {
  return <GamePanel {...props} variant={props.variant ?? "raised"} />;
}

export function InfoPanel(props: PanelProps) {
  return <GamePanel {...props} variant={props.variant ?? "subtle"} />;
}

export function DetailPanel(props: PanelProps) {
  return <GamePanel {...props} variant={props.variant ?? "inset"} />;
}

interface StatChipProps {
  className?: string;
  label: React.ReactNode;
  value: React.ReactNode;
}

export function StatChip({ className = "", label, value }: StatChipProps) {
  return (
    <div className={cx("ui-stat-chip", className)}>
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}

interface ToneProps {
  children: React.ReactNode;
  className?: string;
  tone?: StatusTone;
}

export function StatusBadge({ children, className = "", tone = "gold" }: ToneProps) {
  return (
    <span className={cx("ui-status-badge", `ui-status-${tone}`, className)}>
      {children}
    </span>
  );
}

export function PillTag({ children, className = "", tone = "muted" }: ToneProps) {
  return (
    <span className={cx("ui-pill-tag", `ui-status-${tone}`, className)}>
      {children}
    </span>
  );
}

interface FrameProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFrame({ children, className = "" }: FrameProps) {
  return <div className={cx("ui-card-frame", className)}>{children}</div>;
}

export function ModalFrame({ children, className = "" }: FrameProps) {
  return <div className={cx("ui-modal-frame", className)}>{children}</div>;
}

export function ScrollPanel({ children, className = "" }: FrameProps) {
  return <div className={cx("ui-scroll-panel game-scroll", className)}>{children}</div>;
}

interface EmptyStateProps {
  action?: React.ReactNode;
  body: React.ReactNode;
  className?: string;
  title: React.ReactNode;
}

export function EmptyState({
  action,
  body,
  className = "",
  title,
}: EmptyStateProps) {
  return (
    <div className={cx("ui-empty-state", className)}>
      <div>
        <p className="ui-kicker">{title}</p>
        <p className="mt-3">{body}</p>
        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  );
}

export const Divider = OrnamentalDivider;
export { PrimaryButton, SecondaryButton, TertiaryButton };
