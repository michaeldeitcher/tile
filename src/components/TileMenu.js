import React, { Component } from 'react';
import { connect } from 'react-redux'
import ColorMenu from './ColorMenu'

class DocumentMenu extends Component {
    replay() {
        // AppController.replayCanvas();
    }

    render () {
        return (
            <div>
            <li key="Replay" onClick={() => this.replay()}>
                Replay
            </li>
            </div>
        )
    }
}

export default class TileMenu extends Component {
    render () {
        return (
            <ul className="menu">
                <ColorMenu/>
                <DocumentMenu/>
            </ul>
        );
    }
}