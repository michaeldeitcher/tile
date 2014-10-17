class TileWebGL.Controllers.LayerController
  constructor: (@svg, @stageSize) ->
    TileWebGL.appController.onStateChange( (state) =>
      @changeState(state)
    )

  start: ->
    @initStateMachine()
    @layer = TileWebGL.stage.activeLayer()
    @layerView = new TileWebGL.Views.Layer()
    @layer.layerView = @layerView
    @layerView.registerEditEventHandlers()

    @tileController = new TileWebGL.Controllers.TileController(@layer)
    @tileController.loadTiles()

    @segmentController = new TileWebGL.Controllers.SegmentController()
    @controlPointController = new TileWebGL.Controllers.ControlPointController()
    @processAction 'setVersionInfo', {version: '0.2'}

  mouseMove: ( coord ) ->
    return unless @state is 'create'
    return if @controlPointController.handleMouseMove(coord)

  mouseUp: ( coord ) ->
    return @ignoreUp = false if @ignoreUp
    return if TileWebGL.toolbarController.handleMouseUp(coord)
#    return if @controlPointController.handleMouseUp(coord)
#    return if @segmentController.handleMouseUp(coord)
#    return if @tileController.handleMouseUp(coord)
    TileWebGL.toolbarController.showToolbar coord

  mouseDown: (coord) ->
    switch @state
      when 'replay'
        @layer.pauseAnimation()
        TileWebGL.toolbarController.showToolbar(coord)
      else
        return

  selectTileSegment: (tileId, segmentId)  ->
    TileWebGL.toolbarController.closeToolbar()
    @processAction('selectTileSegment', {tile: tileId, segment: segmentId})
    @ignoreUp = true

  processAction: (action, d = {}) ->
    d['action'] = action
    @layer.addAction(d)
    @layer.processActions()

#### STATE MACHINE
  initStateMachine: ->
    @states = ['init', 'create', 'replay', 'show']
    @stateHandlers = []
    @changeState('init')

  changeState: (state) ->
    return if @state is state
    throw 'not a valid state' if $.inArray(state, @states) is -1
    lastState = @state
    @state = state
    handler(state) for handler in @stateHandlers
    lastState

  onStateChange: (handler) ->
    @stateHandlers.push(handler)