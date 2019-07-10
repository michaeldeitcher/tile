import * as THREE from 'three'
import SceneSubject from './SceneSubject'
import GeneralLights from './GeneralLights'
import ApplicationView from './views/ApplicationView'
import Stage from './models/Stage'
import KeyState from 'key-state'

export default canvas => {

    const clock = new THREE.Clock();
    const origin = new THREE.Vector3(0,0,0);

    const screenDimensions = {
        width: canvas.width,
        height: canvas.height
    }

    const mousePosition = {
        x: 0,
        y: 0
    }

    const scene = buildScene();
    const renderer = buildRender(screenDimensions);
    const camera = buildCamera(screenDimensions);
    const sceneSubjects = createSceneSubjects(scene);
    const applicationView = new ApplicationView(renderer, scene,camera);
    const keys = KeyState(window, {
        left: [ "ArrowLeft" ],
        right: [ "ArrowRight" ],
        wallLeft: ["KeyA"],
        wallRight: ["keyD"]
    });

    // const orbitControls = buildOrbitControls(camera, renderer);

    function buildScene() {
        const scene = new THREE.Scene();

        return scene;
    }

    function setBackgroundColor() {
        scene.background = new THREE.Color("#FFF");
    }

    function buildRender({ width, height }) {
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
        camera.lookAt(origin);

        return camera;
    }

    function buildOrbitControls(camera, renderer) {
        const controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true
        controls.dampingFactor = 0.25
        controls.enableZoom = false
        return controls;
    }

    function createSceneSubjects(scene) {
        const sceneSubjects = [
            new GeneralLights(scene),
            new SceneSubject(scene)
        ];

        return sceneSubjects;
    }

    function update() {
        const elapsedTime = clock.getElapsedTime();

        for(let i=0; i<sceneSubjects.length; i++)
            sceneSubjects[i].update(elapsedTime);

        updateCameraRotation();
        applicationView.update(elapsedTime, keys);

        renderer.render(scene, camera);
    }

    function updateCameraRotation(){
        const rotSpeed = .1;

        var x = camera.position.x,
            y = camera.position.y,
            z = camera.position.z;

        if (keys.left){
            camera.position.x = x * Math.cos(rotSpeed) + z * Math.sin(rotSpeed);
            camera.position.z = z * Math.cos(rotSpeed) - x * Math.sin(rotSpeed);
        } else if (keys.right){
            camera.position.x = x * Math.cos(rotSpeed) - z * Math.sin(rotSpeed);
            camera.position.z = z * Math.cos(rotSpeed) + x * Math.sin(rotSpeed);
        }

        camera.lookAt(scene.position);

    }

    function updateCameraPositionRelativeToMouse() {
        camera.position.x += (  (mousePosition.x * 0.01) - camera.position.x ) * 0.01;
        camera.position.y += ( -(mousePosition.y * 0.01) - camera.position.y ) * 0.01;
        camera.lookAt(origin);
    }

    function onWindowResize() {
        const { width, height } = canvas;
        
        screenDimensions.width = width;
        screenDimensions.height = height;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        
        renderer.setSize(width, height);
    }

    function onMouseMove(x, y) {
        mousePosition.x = x;
        mousePosition.y = y;
    }

    return {
        update,
        onWindowResize,
        onMouseMove
    }
}