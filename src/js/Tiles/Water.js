import TextureLoader from '../TextureLoader';
import Tile from '../classes/Tile';

class Water extends Tile {
  constructor(geometry, height=0, walkable=false) {
    super();
    this.geometry = geometry;
    this.material = new THREE.MultiMaterial([
      new THREE.MeshBasicMaterial( { color: 0x005577 }), // Right
      new THREE.MeshBasicMaterial( { color: 0x005577 }), // back left
      new THREE.MeshLambertMaterial({map: TextureLoader.getInstance().load(require('../../assets/tiles/water.jpg'))}), // Top
      new THREE.MeshBasicMaterial( { color: 0x005577 }), // Bottom
      new THREE.MeshBasicMaterial( { color: 0x005577 }), // Left
      new THREE.MeshBasicMaterial( { color: 0x005577 }) // Back Right
    ]);
    this.height = height;
    this.walkable = walkable;
  }

};

export default Water;