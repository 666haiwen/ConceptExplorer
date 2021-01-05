import { Utils, DEFAULT_UTILS } from '../models';
import { Action, SET_HIGH_LIGHT_INDEX, CANCEL_HIGH_LIGHT, SET_TIME_BRUSH, CANCEL_TIME_BRUSH, SET_WARNING_LEVEL, RESET_UTILS, SET_TIME_SELECTION } from '../actions';
import { deepClone } from '../components/utils';

export const utilsReducer = (state: Utils = DEFAULT_UTILS, action: Action): Utils => {
    switch (action.type) {
        case RESET_UTILS:
            return deepClone(DEFAULT_UTILS);
        case SET_HIGH_LIGHT_INDEX:
            return {
                ...state,
                highLightIndex: action.payload.index,
                highLight: (action.payload.flag && action.payload.index != state.highLightIndex) ?
                     !state.highLight : state.highLight
            };
        case CANCEL_HIGH_LIGHT:
            return {
                ...state,
                highLight: false
            };
        case SET_TIME_BRUSH:
            return {
                ...state,
                brush: true,
                brushStart: action.payload.start,
                brushEnd: action.payload.end,
                offsetLeft: action.payload.offsetLeft,
                offsetRight: action.payload.offsetRight
            };
        case SET_TIME_SELECTION:
            return {
                ...state,
                selection: action.payload.selection
            }
        case CANCEL_TIME_BRUSH:
            return {
                ...state,
                brush: false
            };
        case SET_WARNING_LEVEL:
            return {
                ...state,
                warningLevel: action.payload.warningLevel
            };
        default:
            return state;
    }
};
