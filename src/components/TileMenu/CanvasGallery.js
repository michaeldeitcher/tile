import React, { Component } from 'react'
import { connect } from 'react-redux'
import { AddToPhotos } from '@material-ui/icons';

const createNewCanvas = title => ({
    type: 'CREATE_NEW_CANVAS',
    title
})

const selectCanvas = canvasId => ({
    type: 'SELECT_CANVAS',
    canvasId
})

const mapStateToProps = state => {
    return {canvases: state.getIn(['tileCanvas', 'canvases'])};
}

class CanvasGallery extends Component {
    createNewCanvas() {
        this.props.createNewCanvas(Date.now());
    }

    selectCanvas(id) {
        this.props.selectCanvas(id);
    }

    render () {
        return (
            <div>
                <button onClick={() => this.createNewCanvas()}><AddToPhotos/></button>
                {
                    this.props.canvases.entrySeq().map(([id, canvas]) => {
                        return <button key={id} onClick={() => this.selectCanvas(id)}></button>
                    })
                }
            </div>
        );
    };
}

export default connect(
    mapStateToProps,
    { createNewCanvas, selectCanvas }
)(CanvasGallery);