import * as THREE from 'three'
import TileConfig from '../../../../TileConfig'
import ActionManager from '../ActionManager'

export default class ControlPoint {
    constructor(tileBuilder, coord, id) {
        this.tileBuilder = tileBuilder;
        this.coord = coord;
        this.id = id;
        this.tile = this.tileBuilder.tile;
        this.isSelected = (ActionManager.tileId === this.tile.id) && (ActionManager.controlPointId === this.id)
        if(this.isSelected)
            ActionManager.controlPoint = this;
        this;
    }

    material() {
        if(this.isSelected)
            return new THREE.MeshLambertMaterial({color: 0x990000, emissive: 0x999999});
        else
            return new THREE.MeshLambertMaterial({color: 0x999999, emissive: 0x999999});
    }

    createInnerCircle() {
        const circleGeometry = new THREE.RingGeometry( 8, 14, 32 );
        const p = this.tile.location;
        this.innerCircle = new THREE.Mesh(circleGeometry, this.material());
        this.innerCircle.position.x = this.coord[0]+p.x;
        this.innerCircle.position.y = this.coord[1]+p.y;
        this.innerCircle.position.z = TileConfig.tile.prefs.depth + p.z + 1;
        this.innerCircle['view'] = this;
        ActionManager.sceneManager.addToScene(this.innerCircle);
    }

    createOuterCircle() {
        const material = new THREE.MeshBasicMaterial( { transparent: true, opacity: 0.0 } );
        const circleGeometry = new THREE.CircleGeometry( 20, 32 );
        const p = this.tile.location;
        this.outerCircle = new THREE.Mesh(circleGeometry, material);
        this.outerCircle.position.x = this.coord[0]+p.x;
        this.outerCircle.position.y = this.coord[1]+p.y;
        this.outerCircle.position.z = TileConfig.tile.prefs.depth + + p.z + .01;
        this.outerCircle['view'] = this;
        ActionManager.sceneManager.addToScene(this.outerCircle);
    }

    create() {
        this.createInnerCircle();
        this.createOuterCircle();
        return this;
    }

    destroy() {
        ActionManager.sceneManager.removeFromScene(this.innerCircle);
        ActionManager.sceneManager.removeFromScene(this.outerCircle);
    }

    mouseMove(coord) {
        if (this.isSelected) {
            ActionManager.addAction('moveControlPoint', {location: coord});
            ActionManager.processActions();
            return true;
        }
        return false;
    }

    mouseDown(coord) {
        if (this.isSelected)
            ActionManager.addAction('removeControlPoint');
        else
            ActionManager.addAction('selectControlPoint', {tileId: this.tile.id, controlPointId: this.id});
        ActionManager.processActions();
        return true;
    }

    mouseUp(coord) {
        if (this.isSelected) {
            ActionManager.controlPointId = null;
            ActionManager.controlPoint = null;
            return true;
        } else
            return false;
    }

    vector3(pointIndex, depth) {
        const point = this.data[pointIndex];
        const p = this.tile.location;
        return new THREE.Vector3(point[0]+p[0], point[1]+p[1], depth);
    }
};