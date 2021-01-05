import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { connect } from 'react-redux';
import CSSModules from 'react-css-modules';
import * as d3 from 'd3';
import $ from 'jquery';
import { State, Matrix, AttributeConfigure, MatrixData, MatrixName, MatrixRender, MatrixDrawName} from '../../models';
import { createDispatchHandler, ActionHandler } from '../../actions/redux-action';
import { MatrixAction, ADD_MATRIX_HISTORY, SET_CUR_MATRIX_SETTING } from '../../actions';

import * as styles from './index.scss';
import { MatrixPane } from './matrix';
import { deepClone, getAttrSplitIndexKByName } from '../utils';
import { MatrixHistoryPane } from './history';
import { DATASET_INDEX } from '../../constants';
import { Select, OptionProps } from '../icon/Select';

const LABEL_INFORMATION = [
  'If the AQI would be <100 after 24h?',
  'If the movie rating would rise after 7d?',
  'If the player would purchase in 7d?'
];
export interface ExplanationProps extends ActionHandler<MatrixAction>{
    matrix: Matrix,
    configure: AttributeConfigure,
    dataSourceSelected: boolean[],
    dataset: string,
    dataSourceName: string[]
};

function ExplanationBase(props: ExplanationProps): JSX.Element {
    const {matrix, configure, dataSourceName, dataSourceSelected} = props;
    const dataSourceNum = dataSourceName.length;
    const [preSignal, setPreSignal] = useState(true);
    const [legendState, setLegendState] = useState({value: 0, state: 'normal'});
    const curNameRef =  useRef('Current concpet');
    if (matrix.cur.resetDatasoureSignal != preSignal) {
      // @ts-ignore
      d3.select('.' + styles['bottom-div']).select('input')
        .property('value', 'Current concpet');
      curNameRef.current = 'Current concpet';
      setPreSignal(matrix.cur.resetDatasoureSignal);
    }
    const sourceSelect = (v: any): void => {
      const tmpSourceState = matrix.cur.matrixSelected.concat();
      tmpSourceState[v] = !tmpSourceState[v];
      const curSource: number[] = [];
      tmpSourceState.forEach((v, i) => {
        if (v == true)
          curSource.push(i);
      });
      props.handleAction({
        type: SET_CUR_MATRIX_SETTING,
        payload: {
          normal: cur.normal,
          abnormal: cur.abnormal,
          time: cur.time,
          timeChange: curSource,
          matrixSelected: tmpSourceState,
          cursorTime: cur.cursorTime,
          dataset: props.dataset,
          resetDatasourceFlag: false
        }
      });
    };
    const curSource: number[] = [];
    matrix.cur.matrixSelected.forEach((v, i) => {
      if (v == true && dataSourceSelected[i] == true)
        curSource.push(i);
    });
    const [attributeState, setAttributeState] = useState(7);
    const attributeSet = (event: any): void => {
      setAttributeState(event.target.value);
    };

    const {cur, history, historyAllId} = matrix;
    const splitIndex = configure.splitIndex;
    const topK = cur.topK.slice(0, attributeState);
    const topIndex = [];
    const axisName: MatrixName[] = [];
    topK.forEach(v => {
      for (let index = splitIndex[v]; index < splitIndex[v + 1]; index++)
        topIndex.push(index);
      axisName.push(configure.name[v]);
    });
    
    // get matrix by dataset
    const matrixByDataset = (data: MatrixData[], sourceIndex: number[]): MatrixRender => {
      const res = {
        positive: [...Array(configure.size[0])].map(() => [...Array(configure.size[1])].map(() => 0)),
        negative: [...Array(configure.size[0])].map(() => [...Array(configure.size[1])].map(() => 0)),
        data: [...Array(configure.size[0])].map(() => [...Array(configure.size[1])].map(() => 0)),
      };
      const sourceData = {
        positive: [...Array(dataSourceNum)].map(() => [...Array(configure.size[1] + dataSourceNum)].map(() => 0)),
        negative: [...Array(dataSourceNum)].map(() => [...Array(configure.size[1] + dataSourceNum)].map(() => 0)),
        data: [...Array(dataSourceNum)].map(() => [...Array(configure.size[1] + dataSourceNum)].map(() => 0)),
      };
  
      sourceIndex.forEach((v) => {
        for (let x = 0; x < configure.size[0]; x++) {
          sourceData.positive[v][v] = Math.max(data[v].positive[x][x], sourceData.positive[v][v]);
          sourceData.negative[v][v] = Math.max(data[v].negative[x][x], sourceData.negative[v][v]);
          sourceData.positive[v][x + dataSourceNum] += data[v].positive[x][x];
          sourceData.negative[v][x + dataSourceNum] += data[v].negative[x][x];
          for (let y = 0; y < configure.size[1]; y++) {
            res.positive[x][y] += data[v].positive[x][y];
            res.negative[x][y] += data[v].negative[x][y];
          } 
        }
        sourceData.data[v][v] = (sourceData.positive[v][v] - sourceData.negative[v][v])
          / (Math.max(1, sourceData.positive[v][v] + sourceData.negative[v][v]));  
        for (let x = 0; x < configure.size[0]; x++) {
          sourceData.data[v][x + dataSourceNum] = (sourceData.positive[v][x + dataSourceNum] - sourceData.negative[v][x + dataSourceNum])
            / (Math.max(1, sourceData.positive[v][x + dataSourceNum] + sourceData.negative[v][x + dataSourceNum]));  
          for (let y = 0; y < configure.size[1]; y++) {
            res.data[x][y] = (res.positive[x][y] - res.negative[x][y]) 
              / (Math.max(1, res.positive[x][y] + res.negative[x][y]));
          }
        }
      });
      return {
        res: res,
        sourceData: sourceData
      };
    };
    let curData = matrixByDataset(cur.data, []),
        historyData = matrixByDataset(cur.data, []),
        historySource: number[] = [];
    if (cur.data.length > 0) {
      curData = matrixByDataset(cur.data, curSource);
    };
    let historyIndex = -1;
    let previousName = '';
    history.forEach((record, index) => {
      if (record.recordId == cur.compared) {
        historyIndex = index;
        historySource = record.dataSource;
        return;
      }
    });
    if (historyIndex != -1) {
      historyData = matrixByDataset(history[historyIndex].data, historySource);
      previousName = history[historyIndex].name;
    }


    // function to get Index
    const getAttrKIndexBegin = (k: number): number =>  k >= 0 ? splitIndex[topK[k]] : 0;
    const compare = historyIndex != -1 ? true : false;
    let mergeSource: number[] = [];
    const axisDrawName: MatrixDrawName[] = [{
      attr: 'Data Source',
      splitName: [],
      splitOffset: [],
      oneHot: false
    }];
    let dataNum = 0;
    curSource.forEach(v => {
      dataNum += curData.sourceData.positive[v][v] + curData.sourceData.negative[v][v];
      axisDrawName[0].splitName.push(`DS${v + 1}`);
      mergeSource.push(v);
    });
    historySource.forEach(v => {
      dataNum += historyData.sourceData.positive[v][v] + historyData.sourceData.negative[v][v];
      if (!axisDrawName[0].splitName.includes(`DS${v + 1}`)) {
        axisDrawName[0].splitName.push(`DS${v + 1}`);
        mergeSource.push(v);
      }
    });
    axisDrawName[0].splitName = axisDrawName[0].splitName.sort();
    axisDrawName[0].splitOffset = [...Array(mergeSource.length)].map((v, i) => i);
    mergeSource = mergeSource.sort();
    axisName.map((v, index) => {
      const indexBegin = getAttrKIndexBegin(index);
      const tmp: MatrixDrawName = {
        attr: v.attr,
        splitName: [],
        splitOffset: [],
        oneHot: v.oneHot
      };
      const validOffset = [];
      for (let offset = 0; offset < v.splitName.length - 1; offset++) {
        const curAttrIndex = indexBegin + offset;
        let cnt = 0;
        curSource.map(curSourceIndex => {
          cnt += curData.sourceData.positive[curSourceIndex][curAttrIndex + dataSourceNum]
              + curData.sourceData.negative[curSourceIndex][curAttrIndex + dataSourceNum];
        });
        if (compare) {
          historySource.map(historySourceIndex => {
            cnt += historyData.sourceData.positive[historySourceIndex][curAttrIndex + dataSourceNum]
            + historyData.sourceData.negative[historySourceIndex][curAttrIndex + dataSourceNum];
          });
        }
        if (cnt > 0) {
          validOffset.push(offset);
        }
      } // for (let offset = 0; offset < v.splitName.length - 1; offset++) {
      const left = validOffset[0],
            right = validOffset[validOffset.length - 1];
      tmp.splitName.push(v.splitName[left]);
      for (let offsetInCurAttr = left; offsetInCurAttr <= right; offsetInCurAttr++) {
        tmp.splitName.push(v.splitName[offsetInCurAttr + 1]);
        tmp.splitOffset.push(indexBegin + offsetInCurAttr);
      }
      axisDrawName.push(tmp);
    });
    // get matrix render data
    const grayscaleEvent = (): void => {
      if (legendState.state != 'normal')
        setLegendState({
          value: 0,
          state: 'normal'
        });
      else {
        let matrixRenderData: number[] = [];
        axisDrawName.forEach((v, attrIndex) => {
          const getRenderCubeData = (data: MatrixData, xIndexList: number[], yIndexList: number[], swap: boolean): number[] => {
            const res: number[] = [];
            xIndexList.forEach((x) => {
              yIndexList.forEach((y) => {
                res.push(swap ? data.data[y][x] : data.data[x][y]);
                });
            });
            return res;
          };

          for (let index = 0; index < axisDrawName.length; index++) {
            let xIndexList: number[] = [],
                yIndexList: number[] = [],
                swap = false;

            if (index < attrIndex) {
              if (index == 0 && attrIndex == 0) {
                xIndexList = compare ? mergeSource : curSource;
                yIndexList = compare ? mergeSource : curSource;
              }
              else if (index == 0) {
                xIndexList = getAttrSplitIndexKByName(axisDrawName, axisDrawName[attrIndex].attr, true, dataSourceNum);
                yIndexList = compare ? mergeSource : curSource;
                swap = true;
              }
              else if (attrIndex != 0 && index !=0) {
                xIndexList = getAttrSplitIndexKByName(axisDrawName, axisDrawName[attrIndex].attr, false, dataSourceNum);
                yIndexList = getAttrSplitIndexKByName(axisDrawName, axisDrawName[index].attr, false, dataSourceNum);
              }
              if (attrIndex == 0 || index == 0)
                matrixRenderData.push(...getRenderCubeData(curData.sourceData, xIndexList, yIndexList, swap));
              else
                matrixRenderData.push(...getRenderCubeData(curData.res, xIndexList, yIndexList, false));
              
            } // if (index <= attrIndex)   
            else if (compare) {
              if (attrIndex == 0) {
                xIndexList = mergeSource;
                yIndexList = getAttrSplitIndexKByName(axisDrawName, axisDrawName[index].attr, true, dataSourceNum);
              }
              else {
                xIndexList = getAttrSplitIndexKByName(axisDrawName, axisDrawName[attrIndex].attr, false, dataSourceNum);
                yIndexList = getAttrSplitIndexKByName(axisDrawName, axisDrawName[index].attr, false, dataSourceNum);
              }
              if (attrIndex == 0)
                matrixRenderData.push(...getRenderCubeData(historyData.sourceData, xIndexList, yIndexList, swap));
              else
                matrixRenderData.push(...getRenderCubeData(historyData.res, xIndexList, yIndexList, false));
            }
          }
        });
        matrixRenderData =  matrixRenderData.sort();
        setLegendState({
          value: matrixRenderData[(matrixRenderData.length + 1) / 2 | 0],
          state: 'median'
        });
      }
    };
    const linearOffset = ((legendState.value + 1) / 2) * 100 | 0;
    const background = `linear-gradient(to right, #ff1100, #eee ${linearOffset}%, #008eff)`;

    const filterNum = (dataNum * 0.05) | 0;
    const handleEnterKey = (e: any): void => {
      if (e.nativeEvent.keyCode === 13) {
        $('#matrix-index-input').blur();
      }
    };
    const clickEvent = (): void=> {
      const svgRes = document.getElementById('matrix-cur-svg');
      let canvas: HTMLCanvasElement;
      // @ts-ignore
      html2canvas(svgRes).then((res) => {
        canvas = res;
        props.handleAction({
          type: ADD_MATRIX_HISTORY,
          payload: {
            MatrixRecord: {
              canvas: canvas,
              data: deepClone(cur.data),
              // @ts-ignore
              name: curNameRef.current == 'Current concpet' ? 'Concept ' + historyAllId : curNameRef.current,
              // name: 'Concept ' + historyAllId,
              recordId: historyAllId,
              dataSource: curSource.slice(),
              topK: topK.slice(),
              time: deepClone(cur.time),
              cursorTime: cur.cursorTime
            }
          } 
        });
      });
    };

    // @ts-ignore
    const listIndex: number = DATASET_INDEX[props.dataset];
    const options: OptionProps[] = cur.normal.filter(v => dataSourceSelected[v] == true).map(v => {
      return {
        value: v,
        content: `DS${v + 1}: ${dataSourceName[v]}`,
        groupId: 0,
        checked: matrix.cur.matrixSelected[v]
     };
    });
    options.push(
      ...cur.abnormal.filter(v => dataSourceSelected[v] == true).map(i => {
        return {
          value: i,
          content: `DS${i + 1}: ${dataSourceName[i]}`,
          groupId: 1,
          checked: matrix.cur.matrixSelected[i]
        };
      })
    );
    const clickTmp = (): void => {
      const selectContent = d3.select('#matrix-select');
      selectContent.selectAll('.select-content').style('visibility', 'hidden');
      selectContent.selectAll('.select-up').attr('class', 'select-down');
    };
    return (
        <div styleName='explanation-div'>
          <div className='title-div'>Concept Explanation View</div>
          <div styleName = 'explanation-container'>
            <div styleName='main-div'  onClick={clickTmp}>
            <div styleName='top-space' >
             <div styleName='label-div'>
              <span style={{fontWeight: 550}}>Label: </span>
              <span>{LABEL_INFORMATION[listIndex]}</span>
             </div>
             <div styleName='top-div' >
                <span>{previousName}</span>
              </div>
              </div>

              <MatrixPane 
                curData={curData} 
                curSource={curSource}
                historyData={historyData} 
                historySource={historySource}
                dataSourceNum={dataSourceNum}
                dataNum={dataNum}
                compare={compare}
                mergeSource={mergeSource}
                axisName={axisDrawName}
                legendValue={legendState.value}/>

              <div styleName='bottom-div'>
                <button className='btn' 
                  style={{margin: '0 10px'}}
                  onClick={clickEvent}>
                    Identify
                </button>
                <input type='text' 
                  id='matrix-index-input'
                  defaultValue={'Current concpet'}
                  onKeyPress={handleEnterKey}
                  onChange={(event: any): void => {
                    curNameRef.current = event.target.value;
                  }}
                />
              </div>
          </div>
            <div styleName='side-border-div' />
            <div styleName='side-div'>
              <div styleName='datasource-attribute-div'>
                <div style={{marginBottom: '10px'}}>
                  <span>Data Source(s):</span>
                  <Select 
                    style={{width: '180px'}}
                    title={`${curSource.length} ${curSource.length > 1 ? 'are' : 'is'} selected`}
                    value={-1}
                    options={options}
                    groups={['Consistent DS', 'Inconsistent DS']}
                    btnClick={sourceSelect}
                    id={'matrix-select'}
                  />
                </div>

                <div style={{position: 'absolute', bottom: '5px'}}>
                  <div>
                    <span>#Attribute:</span>
                    <span>{`${attributeState}`}</span>
                  </div>
                  <span>3</span>
                  <input type='range' min='3' max='15' step='1'
                    style={{position: 'relative', top: '-5px', width:'120px'}}
                    defaultValue={attributeState} 
                    onChange={(event): void => attributeSet(event)} />
                  <span>15</span>
                </div>
              </div>
              
              <div styleName='legend-div'>
                <div styleName='grayscale-legend-div' onClick={(): void => grayscaleEvent()}>
                  <div>#Difference:</div>
                  <div style={{display: 'flex'}}>
                    <span>-100%</span>
                    <div styleName='grayscale-legend' style={{background: background}} />
                    <span>100%</span>
                  </div>
                </div>
                <div styleName='record-legend-div'>
                  <span>#Data records:</span>
                  <div 
                    style={{
                      display: 'flex', 
                      margin: '5px 0', 
                      fontSize: filterNum >= 1000 ? '12px' : 
                      (filterNum > 100 ? '14px' :
                      (filterNum >= 10 ? '16px' : '18px'))
                  }}>
                    <span>0</span>
                    <div styleName='record-min-div'></div>
                    <span>{` <${filterNum}`}</span>
                    <div styleName='record-middle-div'></div>
                    <span>{` >=${filterNum}`}</span>
                    <div styleName='record-max-div'></div>
                  </div>
                </div>
              </div>

              <div styleName='concept-collection-div'>
                Identifiled Concepts
              </div>

              <div styleName='history-div'>
                <MatrixHistoryPane history={history} comparedId={cur.compared}/>
              </div>
            </div>
          </div>
        </div>
    );
}

export const ExplanationPane = connect(
  (state: State) => {
      return {
        matrix: state.Matrix,
        configure: state.Configure.attribute,
        dataset: state.Configure.datasetName,
        dataSourceSelected: state.Configure.selected,
        dataSourceName: state.Configure.dataSourceName
      };
  },
  createDispatchHandler<MatrixAction>(),
)(CSSModules(ExplanationBase, styles));