import React, { Component } from 'react';
import AppController from './threejs/controllers/ApplicationController'

class SubMenu extends Component {

}

class DocumentMenu extends SubMenu {
    replay() {
        AppController.replayCanvas();
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

class ColorMenu extends SubMenu {
    constructor(props) {
        super(props);
        this.colorsSupported = ["red", "white", "blue"];
        this.state = {
            title: "colors",
            colors: []
        };
    };

    selectColor(name) {
        var color;
        if(name === "red")
            color = '#FF0000';
        if(name === "blue")
            color = '#0000FF';
        if(name === 'white')
            color = '#999999';

        let layer = AppController.activeLayerController().layer;
        let material = layer.material;
        material.color = color;
        AppController.activeLayerController().processAction('setMaterial', {material: material});
    }

    openMenu() {
        if(this.state.colors.length > 0){
            this.setState({colors: []});
        }
        else {
            this.setState({colors: this.colorsSupported});
        }
    }

    render () {
        const menuItems = this.state.colors.map( (color) => {
            return (
                <li className={color} key={color} onClick={() => this.selectColor(color)}>
                    {color}
                </li>
            );
        });

        return (
            <div>
            <li key={this.title} onClick={() => this.openMenu()}>
                {this.state.title}
            </li>
            <ul className="sub-menu">
                {menuItems}
            </ul>
            </div>
        );
    };
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