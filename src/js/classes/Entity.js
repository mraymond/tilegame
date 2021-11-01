import * as THREE from 'three';
import TextureLoader from '../TextureLoader';
import {scene} from '../setup';
import findPath from '../util/Path';
class EntityObj {
  constructor(Map) {
    this.Map = Map;
    function TextureAnimator(texture, tilesHoriz, tilesVert, numTiles, tileDispDuration, row, offset) 
    { 
      // note: texture passed by reference, will be updated by the update function.
        
      this.tilesHorizontal = tilesHoriz;
      this.tilesVertical = tilesVert;
      // how many images does this spritesheet contain?
      //  usually equals tilesHoriz * tilesVert, but not necessarily,
      //  if there at blank tiles at the bottom of the spritesheet. 
      this.numberOfTiles = numTiles;
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping; 
      texture.repeat.set( 1 / this.tilesHorizontal, 1 / this.tilesVertical );

      // how long should each image be displayed?
      this.tileDisplayDuration = tileDispDuration;

      // how long has the current image been displayed?
      this.currentDisplayTime = 0;

      // which image is currently being displayed?
      this.currentTile = 0;

      // Which sprite row to use
      texture.offset.y = 1 / row - .09;
        
      this.update = function( milliSec )
      {
        this.currentDisplayTime += milliSec;
        while (this.currentDisplayTime > this.tileDisplayDuration)
        {
          this.currentDisplayTime -= this.tileDisplayDuration;
          this.currentTile++;
          if (this.currentTile == this.numberOfTiles)
            this.currentTile = 0;
          var currentColumn = this.currentTile % this.tilesHorizontal;
          texture.offset.x = currentColumn / this.tilesHorizontal + offset;
        }
      };
    }
    this.moveDistance = 10;
    this.speed = 4;
    this.x = 1;
    this.y = 0;
    this.possibleMoves = {};
    this.walkPath = [];
    this.canMove = true;
    this.inMotion = false;
    this.drawPosition = {};
    this.steps = [];
    this.mesh = {};
    this.heightMod = 2.51;
    

    var spriteTexture = TextureLoader.getInstance().load(require('../../assets/sprites/entity_walk_sheet.png'));
    this.sprite = new TextureAnimator( spriteTexture, 8, 8, 8, 100, 3, 0); // texture, #horiz, #vert, #total, duration.
    var spriteMaterial = new THREE.MeshBasicMaterial( { map: spriteTexture, side:THREE.DoubleSide, color: 0xff0000 } );
    spriteMaterial.transparent = true;
    // spriteMaterial.scale.x = 2;
    // spriteMaterial.scale.y = 2;
    //spriteMaterial.wireframe = true;
    var spriteGeometry = new THREE.PlaneGeometry(5, 5, 1, 1);
    this.mesh = new THREE.Mesh(spriteGeometry, spriteMaterial);
    this.mesh.scale.x = 2;
    this.mesh.scale.y = 2;
    //runner.position.set(-100,25,0);
    //scene.add(runner);

    /*var geometry = new THREE.SphereGeometry(2, 50, 50, 0, Math.PI * 2, 0, Math.PI * 2);
    var material = new THREE.MeshNormalMaterial();
    this.mesh = new THREE.Mesh(geometry, material);*/

    this.drawPosition = {
      y: this.Map.tileSize+this.Map.tiles[this.y][this.x].height*this.Map.tileHeightMod+this.heightMod,
      x: this.x*this.Map.tileSize-this.Map.offset,
      z: this.y*this.Map.tileSize-this.Map.offset
    };
    this.mesh.position.y = this.drawPosition.y;
    this.mesh.position.x = this.drawPosition.x;
    this.mesh.position.z = this.drawPosition.z;
    scene.add(this.mesh);
    //this.addOverlays();
  }
  move(x,y) {
    if(!this.canMove || (this.x == x && this.y == y) || !this.possibleMoves[x+':'+y]) {
      // We didn't move anywhere
      return;
    }
    this.canMove = false;
    this.inMotion = true;
    this.possibleMoves[x+':'+y].shift()
    this.walkPath = this.possibleMoves[x+':'+y]; // Get rid of the first path movement, it is the current tile
    this.populateSteps();
    console.log(JSON.parse(JSON.stringify(this.steps)));
    this.x = x;
    this.y = y;
/*    this.x = x;
    this.y = y;
    this.mesh.position.y = Map.tileSize+Map.tileHeight[this.y][this.x]*Map.tileHeightMod+2;
    this.mesh.position.x = this.x*Map.tileSize-Map.offset
    this.mesh.position.z = this.y*Map.tileSize-Map.offset*/
  }
  populateSteps() {
    this.steps = [];
    var currentPosition = this.drawPosition, nextPosition = {}
    ,deltas = {}, j, drawTile = {}, lastTile = {x: this.x, y: this.y};
    for(var i = 0; i < this.walkPath.length; i++) {
      nextPosition = {
        x: this.walkPath[i][1]*this.Map.tileSize-this.Map.offset,
        z: this.walkPath[i][0]*this.Map.tileSize-this.Map.offset
      };
      console.log(currentPosition,nextPosition);
      deltas = {x: (currentPosition.x-nextPosition.x)/this.speed, z: (currentPosition.z-nextPosition.z)/this.speed};
      if(lastTile.x < this.walkPath[i][1] || lastTile.y > this.walkPath[i][0]) {
        drawTile = {x: this.walkPath[i][1], y: this.walkPath[i][0]};
      } else {
        drawTile = {x: lastTile.x, y: lastTile.y};
      }
      for(j = 0; j < this.speed; j++) {
        currentPosition.x -= deltas.x;
        currentPosition.z -= deltas.z
        this.steps.push({x:currentPosition.x, z: currentPosition.z, y:this.Map.tileSize+this.Map.tiles[this.walkPath[i][0]][this.walkPath[i][1]].height*this.Map.tileHeightMod+this.heightMod, drawTile: drawTile});
      }
      lastTile = {x: this.walkPath[i][1], y: this.walkPath[i][0]};
    }
    //console.log(this.steps[this.steps.length-1]);
  }
  drawLoop() {
    if(this.inMotion && this.steps.length == 0) {
      this.canMove = true;
      this.inMotion = false;
      this.addOverlays();
      this.drawPosition.drawTile.x = this.x;
      this.drawPosition.drawTile.z = this.y;
      this.mesh.position.y = this.Map.tileSize+this.Map.tiles[this.y][this.x].height*this.Map.tileHeightMod+this.heightMod;
      this.mesh.position.x = this.x*this.Map.tileSize-this.Map.offset
      this.mesh.position.z = this.y*this.Map.tileSize-this.Map.offset
      return;
    }
    this.drawPosition = this.steps.shift();
    this.mesh.position.y = this.drawPosition.y;
    this.mesh.position.x = this.drawPosition.x;
    this.mesh.position.z = this.drawPosition.z;
  }
  addOverlays() {
    var neighbors = this.getNeighbors(this.x,this.y,this.moveDistance);
    this.possibleMoves = {};
    var path;
    for(var i = 0; i < neighbors.length; i++) {
      if(!this.Map.isWalkable(neighbors[i].x,neighbors[i].y)) continue; // Use the walkable flag after testing
      path = findPath(this.Map.tiles, [this.y,this.x], [neighbors[i].y,neighbors[i].x]);
      if(path.length > this.moveDistance+1) continue;
      this.possibleMoves[neighbors[i].x+':'+neighbors[i].y] = path;
/*      tileOverlays[neighbors[i].x+':'+neighbors[i].y] = 'rgba(255,255,0,.8)';*/
    }
    //console.log(this.possibleMoves); // Doesn't like findPath(map, [5,7], [5,9]);
  }
  getNeighbors(x,y,radius) {
    var neighbors = [];
    if(!radius) radius = 1;
    // This returns a circle around coord
    /*for(var i = x-1; i < x+2; i++) {
      for(var j = y-1; j < y+2; j++) {
        if(i == x && j == y) continue;
        neighbors.push({x:i, y:j});
      }
    }*/
    var r, c, cMax, 
      cols = this.Map.tiles.length,
      rows = this.Map.tiles[0].length, 
      rMax = Math.min(y + radius + 1, rows),
      ret  = [],
      yOff;

    // Start `distance` rows away from the current position
    for (r = Math.max(y - radius, 0); r < rMax; r++) {
        yOff = Math.abs(r - y);
                
        // Work out where we should stop looping for this row
        cMax = Math.min(x + radius - yOff + 1, cols);

        // Start distance cols away from current pos
        for (c = Math.max(x - radius + yOff, 0); c < cMax; c++) {
            // If it's not the current position, add it to the result
            if (x != c || y != r)                      
                ret.push({x:c, y:r});
        }
    }
    return ret;
  }
}

export default EntityObj;