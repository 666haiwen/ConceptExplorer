import React, {useState, useEffect, useRef} from 'react';
import CSSModules from 'react-css-modules';
import * as d3 from 'd3';
import {connect} from 'react-redux';
import {ActionHandler, createDispatchHandler} from '../../../actions/redux-action';
import {LineAbnormalDrift, LineDrift, LineWarning, LineWarningG, LineDriftG, LineAbnormalG, LineTimeSlide} from '../../icon';
import {State, Lines, LinePoint, MatrixTime, Utils} from '../../../models';
import {UtilsAction, MatrixAction, SET_DATA_PANE_MATRIX, DataPaneAction, SET_CUR_MATRIX_SETTING, SET_HIGH_LIGHT_INDEX} from '../../../actions';
import { DEFAULT_COLOR } from '../../../constants';

import * as styles from './line.scss';
import { Select, OptionProps } from '../../icon/Select';

export interface LineProps extends ActionHandler<UtilsAction | MatrixAction | DataPaneAction> {
  lines: Lines,
  timeUnit: number,
  dataset: string,
  selected: boolean[],
  utils: Utils
};

function LinePaneBase(props: LineProps): JSX.Element {
  const [scaleState, setScaleState] = useState(0);
  const [highlightDrift, setHighlightDrift] = useState(true);
  const [thresholdState, setThreshold] = useState(0.7);
  const svgRef = useRef(null);
  const simulationRef = useRef(null);
  const timeSlideRef = useRef(0);
  const svg = d3.select(svgRef.current);

  const timeArray = Array.from(new Set([...props.lines.map(line => line.data.map(v => v.time * 1000)).flat()]));
  const timeRange = [Math.min(...timeArray), Math.max(...timeArray)];
  const accuracyArray = props.lines.map(line => line.data.map(v => v.accuracy)).flat();
  const pminArray = props.lines.map(line => line.data.map(v => v.pmin)).flat();
  const accuracyRange = [Math.min(...accuracyArray), Math.max(...pminArray)];
  
  useEffect(() => {
    timeSlideRef.current = timeArray[timeArray.length / 2 | 0] / 1000;
  }, [props.lines]);

  useEffect(() => {
    const index = props.utils.highLightIndex;
    if (props.lines.length > 0)
      timeSlideRef.current = props.lines[0].data[index].time;
  }, [props.utils.highLight]);

  const onMouseHover = (index: number, show: boolean): void => {
    const svg = d3.select(svgRef.current);
    svg.select(`.line-background-${index}`)
      .attr('display', show ? 'block' : 'none');
    d3.select(simulationRef.current)
      .select(`.simulateion-time-div-${index}`)
      .style('background', show ? DEFAULT_COLOR[index] : 'rgba(' + DEFAULT_COLOR[index].split('(')[1].split(')')[0] + ', 0.5)');
  };

  useEffect(() => {
    if (props.lines.length == 0)
      return;
    const margin = {top: 50, right: 70, bottom: 60, left: 50};
    const width = parseInt(svg.style('width')) - margin.left - margin.right;
    const height = parseInt(svg.style('height')) - margin.top - margin.bottom;
    
    const xScale = d3.scaleLinear()
        .domain(timeRange)
        .range([0, width]);
  
    const delta = accuracyRange[1] - accuracyRange[0];
    let yRange = [0, 1];
    if (scaleState == 0)
      yRange = [Math.max(accuracyRange[0] - delta * 0.1, 0), Math.min(accuracyRange[1] + delta * 0.1, 1)];
    const yScale = d3.scaleLinear()
        .domain(yRange)
        .range([height, 0]);
    svg.selectAll('g').remove();
    const g = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    const formatMillisecond = d3.timeFormat('.%L'),
          formatSecond = d3.timeFormat(':%S'),
          formatMinute = d3.timeFormat('%I:%M'),
          formatHour = d3.timeFormat('%I %p'),
          formatDay = d3.timeFormat('%a %d'),
          formatWeek = d3.timeFormat('%b %d'),
          formatMonth = d3.timeFormat('%B'),
          formatYear = d3.timeFormat('%Y');

    const multiFormat = (date: Date): string => {
      return (d3.timeSecond(date) < date ? formatMillisecond
      : d3.timeMinute(date) < date ? formatSecond
      : d3.timeHour(date) < date ? formatMinute
      : d3.timeDay(date) < date ? formatHour
      : d3.timeMonth(date) < date ? (d3.timeWeek(date) < date ? formatDay : formatWeek)
      : d3.timeYear(date) < date ? formatMonth
      : formatYear)(date);
    };
    let timeArrayValues = timeArray;
    const timeAxisMax = 30;
    const timeAxisMin = 15;
    if (timeArray.length > timeAxisMax) {
      const reminder = [];
      for (let index = timeAxisMin; index < timeAxisMax; index++) {
        reminder.push({index: index, value: timeArray.length % index});
      }
      reminder.sort((x, y) => (x.value > y.value) || (x.value == y.value && x.index < y.index) ? 1: -1);
      const splitNum = reminder[0].index;
      const slide = timeArray.length / splitNum | 0;
      const newLength = slide * splitNum;
      const start = (timeArray.length - newLength) / 2 | 0;
      timeArrayValues = [...Array(splitNum)].map((v, i) => timeArray[start + i * slide]);
    }
    const xAxis = d3.axisBottom(xScale)
      .tickValues(timeArrayValues)
      .tickPadding(5)
      .tickFormat(multiFormat);
    const yAxis = d3.axisLeft(yScale).ticks(5, '.0%');

    g.append('g')
        .attr('class', 'x_axis')
        .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis);
    g.append('g')
        .attr('class', 'y_axis')
        .call(yAxis)
        .call(g => g.selectAll('.tick line').clone()
          .attr('x2', width)
          .attr('stroke-dasharray', 3)
          .attr('stroke-opacity', 0.1));
    
    g.select('.x_axis').select('.domain')
      .attr('d', `M0.5,6V0.5H${width + 0.5}`);
    g.select('.y_axis').select('.domain')
      .attr('d', `M-6,${height + 0.5}H0.5V-2`);
      
    g.selectAll('.domain')
      .attr('marker-end', 'url(#arrow)');
      
    g.append('text')
      .attr('transform',
            'translate(' + (width + 20) + ' ,' +
                            (height + 10) + ')')
      .text('Date');

    g.append('text')
      .attr('y', -margin.top + 10)
      .attr('x', -margin.left + 15)
      .attr('dy', '1em')
      .text('Accuracy');

    // draw background
    const linesBayesState: number[][] = [];
    props.lines.forEach(line => {
      const background = g.append('g')
        .attr('class', `line-background-${line.source}`)
        .attr('display', 'none');
      const bayesState = [...Array(line.data.length)].map(() => 0);
      line.data.forEach((v, index) => {
        if (v.bayes >= thresholdState) {
          bayesState[index] = 1;
          if (index > 0)
            bayesState[index - 1] = 1;
          if (index + 1 < line.data.length)
            bayesState[index + 1] = 1;
        }
      });
      bayesState.forEach((v ,index) => {
        if (v == 1) {
          const x1 = Math.max(0, xScale((line.data[index].time - props.timeUnit) * 1000));
          const x2 = Math.min(xScale(line.data[index].time * 1000), width);
          background.append('rect')
            .attr('x', x1)
            .attr('y', 0)
            .attr('width', x2 - x1)
            .attr('height', height)
            .attr('fill', DEFAULT_COLOR[line.source])
            .attr('fill-opacity', 0.15);
        }
      });
      linesBayesState.push(bayesState);
    });

    //draw time slide
    const timeFormat = d3.timeFormat('%B %d, %Y');
    const timeSlide = g.append('g')
      .attr('class', 'line-time-slide')
      .style('cursor', 'pointer')
      .attr('transform' ,`translate( ${xScale(timeSlideRef.current * 1000)}, 0)`);
    LineTimeSlide(timeSlide, {
      height: height,
      off: 10,
      // @ts-ignore
      time: timeFormat(timeSlideRef.current * 1000),
      strokeWidth: 1
    });
    const dragEnd = (): void => {
      const normal: number[] = [];
      const abnormal: number[] = [];
      const lineBarSelected: MatrixTime[] = [];
      const lineTimeSelected: MatrixTime[] = [];
      props.lines.forEach((line, lineIndex) => {
        let leftIndex = 0,
            bayesEnd = -1,
            rightIndex = line.data.length - 1,
            leftFlag = false,
            rightFlag = false;
        line.data.forEach((v, index) => {
          if (v.state >= 3 && v.time < timeSlideRef.current) {
            leftFlag = true;
            leftIndex = index;
          }
          if (linesBayesState[lineIndex][index] == 1 && v.time < timeSlideRef.current) {
            bayesEnd = index;
          }
          if (v.state >= 3 && index <= rightIndex && v.time >= timeSlideRef.current) {
            rightIndex = index;
            rightFlag = true;
          }
        });
        if (leftFlag) {
          leftIndex += 1;
          if (bayesEnd == -1) 
            abnormal.push(lineIndex);
          else {
            let bayesStart = bayesEnd - 1;
            while (bayesStart > 0 && linesBayesState[lineIndex][bayesStart] == 1) bayesStart--;
            if (leftIndex - 1 >= bayesStart && leftIndex - 1 <= bayesEnd)
              normal.push(lineIndex);
            else
              abnormal.push(lineIndex);
          }
        }
        else {
          if (bayesEnd == -1)
            normal.push(lineIndex);
          else
            abnormal.push(lineIndex);
        }
        if (rightFlag)
          rightIndex -= 1;
        lineBarSelected.push({
          source: line.source,
          time: [leftIndex, rightIndex]
        });
        lineTimeSelected.push({
          source: line.source,
          time: [leftIndex + line.batchStart, rightIndex + line.batchStart]
        });
      });
      const matrixSelected = [...Array(props.lines.length)].map(() => false);
      if (normal.length != 0) {
        normal.forEach(v => matrixSelected[v] = true);
      }
      else
        matrixSelected[abnormal[0]] = true;
      props.handleAction({
        type: SET_DATA_PANE_MATRIX,
        payload: {
          data: lineBarSelected
        }
      });
      props.handleAction({
        type: SET_CUR_MATRIX_SETTING,
        payload: {
          normal: normal,
          abnormal: abnormal,
          time: lineTimeSelected,
          // @ts-ignore
          cursorTime: timeFormat(timeSlideRef.current * 1000),
          timeChange: props.lines.map(line => line.source),
          matrixSelected: matrixSelected,
          dataset: props.dataset,
          resetDatasourceFlag: true
        }
      });
    };
    const dragStart = (auto: boolean): void => {
      if (!auto) {
        if (d3.event.x < 1 || d3.event.x > width)
          return;
        timeSlideRef.current = xScale.invert(d3.event.x) / 1000;
        timeSlide.attr('transform' ,`translate( ${xScale(timeSlideRef.current * 1000)}, 0)`);
        timeSlide.select('text')
        // @ts-ignore
          .text(timeFormat(timeSlideRef.current * 1000));
      }
      let rightIndex = props.lines[0].data.length - 1;
      for (let index = 0; index < props.lines[0].data.length; index++) 
        if (props.lines[0].data[index].time >= timeSlideRef.current) {
          rightIndex = index;
          break;
        }
      props.handleAction({
        type: SET_HIGH_LIGHT_INDEX,
        payload: {
          index: rightIndex,
          flag: false
        }
      });
    };
    const dragged = d3.drag()
      .on('drag', () => dragStart(false))
      .on('end', dragEnd);
    timeSlide.call(dragged);
    // defaulte 
    dragStart(true);
    dragEnd();
    
    // draw Line
    const lineGenerator = d3.line<LinePoint>()
      .x((d: LinePoint) => xScale(d.time * 1000))
      .y((d: LinePoint) => yScale(d.accuracy));
    props.lines.forEach(line => {
      // get partly lines
      const currentLineG = g.append('g').attr('class', `predict-line-group-${line.source}`);
      let i = 0;
      while (i < line.data.length) {
        const lineData = [];
        const curState = line.data[i].state;
        if (i > 0 && line.data[i].state == 0) {
          lineData.push(line.data[i - 1]);
        }
        lineData.push(line.data[i]);
        i++;
        while (i < line.data.length && 
          (line.data[i].state == lineData[lineData.length - 1].state || 
            (line.data[i].state > 0 && lineData[lineData.length - 1].state > 0))) {
            lineData.push(line.data[i]);
            i++;
          }
        // draw normal line
        if (curState == 0) {
          if (i < line.data.length)
            lineData.push(line.data[i]);
          currentLineG.append('path')
            .datum(lineData)
            .attr('fill', 'none')
            .attr('stroke', DEFAULT_COLOR[line.source])
            .attr('stroke-width', 2)
            .attr('d', lineGenerator);
        }
        // draw concept drift line
       else if (lineData.length > 1) {
          const length = lineData.length;
          for (let index = length - 1; index >= 0; index--) {
            lineData.push({
              ...lineData[index],
              accuracy: lineData[index].pmin
            });
          }
          currentLineG.append('path')
            .datum(lineData)
            .attr('fill', 'none')
            .attr('stroke', DEFAULT_COLOR[line.source])
            .attr('stroke-width', 2)
            .attr('d', lineGenerator);
          const normalPath = lineGenerator(lineData);
          const clouserPath = normalPath + ',Z';
          currentLineG.append('path')
            .attr('fill', `url(#pattern-${line.source})`)
            .attr('stroke', DEFAULT_COLOR[line.source])
            .attr('stroke-width', 1.5)
            .attr('d', clouserPath);          
        }
      }
    });
    // draw circle
    props.lines.forEach((line, index) => {
      const currentCircleG = g.append('g').attr('class', `predict-circle-group-${line.source}`);
      const bayesState = linesBayesState[index];
      line.data.forEach((d, i) => {
        if (d.state > 0 && d.state < 3)
          LineWarningG(currentCircleG, {
            x: xScale(d.time * 1000),
            y: yScale(d.accuracy),
            color: DEFAULT_COLOR[line.source],
            r: 5,
            strokeWidth: 2
          });
        else if (d.state >= 3 && bayesState[i] == 1)
          LineDriftG(currentCircleG, {
            x: xScale(d.time * 1000),
            y: yScale(d.accuracy),
            color: DEFAULT_COLOR[line.source],
            r: 6,
            strokeWidth: 2
          });
        else if (d.state >= 3 && bayesState[i] == 0)
          LineAbnormalG(
            currentCircleG, {
              x: xScale(d.time * 1000),
              y: yScale(d.accuracy),
              color: DEFAULT_COLOR[line.source],
              d: 5,
              off: 8,
              strokeWidth: 1.5
            });
      });
    });
  }, [props.lines, scaleState, thresholdState, highlightDrift, props.utils.highLight]);
  

  useEffect(() => {
    svg.selectAll('g').remove();
  }, [props.dataset]);

  useEffect(() => {
    props.selected.forEach((v, index) => {
      if (v == false) {
        svg.select(`.predict-circle-group-${index}`)
          .attr('display', 'none');
        svg.select(`.predict-line-group-${index}`)
          .attr('display', 'none');
      }
      else {
        svg.select(`.predict-circle-group-${index}`)
          .attr('display', 'block');
        svg.select(`.predict-line-group-${index}`)
          .attr('display', 'block');
      }
    });
  }, [props.selected]);
  const patternSvg = props.lines.map(v => 
    <pattern id={`pattern-${v.source}`} key={v.source} x='0' y='0' width={4 * props.lines.length} height='100%' patternUnits='userSpaceOnUse'>
      <rect fill={DEFAULT_COLOR[v.source]} x={v.source * 4} y='0' width='1.5' height='100%'></rect>
    </pattern>  
  );
  
  const btnClick = (): void => {
    if (scaleState == 0)
      setScaleState(1);
    else
      setScaleState(0);
  };
  const highLightClick = (): void => {
    setHighlightDrift(!highlightDrift);
  };
  const handleInput = (event: any): void => {
    setThreshold(event.target.value);
  };
  const options: OptionProps[] = [
    {value: 0, content: 'Min-Max', groupId: -1, checked: scaleState == 0},
    {value: 1, content: '0-100%', groupId: -1, checked: scaleState == 1},
  ];
  return (
    <div styleName='line-div'>
      <svg styleName='line-svg' ref={svgRef}>
        <defs>
        {patternSvg}
        <marker id='arrow' markerWidth='10' markerHeight='10' refX='0' refY='3' orient='auto' markerUnits='strokeWidth'>
          <path d='M0,0 L0,6 L9,3 z' fill='#212121' />
        </marker>
        </defs>
      </svg>
      <div styleName='utils-div'>
        <div styleName='legend-div'>
          <div style={{display: 'flex'}}>
            Warnings:
            <svg styleName='legend-icon-svg'>
              <LineWarning x={15} y={20} color={'#444'} r={6} strokeWidth={2} />
            </svg>
          </div>
          <div style={{display: 'flex'}}>
            Confirmed drifts:
            <svg styleName='legend-icon-svg'>
              <LineDrift x={15} y={20} color={'#444'} r={7} strokeWidth={2} />
            </svg>
          </div>
          <div style={{display: 'flex'}}>
            Inconsistent drifts:
            <svg styleName='legend-icon-svg'>
              <LineAbnormalDrift x={15} y={20} color={'#444'} d={5} off={8} strokeWidth={1.5} />
            </svg>
          </div>
        </div>
        <div styleName='control-div'>
          <div styleName='control-left'>
            <div styleName='control-upper' ref={simulationRef} style={{display: 'flex'}}>
              <span>Check consistency time segments:</span>
              {props.lines.map((v, i) => {
                if (props.selected[i] == true)
                  return <div styleName='simulation-time-div' 
                    className={`simulateion-time-div-${v.source}`}
                    style={{borderColor: DEFAULT_COLOR[v.source], background: 'rgba(' + DEFAULT_COLOR[v.source].split('(')[1].split(')')[0] + ', 0.5)'}} 
                    key={v.source}
                    onMouseEnter={(): void => onMouseHover(v.source, true)}
                    onMouseLeave={(): void => onMouseHover(v.source, false)}
                  />;
                else
                  return null;
              })}
            </div>
            <div styleName='control-upper'>
              <span>{`Thresholds: ${thresholdState * 100 | 0}%,`}</span>
              <span>0%</span>
              <input type='range' min='0' max='1' step='0.05'
                  style={{position: 'relative', top: '0', width:'80px'}}
                  defaultValue={thresholdState} 
                  onChange={(event): void => handleInput(event)} />
              <span>100%</span>
            </div>
          </div>
          <div styleName='control-right'>
            <div styleName='control-upper'>
              <span>Scale:</span>
              <Select 
                style={{}}
                title={''}
                options={options}
                value={scaleState} 
                groups={[]}
                btnClick={btnClick}
              />
            </div>
            <div styleName='control-upper'>
              <span style={{position: 'absolute', top: 0}}>{'Highlight drifts'}</span>
              <input className='switch switch-anim' type='checkbox' style={{top: 0, left: 130}} 
                onChange={(): void => {highLightClick();}}
                checked={highlightDrift}/>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export const LinePane = connect(
  (state: State) => {
    return {
      lines: state.Lines,
      timeUnit: state.Configure.timeUnit,
      dataset: state.Configure.datasetName,
      selected: state.Configure.selected,
      utils: state.Utils
    };
  },
  createDispatchHandler<UtilsAction | MatrixAction | DataPaneAction>()
)(CSSModules(LinePaneBase, styles));