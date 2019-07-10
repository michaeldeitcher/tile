import * as THREE from 'three'
import AppController from '../controllers/ApplicationController'
import TileConfig from '../../TileConfig'

export default class TileSegmentView {
    constructor(tileView, segmentIndex) {
        this.tileView = tileView;
        this.segmentIndex = segmentIndex;
        this.appView = AppController.appView;
        this.layerController = AppController.activeLayerController();
        this.tile = this.tileView.tile;
        this.data = this.tile.data[this.segmentIndex];
    }

    create(attr){
        const material = (() => { switch (this.tile.material.material) {
        case 'Basic':
            return new THREE.MeshBasicMaterial(this.tile.material);
        case 'Lambert':
            return new THREE.MeshLambertMaterial({color: this.tile.material.color});
        case 'Phong':
            return new THREE.MeshPhongMaterial(this.tile.material);
        case 'Wireframe':
            $.extend(attr, {wireframe: true}, this.tile.material);
            return new THREE.MeshBasicMaterial(attr);
        } })();
        material.side = THREE.DoubleSide;
        this.segment = new THREE.Mesh(this.geometry(), material);
        this.segment['view'] = this;
        this.appView.addToWall(this.segment);
        return this;
    }

    destroy() {
        return this.appView.removeFromWall(this.segment);
    }

    mouseMove(coord) {
        return false;
    }

    mouseDown(coord) {
        this.state = 'mousedown';
        return true;
    }

    mouseUp(coord) {
        if (this.state !== 'mousedown') { return; }
        const selection = [this.tile.id, this.segmentIndex];
        if (this.layerController.isTileSelected(selection)) {
            this.layerController.splitTileSegment(selection);
        } else {
            this.layerController.selectTileSegment(selection);
            this.tileView.selectTile();
        }
        this.state = undefined;
        return true;
    }

    tilePosZ() {
        return this.tileView.tilePosZ();
    }

    geometry() {
        const geom = new THREE.Geometry();
        let pointIndex = 0;
        while (pointIndex < this.data.length) {
            geom.vertices.push(this.vector3(pointIndex, TileConfig.tile.prefs.depth + this.tilePosZ()));
            geom.vertices.push(this.vector3(pointIndex, this.tilePosZ()));
            pointIndex++;
        }
        // front
        geom.faces.push( new THREE.Face3( 0,2,4) );
        geom.faces.push( new THREE.Face3( 0,6,4) );

        // back
        geom.faces.push( new THREE.Face3( 1,3,5) );
        geom.faces.push( new THREE.Face3( 1,7,5) );

        // top
        geom.faces.push( new THREE.Face3( 7,6,4) );
        geom.faces.push( new THREE.Face3( 5,7,4) );

        // bottom
        geom.faces.push( new THREE.Face3( 3,2,0) );
        geom.faces.push( new THREE.Face3( 1,3,0) );

        // left
        geom.faces.push( new THREE.Face3( 1,0,6) );
        geom.faces.push( new THREE.Face3( 7,1,6) );

        // right
        geom.faces.push( new THREE.Face3( 5,4,2) );
        geom.faces.push( new THREE.Face3( 3,5,2) );

        geom.computeFaceNormals();
        return geom;
    }

    vector3(pointIndex, depth) {
        const point = this.data[pointIndex];
        const p = this.tile.location;
        return new THREE.Vector3(point[0]+p[0], point[1]+p[1], depth);
    }
};