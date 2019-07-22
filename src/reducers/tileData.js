import { fromJS } from 'immutable'
import {ADD_TILE} from './../actions/actionTypes'
import {Map, List} from 'immutable'

const initialState = fromJS({
    tileData: null
});

export default function tileData(state = initialState, action) {
    switch (action.type) {
        default:
            return state;
    }
}