import TileConfig from '../../TileConfig'
import Segment from './TileSegment'
import ControlPoint from './TileControlPoint'
import { Geometry } from '../../../../geometry' ;

export default class Tile {
    constructor(id, location) {
        this.id = id;
        this.location = location;
        const { width } = TileConfig.tile.prefs;
        const length = TileConfig.tile.prefs.segmentStartLength;
        this.data = [
            [[0,0], [length, 0], [length, width], [0, width]]
        ];
    }

    setMaterial(material) {
        return this.material = {
            material: material.material,
            color: parseInt(material.color.replace("#", "0x")),
            colorAmbient: parseInt(material.colorAmbient.replace("#", "0x")),
            colorEmissive: parseInt(material.colorEmissive.replace("#", "0x")),
            colorSpecular: parseInt(material.colorSpecular.replace("#", "0x")),
            shininess: material.shininess,
            opacity: material.opacity,
            transparent: true
        };
    }

    getMaterial() {
        return {
            material: this.material.material,
            color: `#${pad(this.material.color.toString(16), 6)}`,
            colorAmbient: `#${pad(this.material.colorAmbient.toString(16), 6)}`,
            colorEmissive: `#${pad(this.material.colorEmissive.toString(16), 6)}`,
            colorSpecular: `#${pad(this.material.colorSpecular.toString(16), 6)}`,
            shininess: this.material.shininess,
            opacity: this.material.opacity,
            transparent: true
        };
    }

    numOfSegments() {
        return this.data.length;
    }

    getSegment(id) {
        return new Segment(this, id);
    }

    addSegment() {
        const last = new Segment(this, this.data.length-1);
        return this.data[this.data.length] = [last.data[1],
            Geometry.addPoint(last.data[1], [TileConfig.tile.prefs.segmentStartLength,0]),
            Geometry.addPoint(last.data[2], [TileConfig.tile.prefs.segmentStartLength,0]),
            last.data[2]];
    }

    getControlPoint(id) {
        return new ControlPoint(this, id);
    }

    controlPointData() {
        const n = this.numOfSegments();
        let data = [];
        if (n < 1) { return data; }
        for (let i = 0, end = n-1, asc = 0 <= end; asc ? i <= end : i >= end; asc ? i++ : i--) {
            const segment = this.getSegment(i);
            data = data.concat(segment.controlPointData());
        }
        return data;
    }

    addTileSegment(growTo=null) {
        this.addSegment();
        const segment = new Segment(this, this.data.length-1);
        if (growTo) { this.moveEnd(segment, growTo); }
        return segment;
    }

    insertSegment(i, newSegmentPoints) {
        const dataLength = this.data.length;
        this.data[dataLength] = [];
        for (let moveIndex = dataLength, end = i, asc = dataLength <= end; asc ? moveIndex <= end : moveIndex >= end; asc ? moveIndex++ : moveIndex--) {
            this.data[moveIndex] = this.data[moveIndex-1];
        }
        return this.data[i] = newSegmentPoints;
    }

    moveEnd(segment, point) {
        let fixedStart;
        if (segment.id > 0) {
            const lastSegment = new Segment(this, segment.id-1);
            const lastSegmentVector = Geometry.getVector({start: Geometry.midPoint(lastSegment.data[1], lastSegment.data[2]), end: Geometry.midPoint(lastSegment.data[1], lastSegment.data[2])});
            fixedStart = Geometry.midPoint(lastSegment.data[1], lastSegment.data[2]);
        } else {
            fixedStart = Geometry.midPoint(segment.data[0], segment.data[3]);
        }

        // set end points
        const vector = Geometry.getVector({start: fixedStart, end: point});
        if (vector.direction === 0) { return; }
        this.movePoints(segment, vector, point);
        const nextSegment = segment.getNext();
        if (nextSegment != null) {
            return this.moveStart(nextSegment, point);
        } else {
            const first = this.getControlPoint(0).coord();
            if (Geometry.getDistance(point, first) < 2) {
                this.startEndConnected = true;
                return this.resolveStartEnd();
            }
        }
    }

    moveStart(segment, point) {
        const fixedEnd = Geometry.midPoint(segment.data[1], segment.data[2]);

        // set end points
        const vector = Geometry.getVector({start: point, end: fixedEnd});
        if (vector.direction === 0) { return; }
        this.movePoints(segment, vector, fixedEnd);

        // check to connect start/end
        if ((segment.id !== 0) || !(this.numOfSegments() > 2)) { return; }
        const last = this.getControlPoint(this.numOfSegments()).coord();
        if (Geometry.getDistance(last, point) < 2) {
            this.startEndConnected = true;
            return this.resolveStartEnd();
        }
    }

    movePoints(segment, vector, endPoint) {
        let line1, line2;
        const lastSegment = new Segment(this, segment.id-1);

        const orthog = Geometry.getOrthogonalVector(vector);
        let leftEnd = Geometry.movePoint(endPoint, Geometry.getVector({direction: orthog.direction, magnitude: TileConfig.tile.prefs.width / -2}));
        let rightEnd = Geometry.movePoint(endPoint, Geometry.getVector({direction: orthog.direction, magnitude: TileConfig.tile.prefs.width / 2}));

        // find start points
        const reverseVector = Geometry.getVector({direction: vector.direction, magnitude: -vector.magnitude});
        let leftStart = Geometry.movePoint(leftEnd, reverseVector);
        let rightStart = Geometry.movePoint(rightEnd, reverseVector);

        // adjust to connect segments
        if (segment.id > 0) {
            line1 = [lastSegment.data[0], lastSegment.data[1]];
            line2 = [leftStart, leftEnd];
            leftStart = Geometry.getPointIntersected( line1, line2 );

            line1 = [lastSegment.data[3], lastSegment.data[2]];
            line2 = [rightStart, rightEnd];
            rightStart = Geometry.getPointIntersected( line1, line2 );

            this.data[segment.id-1][1] = leftStart;
            this.data[segment.id-1][2] = rightStart;
        }

        if (this.data.length > (segment.id+1)) {
            const nextSegment = new Segment(this, segment.id+1);

            line1 = [nextSegment.data[0], nextSegment.data[1]];
            line2 = [leftStart, leftEnd];
            leftEnd = Geometry.getPointIntersected( line1, line2 );

            line1 = [nextSegment.data[3], nextSegment.data[2]];
            line2 = [rightStart, rightEnd];
            rightEnd = Geometry.getPointIntersected( line1, line2 );

            this.data[segment.id+1][0] = leftEnd;
            this.data[segment.id+1][3] = rightEnd;
        }

        return this.data[segment.id] = [leftStart,leftEnd,rightEnd,rightStart];
    }

    resolveStartEnd() {
        if (!this.startEndConnected) { return; }
        const firstSegment = this.getSegment(0);
        const lastSegment = this.getSegment(this.numOfSegments()-1);
        let line1 = [lastSegment.data[0], lastSegment.data[1]];
        let line2 = [firstSegment.data[0], firstSegment.data[1]];
        const leftStart = Geometry.getPointIntersected( line1, line2 );

        line1 = [lastSegment.data[3], lastSegment.data[2]];
        line2 = [firstSegment.data[3], firstSegment.data[2]];
        const rightStart = Geometry.getPointIntersected( line1, line2 );

        this.data[0][0] = (this.data[lastSegment.id][1] = leftStart);
        return this.data[0][3] = (this.data[lastSegment.id][2] = rightStart);
    }
}







