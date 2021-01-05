import { Action, SET_LINE } from '../actions';
import { DEFAULT_LINES, Lines } from '../models/line';

export const lineReducer = (state: Lines = DEFAULT_LINES, action: Action): Lines => {
  switch (action.type) {
    case SET_LINE:
      return action.payload.Line;
    default:
      return state;
  }
};
