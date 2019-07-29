import * as THREE from 'three'
import Tile from './Tile'
import Selection from './Selection'
import ActionManager from '../ActionManager'

class TileContainer {
    constructor() {
        this.documentId = null;
        this.pressedControlPoint = this.state = null;
        this.tiles = {};

        if (!TileContainer.instance) {
            TileContainer.instance = this
        }
        return TileContainer.instance;
    }

    renderTile(id, state) {
        var tile = this.tiles[id];
        if(tile == null) {
            tile = new Tile(id);
            this.tiles[id] = tile;
        }
        tile.render(state);
    }

    clearCanvas() {
        for (const tile of Object.values(this.tiles)) {
            tile.remove();
        }
        this.tiles = {};
    }

    render(state) {
        const documentId = state.get('currentDocumentId');
        const documentState = state.getIn(['documents', documentId]);

        ActionManager.state = documentState;
        this.state = documentState;

        if(documentId != this.documentId) {
            this.clearCanvas(tiles);
            this.documentId = documentId;
        }

        Selection.update(this.state.get('selection'));

        const tiles = this.state.get('tiles').toList();
        for (const tile of tiles) {
            this.renderTile(tile.get('id'), tile);
        }
    }
}

const instance = new TileContainer();

export default instance