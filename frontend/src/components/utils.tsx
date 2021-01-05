import { MatrixDrawName } from '../models';

export const deepClone = (obj: any): any => {
    const _obj = JSON.stringify(obj);
    return JSON.parse(_obj);
};

    // function to get Index
export const getAttrSplitIndexKByName = (axisName: MatrixDrawName[], attrName: string, source: boolean, dataSourceNum: number): number[] => {
    let res: number[] = [];
    axisName.forEach(v => {
        if (v.attr == attrName) {
        res = v.splitOffset;
        return;
        }
    });
    return res.map(v => source ? v + dataSourceNum : v);
    };

export const getMax = (x: number[]) => Math.max(...x);
