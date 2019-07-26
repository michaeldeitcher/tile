import Tile from '../InitialStates/Tile'
import {generate} from 'shortid'

export default (state, action) => {
    const tiles = state.get('tiles');
    const id = generate();
    let toMerge = {}
    toMerge[id] = Tile.addTile(id, action.data.position).mergeDeep({material: {color: state.getIn(['selection','color'])}});
    return state.mergeDeep({tiles: toMerge});
}