import { fromJS } from 'immutable'

const initialState = fromJS({
    state: 'create',
    tiles: {},
    selection: {
        tileId: null,
        pointId: null,
        color: '#FF0000',
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
        case 'SELECT_COLOR':
            const tileId = state.getIn(['selection', 'tileId']);
            let newState = state.setIn(['selection','color'], action.color);
            if(tileId !== null)
                newState = newState.setIn(['tiles',tileId.toString(),'material', 'color'], action.color);
            return newState;
        default:
            return state;
    }
}