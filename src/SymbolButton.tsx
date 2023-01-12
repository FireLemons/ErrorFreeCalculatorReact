import React, { useState } from 'react';

export interface ISymbolButtonProps {
  enabled: boolean,
  symbol: string
}

export interface ISymbolButtonState {
  enabled: boolean
}

export default class SymbolButton extends React.Component<ISymbolButtonProps, ISymbolButtonState> {
  constructor(props: ISymbolButtonProps) {
    super(props);
    this.state = {
      enabled: props.enabled,
    };
  }

  public render() {
    return <button disabled={!(this.state.enabled)}>{this.props.symbol}</button>
  }
}