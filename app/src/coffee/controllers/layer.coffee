class TileWebGL.Controllers.LayerController
  constructor: (@svg, @stageSize) ->

  start: ->
    @layer = TileWebGL.stage.activeLayer()
    @layerView = new TileWebGL.Views.Layer()
    @layer.layerView = @layerView

    @tileController = new TileWebGL.Controllers.TileController(@layer)
    @tileController.loadTiles()

    @segmentController = new TileWebGL.Controllers.SegmentController()
    @controlPointController = new TileWebGL.Controllers.ControlPointController()
    @processAction 'setVersionInfo', {version: '0.2'}
    @selectedTileSegment = null

  setMaterial: (material) ->
    @processAction 'setMaterial', {material: material}

  selectTileSegment: ( selection ) ->
    @processAction 'clearSelection' if @layer.segment
    @processAction 'selectTileSegment', {tile: selection[0], segment: selection[1]}

  splitTileSegment: ( selection ) ->
    @processAction 'splitTileSegment', {tile: selection[0], segment: selection[1]}
    @selectedControlPoint = null

  isTileSelected: (selection) ->
    return false unless @layer.tile
    @layer.tile.id == selection[0]

  toggleWall: ->
    @layerView.showWall !@layerView.wall?

  mouseUp: (coord) ->
    return @controlPointMoving = false if @controlPointMoving

    if @layer.segment
      @processAction 'clearSelection'
    else
      @processAction 'addTile', {coordinates: [coord[0], coord[1] - (.5 * TileWebGL.prefs.width)]}

  mouseMove: (point) ->
    if @controlPointMoving
      @processAction 'moveControlPoint', {coordinates: point}
      @controlPointMoved = true

  controlPointMouseDown: (id) ->
    if !@layer.controlPoint || @layer.controlPoint.id != id
      @processAction 'selectControlPoint', {id: id}
      @controlPointMoving = true
      @controlPointMoved = false

  controlPointMouseUp: (id) ->
    if @controlPointMoving
      @controlPointMoving = false
    else
      if @layer.controlPoint && @layer.controlPoint.id == id
        if @controlPointMoved
          @controlPointMoved = false
        else
          @processAction 'removeControlPoint'

  processAction: (action, d = {}) ->
    d['action'] = action
    @layer.addAction(d)
    @layer.processActions()