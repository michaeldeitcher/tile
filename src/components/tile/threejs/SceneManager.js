import * as THREE from 'three'
import SceneSubject from './SceneSubject'
import GeneralLights from './GeneralLights'
import Stage from './models/Stage'
import KeyState from 'key-state'

import TileContainer from "./TileContainer"
import InteractionPlane from './MeshBehaviors/InteractionPlane'

function buildScene() {
    const scene = new THREE.Scene();

    return scene;
}

function setBackgroundColor() {
    scene.background = new THREE.Color("#FFF");
}

function buildRender({ width, height}, canvas) {
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    const DPR = window.devicePixelRatio ? window.devicePixelRatio : 1;
    renderer.setPixelRatio(DPR);
    renderer.setSize(width, height);

    renderer.gammaInput = true;
    renderer.gammaOutput = true;

    return renderer;
}

function buildCamera({ width, height }) {
    const aspectRatio = width / height;
    const fieldOfView = 10;
    const nearPlane = 4;
    const farPlane = 10000;
    const camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);

    const pos = [0, 0, 3000];
    camera.position.set(pos[0],pos[1],pos[2]);

    return camera;
}

function createSceneSubjects(scene) {
    const sceneSubjects = [
        new GeneralLights(scene),
        new SceneSubject(scene)
    ];

    return sceneSubjects;
}

class SceneManager {

    constructor() {
        if (!TileContainer.instance) {
            TileContainer.instance = this
        }
        return TileContainer.instance;
    }

    start(canvas) {
        this.canvas = canvas;
        this.clock = new THREE.Clock();
        this.origin = new THREE.Vector3(0,0,0);

        this.screenDimensions = {
            width: canvas.width,
            height: canvas.height
        }

        this.scene = buildScene();
        this.renderer = buildRender(this.screenDimensions, this.canvas);
        this.camera = buildCamera(this.screenDimensions);
        this.camera.lookAt(this.origin);
        this.sceneSubjects = createSceneSubjects(this.scene);
        this.objects = [];
        let interactionPlane = new InteractionPlane();
        const threeObject = interactionPlane.createThreeObject(this)
        this.addToScene(threeObject);
        this.addToObjects(threeObject);

        this.keys = KeyState(window, {
            left: [ "ArrowLeft" ],
            right: [ "ArrowRight" ],
            wallLeft: ["KeyA"],
            wallRight: ["keyD"]
        });
    }

    update() {
        const elapsedTime = this.clock.getElapsedTime();

        for(let i=0; i< this.sceneSubjects.length; i++)
            this.sceneSubjects[i].update(elapsedTime);

        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        const { width, height } = this.canvas;

        this.screenDimensions.width = width;
        this.screenDimensions.height = height;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
    }

    handleMoveEvent(coord) {
        if (this.ignoreMouseEvents) { return; }
        this.raycastIntersects(coord).some( intersect => intersect.object.view.mouseMove(intersect.point) );
    }

    handleUpEvent(coord) {
        if (this.ignoreMouseEvents) { return; }
        this.raycastIntersects(coord).some( intersect => intersect.object.view.mouseUp(intersect.point) );
    }

    handleDownEvent(coord) {
        if (this.ignoreMouseEvents) { return; }
        const array = this.raycastIntersects(coord)
        array.some( intersect => intersect.object.view.mouseDown(intersect.point) );
    }

    raycastIntersects(clientCoord) {
        const mouseX = (( clientCoord[0] / window.innerWidth ) * 2) - 1;
        const mouseY = (- ( clientCoord[1] / window.innerHeight ) * 2) + 1;

        const mouse2D = new THREE.Vector2( mouseX, mouseY );
        const rayCaster = new THREE.Raycaster();
        rayCaster.setFromCamera( mouse2D, this.camera );
        return rayCaster.intersectObjects( this.objects );
    }

    addToScene(threeObject) {
        this.scene.add(threeObject);
    }

    addToObjects(threeObject) {
        return this.objects.unshift(threeObject);
    }

    removeFromScene(threeObject) {
        this.scene.remove(threeObject);
    }

    removeFromObjects(threeObject) {
        const index = this.objects.indexOf(threeObject);
        if (index > -1) {
            return this.objects.splice(index, 1);
        }
    }

    subscribe(state) {

    }

}

const instance = new SceneManager();

export default instance;