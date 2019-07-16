import * as THREE from 'three'
import TileConfig from '../../../../TileConfig'
import ActionManager from '../ActionManager'

export default class TileSegment {
    constructor(tileBuilder, segmentIndex) {
        this.tileBuilder = tileBuilder;
        this.segmentIndex = segmentIndex;
        this.tile = tileBuilder.tile;
        this.data = this.tile.data[this.segmentIndex];
    }

    createThreeObject(scene){
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
        ActionManager.sceneManager.addToScene(this.segment);
    }

    destroy() {
        ActionManager.sceneManager.removeFromScene(this.segment);
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
        if (ActionManager.tile && ActionManager.tile.id == selection[0]) {
            ActionManager.addAction('splitTileSegment', selection);
        } else {
            ActionManager.addAction('selectTileSegment', selection);
        }
        ActionManager.processActions();
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
            geom.vertices.push(this.dataPoint(pointIndex, TileConfig.tile.prefs.depth));
            geom.vertices.push(this.dataPoint(pointIndex, 0));
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
        console.log(geom.vertices);
        return geom;
    }

    dataPoint(pointIndex, depth) {
        let point = this.data[pointIndex];
        if(point.length == 2) {point[2] = 0;}
        const p = this.tile.location;
        const vector3 = new THREE.Vector3(point[0]+p.x, point[1]+p.y, point[2]+p.z + depth);
        return vector3;
    }
};