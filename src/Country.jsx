import React, { Component } from 'react';
import * as d3 from "d3";

class Country extends Component {

    getPath (d) {
        const path = d3.geoPath();
        path.projection(this.props.projection);      
        return path(d);        
    }

    render() { 
        const { countryDesc, d, idx } = this.props;
        return (
            <path
                key={`path-${idx}`}
                d={this.getPath(d)}
                className={`country ${countryDesc['alpha-2']}`}
                fill={'rgba(38,50,56,0.3)'}
                stroke="#FFFFFF"
                strokeWidth={0.5}
                countrycode={countryDesc['country-code']}
            />
        );
    }
}
 
export default Country;