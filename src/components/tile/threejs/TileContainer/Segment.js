import * as THREE from 'three'
import TileConfig from '../../../../TileConfig'
import ActionManager from '../ActionManager'

export default Segment {
    contructor(group) {
        this.group = group;
        this.threeObject = null;
    }

    render(state) {
        this.state = state;
        this.addToScene();
        console.log(state);
    }


    addToScene() {

    }

    removeFromScene() {

    }
}