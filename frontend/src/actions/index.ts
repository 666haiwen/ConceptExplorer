import {PcaAction} from './pca';
import {LineAction} from './line';
import {DataPaneAction} from './dataPane';
import {UtilsAction} from './sagas/utils.sagas';

import {ConfigureAction} from './configure';
import {DriftAction} from './sagas/drift';
import { AttributesAction } from './attributes';
import { MatrixAction } from './sagas/matrix';

export * from './configure';
export * from './pca';
export * from './line';
export * from './dataPane';
export * from './attributes';
export * from './sagas/matrix';
export * from './sagas';
/**
 * Union type of all actions in our application.
 */
export type Action = (
  PcaAction |
  LineAction |
  ConfigureAction |
  DriftAction |
  DataPaneAction |
  AttributesAction |
  UtilsAction |
  MatrixAction
);
