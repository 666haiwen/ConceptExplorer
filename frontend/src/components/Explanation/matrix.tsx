import React, { useEffect } from 'react';
import CSSModules from 'react-css-modules';
import * as d3 from 'd3';
import { MatrixData, MatrixRender, Position, MatrixDrawName } from '../../models';
import { getAttrSplitIndexKByName } from '../utils';
import { MATRIX_COLOR, MATRIX_LEGEND } from '../../constants';

import * as styles from './matrix.scss';

export interface MatrixProps {
    curData: MatrixRender,
    curSource: number[],
    historyData: MatrixRender,
    historySource: number[],
    dataSourceNum: number,
    axisName: MatrixDrawName[],
    legendValue: number,
    compare: boolean,
    mergeSource: number[],
    dataNum: number
}

function MatrixPaneBase(props: MatrixProps): JSX.Element {
    const {curData, curSource, historyData, historySource, dataSourceNum, 
      axisName, compare, mergeSource, dataNum, legendValue} = props;
    if (curSource.length == 0)
      return <div></div>;

    const filterNum  = (dataNum * 0.05) | 0;
    const cubeBorder = 2;
    const matrixBorder = 5;
    const matrixPadding = 1.5;
    const color = d3.scaleLinear()
      .domain([MATRIX_LEGEND[0], legendValue, MATRIX_LEGEND[1]])
      // @ts-ignore
      .range(MATRIX_COLOR);
    const renderSvg = (curMatrixG: any, g: any, cubeWidth: number, cubeHeight: number): void => {
      const offSet = { x: matrixBorder / 2 + matrixPadding, y: matrixBorder / 2 + matrixPadding };
      const xScaleList: Function[] = [];
      const yScaleList: Function[] = [];

      // draw axis
      axisName.forEach((v, index) => {
        const length = index == 0 ? v.splitName.length : v.splitName.length - 1;
        const width = length * cubeWidth;
        const height = length * cubeHeight;
        const xScale = d3.scaleLinear()
          .domain([0, length])
          .range([offSet.x, offSet.x + width]);
        const yScale = d3.scaleLinear()
          .domain([0, length])
          .range([offSet.y, offSet.y + height]);
        
        xScaleList.push(xScale);
        yScaleList.push(yScale);
        const format = (v: number, oneHot: boolean): string => {
          if (oneHot) 
            return  v == 0 ? 'No' : (v == 1 ? 'Yes' : '');
          if (v == undefined)
            return '';
          return v >= 9999999999 ? '∞' 
            : (v >= 10000000 ? ((v / 1000000) | 0) + 'M'
            : (v >= 10000 ? ((v / 1000) | 0) + 'K' : '' + v));
        };
        //@ts-ignore
        const xAxis = d3.axisTop(xScale).ticks(length).tickFormat(d => format(v.splitName[d], v.oneHot));
        //@ts-ignore
        const yAxis = d3.axisLeft(yScale).ticks(length).tickFormat(d => format(v.splitName[d], v.oneHot));
        const xG = g.append('g')
          .attr('class', styles['axis'])
          .call(xAxis);
        xG.selectAll('text')
          .attr('y', 0)
          .style('text-anchor', 'start')
          .style('transform', 'rotate(-90deg) translate(10px, 2px)');
        let nodes = xG.selectAll('g').nodes();
        d3.select(nodes[0]).style('transform', `translate(${xScale(0) + 3}px, 0)`);
        d3.select(nodes[nodes.length - 1]).style('transform', `translate(${xScale(length) - 3}px, 0)`);
        xG.selectAll('path')
          .remove();

        const yG = g.append('g')
          .attr('class', styles['axis'])
          .call(yAxis);
        yG.selectAll('path')
          .remove();
        if (index == 0) {
          xG.append('line')
          .attr('x1', 0)
          .attr('x2', 0)
          .attr('y1', 0)
          .attr('y2', 455 + matrixBorder / 2)
          .style('stroke', '#ddd')
          .style('stroke-width', matrixBorder);
                    
        yG.append('line')
          .attr('x1', 0)
          .attr('x2', 455 + matrixBorder / 2)
          .attr('y1', 0)
          .attr('y2', 0)
          .style('stroke', '#ddd')
          .style('stroke-width', matrixBorder);
        }
        xG.append('line')
          .attr('x1', offSet.x + width + matrixPadding +  matrixBorder / 2)
          .attr('x2', offSet.x + width + matrixPadding +  matrixBorder / 2)
          .attr('y1', 0)
          .attr('y2', 455 + matrixBorder / 2)
          .style('stroke', '#ddd')
          .style('stroke-width', matrixBorder);
                    
        yG.append('line')
          .attr('x1', 0)
          .attr('x2', 455 + matrixBorder / 2)
          .attr('y1', offSet.y + height + matrixPadding + matrixBorder / 2)
          .attr('y2', offSet.y + height + matrixPadding + matrixBorder / 2)
          .style('stroke', '#ddd')
          .style('stroke-width', matrixBorder);

        nodes = yG.selectAll('g').nodes();
          d3.select(nodes[0]).style('transform', `translate(0, ${yScale(0) + 3}px)`);
          d3.select(nodes[nodes.length - 1]).style('transform', `translate(0, ${yScale(length) - 3}px)`);
        if (v.oneHot || index == 0) {
          xG.selectAll('g').nodes().forEach((subG: any, axisIndex: number) => {
            d3.select(subG).style('transform', `translate(${xScale(axisIndex + 0.5)}px, 0)`);
            d3.select(subG).select('line')
              .attr('x1', -(xScale(0.5) - offSet.x))
              .attr('x2', -(xScale(0.5) - offSet.x));
          });
          yG.selectAll('g').nodes().forEach((subG: any, axisIndex: number) => {
            d3.select(subG).style('transform', `translate(0, ${yScale(axisIndex + 0.5)}px)`);
            d3.select(subG).select('line')
              .attr('y1', -(yScale(0.5) - offSet.y))
              .attr('y2', -(yScale(0.5) - offSet.y));
          });
        }
        if (v.attr.length >= 10 && (v.attr.includes('-') || v.attr.includes('_'))) {
          let title, subTitle;
          if (v.attr.includes('-'))
            [title, subTitle]  = v.attr.split('-');
          else
            [title, subTitle]  = v.attr.split('_');
          g.append('text')
            .attr('transform',
            'translate(' + (-40) + ' ,' +
                            (offSet.y + height / 2 - 2) + ')')
            .style('text-anchor', 'end')
            .text(title);
          g.append('text')
            .attr('transform',
            'translate(' + (-40) + ' ,' +
                            (offSet.y + height / 2 + 10) + ')')
            .style('text-anchor', 'end')
            .text(subTitle);
          g.append('text')
            .attr('style',
            'transform: translate(' + (offSet.x + width / 2 - 5) + 'px ,-50px) rotate(-20deg)')
            .text(title);
          g.append('text')
            .attr('style',
            'transform: translate(' + (offSet.x + width / 2 + 40) + 'px ,-50px) rotate(-20deg)')
            .style('text-anchor', 'end')
            .text(subTitle);
        }
        else {
          g.append('text')
            .attr('transform',
            'translate(' + (-40) + ' ,' +
                            (offSet.y + height / 2) + ')')
            .style('text-anchor', 'end')
            .text(v.attr);
          g.append('text')
            .attr('style',
            'transform: translate(' + (offSet.x + width / 2 - 5) + 'px ,-40px) rotate(-20deg)')
            .text(v.attr);
        }
        offSet.x += width + matrixBorder + matrixPadding * 2;
        offSet.y += height + matrixBorder + matrixPadding * 2;
      });
      const historyMatrixG =  g.append('g');

      // render all matrix
      axisName.forEach((v, attrIndex) => {
        // draw one matrix
        const drawMatrix = (data: MatrixData, matrixPos: Position, xIndexList: number[], yIndexList: number[], swap: boolean): void => {
          const drawG = matrixPos.x <= matrixPos.y ? curMatrixG : historyMatrixG;
          const curFlag = matrixPos.x <= matrixPos.y;
          
          xIndexList.forEach((x, xOffset) => {
            yIndexList.forEach((y, yOffset) => {
              const num = swap ? data.positive[y][x] + data.negative[y][x]
                : data.positive[x][y] + data.negative[x][y];
              const stroke = num > 0 ? '#444' : 'none';
              const strokeDashArray = num > filterNum ? '0px' : (num == 0 ? 'none' : '2px');
              const matrixColor = num == 0 ? '#eee' : color(swap ? data.data[y][x] : data.data[x][y]);
              const className = `x_${matrixPos.y}_${xOffset}-y_${matrixPos.x}_${yOffset}-rect`;
              drawG.append('rect')
                .attr('class', className + '-background matrix-rect-background')
                .attr('y', yScaleList[matrixPos.y](xOffset))
                .attr('x', xScaleList[matrixPos.x](yOffset))
                .attr('width', cubeWidth)
                .attr('height', cubeHeight)
                .style('fill', 'yellow')
                .style('fill-opacity', '0');
              drawG.append('rect')
                .attr('class', className)
                .attr('y', yScaleList[matrixPos.y](xOffset) + cubeBorder)
                .attr('x', xScaleList[matrixPos.x](yOffset) + cubeBorder)  // matrix index of xy are opposit with svg render
                .attr('width', cubeWidth - cubeBorder * 2)
                .attr('height', cubeHeight - cubeBorder * 2)
                .style('fill', matrixColor)
                .style('stroke', stroke)
                .style('stroke-width', 1)
                .style('stroke-dasharray', strokeDashArray)
                .style('cursor', 'pointer')
                .on('mouseover', () => {
                  drawG.select('.' + className + '-background')
                    .style('fill-opacity', 1);
                  if (curFlag && compare)
                    historyMatrixG.select(`.x_${matrixPos.x}_${yOffset}-y_${matrixPos.y}_${xOffset}-rect-background`)
                      .style('fill-opacity', 1);
                })
                .on('mouseout', () => {
                  curMatrixG.selectAll('.matrix-rect-background')
                    .style('fill-opacity', 0);
                  historyMatrixG.selectAll('.matrix-rect-background')
                    .style('fill-opacity', 0);
                });
              if (matrixPos.x <= matrixPos.y) {
                drawG.append('rect')
                .attr('class', className)
                .attr('y', yScaleList[matrixPos.x](yOffset))
                .attr('x', xScaleList[matrixPos.y](xOffset))  // matrix index of xy are opposit with svg render
                .attr('width', cubeWidth)
                .attr('height', cubeHeight)
                .style('fill', '#fff')
                .style('fill-opacity', '0')
                .style('cursor', 'pointer')
                .on('mouseover', () => {
                  historyMatrixG.select(`.x_${matrixPos.x}_${yOffset}-y_${matrixPos.y}_${xOffset}-rect-background`)
                    .style('fill-opacity', 1);
                  curMatrixG.select(`.x_${matrixPos.y}_${xOffset}-y_${matrixPos.x}_${yOffset}-rect-background`)
                      .style('fill-opacity', 1);
                })
                .on('mouseout', () => {
                  curMatrixG.selectAll('.matrix-rect-background')
                    .style('fill-opacity', 0);
                  historyMatrixG.selectAll('.matrix-rect-background')
                    .style('fill-opacity', 0);
                });
              }
             });
          });

        };

        // draw distribution
        const drawDistribution = (attrIndexList: number[], matrixPos: Position, compare: boolean): void => {
          const length = attrIndexList.length;
          const widthG = cubeWidth * length - cubeBorder * 2;
          const heightG = cubeHeight * length - cubeBorder * 2;
          const charG = g.append('g')
            .attr('transform', `translate(${xScaleList[matrixPos.x](0)},${yScaleList[matrixPos.y](0)})`)
            .attr('width', widthG)
            .attr('height', heightG);
          const xScaleG = d3.scaleLinear()
            .domain([0, length])
            .range([0, widthG]);
          const yScaleG = d3.scaleLinear()
            .domain([0, dataNum * 1.1])
            .range([0, heightG]);
          attrIndexList.forEach((attrId, barIndex) => {
            let curNum = 0,
                historyNum = 0;
            curSource.forEach(curSourceId => {
              curNum += curData.sourceData.positive[curSourceId][attrId]
                 + curData.sourceData.negative[curSourceId][attrId];
            });
            historySource.forEach(historySourceId => {
              historyNum += historyData.sourceData.positive[historySourceId][attrId]
                + historyData.sourceData.negative[historySourceId][attrId];
            });
            const rectHeight = curNum == 0 ? 0 : Math.max(2, yScaleG(curNum));
            charG.append('rect')
              .attr('width', cubeWidth - cubeBorder * 2)
              .attr('height', rectHeight)
              .attr('x', xScaleG(barIndex) + cubeBorder)
              .attr('y', heightG - rectHeight + cubeBorder)
              .style('fill', '#bbb');
            if (compare) {
              const rectHeight = historyNum == 0 ? 0 : Math.max(2, yScaleG(historyNum));
              charG.append('rect')
                .attr('width', cubeWidth - cubeBorder * 2)
                .attr('height', rectHeight)
                .attr('x', xScaleG(barIndex) + cubeBorder)
                .attr('y', cubeBorder)
                .style('fill', '#bbb');
            }
          });
        };
        // begin draw
        for (let index = 0; index < axisName.length; index++) {
          const matrixPos = {
            x: index,
            y: attrIndex
          };
          let xIndexList: number[] = [],
              yIndexList: number[] = [],
              swap = false;
          
          if (index <= attrIndex) {
            if (index == 0 && attrIndex == 0) {
              xIndexList = compare ? mergeSource : curSource;
              yIndexList = compare ? mergeSource : curSource;
            }
            else if (index == 0) {
              xIndexList = getAttrSplitIndexKByName(axisName, axisName[attrIndex].attr, true, dataSourceNum);
              yIndexList = compare ? mergeSource : curSource;
              swap = true;
            }
            else if (attrIndex != 0 && index !=0) {
              xIndexList = getAttrSplitIndexKByName(axisName, axisName[attrIndex].attr, false, dataSourceNum);
              yIndexList = getAttrSplitIndexKByName(axisName, axisName[index].attr, false, dataSourceNum);
            }
            // draw bar chart!!
            if (attrIndex == index) {
              xIndexList = attrIndex == 0 ? mergeSource 
                : xIndexList = getAttrSplitIndexKByName(axisName, axisName[attrIndex].attr, true, dataSourceNum);
              drawDistribution(xIndexList, matrixPos, compare);
            } 
            else {
              if (attrIndex == 0 || index == 0)
                drawMatrix(curData.sourceData, matrixPos, xIndexList, yIndexList, swap);
              else
                drawMatrix(curData.res, matrixPos, xIndexList, yIndexList, false);
            }
          } // if (index <= attrIndex)   
          else if (compare) {
            if (attrIndex == 0) {
              xIndexList = mergeSource;
              yIndexList = getAttrSplitIndexKByName(axisName, axisName[index].attr, true, dataSourceNum);
            }
            else {
              xIndexList = getAttrSplitIndexKByName(axisName, axisName[attrIndex].attr, false, dataSourceNum);
              yIndexList = getAttrSplitIndexKByName(axisName, axisName[index].attr, false, dataSourceNum);
            }
            if (attrIndex == 0)
                drawMatrix(historyData.sourceData, matrixPos, xIndexList, yIndexList, swap);
              else
                drawMatrix(historyData.res, matrixPos, xIndexList, yIndexList, false);
          }
        }
      });
    };

    useEffect(() => {
      if (curData.sourceData.positive.length == 0)
        return;
      const svg = d3.select('#matrix-svg');
      const curSvg = d3.select('#matrix-cur-svg');

      const margin = {left: 130, top: 80, right:40, bottom: 10};
      const width = parseInt(svg.style('width')) - margin.left - margin.right;
      const height = parseInt(svg.style('height')) - margin.top - margin.bottom;
      let count = 1;
      axisName.forEach(v => count += v.splitName.length - 1);
      const cubeWidth = (width - (matrixBorder + matrixPadding * 2) * axisName.length) / count;
      const cubeHeight = (height - (matrixBorder + matrixPadding * 2) * axisName.length) / count;
      svg.selectAll('g').remove();
      curSvg.selectAll('g').remove();
      const g = svg.append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
      const curMatrixG = curSvg.append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
      renderSvg(curMatrixG, g, cubeWidth, cubeHeight);
    });
    
    return (
        <div styleName='matrix-div'>
          <svg styleName='matrix-svg' id='matrix-svg'>
          </svg>
          <svg styleName='matrix-svg' style={{position: 'absolute'}} id='matrix-cur-svg'>

          </svg>
        </div>
    );
}

export const MatrixPane = CSSModules(MatrixPaneBase, styles);