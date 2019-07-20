import { fromJS } from 'immutable'
import ActionManager from '../ActionManager'
import ControlPoint from '../models/TileControlPoint'
import { Geometry } from '../../../../geometry' ;
import * as THREE from 'three'

oldAction => {
    const d = action.data;
    if(d.location_delta == undefined)
        return;
    const tile = ActionManager.tileBuilders[ActionManager.tileId].tile;
    const controlPoint = new ControlPoint(tile, ActionManager.controlPointId);
    controlPoint.moveDelta(d.location_delta);
    ActionManager.redrawTile();
}

let updateSegmentData = (data, points, width) => {

    let beginPoint = null;
    for( let point of points ) {
        if(beginPoint === null)
            beginPoint = point;
        else {
            let result = [];
            let start = beginPoint.get('position').toArray();
            var zPos = start[2];
            let end = point.get('position').toArray();
            let vector = Geometry.getVector({start,end});
            let orthog = Geometry.getOrthogonalVector(vector);
            orthog.magnitude = width/2;
            result[1] = Geometry.movePoint(end,orthog);
            orthog.magnitude = -width/2;
            result[2] = Geometry.movePoint(end,orthog);

            const reverseVector = Geometry.getVector({direction: vector.direction, magnitude: -vector.magnitude});
            result[0] = Geometry.movePoint(result[1], reverseVector);
            result[3] = Geometry.movePoint(result[2], reverseVector);

            const segmentPoints = result.map(r => [r[0],r[1],zPos]);
            return segmentPoints;
        }
    }
}

export default (state, action) => {
    const pressed = state.getIn(['selection','pressed']);
    const tile = state.getIn(['tiles',pressed.get('tileId').toString()]);
    const point = tile.getIn(['points',pressed.get('pointId')]);
    const position = new THREE.Vector3(...point.get('position'));
    const newPosition = position.sub(action.data.vector);

    let newState =  state.setIn(['tiles',pressed.get('tileId').toString(),'points',pressed.get('pointId'),'position'], fromJS(newPosition.toArray()));
    let segmentData = newState.getIn(['tiles',pressed.get('tileId').toString(),'segments','0','geometryPoints']).toArray();
    segmentData = updateSegmentData(segmentData, tile.get('points'), tile.get('width'));
    newState =  newState.setIn(['tiles',pressed.get('tileId').toString(),'segments','0'], fromJS({geometryPoints: segmentData}));
    return newState;
}