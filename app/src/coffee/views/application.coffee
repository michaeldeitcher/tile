class TileWebGL.Views.AppView
  constructor: ->
    TileWebGL.appView = @

#    document.ontouchmove = (event) -> event.preventDefault()
    @initThreejs()
    @overlayView = new TileWebGL.Views.Overlay()
    @animate()
    @registerEvents()
    @objects = []

  initThreejs: ->
    # SCENE
    @scene = new THREE.Scene()

    # CAMERA
    SCREEN_WIDTH = window.innerWidth
    SCREEN_HEIGHT = window.innerHeight
    VIEW_ANGLE = 10
    ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT
    NEAR = 0.1
    FAR = 20000
    @camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR)
    @scene.add @camera
    @camera.position.set 0, 150, 3000
    @camera.lookAt @scene.position

    # RENDERER
    if Detector.webgl
      @renderer = new THREE.WebGLRenderer(antialias: false)
    else
      @renderer = new THREE.CanvasRenderer()
    @renderer.setSize SCREEN_WIDTH, SCREEN_HEIGHT
    container = document.getElementById("ThreeJS")
    container.appendChild @renderer.domElement

    # EVENTS
    THREEx.WindowResize @renderer, @camera
    THREEx.FullScreen.bindKey charCode: "m".charCodeAt(0)

    # STATS
#    @stats = new Stats()
#    @stats.domElement.style.position = "absolute"
#    @stats.domElement.style.bottom = "0px"
#    @stats.domElement.style.zIndex = 100
#    container.appendChild @stats.domElement

    # LIGHT
#    ambientLight = new THREE.AmbientLight(0xFFFFFF);
#    @scene.add(ambientLight);

    # LIGHT
#    light = new THREE.PointLight(0xffffff)
#    light.position.set 100, 100, 150
#    @scene.add light


    dirLight = new THREE.PointLight(0xffffff);
    dirLight.position.set 200, 200, 150
    @scene.add(dirLight);

    dirLight = new THREE.PointLight(0xffffff);
    dirLight.position.set 200, 200, -150
    @scene.add(dirLight);


    # initialize object to perform world/screen calculations
    @projector = new THREE.Projector()

  enableOrbitControls: ->
    @controls = new THREE.OrbitControls(@camera, @renderer.domElement)

  disableOrbitControls: ->
    @controls = null

  addToScene: (threeMeshObject) ->
    @scene.add threeMeshObject
    @objects.push threeMeshObject

  removeFromScene: (threeMeshObject) ->
    @scene.remove threeMeshObject
    index = @objects.indexOf threeMeshObject
    @objects.splice index, 1 if index > -1

  copyTouch: (touch) ->
    { identifier: touch.identifier, pageX: touch.pageX, pageY: touch.pageY }

  touchStart: (touch) ->
    @touches[touch.identifier] = touch
    @handleDownEvent [touch.pageX, touch.pageY]

  touchMove: (touch) ->
    @handleMoveEvent [touch.pageX, touch.pageY]

  touchEnd: (touch) ->
    @handleUpEvent [touch.pageX, touch.pageY]

  registerEvents: ->
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


  handleMoveEvent: (coord) ->
    intersect = @raycastIntersects(coord)
    if intersect?
      intersect.object.view.mouseMove [intersect.point.x, intersect.point.y]
      TileWebGL.activeLayerController().mouseMove([intersect.point.x, intersect.point.y])

  handleUpEvent: (coord) ->
    return if @ignoreMouseEvents
    intersect = @raycastIntersects(coord)
    if intersect?
      intersect.object.view.mouseUp [intersect.point.x, intersect.point.y]

  handleDownEvent: (coord) ->
    intersect = @raycastIntersects(coord)
    if intersect?
      intersect.object.view.mouseDown [intersect.point.x, intersect.point.y]

  enableOrbitControls: ->
    @controls = new THREE.OrbitControls(@camera, @renderer.domElement)
    @ignoreMouseEvents = true

  disableOrbitControls: ->
    @controls = null
    @ignoreMouseEvents = false

  animate: ->
    requestAnimationFrame( TileWebGL.appView.animate )
    TileWebGL.appView.render()
    TileWebGL.appView.update()

  render: ->
    @renderer.render(@scene, @camera)

  update: ->
    @controls.update() if @controls?
    @stats.update() if @stats?

  raycastIntersects: (clientCoord) ->
    mouseX = ( clientCoord[0] / window.innerWidth ) * 2 - 1
    mouseY = - ( clientCoord[1] / window.innerHeight ) * 2 + 1

    mouse3D = new THREE.Vector3( mouseX, mouseY, 1 )

    @projector.unprojectVector( mouse3D, @camera );
    rayCaster = new THREE.Raycaster( @camera.position, mouse3D.sub( @camera.position ).normalize() );
    objects = rayCaster.intersectObjects( @objects )
    objects[0] if objects
