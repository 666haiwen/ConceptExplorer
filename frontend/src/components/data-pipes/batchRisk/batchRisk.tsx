import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import CSSModules from 'react-css-modules';
import * as d3 from 'd3';
import { DataBatch, State } from '../../../models';
import { WARNING_LEVEL_COLOR, DEFAULT_COLOR } from '../../../constants';
import { ActionHandler, createDispatchHandler } from '../../../actions/redux-action';
import { UtilsAction, DataPaneAction } from '../../../actions';

import * as styles from './batchRisk.scss';

export interface BatchRiskProps extends ActionHandler<UtilsAction | DataPaneAction>  {
  dataBatch: DataBatch,
  brushedFunc: Function,
  dataNumMax: number,
  warningLevelMax: number
};

function BatchRiskBase(props: BatchRiskProps): JSX.Element {
  const {dataBatch, brushedFunc, warningLevelMax } = props;
  const batchNum = dataBatch.data.length;
  const baseOffset = 1;
  const color = d3.interpolateRgb(WARNING_LEVEL_COLOR[0], DEFAULT_COLOR[dataBatch.source]);
  const margin = {top: 50, right: 30, bottom: 40, left: 40};

  const formatMillisecond = d3.timeFormat('.%L'),
        formatSecond = d3.timeFormat(':%S'),
        formatMinute = d3.timeFormat('%I:%M'),
        formatHour = d3.timeFormat('%I %p'),
        formatDay = d3.timeFormat('%a %d'),
        formatWeek = d3.timeFormat('%b %d'),
        formatMonth = d3.timeFormat('%B'),
        formatYear = d3.timeFormat('%Y');

  const multiFormat = (index: number): string => {
    // @ts-ignore
    const date: Date = dataBatch.data[index].time * 1000;
    return (d3.timeSecond(date) < date ? formatMillisecond
    : d3.timeMinute(date) < date ? formatSecond
    : d3.timeHour(date) < date ? formatMinute
    : d3.timeDay(date) < date ? formatHour
    : d3.timeMonth(date) < date ? (d3.timeWeek(date) < date ? formatDay : formatWeek)
    : d3.timeYear(date) < date ? formatMonth
    : formatYear)(date);
  };

  useEffect(() => {
    if (dataBatch.data.length == 0)
      return;
    const div = d3.select(`.pipe-div-${dataBatch.name}`);
    const batchSvg = div.select('.' + styles['batch-risk-svg']);
    const batchWidth = parseInt(batchSvg.style('width')) - margin.left - margin.right;
    const batchHeight = parseInt(batchSvg.style('height')) - margin.top - margin.bottom;
    const avgWidth = batchWidth / batchNum;

    let num = 0;
    dataBatch.data.forEach(v => num = Math.max(num, v.dataNum));
    const times = dataBatch.data.map(v => v.time);
    const timeAxis = times.length > 3 ? [0, times.length  / 2 | 0, times.length - 1] : [...Array(times.length)].map((v,i) => i);
    batchSvg.selectAll('g').remove();
    const batchG = batchSvg.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    const timeScale = d3.scaleLinear().domain([0, batchNum]).range([0, batchWidth]);
    const numScale = d3.scaleLinear().domain([0, num]).range([batchHeight, 0]);
    const batchxAxis = d3.axisBottom(timeScale).tickValues(timeAxis).tickFormat(multiFormat);
    const batchyAxis = d3.axisLeft(numScale).ticks(5);

    batchG.append('g')
      .attr('class', 'x_axis')
      .attr('transform', 'translate(0,' + batchHeight + ')')
          .call(batchxAxis);
    batchG.append('g')
      .attr('class', 'y_axis')
      .call(batchyAxis);
    batchG.select('.x_axis').select('.domain')
      .attr('d', `M0.5,6V0.5H${batchWidth + 10}`);
    // batchG.select('.x_axis').selectAll('.tick')
    //   .remove();
    batchG.select('.y_axis').select('.domain')
      .attr('d', `M-6,${batchHeight + 0.5}H0.5V-2`);
    batchG.selectAll('.domain')
      .attr('marker-end', 'url(#arrow)');

    batchG.append('text')
      .attr('transform',
            'translate(' + (batchWidth - 100) + ' ,' +
                            (batchHeight + 35) + ')')
      .text('Arriving time');

    
    batchG.selectAll('rect')
        .data(dataBatch.data).enter()
      .append('rect')
      .attr('class', (d,i) => `batch-${dataBatch.name}-${i}`)
      .attr('x', (d,i) => timeScale(i) + 2)
      .attr('y', d => numScale(d.dataNum))
      .attr('width', avgWidth)
      .attr('height', d => batchHeight - numScale(d.dataNum))
      .style('fill', d => color(Math.min(1, (d.warningLevel.max + baseOffset)/ warningLevelMax)));


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
      const min = timeScale.invert(position[0] - 5) | 0;
      const max = (timeScale.invert(position[1] - 1) | 0);
      const start = timeScale(min);
      const end = timeScale(max);
      let [x0, x1] = [start + 5, end + 1];
      // @ts-ignore
      d3.select(this).transition().call(brush.move, x1 > x0 ? [x0, x1] : null);
      if (max > min) {
        brushedFunc(min, max - 1, dataBatch.source, dataBatch.batchStart);
      }
      else {
        [x0, x1] = [timeScale(dataBatch.matrixSelected[0]) + 5, timeScale(dataBatch.matrixSelected[1] + 1) + 1];
        // @ts-ignore
        brushG.transition().call(brush.move, x1 > x0 ? [x0, x1] : null);
        batchG.select('.brush-axis')
        .attr('x', x0)
        .attr('width', x1 - x0);
      }
    };

    const brushHeight = 40;
    const brushOff = batchHeight / 2 - brushHeight / 2;
    const brush = d3.brushX()
      .extent([[0, brushOff], [batchWidth, brushOff + brushHeight]])
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
    const [x0, x1] = [timeScale(dataBatch.matrixSelected[0]) + 5, timeScale(dataBatch.matrixSelected[1] + 1) + 1];
    if (x1 > x0)
      brushG.append('rect')
        .attr('class', 'brush-axis')
        .attr('x', x0)
        .attr('y', brushOff + brushHeight / 2)
        .attr('width', x1 - x0)
        .attr('height', 1)
        .attr('fill', '#222');
    brushG.append('text')
      .attr('x', (x1 + x0) / 2)
      .attr('y', brushOff)
      .style('fill', '#222')
      .style('font-size', 14)
      .style('text-anchor', 'middle')
      .text(`${dataBatch.matrixSelected[1] - dataBatch.matrixSelected[0] + 1} batches`);

    let count = 0;
    for (let index = dataBatch.matrixSelected[0]; index <= dataBatch.matrixSelected[1]; index++) {
      count += dataBatch.data[index - dataBatch.matrixSelected[0]].dataNum;
    }
    brushG.append('text')
      .attr('x', (x1 + x0) / 2)
      .attr('y', brushOff + brushHeight + 10)
      .style('fill', '#222')
      .style('font-size', 14)
      .style('text-anchor', 'middle')
      .text(`${count} records`);
    brushG.transition().call(brush.move, x1 > x0 ? [x0, x1] : null);
  }, [dataBatch, props.brushedFunc]);

  const style = {
    background: `linear-gradient(to right, ${color(baseOffset / warningLevelMax)}, ${DEFAULT_COLOR[dataBatch.source]})`,
    width: 90,
    height: 15,
    display: 'inline-block'
  };
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
  const timeIndex = [dataBatch.matrixSelected[0], dataBatch.matrixSelected[1]];
  const beSelected = !(timeIndex[0] > timeIndex[1]);
  const timeRes = [formatTime(dataBatch.data[timeIndex[0]].time * 1000), formatTime((dataBatch.data[timeIndex[1]].time) * 1000)];
  const selectedTime = beSelected ?
    // @ts-ignore
    `The time segment:  ${timeRes[0]} - ${timeRes[1]}`
    :
    null;
  return (
      <div styleName='batch-risk-div'>
        <div styleName='legend-div'>
          <span style={{marginRight: 120}}>Batch size</span>
          <span>Risk level: 0</span>
          <div style={style}></div>
          <span>{warningLevelMax}</span>
        </div>
        <div styleName='batch-selected-information'>
          {selectedTime}
        </div>
        <svg styleName='batch-risk-svg'></svg>
      </div>
  );
};

export const BatchRiskPane = connect(
  (state: State) => {
    return {
      dataNumMax: state.Configure.dataNumMax,
      warningLevelMax: state.Configure.warningLevelMax,
    };
  },
  createDispatchHandler<UtilsAction>()
)(CSSModules(BatchRiskBase, styles));
