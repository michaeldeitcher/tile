import * as THREE from 'three'
import TileConfig from '../../../../TileConfig'
import ActionManager from '../ActionManager'
import SceneManager from '../SceneManager'
import Selection from './Selection'

class ControlPoint {
    constructor( id, tile ) {
        this.id = id;
        this.tile = tile;
        this.threeGroup = tile.threeGroup;
        this.innerCircle = null;
        this.outerCircle = null;
    }

    removeFromGroup() {
        if(this.innerCircle) {
            this.threeGroup.remove(this.innerCircle);
            SceneManager.removeFromObjects(this.innerCircle);
        }
        if(this.outerCircle) {
            this.threeGroup.remove(this.outerCircle);
            SceneManager.removeFromObjects(this.outerCircle);
        }
    }

    render(state) {
        this.state = state;
        this.selected = (this.tile.id === Selection.tileId) && (this.id == Selection.pointId);
        this.pressed = (this.tile.id === Selection.pressed.tileId) && (this.id == Selection.pressed.pointId);
        const position = state.get("position");
        this.threeGroup.add(this.createInnerCircle(position));
        this.threeGroup.add(this.createOuterCircle(position));
        SceneManager.addToObjects(this.innerCircle);
        SceneManager.addToObjects(this.outerCircle);
    }


    material() {
        if( this.pressed )
            return new THREE.MeshLambertMaterial({color: 0x990000, emissive: 0x999999});
        else
            return new THREE.MeshLambertMaterial({color: 0x999999, emissive: 0x999999});
    }

    createInnerCircle(position) {
        const circleGeometry = new THREE.RingGeometry( 8, 14, 32 );
        this.innerCircle = new THREE.Mesh(circleGeometry, this.material());
        this.innerCircle.position.set(...position);
        this.innerCircle['view'] = this;
        return this.innerCircle;
    }

    createOuterCircle(position) {
        const material = new THREE.MeshBasicMaterial( { transparent: true, opacity: 0.0 } );
        const circleGeometry = new THREE.CircleGeometry( 20, 32 );
        this.outerCircle = new THREE.Mesh(circleGeometry, material);
        this.outerCircle.position.set(...position);
        this.outerCircle['view'] = this;
        return this.outerCircle;
    }

    mouseMove(coord) {
        if( this.pressed ) {
            ActionManager.addAction('moveControlPoint', {location: coord});
            ActionManager.processActions();
            return true;
        }
        return false;
    }

    mouseDown(coord) {
        if( this.selected )
            ActionManager.addAction('removeControlPoint');
        else
            ActionManager.addAction('pressControlPoint', {tileId: this.tile.id, pointId: this.id});
        return true;
    }

    mouseUp(coord) {
        return false;
        if( this.selected ) {
            ActionManager.controlPointId = null;
            ActionManager.controlPoint = null;
            return true;
        } else
            return false;
    }
};

export default ControlPoint