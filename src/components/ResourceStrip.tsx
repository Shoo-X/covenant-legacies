import {
  getResourceBarTooltip,
  ResourceBadge,
  resourceOrder,
  resourceVisuals,
} from "@/components/ResourceBadge";
import type { ResourceState } from "@/types/game";

interface ResourceStripProps {
  resources: ResourceState;
}

export function ResourceStrip({ resources }: ResourceStripProps) {
  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
      {resourceOrder.map((resource) => {
        const value = resources[resourceVisuals[resource].key];

        return (
          <div
            className="rounded-md border border-[rgba(215,180,93,0.18)] bg-[rgba(255,255,255,0.04)] px-3 py-2"
            key={resource}
            title={getResourceBarTooltip(resource, value)}
          >
            <ResourceBadge
              amount={value}
              resource={resource}
              showLabel
              title={getResourceBarTooltip(resource, value)}
              variant="bar"
            />
          </div>
        );
      })}
    </div>
  );
}
