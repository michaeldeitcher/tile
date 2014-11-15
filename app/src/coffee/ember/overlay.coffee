Overlay.Router.map ->
  @resource 'planes', { path: "/"}
  @resource 'plane', { path: "/plane/:plane_id" }
  @resource 'receive'

Overlay.PlanesRoute = Ember.Route.extend(
  model: (params) ->
    TileWebGL.Models.Plane.all()
)

Overlay.PlanesController = Ember.ArrayController.extend(
  start: (->
    id = TileWebGL.Models.Plane.getLastPlaneId()
    if id?
      @transitionToRoute('plane', id)
    else
      plane = TileWebGL.Models.Plane.create()
      TileWebGL.Models.Plane.save()
      @transitionToRoute('plane', plane.id)
  ).property()

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
    goBack: ->
      id = TileWebGL.Models.Plane.getLastPlaneId()
      @transitionToRoute('plane', id) if id > -1
)
pusher = null
channel = null
Overlay.PlaneController = Overlay.MenuController.extend(
  start: ( ->
    unless @started
      TileWebGL.appController.start()
      TileWebGL.appController.changeState('create')
      @started = true
      model = @get 'model'
      history = model.history
      TileWebGL.appController.replayHistoryString history if history.length > 0
      TileWebGL.api.startSending()
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
    macroPlay: ->
      TileWebGL.activeLayerController().playMacro()

    menuSelectShow: ->
      if @selectMenuShown
        @selectMenuShown = false
        $('#menuPlane').fadeIn('fast')
        $('.menu:not("#menuPlane")').fadeOut('slow')
      else
        @selectMenuShown = true
        $('#menuSelect').fadeIn('fast')

    menuCameraShow: ->
      $('#menuCamera').fadeIn('fast')
      $('.menu:not("#menuCamera")').fadeOut('slow')
      @selectMenuShown = false
    zoomIn: ->
      TileWebGL.appController.zoomIn()
    zoomOut: ->
      TileWebGL.appController.zoomOut()


    menuColorsShow: ->
      $('#menuColors').fadeIn('fast')
      $('.menu:not("#menuColors")').fadeOut('slow')
      @selectMenuShown = false
    red: ->
      @private.updateColor '#FF0000'
    blue: ->
      @private.updateColor '#0000FF'
    white: ->
      @private.updateColor '#999999'

    menuPeerConfigShow: ->
      $('#menuPeerConfig').fadeIn('fast')
      $('.menu:not("#menuPeerConfig")').fadeOut('slow')
      @selectMenuShown = false
    becomeSender: ->
      TileWebGL.api.startSending()
    becomeReceiver: ->
      TileWebGL.api.startReceiving()

  private:
    updateColor: (color) ->
      layer = TileWebGL.activeLayerController().layer
      material = $.extend({}, layer.material)
      material.color = color
      TileWebGL.activeLayerController().processAction 'setMaterial', {material: material}

)

Overlay.ReceiveController = Ember.ObjectController.extend(
  start: ( ->
    unless @started
      TileWebGL.appController.start()
      TileWebGL.api.startReceiving()
      @started = true
    ''
  ).property()
)