import {Lines} from '../models/line';
import {ReduxAction} from './redux-action';
export type LineAction = SetLine;

export const SET_LINE = 'SET_LINE';
export type SetLine = ReduxAction<typeof SET_LINE, {
  Line: Lines
}>;
