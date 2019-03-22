import React, { Component } from 'react';

class DataCircle extends Component {
    constructor(props) {
        super(props);
        this.state = {  }
    }

    componentWillReceiveProps() {
        console.log("cdm", this.props.deselected)
        if( this.props.deselected === true) {
            console.log("deselct go")
            this.restoreCircleSettings();
            this.props.onHasBeenDeselected();
        } 
    }

    handleCircleClick = (e, markerIndex) => {
        const circle = e.currentTarget;
        if (this.props.previousCircle && this.props.previousCircle.circle === circle) return;
        if (this.props.previousCircle) this.restoreCircleSettings();     
        this.setSelectedCircleSettings(circle);
    }

    getHeatMapColors(input) {        
        const value = input * 1.0 / this.props.maxHeatColor;
        const h = (1 - value) * 60;      
        const hslColor = { h: Math.round(h * 100) / 100, s: 100, l: 35 }
        return `hsl(${hslColor.h}, ${hslColor.s}%, ${hslColor.l}%)`
    }

    setSelectedCircleSettings(circle) {
        const radius = circle.r.baseVal.value;

        const svgParent = circle.parentElement;
        const svgX = svgParent.x.baseVal.value;
        const svgY = svgParent.y.baseVal.value;
        svgParent.setAttribute("x", svgX-radius);
        svgParent.setAttribute("y", svgY-radius);
        svgParent.setAttribute("height", radius*4);
        svgParent.setAttribute("width", radius*4);
        svgParent.setAttribute("viewBox", `${-radius*2} ${-radius*2} ${radius*4} ${radius*4}`);
        circle.setAttribute("stroke-dasharray", `1`)
        circle.setAttribute("transform", `scale(2)`)
        circle.style.stroke = "#000000";
        circle.style.opacity = 0.3;
        this.props.onSetPreviousCircle({circle, radius});
    }

    restoreCircleSettings() {
        const pCircle = this.props.previousCircle.circle;
        const pSVG = pCircle.parentElement;
        const pRadius = this.props.previousCircle.radius;
        const pSvgX = pSVG.x.baseVal.value;
        const pSvgY = pSVG.y.baseVal.value;
        pSVG.setAttribute("x", pSvgX + pRadius);
        pSVG.setAttribute("y", pSvgY + pRadius);
        pSVG.setAttribute("height", pRadius * 2);
        pSVG.setAttribute("width", pRadius * 2);
        pSVG.setAttribute("viewBox", `${-pRadius} ${-pRadius} ${pRadius * 2} ${pRadius * 2}`);
        pCircle.setAttribute("transform", `scale(1)`)
        pCircle.setAttribute("stroke-dasharray", `0`)
        pCircle.setAttribute("opacity", `0.5`)
        pCircle.style.stroke = "#FFFFFF";
        pCircle.style.opacity = 0.5;
    }

    getSVGCoordinates(axis) {
        let idx = 0;
        if (axis === 'y') idx = 1;
        return this.props.projection()(this.props.position)[idx];
    }

    render() { 
        console.log(this.props.position);
        const radius = Math.log(this.props.data.count * 100) + 4;
        const sideLength = radius * 2;
        return (
            <svg
                x={this.props.position.x - radius}
                y={this.props.position.y - radius}
                height={sideLength}
                width={sideLength}
                viewBox={`${-radius} ${-radius} ${sideLength} ${sideLength}`}
                className="svgC"                
            >
                <circle
                    key={`marker-${this.props.idx}`}
                    cx={0}
                    cy={0}
                    r={radius}
                    fill={this.getHeatMapColors(this.props.data.count)}
                    stroke="#FFFFFF"
                    strokeWidth={radius / 15}
                    className="marker"
                    onClick={(event) => this.handleCircleClick(event, this.props.idx)}
                />
                <rect />
            </svg>

        );
    }
}
 
export default DataCircle;