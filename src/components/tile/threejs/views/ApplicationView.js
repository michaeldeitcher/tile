import * as THREE from 'three'
import AppController from '../controllers/ApplicationController'

export default class ApplicationView {

    constructor(renderer, scene, camera) {
        this.objects = []
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this.registerEvents();
        AppController.start(this);
    }

    addToScene(threeMeshObject) {
        this.scene.add(threeMeshObject);
        return this.objects.push(threeMeshObject);
    }

    removeFromScene(threeMeshObject) {
        this.scene.remove(threeMeshObject);
        const index = this.objects.indexOf(threeMeshObject);
        if (index > -1) { return this.objects.splice(index, 1); }
    }

    registerEvents() {
        // THREEx.WindowResize(this.renderer, this.camera);
        // THREEx.FullScreen.bindKey({charCode: "m".charCodeAt(0)});

        this.touches = {};
        const el = this.renderer.domElement;
        if ("ontouchstart" in document.documentElement) {
            el.addEventListener("touchstart", event => {
                return Array.from(event.changedTouches).map((touch) => this.touchStart(touch));
        });
            el.addEventListener("touchend", event => {
                return Array.from(event.changedTouches).map((touch) => this.touchEnd(touch));
        });
            el.addEventListener("touchcancel", event => {
                return Array.from(event.changedTouches).map((touch) => this.touchCancel(touch));
        });
            return el.addEventListener("touchmove", event => {
                    return Array.from(event.changedTouches).map((touch) => this.touchMove(touch));
        });
        } else {
            el.addEventListener('mousemove', event => this.handleMoveEvent([event.clientX, event.clientY]));
            el.addEventListener('mouseup', event => this.handleUpEvent([event.clientX, event.clientY]));
            return el.addEventListener('mousedown', event => this.handleDownEvent([event.clientX, event.clientY]));
        }
    }

    copyTouch(touch) {
        return { identifier: touch.identifier, pageX: touch.pageX, pageY: touch.pageY };
    }

    touchStart(touch) {
        this.touches[touch.identifier] = touch;
        return this.handleDownEvent([touch.pageX, touch.pageY]);
    }

    touchMove(touch) {
        return this.handleMoveEvent([touch.pageX, touch.pageY]);
    }

    touchEnd(touch) {
        return this.handleUpEvent([touch.pageX, touch.pageY]);
    }

    handleMoveEvent(coord) {
        if (this.ignoreMouseEvents) { return; }
        const intersect = this.raycastIntersects(coord);
        if (intersect != null) {
            if (!intersect.object.view.mouseMove([intersect.point.x, intersect.point.y])) {
                const layerController = AppController.activeLayerController();
                return layerController.mouseMove([intersect.point.x, intersect.point.y]);
            }
        }
    }

    handleUpEvent(coord) {
        if (this.ignoreMouseEvents) { return; }
        const intersect = this.raycastIntersects(coord);
        if (intersect != null) {
            if (!intersect.object.view.mouseUp([intersect.point.x, intersect.point.y])) {
                const layerController = AppController.activeLayerController();
                return layerController.mouseUp([intersect.point.x, intersect.point.y]);
            }
        }
    }

    handleDownEvent(coord) {
        if (this.ignoreMouseEvents) { return; }
        const intersect = this.raycastIntersects(coord);
        if (intersect != null) {
            return intersect.object.view.mouseDown([intersect.point.x, intersect.point.y]);
        }
    }

    raycastIntersects(clientCoord) {
        const mouseX = (( clientCoord[0] / window.innerWidth ) * 2) - 1;
        const mouseY = (- ( clientCoord[1] / window.innerHeight ) * 2) + 1;

        const mouse2D = new THREE.Vector2( mouseX, mouseY );
        const rayCaster = new THREE.Raycaster();
        rayCaster.setFromCamera( mouse2D, this.camera );
        const objects = rayCaster.intersectObjects( this.objects );
        if (objects) { return objects[0]; }
    }

}