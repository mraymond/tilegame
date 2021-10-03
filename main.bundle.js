/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/js/TextureLoader.js":
/*!*********************************!*\
  !*** ./src/js/TextureLoader.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
THREE.Cache.enabled = true;

const TextureLoader = (function () {
    var _instance = null;

    var Loader = function () {
        var _loader = new THREE.TextureLoader();
        var _cache = [];

        function _cachePush(elem, val) {
            _cache.push({
                element: elem,
                value: val
            });
        }

        function _cacheSearch(elem) {
            for (var i = 0; i < _cache.length; i++) {
                if (_cache[i].element === elem) {
                    return _cache[i].value;
                }
            }

            return false;
        }

        function load(texture) {
            var match = _cacheSearch(texture);

            if (match) {
                return match;
            }

            var val = _loader.load(texture);
            _cachePush(texture, val);

            return val;
        }

        return {
            load: load
        }
    };

    function getInstance() {
        return (_instance) ? _instance : _instance = Loader();
    }

    return {
        getInstance: getInstance
    }
})();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (TextureLoader);

/***/ }),

/***/ "./src/js/classes/Entity.js":
/*!**********************************!*\
  !*** ./src/js/classes/Entity.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _TextureLoader__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../TextureLoader */ "./src/js/TextureLoader.js");
/* harmony import */ var _setup__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../setup */ "./src/js/setup.js");
/* harmony import */ var _util_Path__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/Path */ "./src/js/util/Path.js");



class EntityObj {
  constructor() {
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
    

    var spriteTexture = _TextureLoader__WEBPACK_IMPORTED_MODULE_0__["default"].getInstance().load(__webpack_require__(/*! ../../assets/sprites/entity_walk_sheet.png */ "./src/assets/sprites/entity_walk_sheet.png"));
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
      y: Map.tileSize+Map.tiles[this.y][this.x].height*Map.tileHeightMod+this.heightMod,
      x: this.x*Map.tileSize-Map.offset,
      z: this.y*Map.tileSize-Map.offset
    };
    this.mesh.position.y = this.drawPosition.y;
    this.mesh.position.x = this.drawPosition.x;
    this.mesh.position.z = this.drawPosition.z;
    _setup__WEBPACK_IMPORTED_MODULE_1__.scene.add(this.mesh);
    this.addOverlays();
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
        x: this.walkPath[i][1]*Map.tileSize-Map.offset,
        z: this.walkPath[i][0]*Map.tileSize-Map.offset
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
        this.steps.push({x:currentPosition.x, z: currentPosition.z, y:Map.tileSize+Map.tiles[this.walkPath[i][0]][this.walkPath[i][1]].height*Map.tileHeightMod+this.heightMod, drawTile: drawTile});
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
      this.mesh.position.y = Map.tileSize+Map.tiles[this.y][this.x].height*Map.tileHeightMod+this.heightMod;
      this.mesh.position.x = this.x*Map.tileSize-Map.offset
      this.mesh.position.z = this.y*Map.tileSize-Map.offset
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
      if(!Map.isWalkable(neighbors[i].x,neighbors[i].y)) continue; // Use the walkable flag after testing
      path = (0,_util_Path__WEBPACK_IMPORTED_MODULE_2__["default"])(Map.tiles, [this.y,this.x], [neighbors[i].y,neighbors[i].x]);
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
      cols = Map.tiles.length,
      rows = Map.tiles[0].length, 
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

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (EntityObj);

/***/ }),

/***/ "./src/js/classes/Map.js":
/*!*******************************!*\
  !*** ./src/js/classes/Map.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _Tile__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Tile */ "./src/js/classes/Tile.js");
/* harmony import */ var _setup__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../setup */ "./src/js/setup.js");



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
        tile = new _Tile__WEBPACK_IMPORTED_MODULE_0__["default"](tiles[i][j], tileHeight[i][j], (tiles[i][j]==1?true:false));
        geometry = new THREE.BoxGeometry( this.tileSize, this.tileSize+tileHeight[i][j]*this.tileHeightMod, this.tileSize );
        tile.createMesh(geometry)
        /* This is can cause performance issues
        mesh.castShadow = true;
        mesh.receiveShadow = true;*/
        tile.mesh.userData = {
          x: j,
          y: i
        }
        tile.mesh.position.y = tileHeight[i][j]*this.tileHeightMod/2+(this.tileSize/2);
        tile.mesh.position.x = j*this.tileSize-this.offset;
        tile.mesh.position.z = i*this.tileSize-this.offset;
        this.tiles[i].push(tile);
        _setup__WEBPACK_IMPORTED_MODULE_1__.scene.add( tile.mesh );
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
    // Hardcoding water as not walkable
    if(this.tiles[y] == null || this.tiles[y][x] == null) return false;
    return this.tiles[y][x].walkable;
  }
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MapClass);

/***/ }),

/***/ "./src/js/classes/Tile.js":
/*!********************************!*\
  !*** ./src/js/classes/Tile.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _config_tiles__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../config/tiles */ "./src/js/config/tiles.js");

var tileMap = ['water', 'grass'];

class Tile {
  constructor(material, height=0, walkable=true) {
    this.materialId = material;
    this.material = _config_tiles__WEBPACK_IMPORTED_MODULE_0__["default"][tileMap[material]];
    this.height = height;
    this.walkable = walkable;
  }

  createMesh(geometry) {
    this.mesh = new THREE.Mesh(geometry, this.material());
  }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Tile);

/***/ }),

/***/ "./src/js/config/testmap.js":
/*!**********************************!*\
  !*** ./src/js/config/testmap.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  tileSize: 5,
  tileHeightMod: 1,
  tiles: [
    [0, 1, 1, 1, 1, 1, 1, -1],
    [0, 1, 1, 1, 1, 1, 1, -1],
    [0, 1, 1, 0, 0, 0, 1, -1],
    [0, 1, 1, 1, 1, 0, 1, -1],
    [0, 1, 1, 1, 1, 0, 1, -1],
    [0, 0, 0, 1, 1, 0, 1, -1],
    [0, 0, 0, 1, 1, 1, 1, -1],
    [0, 0, 0, 1, 1, 1, 1, -1],
  ],
  tileHeight: [
    [0, 1, 2, 2, 2, 2, 2],
    [0, 1, 2, 2, 2, 2, 2],
    [0, 1, 2, 0, 0, 0, 1],
    [0, 2, 3, 4, 3, 0, 1],
    [0, 4, 2, 2, 2, 0, 1],
    [0, 0, 0, 1, 1, 0, 1],
    [0, 0, 0, 1, 1, 1, 1],
    [0, 0, 0, 1, 1, 1, 1],
  ],
  offset: 0
});

/***/ }),

/***/ "./src/js/config/tiles.js":
/*!********************************!*\
  !*** ./src/js/config/tiles.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _TextureLoader__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../TextureLoader */ "./src/js/TextureLoader.js");
var loader = new THREE.TextureLoader();


var tileMaterials = {};
// URL of texture

tileMaterials.grass = function() {
    return new THREE.MultiMaterial([
     new THREE.MeshBasicMaterial( { color: 0x333300 }), // Right
     new THREE.MeshBasicMaterial( { color: 0x333300 }), // back left
     new THREE.MeshLambertMaterial({map: _TextureLoader__WEBPACK_IMPORTED_MODULE_0__["default"].getInstance().load(__webpack_require__(/*! ../../assets/tiles/grass.jpg */ "./src/assets/tiles/grass.jpg"))}), // Top
     new THREE.MeshBasicMaterial( { color: 0x333300 }), // Bottom
     new THREE.MeshBasicMaterial( { color: 0x333300 }), // Left
     new THREE.MeshBasicMaterial( { color: 0x333300 }) // Back Right
  ]);
}

tileMaterials.water = function() {
    return new THREE.MultiMaterial([
     new THREE.MeshBasicMaterial( { color: 0x005577 }), // Right
     new THREE.MeshBasicMaterial( { color: 0x005577 }), // back left
     new THREE.MeshLambertMaterial({map: _TextureLoader__WEBPACK_IMPORTED_MODULE_0__["default"].getInstance().load(__webpack_require__(/*! ../../assets/tiles/water.jpg */ "./src/assets/tiles/water.jpg"))}), // Top
     new THREE.MeshBasicMaterial( { color: 0x005577 }), // Bottom
     new THREE.MeshBasicMaterial( { color: 0x005577 }), // Left
     new THREE.MeshBasicMaterial( { color: 0x005577 }) // Back Right
  ]);
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (tileMaterials); 

/***/ }),

/***/ "./src/js/setup.js":
/*!*************************!*\
  !*** ./src/js/setup.js ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   "renderer": () => (/* binding */ renderer),
/* harmony export */   "scene": () => (/* binding */ scene),
/* harmony export */   "camera": () => (/* binding */ camera),
/* harmony export */   "controls": () => (/* binding */ controls)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({});
const width = window.innerWidth,
    height = window.innerHeight,
    aspect = width/height,
    D = 20;
const renderer = new THREE.WebGLRenderer({ alpha: true });
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-D*aspect, D*aspect, D, -D, .1, 1000);
const controls = new THREE.OrbitControls( camera, renderer.domElement );

/***/ }),

/***/ "./src/js/util/Path.js":
/*!*****************************!*\
  !*** ./src/js/util/Path.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
function findPath(world, pathStart, pathEnd)
{
	// shortcuts for speed
	var	abs = Math.abs;
	var	max = Math.max;
	var	pow = Math.pow;
	var	sqrt = Math.sqrt;

	// the world data are integers:
	// anything higher than this number is considered blocked
	// this is handy is you use numbered sprites, more than one
	// of which is walkable road, grass, mud, etc
	var maxWalkableTileNum = 0;

	// keep track of the world dimensions
    // Note that this A-star implementation expects the world array to be square: 
	// it must have equal height and width. If your game world is rectangular, 
	// just fill the array with dummy values to pad the empty space.
	var worldWidth = world[0].length;
	var worldHeight = world.length;
	var worldSize =	worldWidth * worldHeight;

	// which heuristic should we use?
	// default: no diagonals (Manhattan)
	var distanceFunction = ManhattanDistance;
	var findNeighbours = function(){}; // empty

	/*

	// alternate heuristics, depending on your game:

	// diagonals allowed but no sqeezing through cracks:
	var distanceFunction = DiagonalDistance;
	var findNeighbours = DiagonalNeighbours;

	// diagonals and squeezing through cracks allowed:
	var distanceFunction = DiagonalDistance;
	var findNeighbours = DiagonalNeighboursFree;

	// euclidean but no squeezing through cracks:
	var distanceFunction = EuclideanDistance;
	var findNeighbours = DiagonalNeighbours;

	// euclidean and squeezing through cracks allowed:
	var distanceFunction = EuclideanDistance;
	var findNeighbours = DiagonalNeighboursFree;

	*/

	// distanceFunction functions
	// these return how far away a point is to another

	function ManhattanDistance(Point, Goal)
	{	// linear movement - no diagonals - just cardinal directions (NSEW)
		return abs(Point.x - Goal.x) + abs(Point.y - Goal.y);
	}

	function DiagonalDistance(Point, Goal)
	{	// diagonal movement - assumes diag dist is 1, same as cardinals
		return max(abs(Point.x - Goal.x), abs(Point.y - Goal.y));
	}

	function EuclideanDistance(Point, Goal)
	{	// diagonals are considered a little farther than cardinal directions
		// diagonal movement using Euclide (AC = sqrt(AB^2 + BC^2))
		// where AB = x2 - x1 and BC = y2 - y1 and AC will be [x3, y3]
		return sqrt(pow(Point.x - Goal.x, 2) + pow(Point.y - Goal.y, 2));
	}

	// Neighbours functions, used by findNeighbours function
	// to locate adjacent available cells that aren't blocked

	// Returns every available North, South, East or West
	// cell that is empty. No diagonals,
	// unless distanceFunction function is not Manhattan
	function Neighbours(x, y)
	{
		var	N = y - 1,
		S = y + 1,
		E = x + 1,
		W = x - 1,
		myN = N > -1 && canWalkHere(x, N),
		myS = S < worldHeight && canWalkHere(x, S),
		myE = E < worldWidth && canWalkHere(E, y),
		myW = W > -1 && canWalkHere(W, y),
		result = [];
		if(myN)
		result.push({x:x, y:N});
		if(myE)
		result.push({x:E, y:y});
		if(myS)
		result.push({x:x, y:S});
		if(myW)
		result.push({x:W, y:y});
		findNeighbours(myN, myS, myE, myW, N, S, E, W, result);
		return result;
	}

	// returns every available North East, South East,
	// South West or North West cell - no squeezing through
	// "cracks" between two diagonals
	function DiagonalNeighbours(myN, myS, myE, myW, N, S, E, W, result)
	{
		if(myN)
		{
			if(myE && canWalkHere(E, N))
			result.push({x:E, y:N});
			if(myW && canWalkHere(W, N))
			result.push({x:W, y:N});
		}
		if(myS)
		{
			if(myE && canWalkHere(E, S))
			result.push({x:E, y:S});
			if(myW && canWalkHere(W, S))
			result.push({x:W, y:S});
		}
	}

	// returns every available North East, South East,
	// South West or North West cell including the times that
	// you would be squeezing through a "crack"
	function DiagonalNeighboursFree(myN, myS, myE, myW, N, S, E, W, result)
	{
		myN = N > -1;
		myS = S < worldHeight;
		myE = E < worldWidth;
		myW = W > -1;
		if(myE)
		{
			if(myN && canWalkHere(E, N))
			result.push({x:E, y:N});
			if(myS && canWalkHere(E, S))
			result.push({x:E, y:S});
		}
		if(myW)
		{
			if(myN && canWalkHere(W, N))
			result.push({x:W, y:N});
			if(myS && canWalkHere(W, S))
			result.push({x:W, y:S});
		}
	}

	// returns boolean value (world cell is available and open)
	function canWalkHere(x, y)
	{
		return ((world[x] != null) &&
			(world[x][y] != null) &&
			(world[x][y].walkable));
	};

	// Node function, returns a new object with Node properties
	// Used in the calculatePath function to store route costs, etc.
	function Node(Parent, Point)
	{
		var newNode = {
			// pointer to another Node object
			Parent:Parent,
			// array index of this Node in the world linear array
			value:Point.x + (Point.y * worldWidth),
			// the location coordinates of this Node
			x:Point.x,
			y:Point.y,
			// the heuristic estimated cost
			// of an entire path using this node
			f:0,
			// the distanceFunction cost to get
			// from the starting point to this node
			g:0
		};

		return newNode;
	}

	// Path function, executes AStar algorithm operations
	function calculatePath()
	{
		// create Nodes from the Start and End x,y coordinates
		var	mypathStart = Node(null, {x:pathStart[0], y:pathStart[1]});
		var mypathEnd = Node(null, {x:pathEnd[0], y:pathEnd[1]});
		// create an array that will contain all world cells
		var AStar = new Array(worldSize);
		// list of currently open Nodes
		var Open = [mypathStart];
		// list of closed Nodes
		var Closed = [];
		// list of the final output array
		var result = [];
		// reference to a Node (that is nearby)
		var myNeighbours;
		// reference to a Node (that we are considering now)
		var myNode;
		// reference to a Node (that starts a path in question)
		var myPath;
		// temp integer variables used in the calculations
		var length, max, min, i, j;
		// iterate through the open list until none are left
		while(length = Open.length)
		{
			max = worldSize;
			min = -1;
			for(i = 0; i < length; i++)
			{
				if(Open[i].f < max)
				{
					max = Open[i].f;
					min = i;
				}
			}
			// grab the next node and remove it from Open array
			myNode = Open.splice(min, 1)[0];
			// is it the destination node?
			if(myNode.value === mypathEnd.value)
			{
				myPath = Closed[Closed.push(myNode) - 1];
				do
				{
					result.push([myPath.x, myPath.y]);
				}
				while (myPath = myPath.Parent);
				// clear the working arrays
				AStar = Closed = Open = [];
				// we want to return start to finish
				result.reverse();
			}
			else // not the destination
			{
				// find which nearby nodes are walkable
				myNeighbours = Neighbours(myNode.x, myNode.y);
				// test each one that hasn't been tried already
				for(i = 0, j = myNeighbours.length; i < j; i++)
				{
					myPath = Node(myNode, myNeighbours[i]);
					if (!AStar[myPath.value])
					{
						// estimated cost of this particular route so far
						myPath.g = myNode.g + distanceFunction(myNeighbours[i], myNode);
						// estimated cost of entire guessed route to the destination
						myPath.f = myPath.g + distanceFunction(myNeighbours[i], mypathEnd);
						// remember this new path for testing above
						Open.push(myPath);
						// mark this node in the world graph as visited
						AStar[myPath.value] = true;
					}
				}
				// remember this route as having no more untested options
				Closed.push(myNode);
			}
		} // keep iterating until the Open list is empty
		return result;
	}

	// actually calculate the a-star path!
	// this returns an array of coordinates
	// that is empty if no path is possible
	return calculatePath();

}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (findPath);

