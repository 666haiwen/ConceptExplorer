import React, { useState } from 'react';
import { connect } from 'react-redux';
import CSSModules from 'react-css-modules';
import { ActionHandler, createDispatchHandler } from '../../actions/redux-action';
import {SELECT_DATASET, DriftAction} from '../../actions/sagas/drift';
import * as styles from './index.scss';
import { State, Configure } from '../../models';
import { TablePane } from './table';
import { DEFAULT_COLOR } from '../../constants';
import { Select, OptionProps } from '../icon/Select';
import { ConfigureAction, FILTER_DATASOURCE } from '../../actions';

export interface DataSelectionProps extends ActionHandler<DriftAction | ConfigureAction> {
  configure: Configure
};

const DATASET_NAME = [
  ['Beijing Air Quality Forecast', 'prsa'],
  ['Movie Rating Prediction', 'movie'],
  ['Consumption Behaviors of MMORPG', 'netease']
];

const SPAN_INFORMATION = [
  'March 1st, 2013 to February 28th, 2017',
  'February 28th,  2013 to March 31st, 2015',
  'August 16th, 2013 to January 19th, 2014'
];
function DataSelectionPaneBase(props: DataSelectionProps): JSX.Element {
  const { configure } = props;
  const [listState, setListState] = useState(1);
  const btnClick = (index: number): void => {
    if (index != listState) {
      props.handleAction({type: SELECT_DATASET, payload:{datasetName: DATASET_NAME[index][1]}});
      setListState(index);
    }
  };
  const checkFunc = (index: number): void => {
    const newSelected = configure.selected.slice();
    newSelected[index] = !newSelected[index];
    props.handleAction({type: FILTER_DATASOURCE, payload:{selected: newSelected}});
  };
  const style = {
    fontSize: '16px',
    fontWeight: 400
  };
  const dataSourceContent: string[][] = [];
  configure.dataSourceName.forEach((v, i) => {
    let record = '';
    const tmp = '' + configure.recordNum[i];
    const length = tmp.length;
    for (let index = length - 1; index >= 0; index--) {
      record = tmp[index] + record;
      if ((length - index) % 3 == 0 && index > 0)
        record = ',' + record;
    }
    dataSourceContent.push(['' + configure.selected[i], `DS${i+1}`, v, record]);
  });
  const maxSourceHeight = configure.dataSourceName.length > 4 ? 4: configure.dataSourceName.length;
  const maxAttrHegith = 11 - maxSourceHeight;

  let attributeContent: string[][] = [];
  const correlation = configure.attribute.correlation.map((v, i) => [v, i]);
  correlation.sort((a, b) => b[0] - a[0]);
  correlation.forEach((v) => {
    if (configure.attribute.name[v[1]].attr != 'Non')
      attributeContent.push([configure.attribute.name[v[1]].attr, configure.attribute.description[v[1]]]);
  });
  attributeContent = attributeContent.slice(0, configure.attribute.description.length);
  const options: OptionProps[] = [
    {value: 0, content: DATASET_NAME[0][0], groupId: -1, checked: listState == 0},
    {value: 1, content: DATASET_NAME[1][0], groupId: -1, checked: listState == 1},
    {value: 2, content: DATASET_NAME[2][0], groupId: -1, checked: listState == 2}
  ];
  return (
    <div styleName='data-selection-div'>
      <div styleName='title-div'>
        PatternExplorer
        <div styleName='title-right-div'></div>
      </div>
      <div styleName='data-selection-container'>
        <div styleName='data-selection-scroll'>
        <div styleName='selection-div'>
          <span>Data selection:</span>
          <Select
            style={{width: '360px', top: '10px'}}
            value={listState}
            title={''}
            options={options}
            btnClick={btnClick}
            groups={[]}
          />
        </div>

        <div styleName='segment-div'/>
        <div styleName='span-div'>
          <span>Time span: </span>
          <span style={style}>{SPAN_INFORMATION[listState]}</span>
        </div>

        <div styleName='segment-div'/>
        <div styleName='datasource-div'>
          <span>Data source description</span>
          <TablePane
            title={['Selected', 'No.', 'Name', '#Data record']}
            content={dataSourceContent}
            maxH={maxSourceHeight}
            centerIdx={[0, 1, 2]}
            rightIdx={[3]}
            width={[80, 80, 130, 140]}
            color={-1}
            check={0}
            checkFunc={checkFunc}
            />
        </div>

        <div styleName='segment-div'/>
        <div styleName='attribute-div'>
          <span>Attribute description:</span>
          <TablePane
            title={['Attribute', 'Description']}
            content={attributeContent}
            maxH={maxAttrHegith}
            centerIdx={[]}
            rightIdx={[]}
            width={[140, 350]}
            />
        </div>
        </div>
      </div>
    </div>
  );
}

export const DataSelectionPane = connect(
    (state: State) => {
        return {
          configure: state.Configure
        };
    },
    createDispatchHandler<DriftAction | ConfigureAction>()
)(CSSModules(DataSelectionPaneBase, styles));
