class TileWebGL.Views.Layer
  constructor: () ->
    @stage = TileWebGL.appView.stage
    TileWebGL.layerView = @
    @tileViews = {}
    @controller = TileWebGL.appController.activeLayerController()
    TileWebGL.appController.onStateChange( (state) =>
      switch state
        when 'create'
          @wall = new TileWebGL.Views.Wall().create()
#        else
#          if @wall?
#            @wall.destroy()
#            @wall = null
    )

  redrawTile: (tile, forceSelected = false) ->
    tileView = @tileViews[tile.id]
    if !tileView
      tileView = new TileWebGL.Views.Tile(@, tile)
      @tileViews[tile.id] = tileView
    tileView.tileSelected = true if forceSelected
    tileView.redraw()

  clearSelection: ->
    tileView = @tileViews[TileWebGL.stage.activeLayer().tile.id] if TileWebGL.stage.activeLayer().tile
    tileView.selectTile(false) if tileView

  clear: ->
    tileView.destroy() for id, tileView of @tileViews

class TileWebGL.Views.Wall
  constructor: ->
    @appView = TileWebGL.appView

  create: ->
    material = new THREE.MeshPhongMaterial( { color: 0xCCCCCC, shininess: 1 } )

    geometry = new THREE.BoxGeometry 600, 600, 1
    @wall = new THREE.Mesh geometry, material
    @wall.position.set(0,0,1)
    @wall['view'] = @

    @appView.addToScene(@wall)

  destroy: ->
    @appView.removeFromScene(@wall)

  mouseMove: (coord) ->

  mouseDown: (coord) ->
    @state = 'mousedown'

  mouseUp: (coord) ->
    return unless @state is 'mousedown'
    controller = TileWebGL.activeLayerController()
    if controller.selectedTileSegment
      controller.clearSelection()
    else
      controller.addTile coord
    @state = undefined



