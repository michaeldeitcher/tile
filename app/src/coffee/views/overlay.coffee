class TileWebGL.Views.Overlay
  constructor: () ->
    @currentPanel = null
    new TileWebGL.Views.GUI()

  showPanel: (@panelName) ->
    TileWebGL.DATGUI.gui.open()

  hidePanel: ->
    @currentPanel.hide() if @currentPanel.visible

class TileWebGL.Views.GUI
  constructor: ->
    TileWebGL.DATGUI = @
    @gui = new dat.GUI()
    @parameters = TileWebGL.config.tile.material
    @parameters.toggleWall = ->
      TileWebGL.activeLayerController().toggleWall()
    @parameters.toggleOrbitControls = ->
      TileWebGL.appController.toggleOrbitControls()

    @gui.remember(@parameters)

    @gui.addColor(@parameters, "color").name("Color (Diffuse)").listen().onChange (value) =>
      @parameters.color = value
      TileWebGL.appController.setMaterial @parameters

    @gui.addColor(@parameters, "colorAmbient").name("Color (Ambient)").listen().onChange (value) =>
      @parameters.colorAmbient = value
      TileWebGL.appController.setMaterial @parameters

    @gui.addColor(@parameters, "colorEmissive").name("Color (Emissive)").listen().onChange (value) =>
      @parameters.colorEmissive = value
      TileWebGL.appController.setMaterial @parameters

    @gui.addColor(@parameters, "colorSpecular").name("Color (Specular)").listen().onChange (value) =>
      @parameters.colorSpecular = value
      TileWebGL.appController.setMaterial @parameters

    @gui.add(@parameters, "shininess").min(0).max(60).step(1).name("Shininess").listen().onChange (value) =>
      @parameters.shininess = value
      TileWebGL.appController.setMaterial @parameters

    @gui.add(@parameters, "opacity").min(0).max(1).step(0.01).name("Opacity").listen().onChange (value) =>
      @parameters.opacity = value
      TileWebGL.appController.setMaterial @parameters

    @gui.add(@parameters, "material", ["Basic","Lambert","Phong","Wireframe"]).name("Material Type").listen().onChange (value) =>
      @parameters.material = value
      TileWebGL.appController.setMaterial @parameters

    @gui.add(@parameters, "toggleWall").name("Toggle Wall")
    @gui.add(@parameters, "toggleOrbitControls").name("Toggle Orbit Controls")

  updateMaterial: (material) ->
    @parameters.color = material.color
    @parameters.colorAmbient = material.colorAmbient
    @parameters.colorEmissive = material.colorEmissive
    @parameters.colorSpecular = material.colorSpecular
    @parameters.shininess = material.shininess
    @parameters.opacity = material.opacity
    @parameters.material = material.material

