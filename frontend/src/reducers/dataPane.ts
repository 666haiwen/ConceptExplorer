import { DataPane, DEFAULT_DATA_PANE } from '../models';
import { Action } from '../actions';
import { SET_DATA_PANE, SET_DATA_PANE_MATRIX } from '../actions/dataPane';

export const dataPaneReducer = (state: DataPane = DEFAULT_DATA_PANE, action: Action): DataPane => {
    const newState = state;
    switch (action.type) {
        case SET_DATA_PANE:
            return action.payload.DataPane;
        case SET_DATA_PANE_MATRIX:
            action.payload.data.forEach(v => {
                newState[v.source].matrixSelected = v.time.concat();
            });
            return newState.concat();
        default:
            return state;
    }
};
