class Tile {
  constructor(material, height=0, walkable=true) {
    this.materialId = material;
    this.material = tileMaterials[tileMap[material]];
    this.height = height;
    this.walkable = walkable;
  }

  createMesh(geometry) {
    this.mesh = new THREE.Mesh(geometry, this.material());
  }
}