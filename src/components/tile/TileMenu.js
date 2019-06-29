import React, { Component } from 'react';

export default class TileMenu extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: null,
        };
    }

    render () {
        return (
            <ul className="menu horizontal" id="menuMini">
                <li onClick={() => this.setState({value: 'X'})}>
                    {this.state.value}
                    Menu
                </li>
            </ul>
        );
    }
}