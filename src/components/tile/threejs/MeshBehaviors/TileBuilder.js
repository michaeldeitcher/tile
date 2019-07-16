import * as THREE from 'three'
import ActionManager from '../ActionManager'
import TileSegment from './TileSegment'
import TileControlPointCircle from './TileControlPointCircle'

export default class TileBuilder {
    constructor(tile, scene) {
        this.tile = tile;
        this.segments = [];
        this.controlPoints = [];
        this.tileSelected = ActionManager.tileId === tile.id;
        this.redraw();
        return this;
    }

    redraw() {
        this.redrawSegments();
        return this.redrawControlPoints();
    }

    redrawSegments() {
        for (let segment of Array.from(this.segments)) { segment.destroy(); }
        this.segments = [];

        let i = 0;
        while (i < this.tile.data.length) {
            let segment = new TileSegment( this, i );
            segment.createThreeObject();
            this.segments.push(segment);
            i++;
        }
    }

    redrawControlPoints() {
        for (let controlPoint of Array.from(this.controlPoints)) { controlPoint.destroy(); }
        this.controlPoints = [];

        if (!this.tileSelected || (ActionManager.state.tileCanvas.state !== 'create')) { return; }

        let i = 0;
        const controlPointData = this.tile.controlPointData();
        const result = [];
        while (i < controlPointData.length) {
            this.controlPoints.push(new TileControlPointCircle( this, controlPointData[i].coord, i ).create());
            result.push(i++);
        }
        return result;
    }

    selectTile(selected){
        if (selected == null) { selected = true; }
        this.tileSelected = selected;
        return this.redrawControlPoints();
    }

    destroy() {
        for (let segment of Array.from(this.segments)) { segment.destroy(); }
        return Array.from(this.controlPoints).map((controlPoint) => controlPoint.destroy());
    }
}
