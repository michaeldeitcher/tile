import ActionManager from '../ActionManager'

export default action => {
    ActionManager.controlPointId = null;
    ActionManager.controlPoint = null;
    ActionManager.segmentId = null;
    ActionManager.tileId = null;
    ActionManager.redrawTile();
}