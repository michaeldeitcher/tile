import React, { Component } from 'react';
import { connect } from 'react-redux'

import TileContainer from "./TileCanvas/TileContainer"
import threeEntryPoint from "./TileCanvas/threeEntryPoint"
import "./TileCanvas.scss"

import scrollLock from 'scroll-lock';
scrollLock.disablePageScroll();

class TileCanvas extends Component {

    componentDidMount() {
        threeEntryPoint(this.threeRootElement);
    }

    render () {
        return (
            <div className="tile-canvas" ref={element => this.threeRootElement = element} />
    );
    }
}

const mapStateToProps = state => {
    TileContainer.render(state.get("tileCanvas"));
    return {}
}

export default connect(mapStateToProps)(TileCanvas)