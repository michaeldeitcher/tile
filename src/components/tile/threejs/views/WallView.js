import * as THREE from 'three'
import AppController from '../controllers/ApplicationController'

export default class Wall {
    constructor() {
        this.appView = AppController.appView;
        this.layerController = AppController.activeLayerController();
    }

    create() {
        const material = new THREE.MeshBasicMaterial( {color: 0x000000 } );
        const geometry = new THREE.PlaneGeometry(6000, 6000, 1);

//    material = new THREE.MeshPhongMaterial( { color: 0xCCCCCC, shininess: 1, opacity: 0.2 } )
//    geometry = new THREE.BoxGeometry 600, 600, 1

        this.wall = new THREE.Mesh(geometry, material);
        this.wall.position.set(0,0,1);
        this.wall['view'] = this;

        this.appView.addToScene(this.wall);
        return this;
    }

    destroy() {
        return this.appView.removeFromScene(this.wall);
    }

    mouseMove(coord) {
        return false;
    }
    mouseDown(coord) {
        return false;
    }
    mouseUp(coord) {
        return false;
    }
};