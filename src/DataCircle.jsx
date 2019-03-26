import React, { Component } from 'react';

class DataCircle extends Component {

    constructor(props) {
        super(props);
        this.rectRef = React.createRef();
        this.textRef = React.createRef();
        this.circleRef = React.createRef();
        this.textSvgRef = React.createRef();
        this.state = { 
            margin: 11
        }

    }       
   
    componentDidUpdate() {
        const { deselected, resorted, previousCircle, idx, lastElementIdx, 
                onHasBeenDeselected, onHasBeenResorted } = this.props;

        if (deselected) {
            if (previousCircle.circle === this.circleRef.current) {
                this.restoreMinimizedCircleSettings();
                onHasBeenDeselected();
            }
        }
        
        if (resorted) {           
            if(idx === lastElementIdx){
                this.circleRef.current.className.baseVal = "wm-circle";
                setTimeout(() =>
                    this.circleRef.current.dispatchEvent(
                        new MouseEvent('click', { view: window, bubbles: true, cancelable: false })
                    ), 1);               
                onHasBeenResorted();                
            }
        }
        
    }    

    handleCircleClick = (e) => {   
        const { idx, lastElementIdx, previousCircle, 
                onSetPreviousCircle, onResortElements } = this.props;

        // make sure that the clicked circle is not covered by other circles
        if (idx !== lastElementIdx){
            if (previousCircle) {
                this.restoreMinimizedCircleSettings();            
            }
            onSetPreviousCircle(undefined);
            onResortElements(idx); 
            return;
        }            
        
        const circle = e.currentTarget;

        // clicked on already maximized circle
        if (previousCircle && previousCircle.circle === circle) return; 
        
        // if backup for currently maximized circle available then restore
        if (previousCircle) this.restoreMinimizedCircleSettings();

        // backup minimized circle settings
        const currentMinimizedCircleSettings = this.saveMinimizedCircleSettings(circle, idx); 
        onSetPreviousCircle({ ...currentMinimizedCircleSettings });

        // set properties for new maximized circle
        this.setCircleSettings(this.getMaximizedCircleSettings(circle));
        this.showInfo();
        onResortElements(idx);
    }

    restoreMinimizedCircleSettings() {
        const oldMinimizedCircleSetting = this.props.previousCircle;
        this.setCircleSettings(oldMinimizedCircleSetting);
        this.hideInfo(oldMinimizedCircleSetting);  
    }

    setCircleSettings(circleProps) {        
        const circle = circleProps.circle;        
        const properties = circleProps.properties;
        circle.setAttribute("transform", properties.transform)

        if (properties.mode === 'min')
            setTimeout(() => this.setInstantProperties(circleProps), 500);
        else this.setInstantProperties(circleProps);        
    }

    setInstantProperties(circleProps) {
        const circle = circleProps.circle;
        const properties = circleProps.properties;
        const svgParent = circleProps.svgParent;

        svgParent.setAttribute("x", properties.svgX);
        svgParent.setAttribute("y", properties.svgY);
        svgParent.setAttribute("height", properties.svgSideLength);
        svgParent.setAttribute("width", properties.svgSideLength);
        svgParent.setAttribute("viewBox", properties.viewBox);
        svgParent.firstChild.setAttribute("r", properties.siblingCircleRadius);
        circle.setAttribute("stroke-dasharray", properties.strokeDashArray)

        circle.style.stroke = properties.stroke;
        circle.style.opacity = properties.opacity; 
    }   

    saveMinimizedCircleSettings(circle, idx) {
        const { radius } = this.props;
        return {
            idx,
            circle,
            infoText: this.textSvgRef.current,
            svgParent: circle.parentElement,
            properties: {                
                svgX: circle.parentElement.x.baseVal.value,
                svgY: circle.parentElement.y.baseVal.value,
                svgSideLength: radius * 2,
                viewBox: `${-radius} ${-radius} ${radius * 2} ${radius * 2}`,
                strokeDashArray: 0,
                opacity: 0.5,
                stroke: '#FFFFFF',
                transform: 'scale(1)',
                siblingCircleRadius: radius,
                mode: 'min'
            }
        }
    }

