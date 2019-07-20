import * as THREE from 'three'
import Tile from './Tile'
import Selection from './Selection'

class TileContainer {
    constructor() {
        this.state = null;
        this.tiles = {};
        this.pressedControlPoint = null;

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

    render(state) {
        this.state = state;
        Selection.update(state.get('selection'));

        const tiles = state.get('tiles').toList();
        for (const tile of tiles) {
            this.renderTile(tile.get('id'), tile);
        }
    }
}

const instance = new TileContainer();

export default instance