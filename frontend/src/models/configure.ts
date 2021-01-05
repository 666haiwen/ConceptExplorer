import { MatrixName } from './matrix';

export type WarningLevelRange = number[];

export interface AttributeConfigure {
  name: MatrixName[],
  description: string[],
  correlation: number[],
  size: number[],
  splitIndex: number[],
  filterNum: number
};

export interface Configure {
  datasetName: string,
  dataSourceName: string[],
  selected: boolean[],
  recordNum: number[],
  timeStart: number, //unix time
  timeEnd: number,
  timeUnit: number,
  dataNumMax: number,
  warningLevelMax: number,
  warningLevel: WarningLevelRange[],
  attribute: AttributeConfigure,
}

export const DEFAULT_CONFIGURE: Configure = {
  datasetName: 'test',
  dataSourceName: [],
  selected: [],
  recordNum: [],
  timeStart: 0,
  timeEnd: 3600 * 24 * 365 * 10,
  timeUnit: 3600 * 24,
  dataNumMax: 100,
  warningLevelMax: 3,
  warningLevel: [],
  attribute: {
    name: [],
    description: [],
    correlation: [],
    size: [],
    splitIndex: [],
    filterNum: 0
  },
};

