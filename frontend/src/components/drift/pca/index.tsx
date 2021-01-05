import React, { useEffect, useState } from 'react';
import CSSModules from 'react-css-modules';
import * as d3 from 'd3';
import { connect } from 'react-redux';
import { ActionHandler, createDispatchHandler } from '../../../actions/redux-action';
import { State, Pca, Position } from '../../../models';
import { DEFAULT_COLOR, THEME_COLOR } from '../../../constants';
import { PcaAction } from '../../../actions/pca';
import styles from './pca-pane.scss';
import { UtilsAction, SET_HIGH_LIGHT_INDEX } from '../../../actions';

export interface PcaProps extends ActionHandler<PcaAction | UtilsAction> {
  Pca: Pca;
  highLightIndex: number;
  highLight: boolean;
}

function PcaPaneBase(props: PcaProps): JSX.Element {
  const [zoomSwitch, setZoomSwitch] = useState(false);

  // bind highlight
  const svg = d3.select('.' + styles['pca-svg']);
  useEffect(() => {
    const index = props.highLightIndex;
    svg.selectAll('circle')
      .style('fill', '#fff0')
      .style('stroke-width', 'none')
      .style('stroke', 'none');
    handleMouseOver(0, index);
  }, [props.highLightIndex]);

  function handleMouseOver(d: any, i: number): void {
    props.Pca.data.forEach(v => {
      svg
        .select(`.pca-circle-source_${v.source}-${i}`)
        .attr('r', 5)
        .style('fill', DEFAULT_COLOR[v.source])
        .style('stroke-width', 2)
        .style('stroke', THEME_COLOR);
    });
  }
  function handleMouseOut(): void {
    svg.selectAll('circle')
      .style('fill', '#fff0')
      .style('stroke-width', 'none')
      .style('stroke', 'none');
    handleMouseOver(0, props.highLightIndex);
  }

  let minx = props.Pca.max.x,
    miny = props.Pca.max.y,
    maxx = props.Pca.min.x,
    maxy = props.Pca.min.y;
  for (let ds = 0; ds < props.Pca.data.length; ds++) {
    for (let i = 0; i < props.Pca.data[ds].position.length; i++) {
      minx = (minx < props.Pca.data[ds].position[i].x) ? minx : props.Pca.data[ds].position[i].x;
      miny = (miny < props.Pca.data[ds].position[i].y) ? miny : props.Pca.data[ds].position[i].y;
      maxx = (maxx > props.Pca.data[ds].position[i].x) ? maxx : props.Pca.data[ds].position[i].x;
      maxy = (maxy > props.Pca.data[ds].position[i].y) ? maxy : props.Pca.data[ds].position[i].y;
    }
  }

  const width = 300;
  const height = 250;
  const xScale = d3
    .scaleLinear()
    .domain(zoomSwitch ? [minx, maxx] : [props.Pca.min.x, props.Pca.max.x])
    .range([5, width - 5]);

  const yScale = d3
    .scaleLinear()
    .domain(zoomSwitch ? [miny, maxy] : [props.Pca.min.y, props.Pca.max.y])
    .range([5, height - 5]);

  const lineGenerator = d3
    .line<Position>()
    .x((d: Position) => xScale(d.x))
    .y((d: Position) => yScale(d.y))
    .curve(d3.curveMonotoneX);

  useEffect(() => {
    const svg = d3.select('.' + styles['pca-svg']);
    svg.selectAll('g').remove();
    // Sample the SVG path uniformly with the specified precision.
    const samples = (path: any, precision: number): any => {
      const n = path.getTotalLength(),
        t = [0],
        dt = precision;
      let i = 0;
      while ((i += dt) < n) t.push(i);
      t.push(n);
      return t.map(function(t) {
        const p = path.getPointAtLength(t),
          a = { 0: p.x, 1: p.y, t: t / n };
        return a;
      });
    };

    // Compute quads of adjacent points [p0, p1, p2, p3].
    function quads(points: any): any[] {
      return d3.range(points.length - 1).map(function(i) {
        const a = {
          0: points[i - 1],
          1: points[i],
          2: points[i + 1],
          3: points[i + 2],
          t: (points[i].t + points[i + 1].t) / 2,
        };
        return a;
      });
    }

    // Compute stroke outline for segment p12.
    function lineJoin(p0: any, p1: any, p2: any, p3: any, width: any): string {
      const u12 = perp(p1, p2),
        r = width / 2;
      let a = [p1[0] + u12[0] * r, p1[1] + u12[1] * r],
        b = [p2[0] + u12[0] * r, p2[1] + u12[1] * r],
        c = [p2[0] - u12[0] * r, p2[1] - u12[1] * r],
        d = [p1[0] - u12[0] * r, p1[1] - u12[1] * r];

      if (p0) {
        // clip ad and dc using average of u01 and u12
        const u01 = perp(p0, p1),
          e = [p1[0] + u01[0] + u12[0], p1[1] + u01[1] + u12[1]];
        a = lineIntersect(p1, e, a, b);
        d = lineIntersect(p1, e, d, c);
      }

      if (p3) {
        // clip ab and dc using average of u12 and u23
        const u23 = perp(p2, p3),
          e = [p2[0] + u23[0] + u12[0], p2[1] + u23[1] + u12[1]];
        b = lineIntersect(p2, e, a, b);
        c = lineIntersect(p2, e, d, c);
      }
      const x = [Math.min(a[0], b[0], c[0], d[0]), Math.max(a[0], b[0], c[0], d[0])];
      const y = [Math.min(a[1], b[1], c[1], d[1]), Math.max(a[1], b[1], c[1], d[1])];
      const size = (y[1] - y[0]) * (x[1] - x[0]);
      // fix a bug while using https://bl.ocks.org/mbostock/4163057 but don't know why
      if (size > 500 || Math.abs(y[1] - y[0]) > 30 || Math.abs(x[1] - x[0]) > 30) {
        return '';
      }
      return 'M' + a + 'L' + b + ' ' + c + ' ' + d + 'Z';
    }

    // Compute intersection of two infinite lines ab and cd.
    function lineIntersect(a: number[], b: number[], c: number[], d: number[]): number[] {
      const x1 = c[0],
        x3 = a[0],
        x21 = d[0] - x1,
        x43 = b[0] - x3,
        y1 = c[1],
        y3 = a[1],
        y21 = d[1] - y1,
        y43 = b[1] - y3,
        ua = (x43 * (y1 - y3) - y43 * (x1 - x3)) / (y43 * x21 - x43 * y21);
      return [x1 + ua * x21, y1 + ua * y21];
    }

    // Compute unit vector perpendicular to p01.
    function perp(p0: number[], p1: number[]): number[] {
      const u01x = p0[1] - p1[1],
        u01y = p1[0] - p0[0],
        u01d = Math.sqrt(u01x * u01x + u01y * u01y);
      return [u01x / u01d, u01y / u01d];
    }

    // get pca  data of different data source
    const {data, allData} = props.Pca;
    // draw line
    if (!zoomSwitch)
      allData.forEach(v => {
        const pathG = svg
          .append('g')
          .attr('class', `group-${v.source}-all-path`)
          .attr('z-index', 0);
        pathG
          .append('path')
          .datum(v.position)
          .attr('fill', 'none')
          .attr('stroke', '#ddd')
          .attr('stroke-opacity', '0.7')
          .attr('stroke-width', 2)
          .attr('d', lineGenerator);
      });
    data.forEach(v => {
      if (v.position.length == 0)
        return;
      const pathG = svg
        .append('g')
        .attr('class', `group-${v.source}-path`)
        .attr('z-index', 0);
      const curPosition = v.position;
      let path = pathG
        .append('path')
        .datum(curPosition)
        .attr('fill', 'none')
        .attr('stroke', DEFAULT_COLOR[v.source])
        .attr('stroke-width', 4)
        .attr('d', lineGenerator);

      path = path.remove();
      pathG
        .selectAll('path')
        .data(quads(samples(path.node(), 2)))
        .enter()
        .append('path')
        .attr('class', `pca-path-source_${v.source}`)
        .style('fill', DEFAULT_COLOR[v.source])
        .style('fill-opacity', d => d.t)
        .style('stroke-opacity', 0)
        .style('stroke', DEFAULT_COLOR[v.source])
        .attr('d', function(d) {
          return lineJoin(d[0], d[1], d[2], d[3], 4);
        });
    });
  }, [props.Pca, zoomSwitch, props.Pca.allData]);

  useEffect(() => {
    // draw circles

    props.Pca.data.forEach(v => {
      if (v.position.length == 0)
        return;
      svg.select(`.group-${v.source}-circle`).remove();
      const circleG = svg
        .append('g')
        .attr('class', `group-${v.source}-circle`)
        .attr('z-index', 1);
      circleG
        .selectAll('circle')
        .data(v.position)
        .enter()
        .append('circle')
        .attr('class', (d, i) => `pca-circle-source_${v.source}-${i}`)
        .attr('r', 3)
        .attr('cx', d => xScale(d.x))
        .attr('cy', d => yScale(d.y))
        .style('fill', '#fff0')
        .style('cursor', 'pointer')
        .on('mouseover', handleMouseOver)
        .on('mouseout', handleMouseOut)
        .on('click', (d, i) => {
            props.handleAction({
              type: SET_HIGH_LIGHT_INDEX,
              payload: {
                index: i,
                flag: true
              }
            });
        });
    });
    handleMouseOver(0, props.highLightIndex);
  }, [props.Pca, zoomSwitch, props.Pca.allData, props.highLightIndex]);

  const zoomin = (): any => {
    setZoomSwitch(!zoomSwitch);
  };
  return (
    <div styleName="pca-div">
      <div styleName="legend-div">
        <div styleName="grayscale-div">
          <span>Time:</span>
          <div styleName="grayscale-legend"></div>
        </div>
        <div styleName="switch-div">
          <span style={{ position: 'absolute', top: 0 }}>{'Zoom in'}</span>
          <input
            className="switch switch-anim"
            type="checkbox"
            style={{ top: 8, left: 75 }}
            onChange={(): any => {
              zoomin();
            }}
            checked={zoomSwitch}
          />
        </div>
      </div>
      <svg styleName="pca-svg"></svg>
    </div>
  );
}

export const PcaPane = connect(
  (state: State) => {
    return {
      Pca: state.Pca,
      highLightIndex: state.Utils.highLightIndex,
      highLight: state.Utils.highLight,
    };
  },
  createDispatchHandler<PcaAction | UtilsAction>(),
)(CSSModules(PcaPaneBase, styles));
