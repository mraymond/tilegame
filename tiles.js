var loader = new THREE.TextureLoader();
var tiles = {};
// URL of texture

tiles.grass = new THREE.MultiMaterial([
     new THREE.MeshBasicMaterial( { color: 0x333300 }), // Right
     new THREE.MeshBasicMaterial( { color: 0x333300 }), // back left
     new THREE.MeshLambertMaterial({map: loader.load("grass.jpg")}), // Top
     new THREE.MeshBasicMaterial( { color: 0x333300 }), // Bottom
     new THREE.MeshBasicMaterial( { color: 0x333300 }), // Left
     new THREE.MeshBasicMaterial( { color: 0x333300 }) // Back Right
  ]);

tiles.water = new THREE.MultiMaterial([
     new THREE.MeshBasicMaterial( { color: 0x005577 }), // Right
     new THREE.MeshBasicMaterial( { color: 0x005577 }), // back left
     new THREE.MeshLambertMaterial({map: loader.load("water.jpg")}), // Top
     new THREE.MeshBasicMaterial( { color: 0x005577 }), // Bottom
     new THREE.MeshBasicMaterial( { color: 0x005577 }), // Left
     new THREE.MeshBasicMaterial( { color: 0x005577 }) // Back Right
  ]);