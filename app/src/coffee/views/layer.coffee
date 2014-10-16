class TileWebGL.Views.Layer
  constructor: () ->
    @stage = TileWebGL.appView.stage
    TileWebGL.layerView = @
    @tileViews = {}
    @controller = TileWebGL.appController.activeLayerController()
    @controller.onStateChange( (state) =>
#      @gLayer.classed('replay', state == 'replay')
    )

  append: (tag) ->
    @gLayer.append(tag)

  registerEditEventHandlers: ->

  redrawTile: (tile) ->
    tileView = @tileViews[tile.id]
    if !tileView
      tileView = new TileWebGL.Views.Tile(@, tile)
      @tileViews[tile.id] = tileView
    tileView.redraw()

  selectSegment: (tile, segment, state) ->
    @tileViewSelected.clearSelection() if @tileViewSelected
    @tileViewSelected = null
    tileView = @tileViews[tile.id]
    tileView.selectSegment(tile, segment, state)
    @tileViewSelected = tileView

  clearSelection: ->
    tileView = @tileViews[TileWebGL.stage.activeLayer().tile.id] if TileWebGL.stage.activeLayer().tile
    tileView.clearSelection() if tileView

  clear: ->
    tileView.clear() for id, tileView of @tileViews

#  EVENT HANDLERS

