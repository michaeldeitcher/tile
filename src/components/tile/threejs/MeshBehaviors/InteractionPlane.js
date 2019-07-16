import * as THREE from 'three'
import ActionManager from '../ActionManager'
import TileConfig from '../../../../TileConfig'

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
        if(ActionManager.controlPoint != null){
            ActionManager.addAction('moveControlPoint', {location: coord});
            ActionManager.processActions();
            return true;
        }
        return false;
    }
    mouseDown(coord) {
        if(ActionManager.tile != null){
            ActionManager.addAction('clearSelection', {});
            ActionManager.processActions();
            return true;
        }

        var point = {...coord};
        point.y = point.y - (.5 * TileConfig.tile.prefs.width);
        ActionManager.addAction('addTile', {location: point});
        ActionManager.processActions();
        return true;
    }
    mouseUp(coord) {
        return false;
    }
};