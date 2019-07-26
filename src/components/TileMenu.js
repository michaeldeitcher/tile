import React, { Component } from 'react';
import ColorMenu from './TileMenu/ColorMenu'
import CanvasGallery from './TileMenu/CanvasGallery'
import { Menu, ColorLens, Collections } from '@material-ui/icons';
import './TileMenu.scss'

export default class TileMenu extends Component {
    constructor(props) {
        super(props);
        this.state = {activeMenu: "menu"};
    }

    selectMenu(name) {
        this.setState({activeMenu: name});
    }

    render () {
        const menuButton = (
            <button><Menu onClick={() => this.selectMenu("menu")}/></button>
        );
        const menu = (
            <div>
                {menuButton}
                <button onClick={() => this.selectMenu("colorMenu")}> <ColorLens/> </button>
                <button onClick={() => this.selectMenu("canvasGallery")}> <Collections/> </button>
            </div>
        );

        let activeMenu = '';
        switch(this.state.activeMenu) {
            case "menu":
                activeMenu = menu;
                break;
            case "colorMenu":
                activeMenu = <div>{menuButton}<ColorMenu/></div>;
                break;
            case "canvasGallery":
                activeMenu = <div>{menuButton}<CanvasGallery/></div>;
                break;
        }

        return (
            <div className="tile-menu">
                {activeMenu}
            </div>
        );
    }
}