class TileWebGL.Controllers.TileController
  constructor: (@layer) ->

  loadTiles: ->
    @addTileView(t.tile, t.location) for t in @layer.tiles

  addTile: (location) ->
    return if @tile
    @tile = @layer.addTile(location)
    @addTileView(@tile, location)

  addTileView: (tile, location) ->
    layerView = @layer.layerView
    layerView.addTile(tile, location)
    layerView.enableEditing()

  handleMouseUp: (coord) ->
    if TileWebGL.stage.activeLayer().tile?
      TileWebGL.activeLayerController().processAction 'clearSelection'
      true
    else
      false

class TileWebGL.Controllers.SegmentController
  constructor: ->

  handleMouseUp: (coord) ->
    if TileWebGL.stage.activeLayer().state == 'select_end'
      TileWebGL.activeLayerController().processAction 'addTileSegment', {coordinates: coord}
      true
    else
      false

class TileWebGL.Controllers.ControlPointController
  constructor: ->

  handleMouseMove: (coord) ->
    switch TileWebGL.stage.activeLayer().state
      when 'select_control_point', 'move_control_point'
        TileWebGL.activeLayerController().processAction 'moveControlPoint', {coordinates: coord}

  handleMouseUp: (coord) ->
    switch TileWebGL.stage.activeLayer().state
      when 'select_control_point'
        TileWebGL.activeLayerController().processAction 'removeControlPoint'
      when 'move_control_point'
        TileWebGL.stage.activeLayer().controlPoint = null
        TileWebGL.stage.activeLayer().state = 'select_all'
      else
        false



