class TileWebGL.Views.Tile
  constructor: (@layerView, @tile) ->
    @segments = []
    @controlPoints = []
    @tileSelected = false
    @redraw()

  redraw: ->
    @redrawSegments()
    @redrawControlPoints()

  redrawSegments: ->
    segment.destroy() for segment in @segments
    @segments = []

    i = 0
    while i < @tile.data.length
      @segments.push new TileWebGL.Views.TileSegment( @, i ).create()
      i++

  redrawControlPoints: ->
    controlPoint.destroy() for controlPoint in @controlPoints
    @controlPoints = []

    return unless @tileSelected

    i = 0
    controlPointData = @tile.controlPointData()
    while i < controlPointData.length
      @controlPoints.push new TileWebGL.Views.ControlPoint( @, controlPointData[i].coord, i ).create()
      i++

  selectTile: (selected = true)->
    @tileSelected = selected
    @redrawControlPoints()


class TileWebGL.Views.TileSegment
  constructor: (@tileView, @segmentIndex) ->
    @appView = TileWebGL.appView
    @layerController = TileWebGL.activeLayerController()
    @tile = @tileView.tile
    @config = @tile.config
    @data = @tile.data[@segmentIndex]

  create: ->
    matcfg = @config.material
    attr = {
      color: matcfg.color.replace("#", "0x")
#      ambient: matcfg.colorA.replace("#", "0x")
#      emmissive: matcfg.colorE.replace("#", "0x")
      specular: matcfg.colorS.replace("#", "0x")
      shininess: matcfg.shininess
#      opacity: matcfg.opacity
#      transparent: true
    }
    material = switch matcfg.material
      when 'Basic'
        new THREE.MeshBasicMaterial(attr)
      when 'Lambert'
        new THREE.MeshLambertMaterial(attr)
      when 'Phong'
        new THREE.MeshPhongMaterial(attr)
      when 'Wireframe'
        attr.wireframe = true
        new THREE.MeshBasicMaterial { attr }

    material.side = THREE.DoubleSide
    @segment = new THREE.Mesh @geometry(), material
    @segment['view'] = @
    @appView.addToScene(@segment)
    @

  destroy: ->
    @appView.removeFromScene(@segment)

  mouseMove: (coord) ->
#    TileWebGL.activeLayerController().mouseMove coord

  mouseDown: (coord) ->
    @state = 'mousedown'
#    TileWebGL.activeLayerController().mouseDown coord

  mouseUp: (coord) ->
    return unless @state is 'mousedown'
    selection = [@tile.id, @segmentIndex]
    if @layerController.isCurrentSegmentSelected selection
      @layerController.splitTileSegment selection
    else
      @layerController.selectTileSegment selection
      @tileView.selectTile()
    @state = undefined

  geometry: ->
    geom = new THREE.Geometry()
    pointIndex = 0
    while pointIndex < @data.length
      geom.vertices.push @vector3(pointIndex, 5)
      geom.vertices.push @vector3(pointIndex, 0)
      pointIndex++
    # front
    geom.faces.push( new THREE.Face3( 0,2,4) )
    geom.faces.push( new THREE.Face3( 0,6,4) )

    # back
    geom.faces.push( new THREE.Face3( 1,3,5) )
    geom.faces.push( new THREE.Face3( 1,7,5) )

    # top
    geom.faces.push( new THREE.Face3( 7,6,4) )
    geom.faces.push( new THREE.Face3( 5,7,4) )

    # bottom
    geom.faces.push( new THREE.Face3( 3,2,0) )
    geom.faces.push( new THREE.Face3( 1,3,0) )

    # left
    geom.faces.push( new THREE.Face3( 1,0,6) )
    geom.faces.push( new THREE.Face3( 7,1,6) )

    # right
    geom.faces.push( new THREE.Face3( 5,4,2) )
    geom.faces.push( new THREE.Face3( 3,5,2) )

    geom.computeFaceNormals()
    geom

  vector3: (pointIndex, depth) ->
    point = @data[pointIndex]
    p = @tile.location
    new THREE.Vector3 point[0]+p[0], point[1]+p[1], depth

class TileWebGL.Views.ControlPoint
  constructor: (@tileView, @coord, @id) ->
    @appView = TileWebGL.appView
    @layerController = TileWebGL.activeLayerController()
    @tile = @tileView.tile
    @

  create: ->
    material = new THREE.MeshBasicMaterial( { color: 0xFFFFFF } )
    circleGeometry = new THREE.CircleGeometry( 10, 32 )
    p = @tile.location
    @controlPoint = new THREE.Mesh circleGeometry, material
    @controlPoint.position.x = @coord[0]+p[0]
    @controlPoint.position.y = @coord[1]+p[1]
    @controlPoint.position.z = 20
    @controlPoint['view'] = @
    @appView.addToScene(@controlPoint)
    @

  destroy: ->
    @appView.removeFromScene(@controlPoint)

  mouseMove: (coord) ->
#    TileWebGL.activeLayerController().mouseMove coord

  mouseDown: (coord) ->
    @layerController.controlPointMouseDown @id

  mouseUp: (coord) ->
    @layerController.controlPointMouseUp @id

  vector3: (pointIndex, depth) ->
    point = @data[pointIndex]
    p = @tile.location
    new THREE.Vector3 point[0]+p[0], point[1]+p[1], depth


