import addTile from './addTileAction'
import selectControlPoint from './selectControlPoint'
import moveControlPoint from './moveControlPoint'
import removeControlPoint from './removeControlPoint'
import clearSelection from './clearSelection'
import setMaterial from './setMaterial'
import selectTileSegment from './selectTileSegment'
import splitTileSegment from './splitTileSegment'
import {Geometry} from '../../../../geometry'

let reduxStore = null;

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

        return this.actions.push(action);
    }

    processActions() {
        while(this.actions.length) {
            let action = this.actions.pop();
            this.processAction(action);
        }
    }

    processAction(action) {
        switch (action.type) {
            case 'addTile': addTile(action); break;
            case 'selectTileSegment': selectTileSegment(action); break;
            case 'splitTileSegment': splitTileSegment(action); break;
            case 'selectControlPoint': selectControlPoint(action); break;
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
