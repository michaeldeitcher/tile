import TileGeometry from '../Geometry/TileGeometry'
import ActionManager from '../ActionManager'

export default (state, action) => {
    const tileId = action.data.tileId.toString();
    const tile = state.getIn(['tiles',tileId]);
    let newState =  state.setIn(['tiles',tileId,'points'], tile.get('points').remove(action.data.pointId));

    return TileGeometry.recalculateSegments(newState, tileId);
}