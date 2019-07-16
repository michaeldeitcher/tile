import ActionManager from '../ActionManager'

export default action => {
    const data = action.data;
    const tileBuilder = ActionManager.tileBuilders[data[0]];
    const segment = tileBuilder.tile.getSegment(data[1]);
    segment.split();
    ActionManager.controlPoint = null;
    ActionManager.controlPointId = null;
    tileBuilder.redraw();
}