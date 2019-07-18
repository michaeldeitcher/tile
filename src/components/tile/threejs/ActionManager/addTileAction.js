import TileConfig from '../../../../TileConfig'
import ActionManager from '../ActionManager'
import Tile from '../models/Tile'
import TileBuilder from '../MeshBehaviors/TileBuilder'

export default (state, action) => {
    const tiles = state.get('tiles');
    //TODO fix use another id other than size
    const id = tiles.size;
    let toMerge = {}
    toMerge[id] = Tile.addTile(tiles.size, action.data.position);
    return state.mergeDeep({tiles: toMerge});
}