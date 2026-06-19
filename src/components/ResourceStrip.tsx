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
    <div className="resource-strip">
      {resourceOrder.map((resource) => {
        const value = resources[resourceVisuals[resource].key];

        return (
          <div
            className="resource-strip-tile"
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
