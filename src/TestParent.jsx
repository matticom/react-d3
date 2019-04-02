import React, { Component } from 'react';
import WorldMap from './WorldMap';
import ContainerDimensions from 'react-container-dimensions'

class TestParent extends Component {

    constructor(props) {
        super(props);
        this.parentRef = React.createRef();
    }     

    state = { 

     }

    componentDidMount() {
        const txtBB = this.parentRef.current.getBoundingClientRect().width;
        this.setState({width: txtBB.width, height: txtBB.height});        
    }

    render() { 
        return ( 
            <div className="testParent"
                ref={this.parentRef}> 
                
                <ContainerDimensions>     
                <WorldMap 
                />
                </ContainerDimensions>
            </div>
         );
    }
}
 
export default TestParent;