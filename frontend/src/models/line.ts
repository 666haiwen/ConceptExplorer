export type LinePoint = {
    accuracy: number,
    pmin: number,
    bayes: number,
    state: number,
    time: number,
  };
export type Line = {
  data: LinePoint[],
  source: number,
  batchStart: number
};
export type Lines = Line[];
export const DEFAULT_LINES: Lines = [];
