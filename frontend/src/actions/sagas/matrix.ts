import { call, put, takeEvery } from 'redux-saga/effects';
import { ReduxAction } from '../redux-action';
import { MatrixRecord, MatrixData, MatrixTime } from '../../models';
import { getExplanation } from '../../api';
import { SetAttributes, SET_ATTRIBUTES } from '../attributes';

export type MatrixAction = AddMatrix | DeleteMatrix | 
    SetPrevMatrix | ResetMatrix |
    GetCurMatrix | SetCurMatrixSetting | SetHistoryName;

export const RESET_MATRIX = 'RESET_MATRIX';
export type ResetMatrix = ReduxAction<typeof RESET_MATRIX, {}>;
export const ADD_MATRIX_HISTORY = 'ADD_MATRIX_HISTORY';
export type AddMatrix = ReduxAction<typeof ADD_MATRIX_HISTORY, {
    MatrixRecord: MatrixRecord
}>;

export const DELETE_MATRIX_HISTORY = 'DELETE_MATRIX_HISTORY';
export type DeleteMatrix = ReduxAction<typeof DELETE_MATRIX_HISTORY, {
    recordId: number
}>;

export const SET_PREV_MATRIX = 'SET_PREV_MATRIX';
export type SetPrevMatrix = ReduxAction<typeof SET_PREV_MATRIX, {
    recordId: number
}>;

export const GET_CUR_MATRIX = 'GET_CUR_MATRIX';
export type GetCurMatrix = ReduxAction<typeof GET_CUR_MATRIX, {
    data: MatrixData[],
    topK: number[],
    source: number[]
}>;

export const SET_CUR_MATRIX_SETTING = 'SET_CUR_MATRIX_SETTING';
export type SetCurMatrixSetting = ReduxAction<typeof SET_CUR_MATRIX_SETTING, {
    normal: number[],
    abnormal: number[],
    time: MatrixTime[],
    timeChange: number[],
    matrixSelected: boolean[],
    cursorTime: string,
    dataset: string,
    resetDatasourceFlag: boolean
}>;

export const SET_HISTORY_NAME = 'SET_HISTORY_NAME';
export type SetHistoryName = ReduxAction<typeof SET_HISTORY_NAME, {
    index: number,
    name: string
}>;

function* requestMatrix(action: SetCurMatrixSetting): any {
    const time = [];
    const source = [];
    for (let index = 0; index < action.payload.timeChange.length; index++) {
        const v = action.payload.timeChange[index];
        if (action.payload.time[v].time.length > 0) {
            time.push(action.payload.time[v]);
            source.push(action.payload.time[v].source);
        }
    }
    if (time.length > 0) {
        const params = {
            dataset: action.payload.dataset,
            time: action.payload.time,
            matrixSelected: action.payload.matrixSelected
        };
        const data = yield call(getExplanation, params);
        const matrixDataAction: GetCurMatrix = {
            type: GET_CUR_MATRIX,
            payload: {
                data: data.res.data,
                topK: data.res.topK,
                source: source
            }
        };
        const attributesAction: SetAttributes = {
            type: SET_ATTRIBUTES,
            payload: {
                attributes: data.attributes,
                source: source,
            }
          };
        yield put(matrixDataAction);
        yield put(attributesAction);
    }
}

export function* watchMatrixSaga(): any {
    yield takeEvery(SET_CUR_MATRIX_SETTING, requestMatrix);
}