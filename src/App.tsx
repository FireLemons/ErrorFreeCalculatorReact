import React, { useState } from 'react';
import SymbolButton from './SymbolButton';
import './App.scss';
import { toUnicode } from 'punycode';

interface IAppState {
  evalEnabled: boolean,
  expression: string,
  isEndingInNegativeNumber: boolean,
  isEndingInDecimalNumber: boolean,
  isErrorState: boolean,
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

const squeakSound = new Audio(require('./assets/squeak.wav'))
squeakSound.volume = 0.2

function evalPostfixExpression(postfixExpression: (IOperator|number)[]): number {
  const numberStack: number[] = []

  for (const token of postfixExpression) {
    if (Number(token) === token) {
      numberStack.push(token)
    } else {
      if (numberStack.length < 2) {
        throw new Error()
      }

      const rightOperand = numberStack.pop()
      const leftOperand = numberStack.pop()

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

  if (Number(computedValue) !== computedValue) {
    throw new Error('Failed to evaluate expression')
  } else {
    return computedValue
  }
}

function getConstantValue (expression: string): number{
  switch(expression) {
    case '∞':
      return Infinity
    case '-∞':
      return -Infinity
    default:
      return parseFloat(expression)
  }
}

function instanceOfOperator(object: any): object is IOperator {
  return 'precedence' in object && 'symbol' in object;
}

function getTokenizedExpression (expression: string): (IOperator|number)[] {
  const expressionAsTokens: (IOperator|number)[] = []
  let numericTokenAssemblySpace = ''

  for (const char of expression) {
    switch (char) {
      case '+':
        expressionAsTokens.unshift(getConstantValue(numericTokenAssemblySpace))
        numericTokenAssemblySpace = ''

        expressionAsTokens.unshift(Operator.Addition)
        break;
      case '×':
        expressionAsTokens.unshift(getConstantValue(numericTokenAssemblySpace))
        numericTokenAssemblySpace = ''

        expressionAsTokens.unshift(Operator.Multiplication)
        break;
      case '÷':
        expressionAsTokens.unshift(getConstantValue(numericTokenAssemblySpace))
        numericTokenAssemblySpace = ''

        expressionAsTokens.unshift(Operator.Division)
        break;
      case '.':
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
      case '∞':
        if (numericTokenAssemblySpace.length && numericTokenAssemblySpace[0] === '-') {
          expressionAsTokens.unshift(getConstantValue(numericTokenAssemblySpace))
          numericTokenAssemblySpace = char

          expressionAsTokens.unshift(Operator.Addition)
        } else {
          numericTokenAssemblySpace = char + numericTokenAssemblySpace
        }
        break;
      case '-':
        if (numericTokenAssemblySpace.length && numericTokenAssemblySpace[0] === '-') {
          expressionAsTokens.unshift(getConstantValue(numericTokenAssemblySpace))
          numericTokenAssemblySpace = ''

          expressionAsTokens.unshift(Operator.Subtraction)
        } else {
          numericTokenAssemblySpace = char + numericTokenAssemblySpace
        }

        break;
      default:
        console.error(new Error(`Unrecognised symbol '${ char }'`))
    }
  }

  expressionAsTokens.unshift(getConstantValue(numericTokenAssemblySpace))

  return expressionAsTokens
}

function postfixExpression (expressionAsTokens: (IOperator|number)[]): (IOperator|number)[] {
  const operatorStack: IOperator[] = []
  const polishTokenList: (IOperator|number)[] = []

  const tokenizedExpression = [...expressionAsTokens]
  let token = tokenizedExpression.shift()

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

    token = tokenizedExpression.shift()
  }

  token = operatorStack.pop()

  while (token !== undefined) {
    polishTokenList.push(token)

    token = operatorStack.pop()
  }

  return polishTokenList
}

function reverseString (str: string): string {
  let strReversed = ""

  for (let i = str.length - 1; i > -1; i--) {
    strReversed += str[i]
  }

  return strReversed
}

export default class App extends React.Component <{}, IAppState> {
  constructor (props: {}) {
    super(props);

    this.state = {
      evalEnabled: false,
      expression: "", // Reversed from logical expression for CSS
      isEndingInNegativeNumber: false,
      isEndingInDecimalNumber: false,
      isErrorState: false,
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
    let numberEnabled = this.state.numberEnabled

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

        numberEnabled = true

        break;
      case '+':
      case '×':
      case '÷':
        isEndingInDecimalNumber = false
        isEndingInNegativeNumber = false
        numberEnabled = true
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
      numberEnabled: numberEnabled,
      operatorEnabled: isEndingInNumber
    })
  }

  public delete = () => {
    if (!(this.state.expression) || this.state.isErrorState) {
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
    const postfixExpressionTemp: (IOperator|number)[] = postfixExpression(tokenizedExpression)

    try{
      const evaluationResult = evalPostfixExpression(postfixExpressionTemp)
      let evauluationResultString = '' + evaluationResult

      if (evaluationResult === Infinity) {
        evauluationResultString = '∞'
      } else if (evaluationResult === -Infinity) {
        evauluationResultString = '-∞'
      }

      this.setState({
        evalEnabled: true,
        expression: (reverseString(evauluationResultString + '')),
        isEndingInNegativeNumber: evaluationResult < 0,
        isEndingInDecimalNumber: !(Number.isInteger(evaluationResult)) && evaluationResult === Infinity || evaluationResult === -Infinity,
        isErrorState: false,
        minusEnabled: true,
        numberEnabled: evaluationResult !== Infinity && evaluationResult !== -Infinity,
        operatorEnabled: true
      })
    } catch (e) {
      console.error(e)

      this.showError()
    }
  }

  public reset = () => {
    this.setState({
      evalEnabled: false,
      expression: "",
      isEndingInNegativeNumber: false,
      isEndingInDecimalNumber: false,
      isErrorState: false,
      minusEnabled: true,
      numberEnabled: true,
      operatorEnabled: false
    })
  }

  public showError = () => {
    this.setState({
      expression: 'rrorE',
      isErrorState: true
    })
  }

  render () {
    return (
      <div className="App">
        <div><p> { this.state.expression } </p></div>
        <div className="buttons">
          <div>
            <SymbolButton enabled={this.state.numberEnabled && !(this.state.isErrorState)} onClick={this.addToExpression} symbol="1" />
            <SymbolButton enabled={this.state.numberEnabled && !(this.state.isErrorState)} onClick={this.addToExpression} symbol="2" />
            <SymbolButton enabled={this.state.numberEnabled && !(this.state.isErrorState)} onClick={this.addToExpression} symbol="3" />
            <SymbolButton enabled={this.state.operatorEnabled && !(this.state.isErrorState)} onClick={this.addToExpression} symbol="+" />
          </div>
          <div>
            <SymbolButton enabled={this.state.numberEnabled && !(this.state.isErrorState)} onClick={this.addToExpression} symbol="4" />
            <SymbolButton enabled={this.state.numberEnabled && !(this.state.isErrorState)} onClick={this.addToExpression} symbol="5" />
            <SymbolButton enabled={this.state.numberEnabled && !(this.state.isErrorState)} onClick={this.addToExpression} symbol="6" />
            <SymbolButton enabled={this.state.minusEnabled && !(this.state.isErrorState)} onClick={this.addToExpression} symbol="-" />
          </div>
          <div>
            <SymbolButton enabled={this.state.numberEnabled && !(this.state.isErrorState)} onClick={this.addToExpression} symbol="7" />
            <SymbolButton enabled={this.state.numberEnabled && !(this.state.isErrorState)} onClick={this.addToExpression} symbol="8" />
            <SymbolButton enabled={this.state.numberEnabled && !(this.state.isErrorState)} onClick={this.addToExpression} symbol="9" />
            <SymbolButton enabled={this.state.operatorEnabled && !(this.state.isErrorState)} onClick={this.addToExpression} symbol="×" />
          </div>
          <div>
            <SymbolButton enabled={!(this.state.isEndingInDecimalNumber || this.state.isErrorState)} onClick={this.addToExpression} symbol="." />
            <SymbolButton enabled={this.state.numberEnabled && !(this.state.isErrorState)} onClick={this.addToExpression} symbol="0" />
            <button id="fun" onClick={() => squeakSound.play() }></button>
            <SymbolButton enabled={this.state.operatorEnabled && !(this.state.isErrorState)} onClick={this.addToExpression} symbol="÷" />
          </div>
          <div>
            <button onClick={this.delete}>del</button>
            <button onClick={this.reset} >clear</button>
          </div>
          <div>
            <button disabled={!(this.state.evalEnabled) || this.state.isErrorState} onClick={this.evalExpression}> = </button>
          </div>
        </div>
      </div>
    );
  }
}
