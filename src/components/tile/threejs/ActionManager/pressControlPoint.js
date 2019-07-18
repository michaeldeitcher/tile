export default (state, action) => {
    return state.mergeDeep({selection: {pressed: {tileId: action.data.tileId, pointId: action.data.pointId}}})
}