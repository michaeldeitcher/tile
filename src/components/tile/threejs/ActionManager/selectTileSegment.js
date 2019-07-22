import ActionManager from '../ActionManager'

export default (state, action) => {
    return state.setIn(['selection','tileId'], action.data.tileId);
}