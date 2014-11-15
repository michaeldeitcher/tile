class TileWebGL.Views.AppView
  constructor: ->
    TileWebGL.appView = @
    @initializeStateMachine()

    @domContainer = document.getElementById("ThreeJS")
    @objects = []

    @createScene()
    @addLights()
    @registerEvents()
    @animate()

  initializeStateMachine: ->
    TileWebGL.appController.onStateChange( (state) =>
      switch state
        when 'create'
          @ignoreMouseEvents = false
        when 'receive'
          @controls = new THREE.OrbitControls(@camera, @renderer.domElement) unless @controls?
        else
          @ignoreMouseEvents = true
    )

  createScene: ->
    @scene = new THREE.Scene()

    @width = window.innerWidth
    @height = window.innerHeight
    @aspect = @width/@height
    @near = 1000
    @far = 20000

    @camera = new THREE.PerspectiveCamera(10, @aspect, @near, @far)
    @updateCameraPosition()
    @projector = new THREE.Projector()

    @renderer = new THREE.WebGLRenderer(antialias: true)
    @renderer.setSize @width, @height
    @domContainer.appendChild @renderer.domElement

  animate: ->
    requestAnimationFrame( TileWebGL.appView.animate )
    TileWebGL.appView.render()
    TileWebGL.appView.update()

  render: ->
    @renderer.render(@scene, @camera)

  update: ->
    @controls.update() if @controls?
    @stats.update() if @stats?

  updateCameraPosition: ->
    @cameraPosition = TileWebGL.Models.Stage.getCameraPosition() unless @cameraPosition?
    pos = @cameraPosition
    @camera.position.set pos[0],pos[1],pos[2]
    @camera.lookAt @scene.position

  adjustCameraPosition: (delta) ->
    @cameraPosition[0] += delta[0]
    @cameraPosition[1] += delta[1]
    @cameraPosition[2] += delta[2]
    @updateCameraPosition()
    TileWebGL.Models.Stage.setCameraPosition @cameraPosition

  addLights: ->
    dirLight = new THREE.PointLight(0xffffff);
    dirLight.position.set 200, 200, 150
    @scene.add(dirLight);

    dirLight = new THREE.PointLight(0xffffff);
    dirLight.position.set 0, 0, 300
    @scene.add(dirLight);

  toggleStats: ->
    if @stats
      @domContainer.removeChild @stats.domElement
    else
      @stats = new Stats()
      @stats.domElement.style.position = "absolute"
      @stats.domElement.style.bottom = "0px"
      @stats.domElement.style.zIndex = 100
      @domContainer.appendChild @stats.domElement

  addToScene: (threeMeshObject) ->
    @scene.add threeMeshObject
    @objects.push threeMeshObject

  removeFromScene: (threeMeshObject) ->
    @scene.remove threeMeshObject
    index = @objects.indexOf threeMeshObject
    @objects.splice index, 1 if index > -1

  registerEvents: ->
    THREEx.WindowResize @renderer, @camera
    THREEx.FullScreen.bindKey charCode: "m".charCodeAt(0)

    @touches = {}
    el = @renderer.domElement
    if (Modernizr.touch)
      el.addEventListener "touchstart", (event) =>
        @touchStart touch for touch in event.changedTouches
      el.addEventListener "touchend", (event) =>
        @touchEnd touch for touch in event.changedTouches
      el.addEventListener "touchcancel", (event) =>
        @touchCancel touch for touch in event.changedTouches
      el.addEventListener "touchmove", (event) =>
        @touchMove touch for touch in event.changedTouches
    else
      el.addEventListener 'mousemove', (event) => @handleMoveEvent [event.clientX, event.clientY]
      el.addEventListener 'mouseup', (event) => @handleUpEvent [event.clientX, event.clientY]
      el.addEventListener 'mousedown', (event) => @handleDownEvent [event.clientX, event.clientY]

  copyTouch: (touch) ->
    { identifier: touch.identifier, pageX: touch.pageX, pageY: touch.pageY }

  touchStart: (touch) ->
    @touches[touch.identifier] = touch
    @handleDownEvent [touch.pageX, touch.pageY]

  touchMove: (touch) ->
    @handleMoveEvent [touch.pageX, touch.pageY]

  touchEnd: (touch) ->
    @handleUpEvent [touch.pageX, touch.pageY]

  handleMoveEvent: (coord) ->
    return if @ignoreMouseEvents
    intersect = @raycastIntersects(coord)
    if intersect?
      unless intersect.object.view.mouseMove [intersect.point.x, intersect.point.y]
        layerController = TileWebGL.appController.activeLayerController()
        layerController.mouseMove [intersect.point.x, intersect.point.y]

  handleUpEvent: (coord) ->
    return if @ignoreMouseEvents
    intersect = @raycastIntersects(coord)
    if intersect?
      unless intersect.object.view.mouseUp [intersect.point.x, intersect.point.y]
        layerController = TileWebGL.appController.activeLayerController()
        layerController.mouseUp [intersect.point.x, intersect.point.y]

  handleDownEvent: (coord) ->
    return if @ignoreMouseEvents
    intersect = @raycastIntersects(coord)
    if intersect?
      intersect.object.view.mouseDown [intersect.point.x, intersect.point.y]

  raycastIntersects: (clientCoord) ->
    mouseX = ( clientCoord[0] / window.innerWidth ) * 2 - 1
    mouseY = - ( clientCoord[1] / window.innerHeight ) * 2 + 1

    mouse3D = new THREE.Vector3( mouseX, mouseY, 1 )

    @projector.unprojectVector( mouse3D, @camera );
    rayCaster = new THREE.Raycaster( @camera.position, mouse3D.sub( @camera.position ).normalize() );
    objects = rayCaster.intersectObjects( @objects )
    objects[0] if objects
