import type { ResourceName, ResourceState } from "@/types/game";

export const turnStartResources: ResourceState = {
  resolve: 3,
  faith: 1,
  wisdom: 0,
  authority: 0,
  corruption: 0,
};

export function getResourceValue(resources: ResourceState, name: ResourceName) {
  return resources[toResourceKey(name)];
}

export function spendResource(
  resources: ResourceState,
  name: ResourceName,
  amount: number,
): ResourceState {
  const key = toResourceKey(name);

  return {
    ...resources,
    [key]: resources[key] - amount,
  };
}

export function gainResource(
  resources: ResourceState,
  name: ResourceName,
  amount: number,
): ResourceState {
  const key = toResourceKey(name);

  return {
    ...resources,
    [key]: resources[key] + amount,
  };
}

function toResourceKey(name: ResourceName): keyof ResourceState {
  return name.toLowerCase() as keyof ResourceState;
}
