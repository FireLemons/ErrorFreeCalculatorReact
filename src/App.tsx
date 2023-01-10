import React from 'react';
import bluIntel from './blu_intel_pattern.png';
import './App.scss';

const baldSoundPath = require('./bald.mp3');
const baldSound = new Audio(baldSoundPath);

function App() {
  return (
    <div className="App" style={{ backgroundImage: "url(" + bluIntel + ")" }} >
      <p> </p>
      <div className="buttons">
        <div>
          <button>1</button>
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
