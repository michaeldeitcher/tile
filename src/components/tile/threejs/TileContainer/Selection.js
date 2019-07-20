class Selection {

    constructor() {
        this.tileId = null;
        this.pointId = null;

        if (!Selection.instance) {
            Selection.instance = this
        }
        return Selection.instance;
    }

    update(state) {
        this.tileId = state.get('tileId');
        const pressed = state.get('pressed');
        this.pressed = {
            tileId: pressed.get('tileId'),
            pointId: pressed.get('pointId'),
            position: pressed.get('position')
        };
    }
}

const instance = new Selection();

export default instance;