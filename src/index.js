import * as THREE from 'three';
import MapClass from './js/classes/Map';
import EntityObj from './js/classes/Entity';
import MapConfig from './js/config/testmap';
import {renderer, scene, camera, controls} from './js/setup';


var container, raycaster, mouse, objects = [], INTERSECTED, Entity, stats, Map, Entity;



var clock = new THREE.Clock();

const nullTile = -1;





init();
render();

function init() {


  // renderer
  renderer.setViewport(0, 0, window.innerWidth, window.innerHeight  )
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  camera.position.set(-20, 20, 20)
  camera.lookAt(scene.position)

  //controls.addEventListener( 'change', render );
  controls.enableZoom = true;
  controls.enablePan = true;
  controls.enableRotate = false;
  controls.enabled = true;
  controls.maxPolarAngle = Math.PI / 2;
  var skyBoxGeometry = new THREE.BoxGeometry( 10000, 10000, 10000 );
  var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0xFF0000, side: THREE.BackSide } );
  var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
   scene.add(skyBox);
  //scene.fog = new THREE.FogExp2( 0xFF0000, 0.01 );
  // ambient
  scene.add( new THREE.AmbientLight( 0x222222 ) );

  // light
  var light = new THREE.PointLight( 0xffffff, 1 );
  light.position.set( 0, 50, 50 );
  scene.add( light );
  //light.castShadow = true;

  // Debug Stuff
// var size = 25;
// var divisions = 10;

// var gridHelper = new THREE.GridHelper( size, divisions );
// scene.add( gridHelper );
// const axes = new THREE.AxisHelper( 100 );
// scene.add( axes );
  // geometry
//   var character = {
//     x: 1,
//     y: 0
//   }
//   geometry = new THREE.SphereGeometry(2, 50, 50, 0, Math.PI * 2, 0, Math.PI * 2);
//  material = new THREE.MeshNormalMaterial();
//  var player = new THREE.Mesh(geometry, material);
//  player.position.y = tileSize+tileHeight[character.y][character.x]*tileHeightMod+2;
//  player.position.x = character.x*tileSize-offset
//  player.position.z = character.y*tileSize-offset
// scene.add(player)

  Map = new MapClass(MapConfig);
  Entity = new EntityObj(Map);
  // stats = new Stats();
  // stats.showPanel( 0 );
 
  // document.body.appendChild( stats.dom );

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
  //stats.begin();
  var temp = 2;
  raycaster.setFromCamera( mouse, camera );

  var intersects = raycaster.intersectObjects( scene.children );
  if ( intersects.length > 0 ) {
    if ( INTERSECTED != intersects[ 0 ].object) {
      if ( INTERSECTED ) INTERSECTED.material[2].emissive.setHex(0x000000);
      if (intersects[ 0 ].object?.userData?.x) { 
        INTERSECTED = intersects[ 0 ].object;
        console.log("Hovering over", INTERSECTED.userData.x, INTERSECTED.userData.y);
        INTERSECTED.material[2].emissive.setHex(0xff0000);
      }
    }

  } else {
    if(INTERSECTED) {
      INTERSECTED.material[2].emissive.setHex(0x000000);

      INTERSECTED = null;
    }
  }
  var delta = clock.getDelta(); 

  Entity.sprite.update(1000 * delta);
  if(Entity.inMotion) {
    Entity.drawLoop();
  }
  renderer.render( scene, camera );
  //stats.end();
  requestAnimationFrame(render);
}