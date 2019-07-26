import React, { Component } from 'react'
import { connect } from 'react-redux'
import { CompactPicker } from 'react-color';

const selectColor = color => ({
    type: 'SELECT_COLOR',
    color
})

const mapStateToProps = state => {
    return {}
}

class ColorMenu extends Component {
    handleChangeComplete(color, event) {
        this.props.selectColor(color.hex);
    }

    render () {
        return (
            <div>
                <CompactPicker onChangeComplete={ (color, event) => this.handleChangeComplete(color, event) }/>
            </div>
        );
    };
}

export default connect(
    mapStateToProps,
    { selectColor }
)(ColorMenu);