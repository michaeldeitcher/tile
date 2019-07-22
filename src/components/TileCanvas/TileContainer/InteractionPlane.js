import * as THREE from 'three'
import Selection from './Selection'
import ActionManager from '../ActionManager'
import TileContainer from './index'

export default class InteractionPlane {
    constructor() {
    }

    createThreeObject(scene) {
        // var plane = new THREE.Plane( new THREE.Vector3( 0,1,0 ) );
        // this.threeObject = new THREE.PlaneHelper( plane, 1, 0xFF0000 );
        const material = new THREE.MeshBasicMaterial( {color: 0x000000 } );
        const geometry = new THREE.BoxGeometry(1000, 1000, 1);
        this.threeObject = new THREE.Mesh(geometry, material);
        this.threeObject.position.set(0,0,0);
        this.threeObject['view'] = this;
        return this.threeObject;
    }

    mouseMove(coord) {
        if(TileContainer.pressedControlPoint){
            TileContainer.pressedControlPoint.mouseMove(coord);
            return true;
        }
        return false;
    }

    mouseDown(coord) {
        if(Selection.tileId != null){
            ActionManager.addAction('clearSelection', {});
        } else {
            var point = {...coord};
            const position = [point.x, point.y, point.z+1];
            ActionManager.addAction('addTile', {position: position});
        }
        return true;
    }

    mouseUp(coord) {
        if(TileContainer.pressedControlPoint){
            TileContainer.pressedControlPoint.mouseUp(coord);
            return true;
        }

        return false;
    }
};