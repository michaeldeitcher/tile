import AppController from '../controllers/ApplicationController'
import TileConfig from '../../TileConfig'
import Tile from './Tile'
import { Geometry } from '../../../../geometry' ;

class Layer {
    constructor(stage) {
        this.stage = stage;
        this.startTime = new Date().getTime();
        this.history = [];
        this.tiles = [];
        this.actions = [];
        //selections
        this.tile = null;
        this.segment = null;
        this.controlPoint = null;
        this.material = TileConfig.tile.material;
        this.state = 'create';
        this.initializeStateMachine();
    }

    initializeStateMachine() {
        return AppController.onStateChange( state => {
                return this.state = state;
    });
    }

    clear() {
        this.layerView.clear();
        this.tile = null;
        this.segment = null;
        this.controlPoint = null;
        return this.tiles = [];
    }

    addAction(action){
        if (this.controlPoint && (action.action === 'moveControlPoint')) {
            const ptCoord = Geometry.addPoint(this.controlPoint.coord(), this.tile.location);
            action.location_delta = Geometry.subtractPoint(ptCoord, action.coordinates);
        }

        return this.actions.push(action);
    }

    processActions() {
        return (() => {
                const result = [];
        while (this.actions.length > 0) {
            const action = this.actions.pop();
            //TODO
            // TileWebGL.api.sendAction(action);
            result.push(this.processAction(action));
        }
        return result;
    })();
    }

    processAction(d,elapsedTime=null) {
//    console.log d unless d.action == 'moveControlPoint'
        let now;
        //TODO
        // TileWebGL.Models.Macro.processAction(d);
        if (this.version === '0.01') {
            const p = d.coordinates;
            if (p) { d.coordinates = [ p[0] - 250, 250 - p[1] ]; }
        }

        switch (d.action) {
            case 'addTile': this.addTile(d); break;
            case 'addTileSegment': this.addTileSegment(d); break;
            case 'selectTileSegment': this.selectTileSegment(d); break;
            case 'splitTileSegment': this.splitTileSegment(d); break;
            case 'selectControlPoint': this.selectControlPoint(d); break;
            case 'clearSelection': this.clearSelection(d); break;
            case 'moveControlPoint': this.moveControlPoint(d); break;
            case 'removeControlPoint': this.removeControlPoint(d); break;
            case 'setMaterial': this.setMaterial(d); break;
            case 'setVersionInfo': this.setVersion(d); break;
            case 'playMacro': this.playMacro(d); break;
            case 'startMacro': this.startMacro(d); break;
            case 'macroAddTileSegment': this.macroAddTileSegment(d); break;
            default:
                throw 'unsupported action';
        }
        // return unless @state == 'create'
        if (elapsedTime == null) {
            now = new Date().getTime();
            elapsedTime = (this.lastTime != null) ? now - this.lastTime : 0;
        }
        console.log(d);
        this.history.push([d, elapsedTime]);
        return this.lastTime = now;
    }

    animateHistory(replay) {
        this.replay = replay;
        var processHistoryAction = () => {
            if (this.paused) { return; }
            this.processAction(this.history_item[0]);
            this.history_item = this.replay.pop();
            if (this.history_item != null) {
                const timeOut = this.history_item[1] > 250 ? 250 : this.history_item[1];
                return setTimeout( processHistoryAction, timeOut);
            } else {
                return AppController.onDoneReplay();
            }
        };

        this.history_item = this.replay.pop();
        return processHistoryAction();
    }

    pauseAnimation() {
        return this.paused = true;
    }

    continueAnimation() {
        this.paused = false;
        return this.animateHistory(this.replay);
    }

    completeAnimation() {
        while (this.replay.length > 0) {
            this.processAction(this.replay.pop()[0]);
        }
        this.clearSelection();
        return AppController.onDoneReplay();
    }

    addTile(d) {
        this.tile = new Tile(this.tiles.length, d.coordinates);
        this.tile.setMaterial(this.material);
        this.tiles.push(this.tile);
        this.segment = this.tile.getSegment(0);
        return this.layerView.redrawTile(this.tile, true);
    }

    addTileSegment(d) {
        const segment = this.tile.addTileSegment(subtractPoint(d.coordinates, this.tile.location));
        this.layerView.redrawTile(this.tile);
        return this.selectTileSegment({tile: this.tile.id, segment: segment.id});
    }

    selectTileSegment(d, state) {
        if (state == null) { state = 'select_all'; }
        this.state = state;
        this.tile = this.tiles[d.tile];
        const segment = this.tile.getSegment(d.segment);
        return this.segment = segment;
    }
//    TileWebGL.DATGUI.updateMaterial(@tile.getMaterial())

    isSegmentSelected(tileId, segmentId) {
        return this.tile && (this.tile.id === tileId) && this.segment && (this.segment.id === segmentId);
    }

    splitTileSegment(d) {
        this.tile = this.tiles[d.tile];
        this.segment = this.tile.getSegment(d.segment);
        this.segment.split();
        this.controlPoint = null;
        return this.layerView.redrawTile(this.tile);
    }

    selectControlPoint(d) {
        this.controlPoint = this.tile.getControlPoint(d.id);
        return this.state = 'select_control_point';
    }

    clearSelection() {
        this.layerView.clearSelection();
        this.tile = null;
        this.segment = null;
        this.controlPoint = null;
        return this.state = 'none';
    }

    moveControlPoint(d) {
//    try
        if (d.location_delta != null) {
            this.controlPoint.moveDelta(d.location_delta);
        } else {
            this.controlPoint.move(subtractPoint(d.coordinates, this.tile.location));
        }
        this.layerView.redrawTile(this.tile);
        return this.state = 'move_control_point';
    }
//    catch error
//      @controlPoint = null

    removeControlPoint(d) {
        this.controlPoint.remove();
        return this.layerView.redrawTile(this.tile, true);
    }

    setVersion(d) {
        this.version = d.version;
        return this.clear();
    }

    playMacro(d) {
        TileWebGL.Models.MacroReplay.stop = false;
        return this.replayMacro = new TileWebGL.Models.MacroReplay(d,this).play();
    }

    stopMacro() {
        return this.replayMacro.stop();
    }

    macroAddTileSegment(d) {
        const segment = this.tile.addTileSegment();
        this.layerView.redrawTile(this.tile);
        return this.selectTileSegment({tile: this.tile.id, segment: segment.id});
    }

    setMaterial(d) {
        this.material = Object.create(d.material);
        if (this.tile) {
            this.tile.setMaterial(this.material);
            return this.layerView.redrawTile(this.tile);
        }
    }
}

export default Layer