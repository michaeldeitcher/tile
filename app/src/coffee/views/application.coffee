class TileWebGL.Views.AppView
  constructor: ->
    TileWebGL.appView = @

#    document.ontouchmove = (event) -> event.preventDefault()
    @initThreejs()
    @overlayView = new TileWebGL.Views.Overlay()
    @animate()
    @registerCreateEvents()
    TileWebGL.appController.onStateChange( (@state) =>
      switch state
        when 'create'
          @createWall()
        else
          @removeWall()
    )

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
      @renderer = new THREE.WebGLRenderer(antialias: true)
    else
      @renderer = new THREE.CanvasRenderer()
    @renderer.setSize SCREEN_WIDTH, SCREEN_HEIGHT
    container = document.getElementById("ThreeJS")
    container.appendChild @renderer.domElement

    # EVENTS
    THREEx.WindowResize @renderer, @camera
    THREEx.FullScreen.bindKey charCode: "m".charCodeAt(0)

    # CONTROLS
    @controls = new THREE.OrbitControls(@camera, @renderer.domElement)

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


  createWall: ->
    @objects = []
    material = new THREE.MeshPhongMaterial( { color: 0xCCCCCC, shininess: 1 } )

    geometry = new THREE.BoxGeometry 600, 600, 1
    @wall = new THREE.Mesh geometry, material
    @wall.position.set(0,0,1)

    @scene.add @wall
    @objects.push @wall

  removeWall: ->
    return unless @wall
    @scene.remove @wall
    @objects.remove @wall

  registerCreateEvents: ->
    @renderer.domElement.addEventListener 'mousemove', (event) =>
      @getCoordinates(event) if @state == 'create'

    @renderer.domElement.addEventListener 'mouseup', (event) =>
      TileWebGL.activeLayerController().mouseUp @getCoordinates(event) if @state == 'create'

    @renderer.domElement.addEventListener 'mousedown', (event) =>
      TileWebGL.activeLayerController().mouseDown @getCoordinates(event) if @state == 'create'

  animate: ->
    requestAnimationFrame( TileWebGL.appView.animate )
    TileWebGL.appView.render()
    TileWebGL.appView.update()

  render: ->
    @renderer.render(@scene, @camera)

  update: ->
    @controls.update()
    @stats.update()

  getCoordinates: (event) ->
    mouseX = ( event.clientX / window.innerWidth ) * 2 - 1
    mouseY = - ( event.clientY / window.innerHeight ) * 2 + 1

    mouse3D = new THREE.Vector3( mouseX, mouseY, 1 )

    @projector.unprojectVector( mouse3D, @camera );
    rayCaster = new THREE.Raycaster( @camera.position, mouse3D.sub( @camera.position ).normalize() );

    intersects = rayCaster.intersectObjects( @objects )
    if ( intersects.length > 0 )
      [intersects[ 0 ].point.x, intersects[ 0 ].point.y]
    else
      null