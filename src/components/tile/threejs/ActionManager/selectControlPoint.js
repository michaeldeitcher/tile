import ActionManager from '../ActionManager'

export default action => {
    ActionManager.controlPointId = action.data.controlPointId;
    ActionManager.tileId = action.data.tileId;
    ActionManager.redrawTile()
}