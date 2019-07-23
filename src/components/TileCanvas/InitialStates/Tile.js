import { fromJS } from 'immutable'

import TileConfig from './TileConfig'
import { Geometry } from '../Geometry/Geometry' ;

const prefs = TileConfig.tile.prefs;
const tileWidth = prefs.width;
const initialLength = 100;

const startPointInitialState = fromJS({
    id: 0,
    pressed: false,
    position: [0,0,0]
});

const endPointInitialState = fromJS({
    id: 1,
    pressed: false,
    position: [initialLength,0,0]
});

const initialSegment = {
    id: 0,
    geometryPoints: [[0,-.5*tileWidth,0],[initialLength,-.5*tileWidth,0],[initialLength,.5*tileWidth,0],[0,.5*tileWidth,0]]
};

const initialState = fromJS({
    id: null,
    selected: true,
    objectType: 'tile',
    position: [],
    width: prefs.width,
    depth: prefs.depth,
    points: [startPointInitialState, endPointInitialState],
    segments: [initialSegment],
    segmentsLastCreatedIndex: 0,
    material: {
        colorName: "red",
        color: '#FF0000',
        colorAmbient: "#000000",
        colorEmissive: "#000000",
        colorSpecular: "#000000",
        shininess: 30,
        opacity: 1,
        material: "Lambert",
        transparent: true
    }
});

export default class Tile {
    static addTile(id, position) {
        return initialState.merge({id,position});
    }

    static setMaterial(state, material) {
        return state.mergeDeep({material: material})
    }
}







