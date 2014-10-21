class TileWebGL.Views.Overlay
  constructor: () ->
    @currentPanel = null

  showPanel: (@panelName) ->
    new TileWebGL.Views.GUI()
#    @currentPanel = new TileWebGL.Views.CreatePanel() unless @currentPanel
#    @currentPanel.show() unless @currentPanel.visible

  hidePanel: ->
    @currentPanel.hide() if @currentPanel.visible

class TileWebGL.Views.CreatePanel
  constructor: ->
    @$ = $('#create-panel')
    @visible = false
  show: ->
    @$.show()
    $('#overlay').removeClass('pass-through')
    @visible = true
    TileWebGL.appView.enableOrbitControls()
    TileWebGL.appView.ignoreMouseEvents = true
  hide: ->
    @$.hide()
    $('#overlay').addClass('pass-through')
    @visible = false
    TileWebGL.appView.disableOrbitControls()
    TileWebGL.appView.ignoreMouseEvents = false
  registerEventHandlers: ->
    $('#overlay').moused()


#    material = new THREE.MeshPhongMaterial( { color: 0xff3300, specular: 0x555555, shininess: 30 } )
TileWebGL.config.tile = {
  material: {
    color: "#ff3300" # color (change "#" to "0x")
    colorA: "#000000" # color (change "#" to "0x")
    colorE: "#000033" # color (change "#" to "0x")
    colorS: "#555555" # color (change "#" to "0x")
    shininess: 30
    opacity: 1
    material: "Phong"
  }
}

class TileWebGL.Views.GUI
  @gui = null
  constructor: ->
    return if TileWebGL.Views.GUI.gui
    gui = TileWebGL.Views.GUI.gui = new dat.GUI()
    parameters = TileWebGL.config.tile.material

    color = gui.addColor(parameters, "color").name("Color (Diffuse)").listen()
    color.onChange (value) -> # onFinishChange
      TileWebGL.config.tile.material.color = value
      return

    ambient = gui.addColor(parameters, "colorA").name("Color (Ambient)").listen()
    ambient.onChange (value) -> # onFinishChange
      TileWebGL.config.tile.material.ambient value
      return

    emissive = gui.addColor(parameters, "colorE").name("Color (Emissive)").listen()
    emissive.onChange (value) -> # onFinishChange
      TileWebGL.config.tile.material.emissive value
      return

    specular = gui.addColor(parameters, "colorS").name("Color (Specular)").listen()
    specular.onChange (value) -> # onFinishChange
      TileWebGL.config.tile.material.specular = value
      return

    shininess = gui.add(parameters, "shininess").min(0).max(60).step(1).name("Shininess").listen()
    shininess.onChange (value) ->
      TileWebGL.config.tile.material.shininess = value
      return

    opacity = gui.add(parameters, "opacity").min(0).max(1).step(0.01).name("Opacity").listen()
    opacity.onChange (value) ->
      TileWebGL.config.tile.material.opacity = value
      return

    material = gui.add(parameters, "material", [
      "Basic"
      "Lambert"
      "Phong"
      "Wireframe"
    ]).name("Material Type").listen()
    material.onChange (value) ->
      TileWebGL.config.tile.material.material = value
      return

    gui.add(parameters, "reset").name "Reset Parameters"
    gui.open()


