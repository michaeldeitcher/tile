import ActionManager from '../ActionManager'
import ControlPoint from '../models/TileControlPoint'

export default action => {
    const d = action.data;
    if(d.location_delta == undefined)
        return;
    const tile = ActionManager.tileBuilders[ActionManager.tileId].tile;
    const controlPoint = new ControlPoint(tile, ActionManager.controlPointId);
    controlPoint.moveDelta(d.location_delta);
    ActionManager.redrawTile();
}