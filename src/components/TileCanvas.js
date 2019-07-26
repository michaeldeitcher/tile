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
    const tileCanvasState = state.get("tileCanvas");
    const canvasState = tileCanvasState.getIn(['canvases', tileCanvasState.get('currentCanvasId')]);
    console.log(canvasState.toJS());
    TileContainer.render(canvasState);
    return {}
}

export default connect(mapStateToProps)(TileCanvas)