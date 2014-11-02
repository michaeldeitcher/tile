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

  mouseMove: (point) ->
    @processAction 'moveControlPoint', {coordinates: point} if @controlPointMoving

  mouseUp: (coord) ->
    return @controlPointMoving = false if @controlPointMoving

    if @layer.segment
      @processAction 'clearSelection'
    else
      @processAction 'addTile', {coordinates: [coord[0], coord[1] - (.5 * TileWebGL.prefs.width)]}

  setMaterial: (material) ->
    @processAction 'setMaterial', {material: material}

  selectTileSegment: ( selection ) ->
    @processAction 'clearSelection' if @selectedTileSegment
    @selectedTileSegment = selection
    @processAction 'selectTileSegment', {tile: selection[0], segment: selection[1]}

  splitTileSegment: ( selection ) ->
    @processAction 'splitTileSegment', {tile: selection[0], segment: selection[1]}
    @selectedControlPoint = null

  isCurrentSegmentSelected: (selection) ->
    return false unless @selectedTileSegment?
    @selectedTileSegment[0] == selection[0] && @selectedTileSegment[1] == selection[1]

  toggleWall: ->
    @layerView.showWall !@layerView.wall?

  controlPointMouseDown: (id) ->
    if @selectedControlPoint != id
      @processAction 'selectControlPoint', {id: id}
      @selectedControlPoint = id
      @controlPointMoving = true

  controlPointMouseUp: (id) ->
    if @controlPointMoving
      @controlPointMoving = false
      @selectedControlPoint = null
    else
      @processAction 'removeControlPoint' if @selectedControlPoint == id

  processAction: (action, d = {}) ->
    d['action'] = action
    @layer.addAction(d)
    @layer.processActions()