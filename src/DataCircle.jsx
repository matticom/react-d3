import React, { Component } from 'react';

class DataCircle extends Component {

    constructor(props) {
        super(props);
        this.state = { 
            margin: 11,
            fontSize: 0
         }
    }
    
   
    componentDidUpdate() {
        if (this.props.deselected) {
            if (this.props.previousCircle.circle === this.refs.circleRef) {
                const oldSmallCircleSetting = this.props.previousCircle;
                this.setCircleSettings(oldSmallCircleSetting);
                this.hideInfo(oldSmallCircleSetting);
                this.props.onHasBeenDeselected();
            }
        }
        
        if (this.props.resorted) {
            console.log("cdu")
            if(this.props.idx === this.props.lastElementIdx){
                //this.refs.circleRef.dispatchEvent(new MouseEvent('click'));
                this.props.onHasBeenResorted();
                console.log("clicked")
            }
        }
    }    

    handleCircleClick = (e) => {
        console.log("new clickhandler")
        // make sure that the clicked circle is not covered by other circles
        if (this.props.idx !== this.props.lastElementIdx){
            this.props.onResortElements(this.props.idx);
            console.log("resorting")
            return;
        }            
        
        const circle = e.currentTarget;
        
        // clicked on already maximized circle
        if (this.props.previousCircle && this.props.previousCircle.circle === circle) return;
        
        // backup for last maximized circle is available
        if (this.props.previousCircle) {
            const oldSmallCircleSetting = this.props.previousCircle;
            this.setCircleSettings(oldSmallCircleSetting);
            this.hideInfo(oldSmallCircleSetting);            
        }

        // backup minimized circle settings
        const currentSmallCircleSettings = this.saveMinimizedCircleSettings(circle); 
        this.props.onSetPreviousCircle({
            circle: currentSmallCircleSettings.circle,
            infoText: currentSmallCircleSettings.infoText,
            properties: currentSmallCircleSettings.properties
        }, this.props);

        // set properties for maximized circle
        this.setCircleSettings(this.getMaximizedCircleSettings(circle));
        this.showInfo();
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
        const svgParent = properties.svgParent;

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

    saveMinimizedCircleSettings(circle) {
        return {
            circle,
            infoText: this.refs.svgRef,
            properties: {
                svgParent: circle.parentElement,
                svgX: circle.parentElement.x.baseVal.value,
                svgY: circle.parentElement.y.baseVal.value,
                svgSideLength: this.props.radius * 2,
                viewBox: `${-this.props.radius} ${-this.props.radius} ${this.props.radius * 2} ${this.props.radius * 2}`,
                strokeDashArray: 0,
                opacity: 0.5,
                stroke: '#FFFFFF',
                transform: 'scale(1)',
                siblingCircleRadius: this.props.radius,
                mode: 'min'
            }
        }
    }

    getMaximizedCircleSettings(circle) {
        const radiusWithStroke = this.props.radius + this.props.strokeWidth;
        const newDoubleRadiusWithStroke = this.props.radius * 2 + this.props.strokeWidth;
        return {
            circle,
            properties: {
                svgParent: circle.parentElement,
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
        const txtBB = this.refs.textRef.getBBox();
        const width = txtBB.width;
        const height = txtBB.height;

        this.refs.rectRef.width.baseVal.value = width + this.state.margin * 2;
        this.refs.rectRef.height.baseVal.value = height + this.state.margin * 2;

        this.refs.svgRef.x.baseVal.value = this.props.position.x - this.refs.rectRef.width.baseVal.value /2;
        this.refs.svgRef.className.baseVal = "infoText";
    }

    hideInfo(circleProps) {        
        circleProps.infoText.className.baseVal = "infoText noneOpacity";
    }

    getHeatMapColors(input) {        
        const value = input * 1.0 / this.props.maxHeatColor;
        const h = (1 - value) * 60;      
        const hslColor = { h: Math.round(h * 100) / 100, s: 100, l: 35 }
        return `hsl(${hslColor.h}, ${hslColor.s}%, ${hslColor.l}%)`
    }

    render() {
        const { radius, position, strokeWidth, idx, data, description } = this.props; 
        const radiusWithStroke = radius + strokeWidth;
        const sideLength = radiusWithStroke * 2;
        const maxRadiusWithStroke = radius * 2 + strokeWidth + 5;
        
        console.log("data", data);
        console.log("desc", description);
        return (
            <React.Fragment>
                <svg
                    x={position.x - radiusWithStroke}
                    y={position.y - radiusWithStroke}
                    height={sideLength}
                    width={sideLength}
                    viewBox={`${-radiusWithStroke} ${-radiusWithStroke} ${sideLength} ${sideLength}`}
                    className="svgC"                
                >
                    <circle
                        key={`spacer-${idx}`}
                        cx={0}
                        cy={0}
                        r={radiusWithStroke}                    
                        className="invisible"                    
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
                        className="circle"
                        onClick={(event) => this.handleCircleClick(event, idx)}
                        ref="circleRef"
                    />                
                    
                </svg>
                <svg
                    x={0}
                    y={position.y + maxRadiusWithStroke}
                    height={100}
                    width={400}
                    viewBox={'0 0 400 100'}
                    className="noneOpacity"
                    ref="svgRef"
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
                        ref="rectRef"
                    />
                    <g transform={`translate(${this.state.margin} ${this.state.margin})`}>
                    <text 
                        x="0" 
                        y="0"                         
                        ref="textRef"
                        className="infoText"
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