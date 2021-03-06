class TileWebGL.Models.Layer
  constructor: (@stage) ->
    @startTime = new Date().getTime()
    @history = []
    @tiles = []
    @actions = []
    #selections
    @tile = null
    @segment = null
    @controlPoint = null
    @material = TileWebGL.config.tile.material
    @state = 'create'
    @initializeStateMachine()

  initializeStateMachine: ->
    TileWebGL.appController.onStateChange( (state) =>
      @state = state
    )

  clear: ->
    @layerView.clear()
    @tile = null
    @segment = null
    @controlPoint = null
    @tiles = []

  addAction: (action)->
    if @controlPoint && action.action == 'moveControlPoint'
      ptCoord = addPoint @controlPoint.coord(), @tile.location
      action.location_delta = subtractPoint ptCoord, action.coordinates

    @actions.push(action)

  processActions: ->
    while @actions.length > 0
      action = @actions.pop()
      TileWebGL.api.sendAction action
      @processAction action

  processAction: (d,elapsedTime=null) ->
#    console.log d unless d.action == 'moveControlPoint'
    TileWebGL.Models.Macro.processAction d
    if @version == '0.01'
      p = d.coordinates
      d.coordinates = [ p[0] - 250, 250 - p[1] ] if p

    switch d.action
      when 'addTile' then @addTile(d)
      when 'addTileSegment' then @addTileSegment(d)
      when 'selectTileSegment' then @selectTileSegment(d)
      when 'splitTileSegment' then @splitTileSegment(d)
      when 'selectControlPoint' then @selectControlPoint(d)
      when 'clearSelection' then @clearSelection(d)
      when 'moveControlPoint' then @moveControlPoint(d)
      when 'removeControlPoint' then @removeControlPoint(d)
      when 'setMaterial' then @setMaterial(d)
      when 'setVersionInfo' then @setVersion(d)
      when 'playMacro' then @playMacro(d)
      when 'startMacro' then @startMacro(d)
      when 'macroAddTileSegment' then @macroAddTileSegment(d)
      else
        throw 'unsupported action'
    # return unless @state == 'create'
    unless elapsedTime?
      now = new Date().getTime()
      elapsedTime = if @lastTime? then now - @lastTime else 0
    console.log(d);
    @history.push [d, elapsedTime]
    @lastTime = now

  animateHistory: (@replay) ->
    processHistoryAction = =>
      return if @paused
      @processAction @history_item[0]
      @history_item = @replay.pop()
      if @history_item?
        timeOut = if @history_item[1] > 250 then 250 else @history_item[1]
        setTimeout( processHistoryAction, timeOut)
      else
        TileWebGL.appController.onDoneReplay()

    @history_item = @replay.pop()
    processHistoryAction()

  pauseAnimation: ->
    @paused = true

  continueAnimation: ->
    @paused = false
    @animateHistory(@replay)

  completeAnimation: ->
    while @replay.length > 0
      @processAction @replay.pop()[0]
    @clearSelection()
    TileWebGL.appController.onDoneReplay()

  addTile: (d) ->
    @tile = new TileWebGL.Models.Tile(@tiles.length, d.coordinates)
    @tile.setMaterial @material
    @tiles.push @tile
    @segment = @tile.getSegment(0)
    @layerView.redrawTile(@tile, true)

  addTileSegment: (d) ->
    segment = @tile.addTileSegment(subtractPoint(d.coordinates, @tile.location))
    @layerView.redrawTile(@tile)
    @selectTileSegment({tile: @tile.id, segment: segment.id})

  selectTileSegment: (d, @state = 'select_all') ->
    @tile = @tiles[d.tile]
    segment = @tile.getSegment(d.segment)
    @segment = segment
#    TileWebGL.DATGUI.updateMaterial(@tile.getMaterial())

  isSegmentSelected: (tileId, segmentId) ->
    @tile && @tile.id == tileId && @segment && @segment.id == segmentId

  splitTileSegment: (d) ->
    @tile = @tiles[d.tile]
    @segment = @tile.getSegment(d.segment)
    @segment.split()
    @controlPoint = null
    @layerView.redrawTile(@tile)

  selectControlPoint: (d) ->
    @controlPoint = @tile.getControlPoint(d.id)
    @state = 'select_control_point'

  clearSelection: ->
    @layerView.clearSelection()
    @tile = null
    @segment = null
    @controlPoint = null
    @state = 'none'

  moveControlPoint: (d) ->
#    try
    if d.location_delta?
      @controlPoint.moveDelta d.location_delta
    else
      @controlPoint.move(subtractPoint(d.coordinates, @tile.location))
    @layerView.redrawTile(@tile)
    @state = 'move_control_point'
#    catch error
#      @controlPoint = null

  removeControlPoint: (d) ->
    @controlPoint.remove()
    @layerView.redrawTile(@tile, true)

  setVersion: (d) ->
    @version = d.version
    @clear()

  playMacro: (d) ->
    TileWebGL.Models.MacroReplay.stop = false
    @replayMacro = new TileWebGL.Models.MacroReplay(d,@).play()

  stopMacro: ->
    @replayMacro.stop()

  macroAddTileSegment: (d) ->
    segment = @tile.addTileSegment()
    @layerView.redrawTile(@tile)
    @selectTileSegment({tile: @tile.id, segment: segment.id})

  setMaterial: (d) ->
    @material = Object.create d.material
    if @tile
      @tile.setMaterial @material
      @layerView.redrawTile(@tile)
