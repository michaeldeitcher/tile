window.TileWebGL =
  Models: {}
  Controllers: {}
  Views: {}
  appController: undefined
  appView: undefined
  stage: undefined
  prefs: {
    width: 30
    segmentStartLength: 100
    depth: 10
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
        colorAmbient: "#FFFFFF"
        colorEmissive: "#FFFFFF"
        colorSpecular: "#555555"
        shininess: 30
        opacity: 1
        material: "Phong"
      }
    }
  }


window.App = window.Overlay = Ember.Application.create();