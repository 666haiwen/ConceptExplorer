import * as $ from 'jquery';
import {HOSTNAME} from '../constants';
import { Pca, Line, MatrixTime } from '../models';

const ajax = (options: any, func: any = $.ajax): any => {
  return new Promise<object>((resolve, reject) => {
    func(options).done(resolve).fail(reject);
  });
};

const getJson = (options: any): any => ajax(options, $.getJSON);
const postJson = (options: any): any => ajax(options, $.post);
interface TimeLineData {
  pca: Pca,
  line: Line
};
interface TimeLineParams {
  dataset: string,
  start: number,
  end: number,
}
export const getTimeLineData = (param: TimeLineParams): TimeLineData => {
  return getJson({
    url: HOSTNAME + 'api/getTimeLineData',
    data: {
      dataset: param.dataset,
      start: param.start,
      end: param.end,
    }
  }).then((data: TimeLineData) => data);
};

export const getDataset = (datasetName: string): any => {
  return getJson({
    url: HOSTNAME + 'api/getDataset',
    data: {
      datasetName: datasetName
    }
  }).then((data: any) => data);
};

export interface GetExplanationParams {
  dataset: string,
  time: MatrixTime[],
  matrixSelected: boolean[]
};

export const getExplanation = (param: GetExplanationParams): any => {
  return postJson({
    url: HOSTNAME + 'api/getExplanation',
    data: JSON.stringify(param)
  });
};
