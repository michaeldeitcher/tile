import { fromJS } from 'immutable'
import TileConfig from '../components/TileCanvas/InitialStates/TileConfig'

const initialState = fromJS({
    status: '',
    colorsSupported: [],
    colorSelected: TileConfig.tile.material.color
});

export default function menuState(state = initialState, action) {
    switch (action.type) {
        case 'SET_MENU_COLORS_SUPPORTED':
            return {...state, colorsSupported: action.colors };
            break;
        default:
            return state;
    }
}