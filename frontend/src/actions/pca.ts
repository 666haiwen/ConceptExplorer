import {Position, PcaSource} from '../models/pca';
import {ReduxAction} from './redux-action';
export type PcaAction = SetPca | SetPcaMinMax;

export const SET_PCA = 'SET_PCA';
export type SetPca = ReduxAction<typeof SET_PCA, {
  data: PcaSource[]
}>;

export const SET_PAC_MIN_MAX = 'SET_PAC_MIN_MAX';
export type SetPcaMinMax = ReduxAction<typeof SET_PAC_MIN_MAX, {
  min: Position,
  max: Position,
  data: PcaSource[]
}>;
