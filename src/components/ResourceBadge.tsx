import type { ResourceCost, ResourceName, ResourceState } from "@/types/game";

export const resourceOrder: ResourceName[] = [
  "Resolve",
  "Faith",
  "Wisdom",
  "Authority",
  "Corruption",
];

export const resourceVisuals: Record<
  ResourceName,
  {
    key: keyof ResourceState;
    label: string;
    refresh: string;
    shortLabel: string;
    usage: string;
  }
> = {
  Resolve: {
    key: "resolve",
    label: "Resolve",
    refresh: "Refreshes at the start of each combat turn.",
    shortLabel: "Res",
    usage: "Used for attacks, courage cards, and physical pressure.",
  },
  Faith: {
    key: "faith",
    label: "Faith",
    refresh: "Refreshes at the start of each combat turn.",
    shortLabel: "Fth",
    usage: "Used for prayer, psalm, covenant, and deliverance cards.",
  },
  Wisdom: {
    key: "wisdom",
    label: "Wisdom",
    refresh: "Usually gained during combat and resets with the next turn.",
    shortLabel: "Wis",
    usage: "Used for discernment, witness, and careful support cards.",
  },
  Authority: {
    key: "authority",
    label: "Authority",
    refresh: "Usually gained during combat and resets with the next turn.",
    shortLabel: "Auth",
    usage: "Used for command, kingdom, judgment, and ordered leadership cards.",
  },
  Corruption: {
    key: "corruption",
    label: "Corruption",
    refresh: "Persists through the run until cleansed.",
    shortLabel: "Corr",
    usage: "A dangerous consequence and warning state, not an ordinary cost.",
  },
};

type ResourceBadgeVariant = "hand" | "compact" | "full" | "bar";

interface ResourceBadgeProps {
  amount: number;
  isMissing?: boolean;
  missingAmount?: number;
  prefix?: "+" | "-";
  resource: ResourceName;
  showLabel?: boolean;
  title?: string;
  variant?: ResourceBadgeVariant;
}

interface ResourceCostDisplayProps {
  costs: ResourceCost[];
  missingCosts?: ResourceCost[];
  showLabels?: boolean;
  unplayable?: boolean;
  variant?: ResourceBadgeVariant;
}

export function ResourceBadge({
  amount,
  isMissing = false,
  missingAmount = 0,
  prefix,
  resource,
  showLabel,
  title,
  variant = "compact",
}: ResourceBadgeProps) {
  const visual = resourceVisuals[resource];
  const label = showLabel ? visual.label : visual.shortLabel;
  const titleText =
    title ??
    (isMissing
      ? `Need ${missingAmount} more ${resource}. ${visual.usage} ${visual.refresh}`
      : `${amount} ${resource}. ${visual.usage} ${visual.refresh}`);

  return (
    <span
      aria-label={`${prefix ?? ""}${amount} ${resource}${
        isMissing ? `, need ${missingAmount} more` : ""
      }`}
      className={`resource-badge resource-badge-${resource.toLowerCase()} resource-badge-${variant} ${
        isMissing ? "is-missing" : ""
      }`}
      title={titleText}
    >
      <span className="resource-badge-icon" aria-hidden="true" />
      <strong>
        {prefix}
        {amount}
      </strong>
      {showLabel && <span>{label}</span>}
    </span>
  );
}

export function ResourceCostDisplay({
  costs,
  missingCosts = [],
  showLabels = false,
  unplayable = false,
  variant = "compact",
}: ResourceCostDisplayProps) {
  if (unplayable) {
    return (
      <span
        className={`resource-free-badge resource-badge-${variant}`}
        title="This card cannot be played."
      >
        <span className="resource-badge-icon" aria-hidden="true" />
        <strong>--</strong>
        {showLabels && <span>Unplayable</span>}
      </span>
    );
  }

  const payableCosts = costs.filter((cost) => cost.resource);

  if (payableCosts.length === 0) {
    return (
      <span className={`resource-free-badge resource-badge-${variant}`} title="Free to play.">
        <span className="resource-badge-icon" aria-hidden="true" />
        <strong>0</strong>
        {showLabels && <span>Free</span>}
      </span>
    );
  }

  return (
    <span className={`resource-cost-display resource-cost-display-${variant}`}>
      {payableCosts.map((cost, index) => {
        const resource = cost.resource as ResourceName;
        const missingAmount =
          missingCosts.find((missing) => missing.resource === resource)?.amount ?? 0;

        return (
          <ResourceBadge
            amount={cost.amount}
            isMissing={missingAmount > 0}
            key={`${resource}-${cost.amount}-${index}`}
            missingAmount={missingAmount}
            resource={resource}
            showLabel={showLabels}
            variant={variant}
          />
        );
      })}
    </span>
  );
}

export function ResourceConsequenceBadge({
  amount,
  showLabel = false,
  variant = "compact",
}: {
  amount: number;
  showLabel?: boolean;
  variant?: ResourceBadgeVariant;
}) {
  if (amount <= 0) {
    return null;
  }

  return (
    <span className="resource-consequence-row" title={`Playing this gains ${amount} Corruption.`}>
      <ResourceBadge
        amount={amount}
        prefix="+"
        resource="Corruption"
        showLabel={showLabel || variant === "hand"}
        title={`Gain ${amount} Corruption as a consequence of playing this card.`}
        variant={variant}
      />
    </span>
  );
}

export function getResourceBarTooltip(
  resource: ResourceName,
  value: number,
  thresholdName?: string,
) {
  const visual = resourceVisuals[resource];
  const threshold = thresholdName ? ` Current threshold: ${thresholdName}.` : "";

  return `${resource}: ${visual.usage} ${visual.refresh} Current amount: ${value}. No fixed maximum.${threshold}`;
}
