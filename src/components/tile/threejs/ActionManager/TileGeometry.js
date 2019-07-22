import { Geometry } from '../../../../geometry' ;
import { fromJS } from 'immutable'

//
// Tile Segment Geometry Array Point Ordering
// 0-----------1
// |           |
// 3-----------2
// ---->
// segment direction
// ---->

let recalculateSegments = (state, tileId) => {
    const tile = state.getIn(['tiles', tileId]);
    const points = tile.get('points');

    const segmentsGeometry = applyCornerIntersectModifier( calculateSegmentsGeometry(points, tile.get('width')) );
    // const segmentsGeometry = calculateSegmentsGeometry(points, tile.get('width'));
    const newSegments = segmentsGeometry.map( (s, i) => {
        return {id: i, geometryPoints: s};
    } );
    return state.setIn(['tiles', tileId, 'segments'], fromJS(newSegments));
}

let applyCornerIntersectModifier = (segmentsGeometry) => {
    let lastSegment = null;
    let isFirstSegment = true;
    for( let [i, segment] of segmentsGeometry.entries() ) {
        if( lastSegment != null ) {
            let aLeft = [lastSegment[0], lastSegment[1]];
            let aRight = [lastSegment[3], lastSegment[2]];
            let bLeft = [segment[0], segment[1]];
            let bRight = [segment[3], segment[2]];
            const leftIntersect = Geometry.getPointIntersected(aLeft, bLeft);
            const rightIntersect = Geometry.getPointIntersected(aRight, bRight);
            segmentsGeometry[i-1][1] = leftIntersect;
            segmentsGeometry[i-1][2] = rightIntersect;
            segmentsGeometry[i][0] = leftIntersect;
            segmentsGeometry[i][3] = rightIntersect;
        }
        lastSegment = segment;
    }
    return segmentsGeometry;
}

let calculateSegmentsGeometry = (points, width) => {
    const segmentsGeometry = [];

    let beginPoint = null;
    for( let point of points ) {
        if(beginPoint === null)
            beginPoint = point.get('position').toArray();
        else {
            let start = beginPoint;
            let end = point.get('position').toArray();
            var zPos = start[2];
            let vector = Geometry.getVector({start,end});
            let orthog = Geometry.getOrthogonalVector(vector);
            let result = [];
            orthog.magnitude = width/2;
            result[1] = Geometry.movePoint(end,orthog);
            orthog.magnitude = -width/2;
            result[2] = Geometry.movePoint(end,orthog);
            const reverseVector = Geometry.getVector({direction: vector.direction, magnitude: -vector.magnitude});
            result[0] = Geometry.movePoint(result[1], reverseVector);
            result[3] = Geometry.movePoint(result[2], reverseVector);

            const segmentPoints = result.map(r => [r[0],r[1],zPos]);
            segmentsGeometry.push(segmentPoints);
            beginPoint = end;
        }
    }
    return segmentsGeometry;
}



export default {recalculateSegments}