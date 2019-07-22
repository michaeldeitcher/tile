import ActionManager from '../ActionManager'

export default action => {
    ActionManager.controlPoint.remove();
    ActionManager.redrawTile();
}