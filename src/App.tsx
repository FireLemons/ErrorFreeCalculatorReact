import React, { useState } from 'react';
import SymbolButton from './SymbolButton';
import './App.scss';

const baldSound = new Audio(require('./bald.mp3'));

interface IAppState {
  expression: string,
  numberEnabled: boolean
}

export default class App extends React.Component <{}, IAppState> {
  constructor (props: {}) {
    super(props);

    this.state = {
      expression: "",
      numberEnabled: true
    }
  }

  public addToExpression = (char: string) => {
    this.setState({
      expression: this.state.expression + char
    })
  }

  render () {
    return (
      <div className="App">
        <p> { this.state.expression } </p>
        <div className="buttons">
          <div>
            <SymbolButton enabled={this.state.numberEnabled} onClick={this.addToExpression} symbol="1" />
            <SymbolButton enabled={this.state.numberEnabled} onClick={this.addToExpression} symbol="2" />
            <SymbolButton enabled={this.state.numberEnabled} onClick={this.addToExpression} symbol="3" />
            <SymbolButton enabled={true} onClick={this.addToExpression} symbol="-" />
          </div>
          <div>
            <SymbolButton enabled={this.state.numberEnabled} onClick={this.addToExpression} symbol="4" />
            <SymbolButton enabled={this.state.numberEnabled} onClick={this.addToExpression} symbol="5" />
            <SymbolButton enabled={this.state.numberEnabled} onClick={this.addToExpression} symbol="6" />
            <SymbolButton enabled={false} onClick={this.addToExpression} symbol="+" />
          </div>
          <div>
            <SymbolButton enabled={this.state.numberEnabled} onClick={this.addToExpression} symbol="7" />
            <SymbolButton enabled={this.state.numberEnabled} onClick={this.addToExpression} symbol="8" />
            <SymbolButton enabled={this.state.numberEnabled} onClick={this.addToExpression} symbol="9" />
            <SymbolButton enabled={false} onClick={this.addToExpression} symbol="×" />
          </div>
          <div>
            <SymbolButton enabled={true} onClick={this.addToExpression} symbol="." />
            <SymbolButton enabled={this.state.numberEnabled} onClick={this.addToExpression} symbol="0" />
            <button onClick={() => baldSound.play() }>👨‍🦲</button>
            <SymbolButton enabled={false} onClick={this.addToExpression} symbol="÷" />
          </div>
          <div>
            <button onClick={ () => this.setState({numberEnabled: !(this.state.numberEnabled)}) }> = </button>
          </div>
        </div>
      </div>
    );
  }
}
