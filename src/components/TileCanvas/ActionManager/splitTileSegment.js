import ActionManager from '../ActionManager'
import { fromJS } from 'immutable'
import TileGeometry from '../Geometry/TileGeometry'
import { Geometry } from '../Geometry/Geometry' ;

export default (state, action) => {
    const tileId = action.data.tileId.toString();

    // insert new point at midpoint
    const tile = state.getIn(['tiles', tileId]);
    const points = tile.get('points');
    const pointA = points.get(action.data.segmentId).get('position').toArray();
    const pointB = points.get(action.data.segmentId+1).get('position').toArray();
    const midPoint = Geometry.midPoint(pointA, pointB).concat(pointA[2]); // add original z back
    let newPoints = points.insert(action.data.segmentId+1, fromJS({pressed: false, position: midPoint})).map( (p,id) => {
        return p.set('id', id);
    });

    let newState =  state.setIn(['tiles',tileId,'points'], newPoints);

    return newState;
}