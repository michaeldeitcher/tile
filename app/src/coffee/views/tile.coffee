class TileWebGL.Views.Tile
  constructor: (@layerView, @tile) ->
    @renderer = TileWebGL.appView.renderer
    @scene = TileWebGL.appView.scene
    @camera = TileWebGL.appView.camera
    @rectMeshes = []
    @redraw()

  clear: ->
    @tile.data = []
    @redraw()

  redraw: ->
    @scene.remove rectMesh for rectMesh in @rectMeshes

    i = 0
    while i < @tile.data.length
      material = new THREE.MeshPhongMaterial( { color: 0xff3300, specular: 0x555555, shininess: 30 } )
      material.side = THREE.DoubleSide
      rectMesh = new THREE.Mesh @segmentGeometry(i), material
      @scene.add rectMesh
      @rectMeshes.push rectMesh
      i++

  segmentGeometry: (i) =>
    rectGeom = new THREE.Geometry()

    segment = @tile.data[i]
    pointIndex = 0
    while pointIndex < segment.length
      rectGeom.vertices.push @vector3(i, pointIndex, 5)
      rectGeom.vertices.push @vector3(i, pointIndex, 0)
      pointIndex++
  # front
    rectGeom.faces.push( new THREE.Face3( 0,2,4) )
    rectGeom.faces.push( new THREE.Face3( 0,6,4) )

  # back
    rectGeom.faces.push( new THREE.Face3( 1,3,5) )
    rectGeom.faces.push( new THREE.Face3( 1,7,5) )

  # top
    rectGeom.faces.push( new THREE.Face3( 7,6,4) )
    rectGeom.faces.push( new THREE.Face3( 5,7,4) )

  # bottom
    rectGeom.faces.push( new THREE.Face3( 3,2,0) )
    rectGeom.faces.push( new THREE.Face3( 1,3,0) )

  # left
    rectGeom.faces.push( new THREE.Face3( 1,0,6) )
    rectGeom.faces.push( new THREE.Face3( 7,1,6) )

  # right
    rectGeom.faces.push( new THREE.Face3( 5,4,2) )
    rectGeom.faces.push( new THREE.Face3( 3,5,2) )

    rectGeom.computeFaceNormals()
    rectGeom

  vector3: (segmentIndex, pointIndex, depth) =>
    point = @tile.data[segmentIndex][pointIndex]
    p = @tile.location
    new THREE.Vector3 point[0]+p[0], point[1]+p[1], depth

  onTouchSegment: (i) =>
    if TileWebGL.stage.activeLayer().state == 'select_all' && TileWebGL.stage.activeLayer().isSegmentSelected(@tile.id, i)
      TileWebGL.activeLayerController().processAction('splitTileSegment')
    else
      TileWebGL.activeLayerController().selectTileSegment(@tile.id,i)

  clearSelection: ->
    @redrawSelection([])

  selectControlPoint: (d) ->
    TileWebGL.activeLayerController().processAction('selectControlPoint', {id: d.id})

  selectSegment: (tile, segment, state) ->
    if state == 'select_end'
      @redrawSelection(segment.controlPointData(false))
    else
      @redrawSelection(segment.tile.controlPointData())

  redrawSelection: (points) ->
#    circle = @$g.selectAll('circle').data(points)
#    circle.enter().append('circle')
#    circle.attr("cx", (d) -> d.coord[0]).attr("cy", (d) -> d.coord[1]).attr('r', 10).
#      on("mousedown", (d) => @selectControlPoint(d)).
#      on("touchstart", (d) => @selectControlPoint(d))
#    circle.exit().remove()