/***/ }),

/***/ "./src/assets/sprites/entity_walk_sheet.png":
/*!**************************************************!*\
  !*** ./src/assets/sprites/entity_walk_sheet.png ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "a6cc590ef256989f3b9c.png";

/***/ }),

/***/ "./src/assets/tiles/grass.jpg":
/*!************************************!*\
  !*** ./src/assets/tiles/grass.jpg ***!
  \************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "1a3da86295ce34374fc3.jpg";

/***/ }),

/***/ "./src/assets/tiles/water.jpg":
/*!************************************!*\
  !*** ./src/assets/tiles/water.jpg ***!
  \************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "f84eca13ad3cce0125f6.jpg";

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) scriptUrl = scripts[scripts.length - 1].src
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _js_classes_Map__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./js/classes/Map */ "./src/js/classes/Map.js");
/* harmony import */ var _js_classes_Entity__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./js/classes/Entity */ "./src/js/classes/Entity.js");
/* harmony import */ var _js_config_testmap__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./js/config/testmap */ "./src/js/config/testmap.js");
/* harmony import */ var _js_setup__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./js/setup */ "./src/js/setup.js");






var container, raycaster, mouse, objects = [], INTERSECTED, Entity, stats ;



var clock = new THREE.Clock();

const nullTile = -1;





init();
render();

function init() {


  // renderer
  _js_setup__WEBPACK_IMPORTED_MODULE_3__.renderer.setViewport(0, 0, window.innerWidth, window.innerHeight  )
  _js_setup__WEBPACK_IMPORTED_MODULE_3__.renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( _js_setup__WEBPACK_IMPORTED_MODULE_3__.renderer.domElement );

  _js_setup__WEBPACK_IMPORTED_MODULE_3__.camera.position.set(-20, 20, 20)
  _js_setup__WEBPACK_IMPORTED_MODULE_3__.camera.lookAt(_js_setup__WEBPACK_IMPORTED_MODULE_3__.scene.position)

  //controls.addEventListener( 'change', render );
  _js_setup__WEBPACK_IMPORTED_MODULE_3__.controls.enableZoom = true;
  _js_setup__WEBPACK_IMPORTED_MODULE_3__.controls.enablePan = true;
  _js_setup__WEBPACK_IMPORTED_MODULE_3__.controls.enableRotate = false;
  _js_setup__WEBPACK_IMPORTED_MODULE_3__.controls.enabled = true;
  _js_setup__WEBPACK_IMPORTED_MODULE_3__.controls.maxPolarAngle = Math.PI / 2;
  var skyBoxGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );
  var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0xFF0000, side: THREE.BackSide } );
  var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
   _js_setup__WEBPACK_IMPORTED_MODULE_3__.scene.add(skyBox);
  _js_setup__WEBPACK_IMPORTED_MODULE_3__.scene.fog = new THREE.FogExp2( 0xFF0000, 0.9 );
  // ambient
