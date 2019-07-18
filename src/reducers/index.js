
import { combineReducers } from 'redux-immutable';
import tileCanvas from './tileCanvas'
import tileData from './tileData'
import menuState from './menuState'

export default combineReducers({
    menuState,
    tileCanvas,
    tileData
})