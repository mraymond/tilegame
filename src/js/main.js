var mesh, renderer, scene, camera, controls;

var container, raycaster, mouse, objects = [], INTERSECTED;

var tileMap = ['water', 'grass'];



const nullTile = -1;





init();
render();

function init() {


  // renderer
  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setViewport(0, 0, window.innerWidth, window.innerHeight  )
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  // scene
  scene = new THREE.Scene();


  width = window.innerWidth
height = window.innerHeight
aspect = width/height
D = 20

scene = new THREE.Scene()
camera = new THREE.OrthographicCamera(-D*aspect, D*aspect, D, -D, .1, 1000)
camera.position.set(-20, 20, 20)
camera.lookAt(scene.position)

controls = new THREE.OrbitControls( camera, renderer.domElement );
  //controls.addEventListener( 'change', render );
  controls.enableZoom = true;
  controls.enablePan = true;
  controls.enableRotate = false;
  controls.enabled = true;
  controls.maxPolarAngle = Math.PI / 2;

  // ambient
scene.add( new THREE.AmbientLight( 0x444444 ) );

  // light
  var light = new THREE.PointLight( 0xffffff, 1 );
  light.position.set( 0, 50, 50 );
  scene.add( light );
  //light.castShadow = true;

  // Debug Stuff
/*  var size = 25;
var divisions = 10;

var gridHelper = new THREE.GridHelper( size, divisions );
scene.add( gridHelper );
axes = new THREE.AxisHelper( 100 );
scene.add( axes );*/
  // geometry
  /*var character = {
    x: 1,
    y: 0
  }
  geometry = new THREE.SphereGeometry(2, 50, 50, 0, Math.PI * 2, 0, Math.PI * 2);
 material = new THREE.MeshNormalMaterial();
 var player = new THREE.Mesh(geometry, material);
 player.position.y = tileSize+tileHeight[character.y][character.x]*tileHeightMod+2;
 player.position.x = character.x*tileSize-offset
 player.position.z = character.y*tileSize-offset
scene.add(player)*/

  Map = new MapClass(MapConfig);
  Entity = new EntityObj();
  stats = new Stats();
  stats.showPanel( 0 );
 
  document.body.appendChild( stats.dom );

raycaster = new THREE.Raycaster();
        mouse = new THREE.Vector2();
  document.addEventListener( 'mousedown', onDocumentMouseDown, false );
  document.addEventListener( 'touchstart', onDocumentTouchStart, false );
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );


}

function onDocumentMouseMove( event ) {

  event.preventDefault();

  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}


function onDocumentTouchStart( event ) {

  event.preventDefault();

  event.clientX = event.touches[0].clientX;
  event.clientY = event.touches[0].clientY;
  onDocumentMouseDown( event );

}

function onDocumentMouseDown( event ) {
  if(event.which !== 1) return;
  if(INTERSECTED) {
    Entity.move(INTERSECTED.userData.x, INTERSECTED.userData.y);  
    console.log("Clicked ",INTERSECTED.userData.x, INTERSECTED.userData.y);
  }

}




function render() {
  stats.begin();
  var temp = 2;
  raycaster.setFromCamera( mouse, camera );

  var intersects = raycaster.intersectObjects( scene.children );

  if ( intersects.length > 0 ) {
    if ( INTERSECTED != intersects[ 0 ].object && intersects[0].object.material.type == "MultiMaterial" ) {
      if ( INTERSECTED ) INTERSECTED.material.materials[temp].emissive = new THREE.Color(0x000000);
      INTERSECTED = intersects[ 0 ].object;
      console.log("Hovering over",INTERSECTED.userData.x, INTERSECTED.userData.y);
      INTERSECTED.material.materials[temp].emissive = new THREE.Color(0xff0000)
    }

  } else {
    if(INTERSECTED) {
      INTERSECTED.material.materials[temp].emissive = new THREE.Color(0x000000)

      INTERSECTED = null;
    }
  }
        
  if(Entity.inMotion) {
    Entity.drawLoop();
  }
  renderer.render( scene, camera );
  stats.end();
  requestAnimationFrame(render);
}