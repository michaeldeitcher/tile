import addTile from './addTileAction'
import selectControlPoint from './selectControlPoint'
import pressControlPoint from './pressControlPoint'
import moveControlPoint from './moveControlPoint'
import removeControlPoint from './removeControlPoint'
import clearSelection from './clearSelection'
import setMaterial from './setMaterial'
import selectTileSegment from './selectTileSegment'
import splitTileSegment from './splitTileSegment'
import {Geometry} from '../../../../geometry'

export const tileCanvasAction = (actionType, data) => ({
    type: 'TILE_CANVAS_ACTION',
    actionType,
    data
})

class ActionManager {
    constructor() {
        this.actions = [];
        this.history = [];

        this.controlPointId = null;
        this.tileId = null;
        this.tileSegmentId = null;
        this.tileBuilders = {};
        this.controlPoint = null;

        if (!ActionManager.instance) {
            ActionManager.instance = this
        }

        return ActionManager.instance;
    }

    setSceneManager(sceneManager) {
        this.sceneManager = sceneManager;
    }

    setStore(store) {
        this.store = store;
    }

    updateState(state) {
        console.log(state)
        this.state = state;
    }

    redrawTile() {
        this.tileBuilders[this.tile.id].redraw();
    }

    addAction(actionType, actionData){
        let action = {
            type: actionType,
            data: actionData
        };
        if (this.controlPoint && (action.type === 'moveControlPoint')) {
            const tileLocation = [this.tile.location.x, this.tile.location.y];
            const ptCoord = Geometry.addPoint(this.controlPoint.coord, tileLocation);
            const location = [action.data.location.x, action.data.location.y];
            action.data.location_delta = Geometry.subtractPoint(ptCoord, location);
        }

        this.store.dispatch(tileCanvasAction(actionType, actionData));
    }

    processActions() {
        while(this.actions.length) {
            let action = this.actions.pop();
            this.processAction(action);
        }
    }

    processAction(state, action) {
        switch (action.actionType) {
            case 'addTile': return addTile(state, action); break;
            case 'selectTileSegment': return selectTileSegment(state, action); break;
            case 'splitTileSegment': return splitTileSegment(state, action); break;
            case 'selectControlPoint': return selectControlPoint(state, action); break;
            case 'pressControlPoint': return pressControlPoint(state, action); break;
            case 'moveControlPoint': moveControlPoint(action); break;
            case 'clearSelection': clearSelection(action); break;
            case 'removeControlPoint': removeControlPoint(action); break;
            case 'setMaterial': setMaterial(action); break;
            case 'setVersionInfo': setVersion(action); break;
            default:
                return;
        }

        const date = new Date();
        const now = date.getTime();
        let elapsedTime = (this.lastTime != null) ? now - this.lastTime : 0;
        console.log(action);
        this.history.push([action, elapsedTime]);
        this.lastTime = now;

    }
}

export default new ActionManager()
