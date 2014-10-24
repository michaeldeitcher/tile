pad = (n, width, z) ->
  z = z or "0"
  n = n + ""
  (if n.length >= width then n else new Array(width - n.length + 1).join(z) + n)

class TileWebGL.Models.ControlPoint
  constructor: (@tile, @id) ->
    @segment = @tile.getSegment(if @id is 0 then 0 else @id-1 )
    segmentId = if @id < 2
      0
    else
      @id-1

  coord: ->
    pt = if @isStart()
      midPoint(@segment.data[0], @segment.data[3])
    else
      midPoint(@segment.data[1], @segment.data[2])
    [Math.ceil(pt[0]), Math.ceil(pt[1])]

  isStart: ->
    @id is 0

  isEnd: ->
    !@isStart()

  moveDelta: (delta) ->
    @move subtractPoint(@coord(), delta)

  move: (coordinates) ->
    if @isStart()
      @tile.moveStart(@segment, coordinates)
    else
      @tile.moveEnd(@segment, coordinates)
      if @tile.startEndConnected && @segment.isEnd()
        @tile.moveStart(@tile.getSegment(0), coordinates)
    @tile.resolveStartEnd()

  remove: ->
    if @isStart()
      @segment.mergeLast()
    else
      @segment.mergeNext()

class TileWebGL.Models.Segment
  constructor: (@tile, @id) ->
    if @tile.data.length > @id
      @data = @tile.data[@id]
      @lastData = @tile.data[@id-1]
    else
      width = TileWebGL.prefs.width
      length = TileWebGL.prefs.segmentStartLength
      @data = [[0,0], [length, 0], [length, width], [0, width]]

  controlPointData: (includeStart = true)->
    data = []
    if @id is 0 && includeStart
      data.push { coord: midPoint(@data[0],@data[3]), id: 0 }
    data.push { coord: midPoint(@data[1],@data[2]), id: @id+1 }
    data

  split: ->
    newSegmentPoints = [
      midPoint(@data[0],@data[1]),
      @data[1],
      @data[2],
      midPoint(@data[2],@data[3]),
    ]
    @tile.data[@id][1] = newSegmentPoints[0]
    @tile.data[@id][2] = newSegmentPoints[3]
    @tile.insertSegment(@id+1, newSegmentPoints)

  mergeLast: ->
    endPoint = midPoint(@data[1], @data[2])
    @tile.data.splice(@id,1)
    @tile.moveEnd(new TileWebGL.Models.Segment(@tile, @id), endPoint) if @tile.data.length > 0

  mergeNext: ->
    startPoint = midPoint(@data[0], @data[3])
    @tile.data.splice(@id,1)
    @tile.moveStart(new TileWebGL.Models.Segment(@tile, @id), startPoint) if @id < @tile.data.length

  getLast: ->
    if @id-1 >= 0
      new TileWebGL.Models.Segment(@tile, @id-1)
    else
      null

  getNext: ->
    if @id+1 < @tile.data.length
      new TileWebGL.Models.Segment(@tile, @id+1)
    else
      null

  isEnd: ->
    !@getNext()?

