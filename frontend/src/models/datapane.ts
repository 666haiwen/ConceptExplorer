export interface WarningLevel {
    avg: number,
    max: number
}
export interface Batch {
    warningLevel: WarningLevel,
    dataNum: number
    hit: number,
    time: number
}

export interface DataBatch {
    data: Batch[],
    source: number,
    name: string,
    batchStart: number,
    matrixSelected: number[]
}

export type DataPane = DataBatch[];

export const DEFAULT_DATA_PANE: DataPane = [];