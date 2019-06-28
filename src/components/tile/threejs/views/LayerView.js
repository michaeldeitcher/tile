import AppController from '../controllers/ApplicationController'
import Stage from '../models/Stage'
import TileView from './TileView'
import WallView from './WallView'

class LayerView {
    constructor() {
        this.instance = this;
        this.tileViews = {};
        this.controller = AppController.activeLayerController();
        this.showWall();
    }

    redrawTile(tile, forceSelected) {
        if (forceSelected == null) { forceSelected = false; }
        let tileView = this.tileViews[tile.id];
        if (!tileView) {
            tileView = new TileView(this, tile);
            this.tileViews[tile.id] = tileView;
        }
        if (forceSelected) { tileView.tileSelected = true; }
        return tileView.redraw();
    }

    clearSelection() {
        let tileView;
        this.stage = Stage.instance;
        if (this.stage.activeLayer().tile) { tileView = this.tileViews[this.stage.activeLayer().tile.id]; }
        if (tileView) { return tileView.selectTile(false); }
    }

    clear() {
        for (let id in this.tileViews) { const tileView = this.tileViews[id]; tileView.destroy(); }
        return this.tileViews = {};
    }

    showWall(show) {
        if (show == null) { show = true; }
        if (show) {
            return this.wall = new WallView().create();
        } else {
            if (this.wall) {
                this.wall.destroy();
                return this.wall = null;
            }
        }
    }
}

export default LayerView


