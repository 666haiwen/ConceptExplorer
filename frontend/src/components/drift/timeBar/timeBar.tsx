import React, {useEffect, useState, useRef, useMemo} from 'react';
import CSSModules from 'react-css-modules';
import * as d3 from 'd3';
import {connect} from 'react-redux';
import {ActionHandler, createDispatchHandler} from '../../../actions/redux-action';
import {State, Configure} from '../../../models';
import {UtilsAction, SET_TIME_SELECTION, DriftAction} from '../../../actions';
import * as styles from './timeBar.scss';
import {ConceptDrift} from '../../../models/drift';
import {DriftDetectorDiv} from './driftDetector';
import {DEFAULT_COLOR, TIME_LINE_COLOR, TIME_BAR_COLOR} from '../../../constants';
import {color} from 'd3';

interface TimeBarProps extends ActionHandler<UtilsAction | DriftAction> {
  dataset: ConceptDrift,
  configure: Configure,
  warningLevel: number,
  selection: number[]
};

function TimeBarPaneBase(props: TimeBarProps): JSX.Element {
  const {dataset, configure, warningLevel, selection} = props;

  if (dataset.length == 0 || configure.dataSourceName.length == 0)
    return <div></div>;

    const [highlightDrift, setHighlightDrift] = useState(false);
  const margin = {left: 50, top:25, bottom: 40, right: 0};
  const width = 1050 - margin.left - margin.right;
  const height = 380;
  const barHeight = 20;
  const dataSourceNum = configure.selected.map((v): number => v ? 1 : 0)
    .reduce((previousValue, currentValue) => previousValue + currentValue);
  const timeScale = d3.scaleUtc()
      .domain([new Date(configure.timeStart * 1000), new Date(configure.timeEnd * 1000)])
      .range([0, width]);
  const topTimeScale = d3.scaleUtc()
    .domain([new Date(configure.timeStart * 1000), new Date(configure.timeEnd * 1000)])
    .range([0, width - margin.left]);
  const xAxis = d3.axisBottom(timeScale)
      .ticks(width / 70);
  const topAxis = d3.axisBottom(timeScale)
    .ticks(width / 70);
  let {timeUnit} = configure;
  timeUnit *= 1000;
  const getInvertTime = (selection: number[]) =>
    selection.map(v => (timeScale.invert(v) as any) / timeUnit | 0);
  useEffect(() => {
    if (dataset.length == 0 || configure.dataSourceName.length == 0)
      return;
    const defaultSelection = [0, width];
    const svg = d3.select('.' + styles['brush-svg']);

    const brush = d3.brushX()
      .extent([[0, 0], [width, barHeight]])
      .on('brush', brushed)
      .on('end', brusheded);

    function brushed() {
      const selection = d3.event.selection;
      if (selection) {
        props.handleAction({type: SET_TIME_SELECTION, payload: {
          selection: selection
        }});
      }
    }

    function brusheded(): void {
      const selection = d3.event.selection;
      if (!d3.event.sourceEvent || !selection) {
        if (!selection)
          props.handleAction({type: SET_TIME_SELECTION, payload: {selection: defaultSelection}});
        return ;
      };
    };

    svg.selectAll('g').remove();
    const g = svg.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    svg.append('g')
      .attr('class', 'zoom_axis')
      .attr('transform', 'translate(' + margin.left + ',0)')
      .call(xAxis);
    g.append('g')
      .attr('class', 'x_axis')
      .attr('transform', 'translate(0,' + 15 + ')')
        .call(xAxis.tickSizeOuter(0));
    g.append('g')
      .call(brush)
      .call(brush.move, defaultSelection);
    svg.selectAll('.handle')
      .style('fill', '#222')
      .style('fill-opacity', '0.7')
      .attr('width', '4');
    svg.selectAll('.selection')
      .style('fill', '#aaa');

  }, [configure.dataSourceName]);

  const invertTime = getInvertTime(selection);
  const newTimeScale = d3.scaleUtc()
      .domain([invertTime[0] * timeUnit, invertTime[1] * timeUnit])
      .range([0, width]);
  const startIndex = invertTime[0] - (configure.timeStart * 1000 / timeUnit | 0);
  const endIndex = invertTime[1] - (configure.timeStart * 1000 / timeUnit | 0);
  const newRange = useMemo(() => [startIndex, endIndex], [selection]);
  const newXScale = d3.scaleLinear()
      .domain(newRange)
      .range([0, width]);
  const newXAxis = d3.axisBottom(newTimeScale)
      .ticks(width / 70);
  useEffect(() => {
    const svg = d3.select('.' + styles['brush-svg']);
    svg.select('.zoom_axis').remove();
    svg.append('g')
      .attr('class', 'zoom_axis')
      .attr('transform', 'translate(' + margin.left + ',0)')
      .call(newXAxis);
  }, [selection]);

  const [thresholdState, setThreshold] = useState(0.7);
  const simulationRef =useRef(null);

  const onMouseHover = (index: number, show: boolean): void => {
    const backgroundG = d3.select(`.drift-dector-svg-${index}`).select('.background');
    backgroundG.selectAll(`.bayes-no-hit`)
      .attr('opacity', show ? '0.3' : '1')
      .attr('stroke', show ? 'none' : TIME_LINE_COLOR);
    d3.select(simulationRef.current)
      .select(`.simulateion-time-div-${index}`)
      .style('background', show ? TIME_LINE_COLOR : TIME_BAR_COLOR);
  };

  const highLightClick = () => {
    const flag = !highlightDrift;
    onMouseHover(0, flag);
    onMouseHover(1, flag);
    onMouseHover(2, flag);
    setHighlightDrift(!highlightDrift);
  }
  const handleInput = (event: any): void => {
    setThreshold(event.target.value);
  };

  return (
    <div styleName='timeBar-div'>
      <div styleName='control-div'>
        <div styleName='control-upper' ref={simulationRef} style={{display: 'flex'}}>
          <span>Check consistency time segments:</span>
          <input className='switch switch-anim' type='checkbox' style={{top: -1}}
                onChange={(): void => {highLightClick();}}
                checked={highlightDrift}/>
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
      {dataset.map((dataSource, i) => {
        if (configure.selected[i] === true)
          return (
            <DriftDetectorDiv key={i}
              xScale={newXScale}
              source={dataSource}
              warningLevel={warningLevel}
              height={height / dataSourceNum - 2}
              dataSourceName={props.configure.dataSourceName[i]}
              startIndex={startIndex}
              dataset={configure.datasetName}
              timeIndexSelection={newRange}
              threshold={thresholdState} />);
        else
          return null;
      }
      )}
      <svg styleName='brush-svg'>
      </svg>
    </div>
  );
};

export const TimeBarPane = connect(
  (state: State) => {
    return {
      dataset: state.Drift,
      configure: state.Configure,
      warningLevel: state.Utils.warningLevel,
      selection: state.Utils.selection
    };
  },
  createDispatchHandler<UtilsAction>()
)(CSSModules(TimeBarPaneBase, styles));