import './styles/main.scss'
import React from 'react'
import ReactDOM from 'react-dom'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import Immutable from 'immutable';

import reducer from './reducers'
import TileCanvas from "./components/TileCanvas"
import TileMenu from "./components/TileMenu"

import ActionManager from './components/TileCanvas/ActionManager'

const store = createStore(reducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__({
        serialize: {
            immutable: Immutable
        }
    }));
ActionManager.setStore(store);

ReactDOM.render(
    <Provider store={store}>
        <TileMenu/>
        <TileCanvas/>
    </Provider>,
  document.getElementById('app')
)
