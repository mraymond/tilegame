import * as THREE from 'three';
import Tile from './Tile';
import {scene} from '../setup';
const Tiles = {};
var req = require.context("../Tiles", true, /^(.*\.(js$))[^.]*$/i);
req.keys().forEach(function(key){
  Tiles[key.match(/\.\/(.*?)\.js/)[1]] = req(key).default;
});

const tileIds = [
  'Water',
  'Grass',
];

const objects = [];

class MapClass {
  constructor(mapConfig) {
    this.tiles = [];
    this.tileSize = mapConfig.tileSize;
    this.tileHeightMod = mapConfig.tileHeightMod;
    this.offset = mapConfig.offset;
    this.mapSize = this.findMapSize(mapConfig.tiles);
    mapConfig.tiles = this.expandMap(mapConfig.tiles);
    this.createMap(mapConfig.tiles, mapConfig.tileHeight);
  }

  createMap(tiles, tileHeight) {
    var geometry, mesh, tile;
    for(var i = 0; i < tiles.length;i++) {
      // Start a new row
      this.tiles.push([]);
      for(var j = 0; j < tiles[i].length; j++) {
        if(tiles[i][j] < 0 ) continue;
        // TODO: Add walkable
        tile = new Tiles[tileIds[tiles[i][j]]](tiles[i][j], tileHeight[i][j]);
        geometry = new THREE.BoxGeometry( this.tileSize, this.tileSize+tileHeight[i][j]*this.tileHeightMod, this.tileSize );
        
        tile.createMesh(geometry)
        /* This is can cause performance issues */
        // tile.mesh.castShadow = true;
        // tile.mesh.receiveShadow = true;
        tile.mesh.userData = {
          x: j,
          y: i
        }
        tile.mesh.position.y = tileHeight[i][j]*this.tileHeightMod/2+(this.tileSize/2);
        tile.mesh.position.x = j*this.tileSize-this.offset;
        tile.mesh.position.z = i*this.tileSize-this.offset;
        this.tiles[i].push(tile);
        scene.add( tile.mesh );
        objects.push(tile.mesh);
      }
    }
  }

  // Maps need to be perfect squares for A* Pathfinding
  // Use this to find the biggest part of the map
  findMapSize(tiles) {
    const yAxis = tiles.length; // This is the longest y can be
    let xAxis = 0;
    for(var i = 0; i < yAxis;i++) {
      if(tiles[i].length < xAxis) xAxis = tiles[i].length;
    }
    if(yAxis > xAxis) return yAxis
    return xAxis
  }

  expandMap(tiles) {
    // Add to the y axis if needed
    if(tiles.length < this.mapSize) {
      Array.apply(null, Array(this.mapSize - tiles.length)).map(function () { 
        return Array.apply(null, Array(this.mapSize)).map(() => nullTile);
      });
    }
    tiles = tiles.map((row) => {
      if(row.length < this.mapSize) {
        row.push(Array.apply(null, Array(this.mapSize - row.length)).map(() => nullTile));
      }
      return row;
    });
    return tiles;
  }

  isWalkable(x,y) {
    if(this.tiles[y] == null || this.tiles[y][x] == null) return false;
    return this.tiles[y][x].walkable;
  }
};

export default MapClass;