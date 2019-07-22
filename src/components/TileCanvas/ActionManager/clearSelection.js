export default (state, action) => {
    return state.mergeDeep({selection: {tileId: null, pointId: null, pressed: {tileId: null, pointId: null, position: null}}})
}