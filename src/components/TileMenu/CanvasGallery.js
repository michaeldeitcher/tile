import React, { Component } from 'react'
import { connect } from 'react-redux'
import { AddToPhotos } from '@material-ui/icons';

const createNewCanvas = color => ({
    type: 'CREATE_NEW_CANVAS',
    title
})

const mapStateToProps = state => {
    return {}
}

class CanvasGallery extends Component {
    handleChangeComplete(color, event) {
        this.props.selectColor(color.hex);
    }

    render () {
        return (
            <div>
                <button><AddToPhotos/></button>
            </div>
        );
    };
}

export default connect(
    mapStateToProps,
    { createNewCanvas }
)(CanvasGallery);