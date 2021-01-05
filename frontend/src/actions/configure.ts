import {ReduxAction} from './redux-action';
import { Configure } from '../models';

export type ConfigureAction = SetConfigure | FitlerDatasource;

export const SET_CONFIGURE = 'SET_CONFIGURE';
export type SetConfigure = ReduxAction<typeof SET_CONFIGURE, {
  configure: Configure
}>;

export const FILTER_DATASOURCE = 'FILTER_DATASOURCE';
export type FitlerDatasource = ReduxAction<typeof FILTER_DATASOURCE, {
  selected: boolean[]
}>;

