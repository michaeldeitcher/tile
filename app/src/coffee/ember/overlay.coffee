Overlay.Router.map ->
  @resource 'planes', { path: "/"}
  @resource 'plane', { path: "/plane/:plane_id" }
  @resource 'commands'

Overlay.PlanesRoute = Ember.Route.extend(
  model: (params) ->
    TileWebGL.Models.Plane.all()
)

Overlay.PlanesController = Ember.ArrayController.extend(
  actions:
    createPlane: ->
      plane = TileWebGL.Models.Plane.create()
      TileWebGL.Models.Plane.save()
      @transitionToRoute('plane', plane.id)
)

Overlay.PlaneRoute = Ember.Route.extend(
  model: (params) ->
    TileWebGL.Models.Plane.find(params.plane_id)
)

Overlay.MenuController = Ember.ObjectController.extend(
  menuToggleText: 'Hide menu'
  menuVisible: true

  actions:
    menuToggle: ->
      if @get 'menuVisible'
        $("ul#menu li:not('#menuToggle')").fadeOut()
        @set('menuVisible', false)
        @set('menuToggleText', 'Show Menu')
      else
        $("ul#menu li:not('#menuToggle')").fadeIn()
        @set('menuVisible', true)
        @set('menuToggleText', 'Hide Menu')
)

Overlay.PlaneController = Overlay.MenuController.extend(
  start: ( ->
    unless @started
      TileWebGL.appController.start()
      TileWebGL.appController.changeState('create')
      @started = true
      model = @get 'model'
      history = model.history
      TileWebGL.appController.replayHistoryString history if history.length > 0
    ''
  ).property()

  actions:
    save: ->
      model = @get 'model'
      model.history = TileWebGL.appController.historyString()
      TileWebGL.Models.Plane.save()
    replay: ->
      TileWebGL.appController.replayCanvas()
    clear: ->
      TileWebGL.appController.clearStage()
)

updateColor = (color) ->
  layer = TileWebGL.activeLayerController().layer
  material = layer.material
  material.color = color
  layer.setMaterial {material: material}

Overlay.CommandsController = Overlay.MenuController.extend(
  actions:
    red: ->
      updateColor '#FF0000'
    blue: ->
      updateColor '#0000FF'
    white: ->
      updateColor '#999999'
    startRecording: ->
      TileWebGL.Models.Macro.startRecordingMacro()

    play: ->
      TileWebGL.Models.MacroReplay.stop = false
      macro = TileWebGL.Models.Macro.recordingMacro()
      d = {macro_id: macro.id}
      TileWebGL.activeLayerController().layer.playMacro d

    stop: ->
      TileWebGL.Models.MacroReplay.stop = true
)
