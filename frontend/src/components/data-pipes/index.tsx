import React from 'react';
import CSSModules from 'react-css-modules';
import {connect} from 'react-redux';
import {State, DataPane, Attributes, MatrixTime} from '../../models';
import {DataOnePipePane} from './data-pipe';

import * as styles from './index.scss';
import { deepClone } from '../utils';
import { ActionHandler, createDispatchHandler } from '../../actions/redux-action';
import { DataPaneAction, SET_DATA_PANE_MATRIX, MatrixAction, SET_CUR_MATRIX_SETTING } from '../../actions';

export interface DataPipesProps extends ActionHandler<DataPaneAction | MatrixAction> {
  dataset: string,
  dataPane: DataPane,
  selected: boolean[],
  attributes: Attributes,
  time: MatrixTime[],
  matrixSelected: boolean[]
};

function DataPipesPaneBase(props: DataPipesProps): JSX.Element {
  const newTime: MatrixTime[] = deepClone(props.time);
  function brushedFunc(min: number, max: number, source: number, batchStart: number): void {
    const timeChanged = [];
    const dataPaneSelected: MatrixTime[] = [];
    for (let index = 0; index < newTime.length; index++) 
      if (newTime[index].time.length == 0 || newTime[index].source == source) {
        newTime[index].time = [min + batchStart, max + batchStart];
        timeChanged.push(index);
        dataPaneSelected.push({
          source: newTime[index].source,
          time: [min, max]
        });
      }
    props.handleAction({
      type: SET_DATA_PANE_MATRIX,
      payload: {
        data: dataPaneSelected
      }
    });
    props.handleAction({
      type: SET_CUR_MATRIX_SETTING,
      payload: {
        normal: [],
        abnormal: [],
        time: newTime,
        timeChange: timeChanged,
        matrixSelected: props.matrixSelected,
        cursorTime: '',
        dataset: props.dataset,
        resetDatasourceFlag: false
      }
    });
  }
  return (
    <div styleName='pipes-div'>
      <div className='title-div' style={{paddingLeft: '40px', width: '300px'}}>Concept-Time View</div>
      <div styleName='pipes-container'>
        <div styleName='data-pipe-container'>
          {props.dataPane.map((v, i) => {
            if (props.selected[i] == true)
              return <DataOnePipePane key={i} dataBatch={v} attribute={props.attributes[i]} 
              brushedFunc={brushedFunc}/>;
            else
              return null;
          }
          )}
        </div>
      </div>
    </div>
  );
};

export const DataPipesPane = connect(
  (state: State) => {
    return {
      dataPane: state.DataPane,
      attributes: state.Attributes,
      time: state.Matrix.cur.time,
      dataset: state.Configure.datasetName,
      selected: state.Configure.selected,
      matrixSelected: state.Matrix.cur.matrixSelected
    };
  },
  createDispatchHandler<DataPaneAction | MatrixAction>()
)(CSSModules(DataPipesPaneBase, styles));