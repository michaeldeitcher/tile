import Tile from '../InitialStates/Tile'

export default (state, action) => {
    const tiles = state.get('tiles');
    //TODO fix use another id other than size
    const id = tiles.size;
    let toMerge = {}
    toMerge[id] = Tile.addTile(tiles.size, action.data.position).mergeDeep({material: {color: state.getIn(['selection','color'])}});
    return state.mergeDeep({tiles: toMerge});
}