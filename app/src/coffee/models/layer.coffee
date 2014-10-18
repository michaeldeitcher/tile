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

  clear: ->
    @layerView.clear()
    @tiles = []
    @tile = null
    @segment = null
    @controlPoint = null

  addAction: (action)->
    @actions.push(action)

  processActions: ->
    while @actions.length > 0
      @processAction @actions.pop()

  processAction: (d,elapsedTime=null) ->
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
      when 'setVersionInfo' then @setVersion(d)
      else
        throw 'unsupported action'
    unless elapsedTime?
      now = new Date().getTime()
      elapsedTime = if @lastTime? then now - @lastTime else 0
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
    @tiles.push @tile
    @segment = @tile.getSegment(0)
    @layerView.redrawTile(@tile)
#    @selectTileSegment({tile: @tile.id, segment: @segment.id})

  addTileSegment: (d) ->
    segment = @tile.addTileSegment(subtractPoint(d.coordinates, @tile.location))
    @layerView.redrawTile(@tile)
    @selectTileSegment({tile: @tile.id, segment: segment.id})

  selectTileSegment: (d, @state = 'select_all') ->
    @tile = @tiles[d.tile]
    segment = @tile.getSegment(d.segment)
    @segment = segment
    @layerView.selectSegment(@tile, @segment, @state)

  isSegmentSelected: (tileId, segmentId) ->
    @tile && @tile.id == tileId && @segment && @segment.id == segmentId

  splitTileSegment: ->
    @tile = @tiles[@tile.id]
    @segment = @tile.getSegment(@segment.id)
    @segment.split()
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
    @controlPoint.move(subtractPoint(d.coordinates, @tile.location))
    @layerView.redrawTile(@tile)
    @layerView.selectSegment(@tile, @segment)
    @state = 'move_control_point'
#    catch error
#      @controlPoint = null

  removeControlPoint: (d) ->
    @controlPoint.remove()
    @layerView.redrawTile(@tile)
    @clearSelection()

  setVersion: (d) ->
    @version = d.version



