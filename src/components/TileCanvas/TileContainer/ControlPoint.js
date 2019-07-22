import * as THREE from 'three'
import ActionManager from '../ActionManager'
import SceneManager from '../SceneManager'
import Selection from './Selection'
import TileContainer from './index'

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
        if(this.pressed)
            TileContainer.pressedControlPoint = this;
        this.position = state.get("position").toArray();
        this.position[2] = 10;
        this.threeGroup.add(this.createInnerCircle());
        this.threeGroup.add(this.createOuterCircle());
        SceneManager.addToObjects(this.innerCircle);
        SceneManager.addToObjects(this.outerCircle);
    }


    material() {
        if( this.pressed )
            return new THREE.MeshLambertMaterial({color: 0x990000, emissive: 0x999999});
        else
            return new THREE.MeshLambertMaterial({color: 0x999999, emissive: 0x999999});
    }

    createInnerCircle() {
        const circleGeometry = new THREE.RingGeometry( 8, 14, 32 );
        this.innerCircle = new THREE.Mesh(circleGeometry, this.material());
        this.innerCircle.position.set(...this.position);
        this.innerCircle['view'] = this;
        return this.innerCircle;
    }

    createOuterCircle() {
        const material = new THREE.MeshBasicMaterial( { transparent: true, opacity: 0.0 } );
        const circleGeometry = new THREE.CircleGeometry( 20, 32 );
        this.outerCircle = new THREE.Mesh(circleGeometry, material);
        this.outerCircle.position.set(...this.position);
        this.outerCircle['view'] = this;
        return this.outerCircle;
    }

    mouseMove(coord) {
        if( this.pressed ) {
            const worldPosition = new THREE.Vector3(...this.position).add( new THREE.Vector3(...this.tile.position));
            ActionManager.addAction('moveControlPoint', {tileId: this.tile.id, pointId: this.id, vector: worldPosition.sub(coord)});
            return true;
        }
        return false;
    }

    mouseDown(coord) {
        if( false )
            ActionManager.addAction('removeControlPoint');
        else
            ActionManager.addAction('pressControlPoint', {tileId: this.tile.id, pointId: this.id, position: coord});
        return true;
    }

    mouseUp(coord) {
        if( this.pressed ) {
            this.pressed = false;
            ActionManager.addAction('pressControlPoint', {tileId: this.tile.id, pointId: null, position: coord});
            TileContainer.pressedControlPoint = null;
            return true;
        }
        return false;
    }
};

export default ControlPoint