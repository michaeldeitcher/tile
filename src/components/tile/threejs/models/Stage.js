import Layer from './Layer'

class Stage {
    constructor() {
        Stage.instance = this
        this.layers = [];
        this.macros = [];
        this.layers[0] = new Layer(this);
    }

    clear() {
        return Array.from(this.layers).map((layer) => layer.clear());
    }

    activeLayer() {
        return this.layers[0];
    }

    static setCameraPosition(position) {
        return localStorage.setItem('camera', JSON.stringify(position));
    }

    static getCameraPosition() {
        const camera = localStorage.getItem('camera');
        if (camera) {
            return JSON.parse(camera);
        } else {
            return [0, 0, 3000];
        }
    }
};

export default Stage