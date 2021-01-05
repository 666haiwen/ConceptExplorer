import { call, put, takeEvery } from 'redux-saga/effects';
import {ReduxAction} from '../redux-action';
import {getDataset} from '../../api';
import {SetConfigure, SET_CONFIGURE} from '../configure';
import {ConceptDrift} from '../../models/drift';
import { SetPcaMinMax, SET_PAC_MIN_MAX } from '../pca';
import { SetLine, SET_LINE } from '../line';
import { DEFAULT_LINES, DEFAULT_DATA_PANE } from '../../models';
import { SetDataPane, SET_DATA_PANE } from '../dataPane';
import { ResetMatrix, RESET_MATRIX } from './matrix';
import { ResetUtils, RESET_UTILS } from './utils.sagas';

export type DriftAction = SelectDataset | SetDrift | SetDriftMatrixTime;

export const SELECT_DATASET = 'SELECT_DATASET';
export type SelectDataset = ReduxAction<typeof SELECT_DATASET, {
  datasetName: string,
}>;

export const SET_DRIFT = 'SET_DRIFT';
export type SetDrift = ReduxAction<typeof SET_DRIFT, {
  drift: ConceptDrift
}>;

export const SET_DRIFT_MATRIX_TIME = 'SET_DRIFT_MATRIX_TIME';
export type SetDriftMatrixTime = ReduxAction<typeof SET_DRIFT_MATRIX_TIME, {
  matrixTime: number[],
  index: number
}>;

function* requestDataset(action: SelectDataset): any {
  const result = yield call(getDataset, action.payload.datasetName);

  const configureAction: SetConfigure = {
    type: SET_CONFIGURE,
    payload: {configure: result.configure}
  };
  const driftAction: SetDrift = {
    type: SET_DRIFT,
    payload: {drift: result.drift}
  };
  const pcaAction: SetPcaMinMax = {
    type: SET_PAC_MIN_MAX,
    payload: {
      min: result.configure.pca.min,
      max: result.configure.pca.max,
      data: result.pca
    }
  };
  const lineAction: SetLine = {
    type: SET_LINE,
    payload: {
      Line: DEFAULT_LINES
    }
  };
  const dataPaneAction: SetDataPane = {
    type: SET_DATA_PANE,
    payload: {
      DataPane: DEFAULT_DATA_PANE
    }
  };
  const matrixAction: ResetMatrix = {
    type: RESET_MATRIX,
    payload: {}
  };
  const utilsAction: ResetUtils = {
    type: RESET_UTILS,
    payload: {}
  };
  yield put(dataPaneAction);
  yield put(matrixAction);
  yield put(driftAction);
  yield put(lineAction);
  yield put(pcaAction);
  yield put(utilsAction);
  yield put(configureAction);
}

export function* watchDatasetSaga(): any {
  yield takeEvery(SELECT_DATASET, requestDataset);
}

