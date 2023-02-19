import React, { useState } from 'react';
import SymbolButton from './SymbolButton';
import './App.scss';
import { toUnicode } from 'punycode';

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

function evalPostfixExpression(postfixExpression: (IOperator|number)[]): number {
  const numberStack: number[] = []

  for (const token of postfixExpression) {
    if (Number(token) === token) {
      numberStack.push(token)
    } else {
      if (numberStack.length < 2) {
        throw new Error()
      }

      const leftOperand = numberStack.pop()
      const rightOperand = numberStack.pop()

      if (leftOperand === undefined) {
        throw new RangeError('left operand is not a number')
      }

      if (rightOperand === undefined) {
        throw new RangeError('right operand is not a number')
      }

      switch (token) {
        case Operator.Addition:
          numberStack.push(leftOperand + rightOperand)
          break;
        case Operator.Subtraction:
          numberStack.push(leftOperand - rightOperand)
          break;
        case Operator.Multiplication:
          numberStack.push(leftOperand * rightOperand)
          break;
        case Operator.Division:
          numberStack.push(leftOperand / rightOperand)
          break;
        default:
          throw new RangeError('unsupported operator')
      }
    }
  }

  const computedValue = numberStack.pop()

  console.log(numberStack)
  console.log(computedValue)

  if (Number(computedValue) !== computedValue) {
    throw new Error('Failed to evaluate expression')
  } else {
    return computedValue
  }
}

function instanceOfOperator(object: any): object is IOperator {
  return 'precedence' in object && 'symbol' in object;
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

function postfixExpression (expressionAsTokens: (IOperator|number)[]): (IOperator|number)[] {
  const operatorStack: IOperator[] = []
  const polishTokenList: (IOperator|number)[] = []

  let token = expressionAsTokens.shift()

  while (token !== undefined) {
    if (Number(token) === token) {
      polishTokenList.push(token)
    } else if (instanceOfOperator(token)) {
      while (operatorStack.length && operatorStack[operatorStack.length - 1].precedence >= token.precedence) {
        const topValue = operatorStack.pop()

        if (topValue !== undefined) {
          polishTokenList.push(topValue)
        }
      }

      operatorStack.push(token)
    }

    token = expressionAsTokens.shift()
  }

  token = operatorStack.pop()

  while (token !== undefined) {
    polishTokenList.push(token)

    token = operatorStack.pop()
  }

  return polishTokenList
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

  public delete = () => {
    if (!(this.state.expression)) {
      return
    }

    const expression = this.state.expression
    const truncatedExpression = expression.substring(1)

    if (!truncatedExpression) {
      this.reset()
      return
    }

    let evalEnabled = this.state.evalEnabled
    let isEndingInDecimalNumber = this.state.isEndingInDecimalNumber
    let minusEnabled = this.state.minusEnabled
    let operatorEnabled = this.state.operatorEnabled

    switch (truncatedExpression[0]) {
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
        isEndingInDecimalNumber = false
        evalEnabled = true
        minusEnabled = true
        operatorEnabled = true

        let i = 1

        while (i < truncatedExpression.length && truncatedExpression[i] !== '+' && truncatedExpression[i] !== '×' && truncatedExpression[i] !== '÷' && truncatedExpression[i] !== '-') {
          if (truncatedExpression[i] === '.') {
            isEndingInDecimalNumber = true
          }

          i++
        }
        break;
      case '+':
      case '×':
      case '÷':
        evalEnabled = false
        isEndingInDecimalNumber = false
        minusEnabled = true
        operatorEnabled = false
        break;
      case '-':
        evalEnabled = false
        isEndingInDecimalNumber = false
        minusEnabled = truncatedExpression.length > 1 && truncatedExpression[1] !== '-' ? true : false
        operatorEnabled = false
        break;
      case '.':
        evalEnabled = false
        isEndingInDecimalNumber = true
        minusEnabled = false
        operatorEnabled = false
        break;
      default:
        console.error(new Error(`Unrecognised symbol '${ truncatedExpression[0] }'`))
    }

    this.setState({
      evalEnabled: evalEnabled,
      expression: truncatedExpression,
      isEndingInDecimalNumber: isEndingInDecimalNumber,
      minusEnabled: minusEnabled,
      operatorEnabled: operatorEnabled
    })
  }

  public evalExpression = () => {
    let tokenizedExpression = getTokenizedExpression(this.state.expression)
    console.log('Expression As Tokens:', tokenizedExpression)
    const postfixExpressionTemp: (IOperator|number)[] = postfixExpression(tokenizedExpression)
    console.log('Expression As Polish:', postfixExpressionTemp)
    console.log('Result:', evalPostfixExpression(postfixExpressionTemp))
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
            <button onClick={this.delete}>del</button>
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
