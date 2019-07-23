export default (state, action) => {
    const tileId = action.data.tileId.toString();
    return state.setIn(['tiles',tileId,'material', 'color'], action.data.color);
}