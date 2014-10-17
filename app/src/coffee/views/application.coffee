class TileWebGL.Views.AppView
  constructor: ->
    TileWebGL.appView = @

#    document.ontouchmove = (event) -> event.preventDefault()
    @initThreejs()
    @createOverlay()
    @animate()

  initThreejs: ->
    # SCENE
    @scene = new THREE.Scene()

    # CAMERA
    SCREEN_WIDTH = window.innerWidth
    SCREEN_HEIGHT = window.innerHeight
    VIEW_ANGLE = 45
    ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT
    NEAR = 0.1
    FAR = 20000
    @camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR)
    @scene.add @camera
    @camera.position.set 0, 150, 1000
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
    light = new THREE.PointLight(0xffffff)
    light.position.set 100, 100, 50
    @scene.add light


    dirLight = new THREE.PointLight(0xffffff);
    dirLight.position.set 100, 100, -100
    @scene.add(dirLight);


    # initialize object to perform world/screen calculations
    @projector = new THREE.Projector()


  createOverlay: ->
    @objects = []
#    material = new THREE.MeshBasicMaterial { color: 0xCCCCCC }
    material = new THREE.MeshPhongMaterial( { color: 0xff3300, specular: 0x555555, shininess: 30 } )

    geometry = new THREE.BoxGeometry 50, 50, 400
    box = new THREE.Mesh geometry, material
    box.position.set(-40,26,0)
    @scene.add box
    @objects.push box
    @renderer.render(@scene, @camera)

    @overlayView = new TileWebGL.Views.Overlay()

#    @renderer.domElement.addEventListener 'mousemove', (event) =>
#      @changeColorIfIntersected(event)
#
#    @renderer.domElement.addEventListener 'mouseup', (event) =>
#      TileWebGL.activeLayerController().mouseUp @getCoordinates(event)
#
#    @renderer.domElement.addEventListener 'mousedown', (event) =>
#      event.preventDefault()
#      TileWebGL.activeLayerController().mouseDown @getCoordinates(event)

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
    container = @renderer.domElement
    viewWidth = window.innerWidth;
    viewHeight = window.innerHeight;

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

  changeColorIfIntersected: (event) ->
    container = @renderer.domElement
    mouseX = ( event.clientX / window.innerWidth ) * 2 - 1
    mouseY = - ( event.clientY / window.innerHeight ) * 2 + 1

    mouse3D = new THREE.Vector3( mouseX, mouseY, 1 )

    @projector.unprojectVector( mouse3D, @camera );
    rayCaster = new THREE.Raycaster( @camera.position, mouse3D.sub( @camera.position ).normalize() );

    intersects = rayCaster.intersectObjects( @objects )
    if ( intersects.length > 0 )
      console.log [intersects[ 0 ].point.x, intersects[ 0 ].point.y]