_js_setup__WEBPACK_IMPORTED_MODULE_3__.scene.add( new THREE.AmbientLight( 0x444444 ) );

  // light
  var light = new THREE.PointLight( 0xffffff, 1 );
  light.position.set( 0, 50, 50 );
  _js_setup__WEBPACK_IMPORTED_MODULE_3__.scene.add( light );
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

  Map = new _js_classes_Map__WEBPACK_IMPORTED_MODULE_0__["default"](_js_config_testmap__WEBPACK_IMPORTED_MODULE_2__["default"]);
  Entity = new _js_classes_Entity__WEBPACK_IMPORTED_MODULE_1__["default"]();
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
  raycaster.setFromCamera( mouse, _js_setup__WEBPACK_IMPORTED_MODULE_3__.camera );

  var intersects = raycaster.intersectObjects( _js_setup__WEBPACK_IMPORTED_MODULE_3__.scene.children );

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
  var delta = clock.getDelta(); 

  Entity.sprite.update(1000 * delta);
  if(Entity.inMotion) {
    Entity.drawLoop();
  }
  _js_setup__WEBPACK_IMPORTED_MODULE_3__.renderer.render( _js_setup__WEBPACK_IMPORTED_MODULE_3__.scene, _js_setup__WEBPACK_IMPORTED_MODULE_3__.camera );
  stats.end();
  requestAnimationFrame(render);
}
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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RUFBRSxnREFBUztBQUNYO0FBQ0EsZ0RBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUUsZ0RBQVM7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0I7QUFDbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLHVEQUFRLENBQUMsMERBQVM7QUFDOUIsZUFBZSwwREFBUztBQUN4QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtDQUFrQyw2Q0FBTTtBQUN4QztBQUNBLCtDQUErQyxxREFBYztBQUM3RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRSxzREFBZSxFQUFFLDRDQUFLLEVBQUUsNkNBQU07QUFDaEM7QUFDQTtBQUNBLEMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9pc290ZXN0Ly4vc3JjL2pzL1RleHR1cmVMb2FkZXIuanMiLCJ3ZWJwYWNrOi8vaXNvdGVzdC8uL3NyYy9qcy9jbGFzc2VzL0VudGl0eS5qcyIsIndlYnBhY2s6Ly9pc290ZXN0Ly4vc3JjL2pzL2NsYXNzZXMvTWFwLmpzIiwid2VicGFjazovL2lzb3Rlc3QvLi9zcmMvanMvY2xhc3Nlcy9UaWxlLmpzIiwid2VicGFjazovL2lzb3Rlc3QvLi9zcmMvanMvY29uZmlnL3Rlc3RtYXAuanMiLCJ3ZWJwYWNrOi8vaXNvdGVzdC8uL3NyYy9qcy9jb25maWcvdGlsZXMuanMiLCJ3ZWJwYWNrOi8vaXNvdGVzdC8uL3NyYy9qcy9zZXR1cC5qcyIsIndlYnBhY2s6Ly9pc290ZXN0Ly4vc3JjL2pzL3V0aWwvUGF0aC5qcyIsIndlYnBhY2s6Ly9pc290ZXN0L3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2lzb3Rlc3Qvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2lzb3Rlc3Qvd2VicGFjay9ydW50aW1lL2dsb2JhbCIsIndlYnBhY2s6Ly9pc290ZXN0L3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vaXNvdGVzdC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2lzb3Rlc3Qvd2VicGFjay9ydW50aW1lL3B1YmxpY1BhdGgiLCJ3ZWJwYWNrOi8vaXNvdGVzdC8uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJUSFJFRS5DYWNoZS5lbmFibGVkID0gdHJ1ZTtcclxuXHJcbmNvbnN0IFRleHR1cmVMb2FkZXIgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIF9pbnN0YW5jZSA9IG51bGw7XHJcblxyXG4gICAgdmFyIExvYWRlciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgX2xvYWRlciA9IG5ldyBUSFJFRS5UZXh0dXJlTG9hZGVyKCk7XHJcbiAgICAgICAgdmFyIF9jYWNoZSA9IFtdO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBfY2FjaGVQdXNoKGVsZW0sIHZhbCkge1xyXG4gICAgICAgICAgICBfY2FjaGUucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50OiBlbGVtLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHZhbFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIF9jYWNoZVNlYXJjaChlbGVtKSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgX2NhY2hlLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoX2NhY2hlW2ldLmVsZW1lbnQgPT09IGVsZW0pIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX2NhY2hlW2ldLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBsb2FkKHRleHR1cmUpIHtcclxuICAgICAgICAgICAgdmFyIG1hdGNoID0gX2NhY2hlU2VhcmNoKHRleHR1cmUpO1xyXG5cclxuICAgICAgICAgICAgaWYgKG1hdGNoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbWF0Y2g7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciB2YWwgPSBfbG9hZGVyLmxvYWQodGV4dHVyZSk7XHJcbiAgICAgICAgICAgIF9jYWNoZVB1c2godGV4dHVyZSwgdmFsKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB2YWw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBsb2FkOiBsb2FkXHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBmdW5jdGlvbiBnZXRJbnN0YW5jZSgpIHtcclxuICAgICAgICByZXR1cm4gKF9pbnN0YW5jZSkgPyBfaW5zdGFuY2UgOiBfaW5zdGFuY2UgPSBMb2FkZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGdldEluc3RhbmNlOiBnZXRJbnN0YW5jZVxyXG4gICAgfVxyXG59KSgpO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgVGV4dHVyZUxvYWRlcjsiLCJpbXBvcnQgVGV4dHVyZUxvYWRlciBmcm9tICcuLi9UZXh0dXJlTG9hZGVyJztcclxuaW1wb3J0IHtzY2VuZX0gZnJvbSAnLi4vc2V0dXAnO1xyXG5pbXBvcnQgZmluZFBhdGggZnJvbSAnLi4vdXRpbC9QYXRoJztcclxuY2xhc3MgRW50aXR5T2JqIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIGZ1bmN0aW9uIFRleHR1cmVBbmltYXRvcih0ZXh0dXJlLCB0aWxlc0hvcml6LCB0aWxlc1ZlcnQsIG51bVRpbGVzLCB0aWxlRGlzcER1cmF0aW9uLCByb3csIG9mZnNldCkgXHJcbiAgICB7IFxyXG4gICAgICAvLyBub3RlOiB0ZXh0dXJlIHBhc3NlZCBieSByZWZlcmVuY2UsIHdpbGwgYmUgdXBkYXRlZCBieSB0aGUgdXBkYXRlIGZ1bmN0aW9uLlxyXG4gICAgICAgIFxyXG4gICAgICB0aGlzLnRpbGVzSG9yaXpvbnRhbCA9IHRpbGVzSG9yaXo7XHJcbiAgICAgIHRoaXMudGlsZXNWZXJ0aWNhbCA9IHRpbGVzVmVydDtcclxuICAgICAgLy8gaG93IG1hbnkgaW1hZ2VzIGRvZXMgdGhpcyBzcHJpdGVzaGVldCBjb250YWluP1xyXG4gICAgICAvLyAgdXN1YWxseSBlcXVhbHMgdGlsZXNIb3JpeiAqIHRpbGVzVmVydCwgYnV0IG5vdCBuZWNlc3NhcmlseSxcclxuICAgICAgLy8gIGlmIHRoZXJlIGF0IGJsYW5rIHRpbGVzIGF0IHRoZSBib3R0b20gb2YgdGhlIHNwcml0ZXNoZWV0LiBcclxuICAgICAgdGhpcy5udW1iZXJPZlRpbGVzID0gbnVtVGlsZXM7XHJcbiAgICAgIHRleHR1cmUud3JhcFMgPSB0ZXh0dXJlLndyYXBUID0gVEhSRUUuUmVwZWF0V3JhcHBpbmc7IFxyXG4gICAgICB0ZXh0dXJlLnJlcGVhdC5zZXQoIDEgLyB0aGlzLnRpbGVzSG9yaXpvbnRhbCwgMSAvIHRoaXMudGlsZXNWZXJ0aWNhbCApO1xyXG5cclxuICAgICAgLy8gaG93IGxvbmcgc2hvdWxkIGVhY2ggaW1hZ2UgYmUgZGlzcGxheWVkP1xyXG4gICAgICB0aGlzLnRpbGVEaXNwbGF5RHVyYXRpb24gPSB0aWxlRGlzcER1cmF0aW9uO1xyXG5cclxuICAgICAgLy8gaG93IGxvbmcgaGFzIHRoZSBjdXJyZW50IGltYWdlIGJlZW4gZGlzcGxheWVkP1xyXG4gICAgICB0aGlzLmN1cnJlbnREaXNwbGF5VGltZSA9IDA7XHJcblxyXG4gICAgICAvLyB3aGljaCBpbWFnZSBpcyBjdXJyZW50bHkgYmVpbmcgZGlzcGxheWVkP1xyXG4gICAgICB0aGlzLmN1cnJlbnRUaWxlID0gMDtcclxuXHJcbiAgICAgIC8vIFdoaWNoIHNwcml0ZSByb3cgdG8gdXNlXHJcbiAgICAgIHRleHR1cmUub2Zmc2V0LnkgPSAxIC8gcm93IC0gLjA5O1xyXG4gICAgICAgIFxyXG4gICAgICB0aGlzLnVwZGF0ZSA9IGZ1bmN0aW9uKCBtaWxsaVNlYyApXHJcbiAgICAgIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnREaXNwbGF5VGltZSArPSBtaWxsaVNlYztcclxuICAgICAgICB3aGlsZSAodGhpcy5jdXJyZW50RGlzcGxheVRpbWUgPiB0aGlzLnRpbGVEaXNwbGF5RHVyYXRpb24pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgdGhpcy5jdXJyZW50RGlzcGxheVRpbWUgLT0gdGhpcy50aWxlRGlzcGxheUR1cmF0aW9uO1xyXG4gICAgICAgICAgdGhpcy5jdXJyZW50VGlsZSsrO1xyXG4gICAgICAgICAgaWYgKHRoaXMuY3VycmVudFRpbGUgPT0gdGhpcy5udW1iZXJPZlRpbGVzKVxyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRUaWxlID0gMDtcclxuICAgICAgICAgIHZhciBjdXJyZW50Q29sdW1uID0gdGhpcy5jdXJyZW50VGlsZSAlIHRoaXMudGlsZXNIb3Jpem9udGFsO1xyXG4gICAgICAgICAgdGV4dHVyZS5vZmZzZXQueCA9IGN1cnJlbnRDb2x1bW4gLyB0aGlzLnRpbGVzSG9yaXpvbnRhbCArIG9mZnNldDtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgICB0aGlzLm1vdmVEaXN0YW5jZSA9IDEwO1xyXG4gICAgdGhpcy5zcGVlZCA9IDQ7XHJcbiAgICB0aGlzLnggPSAxO1xyXG4gICAgdGhpcy55ID0gMDtcclxuICAgIHRoaXMucG9zc2libGVNb3ZlcyA9IHt9O1xyXG4gICAgdGhpcy53YWxrUGF0aCA9IFtdO1xyXG4gICAgdGhpcy5jYW5Nb3ZlID0gdHJ1ZTtcclxuICAgIHRoaXMuaW5Nb3Rpb24gPSBmYWxzZTtcclxuICAgIHRoaXMuZHJhd1Bvc2l0aW9uID0ge307XHJcbiAgICB0aGlzLnN0ZXBzID0gW107XHJcbiAgICB0aGlzLm1lc2ggPSB7fTtcclxuICAgIHRoaXMuaGVpZ2h0TW9kID0gMi41MTtcclxuICAgIFxyXG5cclxuICAgIHZhciBzcHJpdGVUZXh0dXJlID0gVGV4dHVyZUxvYWRlci5nZXRJbnN0YW5jZSgpLmxvYWQocmVxdWlyZSgnLi4vLi4vYXNzZXRzL3Nwcml0ZXMvZW50aXR5X3dhbGtfc2hlZXQucG5nJykpO1xyXG4gICAgdGhpcy5zcHJpdGUgPSBuZXcgVGV4dHVyZUFuaW1hdG9yKCBzcHJpdGVUZXh0dXJlLCA4LCA4LCA4LCAxMDAsIDMsIDApOyAvLyB0ZXh0dXJlLCAjaG9yaXosICN2ZXJ0LCAjdG90YWwsIGR1cmF0aW9uLlxyXG4gICAgdmFyIHNwcml0ZU1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKCB7IG1hcDogc3ByaXRlVGV4dHVyZSwgc2lkZTpUSFJFRS5Eb3VibGVTaWRlLCBjb2xvcjogMHhmZjAwMDAgfSApO1xyXG4gICAgc3ByaXRlTWF0ZXJpYWwudHJhbnNwYXJlbnQgPSB0cnVlO1xyXG4gICAgLy8gc3ByaXRlTWF0ZXJpYWwuc2NhbGUueCA9IDI7XHJcbiAgICAvLyBzcHJpdGVNYXRlcmlhbC5zY2FsZS55ID0gMjtcclxuICAgIC8vc3ByaXRlTWF0ZXJpYWwud2lyZWZyYW1lID0gdHJ1ZTtcclxuICAgIHZhciBzcHJpdGVHZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KDUsIDUsIDEsIDEpO1xyXG4gICAgdGhpcy5tZXNoID0gbmV3IFRIUkVFLk1lc2goc3ByaXRlR2VvbWV0cnksIHNwcml0ZU1hdGVyaWFsKTtcclxuICAgIHRoaXMubWVzaC5zY2FsZS54ID0gMjtcclxuICAgIHRoaXMubWVzaC5zY2FsZS55ID0gMjtcclxuICAgIC8vcnVubmVyLnBvc2l0aW9uLnNldCgtMTAwLDI1LDApO1xyXG4gICAgLy9zY2VuZS5hZGQocnVubmVyKTtcclxuXHJcbiAgICAvKnZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeSgyLCA1MCwgNTAsIDAsIE1hdGguUEkgKiAyLCAwLCBNYXRoLlBJICogMik7XHJcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaE5vcm1hbE1hdGVyaWFsKCk7XHJcbiAgICB0aGlzLm1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpOyovXHJcblxyXG4gICAgdGhpcy5kcmF3UG9zaXRpb24gPSB7XHJcbiAgICAgIHk6IE1hcC50aWxlU2l6ZStNYXAudGlsZXNbdGhpcy55XVt0aGlzLnhdLmhlaWdodCpNYXAudGlsZUhlaWdodE1vZCt0aGlzLmhlaWdodE1vZCxcclxuICAgICAgeDogdGhpcy54Kk1hcC50aWxlU2l6ZS1NYXAub2Zmc2V0LFxyXG4gICAgICB6OiB0aGlzLnkqTWFwLnRpbGVTaXplLU1hcC5vZmZzZXRcclxuICAgIH07XHJcbiAgICB0aGlzLm1lc2gucG9zaXRpb24ueSA9IHRoaXMuZHJhd1Bvc2l0aW9uLnk7XHJcbiAgICB0aGlzLm1lc2gucG9zaXRpb24ueCA9IHRoaXMuZHJhd1Bvc2l0aW9uLng7XHJcbiAgICB0aGlzLm1lc2gucG9zaXRpb24ueiA9IHRoaXMuZHJhd1Bvc2l0aW9uLno7XHJcbiAgICBzY2VuZS5hZGQodGhpcy5tZXNoKTtcclxuICAgIHRoaXMuYWRkT3ZlcmxheXMoKTtcclxuICB9XHJcbiAgbW92ZSh4LHkpIHtcclxuICAgIGlmKCF0aGlzLmNhbk1vdmUgfHwgKHRoaXMueCA9PSB4ICYmIHRoaXMueSA9PSB5KSB8fCAhdGhpcy5wb3NzaWJsZU1vdmVzW3grJzonK3ldKSB7XHJcbiAgICAgIC8vIFdlIGRpZG4ndCBtb3ZlIGFueXdoZXJlXHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHRoaXMuY2FuTW92ZSA9IGZhbHNlO1xyXG4gICAgdGhpcy5pbk1vdGlvbiA9IHRydWU7XHJcbiAgICB0aGlzLnBvc3NpYmxlTW92ZXNbeCsnOicreV0uc2hpZnQoKVxyXG4gICAgdGhpcy53YWxrUGF0aCA9IHRoaXMucG9zc2libGVNb3Zlc1t4Kyc6Jyt5XTsgLy8gR2V0IHJpZCBvZiB0aGUgZmlyc3QgcGF0aCBtb3ZlbWVudCwgaXQgaXMgdGhlIGN1cnJlbnQgdGlsZVxyXG4gICAgdGhpcy5wb3B1bGF0ZVN0ZXBzKCk7XHJcbiAgICBjb25zb2xlLmxvZyhKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMuc3RlcHMpKSk7XHJcbiAgICB0aGlzLnggPSB4O1xyXG4gICAgdGhpcy55ID0geTtcclxuLyogICAgdGhpcy54ID0geDtcclxuICAgIHRoaXMueSA9IHk7XHJcbiAgICB0aGlzLm1lc2gucG9zaXRpb24ueSA9IE1hcC50aWxlU2l6ZStNYXAudGlsZUhlaWdodFt0aGlzLnldW3RoaXMueF0qTWFwLnRpbGVIZWlnaHRNb2QrMjtcclxuICAgIHRoaXMubWVzaC5wb3NpdGlvbi54ID0gdGhpcy54Kk1hcC50aWxlU2l6ZS1NYXAub2Zmc2V0XHJcbiAgICB0aGlzLm1lc2gucG9zaXRpb24ueiA9IHRoaXMueSpNYXAudGlsZVNpemUtTWFwLm9mZnNldCovXHJcbiAgfVxyXG4gIHBvcHVsYXRlU3RlcHMoKSB7XHJcbiAgICB0aGlzLnN0ZXBzID0gW107XHJcbiAgICB2YXIgY3VycmVudFBvc2l0aW9uID0gdGhpcy5kcmF3UG9zaXRpb24sIG5leHRQb3NpdGlvbiA9IHt9XHJcbiAgICAsZGVsdGFzID0ge30sIGosIGRyYXdUaWxlID0ge30sIGxhc3RUaWxlID0ge3g6IHRoaXMueCwgeTogdGhpcy55fTtcclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLndhbGtQYXRoLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIG5leHRQb3NpdGlvbiA9IHtcclxuICAgICAgICB4OiB0aGlzLndhbGtQYXRoW2ldWzFdKk1hcC50aWxlU2l6ZS1NYXAub2Zmc2V0LFxyXG4gICAgICAgIHo6IHRoaXMud2Fsa1BhdGhbaV1bMF0qTWFwLnRpbGVTaXplLU1hcC5vZmZzZXRcclxuICAgICAgfTtcclxuICAgICAgY29uc29sZS5sb2coY3VycmVudFBvc2l0aW9uLG5leHRQb3NpdGlvbik7XHJcbiAgICAgIGRlbHRhcyA9IHt4OiAoY3VycmVudFBvc2l0aW9uLngtbmV4dFBvc2l0aW9uLngpL3RoaXMuc3BlZWQsIHo6IChjdXJyZW50UG9zaXRpb24uei1uZXh0UG9zaXRpb24ueikvdGhpcy5zcGVlZH07XHJcbiAgICAgIGlmKGxhc3RUaWxlLnggPCB0aGlzLndhbGtQYXRoW2ldWzFdIHx8IGxhc3RUaWxlLnkgPiB0aGlzLndhbGtQYXRoW2ldWzBdKSB7XHJcbiAgICAgICAgZHJhd1RpbGUgPSB7eDogdGhpcy53YWxrUGF0aFtpXVsxXSwgeTogdGhpcy53YWxrUGF0aFtpXVswXX07XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZHJhd1RpbGUgPSB7eDogbGFzdFRpbGUueCwgeTogbGFzdFRpbGUueX07XHJcbiAgICAgIH1cclxuICAgICAgZm9yKGogPSAwOyBqIDwgdGhpcy5zcGVlZDsgaisrKSB7XHJcbiAgICAgICAgY3VycmVudFBvc2l0aW9uLnggLT0gZGVsdGFzLng7XHJcbiAgICAgICAgY3VycmVudFBvc2l0aW9uLnogLT0gZGVsdGFzLnpcclxuICAgICAgICB0aGlzLnN0ZXBzLnB1c2goe3g6Y3VycmVudFBvc2l0aW9uLngsIHo6IGN1cnJlbnRQb3NpdGlvbi56LCB5Ok1hcC50aWxlU2l6ZStNYXAudGlsZXNbdGhpcy53YWxrUGF0aFtpXVswXV1bdGhpcy53YWxrUGF0aFtpXVsxXV0uaGVpZ2h0Kk1hcC50aWxlSGVpZ2h0TW9kK3RoaXMuaGVpZ2h0TW9kLCBkcmF3VGlsZTogZHJhd1RpbGV9KTtcclxuICAgICAgfVxyXG4gICAgICBsYXN0VGlsZSA9IHt4OiB0aGlzLndhbGtQYXRoW2ldWzFdLCB5OiB0aGlzLndhbGtQYXRoW2ldWzBdfTtcclxuICAgIH1cclxuICAgIC8vY29uc29sZS5sb2codGhpcy5zdGVwc1t0aGlzLnN0ZXBzLmxlbmd0aC0xXSk7XHJcbiAgfVxyXG4gIGRyYXdMb29wKCkge1xyXG4gICAgaWYodGhpcy5pbk1vdGlvbiAmJiB0aGlzLnN0ZXBzLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgIHRoaXMuY2FuTW92ZSA9IHRydWU7XHJcbiAgICAgIHRoaXMuaW5Nb3Rpb24gPSBmYWxzZTtcclxuICAgICAgdGhpcy5hZGRPdmVybGF5cygpO1xyXG4gICAgICB0aGlzLmRyYXdQb3NpdGlvbi5kcmF3VGlsZS54ID0gdGhpcy54O1xyXG4gICAgICB0aGlzLmRyYXdQb3NpdGlvbi5kcmF3VGlsZS56ID0gdGhpcy55O1xyXG4gICAgICB0aGlzLm1lc2gucG9zaXRpb24ueSA9IE1hcC50aWxlU2l6ZStNYXAudGlsZXNbdGhpcy55XVt0aGlzLnhdLmhlaWdodCpNYXAudGlsZUhlaWdodE1vZCt0aGlzLmhlaWdodE1vZDtcclxuICAgICAgdGhpcy5tZXNoLnBvc2l0aW9uLnggPSB0aGlzLngqTWFwLnRpbGVTaXplLU1hcC5vZmZzZXRcclxuICAgICAgdGhpcy5tZXNoLnBvc2l0aW9uLnogPSB0aGlzLnkqTWFwLnRpbGVTaXplLU1hcC5vZmZzZXRcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdGhpcy5kcmF3UG9zaXRpb24gPSB0aGlzLnN0ZXBzLnNoaWZ0KCk7XHJcbiAgICB0aGlzLm1lc2gucG9zaXRpb24ueSA9IHRoaXMuZHJhd1Bvc2l0aW9uLnk7XHJcbiAgICB0aGlzLm1lc2gucG9zaXRpb24ueCA9IHRoaXMuZHJhd1Bvc2l0aW9uLng7XHJcbiAgICB0aGlzLm1lc2gucG9zaXRpb24ueiA9IHRoaXMuZHJhd1Bvc2l0aW9uLno7XHJcbiAgfVxyXG4gIGFkZE92ZXJsYXlzKCkge1xyXG4gICAgdmFyIG5laWdoYm9ycyA9IHRoaXMuZ2V0TmVpZ2hib3JzKHRoaXMueCx0aGlzLnksdGhpcy5tb3ZlRGlzdGFuY2UpO1xyXG4gICAgdGhpcy5wb3NzaWJsZU1vdmVzID0ge307XHJcbiAgICB2YXIgcGF0aDtcclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBuZWlnaGJvcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgaWYoIU1hcC5pc1dhbGthYmxlKG5laWdoYm9yc1tpXS54LG5laWdoYm9yc1tpXS55KSkgY29udGludWU7IC8vIFVzZSB0aGUgd2Fsa2FibGUgZmxhZyBhZnRlciB0ZXN0aW5nXHJcbiAgICAgIHBhdGggPSBmaW5kUGF0aChNYXAudGlsZXMsIFt0aGlzLnksdGhpcy54XSwgW25laWdoYm9yc1tpXS55LG5laWdoYm9yc1tpXS54XSk7XHJcbiAgICAgIGlmKHBhdGgubGVuZ3RoID4gdGhpcy5tb3ZlRGlzdGFuY2UrMSkgY29udGludWU7XHJcbiAgICAgIHRoaXMucG9zc2libGVNb3Zlc1tuZWlnaGJvcnNbaV0ueCsnOicrbmVpZ2hib3JzW2ldLnldID0gcGF0aDtcclxuLyogICAgICB0aWxlT3ZlcmxheXNbbmVpZ2hib3JzW2ldLngrJzonK25laWdoYm9yc1tpXS55XSA9ICdyZ2JhKDI1NSwyNTUsMCwuOCknOyovXHJcbiAgICB9XHJcbiAgICAvL2NvbnNvbGUubG9nKHRoaXMucG9zc2libGVNb3Zlcyk7IC8vIERvZXNuJ3QgbGlrZSBmaW5kUGF0aChtYXAsIFs1LDddLCBbNSw5XSk7XHJcbiAgfVxyXG4gIGdldE5laWdoYm9ycyh4LHkscmFkaXVzKSB7XHJcbiAgICB2YXIgbmVpZ2hib3JzID0gW107XHJcbiAgICBpZighcmFkaXVzKSByYWRpdXMgPSAxO1xyXG4gICAgLy8gVGhpcyByZXR1cm5zIGEgY2lyY2xlIGFyb3VuZCBjb29yZFxyXG4gICAgLypmb3IodmFyIGkgPSB4LTE7IGkgPCB4KzI7IGkrKykge1xyXG4gICAgICBmb3IodmFyIGogPSB5LTE7IGogPCB5KzI7IGorKykge1xyXG4gICAgICAgIGlmKGkgPT0geCAmJiBqID09IHkpIGNvbnRpbnVlO1xyXG4gICAgICAgIG5laWdoYm9ycy5wdXNoKHt4OmksIHk6an0pO1xyXG4gICAgICB9XHJcbiAgICB9Ki9cclxuICAgIHZhciByLCBjLCBjTWF4LCBcclxuICAgICAgY29scyA9IE1hcC50aWxlcy5sZW5ndGgsXHJcbiAgICAgIHJvd3MgPSBNYXAudGlsZXNbMF0ubGVuZ3RoLCBcclxuICAgICAgck1heCA9IE1hdGgubWluKHkgKyByYWRpdXMgKyAxLCByb3dzKSxcclxuICAgICAgcmV0ICA9IFtdLFxyXG4gICAgICB5T2ZmO1xyXG5cclxuICAgIC8vIFN0YXJ0IGBkaXN0YW5jZWAgcm93cyBhd2F5IGZyb20gdGhlIGN1cnJlbnQgcG9zaXRpb25cclxuICAgIGZvciAociA9IE1hdGgubWF4KHkgLSByYWRpdXMsIDApOyByIDwgck1heDsgcisrKSB7XHJcbiAgICAgICAgeU9mZiA9IE1hdGguYWJzKHIgLSB5KTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgIC8vIFdvcmsgb3V0IHdoZXJlIHdlIHNob3VsZCBzdG9wIGxvb3BpbmcgZm9yIHRoaXMgcm93XHJcbiAgICAgICAgY01heCA9IE1hdGgubWluKHggKyByYWRpdXMgLSB5T2ZmICsgMSwgY29scyk7XHJcblxyXG4gICAgICAgIC8vIFN0YXJ0IGRpc3RhbmNlIGNvbHMgYXdheSBmcm9tIGN1cnJlbnQgcG9zXHJcbiAgICAgICAgZm9yIChjID0gTWF0aC5tYXgoeCAtIHJhZGl1cyArIHlPZmYsIDApOyBjIDwgY01heDsgYysrKSB7XHJcbiAgICAgICAgICAgIC8vIElmIGl0J3Mgbm90IHRoZSBjdXJyZW50IHBvc2l0aW9uLCBhZGQgaXQgdG8gdGhlIHJlc3VsdFxyXG4gICAgICAgICAgICBpZiAoeCAhPSBjIHx8IHkgIT0gcikgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICByZXQucHVzaCh7eDpjLCB5OnJ9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmV0O1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgRW50aXR5T2JqOyIsImltcG9ydCBUaWxlIGZyb20gJy4vVGlsZSc7XHJcbmltcG9ydCB7c2NlbmV9IGZyb20gJy4uL3NldHVwJztcclxuXHJcbmNvbnN0IG9iamVjdHMgPSBbXTtcclxuXHJcbmNsYXNzIE1hcENsYXNzIHtcclxuICBjb25zdHJ1Y3RvcihtYXBDb25maWcpIHtcclxuICAgIHRoaXMudGlsZXMgPSBbXTtcclxuICAgIHRoaXMudGlsZVNpemUgPSBtYXBDb25maWcudGlsZVNpemU7XHJcbiAgICB0aGlzLnRpbGVIZWlnaHRNb2QgPSBtYXBDb25maWcudGlsZUhlaWdodE1vZDtcclxuICAgIHRoaXMub2Zmc2V0ID0gbWFwQ29uZmlnLm9mZnNldDtcclxuICAgIHRoaXMubWFwU2l6ZSA9IHRoaXMuZmluZE1hcFNpemUobWFwQ29uZmlnLnRpbGVzKTtcclxuICAgIG1hcENvbmZpZy50aWxlcyA9IHRoaXMuZXhwYW5kTWFwKG1hcENvbmZpZy50aWxlcyk7XHJcbiAgICB0aGlzLmNyZWF0ZU1hcChtYXBDb25maWcudGlsZXMsIG1hcENvbmZpZy50aWxlSGVpZ2h0KTtcclxuICB9XHJcblxyXG4gIGNyZWF0ZU1hcCh0aWxlcywgdGlsZUhlaWdodCkge1xyXG4gICAgdmFyIGdlb21ldHJ5LCBtZXNoLCB0aWxlO1xyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHRpbGVzLmxlbmd0aDtpKyspIHtcclxuICAgICAgLy8gU3RhcnQgYSBuZXcgcm93XHJcbiAgICAgIHRoaXMudGlsZXMucHVzaChbXSk7XHJcbiAgICAgIGZvcih2YXIgaiA9IDA7IGogPCB0aWxlc1tpXS5sZW5ndGg7IGorKykge1xyXG4gICAgICAgIGlmKHRpbGVzW2ldW2pdIDwgMCApIGNvbnRpbnVlO1xyXG4gICAgICAgIC8vIFRPRE86IEFkZCB3YWxrYWJsZVxyXG4gICAgICAgIHRpbGUgPSBuZXcgVGlsZSh0aWxlc1tpXVtqXSwgdGlsZUhlaWdodFtpXVtqXSwgKHRpbGVzW2ldW2pdPT0xP3RydWU6ZmFsc2UpKTtcclxuICAgICAgICBnZW9tZXRyeSA9IG5ldyBUSFJFRS5Cb3hHZW9tZXRyeSggdGhpcy50aWxlU2l6ZSwgdGhpcy50aWxlU2l6ZSt0aWxlSGVpZ2h0W2ldW2pdKnRoaXMudGlsZUhlaWdodE1vZCwgdGhpcy50aWxlU2l6ZSApO1xyXG4gICAgICAgIHRpbGUuY3JlYXRlTWVzaChnZW9tZXRyeSlcclxuICAgICAgICAvKiBUaGlzIGlzIGNhbiBjYXVzZSBwZXJmb3JtYW5jZSBpc3N1ZXNcclxuICAgICAgICBtZXNoLmNhc3RTaGFkb3cgPSB0cnVlO1xyXG4gICAgICAgIG1lc2gucmVjZWl2ZVNoYWRvdyA9IHRydWU7Ki9cclxuICAgICAgICB0aWxlLm1lc2gudXNlckRhdGEgPSB7XHJcbiAgICAgICAgICB4OiBqLFxyXG4gICAgICAgICAgeTogaVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aWxlLm1lc2gucG9zaXRpb24ueSA9IHRpbGVIZWlnaHRbaV1bal0qdGhpcy50aWxlSGVpZ2h0TW9kLzIrKHRoaXMudGlsZVNpemUvMik7XHJcbiAgICAgICAgdGlsZS5tZXNoLnBvc2l0aW9uLnggPSBqKnRoaXMudGlsZVNpemUtdGhpcy5vZmZzZXQ7XHJcbiAgICAgICAgdGlsZS5tZXNoLnBvc2l0aW9uLnogPSBpKnRoaXMudGlsZVNpemUtdGhpcy5vZmZzZXQ7XHJcbiAgICAgICAgdGhpcy50aWxlc1tpXS5wdXNoKHRpbGUpO1xyXG4gICAgICAgIHNjZW5lLmFkZCggdGlsZS5tZXNoICk7XHJcbiAgICAgICAgb2JqZWN0cy5wdXNoKHRpbGUubWVzaCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIE1hcHMgbmVlZCB0byBiZSBwZXJmZWN0IHNxdWFyZXMgZm9yIEEqIFBhdGhmaW5kaW5nXHJcbiAgLy8gVXNlIHRoaXMgdG8gZmluZCB0aGUgYmlnZ2VzdCBwYXJ0IG9mIHRoZSBtYXBcclxuICBmaW5kTWFwU2l6ZSh0aWxlcykge1xyXG4gICAgY29uc3QgeUF4aXMgPSB0aWxlcy5sZW5ndGg7IC8vIFRoaXMgaXMgdGhlIGxvbmdlc3QgeSBjYW4gYmVcclxuICAgIGxldCB4QXhpcyA9IDA7XHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgeUF4aXM7aSsrKSB7XHJcbiAgICAgIGlmKHRpbGVzW2ldLmxlbmd0aCA8IHhBeGlzKSB4QXhpcyA9IHRpbGVzW2ldLmxlbmd0aDtcclxuICAgIH1cclxuICAgIGlmKHlBeGlzID4geEF4aXMpIHJldHVybiB5QXhpc1xyXG4gICAgcmV0dXJuIHhBeGlzXHJcbiAgfVxyXG5cclxuICBleHBhbmRNYXAodGlsZXMpIHtcclxuICAgIC8vIEFkZCB0byB0aGUgeSBheGlzIGlmIG5lZWRlZFxyXG4gICAgaWYodGlsZXMubGVuZ3RoIDwgdGhpcy5tYXBTaXplKSB7XHJcbiAgICAgIEFycmF5LmFwcGx5KG51bGwsIEFycmF5KHRoaXMubWFwU2l6ZSAtIHRpbGVzLmxlbmd0aCkpLm1hcChmdW5jdGlvbiAoKSB7IFxyXG4gICAgICAgIHJldHVybiBBcnJheS5hcHBseShudWxsLCBBcnJheSh0aGlzLm1hcFNpemUpKS5tYXAoKCkgPT4gbnVsbFRpbGUpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICAgIHRpbGVzID0gdGlsZXMubWFwKChyb3cpID0+IHtcclxuICAgICAgaWYocm93Lmxlbmd0aCA8IHRoaXMubWFwU2l6ZSkge1xyXG4gICAgICAgIHJvdy5wdXNoKEFycmF5LmFwcGx5KG51bGwsIEFycmF5KHRoaXMubWFwU2l6ZSAtIHJvdy5sZW5ndGgpKS5tYXAoKCkgPT4gbnVsbFRpbGUpKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gcm93O1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gdGlsZXM7XHJcbiAgfVxyXG5cclxuICBpc1dhbGthYmxlKHgseSkge1xyXG4gICAgLy8gSGFyZGNvZGluZyB3YXRlciBhcyBub3Qgd2Fsa2FibGVcclxuICAgIGlmKHRoaXMudGlsZXNbeV0gPT0gbnVsbCB8fCB0aGlzLnRpbGVzW3ldW3hdID09IG51bGwpIHJldHVybiBmYWxzZTtcclxuICAgIHJldHVybiB0aGlzLnRpbGVzW3ldW3hdLndhbGthYmxlO1xyXG4gIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IE1hcENsYXNzOyIsImltcG9ydCB0aWxlTWF0ZXJpYWxzIGZyb20gJy4uL2NvbmZpZy90aWxlcyc7XHJcbnZhciB0aWxlTWFwID0gWyd3YXRlcicsICdncmFzcyddO1xyXG5cclxuY2xhc3MgVGlsZSB7XHJcbiAgY29uc3RydWN0b3IobWF0ZXJpYWwsIGhlaWdodD0wLCB3YWxrYWJsZT10cnVlKSB7XHJcbiAgICB0aGlzLm1hdGVyaWFsSWQgPSBtYXRlcmlhbDtcclxuICAgIHRoaXMubWF0ZXJpYWwgPSB0aWxlTWF0ZXJpYWxzW3RpbGVNYXBbbWF0ZXJpYWxdXTtcclxuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG4gICAgdGhpcy53YWxrYWJsZSA9IHdhbGthYmxlO1xyXG4gIH1cclxuXHJcbiAgY3JlYXRlTWVzaChnZW9tZXRyeSkge1xyXG4gICAgdGhpcy5tZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIHRoaXMubWF0ZXJpYWwoKSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBUaWxlOyIsImV4cG9ydCBkZWZhdWx0IHtcclxuICB0aWxlU2l6ZTogNSxcclxuICB0aWxlSGVpZ2h0TW9kOiAxLFxyXG4gIHRpbGVzOiBbXHJcbiAgICBbMCwgMSwgMSwgMSwgMSwgMSwgMSwgLTFdLFxyXG4gICAgWzAsIDEsIDEsIDEsIDEsIDEsIDEsIC0xXSxcclxuICAgIFswLCAxLCAxLCAwLCAwLCAwLCAxLCAtMV0sXHJcbiAgICBbMCwgMSwgMSwgMSwgMSwgMCwgMSwgLTFdLFxyXG4gICAgWzAsIDEsIDEsIDEsIDEsIDAsIDEsIC0xXSxcclxuICAgIFswLCAwLCAwLCAxLCAxLCAwLCAxLCAtMV0sXHJcbiAgICBbMCwgMCwgMCwgMSwgMSwgMSwgMSwgLTFdLFxyXG4gICAgWzAsIDAsIDAsIDEsIDEsIDEsIDEsIC0xXSxcclxuICBdLFxyXG4gIHRpbGVIZWlnaHQ6IFtcclxuICAgIFswLCAxLCAyLCAyLCAyLCAyLCAyXSxcclxuICAgIFswLCAxLCAyLCAyLCAyLCAyLCAyXSxcclxuICAgIFswLCAxLCAyLCAwLCAwLCAwLCAxXSxcclxuICAgIFswLCAyLCAzLCA0LCAzLCAwLCAxXSxcclxuICAgIFswLCA0LCAyLCAyLCAyLCAwLCAxXSxcclxuICAgIFswLCAwLCAwLCAxLCAxLCAwLCAxXSxcclxuICAgIFswLCAwLCAwLCAxLCAxLCAxLCAxXSxcclxuICAgIFswLCAwLCAwLCAxLCAxLCAxLCAxXSxcclxuICBdLFxyXG4gIG9mZnNldDogMFxyXG59OyIsInZhciBsb2FkZXIgPSBuZXcgVEhSRUUuVGV4dHVyZUxvYWRlcigpO1xyXG5pbXBvcnQgVGV4dHVyZUxvYWRlciBmcm9tICcuLi9UZXh0dXJlTG9hZGVyJztcclxuXHJcbnZhciB0aWxlTWF0ZXJpYWxzID0ge307XHJcbi8vIFVSTCBvZiB0ZXh0dXJlXHJcblxyXG50aWxlTWF0ZXJpYWxzLmdyYXNzID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gbmV3IFRIUkVFLk11bHRpTWF0ZXJpYWwoW1xyXG4gICAgIG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCggeyBjb2xvcjogMHgzMzMzMDAgfSksIC8vIFJpZ2h0XHJcbiAgICAgbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKCB7IGNvbG9yOiAweDMzMzMwMCB9KSwgLy8gYmFjayBsZWZ0XHJcbiAgICAgbmV3IFRIUkVFLk1lc2hMYW1iZXJ0TWF0ZXJpYWwoe21hcDogVGV4dHVyZUxvYWRlci5nZXRJbnN0YW5jZSgpLmxvYWQocmVxdWlyZSgnLi4vLi4vYXNzZXRzL3RpbGVzL2dyYXNzLmpwZycpKX0pLCAvLyBUb3BcclxuICAgICBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoIHsgY29sb3I6IDB4MzMzMzAwIH0pLCAvLyBCb3R0b21cclxuICAgICBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoIHsgY29sb3I6IDB4MzMzMzAwIH0pLCAvLyBMZWZ0XHJcbiAgICAgbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKCB7IGNvbG9yOiAweDMzMzMwMCB9KSAvLyBCYWNrIFJpZ2h0XHJcbiAgXSk7XHJcbn1cclxuXHJcbnRpbGVNYXRlcmlhbHMud2F0ZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiBuZXcgVEhSRUUuTXVsdGlNYXRlcmlhbChbXHJcbiAgICAgbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKCB7IGNvbG9yOiAweDAwNTU3NyB9KSwgLy8gUmlnaHRcclxuICAgICBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoIHsgY29sb3I6IDB4MDA1NTc3IH0pLCAvLyBiYWNrIGxlZnRcclxuICAgICBuZXcgVEhSRUUuTWVzaExhbWJlcnRNYXRlcmlhbCh7bWFwOiBUZXh0dXJlTG9hZGVyLmdldEluc3RhbmNlKCkubG9hZChyZXF1aXJlKCcuLi8uLi9hc3NldHMvdGlsZXMvd2F0ZXIuanBnJykpfSksIC8vIFRvcFxyXG4gICAgIG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCggeyBjb2xvcjogMHgwMDU1NzcgfSksIC8vIEJvdHRvbVxyXG4gICAgIG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCggeyBjb2xvcjogMHgwMDU1NzcgfSksIC8vIExlZnRcclxuICAgICBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoIHsgY29sb3I6IDB4MDA1NTc3IH0pIC8vIEJhY2sgUmlnaHRcclxuICBdKTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgdGlsZU1hdGVyaWFsczsgIiwiZXhwb3J0IGRlZmF1bHQge307XHJcbmNvbnN0IHdpZHRoID0gd2luZG93LmlubmVyV2lkdGgsXHJcbiAgICBoZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQsXHJcbiAgICBhc3BlY3QgPSB3aWR0aC9oZWlnaHQsXHJcbiAgICBEID0gMjA7XHJcbmV4cG9ydCBjb25zdCByZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKHsgYWxwaGE6IHRydWUgfSk7XHJcbmV4cG9ydCBjb25zdCBzY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xyXG5leHBvcnQgY29uc3QgY2FtZXJhID0gbmV3IFRIUkVFLk9ydGhvZ3JhcGhpY0NhbWVyYSgtRCphc3BlY3QsIEQqYXNwZWN0LCBELCAtRCwgLjEsIDEwMDApO1xyXG5leHBvcnQgY29uc3QgY29udHJvbHMgPSBuZXcgVEhSRUUuT3JiaXRDb250cm9scyggY2FtZXJhLCByZW5kZXJlci5kb21FbGVtZW50ICk7IiwiZnVuY3Rpb24gZmluZFBhdGgod29ybGQsIHBhdGhTdGFydCwgcGF0aEVuZClcclxue1xyXG5cdC8vIHNob3J0Y3V0cyBmb3Igc3BlZWRcclxuXHR2YXJcdGFicyA9IE1hdGguYWJzO1xyXG5cdHZhclx0bWF4ID0gTWF0aC5tYXg7XHJcblx0dmFyXHRwb3cgPSBNYXRoLnBvdztcclxuXHR2YXJcdHNxcnQgPSBNYXRoLnNxcnQ7XHJcblxyXG5cdC8vIHRoZSB3b3JsZCBkYXRhIGFyZSBpbnRlZ2VyczpcclxuXHQvLyBhbnl0aGluZyBoaWdoZXIgdGhhbiB0aGlzIG51bWJlciBpcyBjb25zaWRlcmVkIGJsb2NrZWRcclxuXHQvLyB0aGlzIGlzIGhhbmR5IGlzIHlvdSB1c2UgbnVtYmVyZWQgc3ByaXRlcywgbW9yZSB0aGFuIG9uZVxyXG5cdC8vIG9mIHdoaWNoIGlzIHdhbGthYmxlIHJvYWQsIGdyYXNzLCBtdWQsIGV0Y1xyXG5cdHZhciBtYXhXYWxrYWJsZVRpbGVOdW0gPSAwO1xyXG5cclxuXHQvLyBrZWVwIHRyYWNrIG9mIHRoZSB3b3JsZCBkaW1lbnNpb25zXHJcbiAgICAvLyBOb3RlIHRoYXQgdGhpcyBBLXN0YXIgaW1wbGVtZW50YXRpb24gZXhwZWN0cyB0aGUgd29ybGQgYXJyYXkgdG8gYmUgc3F1YXJlOiBcclxuXHQvLyBpdCBtdXN0IGhhdmUgZXF1YWwgaGVpZ2h0IGFuZCB3aWR0aC4gSWYgeW91ciBnYW1lIHdvcmxkIGlzIHJlY3Rhbmd1bGFyLCBcclxuXHQvLyBqdXN0IGZpbGwgdGhlIGFycmF5IHdpdGggZHVtbXkgdmFsdWVzIHRvIHBhZCB0aGUgZW1wdHkgc3BhY2UuXHJcblx0dmFyIHdvcmxkV2lkdGggPSB3b3JsZFswXS5sZW5ndGg7XHJcblx0dmFyIHdvcmxkSGVpZ2h0ID0gd29ybGQubGVuZ3RoO1xyXG5cdHZhciB3b3JsZFNpemUgPVx0d29ybGRXaWR0aCAqIHdvcmxkSGVpZ2h0O1xyXG5cclxuXHQvLyB3aGljaCBoZXVyaXN0aWMgc2hvdWxkIHdlIHVzZT9cclxuXHQvLyBkZWZhdWx0OiBubyBkaWFnb25hbHMgKE1hbmhhdHRhbilcclxuXHR2YXIgZGlzdGFuY2VGdW5jdGlvbiA9IE1hbmhhdHRhbkRpc3RhbmNlO1xyXG5cdHZhciBmaW5kTmVpZ2hib3VycyA9IGZ1bmN0aW9uKCl7fTsgLy8gZW1wdHlcclxuXHJcblx0LypcclxuXHJcblx0Ly8gYWx0ZXJuYXRlIGhldXJpc3RpY3MsIGRlcGVuZGluZyBvbiB5b3VyIGdhbWU6XHJcblxyXG5cdC8vIGRpYWdvbmFscyBhbGxvd2VkIGJ1dCBubyBzcWVlemluZyB0aHJvdWdoIGNyYWNrczpcclxuXHR2YXIgZGlzdGFuY2VGdW5jdGlvbiA9IERpYWdvbmFsRGlzdGFuY2U7XHJcblx0dmFyIGZpbmROZWlnaGJvdXJzID0gRGlhZ29uYWxOZWlnaGJvdXJzO1xyXG5cclxuXHQvLyBkaWFnb25hbHMgYW5kIHNxdWVlemluZyB0aHJvdWdoIGNyYWNrcyBhbGxvd2VkOlxyXG5cdHZhciBkaXN0YW5jZUZ1bmN0aW9uID0gRGlhZ29uYWxEaXN0YW5jZTtcclxuXHR2YXIgZmluZE5laWdoYm91cnMgPSBEaWFnb25hbE5laWdoYm91cnNGcmVlO1xyXG5cclxuXHQvLyBldWNsaWRlYW4gYnV0IG5vIHNxdWVlemluZyB0aHJvdWdoIGNyYWNrczpcclxuXHR2YXIgZGlzdGFuY2VGdW5jdGlvbiA9IEV1Y2xpZGVhbkRpc3RhbmNlO1xyXG5cdHZhciBmaW5kTmVpZ2hib3VycyA9IERpYWdvbmFsTmVpZ2hib3VycztcclxuXHJcblx0Ly8gZXVjbGlkZWFuIGFuZCBzcXVlZXppbmcgdGhyb3VnaCBjcmFja3MgYWxsb3dlZDpcclxuXHR2YXIgZGlzdGFuY2VGdW5jdGlvbiA9IEV1Y2xpZGVhbkRpc3RhbmNlO1xyXG5cdHZhciBmaW5kTmVpZ2hib3VycyA9IERpYWdvbmFsTmVpZ2hib3Vyc0ZyZWU7XHJcblxyXG5cdCovXHJcblxyXG5cdC8vIGRpc3RhbmNlRnVuY3Rpb24gZnVuY3Rpb25zXHJcblx0Ly8gdGhlc2UgcmV0dXJuIGhvdyBmYXIgYXdheSBhIHBvaW50IGlzIHRvIGFub3RoZXJcclxuXHJcblx0ZnVuY3Rpb24gTWFuaGF0dGFuRGlzdGFuY2UoUG9pbnQsIEdvYWwpXHJcblx0e1x0Ly8gbGluZWFyIG1vdmVtZW50IC0gbm8gZGlhZ29uYWxzIC0ganVzdCBjYXJkaW5hbCBkaXJlY3Rpb25zIChOU0VXKVxyXG5cdFx0cmV0dXJuIGFicyhQb2ludC54IC0gR29hbC54KSArIGFicyhQb2ludC55IC0gR29hbC55KTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIERpYWdvbmFsRGlzdGFuY2UoUG9pbnQsIEdvYWwpXHJcblx0e1x0Ly8gZGlhZ29uYWwgbW92ZW1lbnQgLSBhc3N1bWVzIGRpYWcgZGlzdCBpcyAxLCBzYW1lIGFzIGNhcmRpbmFsc1xyXG5cdFx0cmV0dXJuIG1heChhYnMoUG9pbnQueCAtIEdvYWwueCksIGFicyhQb2ludC55IC0gR29hbC55KSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBFdWNsaWRlYW5EaXN0YW5jZShQb2ludCwgR29hbClcclxuXHR7XHQvLyBkaWFnb25hbHMgYXJlIGNvbnNpZGVyZWQgYSBsaXR0bGUgZmFydGhlciB0aGFuIGNhcmRpbmFsIGRpcmVjdGlvbnNcclxuXHRcdC8vIGRpYWdvbmFsIG1vdmVtZW50IHVzaW5nIEV1Y2xpZGUgKEFDID0gc3FydChBQl4yICsgQkNeMikpXHJcblx0XHQvLyB3aGVyZSBBQiA9IHgyIC0geDEgYW5kIEJDID0geTIgLSB5MSBhbmQgQUMgd2lsbCBiZSBbeDMsIHkzXVxyXG5cdFx0cmV0dXJuIHNxcnQocG93KFBvaW50LnggLSBHb2FsLngsIDIpICsgcG93KFBvaW50LnkgLSBHb2FsLnksIDIpKTtcclxuXHR9XHJcblxyXG5cdC8vIE5laWdoYm91cnMgZnVuY3Rpb25zLCB1c2VkIGJ5IGZpbmROZWlnaGJvdXJzIGZ1bmN0aW9uXHJcblx0Ly8gdG8gbG9jYXRlIGFkamFjZW50IGF2YWlsYWJsZSBjZWxscyB0aGF0IGFyZW4ndCBibG9ja2VkXHJcblxyXG5cdC8vIFJldHVybnMgZXZlcnkgYXZhaWxhYmxlIE5vcnRoLCBTb3V0aCwgRWFzdCBvciBXZXN0XHJcblx0Ly8gY2VsbCB0aGF0IGlzIGVtcHR5LiBObyBkaWFnb25hbHMsXHJcblx0Ly8gdW5sZXNzIGRpc3RhbmNlRnVuY3Rpb24gZnVuY3Rpb24gaXMgbm90IE1hbmhhdHRhblxyXG5cdGZ1bmN0aW9uIE5laWdoYm91cnMoeCwgeSlcclxuXHR7XHJcblx0XHR2YXJcdE4gPSB5IC0gMSxcclxuXHRcdFMgPSB5ICsgMSxcclxuXHRcdEUgPSB4ICsgMSxcclxuXHRcdFcgPSB4IC0gMSxcclxuXHRcdG15TiA9IE4gPiAtMSAmJiBjYW5XYWxrSGVyZSh4LCBOKSxcclxuXHRcdG15UyA9IFMgPCB3b3JsZEhlaWdodCAmJiBjYW5XYWxrSGVyZSh4LCBTKSxcclxuXHRcdG15RSA9IEUgPCB3b3JsZFdpZHRoICYmIGNhbldhbGtIZXJlKEUsIHkpLFxyXG5cdFx0bXlXID0gVyA+IC0xICYmIGNhbldhbGtIZXJlKFcsIHkpLFxyXG5cdFx0cmVzdWx0ID0gW107XHJcblx0XHRpZihteU4pXHJcblx0XHRyZXN1bHQucHVzaCh7eDp4LCB5Ok59KTtcclxuXHRcdGlmKG15RSlcclxuXHRcdHJlc3VsdC5wdXNoKHt4OkUsIHk6eX0pO1xyXG5cdFx0aWYobXlTKVxyXG5cdFx0cmVzdWx0LnB1c2goe3g6eCwgeTpTfSk7XHJcblx0XHRpZihteVcpXHJcblx0XHRyZXN1bHQucHVzaCh7eDpXLCB5Onl9KTtcclxuXHRcdGZpbmROZWlnaGJvdXJzKG15TiwgbXlTLCBteUUsIG15VywgTiwgUywgRSwgVywgcmVzdWx0KTtcclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fVxyXG5cclxuXHQvLyByZXR1cm5zIGV2ZXJ5IGF2YWlsYWJsZSBOb3J0aCBFYXN0LCBTb3V0aCBFYXN0LFxyXG5cdC8vIFNvdXRoIFdlc3Qgb3IgTm9ydGggV2VzdCBjZWxsIC0gbm8gc3F1ZWV6aW5nIHRocm91Z2hcclxuXHQvLyBcImNyYWNrc1wiIGJldHdlZW4gdHdvIGRpYWdvbmFsc1xyXG5cdGZ1bmN0aW9uIERpYWdvbmFsTmVpZ2hib3VycyhteU4sIG15UywgbXlFLCBteVcsIE4sIFMsIEUsIFcsIHJlc3VsdClcclxuXHR7XHJcblx0XHRpZihteU4pXHJcblx0XHR7XHJcblx0XHRcdGlmKG15RSAmJiBjYW5XYWxrSGVyZShFLCBOKSlcclxuXHRcdFx0cmVzdWx0LnB1c2goe3g6RSwgeTpOfSk7XHJcblx0XHRcdGlmKG15VyAmJiBjYW5XYWxrSGVyZShXLCBOKSlcclxuXHRcdFx0cmVzdWx0LnB1c2goe3g6VywgeTpOfSk7XHJcblx0XHR9XHJcblx0XHRpZihteVMpXHJcblx0XHR7XHJcblx0XHRcdGlmKG15RSAmJiBjYW5XYWxrSGVyZShFLCBTKSlcclxuXHRcdFx0cmVzdWx0LnB1c2goe3g6RSwgeTpTfSk7XHJcblx0XHRcdGlmKG15VyAmJiBjYW5XYWxrSGVyZShXLCBTKSlcclxuXHRcdFx0cmVzdWx0LnB1c2goe3g6VywgeTpTfSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyByZXR1cm5zIGV2ZXJ5IGF2YWlsYWJsZSBOb3J0aCBFYXN0LCBTb3V0aCBFYXN0LFxyXG5cdC8vIFNvdXRoIFdlc3Qgb3IgTm9ydGggV2VzdCBjZWxsIGluY2x1ZGluZyB0aGUgdGltZXMgdGhhdFxyXG5cdC8vIHlvdSB3b3VsZCBiZSBzcXVlZXppbmcgdGhyb3VnaCBhIFwiY3JhY2tcIlxyXG5cdGZ1bmN0aW9uIERpYWdvbmFsTmVpZ2hib3Vyc0ZyZWUobXlOLCBteVMsIG15RSwgbXlXLCBOLCBTLCBFLCBXLCByZXN1bHQpXHJcblx0e1xyXG5cdFx0bXlOID0gTiA+IC0xO1xyXG5cdFx0bXlTID0gUyA8IHdvcmxkSGVpZ2h0O1xyXG5cdFx0bXlFID0gRSA8IHdvcmxkV2lkdGg7XHJcblx0XHRteVcgPSBXID4gLTE7XHJcblx0XHRpZihteUUpXHJcblx0XHR7XHJcblx0XHRcdGlmKG15TiAmJiBjYW5XYWxrSGVyZShFLCBOKSlcclxuXHRcdFx0cmVzdWx0LnB1c2goe3g6RSwgeTpOfSk7XHJcblx0XHRcdGlmKG15UyAmJiBjYW5XYWxrSGVyZShFLCBTKSlcclxuXHRcdFx0cmVzdWx0LnB1c2goe3g6RSwgeTpTfSk7XHJcblx0XHR9XHJcblx0XHRpZihteVcpXHJcblx0XHR7XHJcblx0XHRcdGlmKG15TiAmJiBjYW5XYWxrSGVyZShXLCBOKSlcclxuXHRcdFx0cmVzdWx0LnB1c2goe3g6VywgeTpOfSk7XHJcblx0XHRcdGlmKG15UyAmJiBjYW5XYWxrSGVyZShXLCBTKSlcclxuXHRcdFx0cmVzdWx0LnB1c2goe3g6VywgeTpTfSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyByZXR1cm5zIGJvb2xlYW4gdmFsdWUgKHdvcmxkIGNlbGwgaXMgYXZhaWxhYmxlIGFuZCBvcGVuKVxyXG5cdGZ1bmN0aW9uIGNhbldhbGtIZXJlKHgsIHkpXHJcblx0e1xyXG5cdFx0cmV0dXJuICgod29ybGRbeF0gIT0gbnVsbCkgJiZcclxuXHRcdFx0KHdvcmxkW3hdW3ldICE9IG51bGwpICYmXHJcblx0XHRcdCh3b3JsZFt4XVt5XS53YWxrYWJsZSkpO1xyXG5cdH07XHJcblxyXG5cdC8vIE5vZGUgZnVuY3Rpb24sIHJldHVybnMgYSBuZXcgb2JqZWN0IHdpdGggTm9kZSBwcm9wZXJ0aWVzXHJcblx0Ly8gVXNlZCBpbiB0aGUgY2FsY3VsYXRlUGF0aCBmdW5jdGlvbiB0byBzdG9yZSByb3V0ZSBjb3N0cywgZXRjLlxyXG5cdGZ1bmN0aW9uIE5vZGUoUGFyZW50LCBQb2ludClcclxuXHR7XHJcblx0XHR2YXIgbmV3Tm9kZSA9IHtcclxuXHRcdFx0Ly8gcG9pbnRlciB0byBhbm90aGVyIE5vZGUgb2JqZWN0XHJcblx0XHRcdFBhcmVudDpQYXJlbnQsXHJcblx0XHRcdC8vIGFycmF5IGluZGV4IG9mIHRoaXMgTm9kZSBpbiB0aGUgd29ybGQgbGluZWFyIGFycmF5XHJcblx0XHRcdHZhbHVlOlBvaW50LnggKyAoUG9pbnQueSAqIHdvcmxkV2lkdGgpLFxyXG5cdFx0XHQvLyB0aGUgbG9jYXRpb24gY29vcmRpbmF0ZXMgb2YgdGhpcyBOb2RlXHJcblx0XHRcdHg6UG9pbnQueCxcclxuXHRcdFx0eTpQb2ludC55LFxyXG5cdFx0XHQvLyB0aGUgaGV1cmlzdGljIGVzdGltYXRlZCBjb3N0XHJcblx0XHRcdC8vIG9mIGFuIGVudGlyZSBwYXRoIHVzaW5nIHRoaXMgbm9kZVxyXG5cdFx0XHRmOjAsXHJcblx0XHRcdC8vIHRoZSBkaXN0YW5jZUZ1bmN0aW9uIGNvc3QgdG8gZ2V0XHJcblx0XHRcdC8vIGZyb20gdGhlIHN0YXJ0aW5nIHBvaW50IHRvIHRoaXMgbm9kZVxyXG5cdFx0XHRnOjBcclxuXHRcdH07XHJcblxyXG5cdFx0cmV0dXJuIG5ld05vZGU7XHJcblx0fVxyXG5cclxuXHQvLyBQYXRoIGZ1bmN0aW9uLCBleGVjdXRlcyBBU3RhciBhbGdvcml0aG0gb3BlcmF0aW9uc1xyXG5cdGZ1bmN0aW9uIGNhbGN1bGF0ZVBhdGgoKVxyXG5cdHtcclxuXHRcdC8vIGNyZWF0ZSBOb2RlcyBmcm9tIHRoZSBTdGFydCBhbmQgRW5kIHgseSBjb29yZGluYXRlc1xyXG5cdFx0dmFyXHRteXBhdGhTdGFydCA9IE5vZGUobnVsbCwge3g6cGF0aFN0YXJ0WzBdLCB5OnBhdGhTdGFydFsxXX0pO1xyXG5cdFx0dmFyIG15cGF0aEVuZCA9IE5vZGUobnVsbCwge3g6cGF0aEVuZFswXSwgeTpwYXRoRW5kWzFdfSk7XHJcblx0XHQvLyBjcmVhdGUgYW4gYXJyYXkgdGhhdCB3aWxsIGNvbnRhaW4gYWxsIHdvcmxkIGNlbGxzXHJcblx0XHR2YXIgQVN0YXIgPSBuZXcgQXJyYXkod29ybGRTaXplKTtcclxuXHRcdC8vIGxpc3Qgb2YgY3VycmVudGx5IG9wZW4gTm9kZXNcclxuXHRcdHZhciBPcGVuID0gW215cGF0aFN0YXJ0XTtcclxuXHRcdC8vIGxpc3Qgb2YgY2xvc2VkIE5vZGVzXHJcblx0XHR2YXIgQ2xvc2VkID0gW107XHJcblx0XHQvLyBsaXN0IG9mIHRoZSBmaW5hbCBvdXRwdXQgYXJyYXlcclxuXHRcdHZhciByZXN1bHQgPSBbXTtcclxuXHRcdC8vIHJlZmVyZW5jZSB0byBhIE5vZGUgKHRoYXQgaXMgbmVhcmJ5KVxyXG5cdFx0dmFyIG15TmVpZ2hib3VycztcclxuXHRcdC8vIHJlZmVyZW5jZSB0byBhIE5vZGUgKHRoYXQgd2UgYXJlIGNvbnNpZGVyaW5nIG5vdylcclxuXHRcdHZhciBteU5vZGU7XHJcblx0XHQvLyByZWZlcmVuY2UgdG8gYSBOb2RlICh0aGF0IHN0YXJ0cyBhIHBhdGggaW4gcXVlc3Rpb24pXHJcblx0XHR2YXIgbXlQYXRoO1xyXG5cdFx0Ly8gdGVtcCBpbnRlZ2VyIHZhcmlhYmxlcyB1c2VkIGluIHRoZSBjYWxjdWxhdGlvbnNcclxuXHRcdHZhciBsZW5ndGgsIG1heCwgbWluLCBpLCBqO1xyXG5cdFx0Ly8gaXRlcmF0ZSB0aHJvdWdoIHRoZSBvcGVuIGxpc3QgdW50aWwgbm9uZSBhcmUgbGVmdFxyXG5cdFx0d2hpbGUobGVuZ3RoID0gT3Blbi5sZW5ndGgpXHJcblx0XHR7XHJcblx0XHRcdG1heCA9IHdvcmxkU2l6ZTtcclxuXHRcdFx0bWluID0gLTE7XHJcblx0XHRcdGZvcihpID0gMDsgaSA8IGxlbmd0aDsgaSsrKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0aWYoT3BlbltpXS5mIDwgbWF4KVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdG1heCA9IE9wZW5baV0uZjtcclxuXHRcdFx0XHRcdG1pbiA9IGk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdC8vIGdyYWIgdGhlIG5leHQgbm9kZSBhbmQgcmVtb3ZlIGl0IGZyb20gT3BlbiBhcnJheVxyXG5cdFx0XHRteU5vZGUgPSBPcGVuLnNwbGljZShtaW4sIDEpWzBdO1xyXG5cdFx0XHQvLyBpcyBpdCB0aGUgZGVzdGluYXRpb24gbm9kZT9cclxuXHRcdFx0aWYobXlOb2RlLnZhbHVlID09PSBteXBhdGhFbmQudmFsdWUpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRteVBhdGggPSBDbG9zZWRbQ2xvc2VkLnB1c2gobXlOb2RlKSAtIDFdO1xyXG5cdFx0XHRcdGRvXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0cmVzdWx0LnB1c2goW215UGF0aC54LCBteVBhdGgueV0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHR3aGlsZSAobXlQYXRoID0gbXlQYXRoLlBhcmVudCk7XHJcblx0XHRcdFx0Ly8gY2xlYXIgdGhlIHdvcmtpbmcgYXJyYXlzXHJcblx0XHRcdFx0QVN0YXIgPSBDbG9zZWQgPSBPcGVuID0gW107XHJcblx0XHRcdFx0Ly8gd2Ugd2FudCB0byByZXR1cm4gc3RhcnQgdG8gZmluaXNoXHJcblx0XHRcdFx0cmVzdWx0LnJldmVyc2UoKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIC8vIG5vdCB0aGUgZGVzdGluYXRpb25cclxuXHRcdFx0e1xyXG5cdFx0XHRcdC8vIGZpbmQgd2hpY2ggbmVhcmJ5IG5vZGVzIGFyZSB3YWxrYWJsZVxyXG5cdFx0XHRcdG15TmVpZ2hib3VycyA9IE5laWdoYm91cnMobXlOb2RlLngsIG15Tm9kZS55KTtcclxuXHRcdFx0XHQvLyB0ZXN0IGVhY2ggb25lIHRoYXQgaGFzbid0IGJlZW4gdHJpZWQgYWxyZWFkeVxyXG5cdFx0XHRcdGZvcihpID0gMCwgaiA9IG15TmVpZ2hib3Vycy5sZW5ndGg7IGkgPCBqOyBpKyspXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0bXlQYXRoID0gTm9kZShteU5vZGUsIG15TmVpZ2hib3Vyc1tpXSk7XHJcblx0XHRcdFx0XHRpZiAoIUFTdGFyW215UGF0aC52YWx1ZV0pXHJcblx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdC8vIGVzdGltYXRlZCBjb3N0IG9mIHRoaXMgcGFydGljdWxhciByb3V0ZSBzbyBmYXJcclxuXHRcdFx0XHRcdFx0bXlQYXRoLmcgPSBteU5vZGUuZyArIGRpc3RhbmNlRnVuY3Rpb24obXlOZWlnaGJvdXJzW2ldLCBteU5vZGUpO1xyXG5cdFx0XHRcdFx0XHQvLyBlc3RpbWF0ZWQgY29zdCBvZiBlbnRpcmUgZ3Vlc3NlZCByb3V0ZSB0byB0aGUgZGVzdGluYXRpb25cclxuXHRcdFx0XHRcdFx0bXlQYXRoLmYgPSBteVBhdGguZyArIGRpc3RhbmNlRnVuY3Rpb24obXlOZWlnaGJvdXJzW2ldLCBteXBhdGhFbmQpO1xyXG5cdFx0XHRcdFx0XHQvLyByZW1lbWJlciB0aGlzIG5ldyBwYXRoIGZvciB0ZXN0aW5nIGFib3ZlXHJcblx0XHRcdFx0XHRcdE9wZW4ucHVzaChteVBhdGgpO1xyXG5cdFx0XHRcdFx0XHQvLyBtYXJrIHRoaXMgbm9kZSBpbiB0aGUgd29ybGQgZ3JhcGggYXMgdmlzaXRlZFxyXG5cdFx0XHRcdFx0XHRBU3RhcltteVBhdGgudmFsdWVdID0gdHJ1ZTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Ly8gcmVtZW1iZXIgdGhpcyByb3V0ZSBhcyBoYXZpbmcgbm8gbW9yZSB1bnRlc3RlZCBvcHRpb25zXHJcblx0XHRcdFx0Q2xvc2VkLnB1c2gobXlOb2RlKTtcclxuXHRcdFx0fVxyXG5cdFx0fSAvLyBrZWVwIGl0ZXJhdGluZyB1bnRpbCB0aGUgT3BlbiBsaXN0IGlzIGVtcHR5XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxuXHJcblx0Ly8gYWN0dWFsbHkgY2FsY3VsYXRlIHRoZSBhLXN0YXIgcGF0aCFcclxuXHQvLyB0aGlzIHJldHVybnMgYW4gYXJyYXkgb2YgY29vcmRpbmF0ZXNcclxuXHQvLyB0aGF0IGlzIGVtcHR5IGlmIG5vIHBhdGggaXMgcG9zc2libGVcclxuXHRyZXR1cm4gY2FsY3VsYXRlUGF0aCgpO1xyXG5cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgZmluZFBhdGg7IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18uZyA9IChmdW5jdGlvbigpIHtcblx0aWYgKHR5cGVvZiBnbG9iYWxUaGlzID09PSAnb2JqZWN0JykgcmV0dXJuIGdsb2JhbFRoaXM7XG5cdHRyeSB7XG5cdFx0cmV0dXJuIHRoaXMgfHwgbmV3IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHRpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpIHJldHVybiB3aW5kb3c7XG5cdH1cbn0pKCk7IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsInZhciBzY3JpcHRVcmw7XG5pZiAoX193ZWJwYWNrX3JlcXVpcmVfXy5nLmltcG9ydFNjcmlwdHMpIHNjcmlwdFVybCA9IF9fd2VicGFja19yZXF1aXJlX18uZy5sb2NhdGlvbiArIFwiXCI7XG52YXIgZG9jdW1lbnQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLmcuZG9jdW1lbnQ7XG5pZiAoIXNjcmlwdFVybCAmJiBkb2N1bWVudCkge1xuXHRpZiAoZG9jdW1lbnQuY3VycmVudFNjcmlwdClcblx0XHRzY3JpcHRVcmwgPSBkb2N1bWVudC5jdXJyZW50U2NyaXB0LnNyY1xuXHRpZiAoIXNjcmlwdFVybCkge1xuXHRcdHZhciBzY3JpcHRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJzY3JpcHRcIik7XG5cdFx0aWYoc2NyaXB0cy5sZW5ndGgpIHNjcmlwdFVybCA9IHNjcmlwdHNbc2NyaXB0cy5sZW5ndGggLSAxXS5zcmNcblx0fVxufVxuLy8gV2hlbiBzdXBwb3J0aW5nIGJyb3dzZXJzIHdoZXJlIGFuIGF1dG9tYXRpYyBwdWJsaWNQYXRoIGlzIG5vdCBzdXBwb3J0ZWQgeW91IG11c3Qgc3BlY2lmeSBhbiBvdXRwdXQucHVibGljUGF0aCBtYW51YWxseSB2aWEgY29uZmlndXJhdGlvblxuLy8gb3IgcGFzcyBhbiBlbXB0eSBzdHJpbmcgKFwiXCIpIGFuZCBzZXQgdGhlIF9fd2VicGFja19wdWJsaWNfcGF0aF9fIHZhcmlhYmxlIGZyb20geW91ciBjb2RlIHRvIHVzZSB5b3VyIG93biBsb2dpYy5cbmlmICghc2NyaXB0VXJsKSB0aHJvdyBuZXcgRXJyb3IoXCJBdXRvbWF0aWMgcHVibGljUGF0aCBpcyBub3Qgc3VwcG9ydGVkIGluIHRoaXMgYnJvd3NlclwiKTtcbnNjcmlwdFVybCA9IHNjcmlwdFVybC5yZXBsYWNlKC8jLiokLywgXCJcIikucmVwbGFjZSgvXFw/LiokLywgXCJcIikucmVwbGFjZSgvXFwvW15cXC9dKyQvLCBcIi9cIik7XG5fX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBzY3JpcHRVcmw7IiwiaW1wb3J0IE1hcENsYXNzIGZyb20gJy4vanMvY2xhc3Nlcy9NYXAnO1xyXG5pbXBvcnQgRW50aXR5T2JqIGZyb20gJy4vanMvY2xhc3Nlcy9FbnRpdHknO1xyXG5pbXBvcnQgTWFwQ29uZmlnIGZyb20gJy4vanMvY29uZmlnL3Rlc3RtYXAnO1xyXG5pbXBvcnQge3JlbmRlcmVyLCBzY2VuZSwgY2FtZXJhLCBjb250cm9sc30gZnJvbSAnLi9qcy9zZXR1cCc7XHJcblxyXG5cclxudmFyIGNvbnRhaW5lciwgcmF5Y2FzdGVyLCBtb3VzZSwgb2JqZWN0cyA9IFtdLCBJTlRFUlNFQ1RFRCwgRW50aXR5LCBzdGF0cyA7XHJcblxyXG5cclxuXHJcbnZhciBjbG9jayA9IG5ldyBUSFJFRS5DbG9jaygpO1xyXG5cclxuY29uc3QgbnVsbFRpbGUgPSAtMTtcclxuXHJcblxyXG5cclxuXHJcblxyXG5pbml0KCk7XHJcbnJlbmRlcigpO1xyXG5cclxuZnVuY3Rpb24gaW5pdCgpIHtcclxuXHJcblxyXG4gIC8vIHJlbmRlcmVyXHJcbiAgcmVuZGVyZXIuc2V0Vmlld3BvcnQoMCwgMCwgd2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCAgKVxyXG4gIHJlbmRlcmVyLnNldFNpemUoIHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQgKTtcclxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCByZW5kZXJlci5kb21FbGVtZW50ICk7XHJcblxyXG4gIGNhbWVyYS5wb3NpdGlvbi5zZXQoLTIwLCAyMCwgMjApXHJcbiAgY2FtZXJhLmxvb2tBdChzY2VuZS5wb3NpdGlvbilcclxuXHJcbiAgLy9jb250cm9scy5hZGRFdmVudExpc3RlbmVyKCAnY2hhbmdlJywgcmVuZGVyICk7XHJcbiAgY29udHJvbHMuZW5hYmxlWm9vbSA9IHRydWU7XHJcbiAgY29udHJvbHMuZW5hYmxlUGFuID0gdHJ1ZTtcclxuICBjb250cm9scy5lbmFibGVSb3RhdGUgPSBmYWxzZTtcclxuICBjb250cm9scy5lbmFibGVkID0gdHJ1ZTtcclxuICBjb250cm9scy5tYXhQb2xhckFuZ2xlID0gTWF0aC5QSSAvIDI7XHJcbiAgdmFyIHNreUJveEdlb21ldHJ5ID0gbmV3IFRIUkVFLkN1YmVHZW9tZXRyeSggMTAwMDAsIDEwMDAwLCAxMDAwMCApO1xyXG4gIHZhciBza3lCb3hNYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCggeyBjb2xvcjogMHhGRjAwMDAsIHNpZGU6IFRIUkVFLkJhY2tTaWRlIH0gKTtcclxuICB2YXIgc2t5Qm94ID0gbmV3IFRIUkVFLk1lc2goIHNreUJveEdlb21ldHJ5LCBza3lCb3hNYXRlcmlhbCApO1xyXG4gICBzY2VuZS5hZGQoc2t5Qm94KTtcclxuICBzY2VuZS5mb2cgPSBuZXcgVEhSRUUuRm9nRXhwMiggMHhGRjAwMDAsIDAuOSApO1xyXG4gIC8vIGFtYmllbnRcclxuc2NlbmUuYWRkKCBuZXcgVEhSRUUuQW1iaWVudExpZ2h0KCAweDQ0NDQ0NCApICk7XHJcblxyXG4gIC8vIGxpZ2h0XHJcbiAgdmFyIGxpZ2h0ID0gbmV3IFRIUkVFLlBvaW50TGlnaHQoIDB4ZmZmZmZmLCAxICk7XHJcbiAgbGlnaHQucG9zaXRpb24uc2V0KCAwLCA1MCwgNTAgKTtcclxuICBzY2VuZS5hZGQoIGxpZ2h0ICk7XHJcbiAgLy9saWdodC5jYXN0U2hhZG93ID0gdHJ1ZTtcclxuXHJcbiAgLy8gRGVidWcgU3R1ZmZcclxuLyogIHZhciBzaXplID0gMjU7XHJcbnZhciBkaXZpc2lvbnMgPSAxMDtcclxuXHJcbnZhciBncmlkSGVscGVyID0gbmV3IFRIUkVFLkdyaWRIZWxwZXIoIHNpemUsIGRpdmlzaW9ucyApO1xyXG5zY2VuZS5hZGQoIGdyaWRIZWxwZXIgKTtcclxuYXhlcyA9IG5ldyBUSFJFRS5BeGlzSGVscGVyKCAxMDAgKTtcclxuc2NlbmUuYWRkKCBheGVzICk7Ki9cclxuICAvLyBnZW9tZXRyeVxyXG4gIC8qdmFyIGNoYXJhY3RlciA9IHtcclxuICAgIHg6IDEsXHJcbiAgICB5OiAwXHJcbiAgfVxyXG4gIGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KDIsIDUwLCA1MCwgMCwgTWF0aC5QSSAqIDIsIDAsIE1hdGguUEkgKiAyKTtcclxuIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hOb3JtYWxNYXRlcmlhbCgpO1xyXG4gdmFyIHBsYXllciA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiBwbGF5ZXIucG9zaXRpb24ueSA9IHRpbGVTaXplK3RpbGVIZWlnaHRbY2hhcmFjdGVyLnldW2NoYXJhY3Rlci54XSp0aWxlSGVpZ2h0TW9kKzI7XHJcbiBwbGF5ZXIucG9zaXRpb24ueCA9IGNoYXJhY3Rlci54KnRpbGVTaXplLW9mZnNldFxyXG4gcGxheWVyLnBvc2l0aW9uLnogPSBjaGFyYWN0ZXIueSp0aWxlU2l6ZS1vZmZzZXRcclxuc2NlbmUuYWRkKHBsYXllcikqL1xyXG5cclxuICBNYXAgPSBuZXcgTWFwQ2xhc3MoTWFwQ29uZmlnKTtcclxuICBFbnRpdHkgPSBuZXcgRW50aXR5T2JqKCk7XHJcbiAgc3RhdHMgPSBuZXcgU3RhdHMoKTtcclxuICBzdGF0cy5zaG93UGFuZWwoIDAgKTtcclxuIFxyXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIHN0YXRzLmRvbSApO1xyXG5cclxucmF5Y2FzdGVyID0gbmV3IFRIUkVFLlJheWNhc3RlcigpO1xyXG4gICAgICAgIG1vdXNlID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcclxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAnbW91c2Vkb3duJywgb25Eb2N1bWVudE1vdXNlRG93biwgZmFsc2UgKTtcclxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAndG91Y2hzdGFydCcsIG9uRG9jdW1lbnRUb3VjaFN0YXJ0LCBmYWxzZSApO1xyXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZW1vdmUnLCBvbkRvY3VtZW50TW91c2VNb3ZlLCBmYWxzZSApO1xyXG5cclxuXHJcbn1cclxuXHJcbmZ1bmN0aW9uIG9uRG9jdW1lbnRNb3VzZU1vdmUoIGV2ZW50ICkge1xyXG5cclxuICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICBtb3VzZS54ID0gKCBldmVudC5jbGllbnRYIC8gd2luZG93LmlubmVyV2lkdGggKSAqIDIgLSAxO1xyXG4gIG1vdXNlLnkgPSAtICggZXZlbnQuY2xpZW50WSAvIHdpbmRvdy5pbm5lckhlaWdodCApICogMiArIDE7XHJcblxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gb25Eb2N1bWVudFRvdWNoU3RhcnQoIGV2ZW50ICkge1xyXG5cclxuICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICBldmVudC5jbGllbnRYID0gZXZlbnQudG91Y2hlc1swXS5jbGllbnRYO1xyXG4gIGV2ZW50LmNsaWVudFkgPSBldmVudC50b3VjaGVzWzBdLmNsaWVudFk7XHJcbiAgb25Eb2N1bWVudE1vdXNlRG93biggZXZlbnQgKTtcclxuXHJcbn1cclxuXHJcbmZ1bmN0aW9uIG9uRG9jdW1lbnRNb3VzZURvd24oIGV2ZW50ICkge1xyXG4gIGlmKGV2ZW50LndoaWNoICE9PSAxKSByZXR1cm47XHJcbiAgaWYoSU5URVJTRUNURUQpIHtcclxuICAgIEVudGl0eS5tb3ZlKElOVEVSU0VDVEVELnVzZXJEYXRhLngsIElOVEVSU0VDVEVELnVzZXJEYXRhLnkpOyAgXHJcbiAgICBjb25zb2xlLmxvZyhcIkNsaWNrZWQgXCIsSU5URVJTRUNURUQudXNlckRhdGEueCwgSU5URVJTRUNURUQudXNlckRhdGEueSk7XHJcbiAgfVxyXG5cclxufVxyXG5cclxuXHJcblxyXG5cclxuZnVuY3Rpb24gcmVuZGVyKCkge1xyXG4gIHN0YXRzLmJlZ2luKCk7XHJcbiAgdmFyIHRlbXAgPSAyO1xyXG4gIHJheWNhc3Rlci5zZXRGcm9tQ2FtZXJhKCBtb3VzZSwgY2FtZXJhICk7XHJcblxyXG4gIHZhciBpbnRlcnNlY3RzID0gcmF5Y2FzdGVyLmludGVyc2VjdE9iamVjdHMoIHNjZW5lLmNoaWxkcmVuICk7XHJcblxyXG4gIGlmICggaW50ZXJzZWN0cy5sZW5ndGggPiAwICkge1xyXG4gICAgaWYgKCBJTlRFUlNFQ1RFRCAhPSBpbnRlcnNlY3RzWyAwIF0ub2JqZWN0ICYmIGludGVyc2VjdHNbMF0ub2JqZWN0Lm1hdGVyaWFsLnR5cGUgPT0gXCJNdWx0aU1hdGVyaWFsXCIgKSB7XHJcbiAgICAgIGlmICggSU5URVJTRUNURUQgKSBJTlRFUlNFQ1RFRC5tYXRlcmlhbC5tYXRlcmlhbHNbdGVtcF0uZW1pc3NpdmUgPSBuZXcgVEhSRUUuQ29sb3IoMHgwMDAwMDApO1xyXG4gICAgICBJTlRFUlNFQ1RFRCA9IGludGVyc2VjdHNbIDAgXS5vYmplY3Q7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwiSG92ZXJpbmcgb3ZlclwiLElOVEVSU0VDVEVELnVzZXJEYXRhLngsIElOVEVSU0VDVEVELnVzZXJEYXRhLnkpO1xyXG4gICAgICBJTlRFUlNFQ1RFRC5tYXRlcmlhbC5tYXRlcmlhbHNbdGVtcF0uZW1pc3NpdmUgPSBuZXcgVEhSRUUuQ29sb3IoMHhmZjAwMDApXHJcbiAgICB9XHJcblxyXG4gIH0gZWxzZSB7XHJcbiAgICBpZihJTlRFUlNFQ1RFRCkge1xyXG4gICAgICBJTlRFUlNFQ1RFRC5tYXRlcmlhbC5tYXRlcmlhbHNbdGVtcF0uZW1pc3NpdmUgPSBuZXcgVEhSRUUuQ29sb3IoMHgwMDAwMDApXHJcblxyXG4gICAgICBJTlRFUlNFQ1RFRCA9IG51bGw7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHZhciBkZWx0YSA9IGNsb2NrLmdldERlbHRhKCk7IFxyXG5cclxuICBFbnRpdHkuc3ByaXRlLnVwZGF0ZSgxMDAwICogZGVsdGEpO1xyXG4gIGlmKEVudGl0eS5pbk1vdGlvbikge1xyXG4gICAgRW50aXR5LmRyYXdMb29wKCk7XHJcbiAgfVxyXG4gIHJlbmRlcmVyLnJlbmRlciggc2NlbmUsIGNhbWVyYSApO1xyXG4gIHN0YXRzLmVuZCgpO1xyXG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXIpO1xyXG59Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9