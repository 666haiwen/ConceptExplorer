import React, { useEffect } from 'react';
import {DriftPane} from './drift/drift';
import {DataPipesPane} from './data-pipes';
import {connect} from 'react-redux';
import {State, Configure} from '../models';
import {createDispatchHandler, ActionHandler} from '../actions/redux-action';
import {SELECT_DATASET, DriftAction} from '../actions/sagas/drift';
import './app.css';
import './utils.css';

import { ExplanationPane } from './explanation';
import { DataSelectionPane } from './DataSelection';

export interface AppProps extends ActionHandler<DriftAction> {
  configure: Configure
};
function App(props: AppProps): JSX.Element {
  useEffect(() => {
    props.handleAction({
      type: SELECT_DATASET,
      payload: {datasetName: 'movie', selected: []}
    });
  }, ['hot']);
  return (
    <div id='app'>
        <div className='upper-container'>
          <DataSelectionPane></DataSelectionPane>
          <ExplanationPane></ExplanationPane>
          <DataPipesPane></DataPipesPane>
        </div>
      <DriftPane></DriftPane>
    </div>
  );
}

export const AppPane = connect(
  (state: State) => {
    return {
      configure: state.Configure
    };
  },
  createDispatchHandler<DriftAction>()
)(App);
export default AppPane;
