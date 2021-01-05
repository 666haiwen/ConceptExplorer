import { all, fork } from 'redux-saga/effects';
import {watchTimeBrush} from './utils.sagas';
import {watchDatasetSaga} from './drift';
import { watchMatrixSaga } from './matrix';

export * from './drift';
export * from './utils.sagas';
export * from './matrix';
export const rootSaga = function* root(): any {
  yield all([fork(watchTimeBrush), fork(watchDatasetSaga), fork(watchMatrixSaga)]);
};
