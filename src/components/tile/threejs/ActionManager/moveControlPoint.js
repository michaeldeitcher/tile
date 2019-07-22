import { fromJS } from 'immutable'
import TileGeometry from './TileGeometry'
import ActionManager from '../ActionManager'
import ControlPoint from '../models/TileControlPoint'
import * as THREE from 'three'

export default (state, action) => {
    const tileId = action.data.tileId.toString();
    const tile = state.getIn(['tiles',tileId]);
    const point = tile.getIn(['points',action.data.pointId]);
    const position = new THREE.Vector3(...point.get('position'));
    const newPosition = position.sub(action.data.vector);

    let newState =  state.setIn(['tiles',tileId,'points',action.data.pointId,'position'], fromJS(newPosition.toArray()));

    return TileGeometry.recalculateSegments(newState, tileId);
}