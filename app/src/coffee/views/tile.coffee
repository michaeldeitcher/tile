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
      segGeometry = @
      rectMesh = new THREE.Mesh @segmentGeometry(i), new THREE.MeshBasicMaterial { color: 0x4D4D94 }
      @scene.add rectMesh
      @rectMeshes.push rectMesh
      i++

    @camera.position.z = 500
    @renderer.render(@scene, @camera)

  segmentGeometry: (i) =>
    rectGeom = new THREE.Geometry()

    segment = @tile.data[i]
    pointIndex = 0
    while pointIndex < segment.length
      rectGeom.vertices.push @transformToLocation(i, pointIndex)
      pointIndex++

    rectGeom.faces.push( new THREE.Face3( 0,1,2) )
    rectGeom.faces.push( new THREE.Face3( 3,0,2) )
    rectGeom

  transformToLocation: (segmentIndex, pointIndex) =>
    point = @tile.data[segmentIndex][pointIndex]
    p = @tile.location
    new THREE.Vector3 point[0]+p[0], point[1]+p[1]

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
