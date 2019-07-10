import TileController from './TileController'
import SegmentController from './SegmentController'
import ControlPointController from './ControlPointController'
import Stage from '../models/Stage'
import LayerView from '../views/LayerView'
import TileConfig from '../../TileConfig'

export default class LayerController {
    start() {
        this.layer = Stage.instance.activeLayer();
        this.layerView = new LayerView();
        this.layer.layerView = this.layerView;

        this.tileController = new TileController(this.layer);
        this.tileController.loadTiles();

        this.segmentController = new SegmentController();
        this.controlPointController = new ControlPointController();
        this.processAction('setVersionInfo', {version: '0.2'});
        return this.selectedTileSegment = null;
    }

    setMaterial(material) {
        return this.processAction('setMaterial', {material});
    }

    selectTileSegment( selection ) {
        if (this.layer.segment) { this.processAction('clearSelection'); }
        return this.processAction('selectTileSegment', {tile: selection[0], segment: selection[1]});
    }

    splitTileSegment( selection ) {
        this.processAction('splitTileSegment', {tile: selection[0], segment: selection[1]});
        return this.selectedControlPoint = null;
    }

    isTileSelected(selection) {
        if (!this.layer.tile) { return false; }
        return this.layer.tile.id === selection[0];
    }

    toggleWall() {
        return this.layerView.showWall((this.layerView.wall == null));
    }

    mouseUp(point) {
        if (this.controlPointMoving) { return this.controlPointMoving = false; }
        if (this.layer.segment) {
            return this.processAction('clearSelection');
        } else {
            return this.processAction('addTile', {coordinates: [point.x, point.y - (.5 * TileConfig.tile.prefs.width)]});
        }
    }

    mouseMove(point) {
        if (this.controlPointMoving) {
            this.processAction('moveControlPoint', {coordinates: point});
            return this.controlPointMoved = true;
        }
    }

    controlPointMouseDown(id) {
        if (!this.layer.controlPoint || (this.layer.controlPoint.id !== id)) {
            this.processAction('selectControlPoint', {id});
            this.controlPointMoving = true;
            return this.controlPointMoved = false;
        }
    }

    controlPointMouseUp(id) {
        if (this.controlPointMoving) {
            return this.controlPointMoving = false;
        } else {
            if (this.layer.controlPoint && (this.layer.controlPoint.id === id)) {
                if (this.controlPointMoved) {
                    return this.controlPointMoved = false;
                } else {
                    return this.processAction('removeControlPoint');
                }
            }
        }
    }

    processAction(action, d) {
        if (d == null) { d = {}; }
        d['action'] = action;
        this.layer.addAction(d);
        return this.layer.processActions();
    }

    playMacro() {
        // const macro = TileWebGL.Models.Macro.recordingMacro();
        // const d = {macro_id: macro.id};
        // return this.processAction('playMacro', d);
    }
}