    getMaximizedCircleSettings(circle) {
        const { radius, strokeWidth } = this.props;
        const radiusWithStroke = radius + strokeWidth;
        const newDoubleRadiusWithStroke = radius * 2 + strokeWidth;
        return {
            circle,
            svgParent: circle.parentElement,
            properties: {
                svgX: circle.parentElement.x.baseVal.value - radiusWithStroke,
                svgY: circle.parentElement.y.baseVal.value - radiusWithStroke,
                svgSideLength: newDoubleRadiusWithStroke * 2,
                viewBox: `${-newDoubleRadiusWithStroke} ${-newDoubleRadiusWithStroke} ${newDoubleRadiusWithStroke * 2} ${newDoubleRadiusWithStroke * 2}`,
                strokeDashArray: 1,
                opacity: 0.35,
                stroke: '#000000',
                transform: 'scale(2)',
                siblingCircleRadius: newDoubleRadiusWithStroke,
                mode: 'max'
            }
        }
    }

    showInfo() {
        const txtBB = this.textRef.current.getBBox();
        const width = txtBB.width;
        const height = txtBB.height;

        this.rectRef.current.width.baseVal.value = width + this.state.margin * 2;
        this.rectRef.current.height.baseVal.value = height + this.state.margin * 2;

        this.textSvgRef.current.x.baseVal.value = this.props.position.x - this.rectRef.current.width.baseVal.value /2;
        this.textSvgRef.current.className.baseVal = "wm-infoText";
    }

    hideInfo(circleProps) {        
        circleProps.infoText.className.baseVal = "wm-infoText wm-noneOpacity";
    }

    getHeatMapColors(input) {        
        const value = input * 1.0 / this.props.maxHeatValue;
        const h = (1 - value) * 60;      
        const hslColor = { h: Math.round(h * 100) / 100, s: 100, l: 35 }
        return `hsl(${hslColor.h}, ${hslColor.s}%, ${hslColor.l}%)`
    }

    render() {
        const { radius, position, strokeWidth, idx, data, description } = this.props; 
        const radiusWithStroke = radius + strokeWidth;
        const sideLength = radiusWithStroke * 2;
        const maxRadiusWithStroke = radius * 2 + strokeWidth + 5;
        
        // console.log("props", this.props);
        // console.log("props", this.props);
        // console.log("desc", description);
        return (
            <React.Fragment>
                <svg
                    x={position.x - radiusWithStroke}
                    y={position.y - radiusWithStroke}
                    height={sideLength}
                    width={sideLength}
                    viewBox={`${-radiusWithStroke} ${-radiusWithStroke} ${sideLength} ${sideLength}`}              
                >
                    <circle
                        key={`spacer-${idx}`}
                        cx={0}
                        cy={0}
                        r={radiusWithStroke}                    
                        className="wm-invisible"                    
                    />
                    <circle
                        key={`circle-${idx}`}
                        cx={0}
                        cy={0}
                        r={radius}
                        fill={this.getHeatMapColors(data.count)}
                        stroke="#FFFFFF"
                        strokeWidth={strokeWidth}
                        paintOrder="stroke"
                        className="wm-circle"
                        onClick={(event) => this.handleCircleClick(event, idx)}
                        ref={this.circleRef}
                    />                
                    
                </svg>
                <svg
                    x={0}
                    y={position.y + maxRadiusWithStroke}
                    height={100}
                    width={400}
                    viewBox={'0 0 400 100'}
                    className="wm-noneOpacity"
                    ref={this.textSvgRef}
                >
                    <rect
                        x="0" 
                        y="0"
                        width="200"
                        height="100"
                        rx="5" 
                        ry="5"
                        fill={"rgba(0,0,0,0.7)"}
                        stroke={"rgba(255,255,255,1)"}
                        strokeWidth="0.9"
                        ref={this.rectRef}
                    />
                    <g transform={`translate(${this.state.margin} ${this.state.margin})`}>
                        <text 
                            x="0" 
                            y="0"                         
                            ref={this.textRef}
                            className="wm-infoText"
                        >
                            <tspan x="0" dy={`${14}`} fill={"rgba(255,255,255,0.9)"}>
                                {description.name}
                            </tspan>
                            
                            <tspan x="0" dy={`${24}`} fill={"rgba(235,235,235,1)"}>
                                Playouts: {data.count}
                            </tspan>
                        </text>  
                    </g>               
                </svg>
            </React.Fragment>
        );
    }
}
 
export default DataCircle;