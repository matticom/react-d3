import React, { Component } from 'react';
import './App.css';

import WorldMap from './WorldMap';
import TestParent from './TestParent';

class App extends Component {

  state = {
    data: [12, 5, 6, 6, 9, 10],
    width: 700,
    height: 500,
    id: 'root'
  }

  render() {
    return (
      <div className="App">
        <TestParent />
        
      </div>
    );
  }
}

// <BarChart data={this.state.data} width={this.state.width} height={this.state.height} id={this.state.id}></BarChart>

export default App;
