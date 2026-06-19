import {
  ContentPanel,
  DetailPanel,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  StatChip,
  StatusBadge,
} from "@/components/UiPrimitives";
import type { SourceTier } from "@/types/game";

type StatusTone = "gold" | "sacred" | "danger" | "corruption" | "muted";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function getSourceTierTone(sourceTier?: SourceTier | string): StatusTone {
  if (sourceTier === "Scripture") {
    return "gold";
  }

  if (sourceTier === "Biblical Inference") {
    return "sacred";
  }

  if (sourceTier === "Speculative Fiction") {
    return "danger";
  }

  return "muted";
}

interface DecisionScreenFrameProps {
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  copy?: React.ReactNode;
  eyebrow: React.ReactNode;
  meta?: React.ReactNode;
  title: React.ReactNode;
  tone?: "default" | "sacred" | "danger";
}

export function DecisionScreenFrame({
  aside,
  children,
  className = "",
  copy,
  eyebrow,
  meta,
  title,
  tone = "default",
}: DecisionScreenFrameProps) {
  return (
    <div className={cx("decision-screen", `decision-screen-${tone}`, className)}>
      <ContentPanel className="decision-main-panel">
        <PageHeader
          className="decision-page-header"
          copy={copy}
          eyebrow={eyebrow}
          title={title}
        />
        {meta && <div className="decision-header-meta">{meta}</div>}
        <div className="decision-content">{children}</div>
      </ContentPanel>
      {aside && <DetailPanel className="decision-aside-panel">{aside}</DetailPanel>}
    </div>
  );
}

interface ChoiceCardProps {
  actionLabel?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  eyebrow?: React.ReactNode;
  meta?: React.ReactNode;
  onChoose?: () => void;
  title: React.ReactNode;
  tone?: "default" | "sacred" | "danger" | "memorial";
}

export function ChoiceCard({
  actionLabel,
  children,
  className = "",
  disabled = false,
  eyebrow,
  meta,
  onChoose,
  title,
  tone = "default",
}: ChoiceCardProps) {
  return (
    <button
      className={cx(
        "choice-card",
        `choice-card-${tone}`,
        disabled && "choice-card-disabled",
        className,
      )}
      disabled={disabled}
      onClick={onChoose}
      type="button"
    >
      <div className="choice-card-heading">
        <div>
          {eyebrow && <p className="choice-card-eyebrow">{eyebrow}</p>}
          <h3>{title}</h3>
        </div>
        {meta && <div className="choice-card-meta">{meta}</div>}
      </div>
      {children && <div className="choice-card-body">{children}</div>}
      {actionLabel && <span className="choice-card-action">{actionLabel}</span>}
    </button>
  );
}

interface RewardCardShellProps {
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
  tone?: "default" | "danger";
}

export function RewardCardShell({
  children,
  className = "",
  footer,
  tone = "default",
}: RewardCardShellProps) {
  return (
    <div className={cx("reward-card-shell", `reward-card-shell-${tone}`, className)}>
      <div className="reward-card-shell-art">{children}</div>
      {footer && <div className="reward-card-shell-footer">{footer}</div>}
    </div>
  );
}

interface ModalSummaryFrameProps {
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  eyebrow: React.ReactNode;
  title: React.ReactNode;
  tone?: "victory" | "defeat" | "campaign";
}

export function ModalSummaryFrame({
  actions,
  children,
  className = "",
  eyebrow,
  title,
  tone = "victory",
}: ModalSummaryFrameProps) {
  return (
    <div className="modal-summary-overlay">
      <div className={cx("modal-summary-frame", `modal-summary-${tone}`, className)}>
        <p className="ui-kicker">{eyebrow}</p>
        <h2>{title}</h2>
        {children}
        {actions && <div className="modal-summary-actions">{actions}</div>}
      </div>
    </div>
  );
}

interface OutcomeStatGridProps {
  stats: Array<{
    label: React.ReactNode;
    value: React.ReactNode;
  }>;
}

export function OutcomeStatGrid({ stats }: OutcomeStatGridProps) {
  return (
    <div className="outcome-stat-grid">
      {stats.map((stat) => (
        <StatChip key={`${stat.label}`} label={stat.label} value={stat.value} />
      ))}
    </div>
  );
}

export function TheologyNotePanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="decision-note-panel theology-note-panel">
      <p>Theology Note</p>
      <span>{children}</span>
    </div>
  );
}

export function ScriptureReferencePanel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="decision-note-panel scripture-reference-panel">
      <p>Scripture Reference</p>
      <span>{children}</span>
    </div>
  );
}

interface RewardFooterActionsProps {
  children?: React.ReactNode;
  primary?: React.ReactNode;
  secondaryLabel?: React.ReactNode;
  onSecondary?: () => void;
}

export function RewardFooterActions({
  children,
  onSecondary,
  primary,
  secondaryLabel,
}: RewardFooterActionsProps) {
  return (
    <div className="reward-footer-actions">
      {children && <span>{children}</span>}
      <div>
        {primary}
        {secondaryLabel && (
          <SecondaryButton onClick={onSecondary}>{secondaryLabel}</SecondaryButton>
        )}
      </div>
    </div>
  );
}

export { PrimaryButton, SecondaryButton, StatusBadge };
