import { Action, SET_PCA, SET_PAC_MIN_MAX } from '../actions';
import { Pca, DEFAULT_PCA } from '../models/pca';

export const pcaReducer = (state: Pca = DEFAULT_PCA, action: Action): Pca => {
  switch (action.type) {
    case SET_PCA:
      return {
        ...state,
        data: action.payload.data
      };
    case SET_PAC_MIN_MAX:
      return {
        ...state,
        min: action.payload.min,
        max: action.payload.max,
        allData: action.payload.data
      };
    default:
      return state;
  }
};
