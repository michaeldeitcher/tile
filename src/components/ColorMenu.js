import React, { Component } from 'react';
import { connect } from 'react-redux'

const selectColor = color => ({
    type: 'SELECT_COLOR',
    color
})

const setMenuColorsSupported = colors => ({
    type: 'SET_MENU_COLORS_SUPPORTED',
    colors
})

const mapStateToProps = state => {
    return {
        title: "colors",
        colors: state.menuState.colorsSupported
    }
}

class ColorMenu extends Component {
    constructor(props) {
        super(props);
        this.colorsSupported = ["red", "white", "blue"];
    };

    selectColor(name) {
        var color;
        if(name === "red")
            color = '#FF0000';
        if(name === "blue")
            color = '#0000FF';
        if(name === 'white')
            color = '#999999';

        this.props.selectColor(color);
    }

    openMenu() {
        if(this.props.colors.length > 0){
            this.props.setMenuColorsSupported([]);
        }
        else {
            this.props.setMenuColorsSupported(this.colorsSupported);
        }
    }

    render () {
        const menuItems = this.props.colors.map( (color) => {
            return (
                <li className={color} key={color} onClick={() => this.selectColor(color)}>
                    {color}
                </li>
            );
        });

        return (
            <div>
                <li key={this.title} onClick={() => this.openMenu()}>
                    {this.props.title}
                </li>
                <ul className="sub-menu">
                    {menuItems}
                </ul>
            </div>
        );
    };
}

export default connect(
    mapStateToProps,
    { selectColor, setMenuColorsSupported }
)(ColorMenu);