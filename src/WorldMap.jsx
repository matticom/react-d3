import React, { Component } from 'react';
import * as d3 from "d3";
import ResponseParser from "./ResponseParser"
import * as topojson from "topojson-client";
import DataCircle from './DataCircle';
import Country from './Country';
import Legend from './Legend';

// https://github.com/lukes/ISO-3166-Countries-with-Regional-Codes/blob/master/slim-2/slim-2.json

class WorldMap extends Component {
    
    state = {
        cities: [],
        worldData: [],
        height: 8
    }

    constructor() {
        super();
        // http://techslides.com/list-of-countries-and-capitals
        // this.state.cities = require('./data/country-capitals.json');
        this.state.cities = [
            { name: "Tokyo", coordinates: [139.6917,35.6895], population: 37843000 },
            { name: "Jakarta", coordinates: [106.8650,-6.1751], population: 30539000 },
            { name: "Delhi", coordinates: [77.1025,28.7041], population: 24998000 },
            { name: "Manila", coordinates: [120.9842,14.5995], population: 24123000 },
            { name: "Seoul", coordinates: [126.9780,37.5665], population: 23480000 },
            { name: "Shanghai", coordinates: [121.4737,31.2304], population: 23416000 },
            { name: "Karachi", coordinates: [67.0099,24.8615], population: 22123000 },
            { name: "Beijing", coordinates: [116.4074,39.9042], population: 21009000 },
            { name: "New York", coordinates: [-74.0059,40.7128], population: 20630000 },
            { name: "Guangzhou", coordinates: [113.2644,23.1291], population: 20597000 },
            { name: "Sao Paulo", coordinates: [-46.6333,-23.5505], population: 20365000 },
            { name: "Mexico City", coordinates: [-99.1332,19.4326], population: 20063000 },
            { name: "Mumbai", coordinates: [72.8777,19.0760], population: 17712000 },
            { name: "Osaka", coordinates: [135.5022,34.6937], population: 17444000 },
            { name: "Moscow", coordinates: [37.6173,55.7558], population: 16170000 },
            { name: "Dhaka", coordinates: [90.4125,23.8103], population: 15669000 },
            { name: "Greater Cairo", coordinates: [31.2357,30.0444], population: 15600000 },
            { name: "Los Angeles", coordinates: [-118.2437,34.0522], population: 15058000 },
            { name: "Bangkok", coordinates: [100.5018,13.7563], population: 14998000 },
            { name: "Kolkata", coordinates: [88.3639,22.5726], population: 14667000 },
            { name: "Buenos Aires", coordinates: [-58.3816,-34.6037], population: 14122000 },
            { name: "Tehran", coordinates: [51.3890,35.6892], population: 13532000 },
            { name: "Istanbul", coordinates: [28.9784,41.0082], population: 13287000 },
            { name: "Lagos", coordinates: [3.3792,6.5244], population: 13123000 },
            { name: "Shenzhen", coordinates: [114.0579,22.5431], population: 12084000 },
            { name: "Rio de Janeiro", coordinates: [-43.1729,-22.9068], population: 11727000 },
            { name: "Kinshasa", coordinates: [15.2663,-4.4419], population: 11587000 },
            { name: "Tianjin", coordinates: [117.3616,39.3434], population: 10920000 },
            { name: "Paris", coordinates: [2.3522,48.8566], population: 10858000 },
            { name: "Lima", coordinates: [-77.0428,-12.0464], population: 10750000 },
          ];
        
        this.state.mapWidth = 500;
        this.state.mapHeight = this.state.mapWidth * 0.665;
        this.state.radius = 3 + this.state.mapWidth / 300;
        this.state.strokeWidth = 0.5 + this.state.mapWidth / 1200;

        //this.state.testData = require('./data/test_GER.json');
        this.state.testData = require('./data/test.json');
        this.state.rawWorldData = require('./data/110m.json');
        this.state.countryCodes = require('./data/slim-2.json');
        this.state.worldData = topojson.feature(this.state.rawWorldData, this.state.rawWorldData.objects.countries).features;
        this.state.playouts = ResponseParser.parsePlayouts(this.state.testData);
        this.state.ingests = ResponseParser.parseIngests(this.state.testData);
        this.state.heatestValue = this.findMaxHeatingValue(this.state.playouts);
        this.state.countriesWithKibanaData = this.filterCountriesWithKibanaData(this.state.playouts);
        this.state.deselected = false;
        this.state.resorted = false;
        this.state.projection = this.projection();
 
        this.state.legendHeight = 140;
        this.state.legendWidth = 85;
        console.log("heatest value", this.state.heatestValue);
    }
    
    componentDidUpdate(prevProps, prevState) {
        // this.state.worldData.forEach((d, i) => {
        //     console.log("d:", d);
        //     console.log("i:", i);                            
        // });
    }

    projection() {
        return d3.geoMercator()
        .translate([this.state.mapWidth / 2, this.state.mapHeight / 1.42])
        .scale(this.state.mapWidth / 6.3);
    }
   
