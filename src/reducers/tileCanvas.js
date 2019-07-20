import { fromJS } from 'immutable'
import ActionManager from '../components/tile/threejs/ActionManager'
import TileConfig from '../TileConfig'

const initialState = fromJS({
    state: 'create',
    tiles: {},
    selection: {
        tileId: null,
        pointId: null,
        pressed: {
            tileId: null,
            pointId: null
        }
    }
});

export default function tileCanvas(state = initialState, action) {
    switch (action.type) {
        case 'PUBLISH_STATE':
            return action.newState;
            break;
        default:
            return state;
    }
}