class TileWebGL.Models.Tile
  constructor: (@id, @location) ->
    width = TileWebGL.prefs.width
    length = TileWebGL.prefs.segmentStartLength
    @data = [
      [[0,0], [length, 0], [length, width], [0, width]]
    ]

  setMaterial: (material) ->
    @material = {
      material: material.material
      color: parseInt material.color.replace("#", "0x")
      colorAmbient: parseInt material.colorAmbient.replace("#", "0x")
      colorEmissive: parseInt material.colorEmissive.replace("#", "0x")
      colorSpecular: parseInt material.colorSpecular.replace("#", "0x")
      shininess: material.shininess
      opacity: material.opacity
      transparent: true
    }

  getMaterial: ->
    {
      material: @material.material
      color: "#" + pad @material.color.toString(16), 6
      colorAmbient: "#" + pad @material.colorAmbient.toString(16), 6
      colorEmissive: "#" + pad @material.colorEmissive.toString(16), 6
      colorSpecular: "#" + pad @material.colorSpecular.toString(16), 6
      shininess: @material.shininess
      opacity: @material.opacity
      transparent: true
    }

  numOfSegments: ->
    @data.length

  getSegment: (id) ->
    new TileWebGL.Models.Segment(@, id)

  addSegment: () ->
    last = new TileWebGL.Models.Segment(@, @data.length-1)
    @data[@data.length] = [last.data[1],
                           addPoint(last.data[1], [TileWebGL.prefs.segmentStartLength,0]),
                           addPoint(last.data[2], [TileWebGL.prefs.segmentStartLength,0]),
                           last.data[2]]

  getControlPoint: (id) ->
    new TileWebGL.Models.ControlPoint(@, id)

  controlPointData: ->
    data = []
    for i in [0..@numOfSegments()-1]
      segment = @getSegment(i)
      data = data.concat segment.controlPointData()
    data

  addTileSegment: (growTo=null) ->
    @addSegment()
    segment = new TileWebGL.Models.Segment(@, @data.length-1)
    @moveEnd(segment, growTo) if growTo
    segment

  insertSegment: (i, newSegmentPoints) ->
    dataLength = @data.length
    @data[dataLength] = []
    for moveIndex in [dataLength..i]
      @data[moveIndex] = @data[moveIndex-1]
    @data[i] = newSegmentPoints

  moveEnd: (segment, point) ->
    if segment.id > 0
      lastSegment = new TileWebGL.Models.Segment(@, segment.id-1)
      lastSegmentVector = getVector {start: midPoint(lastSegment.data[1], lastSegment.data[2]), end: midPoint(lastSegment.data[1], lastSegment.data[2])}
      fixedStart = midPoint(lastSegment.data[1], lastSegment.data[2])
    else
      fixedStart = midPoint(segment.data[0], segment.data[3])

    # set end points
    vector = getVector {start: fixedStart, end: point}
    return if vector.direction == 0
    @movePoints(segment, vector, point)
    nextSegment = segment.getNext()
    if nextSegment?
      @moveStart(nextSegment, point)
    else
      first = @getControlPoint(0).coord()
      if getDistance(point, first) < 2
        @startEndConnected = true
        @resolveStartEnd()

  moveStart: (segment, point) ->
    fixedEnd = midPoint(segment.data[1], segment.data[2])

    # set end points
    vector = getVector {start: point, end: fixedEnd}
    return if vector.direction == 0
    @movePoints(segment, vector, fixedEnd)

  movePoints: (segment, vector, endPoint) ->
    lastSegment = new TileWebGL.Models.Segment(@, segment.id-1)

    orthog = getOrthogonalVector vector
    leftEnd = movePoint endPoint, getVector {direction: orthog.direction, magnitude: TileWebGL.prefs.width / -2}
    rightEnd = movePoint endPoint, getVector {direction: orthog.direction, magnitude: TileWebGL.prefs.width / 2}

    # find start points
    reverseVector = getVector {direction: vector.direction, magnitude: -vector.magnitude}
    leftStart = movePoint leftEnd, reverseVector
    rightStart = movePoint rightEnd, reverseVector

    # adjust to connect segments
    if segment.id > 0
      line1 = [lastSegment.data[0], lastSegment.data[1]]
      line2 = [leftStart, leftEnd]
      leftStart = getPointIntersected( line1, line2 )

      line1 = [lastSegment.data[3], lastSegment.data[2]]
      line2 = [rightStart, rightEnd]
      rightStart = getPointIntersected( line1, line2 )

      @data[segment.id-1][1] = leftStart
      @data[segment.id-1][2] = rightStart

    if @data.length > segment.id+1
      nextSegment = new TileWebGL.Models.Segment(@, segment.id+1)

      line1 = [nextSegment.data[0], nextSegment.data[1]]
      line2 = [leftStart, leftEnd]
      leftEnd = getPointIntersected( line1, line2 )

      line1 = [nextSegment.data[3], nextSegment.data[2]]
      line2 = [rightStart, rightEnd]
      rightEnd = getPointIntersected( line1, line2 )

      @data[segment.id+1][0] = leftEnd
      @data[segment.id+1][3] = rightEnd

    @data[segment.id] = [leftStart,leftEnd,rightEnd,rightStart]

  resolveStartEnd: ->
    return unless @startEndConnected
    firstSegment = @getSegment(0)
    lastSegment = @getSegment(@numOfSegments()-1)
    line1 = [lastSegment.data[0], lastSegment.data[1]]
    line2 = [firstSegment.data[0], firstSegment.data[1]]
    leftStart = getPointIntersected( line1, line2 )

    line1 = [lastSegment.data[3], lastSegment.data[2]]
    line2 = [firstSegment.data[3], firstSegment.data[2]]
    rightStart = getPointIntersected( line1, line2 )

    @data[0][0] = @data[lastSegment.id][1] = leftStart
    @data[0][3] = @data[lastSegment.id][2] = rightStart







