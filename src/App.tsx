import React, { useState } from 'react';
import SymbolButton from './SymbolButton';
import './App.scss';

interface IAppState {
  evalEnabled: boolean,
  expression: string,
  isEndingInNegativeNumber: boolean,
  isEndingInDecimalNumber: boolean,
  minusEnabled: boolean,
  numberEnabled: boolean,
  operatorEnabled: boolean
}

interface IOperator {
  precedence: number,
  symbol: string
}

interface IOperatorContainer {
  [index: string]: IOperator;
}

const Operator: IOperatorContainer = {
  Addition: {
    precedence: 0,
    symbol: '+'
  },
  Subtraction: {
    precedence: 0,
    symbol: '-'
  },
  Multiplication: {
    precedence: 1,
    symbol: '×'
  },
  Division: {
    precedence: 1,
    symbol: '÷'
  }
}

const baldSound = new Audio(require('./bald.mp3'))
baldSound.volume = 0.2

function shuntingYardExpression (expressionAsTokens: (IOperator|number)[]): (IOperator|number)[] {
  const operatorStack: IOperator[] = []
  const polishTokenList: (IOperator|number)[] = []

  let token = expressionAsTokens.shift()

  while (token !== undefined) {
    if (Number(token) === token) {
      polishTokenList.push(token)
    } else if (token) {

    }

    token = expressionAsTokens.shift()
  }
  /*
  while there are tokens to be read:
    read a token
    if the token is:
    - a number:
        put it into the output queue
    - an operator o1:
        while (
            there is an operator o2 at the top of the operator stack which is not a left parenthesis, 
            and (o2 has greater precedence than o1 or (o1 and o2 have the same precedence and o1 is left-associative))
        ):
            pop o2 from the operator stack into the output queue
        push o1 onto the operator stack
    - a left parenthesis (i.e. "("):
        push it onto the operator stack
    - a right parenthesis (i.e. ")"):
        while the operator at the top of the operator stack is not a left parenthesis:
            {assert the operator stack is not empty}
            pop the operator from the operator stack into the output queue
        {assert there is a left parenthesis at the top of the operator stack}
        pop the left parenthesis from the operator stack and discard it
        if there is a function token at the top of the operator stack, then:
            pop the function from the operator stack into the output queue
while there are tokens on the operator stack:
    {assert the operator on top of the stack is not a (left) parenthesis}
    pop the operator from the operator stack onto the output queue
    */

  return polishTokenList
}

function getTokenizedExpression (expression: string): (IOperator|number)[] {
  const expressionAsTokens: (IOperator|number)[] = []
  let numericTokenAssemblySpace = ''
  let tokenIsFloat = false

  for (const char of expression) {
    switch (char) {
      case '+':
        expressionAsTokens.unshift(tokenIsFloat ? parseFloat(numericTokenAssemblySpace) : parseInt(numericTokenAssemblySpace))
        numericTokenAssemblySpace = ''
        tokenIsFloat = false

        expressionAsTokens.unshift(Operator.Addition)
        break;
      case '×':
        expressionAsTokens.unshift(tokenIsFloat ? parseFloat(numericTokenAssemblySpace) : parseInt(numericTokenAssemblySpace))
        numericTokenAssemblySpace = ''
        tokenIsFloat = false

        expressionAsTokens.unshift(Operator.Multiplication)
        break;
      case '÷':
        expressionAsTokens.unshift(tokenIsFloat ? parseFloat(numericTokenAssemblySpace) : parseInt(numericTokenAssemblySpace))
        numericTokenAssemblySpace = ''
        tokenIsFloat = false

        expressionAsTokens.unshift(Operator.Division)
        break;
      case '.':
        tokenIsFloat = true
        numericTokenAssemblySpace = char + numericTokenAssemblySpace
        break;
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        if (numericTokenAssemblySpace.length && numericTokenAssemblySpace[0] === '-') {
          expressionAsTokens.unshift(tokenIsFloat ? parseFloat(numericTokenAssemblySpace) : parseInt(numericTokenAssemblySpace))
          numericTokenAssemblySpace = char
          tokenIsFloat = false

          expressionAsTokens.unshift(Operator.Addition)
        } else {
          numericTokenAssemblySpace = char + numericTokenAssemblySpace
        }
        break;
      case '-':
        if (numericTokenAssemblySpace.length && numericTokenAssemblySpace[0] === '-') {
          expressionAsTokens.unshift(tokenIsFloat ? parseFloat(numericTokenAssemblySpace) : parseInt(numericTokenAssemblySpace))
          numericTokenAssemblySpace = ''
          tokenIsFloat = false

          expressionAsTokens.unshift(Operator.Subtraction)
        } else {
          numericTokenAssemblySpace = char + numericTokenAssemblySpace
        }

        break;
      default:
        console.error(new Error(`Unrecognised symbol '${ char }'`))
    }
  }

  expressionAsTokens.unshift(tokenIsFloat ? parseFloat(numericTokenAssemblySpace) : parseInt(numericTokenAssemblySpace))

  return expressionAsTokens
}

