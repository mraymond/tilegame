import * as THREE from 'three';

class Tile {
  constructor(material, height=0, walkable=true) {
    this.materialId = material;
    this.material = new THREE.MeshBasicMaterial( { color: 0xAA0000 });
    this.height = height;
    this.walkable = walkable;
  }

  createMesh(geometry) {
    this.mesh = new THREE.Mesh(geometry, this.material);
  }
}

export default Tile;