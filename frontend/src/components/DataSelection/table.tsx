  import React from 'react';
  import CSSModules from 'react-css-modules';
  import * as styles from './table.scss';
  

  export interface TableProps {
    title: string[],
    content: string[][],
    centerIdx: number[],
    rightIdx: number[]
    maxH: number,
    width: number[],
    color?: number,
    check?: number,
    checkFunc?: Function
  };

  function TablePaneBase(props: TableProps): JSX.Element {
  return (
    <div styleName='table-div'>
      <table>
      <thead>
          <tr styleName='thead'>
            {props.title.map((v, i) => 
              <th key={i} style={{
                textAlign: (props.rightIdx.includes(i)) ? 'right' : (props.centerIdx.includes(i) ? 'center' : 'left'),
                width: props.width[i]}}>
                  {v}
              </th>   
            )}
            </tr>
        </thead>
        </table>
        <div styleName='table-body-div' style={{height: props.maxH * 30}}>
        <div styleName='table-scroll'>
        <table>
        <tbody>
          {props.content.map((row, rowId) =>
            <tr key={rowId} styleName='tbody'>
              {row.map((v, i) => 
                <td key={i} 
                  style={{
                    borderTop: rowId == 0 ? 0 : '1px solid #aaa',
                    textAlign: (props.rightIdx.includes(i)) ? 'right' : (props.centerIdx.includes(i) ? 'center' : 'left'),
                    width: props.width[i],
                    color: i == props.color ? v : 'null'
                  }}>
                  {i == props.color ? 
                    <div styleName='tbody-color' style={{background: v}}></div>
                     : 
                     (i == props.check ?
                      <input styleName='tbody-check' type='checkbox' 
                        checked={v === 'true'} 
                        onChange={(): void => {
                          if (props.checkFunc === undefined)
                            throw "You sholud pass checkFunc into Table Components while propsing check";
                          else
                           props.checkFunc(rowId); 
                        }} />
                      :
                      v
                     )
                    }
                </td>
              )}
            </tr>
          )}
        </tbody>
      </table>
      </div>
      </div>
    </div>
  );
}

export const TablePane = CSSModules(TablePaneBase, styles);
