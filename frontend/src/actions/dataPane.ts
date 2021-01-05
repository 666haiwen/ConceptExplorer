import { ReduxAction } from './redux-action';
import { DataPane, MatrixTime } from '../models';
export type DataPaneAction = SetDataPane | SetDataPaneMatrix;

export const SET_DATA_PANE = 'SET_DATA_PANE';
export type SetDataPane = ReduxAction<typeof SET_DATA_PANE, {
    DataPane: DataPane
}>;

export const SET_DATA_PANE_MATRIX = 'SET_DATA_PANE_MATRIX';
export type SetDataPaneMatrix = ReduxAction<typeof SET_DATA_PANE_MATRIX, {
    data: MatrixTime[]
}>;