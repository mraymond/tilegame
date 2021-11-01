import * as THREE from 'three';
import TextureLoader from '../TextureLoader';
import Tile from '../classes/Tile';

class Grass extends Tile {
  constructor(geometry, height=0, walkable=true) {
    super();
    this.geometry = geometry;
    this.material = [
      new THREE.MeshBasicMaterial( { color: 0x333300 }), // Right
      new THREE.MeshBasicMaterial( { color: 0x333300 }), // back left
      new THREE.MeshLambertMaterial({map: TextureLoader.getInstance().load(require('../../assets/tiles/grass.jpg'))}), // Top
      new THREE.MeshBasicMaterial( { color: 0x333300 }), // Bottom
      new THREE.MeshBasicMaterial( { color: 0x333300 }), // Left
      new THREE.MeshBasicMaterial( { color: 0x333300 }) // Back Right
    ];
    this.height = height;
    this.walkable = walkable;
  }

};

export default Grass;