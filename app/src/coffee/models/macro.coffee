class TileWebGL.Models.Macro
  @_numMacros = 0
  @_macros = {}

  @processAction: (d) ->
    @startRecordingMacro() if d.action == 'addTile'
    @_recordingMacro.recordAction d if @_recordingMacro

  @find: (id) ->
    @_macros[id]

  @recordingMacro: ->
    @_recordingMacro

  @startRecordingMacro: ->
    @_recordingMacro = new TileWebGL.Models.Macro()

  constructor: ->
    @id = @constructor._numMacros
    @constructor._macros[@id] = @
    @constructor._numMacros++
    @_actionRecording = []

  recordAction: (d) ->
    return if ['addTile', 'selectTileSegment', 'splitTileSegment', 'selectControlPoint',
    'clearSelection', 'moveControlPoint','removeControlPoint'].indexOf(d.action) == -1

    now = new Date().getTime()
    elapsedTime = if @lastTime? then now - @lastTime else 0
    @_actionRecording.push [d, elapsedTime]

  actions: ->
    @_actionRecording.slice().reverse()

class TileWebGL.Models.MacroReplay
  @stop = false
  constructor: (@d, @layer) ->
    @macro = TileWebGL.Models.Macro.find(d.macro_id)
    throw 'could not find macro' unless @macro?

    @controlPoint = @layer.controlPoint
    @controlPointOffset = @controlPoint.id if @controlPoint
    @tileSegmentOffset = @layer.tile.numOfSegments()

  play: ->
    @macroActions = @macro.actions()
#    @layer.clearSelection({})
    processMacroAction = =>
      return if TileWebGL.Models.MacroReplay.stop
      @layer.processAction @transposeAction(@macroAction[0])
      @macroAction = @macroActions.pop()
      if @macroAction?
        timeOut = if @macroAction[1] > 250 then 250 else @macroAction[1]
        setTimeout( processMacroAction, timeOut)
#      else
#        @play()

    @macroAction = @macroActions.pop()
    processMacroAction()

  transposeAction: (pretransposed) ->
    d = $.extend({}, pretransposed)
    switch d.action
      when 'selectTileSegment', 'splitTileSegment'
        d.segment += @tileSegmentOffset if @tileSegmentOffset
      when 'selectControlPoint'
        d.id += @controlPointOffset if @controlPointOffset?
      when 'addTile'
        d.action = 'macroAddTileSegment'
    d

  stop: ->
    TileWebGL.Models.MacroReplay.stop = true





