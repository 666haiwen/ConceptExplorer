import React from 'react';
import * as d3 from 'd3';
import {Icon} from '../../models';


interface LineLegendProps {
  x: number,
  y: number,
  color: string
};

export type svgG = d3.Selection<SVGGElement, unknown, null, undefined>;
interface LineWarningProps extends LineLegendProps {
  r: number,
  strokeWidth: number
};

export function LineWarning(props: LineWarningProps): JSX.Element {
  return <g style={{transform: `translate(${props.x}px, ${props.y}px)`}}>
    <circle cx='0' cy='0' r={props.r} fill='#fff' stroke={props.color} strokeWidth={props.strokeWidth}>
    </circle>
  </g>;
}

export function LineWarningG(g: svgG, props: LineWarningProps): void{
  const elementG = g.append('g')
    .style('transform', `translate(${props.x}px, ${props.y}px)`);
  elementG.append('circle')
    .attr('cx', '0')
    .attr('cy', '0')
    .attr('r', props.r)
    .attr('fill', '#fff')
    .attr('stroke', props.color)
    .attr('stroke-width', props.strokeWidth);
}

export function LineDrift(props: LineWarningProps): JSX.Element {
  const off = props.r / Math.SQRT2;
  return <g style={{transform: `translate(${props.x}px, ${props.y}px)`}}>
    <circle cx='0' cy='0' r={props.r} fill={props.color} stroke={props.color} strokeWidth={props.strokeWidth}>
    </circle>
    <path stroke='#fff' strokeWidth={props.strokeWidth}
      d={`M${-off} ${-off}, L${off} ${off}`}
    />
    <path stroke='#fff' strokeWidth={props.strokeWidth}
      d={`M${-off} ${off}, L${off} ${-off}`}
    />
  </g>;
}

export function LineDriftG(g: svgG, props: LineWarningProps): void{
  const off = props.r / Math.SQRT2;
  const elementG = g.append('g')
    .style('transform', `translate(${props.x}px, ${props.y}px)`);
  elementG.append('circle')
    .attr('cx', '0')
    .attr('cy', '0')
    .attr('r', props.r)
    .attr('fill', props.color)
    .attr('stroke', props.color)
    .attr('stroke-width', props.strokeWidth);
  elementG.append('path')
    .attr('stroke', '#fff')
    .attr('stroke-width', props.strokeWidth)
    .attr('d', `M${-off} ${-off}, L${off} ${off}`);
  elementG.append('path')
    .attr('stroke', '#fff')
    .attr('stroke-width', props.strokeWidth)
    .attr('d', `M${-off} ${off}, L${off} ${-off}`);
}

interface LineAbnormalDriftProps extends LineLegendProps {
  d: number,
  off: number,
  strokeWidth: number
};

export function LineAbnormalDrift(props: LineAbnormalDriftProps): JSX.Element {
  const d = Math.SQRT1_2 * props.d;
  return  <g style={{transform: `translate(${props.x}px, ${props.y}px)`}}>
    <path stroke='none' fill={props.color}
     d={`M0 ${-props.off}, L${-props.off * 1.2} ${props.off}, L${props.off * 1.2} ${props.off}, Z`}
    />
    <path stroke='#fff' strokeWidth={props.strokeWidth}
      d={`M${-d} ${-d + 2}, L${d} ${d + 2}`}
    />
    <path stroke='#fff' strokeWidth={props.strokeWidth}
      d={`M${-d} ${d + 2}, L${d} ${-d + 2}`}
    />
</g>;
}

export function LineAbnormalG(g: svgG, props: LineAbnormalDriftProps): void{
  const d = Math.SQRT1_2 * props.d;
  const elementG = g.append('g')
    .style('transform', `translate(${props.x}px, ${props.y}px)`);
  elementG.append('path')
    .attr('stroke', 'none')
    .attr('fill', props.color)
    .attr('d', `M0 ${-props.off}, L${-props.off * 1.2} ${props.off}, L${props.off * 1.2} ${props.off}, Z`);
  elementG.append('path')
    .attr('stroke', '#fff')
    .attr('stroke-width', props.strokeWidth)
    .attr('d', `M${-d} ${-d + 2}, L${d} ${d + 2}`);
  elementG.append('path')
    .attr('stroke', '#fff')
    .attr('stroke-width', props.strokeWidth)
    .attr('d', `M${-d} ${d + 2}, L${d} ${-d + 2}`);
}

interface LineTimeSlideProps {
  height: number,
  strokeWidth: number
  off: number,
  time: string
};

export function LineTimeSlide(g: svgG, props: LineTimeSlideProps): void {
  g.append('path')
    .attr('fill', 'none')
    .attr('stroke', '#333')
    .attr('stroke-width', props.strokeWidth)
    .attr('d', `M0,0 L0 ${props.height}`);
  g.append('path')
    .attr('fill', '#33')
    .attr('stroke', 'none')
    .attr('d', `M0,0 L-${props.off}, -${props.off}, L${props.off}, -${props.off}`);
  g.append('text')
    .attr('x', 0)
    .attr('y', `-${props.off + 3}`)
    .style('font-size', '16px')
    .style('text-anchor', 'middle')
    .text(props.time);
}

export function DriftSvg(props: Icon): JSX.Element {
  return (
    <svg width={props.width} height={props.height}>
      <path stroke={props.fill} strokeWidth={props.strokeWidth}
        d={`M${props.width * 0.1} ${props.height * 0.1}, L${props.width * 0.9} ${props.height * 0.9}`}
      ></path>
      <path stroke={props.fill} strokeWidth={props.strokeWidth}
        d={`M${props.width * 0.9} ${props.height * 0.1}, L${props.width * 0.1} ${props.height * 0.9}`}
      ></path>
    </svg>
  );
};
