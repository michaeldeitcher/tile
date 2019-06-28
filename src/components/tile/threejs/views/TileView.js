import * as THREE from 'three'
import AppController from '../controllers/ApplicationController'
import TileSegmentView from './TileSegmentView'
import TileControlPointView from './TileControlPointView'

export default class TileView {
    constructor(layerView, tile) {
        this.layerView = layerView;
        this.tile = tile;
        this.segments = [];
        this.controlPoints = [];
        this.tileSelected = false;
        return this.redraw();
    }

    redraw() {
        this.redrawSegments();
        return this.redrawControlPoints();
    }

    redrawSegments() {
        for (let segment of Array.from(this.segments)) { segment.destroy(); }
        this.segments = [];

        let i = 0;
        const result = [];
        while (i < this.tile.data.length) {
            this.segments.push(new TileSegmentView( this, i ).create());
            result.push(i++);
        }
        return result;
    }

    redrawControlPoints() {
        for (let controlPoint of Array.from(this.controlPoints)) { controlPoint.destroy(); }
        this.controlPoints = [];

        if (!this.tileSelected || (AppController.state !== 'create')) { return; }

        let i = 0;
        const controlPointData = this.tile.controlPointData();
        const result = [];
        while (i < controlPointData.length) {
            this.controlPoints.push(new TileControlPointView( this, controlPointData[i].coord, i ).create());
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

    tilePosZ() {
        return this.tile.id * 5;
    }
}
