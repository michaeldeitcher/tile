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
    @camera.position.set 0, 150, 4000
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
    @stats = new Stats()
    @stats.domElement.style.position = "absolute"
    @stats.domElement.style.bottom = "0px"
    @stats.domElement.style.zIndex = 100
    container.appendChild @stats.domElement

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

  registerEvents: ->
    @renderer.domElement.addEventListener 'mousemove', (event) =>
      intersect = @raycastIntersects(event)
      if intersect?
        intersect.object.view.mouseMove [intersect.point.x, intersect.point.y]
        TileWebGL.activeLayerController().mouseMove([intersect.point.x, intersect.point.y])

    @renderer.domElement.addEventListener 'mouseup', (event) =>
      return if @ignoreMouseEvents
      intersect = @raycastIntersects(event)
      if intersect?
        intersect.object.view.mouseUp [intersect.point.x, intersect.point.y]
        TileWebGL.activeLayerController().mouseUp([intersect.point.x, intersect.point.y])
      else
        $('#overlay').removeClass('pass-through').show()

    @renderer.domElement.addEventListener 'mousedown', (event) =>
      intersect = @raycastIntersects(event)
      if intersect?
        intersect.object.view.mouseDown [intersect.point.x, intersect.point.y]

  animate: ->
    requestAnimationFrame( TileWebGL.appView.animate )
    TileWebGL.appView.render()
    TileWebGL.appView.update()

  render: ->
    @renderer.render(@scene, @camera)

  update: ->
    @controls.update() if @controls?
    @stats.update()

  raycastIntersects: (event) ->
    mouseX = ( event.clientX / window.innerWidth ) * 2 - 1
    mouseY = - ( event.clientY / window.innerHeight ) * 2 + 1

    mouse3D = new THREE.Vector3( mouseX, mouseY, 1 )

    @projector.unprojectVector( mouse3D, @camera );
    rayCaster = new THREE.Raycaster( @camera.position, mouse3D.sub( @camera.position ).normalize() );
    objects = rayCaster.intersectObjects( @objects )
    objects[0] if objects
