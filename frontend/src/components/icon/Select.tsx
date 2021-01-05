import React, { useRef } from 'react';
import './select.css';

export interface OptionProps {
    value: number,
    content: string,
    groupId: number,
    checked: boolean,
};

export interface Style {
    width?: string,
    height?: string,
    top?: string,
    fontWeight?: number
};
export interface SelectProps {
    style: Style,
    title: string,
    value: number,
    options: OptionProps[],
    groups: string[],
    btnClick: Function,
    id?: string
};

export function Select(props: SelectProps): JSX.Element {
    const {style, value, options, groups} = props;
    const height: number = style.height ? parseInt(style.height) : 20;
    const title = value >= 0 ? options[value].content : props.title;
    let groupsArray: OptionProps[][] = [];
    let groupContent = null,
        normalContent = null;
    if (groups.length > 0) {
        groupsArray = [...Array(groups.length)].map(() => []);
        options.forEach(v => {
            groupsArray[v.groupId].push(v);
        });
        groupContent = groupsArray.map((v, i) => {
            return (
                <div className='select-group' key={`gorup-${i}`} >
                    <div className='select-option select-group-title'>
                        {groups[i]}
                    </div>
                    {
                        v.map(v => 
                            <div 
                                key={`group-content-${v.value}`} 
                                className={'select-option select-group-option'} 
                                onClick={(): void => props.btnClick(v.value)}>
                                <input type='checkbox' checked={v.checked == true} readOnly></input>
                                {v.content}
                            </div>
                        )
                    }
                </div>
            );
        });
    }
    else {
        normalContent = options.map((v, i) =>
            <div 
                key={`option-content-${i}`} 
                className={'select-option' + (v.checked == true  ? ' select-option-checked' : '')}
                onClick={(): void => {props.btnClick(v.value); selectBtn();}}>
                {v.content}
            </div>
            );
    }

    const contentRef = useRef(null);
    const diretcionRef = useRef(null);
    const selectBtn = (): void => {
        //@ts-ignore
        if (contentRef.current.style.visibility == 'hidden') {
            //@ts-ignore
            contentRef.current.style.visibility = 'visible';diretcionRef.current.className = 'select-up';
        }
        else{
            //@ts-ignore
            contentRef.current.style.visibility = 'hidden';diretcionRef.current.className = 'select-down';
        }
    };    
    return (
        <div style={{...style}} className='select-div' id={props.id}>
            <div className='select-selector' style={{borderRadius: height / 2}} onClick={selectBtn}>
                <div style={{padding: '0 15px'}}>{title}</div>
                <div 
                    ref={diretcionRef}
                    className='select-down'
                />
            </div>
            <div className='select-content' ref={contentRef} style={{visibility: 'hidden', borderRadius: height / 2}}>
                <div style={{height: height + 1 + 'px'}}></div>
                {groups.length > 0 ? groupContent : normalContent}
            </div>
        </div>
    );
}