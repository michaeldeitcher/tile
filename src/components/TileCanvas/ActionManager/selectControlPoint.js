export default (state, action) => {
    return state.mergeDeep({selection: {tileId: action.data.tileId, pointId: action.data.pointId}})
}