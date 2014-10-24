class TileWebGL.Controllers.AppController
  constructor: (state) ->
    TileWebGL.appController = @
    @initStateMachine()
    @appView = new TileWebGL.Views.AppView()
    TileWebGL.activeLayerController = @activeLayerController
    new TileWebGL.Controllers.ToolbarController(@svg)

  start: ->
    #stage
    @stage = new TileWebGL.Models.Stage()
    @layerControllers = [new TileWebGL.Controllers.LayerController()]
    @activeLayerController().start()
    @changeState('show')

  activeLayerController: ->
    TileWebGL.appController.layerControllers[0]

  clearStage: ->
    @stage.clear()
    @start()
    @enableEditing()

  replayHistoryString: (historyString) ->
    @replayHistory JSON.parse( historyString )

  historyString: ->
    JSON.stringify @activeLayerController().layer.history

  enableEditing: ->
    @changeState('create')

  replayHistory: (history) ->
    @lastState = @changeState('replay')
    @activeLayerController().layer.animateHistory(history.reverse())

  replayCanvas: ->
    @stage.clear()
    history = @activeLayerController().layer.history
    lastState = @state
    @start()
    @changeState('replay')
    @lastState = lastState
    @activeLayerController().layer.animateHistory(history.reverse())


  onDoneReplay: ->
    @changeState(@lastState)

  setMaterial: (material) ->
    layer.setMaterial(material) for layer in @layerControllers

  toggleOrbitControls: ->
    if @orbitOn
      TileWebGL.appView.disableOrbitControls()
      TileWebGL.appView.ignoreMouseEvents = false
      @orbitOn = false
    else
      TileWebGL.appView.enableOrbitControls()
      TileWebGL.appView.ignoreMouseEvents = true
      @orbitOn = true

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