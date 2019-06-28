import AppController from './ApplicationController'
import Stage from '../models/Stage'

export default class TileController {
    constructor(layer) {
        this.layer = layer;
    }

    loadTiles() {
        return Array.from(this.layer.tiles).map((t) => this.addTileView(t.tile, t.location));
    }

    addTile(location) {
        if (this.tile) { return; }
        this.tile = this.layer.addTile(location);
        return this.addTileView(this.tile, location);
    }

    addTileView(tile, location) {
        const { layerView } = this.layer;
        layerView.addTile(tile, location);
        return layerView.enableEditing();
    }

    handleMouseUp(coord) {
        if (Stage.instance.activeLayer().tile != null) {
            AppController.activeLayerController().processAction('clearSelection');
            return true;
        } else {
            return false;
        }
    }
}
