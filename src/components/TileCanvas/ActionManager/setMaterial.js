import ActionManager from '../ActionManager'

export default action => {
    const d = action.data;
    if(d.location_delta == undefined)
        return;
    ActionManager.controlPoint.moveDelta(d.location_delta);
    ActionManager.redrawTile();
}