import type {
  CombatState,
  CombatStructureState,
  EnemyStructureDefinition,
} from "./types";

export const corruptedAltarDefinition: EnemyStructureDefinition = {
  id: "structure-corrupted-altar",
  name: "Idol Standard",
  maxHealth: 18,
  traits: ["Idol", "Structure"],
  effectText:
    "At enemy turn end, gain 1 charge. At 3 charges, the enemy gains 1 Might and you gain 1 Corruption, then charges reset.",
  triggerAtCharge: 3,
  sourceTier: "Biblical Inference",
  references: ["1 Samuel 5", "1 Samuel 31:8-10"],
  theologyNote:
    "The idol standard is framed as false worship pressure to resist and break, not as a source of usable power.",
  gameplayRole: "Structure",
};

export function createEncounterStructures(enemyId: string): CombatStructureState[] {
  const altarCount = getCorruptedAltarCount(enemyId);

  return Array.from({ length: altarCount }, (_, index) =>
    createStructureInstance(corruptedAltarDefinition, index + 1),
  );
}

export function getActiveStructures(state: CombatState) {
  return state.structures.filter((structure) => structure.health > 0);
}

export function hasActiveStructureWithTrait(
  state: CombatState,
  trait: "Idol" | "Structure",
) {
  return getActiveStructures(state).some((structure) =>
    structure.traits.includes(trait),
  );
}

export function hasActiveAltarPressure(state: CombatState) {
  return hasActiveStructureWithTrait(state, "Idol");
}

export function getTargetedStructure(
  state: CombatState,
  targetId: string | undefined,
) {
  if (!targetId?.startsWith("structure:")) {
    return undefined;
  }

  const structureId = targetId.slice("structure:".length);

  return state.structures.find(
    (structure) => structure.instanceId === structureId && structure.health > 0,
  );
}

export function getFirstActiveStructure(state: CombatState) {
  return getActiveStructures(state)[0];
}

export function syncDestroyedStructureFlag(state: CombatState): CombatState {
  if (state.structures.length === 0) {
    return {
      ...state,
      destroyedAltarOrStructure: true,
    };
  }

  return {
    ...state,
    destroyedAltarOrStructure: getActiveStructures(state).length === 0,
  };
}

function createStructureInstance(
  definition: EnemyStructureDefinition,
  index: number,
): CombatStructureState {
  return {
    ...definition,
    instanceId: `${definition.id}-${index}`,
    health: definition.maxHealth,
    charge: 0,
  };
}

function getCorruptedAltarCount(enemyId: string) {
  if (enemyId === "enemy-idol-priest") {
    return 1;
  }

  return 0;
}
