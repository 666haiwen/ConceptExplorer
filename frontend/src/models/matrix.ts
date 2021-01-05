export interface MatrixName {
    attr: string,
    splitName: string[],
    oneHot: boolean
};

export interface MatrixDrawName extends MatrixName {
    splitOffset: number[]
};

export interface MatrixData {
    positive: number[][],
    negative: number[][],
    data: number[][],
};

export interface MatrixTime {
    time: number[],   //[start_batch, end_batch]
    source: number
};

export interface MatrixRender {
    res: MatrixData,
    sourceData: MatrixData
};

export interface MatrixCur {
    data: MatrixData[],
    topK: number[],
    normal: number[],
    abnormal: number[],
    time: MatrixTime[],
    cursorTime: string,
    timeChanged: number[],
    matrixSelected: boolean[],
    compared: number,
    resetDatasoureSignal: boolean
};

export interface MatrixRecord {
    data: MatrixData[],
    name: string,
    canvas: HTMLCanvasElement,
    recordId: number,
    dataSource: number[],
    topK: number[],
    time: MatrixTime[],
    cursorTime: string
};

export type Matrix = {
    history: MatrixRecord[],
    historyAllId: number,
    cur: MatrixCur
}

export const DEFAULT_MATRIX: Matrix = {
    history: [],
    historyAllId: 0,
    cur: {
        data: [],
        topK: [],
        normal: [],
        abnormal: [],
        time: [],
        cursorTime: '',
        timeChanged: [],
        matrixSelected: [],
        compared: -1,
        resetDatasoureSignal: false
    }
};