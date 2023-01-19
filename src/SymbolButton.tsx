import React, { useState } from 'react';

export interface ISymbolButtonProps {
  enabled: boolean,
  onClick: Function,
  symbol: string
}

export default class SymbolButton extends React.Component<ISymbolButtonProps, {}> {
  constructor(props: ISymbolButtonProps) {
    super(props);
  }

  public render() {
    return <button disabled={!(this.props.enabled)} onClick={ () => { this.props.onClick(this.props.symbol) } } >{this.props.symbol}</button>
  }
}
