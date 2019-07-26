import * as THREE from 'three'
import Tile from './Tile'
import Selection from './Selection'
import ActionManager from '../ActionManager'

class TileContainer {
    constructor() {
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

    clearCanvas( tiles ) {
        for (const tile of tiles) {
            var tileContainer = this.tiles[tile.get('id')];
            if(tileContainer !== null)
                tileContainer.remove();
        }
    }

    render(state) {
        ActionManager.state = state;
        this.state = state;
        const tiles = state.get('tiles').toList();

        if(state.get('state') === 'clearCanvas')
            return this.clearCanvas(tiles);

        Selection.update(state.get('selection'));

        for (const tile of tiles) {
            this.renderTile(tile.get('id'), tile);
        }
    }
}

const instance = new TileContainer();

export default instance