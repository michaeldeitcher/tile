import React, { Component } from 'react';
import { connect } from 'react-redux'

import threeEntryPoint from "../tile/threejs/threeEntryPoint"
import "./TileCanvas.scss"
import {addTile} from "./../../actions"
import TileContainer from "./threejs/TileContainer"

import scrollLock from 'scroll-lock';
scrollLock.disablePageScroll();

class TileCanvas extends Component {

    componentDidMount() {
        threeEntryPoint(this.threeRootElement);
        this.props.dispatch(addTile({point: [0,0,0]}));
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