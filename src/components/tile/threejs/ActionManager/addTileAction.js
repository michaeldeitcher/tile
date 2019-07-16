import TileConfig from '../../../../TileConfig'
import ActionManager from '../ActionManager'
import Tile from '../models/Tile'
import TileBuilder from '../MeshBehaviors/TileBuilder'

export default action => {
    let tile = new Tile(Object.keys(ActionManager.tileBuilders).length, action.data.location);
    let material = TileConfig.tile.material;
    material.color = ActionManager.state.menuState.colorSelected;
    tile.setMaterial(material);
    let tileBuilder = new TileBuilder(tile);
    ActionManager.tileBuilders[tile.id] = tileBuilder;
    ActionManager.tileId = tile.id;
}