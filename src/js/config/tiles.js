var loader = new THREE.TextureLoader();
import TextureLoader from '../TextureLoader';

var tileMaterials = {};
// URL of texture

tileMaterials.grass = function() {
    return new THREE.MultiMaterial([
     new THREE.MeshBasicMaterial( { color: 0x333300 }), // Right
     new THREE.MeshBasicMaterial( { color: 0x333300 }), // back left
     new THREE.MeshLambertMaterial({map: TextureLoader.getInstance().load(require('../../assets/tiles/grass.jpg'))}), // Top
     new THREE.MeshBasicMaterial( { color: 0x333300 }), // Bottom
     new THREE.MeshBasicMaterial( { color: 0x333300 }), // Left
     new THREE.MeshBasicMaterial( { color: 0x333300 }) // Back Right
  ]);
}

tileMaterials.water = function() {
    return new THREE.MultiMaterial([
     new THREE.MeshBasicMaterial( { color: 0x005577 }), // Right
     new THREE.MeshBasicMaterial( { color: 0x005577 }), // back left
     new THREE.MeshLambertMaterial({map: TextureLoader.getInstance().load(require('../../assets/tiles/water.jpg'))}), // Top
     new THREE.MeshBasicMaterial( { color: 0x005577 }), // Bottom
     new THREE.MeshBasicMaterial( { color: 0x005577 }), // Left
     new THREE.MeshBasicMaterial( { color: 0x005577 }) // Back Right
  ]);
}

export default tileMaterials; 