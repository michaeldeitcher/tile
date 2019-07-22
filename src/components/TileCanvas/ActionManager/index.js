import addTile from './addTileAction'
import selectControlPoint from './selectControlPoint'
import pressControlPoint from './pressControlPoint'
import moveControlPoint from './moveControlPoint'
import removeControlPoint from './removeControlPoint'
import clearSelection from './clearSelection'
import setMaterial from './setMaterial'
import selectTileSegment from './selectTileSegment'
import splitTileSegment from './splitTileSegment'
import TileContainer from '../TileContainer'

export const tileCanvasAction = (actionType, newState) => ({
    type: 'PUBLISH_STATE',
    actionType,
    newState
})

class ActionManager {
    constructor() {
        this.actions = [];
        this.history = [];

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

    redrawTile() {
        this.tileBuilders[this.tile.id].redraw();
    }

    addAction(actionType, data){
        const newState = this.processAction(TileContainer.state, {actionType, data});
        TileContainer.render(newState);
        let action = {
            type: actionType,
            data: newState
        };
        this.store.dispatch(tileCanvasAction(actionType, newState));
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
            case 'moveControlPoint': return moveControlPoint(state, action); break;
            case 'clearSelection': return clearSelection(state, action); break;
            case 'removeControlPoint': return removeControlPoint(state, action); break;
            case 'setMaterial': return setMaterial(state, action); break;
            case 'setVersionInfo': return setVersion(state, action); break;
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
