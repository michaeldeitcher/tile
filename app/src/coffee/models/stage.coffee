class TileWebGL.Models.Stage
  constructor: ->
    TileWebGL.stage = @
    @layers = []
    @macros = []
    @layers[0] = new TileWebGL.Models.Layer(@)

  clear: ->
    layer.clear() for layer in @layers

  activeLayer: ->
    @layers[0]

  @setCameraPosition: (position) ->
    localStorage.setItem('camera', JSON.stringify(position))

  @getCameraPosition: ->
    camera = localStorage.getItem('camera')
    if camera
      JSON.parse(camera)
    else
      [0, 0, 3000]

class TileWebGL.Models.Plane
  planes = localStorage.getItem('planes')
  if planes
    obj = JSON.parse(planes)
    @_planes = obj.planes
    @_numPlanes = obj.numPlanes
  else
    @_numPlanes = 0
    @_planes = []

  @find: (id) ->
    obj = @_planes[id]
    @setLastPlaneId(id) if obj?
    obj

  @create: ->
    @setLastPlaneId(@_planes.length)
    new TileWebGL.Models.Plane()

  @all: ->
    planes = []
    planes.push plane for plane in @_planes
    planes

  @save: ->
    localStorage.setItem('planes', JSON.stringify({numPlanes: @_numPlanes, planes: @_planes}))

  @getLastPlaneId: ->
    id = localStorage.getItem('lastPlaneId')
    if id
      JSON.parse(id)
    else
      undefined

  @setLastPlaneId: (id) ->
    localStorage.setItem('lastPlaneId', JSON.stringify(id))

  constructor: ->
    @id = @constructor._numPlanes
    @version = 'v0.2'
    @date = new Date()
    @title = "P#{@id}"
    @history = ""
    @constructor._planes[@id] = @
    @constructor._numPlanes++