import { Geometry } from '../../../../geometry' ;

export default class ControlPoint {
    constructor(tile, id) {
        this.tile = tile;
        this.id = id;
        this.segment = this.tile.getSegment(this.id === 0 ? 0 : this.id-1 );
        const segmentId = this.id < 2 ? 0 : this.id-1;
    }

    coord() {
        const pt = this.isStart() ?
            Geometry.midPoint(this.segment.data[0], this.segment.data[3])
            :
            Geometry.midPoint(this.segment.data[1], this.segment.data[2]);
        return [Math.ceil(pt[0]), Math.ceil(pt[1])];
    }

    isStart() {
        return this.id === 0;
    }

    isEnd() {
        return !this.isStart();
    }

    moveDelta(delta) {
        return this.move(Geometry.subtractPoint(this.coord(), delta));
    }

    move(coordinates) {
        if (this.isStart()) {
            this.tile.moveStart(this.segment, coordinates);
        } else {
            this.tile.moveEnd(this.segment, coordinates);
            if (this.tile.startEndConnected && this.segment.isEnd()) {
                this.tile.moveStart(this.tile.getSegment(0), coordinates);
            }
        }
        return this.tile.resolveStartEnd();
    }

    remove() {
        if (this.isStart()) {
            if (this.tile.startEndConnected) {
                return this.tile.startEndConnected = false;
            }
            return this.segment.mergeLast();
        } else {
            return this.segment.mergeNext();
        }
    }
}