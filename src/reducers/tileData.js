import { fromJS } from 'immutable'
import {ADD_TILE} from './../actions/actionTypes'
import {Map, List} from 'immutable'
import TileConfig from '../TileConfig'

const initialState = fromJS({
    tileData: null
});

export default function tileData(state = initialState, action) {
    switch (action.type) {
        // case ADD_TILE:
        //     const { width } = TileConfig.tile.prefs;
        //     const length = TileConfig.tile.prefs.segmentStartLength;
        //     this.data = [
        //         [[0,0], [length, 0], [length, width], [0, width]]
        //     ];
        //
        //     const newState = state.setIn(["0"], Map({
        //         "location": List(action.data["point"]),
        //         "width": TileConfig.tile
        //         "length": length;
        //         "data": List([[0,0], [length, 0], [length, width], [0, width]])
        //     }));
        //     return newState;
        default:
            return state;
    }
}