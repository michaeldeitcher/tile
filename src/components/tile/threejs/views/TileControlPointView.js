import * as THREE from 'three'
import AppController from '../controllers/ApplicationController'
import TileConfig from '../../TileConfig'

export default class ControlPoint {
    constructor(tileView, coord, id) {
        this.tileView = tileView;
        this.coord = coord;
        this.id = id;
        this.appView = AppController.appView;
        this.layerController = AppController.activeLayerController();
        this.layer = this.layerController.layer;
        this.tile = this.tileView.tile;
        this;
    }

    createInnerCircle() {
        const material = new THREE.MeshLambertMaterial({color: 0x999999, emissive: 0x999999});
        const circleGeometry = new THREE.RingGeometry( 8, 14, 32 );
        const p = this.tile.location;
        this.innerCircle = new THREE.Mesh(circleGeometry, material);
        this.innerCircle.position.x = this.coord[0]+p[0];
        this.innerCircle.position.y = this.coord[1]+p[1];
        this.innerCircle.position.z = TileConfig.tile.prefs.depth + this.tileView.tilePosZ() + 20;
        this.innerCircle['view'] = this;
        return this.appView.addToScene(this.innerCircle);
    }

    createOuterCircle() {
        const material = new THREE.MeshBasicMaterial( { transparent: true, opacity: 0.0 } );
        const circleGeometry = new THREE.CircleGeometry( 20, 32 );
        const p = this.tile.location;
        this.outerCircle = new THREE.Mesh(circleGeometry, material);
        this.outerCircle.position.x = this.coord[0]+p[0];
        this.outerCircle.position.y = this.coord[1]+p[1];
        this.outerCircle.position.z = TileConfig.tile.prefs.depth + this.tileView.tilePosZ() + 1;
        this.outerCircle['view'] = this;
        return this.appView.addToScene(this.outerCircle);
    }

    create() {
        this.createInnerCircle();
        this.createOuterCircle();
        return this;
    }

    destroy() {
        this.appView.removeFromScene(this.innerCircle);
        return this.appView.removeFromScene(this.outerCircle);
    }

    mouseMove(coord) {
        return false;
    }

    mouseDown(coord) {
        this.layerController.controlPointMouseDown(this.id);
        return true;
    }

    mouseUp(coord) {
        this.layerController.controlPointMouseUp(this.id);
        return true;
    }

    vector3(pointIndex, depth) {
        const point = this.data[pointIndex];
        const p = this.tile.location;
        return new THREE.Vector3(point[0]+p[0], point[1]+p[1], depth);
    }
};