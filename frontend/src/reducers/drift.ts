import {ConceptDrift, DEFAULT_DRIFT} from '../models/drift';
import {Action} from '../actions';
import {SET_DRIFT, SET_DRIFT_MATRIX_TIME} from '../actions/sagas/drift';

export const driftReducer = (state: ConceptDrift = DEFAULT_DRIFT, action: Action): ConceptDrift => {
  const newState = state;
  switch (action.type) {
    case SET_DRIFT:
      return action.payload.drift;
    case SET_DRIFT_MATRIX_TIME:
      newState[action.payload.index].matrixSelected = action.payload.matrixTime.concat();
      return newState.concat();
    default:
      return state;
  }
};
