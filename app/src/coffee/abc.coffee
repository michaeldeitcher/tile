window.TileWebGL =
  Models: {}
  Controllers: {}
  Views: {}
  appController: undefined
  appView: undefined
  stage: undefined
  prefs: {
    width: 30,
    segmentStartLength: 100
  }
  svgOverlay: undefined
  updateTileProject: undefined
  activeLayerController: undefined
  toolbarController: undefined
  planes: {}
  config: {
    tile: {
      material: {
        color: "#ff3300"
        colorAmbient: "#000000"
        colorEmissive: "#000033"
        colorSpecular: "#555555"
        shininess: 30
        opacity: 1
        material: "Phong"
      }
    }
  }
  DATGUI: undefined


window.App = window.Overlay = Ember.Application.create();