export interface DriftSource {
  drift: number[],
  dataNum: number[],
  time: number[],
  index: number,
  matrixSelected: number[],
  bayes: number[],
};

export type ConceptDrift = DriftSource[];
export const DEFAULT_DRIFT: ConceptDrift = [];
