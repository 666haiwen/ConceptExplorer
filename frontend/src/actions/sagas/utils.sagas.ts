import { call, put, takeEvery } from 'redux-saga/effects';
import {ReduxAction} from '../redux-action';
import {getTimeLineData} from '../../api';
import {SetPca, SET_PCA} from '../pca';
import { SetLine, SET_LINE } from '../line';
import { SetDataPane, SET_DATA_PANE } from '../dataPane';

export type UtilsAction = SetHighLightIndex | CancelHighLight | SetTimeBrush
   | CancelTimeBrush | SetWarningLevel | ResetUtils | SetTimeSelection;


export const RESET_UTILS = 'RESET_UTILS';
export type ResetUtils = ReduxAction<typeof RESET_UTILS, {}>;
export const SET_HIGH_LIGHT_INDEX = 'SET_HIGH_LIGHT_INDEX';
export type SetHighLightIndex = ReduxAction<typeof SET_HIGH_LIGHT_INDEX, {
    index: number,
    flag: boolean
}>;

export const CANCEL_HIGH_LIGHT = 'CANCEL_HIGH_LIGHT';
export type CancelHighLight = ReduxAction<typeof CANCEL_HIGH_LIGHT, {
    index: number,
}>;

export const SET_TIME_BRUSH = 'SET_TIME_BRUSH';
export type SetTimeBrush = ReduxAction<typeof SET_TIME_BRUSH, {
  dataset: string,
  start: number,
  end: number,
  offsetLeft: number,
  offsetRight: number,
}>;

export const SET_TIME_SELECTION = 'SET_TIME_SELECTION';
export type SetTimeSelection = ReduxAction<typeof SET_TIME_SELECTION, {
  selection: number[]
}>;

export const SET_WARNING_LEVEL = 'SET_WARNING_LEVEL';
export type SetWarningLevel = ReduxAction<typeof SET_WARNING_LEVEL, {
  warningLevel: number
}>;

export const CANCEL_TIME_BRUSH = 'CANCEL_TIME_BRUSH';
export type CancelTimeBrush = ReduxAction<typeof CANCEL_TIME_BRUSH, {}>;

function* requestTimeLineData(action: SetTimeBrush): any {
    const data = yield call(getTimeLineData, action.payload);
    const pcaAction: SetPca = {
      type: SET_PCA,
      payload: {data: data.pca.data}
    };
    const lineAction: SetLine = {
      type: SET_LINE,
      payload: {Line: data.line}
    };
    const dataPaneAction: SetDataPane = {
      type: SET_DATA_PANE,
      payload: {DataPane: data.dataPane}
    };
    yield put(pcaAction);
    yield put(lineAction);
    yield put(dataPaneAction);
  }

  export function* watchTimeBrush(): any {
    yield takeEvery(SET_TIME_BRUSH, requestTimeLineData);
  }
