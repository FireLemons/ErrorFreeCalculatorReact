import React, { useState } from 'react';

export interface ISymbolButtonProps {
  enabled: boolean,
  symbol: string
}

export default class SymbolButton extends React.Component<ISymbolButtonProps, {}> {
  constructor(props: ISymbolButtonProps) {
    super(props);
  }

  public render() {
    return <button disabled={!(this.props.enabled)}>{this.props.symbol}</button>
  }
}