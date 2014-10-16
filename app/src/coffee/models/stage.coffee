class TileWebGL.Models.Stage
  constructor: (@size) ->
    TileWebGL.stage = @
    @layers = []
    @layers[0] = new TileWebGL.Models.Layer(@)

  clear: ->
    layer.clear() for layer in @layers

  activeLayer: ->
    @layers[0]