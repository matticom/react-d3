import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import BarChart from './BarChart';

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
        <BarChart data={this.state.data} width={this.state.width} height={this.state.height} id={this.state.id}></BarChart>
      </div>
    );
  }
}

export default App;