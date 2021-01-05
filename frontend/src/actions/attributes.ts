import { ReduxAction } from './redux-action';
import { Attributes } from '../models';
export type AttributesAction = SetAttributes;

export const SET_ATTRIBUTES = 'SET_ATTRIBUTES';
export type SetAttributes = ReduxAction<typeof SET_ATTRIBUTES, {
    attributes: Attributes,
    source: number[]
}>;