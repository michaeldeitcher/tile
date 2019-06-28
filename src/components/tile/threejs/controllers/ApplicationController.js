import LayerController from './LayerController';
import Stage from '../models/Stage'

class AppController {
    constructor() {
        if (!AppController.instance) {
            AppController.instance = this
            this.initStateMachine();
            // this.appView = new TileWebGL.Views.AppView();
            // TileWebGL.activeLayerController = this.activeLayerController;
        }

        return instance;
    }

    start(applicationView) {
        //stage
        this.appView = applicationView;
        this.stage = new Stage();
        this.layerControllers = [new LayerController()];
        this.activeLayerController().start();
        return this.changeState('create');
    }

    activeLayerController() {
        return AppController.instance.layerControllers[0];
    }

    zoomIn() {
        return this.appView.adjustCameraPosition([0,0,-200]);
    }

    zoomOut() {
        return this.appView.adjustCameraPosition([0,0,200]);
    }

    clearStage() {
        this.stage.clear();
        this.start();
        return this.enableEditing();
    }

    replayHistoryString(historyString) {
        return this.replayHistory(JSON.parse( historyString ));
    }

    historyString() {
        return JSON.stringify(this.activeLayerController().layer.history);
    }

    enableEditing() {
        return this.changeState('create');
    }

    replayHistory(history) {
        this.lastState = this.changeState('replay');
        return this.activeLayerController().layer.animateHistory(history.reverse());
    }

    enterReceiveState() {
        this.stage.clear();
        this.start();
        return this.changeState('receive');
    }

    replayCanvas() {
        this.stage.clear();
        const { history } = this.activeLayerController().layer;
        const lastState = this.state;
        this.start();
        this.changeState('replay');
        this.lastState = lastState;
        return this.activeLayerController().layer.animateHistory(history.reverse());
    }


    onDoneReplay() {
        return this.changeState(this.lastState);
    }

    setMaterial(material) {
        return Array.from(this.layerControllers).map((layer) => layer.setMaterial(material));
    }

    toggleOrbitControls() {
        if (this.orbitOn) {
            this.appView.disableOrbitControls();
            return this.orbitOn = false;
        } else {
            this.appView.enableOrbitControls();
            return this.orbitOn = true;
        }
    }

//### STATE MACHINE
    initStateMachine() {
        this.states = ['init', 'create', 'replay', 'show', 'receive'];
        this.stateHandlers = [];
        return this.changeState('init');
    }

    changeState(state) {
        if (this.state === state) { return; }
        if (!this.states.includes(state)) { throw 'not a valid state'; }
        const lastState = this.state;
        this.state = state;
        for (let handler of Array.from(this.stateHandlers)) { handler(state); }
        return lastState;
    }

    onStateChange(handler) {
        return this.stateHandlers.push(handler);
    }
};

const instance = new AppController()

export default instance