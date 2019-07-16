import TileConfig from '../TileConfig'

export default function menuState(state = {}, action) {
    switch (action.type) {
        case 'SET_MENU_COLORS_SUPPORTED':
            return {...state, colorsSupported: action.colors };
            break;
        case 'SELECT_COLOR':
            return {...state, colorSelected: action.color}
        default:
            return state;
    }
}