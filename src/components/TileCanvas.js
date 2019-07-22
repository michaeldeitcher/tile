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

    handleChange(e) {
        console.log(e)
    }

    render () {
        return (
            <div className="tile-canvas" ref={element => this.threeRootElement = element} />
    );
    }
}

// ActionManager.setStore(store);
// const updateActionManager = () => {
//     console.log('hmm');
//     ActionManager.handleStoreChange();
// };
// store.subscribe( updateActionManager );

const mapStateToProps = state => {
    TileContainer.render(state.get("tileCanvas"));
    return {}
}

export default connect(mapStateToProps)(TileCanvas)