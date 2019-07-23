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
        TileContainer.pressedControlPoint = null;
    }

    render(state) {
        this.state = state;
        this.selected = (this.tile.id === Selection.tileId) && (this.id == Selection.pointId);
        this.position = state.get("position").toArray();
        this.position[2] = this.tile.state.get('depth') + 1;
        this.threeGroup.add(this.createInnerCircle());
        this.threeGroup.add(this.createOuterCircle());
        SceneManager.addToObjects(this.innerCircle);
        SceneManager.addToObjects(this.outerCircle);
        if(Selection.movingPointId === this.id)
            TileContainer.pressedControlPoint = this;
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
        if( Selection.movingPointId === this.id ) {
            const worldPosition = new THREE.Vector3(...this.position).add( new THREE.Vector3(...this.tile.position));
            let vector = worldPosition.sub(coord);
            vector.z = 0;
            ActionManager.addAction('moveControlPoint', {tileId: this.tile.id, pointId: this.id, vector: vector});
            return true;
        }
        return false;
    }

    mouseDown(coord) {
        if( !this.selected ) {
            Selection.movingPointId = this.id;
            return true;
        }
        return false;
    }

    mouseUp(coord) {
        let toReturn = false;
        if( Selection.movingPointId === this.id ) {
            Selection.movingPointId = null;
            TileContainer.pressedControlPoint = null;
            toReturn = true;
        } else {
            if( this.selected ) {
                ActionManager.addAction('removeControlPoint', {tileId: this.tile.id, pointId: this.id});
                toReturn = true;
            }
        }
        if( !this.selected ){
            ActionManager.addAction('selectControlPoint', {tileId: this.tile.id, pointId: this.id, position: coord});
            this.selected = true;
            return true;
        }
        return toReturn;
    }
};

export default ControlPoint