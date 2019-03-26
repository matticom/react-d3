import React, { Component } from 'react';

class Legend extends Component {    

    getHeatMapColors(input) {        
        const value = input * 1.0 / this.props.maxHeatValue;
        const h = (1 - value) * 60;      
        const hslColor = { h: Math.round(h * 100) / 100, s: 100, l: 35 }
        return `hsla(${hslColor.h}, ${hslColor.s}%, ${hslColor.l}%,0.5)`
    }

    createValueScale() {
        const { maxHeatValue } = this.props;
        return [0, maxHeatValue * 0.33, maxHeatValue * 0.66, maxHeatValue]
    }

    createColorScale() {
        const { maxHeatValue } = this.props;
        return [this.getHeatMapColors(0), 
            this.getHeatMapColors(maxHeatValue * 0.33), this.getHeatMapColors(maxHeatValue * 0.66), this.getHeatMapColors(maxHeatValue)]
    }

    render() { 
        const { position, height, width } = this.props;    
        const textYOffset = 13;
        const lineOffset = 21;
        const contentStartYOffset = height * 0.22;
        return (  
            <svg
                x={position.x}
                y={position.y}
                height={height}
                width={width}
                viewBox={`${0} ${0} ${width} ${height}`} 
            >
                <rect
                    x="0" 
                    y="0"
                    height={height}
                    width={width}
                    rx="4" 
                    ry="4"
                    fill={"rgba(0,0,0,0.02)"}
                    stroke={"rgba(0,0,0,1)"}
                    strokeWidth="0.3"
                />                
                    <g>
                        {this.createColorScale().map((value, idx) => 
                        <g>
                                <rect
                                    x={width * 0.15} 
                                    y={`${contentStartYOffset + lineOffset * (idx+ 1) -1}`} 
                                    height={19}
                                    width={width * 0.7}
                                    rx="1" 
                                    ry="1"
                                    fill={'rgba(38, 50, 56, 0.3)'}
                                />
                                <rect
                                    x={width * 0.15} 
                                    y={`${contentStartYOffset + lineOffset * (idx+ 1) -1}`} 
                                    height={19}
                                    width={width * 0.7}
                                    rx="1" 
                                    ry="1"
                                    fill={value}
                                    stroke={"white"}
                                    strokeWidth="0.3"                                
                            />
                            </g>
                            )}                        
                    </g>
                    <g >
                        <text 
                            x="0" 
                            y="0"      
                            className=""
                        >
                            
                            <tspan x={`${width * 0.5}`} y={`${height * 0.05 + textYOffset}`} className="wm-legendHead">
                                Playouts /
                            </tspan>
                            <tspan x={`${width * 0.5}`} y={`${height * 0.15 + textYOffset}`} className="wm-legendHead">
                                Ingests
                            </tspan>
                            {this.createValueScale().map((value, idx) => 
                                <tspan x={`${width * 0.5}`} y={`${contentStartYOffset + lineOffset * (idx+ 1) + textYOffset}`} className="wm-legendContent">
                                {Math.floor(value)}
                                </tspan>
                            )}   
                        </text>  
                    </g> 
                    
            </svg>
        );
    }
}
 
export default Legend;