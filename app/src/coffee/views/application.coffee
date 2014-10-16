class TileWebGL.Views.AppView
  constructor: (size) ->
    @width = size[0]
    @height = size[1]
    TileWebGL.appView = @
    $('.top-bar, .footer').hide()
    document.ontouchmove = (event) -> event.preventDefault()

    @scene = new THREE.Scene()
    @camera = new THREE.PerspectiveCamera(75, @width/@height, 0.1, 1000)

    @projector = new THREE.Projector()
    @renderer = new THREE.WebGLRenderer()
    @renderer.setSize(@width, @height)
    document.body.appendChild(@renderer.domElement);
    @createOverlay()


  createOverlay: ->
    @objects = []
    #    material = new THREE.LineBasicMaterial({
    #      color: 0xFFFFFF
    #    });
    #
    #    geometry = new THREE.Geometry();
    #    geometry.vertices.push(
    #      new THREE.Vector3( 0, @height/2, 0 ),
    #      new THREE.Vector3( 0, -@height/2, 0 )
    #    );
    #
    #    line = new THREE.Line( geometry, material );
    #    @scene.add( line );
    #    @objects.push(line)
    #
    #    geometry = new THREE.Geometry();
    #    geometry.vertices.push(
    #      new THREE.Vector3( @width/2, 0, 0 ),
    #      new THREE.Vector3( -@width/2, 0, 0 )
    #    );
    #
    #    line = new THREE.Line( geometry, material );
    #    @scene.add( line );
    #    @objects.push(line)
    #
    #    material = new THREE.LineBasicMaterial {
    #      color: 0x0000ff,
    #      wireframe: true
    #    }
    material = new THREE.MeshBasicMaterial { color: 0x000000, wireframe: true }

    geometry = new THREE.BoxGeometry @width, @height, 1
    box = new THREE.Mesh geometry, material
    @scene.add box
    @objects.push box

    @overlayView = new TileWebGL.Views.Overlay()

    @renderer.domElement.addEventListener 'mouseup', (event) =>
#      TileWebGL.activeLayerController().mouseUp()

    @renderer.domElement.addEventListener 'mousedown', (event) =>
      event.preventDefault()

      container = @renderer.domElement
      rect = container.getBoundingClientRect()
      offsetX = rect.left
      offsetY = rect.top
      viewWidth = window.innerWidth;
      viewHeight = window.innerHeight;

      mouse3D = new THREE.Vector3(
          ( event.clientX - offsetX ) / viewWidth * 2 - 1,
          -( event.clientY - offsetY ) / viewHeight * 2 + 1, 0.5 )

      @projector.unprojectVector( mouse3D, @camera );
      mouse3D.sub( @camera.position );
      mouse3D.normalize();
      rayCaster = new THREE.Raycaster( @camera.position, mouse3D );

      intersects = rayCaster.intersectObjects( @objects )
      if ( intersects.length > 0 )
        coord = [intersects[ 0 ].point.x, intersects[ 0 ].point.y]
        TileWebGL.activeLayerController().mouseUp(coord)




