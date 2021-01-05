export interface Utils {
    highLightIndex: number,
    highLight: boolean,
    brush: boolean,
    brushStart: number,
    brushEnd: number,
    offsetLeft: number,
    offsetRight: number,
    warningLevel: number,
    selection: number[],
};

export interface Margin {
    left: number,
    top: number,
    right: number,
    bottom: number
};

export const DEFAULT_UTILS: Utils = {
    highLightIndex: -1,
    highLight: false,
    warningLevel: 2,
    brush: false,
    brushStart: 0,
    brushEnd: 0,
    offsetLeft: 0,
    offsetRight: 0,
    selection: [0, 1050],
};