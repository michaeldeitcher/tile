class TileWebGL.Controllers.ToolbarController
  constructor: (@svg) ->
    TileWebGL.toolbarController = @
    @toolbar = new TileWebGL.Views.Toolbar(@)
    @addTile = true
    TileWebGL.appController.onStateChange( (state) =>
      switch state
        when 'replay'
          @toolbar.enableReplay()
        when 'create'
          @toolbar.enableEdit()
        when 'show'
          @toolbar.enableShow()
    )

  flashMessage: (@msg) ->
    @hud.flashMessage(@msg)

  toolbarOpen: ->
    if @toolbar.opened
      d3.event.stopPropagation()
      true
    else
      false

  addPressed: ->
    return unless @toolbarOpen()
    @addTile = true
    @closeToolbar()

  clearPressed: ->
    return unless @toolbarOpen()
    TileWebGL.appController.clearStage()
    @closeToolbar()

  exitPressed: ->
    return unless @toolbarOpen()
    @closeToolbar()

  replayPressed: ->
    return unless @toolbarOpen()
    @closeToolbar()
    TileWebGL.appController.replayCanvas()

  continueReplayPressed: ->
    return unless @toolbarOpen()
    @closeToolbar()
    TileWebGL.stage.activeLayer().continueAnimation()

  completeReplayPressed: ->
    return unless @toolbarOpen()
    @closeToolbar()
    TileWebGL.stage.activeLayer().completeAnimation()

  savePressed: ->
    return unless @toolbarOpen()
    @closeToolbar()
    TileWebGL.updateTileProject()

  handleMouseUp: (coord) ->
    TileWebGL.activeLayerController().processAction 'addTile', {coordinates: [coord[0], coord[1] - (.5 * TileWebGL.prefs.width)]}

  showToolbar: (coord) ->
    @toolbar.open()
    @addTile = true if TileWebGL.appController.state == 'create'
    @targetCoord = coord

  closeToolbar: ->
    @toolbar.close()
    @targetCoord = null
    @addTile = false
