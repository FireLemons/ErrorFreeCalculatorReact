import React, { useState } from 'react';
import SymbolButton from './SymbolButton';
import './App.scss';

const baldSound = new Audio('./bald.mp3');

let numberEnabled = true;

function App() {
  return (
    <div className="App">
      <p> </p>
      <div className="buttons">
        <div>
          <SymbolButton enabled={false} symbol="1" />
          <button>2</button>
          <button>3</button>
          <button>-</button>
        </div>
        <div>
          <button>4</button>
          <button>5</button>
          <button>6</button>
          <button>+</button>
        </div>
        <div>
          <button>7</button>
          <button>8</button>
          <button>9</button>
          <button>×</button>
        </div>
        <div>
          <button>.</button>
          <button>0</button>
          <button onClick={() => baldSound.play() }>👨‍🦲</button>
          <button>÷</button>
        </div>
        <div>
          <button> = </button>
        </div>
      </div>
    </div>
  );
}

export default App;
