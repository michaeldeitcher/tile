import ActionManager from '../ActionManager'

class Selection {

    constructor() {
        this.movingPointId = null;

        this.tileId = null;
        this.pointId = null;

        if (!Selection.instance) {
            Selection.instance = this
        }
        return Selection.instance;
    }

    update(state) {
        this.tileId = state.get('tileId');
        this.pointId = state.get('pointId');

        const color = state.get('color');
        // if( this.color !== color ){
        //     this.color = color;
        //     if( this.tileId !== null ) {
        //         ActionManager.addAction('setMaterial', {tileId: this.tileId, color: color});
        //     }
        // }
    }
}

const instance = new Selection();

export default instance;