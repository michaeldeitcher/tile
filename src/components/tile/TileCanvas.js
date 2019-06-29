import React, { Component } from 'react';

import threeEntryPoint from "../tile/threejs/threeEntryPoint"
import "./TileCanvas.scss"

import scrollLock from 'scroll-lock';
scrollLock.disablePageScroll();

export default class Header extends Component {

    componentDidMount() {
        threeEntryPoint(this.threeRootElement);
    }

    render () {
        return (
            <div className="tile-canvas" ref={element => this.threeRootElement = element} />
    );
    }
}