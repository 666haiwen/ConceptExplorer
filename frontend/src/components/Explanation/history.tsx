import React, { useEffect, useState } from 'react';
import CSSModules from 'react-css-modules';
import { connect } from 'react-redux';
import * as d3 from 'd3';
import $ from 'jquery';
import * as styles from './history.scss';
import { MatrixRecord } from '../../models';
import { createDispatchHandler, ActionHandler } from '../../actions/redux-action';
import { MatrixAction, SET_PREV_MATRIX, SET_HISTORY_NAME } from '../../actions';

export interface MatrixHistoryProps extends ActionHandler<MatrixAction> {
    history: MatrixRecord[],
    comparedId: number
};

function MatrixHistoryBase(props: MatrixHistoryProps): JSX.Element {
    const {history, comparedId} = props;
    const [listIndexState, setListIndexState] = useState(0);
    useEffect(() => {
      history.forEach(v => {
        const div = document.getElementsByClassName(`screen-shot-container-${v.recordId}`);
        const d3Div = d3.select(`.screen-shot-container-${v.recordId}`);
        if (div.length != 0) {
          div[0].appendChild(v.canvas);
          d3.select(`.screen-shot-container-${v.recordId}`).select('canvas')
            .style('width', '190px')
            .style('height', '100px')
            .style('position', 'absolute')
            .style('left', '-40px')
            .style('bottom', 0)
            .style('z-index', '-1');
        }
        if (comparedId == v.recordId) {
          d3Div.style('border-width', '3px')
            .style('border-color', '#777');
        }
        else {
          d3Div.style('border-width', '1px')
            .style('border-color', '#777');
        }
      });
    });
    const setCompared = (recordId: number): void => {
      props.handleAction({
        type: SET_PREV_MATRIX,
        payload: {
          recordId: recordId
        }
      });
    };

    const btnClick = (v: number): void => {
      if (listIndexState + v >= 0 && listIndexState + v < history.length)
      setListIndexState(listIndexState + v);
    };
    const voidClick = (): void => {return;};
    const handleEnterKey = (e: any, id: number, index: number): void => {
      if (e.nativeEvent.keyCode === 13) {
        props.handleAction({
          type: SET_HISTORY_NAME,
          payload: {
            index: index,
            name: e.target.value
          }
        });
        $(`#screen-shot-container-input-${id}`).blur();
      }
    };
    return (
        <div styleName='history-container'>
          {
            listIndexState > 0 ?
              <div styleName='up-btn' 
                onClick={(): void => btnClick(-1)}
              />
            :
            null
          }
          {
            history.map((v, index) => {
              if (index < listIndexState || index > listIndexState + 1)
                return;
              const dataSource = v.dataSource.concat().sort();
              let text = dataSource.length > 1 ? 'DSs: ' : 'DS: ';
              dataSource.forEach(source => {
                text += (source + 1) + ', ';
              });
              text = text.slice(0, text.length - 2);
              return (
                <div styleName='screen-shot-div' 
                  key={v.recordId}>
                    <div styleName='screen-shot-container' 
                      className={`screen-shot-container-${v.recordId}`}
                      onClick={voidClick}
                      onKeyPress={(e: any): any => handleEnterKey(e, v.recordId, index)}
                    >
                      <input styleName='screen-shot-name' 
                        id={`screen-shot-container-input-${v.recordId}`}
                        type='text' 
                        defaultValue={v.name} 
                      />
                    </div>
                    <div styleName='screen-shot-information'  onClick={(): void => setCompared(v.recordId)}>
                      <span style={{display: 'block'}}>{`●${v.cursorTime}`}</span>
                      <span style={{display: 'block'}}>{`●${text}`}</span>
                    </div>
                </div>
              );
            })
          }
          {
            listIndexState + 2 < history.length  ?
              <div styleName='down-btn' 
                onClick={(): void => btnClick(1)}
              />
            :
              null
          }
        </div>
    );
}

export const MatrixHistoryPane = connect(
  null,
  createDispatchHandler<MatrixAction>()
)(CSSModules(MatrixHistoryBase, styles));