import React, { useState } from 'react';
import SymbolButton from './SymbolButton';
import './App.scss';

const baldSound = new Audio(require('./bald.mp3'));

interface IAppState {
  numberEnabled: boolean
}

export default class App extends React.Component <{}, IAppState> {
  constructor (props: {}) {
    super(props);

    this.state = {
      numberEnabled: true
    }
  }

  render () {
    return (
      <div className="App">
        <p> </p>
        <div className="buttons">
          <div>
            <SymbolButton enabled={this.state.numberEnabled} symbol="1" />
            <SymbolButton enabled={this.state.numberEnabled} symbol="2" />
            <SymbolButton enabled={this.state.numberEnabled} symbol="3" />
            <SymbolButton enabled={true} symbol="-" />
          </div>
          <div>
            <SymbolButton enabled={this.state.numberEnabled} symbol="4" />
            <SymbolButton enabled={this.state.numberEnabled} symbol="5" />
            <SymbolButton enabled={this.state.numberEnabled} symbol="6" />
            <SymbolButton enabled={false} symbol="+" />
          </div>
          <div>
            <SymbolButton enabled={this.state.numberEnabled} symbol="7" />
            <SymbolButton enabled={this.state.numberEnabled} symbol="8" />
            <SymbolButton enabled={this.state.numberEnabled} symbol="9" />
            <SymbolButton enabled={false} symbol="×" />
          </div>
          <div>
            <SymbolButton enabled={true} symbol="." />
            <SymbolButton enabled={this.state.numberEnabled} symbol="0" />
            <button onClick={() => baldSound.play() }>👨‍🦲</button>
            <SymbolButton enabled={false} symbol="÷" />
          </div>
          <div>
            <button onClick={ () => this.setState({numberEnabled: !(this.state.numberEnabled)}) }> = </button>
          </div>
        </div>
      </div>
    );
  }
}
