
import { combineReducers } from 'redux-immutable';
import menuState from './menuState'
import documentState from './documentState'

export default combineReducers({
    menuState,
    documentState
})