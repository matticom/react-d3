import React, { Component } from 'react';
import * as d3 from "d3";
import ResponseParser from "./ResponseParser"
import * as topojson from "topojson-client";
import DataCircle from './DataCircle';

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
        this.state.testData = require('./data/test.json');
        this.state.rawWorldData = require('./data/110m.json');
        this.state.countryCodes = require('./data/slim-2.json');
        this.state.worldData = topojson.feature(this.state.rawWorldData, this.state.rawWorldData.objects.countries).features;
        this.state.playouts = ResponseParser.parsePlayouts(this.state.testData);
        this.state.ingests = ResponseParser.parseIngests(this.state.testData);
        this.state.heatestValue = this.findMaxHeatingValue(this.state.playouts);
        this.state.countriesWithKibanaData = this.filterCountriesWithKibanaData(this.state.playouts);
        this.state.deselected = false;
        console.log("heatest value", this.state.heatestValue);
    }
    
    componentDidMount() {
     
    }

    componentDidUpdate(prevProps, prevState) {
        // this.state.worldData.forEach((d, i) => {
        //     console.log("d:", d);
        //     console.log("i:", i);                            
        // });
    }

    projection() {
        return d3.geoMercator()
        .translate([1200 / 2, 800 / 2 + 160]) // always in [East Latitude, North Longitude]
        .scale(190);
    }
   
    handleSetPreviousCircle = (previousCircle) => {
        this.setState({previousCircle});
    }

    handleCountryClick = (countryIndex, name) => {
        console.log("Clicked on a country: ", this.state.worldData[countryIndex])
        console.log("Clicked on a country short name: ", name)
    }    
    
    getPath (d, idx) {
        const path = d3.geoPath();
        // console.log("bounds", path.bounds(d));
        path.projection(this.projection()); 
        // console.log("index", this.state.worldData[idx]);        
        return path(d);        
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
        //console.log("cc", country);
        return (country) ? country : { name: 'unknown', 'alpha-2': '-', 'country-code': cc};     
    }

    getKibanaDataWithAlphaCode(alphaCode) {
        return this.state.playouts.find(el => el.country === alphaCode);
    }



    getPathTag(d, i) {
        const countryDesc = this.getCountryDescription(d.id);
        return (
            <path
                key={`path-${i}`}
                d={this.getPath(d, i)}
                className={`country ${countryDesc['alpha-2']}`}
                fill={'rgba(38,50,56,0.5)'}
                stroke="#FFFFFF"
                strokeWidth={0.5}
                countrycode={countryDesc['country-code']}
                onClick={() => this.handleCountryClick(i, countryDesc['alpha-2'])}
            />
        );
    }

    findMaxHeatingValue(res) {
        return Math.max.apply(Math, res.map(country => country.count));
    }

    getHeatMapColors(input) {        
        const value = input * 1.0 / this.state.heatestValue;
        const h = (1 - value) * 60;      
        return { h: Math.round(h * 100) / 100, s: 100, l: 35 }
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


    getFillHslColor(countryDesc) {
        const shortname = countryDesc['alpha-2'];

        if (this.state.playouts.findIndex(el => el.country === shortname) === -1) 
            return 'rgba(38,50,56,0.5)';
            
        const country = this.state.playouts.find(el => el.country === shortname);
        const hslColor = this.getHeatMapColors(country.count);
        return `hsl(${hslColor.h}, ${hslColor.s}%, ${hslColor.l}%)`
    }

    handleDeselectClick = (e) => {
        console.log("iiii",e.target)
        if (!(e.target.tagName === 'circle')) {
            console.log("the same", e.target.tagName);
            this.setState({deselected: true});
        } 
    }

    handlehasBeenDeselected = () => {
        this.setState({deselected: false});
    }

    render() { 
        console.log(this.state.countriesWithKibanaData)
        return (            
            <React.Fragment>                
                <svg width={1200} height={800} viewBox="0 0 1200 800" onClick={(e) => {this.handleDeselectClick(e)}}>
                    <g className="countries">
                        {this.state.worldData.map((d, i) => this.getPathTag(d, i))}
                    </g>
                    <g className="markers">
                        {
                            this.state.countriesWithKibanaData.map((country, i) => (
                                <DataCircle 
                                    key={`dataCircle-${i}`} 
                                    previousCircle={this.state.previousCircle}
                                    position={this.getCountryCenter(country)}
                                    description = {this.getCountryDescription(country.id)}
                                    data={this.getKibanaDataWithAlphaCode(country.alpha)} 
                                    idx={i} 
                                    maxHeatColor={this.state.heatestValue}
                                    projection={this.projection}
                                    onSetPreviousCircle={this.handleSetPreviousCircle}
                                    deselected={this.state.deselected}
                                    onHasBeenDeselected={this.handlehasBeenDeselected}
                                    >
                                </DataCircle>
                            ))
                        }
                    </g>

                </svg>
            </React.Fragment>
        )        
    }
}
 
export default WorldMap;