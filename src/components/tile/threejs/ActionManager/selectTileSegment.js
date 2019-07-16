import ActionManager from '../ActionManager'

export default action => {
    const data = action.data;
    ActionManager.tile = ActionManager.tileBuilders[data[0]].tile;
    const segment = ActionManager.tile.getSegment(data[1]);
    ActionManager.tileSegment = segment;
    ActionManager.tileBuilders[ActionManager.tile.id].tileSelected = true;
    ActionManager.redrawTile()
}