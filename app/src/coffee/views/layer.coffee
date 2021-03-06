class TileWebGL.Views.Layer
  constructor: () ->
    @stage = TileWebGL.appView.stage
    TileWebGL.layerView = @
    @tileViews = {}
    @controller = TileWebGL.appController.activeLayerController()
    @showWall()

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
    @tileViews = {}

  showWall: (show = true) ->
    if show
      @wall = new TileWebGL.Views.Wall().create()
    else
      if @wall
        @wall.destroy()
        @wall = null

class TileWebGL.Views.Wall
  constructor: ->
    @appView = TileWebGL.appView
    @layerController = TileWebGL.activeLayerController()

  create: ->
    material = new THREE.MeshBasicMaterial( {color: 0x000000 } )
    geometry = new THREE.PlaneGeometry 6000, 6000, 1

#    material = new THREE.MeshPhongMaterial( { color: 0xCCCCCC, shininess: 1, opacity: 0.2 } )
#    geometry = new THREE.BoxGeometry 600, 600, 1

    @wall = new THREE.Mesh geometry, material
    @wall.position.set(0,0,1)
    @wall['view'] = @

    @appView.addToScene(@wall)
    @

  destroy: ->
    @appView.removeFromScene(@wall)

  mouseMove: (coord) ->
    false
  mouseDown: (coord) ->
    false
  mouseUp: (coord) ->
    false



