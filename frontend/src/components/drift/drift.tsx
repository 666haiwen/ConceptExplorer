import React, {useState} from 'react';
import CSSModules from 'react-css-modules';
import {LinePane} from './line/line';
import {TimeBarPane} from './timeBar/timeBar';
import * as styles from './drift.scss';
import { connect } from 'react-redux';
import { State, Utils } from '../../models';
import { PcaPane } from './pca';
import { DriftSvg } from '../icon';
import { createDispatchHandler, ActionHandler } from '../../actions/redux-action';
import { UtilsAction, SET_WARNING_LEVEL } from '../../actions';

export interface DriftPros extends ActionHandler<UtilsAction> {
  utils: Utils
};
function DriftPaneBase({utils, handleAction}: DriftPros): JSX.Element {
  const [driftLevelState, setDriftLevelState]  = useState(2);

  return (
    <div styleName='concept-drift-div'>
      <div styleName='title-div'>
        {'Timeline Drift View'}
      </div>
      <div styleName='extra-title'>
        <div styleName='legend-div'>
          <div style={{position: 'relative', width: 160, margin: '0 10px', display: 'flex'}}>
            <span style={{marginRight: 5}}>{'Confirmed drifts: '}</span>
            <DriftSvg width={25} height={25} fill='black' strokeWidth={'1px'} ></DriftSvg>
          </div>
          <div style={{position: 'relative', width: 220, margin: '0 10px'}}>
            Highlight time segments: —
          </div>
          <div style={{position: 'relative', width: 120, margin: '0 10px', display: 'flex'}}>
            <span>Drift level:</span>
            <input style={{
              background: 'white',
              color: 'black',
              border: 'solid 0.5px',
              width: '20px',
              margin: '2px',
              marginLeft: '7px',
              textAlign: 'center'
              } }
              // type='number'
              defaultValue={driftLevelState}
              min={0}
              max={3}
              onChange = {(event: any): void => {
                const value = parseFloat(event.target.value);
                if (value >= 0 && value <10) {
                  handleAction({
                    type: SET_WARNING_LEVEL,
                    payload: {
                      warningLevel: value
                    }
                  });
                  setDriftLevelState(parseInt(event.target.value));
                }
              }}
              />
          </div>
        </div>
      </div>
      <div styleName='online-div'>
        <TimeBarPane></TimeBarPane>
        <LinePane></LinePane>
        {/* <div style={{
          borderRight: '1.5px dotted #888888',
          width: 0,
          height: '255px',
        }}></div> */}
        {/* <PcaPane></PcaPane> */}
      </div>
      {/* <TimeBarPane></TimeBarPane>
      <svg styleName='trapezoid-svg'>
        {trapezoidPath}
      </svg> */}
    </div>
  );
}

export const DriftPane = connect(
  (state: State) => {
    return {
      utils: state.Utils
    };
  },
  createDispatchHandler<UtilsAction>()
)(CSSModules(DriftPaneBase, styles));