export default class App extends React.Component <{}, IAppState> {
  constructor (props: {}) {
    super(props);

    this.state = {
      evalEnabled: false,
      expression: "", // Reversed from logical expression for CSS
      isEndingInNegativeNumber: false,
      isEndingInDecimalNumber: false,
      minusEnabled: true,
      numberEnabled: true,
      operatorEnabled: false
    }
  }

  public addToExpression = (char: string) => {
    let isEndingInNumber = false
    let isEndingInDecimalNumber = this.state.isEndingInDecimalNumber
    let isEndingInNegativeNumber = this.state.isEndingInNegativeNumber
    let minusEnabled = true

    switch (char) {
      case '-':
        if (!(this.state.operatorEnabled)) {
          isEndingInNegativeNumber = true
        } else {
          isEndingInDecimalNumber = false
          isEndingInNegativeNumber = false
        }

        if (isEndingInNegativeNumber) {
          minusEnabled = false
        }

        break;
      case '+':
      case '×':
      case '÷':
        isEndingInDecimalNumber = false
        isEndingInNegativeNumber = false
        break;
      case '.':
        minusEnabled = false
        isEndingInDecimalNumber = true
        break;
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        isEndingInNumber = true
        break;
      default:
        console.error(new Error(`Unrecognised symbol '${ char }'`))
    }

    this.setState({
      evalEnabled: isEndingInNumber,
      expression: char + this.state.expression,
      isEndingInDecimalNumber: isEndingInDecimalNumber,
      minusEnabled: minusEnabled,
      operatorEnabled: isEndingInNumber
    })
  }

  public evalExpression = () => {
    console.log(getTokenizedExpression(this.state.expression))
  }

  public reset = () => {
    this.setState({
      evalEnabled: false,
      expression: "",
      isEndingInNegativeNumber: false,
      isEndingInDecimalNumber: false,
      minusEnabled: true,
      numberEnabled: true,
      operatorEnabled: false
    })
  }

  render () {
    return (
      <div className="App">
        <div><p> { this.state.expression } </p></div>
        <div className="buttons">
          <div>
            <SymbolButton enabled={this.state.numberEnabled} onClick={this.addToExpression} symbol="1" />
            <SymbolButton enabled={this.state.numberEnabled} onClick={this.addToExpression} symbol="2" />
            <SymbolButton enabled={this.state.numberEnabled} onClick={this.addToExpression} symbol="3" />
            <SymbolButton enabled={this.state.operatorEnabled} onClick={this.addToExpression} symbol="+" />
          </div>
          <div>
            <SymbolButton enabled={this.state.numberEnabled} onClick={this.addToExpression} symbol="4" />
            <SymbolButton enabled={this.state.numberEnabled} onClick={this.addToExpression} symbol="5" />
            <SymbolButton enabled={this.state.numberEnabled} onClick={this.addToExpression} symbol="6" />
            <SymbolButton enabled={this.state.minusEnabled} onClick={this.addToExpression} symbol="-" />
          </div>
          <div>
            <SymbolButton enabled={this.state.numberEnabled} onClick={this.addToExpression} symbol="7" />
            <SymbolButton enabled={this.state.numberEnabled} onClick={this.addToExpression} symbol="8" />
            <SymbolButton enabled={this.state.numberEnabled} onClick={this.addToExpression} symbol="9" />
            <SymbolButton enabled={this.state.operatorEnabled} onClick={this.addToExpression} symbol="×" />
          </div>
          <div>
            <SymbolButton enabled={!(this.state.isEndingInDecimalNumber)} onClick={this.addToExpression} symbol="." />
            <SymbolButton enabled={this.state.numberEnabled} onClick={this.addToExpression} symbol="0" />
            <button onClick={() => baldSound.play() }>👨‍🦲</button>
            <SymbolButton enabled={this.state.operatorEnabled} onClick={this.addToExpression} symbol="÷" />
          </div>
          <div>
            <button>del</button>
            <button onClick={this.reset} >clear</button>
          </div>
          <div>
            <button disabled={!(this.state.evalEnabled)} onClick={this.evalExpression}> = </button>
          </div>
        </div>
      </div>
    );
  }
}
