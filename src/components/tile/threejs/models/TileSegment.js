import { Geometry } from '../../../../geometry' ;
import TileConfig from '../../../../TileConfig'

class Segment {
    constructor(tile, id) {
        this.tile = tile;
        this.id = id;
        if (this.tile.data.length > this.id) {
            this.data = this.tile.data[this.id];
            this.lastData = this.tile.data[this.id-1];
        } else {
            const { width } = TileConfig.tile.prefs;
            const length = TileConfig.tile.prefs.segmentStartLength;
            this.data = [[0,0], [length, 0], [length, width], [0, width]];
        }
    }

    controlPointData(includeStart){
        if (includeStart == null) { includeStart = true; }
        const data = [];
        if ((this.id === 0) && includeStart) {
            data.push({ coord: Geometry.midPoint(this.data[0],this.data[3]), id: 0 });
        }
        data.push({ coord: Geometry.midPoint(this.data[1],this.data[2]), id: this.id+1 });
        return data;
    }

    split() {
        const newSegmentPoints = [
            Geometry.midPoint(this.data[0],this.data[1]).concat(0),
            this.data[1],
            this.data[2],
            Geometry.midPoint(this.data[2],this.data[3]).concat(0)
        ];
        this.tile.data[this.id][1] = newSegmentPoints[0];
        this.tile.data[this.id][2] = newSegmentPoints[3];
        return this.tile.insertSegment(this.id+1, newSegmentPoints);
    }

    mergeLast() {
        const endPoint = Geometry.midPoint(this.data[1], this.data[2]);
        this.tile.data.splice(this.id,1);
        if (this.tile.data.length > 0) { return this.tile.moveEnd(new Segment(this.tile, this.id), endPoint); }
    }

    mergeNext() {
        const startPoint = Geometry.midPoint(this.data[0], this.data[3]);
        this.tile.data.splice(this.id,1);
        if (this.id < this.tile.data.length) { return this.tile.moveStart(new Segment(this.tile, this.id), startPoint); }
    }

    getLast() {
        if ((this.id-1) >= 0) {
            return new Segment(this.tile, this.id-1);
        } else {
            return null;
        }
    }

    getNext() {
        if ((this.id+1) < this.tile.data.length) {
            return new Segment(this.tile, this.id+1);
        } else {
            return null;
        }
    }

    isEnd() {
        return (this.getNext() == null);
    }
}

export default Segment