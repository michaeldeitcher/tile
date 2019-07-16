import './styles/main.scss'
import React from 'react'
import ReactDOM from 'react-dom'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import {Map, List} from 'immutable'

import TileConfig from './TileConfig'
import reducer from './reducers'
import TileCanvas from "./components/tile/TileCanvas"
import TileMenu from "./components/TileMenu"

import ActionManager from './components/tile/threejs/ActionManager'

const initialStore = {
    menuState: {
        status: '',
        colorsSupported: [],
        colorSelected: TileConfig.tile.material.color
    },
    tileCanvas: {
        state: 'create'
    },
    tileData: Map( {count: 0, data: List()})
}

const store = createStore(reducer, initialStore);
ActionManager.setStore(store);

ReactDOM.render(
    <Provider store={store}>
        <TileMenu/>
        <TileCanvas/>
    </Provider>,
  document.getElementById('app')
)
