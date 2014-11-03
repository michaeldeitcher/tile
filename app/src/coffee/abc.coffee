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
  planes: {}
  config: {
    tile: {
      material: {
        color: "#ff3131"
        colorAmbient: "#000000"
        colorEmissive: "#000000"
        colorSpecular: "#000000"
        shininess: 30
        opacity: 1
        material: "Lambert"
      }
    }
  }

window.App = window.Overlay = Ember.Application.create();