import React from 'react';
import CSSModules from 'react-css-modules';
import * as styles from './pipe.scss';
import { DataBatch, Attribute } from '../../models';
import {  DEFAULT_COLOR } from '../../constants';
import { BatchRiskPane } from './batchRisk/batchRisk';

export interface DataPipeProps  {
  dataBatch: DataBatch,
  attribute: Attribute,
  brushedFunc: Function
};

function DataPipeBase(props: DataPipeProps): JSX.Element {
  return (
    <div className={`upper-pipe-div pipe-div-${props.dataBatch.name}`}
      style={{
        borderTop: `${DEFAULT_COLOR[props.dataBatch.source]} dotted 2px`,
        borderBottom: `${DEFAULT_COLOR[props.dataBatch.source]} dotted 2px`,
        borderRight: `${DEFAULT_COLOR[props.dataBatch.source]} dotted 2px`
      }}
    >
      <div styleName='title-div' style={{background: DEFAULT_COLOR[props.dataBatch.source]}}>
        <p styleName='title-p'>{`DS${props.dataBatch.source + 1}: ${props.dataBatch.name}`}</p>
      </div>
      <BatchRiskPane dataBatch={props.dataBatch} brushedFunc={props.brushedFunc}></BatchRiskPane>
    </div>
  );
};

export const DataOnePipePane = (CSSModules(DataPipeBase, styles));