    getCountryCenter(d) {  
        const path = d3.geoPath();
        path.projection(this.projection());   
        const bounds = path.bounds(d);
        return {          
            x: (bounds[0][0] + bounds[1][0]) / 2,
            y: (bounds[0][1] + bounds[1][1]) / 2,
        } 
    }
    
    getCountryDescription(cc) {
        const country = this.state.countryCodes.find(country => country['country-code'] === cc);
        return (country) ? country : { name: 'unknown', 'alpha-2': '-', 'country-code': cc};     
    }

    getKibanaDataWithAlphaCode(alphaCode) {
        return this.state.playouts.find(el => el.country === alphaCode);
    }    

    findMaxHeatingValue(res) {
        return Math.max.apply(Math, res.map(country => country.count));
    }

    getHeatMapColors(input) {        
        const value = input * 1.0 / this.state.heatestValue;
        const h = (1 - value) * 60;      
        return { h: Math.round(h * 100) / 100, s: 100, l: 35 }
    }

    filterCountriesWithKibanaData(data) {
        const countriesWithData = [];
        const alphaCodes = this.getCountryAlphaCodesFromKibanaData(data);
        const numericCodes = this.convertAlphaCodesToNumericCodes(alphaCodes);
        numericCodes.forEach(code => {
            const country = {...this.state.worldData.find(d => d.id === code.num)};
            country.alpha = code.alpha;
            countriesWithData.push(country);
        });
        return countriesWithData;
    }

    getCountryAlphaCodesFromKibanaData(data) {
        const alphaCodes = [];
        data.forEach(el => alphaCodes.push(el.country));
        return alphaCodes;
    }

    convertAlphaCodesToNumericCodes(alphaCodes) {
        const numericCodes = [];
        alphaCodes.forEach(ac => {
            const countryObj = this.state.countryCodes.find(country => country['alpha-2'] === ac);
            numericCodes.push({num: countryObj['country-code'], alpha: ac});
        });
        return numericCodes;
    }        

    handleSetPreviousCircle = (previousCircle) => {
        this.setState({previousCircle});
    }  

    handleDeselectClick = (e) => {
        if (e.target.tagName !== 'circle' && this.state.previousCircle)           
            this.setState({deselected: true});
    }

    handleHasBeenDeselected = () => {
        this.setState({deselected: false, previousCircle: undefined});
    }

    handleResorting = (idx) => {      
        const countriesWithKibana = [...this.state.countriesWithKibanaData];
        this.setState({countriesWithKibanaData: undefined});
        const elementToBeOnTop = countriesWithKibana.splice(idx, 1)[0];
        countriesWithKibana.push(elementToBeOnTop);
        this.setState({countriesWithKibanaData: countriesWithKibana, resorted: true});
    }
    
    handleHasBeenResorted = () => {
        this.setState({resorted: false});
    }


    render() { 
        console.log("kibana", this.state.countriesWithKibanaData)
        return (            
            <React.Fragment>
                <svg
                    width={this.state.mapWidth}
                    height={this.state.mapHeight}
                    viewBox={`0 0 ${this.state.mapWidth} ${this.state.mapHeight}`}
                    onClick={e => {
                        this.handleDeselectClick(e);
                    }}
                    className="showBorder"
                >
                    <g>
                        {this.state.worldData.map((d, i) => (
                            <Country
                                key={`country-${i}`}
                                d={d}
                                idx={i}
                                projection={this.state.projection}
                                countryDesc={this.getCountryDescription(d.id)}
                            />
                        ))}
                    </g>

                    <g>
                        {this.state.countriesWithKibanaData.map(
                            (country, i) => (
                                <DataCircle
                                    key={`${this.getCountryDescription(country.id).name}`}
                                    
                                    position={this.getCountryCenter(country)}
                                    description={this.getCountryDescription(country.id)}
                                    data={this.getKibanaDataWithAlphaCode(country.alpha)}

                                    radius={this.state.radius}
                                    strokeWidth={this.state.strokeWidth}
                                    maxHeatValue={this.state.heatestValue}
                                    idx={i}
                                    lastElementIdx={this.state.countriesWithKibanaData.length - 1}
                                    
                                    previousCircle={this.state.previousCircle}
                                    onSetPreviousCircle={this.handleSetPreviousCircle}
                                    deselected={this.state.deselected}
                                    onHasBeenDeselected={this.handleHasBeenDeselected}
                                    resorted={this.state.resorted}
                                    onResortElements={this.handleResorting}
                                    onHasBeenResorted={this.handleHasBeenResorted}
                                />
                            )
                        )}
                    </g>
                    <Legend
                        position={{x: 10, y: this.state.mapHeight - (10 + this.state.legendHeight)}}
                        height={this.state.legendHeight}
                        width={this.state.legendWidth}
                        maxHeatValue={this.state.heatestValue}
                    />
                </svg>
            </React.Fragment>
        );        
    }
}
 
export default WorldMap;