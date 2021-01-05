export interface Position {
  x: number,
  y: number,
};

export type PcaSource = {
  position: Position[],
  source: number
};

export type Pca = {
  data: PcaSource[],
  allData: PcaSource[],
  min: Position,
  max: Position
};

export const DEFAULT_PCA: Pca = {
  data: [],
  allData: [],
  min: {x: 0, y: 0},
  max: {x:0, y:0}
};
