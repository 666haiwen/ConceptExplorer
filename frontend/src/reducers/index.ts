import { combineReducers } from 'redux';
import { pcaReducer } from './pca';
import { lineReducer } from './line';
import { State } from '../models';
import {configureReducer} from './configrue';
import {driftReducer} from './drift';
import { dataPaneReducer } from './dataPane';
import { utilsReducer } from './utils';
import { attributesReducer } from './attribute';
import { matrixReducer } from './matrix';

export default combineReducers<State>({
  Pca: pcaReducer,
  Lines: lineReducer,
  Configure: configureReducer,
  Drift: driftReducer,
  DataPane: dataPaneReducer,
  Attributes: attributesReducer,
  Utils: utilsReducer,
  Matrix: matrixReducer
});
