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
        color: "#ff3300"
        colorAmbient: "#FFFFFF"
        colorEmissive: "#FFFFFF"
        colorSpecular: "#FFFFFF"
        shininess: 30
        opacity: 1
        material: "Basic"
      }
    }
  }


window.App = window.Overlay = Ember.Application.create();