import TileConfig from '../TileConfig'

export default function applicationState(state = {}, action) {
    switch (action.type) {
        case 'SET_MATERIAL':
            console.log(action);
            console.log(state);
            return {...state, material: {...state.material, color: action.color} };
            break;
        default:
            return state;
    }
}