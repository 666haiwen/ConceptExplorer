import { DEFAULE_ATTRIBUTES, Attributes } from '../models';
import { Action, SET_ATTRIBUTES } from '../actions';
import { deepClone } from '../components/utils';

export const attributesReducer = (state: Attributes = DEFAULE_ATTRIBUTES, action: Action): Attributes => {
    let oldState = state;
    switch (action.type) {
        case SET_ATTRIBUTES:
            if (oldState.length == 0)
                oldState = action.payload.attributes;
            else
                action.payload.source.forEach(v => {
                    oldState[v] = deepClone(action.payload.attributes[v]);
                });
            return oldState.concat();
        default:
            return state;
    }
};
