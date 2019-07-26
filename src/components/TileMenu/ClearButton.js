import React, { Component } from 'react'
import { connect } from 'react-redux'

const clearCanvas = data => ({
    type: 'CLEAR_CANVAS'
})

const mapStateToProps = state => {
    return {
    }
}

class ClearButton extends Component {
    clear() {
        this.props.clearCanvas();
    }

    render () {
        return (
            <div>
                <li key="Clear" onClick={() => this.clear()}>
                    Clear
                </li>
            </div>
        )
    }
}

export default connect(
    mapStateToProps,
    { clearCanvas }
)(ClearButton);