import { fromJS } from 'immutable'
import {generate} from 'shortid'
import ActionManager from '../components/TileCanvas/ActionManager'

const canvasId = generate();

const initialCanvasState = fromJS({
    id: canvasId,
    tiles: {},
    selection: {
        tileId: null,
        pointId: null,
        color: '#FF0000',
    }
});

const canvases = {};
canvases[canvasId] = initialCanvasState;

const initialState = fromJS({
    state: 'create',
    currentCanvasId: canvasId,
    canvases: canvases
});

const getCanvasState = (state) => {
    const currentCanvasId = state.get('currentCanvasId');
    return state.getIn(['canvases', currentCanvasId]);
}

const mergeCanvasState = (state, canvasState) => {
    const currentCanvasId = state.get('currentCanvasId');
    return state.setIn(['canvases',currentCanvasId], canvasState);
}


export default function tileCanvas(state = initialState, action) {
    const canvasState = getCanvasState(state);
    switch (action.type) {
        case 'ACTION_MANAGER':
            var newCanvasState = ActionManager.processAction(canvasState, action);
            return mergeCanvasState(state, newCanvasState);
        case 'SELECT_COLOR':
            const tileId = canvasState.getIn(['selection', 'tileId']);
            var newCanvasState = canvasState.setIn(['selection','color'], action.color);
            if(tileId !== null)
                newCanvasState = newCanvasState.setIn(['tiles',tileId.toString(),'material', 'color'], action.color);
            return mergeCanvasState(state, newCanvasState);
        default:
            return state;
    }
}