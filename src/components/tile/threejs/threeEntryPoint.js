import SceneManager from './SceneManager';

export default container => {
    const canvas = createCanvas(document, container);
    const sceneManager = new SceneManager(canvas);

    let canvasHalfWidth;
    let canvasHalfHeight;

    bindEventListeners();
    render();

    function createCanvas(document, container) {
        const canvas = document.createElement('canvas');     
        container.appendChild(canvas);
        return canvas;
    }

    function bindEventListeners() {
        window.onresize = resizeCanvas;

        const el = canvas;
        if ("ontouchstart" in document.documentElement) {
            el.addEventListener("touchstart", event => {
                Array.from(event.changedTouches).map((touch) => touchStart(touch));
            });
            el.addEventListener("touchend", event => {
                Array.from(event.changedTouches).map((touch) => touchEnd(touch));
            });
            el.addEventListener("touchcancel", event => {
                Array.from(event.changedTouches).map((touch) => touchCancel(touch));
            });
            el.addEventListener("touchmove", event => {
                Array.from(event.changedTouches).map((touch) => touchMove(touch));
            });
        } else {
            el.addEventListener('mousemove', event => handleMoveEvent([event.clientX, event.clientY]));
            el.addEventListener('mouseup', event => handleUpEvent([event.clientX, event.clientY]));
            el.addEventListener('mousedown', event => handleDownEvent([event.clientX, event.clientY]));
        }

        resizeCanvas();	
    }

    function touchStart(touch) {
        sceneManager.handleDownEvent([touch.pageX, touch.pageY]);
    }
    function touchMove(touch) {
        sceneManager.handleMoveEvent([touch.pageX, touch.pageY]);
    }
    function touchEnd(touch) {
        sceneManager.handleUpEvent([touch.pageX, touch.pageY]);
    }


    function handleMoveEvent(coord) {
        sceneManager.handleMoveEvent(coord);
    }
    function handleUpEvent(coord) {
        sceneManager.handleUpEvent(coord);
    }
    function handleDownEvent(coord) {
        sceneManager.handleDownEvent(coord);
    }

    function resizeCanvas() {        
        canvas.style.width = '100%';
        canvas.style.height= '100%';
        
        canvas.width  = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        canvasHalfWidth = Math.round(canvas.offsetWidth/2);
        canvasHalfHeight = Math.round(canvas.offsetHeight/2);

        sceneManager.onWindowResize()
    }

    function mouseMove({screenX, screenY}) {
        sceneManager.onMouseMove(screenX-canvasHalfWidth, screenY-canvasHalfHeight);
    }

    function render(time) {
        requestAnimationFrame(render);
        sceneManager.update();
    }

    function subscribe(state) {
        sceneManager.subscribe(state);
    }
}