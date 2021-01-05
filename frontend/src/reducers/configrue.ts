import { Action, SET_CONFIGURE, SELECT_DATASET, FILTER_DATASOURCE } from '../actions';
import {Configure, DEFAULT_CONFIGURE} from '../models';

export const configureReducer = (state: Configure = DEFAULT_CONFIGURE, action: Action): Configure => {
  switch (action.type) {
    case SET_CONFIGURE:
      return {
        ...action.payload.configure,
        selected: action.payload.configure.dataSourceName.map(() => true)
      };
    case SELECT_DATASET:
      return {
        ...state,
        datasetName: action.payload.datasetName,
      };
    case FILTER_DATASOURCE:
      return {
        ...state,
        selected: action.payload.selected.slice()
      }
    default:
      return state;
  }
};
