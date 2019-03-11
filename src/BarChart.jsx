import React, { Component } from 'react';
import * as d3 from "d3";
import Datamap from "datamaps"

// http://techslides.com/list-of-countries-and-capitals
let cities = require('./data/country-capitals.json');

class BarChart extends Component {
    state = {  
        h: 300,
        w: 700
    }

    componentDidMount() {
        //this.drawChart(); 
        this.drawWorld(); 
        console.log(cities);
    }

    drawWorld() {
        
        const countries = ['US', 'GER', 'GB', 'VN', 'NG', 'NZ', 'UY'];

        const bubbleSizes = {
            'US'    :   10,
            'GER'   :   8,
            'GB'    :   11,
            'VN'    :   4,
            'NG'    :   25,
            'NZ'    :   15,
            'UY'    :   9
        }

        const fills = {};
        fills.test = 'blue';

        countries.forEach( country => {
            fills[country] = this.getColor(bubbleSizes[country]);
        })

        const map = new Datamap({
            element: document.getElementById('container'),
            scope: 'world',
            width: 1200,
            height: 800,
            geographyConfig: {
                popupOnHover: true,
                highlightOnHover: true,
                borderColor: '#999',
                borderWidth: 0.5,
                //dataUrl: 'https://rawgit.com/Anujarya300/bubble_maps/master/data/geography-data/india.topo.json'
                //dataJson: topoJsonData
            },
            setProjection: function (element) {
                var projection = d3.geoMercator()
                    .translate([400, 350]) // always in [East Latitude, North Longitude]
                    .scale(100);
                var path = d3.geoPath().projection(projection);
                return { path, projection };
            },
            fills
        });

        

        

        console.log(fills);
        cities.forEach(city => {
            city.name = city.CapitalName;
            city.radius = bubbleSizes.hasOwnProperty(city.CountryCode) ? bubbleSizes[city.CountryCode] : 1;
            city.yeild = 100;
            city.latitude = city.CapitalLatitude;
            city.longitude = city.CapitalLongitude;
            city.fillKey = (city.radius > 1) ? city.CountryCode : null;
        });
        map.bubbles(cities);

        
    }

    getColor(radiusSize) {
        switch (true) {
            case (radiusSize === 1): return "DogerBlue";
            case (radiusSize <= 9): return "SlateBlue";
            case (radiusSize <= 13): return "Orange";
            case (radiusSize <= 18): return "Violet";
            default: return "Tomato";
        }
    }

    drawChart() {
        const svg = d3.select("body").append("svg")
            .attr("width", this.props.width)
            .attr("height", this.props.height)
            .style("margin-left", 100);

        svg.selectAll("rect").data(this.props.data).enter().append("rect")
            .attr("x", (val, idx) => idx * 70)
            .attr("y", (val, idx) => this.props.height - 10 * val)
            .attr("width", 25)
            .attr("height", (val, idx) => val * 10)
            .attr("fill", "blue");

        svg.selectAll("text").data(this.props.data).enter().append("text")
            .text(val => val)
            .attr("x", (val, idx) => idx * 70 + 5)
            .attr("y", (val, idx) => this.props.height - 10 * val - 3)
    }

    render() { 
        return (
            <React.Fragment>
                <div id="container" className="worldWindow"></div> 
         
            </React.Fragment>
        )        
    }
}
 
export default BarChart;