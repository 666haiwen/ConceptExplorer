import { Matrix, DEFAULT_MATRIX } from '../models';
import { Action, GET_CUR_MATRIX, SET_CUR_MATRIX_SETTING, ADD_MATRIX_HISTORY, SET_PREV_MATRIX, SET_HISTORY_NAME, RESET_MATRIX } from '../actions';
import { deepClone } from '../components/utils';

export const matrixReducer = (state: Matrix = DEFAULT_MATRIX, action: Action): Matrix => {
    let newCurMatrix = state.cur.data;
    const history = state.history;
    switch (action.type) {
        case RESET_MATRIX:
            return deepClone(DEFAULT_MATRIX);
        case GET_CUR_MATRIX:
            if (newCurMatrix.length == 0)
                newCurMatrix = [...Array(action.payload.data.length)].map(() => {return {
                    positive: [],
                    negative: [],
                    data: []
                };});
            action.payload.source.forEach(v => {
                newCurMatrix[v].positive = deepClone(action.payload.data[v].positive);
                newCurMatrix[v].negative = deepClone(action.payload.data[v].negative);
            });
            return {
                ...state,
                cur: {
                    ...state.cur,
                    data: newCurMatrix.concat(),
                    topK: action.payload.topK
                }
            };
        case ADD_MATRIX_HISTORY:
            return {
                ...state,
                historyAllId: state.historyAllId + 1,
                history: state.history.concat(action.payload.MatrixRecord)
            };
        case SET_PREV_MATRIX:
            return {
                ...state,
                cur: {
                    ...state.cur,
                    compared: action.payload.recordId
                }
            };
        case SET_CUR_MATRIX_SETTING:
            return {
                ...state,
                cur: {
                    ...state.cur,
                    normal: action.payload.resetDatasourceFlag ? action.payload.normal : state.cur.normal,
                    abnormal: action.payload.resetDatasourceFlag ? action.payload.abnormal : state.cur.abnormal,
                    time: action.payload.time,
                    cursorTime: action.payload.cursorTime != '' ?
                        action.payload.cursorTime : state.cur.cursorTime,
                    timeChanged: action.payload.timeChange,
                    matrixSelected: action.payload.matrixSelected.length > 0 ? action.payload.matrixSelected : state.cur.matrixSelected,
                    resetDatasoureSignal: action.payload.resetDatasourceFlag ?
                        !state.cur.resetDatasoureSignal : state.cur.resetDatasoureSignal
                }
            };
        case SET_HISTORY_NAME:
            history[action.payload.index].name = action.payload.name;
            return {
                ...state,
                history: history.concat()
            };
        default:
            return state;
    }
};
