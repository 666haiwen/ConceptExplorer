import React, { useEffect } from 'react';
import CSSModules from 'react-css-modules';
import {connect} from 'react-redux';
import * as d3 from 'd3';

import { DriftSource} from '../../../models/drift';
import {DEFAULT_COLOR, WARNING_LEVEL_COLOR, TIME_BAR_COLOR, TIME_LINE_COLOR} from '../../../constants';
import {getMax, deepClone} from '../../utils';
import {MatrixTime, State} from '../../../models';
import {ActionHandler, createDispatchHandler} from '../../../actions/redux-action';
import {MatrixAction, SET_CUR_MATRIX_SETTING, DriftAction, SET_DRIFT_MATRIX_TIME} from '../../../actions';
import * as styles from './driftDetector.scss';

interface DriftDivProps extends ActionHandler<DriftAction | MatrixAction>{
  xScale: d3.ScaleLinear<number,number>,
  source: DriftSource,
  startIndex: number,
  warningLevel: number,
  height: number,
  dataSourceName: string,
  time: MatrixTime[],
  dataset: string,
  timeIndexSelection: number[],
  threshold: number,
};
function DriftDetectorBase(props: DriftDivProps): JSX.Element {
  const {xScale, source, height, dataSourceName, timeIndexSelection} = props;
  const matrixSelected = source.matrixSelected || [100, 110];
  const titleHeight = 15;
  const barHeight = 15;
  const barWidth = barHeight;
  const rectWidth = 1;
  const baseOffset = 1;
  const color = TIME_BAR_COLOR;
  const bottomColor = TIME_LINE_COLOR;
  const colorMap = d3.scaleLinear().domain([0, 2, 3, 5]).range([0.1, 0.3, 0.8, 1]);
  const margin = {left: 50, top: 15, right: 0, bottom: 0};
  const divWidth = 1050 - margin.left;
  const numHeight = height - barHeight - titleHeight - margin.top;
  const numMax = getMax(source.dataNum);
  const yScale = d3.scaleLinear()
      .domain([0, numMax])
      .range([numHeight, 0]);

  const newTime: MatrixTime[] = deepClone(props.time);
  const brushedFunc = (min: number, max: number, batchStart: number) => {
    const timeChanged = [source.index];
    const dataPaneSelected: MatrixTime[] = [];
    if (newTime.length > source.index) {
      newTime[source.index].time = [min + batchStart, max + batchStart];
    }
    timeChanged.push(source.index);
    dataPaneSelected.push({
      source: source.index,
      time: [min, max]
    });
    props.handleAction({
      type: SET_DRIFT_MATRIX_TIME,
      payload: {
        index: source.index,
        matrixTime: [min, max]
      }
    });
  };

  useEffect(() => {
    const svg = d3.select(`.drift-dector-svg-${source.index}`);
    svg.selectAll('g').remove();
    // background
    const batchNum = timeIndexSelection[1] - timeIndexSelection[0] + 1;
    const bayesState = [...Array(batchNum)].map((v) => 0);
    const backgroundG = svg.append('g')
      .attr('class', 'background')
      .attr('transform', `translate(${margin.left}, ${numHeight + margin.top})`);
    const newDataNum = [];
    for (let i = timeIndexSelection[0]; i <= timeIndexSelection[1]; i++) {
      const index = i - timeIndexSelection[0];
      newDataNum.push(source.dataNum[i]);
      if (source.bayes[i] >= props.threshold) {
        bayesState[index] = 1;
          if (index > 0)
            bayesState[index - 1] = 1;
          if (index + 1 < batchNum)
            bayesState[index + 1] = 1;
      }
    }
    const avgBackgroundWidth = xScale(timeIndexSelection[0] + 1) - xScale(timeIndexSelection[0]);
    bayesState.forEach((v, index) => {
      backgroundG.append('rect')
          .attr('x', xScale(index + timeIndexSelection[0]))
          .attr('y', 0)
          .attr('height', barHeight)
          .attr('width', avgBackgroundWidth)
          .attr('fill', bottomColor)
          .attr('stroke', bottomColor)
          .attr('class', v == 1 ? 'bayes-hit' : 'bayes-no-hit');
      });

    // drift
    const driftG = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${numHeight + margin.top})`);
    for (let i = timeIndexSelection[0]; i <= timeIndexSelection[1]; i++) {
      const element = source.drift[i];
      const left = xScale(i);
      const right = xScale(i + 1);
      if (element >= 3) {
        const g = driftG.append('g')
          .style('transform', `translate(${left - barWidth / 2}px, 0px)`);
        g.append('path')
          .attr('d', `M${barWidth * 0.1} ${barHeight * 0.1}, L${barWidth * 0.9} ${barHeight * 0.9}`);
        g.append('path')
          .attr('d', `M${barWidth * 0.9} ${barHeight * 0.1}, L${barWidth * 0.1} ${barHeight * 0.9}`);
      }
      else if (element >= props.warningLevel) {
        const g = driftG.append('g')
          .style('transform', `translate(${left}px, 0px)`);
        g.append('rect')
          .attr('x', 0)
          .attr('y', barHeight / 2 - rectWidth / 2)
          .attr('width', right - left)
          .attr('height', rectWidth)
          .attr('fill', '#fff');
      }
    }
    driftG.append('text')
    .attr('x', 0)
    .attr('y', -numHeight)
    .style('fill', '#222')
    .style('font-size', 12)
    .style('text-anchor', 'middle')
    .text(`Records`);

    const avgWidth = divWidth / (timeIndexSelection[1] - timeIndexSelection[0] + 1);
    const batchyAxis = d3.axisLeft(yScale).ticks(5);
    const batchG = svg.append('g')
      .attr('class', 'batch-group')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
    const yG = batchG.append('g')
      .attr('class', 'y_axis')
      .call(batchyAxis);
    yG.selectAll('.tick line')
      .attr('x2', divWidth)
      .attr('stroke-opacity', 0.05);
    batchG.selectAll('rect')
        .data(newDataNum).enter()
        .append('rect')
        .attr('class', (d,i) => `batch-${source.index}-${i}`)
        .attr('x', (d,i) => xScale(i + timeIndexSelection[0]))
        .attr('y', d => yScale(d))
        .attr('width', avgWidth)
        .attr('height', d => numHeight - yScale(d))
        .style('fill', color);
        // .style('opacity', (d,i) => colorMap(source.drift[i]));
  }, [props.warningLevel, props.timeIndexSelection, props.threshold]);

  // brush update
  useEffect(() => {
    const svg = d3.select(`.drift-dector-svg-${source.index}`);
    const batchG = svg.select('.batch-group');
    svg.select('.batch-brush').remove();

    const brushBegin = (): void => {
      const position = d3.event.selection;
      if (!d3.event.sourceEvent || !position) {
        return ;
      };
      // @ts-ignore
      batchG.select('.brush-axis')
        .attr('x', position[0])
        .attr('width', position[1] - position[0]);
    };
    const brushEnd = (): void => {
      const position = d3.event.selection;
      if (!d3.event.sourceEvent || !position) {
        return ;
      };
      const min = xScale.invert(position[0] - 5) | 0;
      const max = (xScale.invert(position[1] - 1) | 0);
      const start = xScale(min);
      const end = xScale(max);
      let [x0, x1] = [start + 5, end + 1];
      // @ts-ignore
      d3.select(this).transition().call(brush.move, x1 > x0 ? [x0, x1] : null);
      if (max > min) {
        brushedFunc(min, max - 1, 0);
      }
      else {
        [x0, x1] = [xScale(matrixSelected[0]) + 5, xScale(matrixSelected[1] + 1) + 1];
        // @ts-ignore
        brushG.transition().call(brush.move, x1 > x0 ? [x0, x1] : null);
        batchG.select('.brush-axis')
        .attr('x', x0)
        .attr('width', x1 - x0);
      }
    };

    const brushHeight = 20;
    const brushOff = numHeight - brushHeight;
    const brush = d3.brushX()
      .extent([[0, brushOff], [divWidth, brushOff + brushHeight]])
      .on('brush', brushBegin)
      .on('end', brushEnd);

    const brushG = batchG.append('g')
      .attr('class', 'batch-brush')
      .call(brush);
    brushG.selectAll('.handle')
      .style('fill', '#222')
      .style('fill-opacity', 1)
      .style('height', brushHeight)
      .style('width', '4')
      .style('display', 'block')
      .style('transform', 'translate(0px, 3px)');
    brushG.selectAll('.selection')
      .style('fill', 'none')
      .style('fill-opacity', 1)
      .style('stroke', 'none')
      .style('height', brushHeight);
      // .style('transform', `translate(0px, ${brushHeight / 2}px)`);
    const [x0, x1] = [xScale(matrixSelected[0]) + 5, xScale(matrixSelected[1] + 1) + 1];
    if (x1 > x0)
      brushG.append('rect')
        .attr('class', 'brush-axis')
        .attr('x', x0)
        .attr('y', brushOff + brushHeight / 2)
        .attr('width', x1 - x0)
        .attr('height', 1)
        .attr('fill', '#222');
    brushG.transition().call(brush.move, x1 > x0 ? [x0, x1] : null);
  }, [matrixSelected, props.timeIndexSelection]);

  const format = d3.timeFormat('%B %d, %Y');
  const formatTime = (v: number): string => {
    // @ts-ignore
    const formatRes = format(v);
    const resArray: string[] = formatRes.split(' ');
    if (resArray[0].length == 9) {
      resArray[0] = resArray[0].slice(0, 4) + '.';
    }
    else
      resArray[0] = resArray[0].slice(0, 3) + '.';
    return `${resArray[0]}  ${resArray[1]}  ${resArray[2]}`;
  };
  let count = 0;
  for (let index = matrixSelected[0]; index <= matrixSelected[1]; index++) {
    count += source.dataNum[index - matrixSelected[0]];
  }
  const batches = matrixSelected[1] - matrixSelected[0] + 1;
  const timeIndex = [matrixSelected[0], matrixSelected[1]];
  const beSelected = !(timeIndex[0] > timeIndex[1]);
  const timeRes = [formatTime(source.time[timeIndex[0]] * 1000), formatTime(source.time[timeIndex[1]] * 1000)];
  const selectedTime = beSelected ?
    // @ts-ignore
    `The time segment:  ${timeRes[0]} - ${timeRes[1]}`
    :
    null;

  return (
    <div styleName='drift-div' style={{height: height + 'px'}}>
      <div styleName='drift-title-div'>
        <div styleName='drift-title-p'>{`DS${source.index + 1}: ${dataSourceName}`}</div>
        <div styleName='drift-right-div'>
          <div styleName='drift-selected-batch'>
            <div>{`Selected Information :  ${batches} Batches`}</div>
            <div>{`${count} Records`}</div>
          </div>
          <div styleName='drift-selected-information'>
            {selectedTime}
          </div>
        </div>
      </div>
      <div styleName='drift-detector-div' style={{height: height - titleHeight + 'px'}}>
          <svg styleName='drift-detector-svg' className={`drift-dector-svg-${source.index}`}>
          </svg>
      </div>
    </div>
  );
}

export const DriftDetectorDiv = connect(
  (state: State) => {
    return {
      time: state.Matrix.cur.time,
    };
  },
  createDispatchHandler<DriftAction | MatrixAction>()
)(CSSModules(DriftDetectorBase, styles));
