var fps = 0;

window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame || 
    window.webkitRequestAnimationFrame   || 
    window.mozRequestAnimationFrame      || 
    window.oRequestAnimationFrame        || 
    window.msRequestAnimationFrame       || 
    function(callback, element){
        window.setTimeout(function(){
           
            callback(+new Date);
        }, 1000 / 60);
    };
})();

var logBox = document.getElementById('log');
var tileH = 32;
var tileW = 64;
var mapX = 0;
var mapY = 250;
var clickCords = {x: 0, y:0};
var hoverCords = {x: 0, y:0};
var clickedTile = {x: false, y: false};
var hoveredTile = {x: false, y: false};
var tileOverlays = {};


var character = {
  moveDistance: 4,
  speed: 60,
  x: 7,
  y: 5,
  possibleMoves: {},
  walkPath: [],
  canMove: true,
  inMotion: false,
  drawPosition: {},
  steps: [],
  init: function() {
    this.drawPosition = tilePosition(this.x,this.y);
    this.drawPosition.drawTile = {x: this.x, y: this.y};
    this.addOverlays();
  },
  move: function(x,y) {
    if(this.x == x && this.y == y) {
      // We didn't move anywhere
      return;
    }
    this.canMove = false;
    this.inMotion = true;
    this.possibleMoves[x+':'+y].shift()
    this.walkPath = this.possibleMoves[x+':'+y]; // Get rid of the first path movement, it is the current tile
    this.populateSteps();
    this.x = x;
    this.y = y;
    tileOverlays = {};
  },
  populateSteps: function() {
    this.steps = [];
    var currentPosition = this.drawPosition, nextPosition = {}
    ,deltas = {}, j, drawTile = {}, lastTile = {x: this.x, y: this.y};
    for(var i = 0; i < this.walkPath.length; i++) {
      nextPosition = tilePosition(this.walkPath[i][0],this.walkPath[i][1]);
      deltas = {x: (currentPosition.x-nextPosition.x)/this.speed, y: (currentPosition.y-nextPosition.y)/this.speed};
      if(lastTile.x < this.walkPath[i][0] || lastTile.y > this.walkPath[i][1]) {
        drawTile = {x: this.walkPath[i][0], y: this.walkPath[i][1]};
      } else {
        drawTile = {x: lastTile.x, y: lastTile.y};
      }
      for(j = 0; j < this.speed; j++) {
        currentPosition.x -= deltas.x;
        currentPosition.y -= deltas.y
        this.steps.push({x:currentPosition.x, y: currentPosition.y, drawTile: drawTile});
      }
      lastTile = {x: this.walkPath[i][0], y: this.walkPath[i][1]};
    }
  },
  moveLoop: function() {
    if(this.inMotion && this.steps.length == 0) {
      this.canMove = true;
      this.inMotion = false;
      this.addOverlays();
      this.drawPosition.drawTile.x = this.x;
      this.drawPosition.drawTile.y = this.y;
      generateDrawMap();
      return;
    }
    this.drawPosition = this.steps.shift();
    generateDrawMap();
  },
  addOverlays: function() {
    var neighbors = getNeighbors(this.x,this.y,this.moveDistance);
    tileOverlays = {};
    this.possibleMoves = {};
    var path;
    for(var i = 0; i < neighbors.length; i++) {
      if(map[neighbors[i].x][neighbors[i].y] > 0) continue; // Use the walkable flag after testing
      path = findPath(map, [this.x,this.y], [neighbors[i].x,neighbors[i].y]);
      if(path.length > this.moveDistance+1) continue;
      this.possibleMoves[neighbors[i].x+':'+neighbors[i].y] = path;
      tileOverlays[neighbors[i].x+':'+neighbors[i].y] = 'rgba(255,255,0,.8)';
    }
    //console.log(this.possibleMoves); // Doesn't like findPath(map, [5,7], [5,9]);
  }
}


var map = [
  [2,2,2,0,0,2,2,2,0,0,2,2,2,2],
  [2,1,1,0,0,1,1,1,0,0,1,1,1,2],
  [2,1,1,0,0,1,1,1,0,0,1,1,1,2],
  [2,1,1,0,0,1,1,1,0,0,1,1,1,2],
  [2,1,1,0,0,0,0,0,0,0,0,0,0,0],
  [2,1,1,0,0,0,0,0,0,0,0,0,0,0],
  [2,1,1,1,0,0,0,1,1,1,1,1,1,2],
  [2,1,1,1,1,0,0,1,1,1,1,1,1,2],
  [2,2,2,2,2,0,0,2,2,2,2,2,2,2],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
];
var drawMap = [];
var mapHeight = [
  [0,0,0,2,2,0,0,0,2,2,0,0,0,0],
  [0,1,1,2,2,1,1,1,2,2,1,1,1,0],
  [0,1,1,2,2,1,1,1,2,2,1,1,1,0],
  [0,1,1,2,2,1,1,1,2,2,1,1,1,0],
  [0,1,1,2,2,2,2,2,2,2,2,2,2,2],
  [0,1,1,2,2,2,2,2,2,2,2,2,2,2],
  [0,1,1,1,5,2,2,1,1,1,1,1,1,0],
  [0,1,1,1,1,2,2,1,1,1,1,1,1,0],
  [0,0,0,0,0,2,2,0,0,0,0,0,0,0],
];
var tiles = [
  {
    name: "dirt",
    walkable: true,
    color: "#772200"
  },
  {
    name: "grass",
    walkable: true,
    color: "#00FF00"
  },
  {
    name: "water",
    walkable: false,
    color: "#0000FF"
  },
]
var canvas = document.getElementById('main');
var ctx2 = canvas.getContext('2d');
var renderCanvas = document.createElement('canvas');
renderCanvas.width = canvas.width;
renderCanvas.height = canvas.height;
var ctx = renderCanvas.getContext('2d');
onNextRedraw = [];
function log(message) {
  logBox.innerHTML = message;
}
function init() {
  log("Intiated");
  //ctx.rotate(30 * Math.PI / 180);
  character.init();
  generateDrawMap()
  gameLoop();
  canvas.onclick = function(e){
    var r = canvas.getBoundingClientRect(),
      x = e.clientX - r.left,
      y = e.clientY - r.top;
      clickCords = {x: x, y: y};
      clickedTile = inTiles(x, y);
      if(clickedTile === false) return;
      if(isWalkable(clickedTile.x,clickedTile.y) && character.canMove && character.possibleMoves[clickedTile.x+':'+clickedTile.y]) character.move(clickedTile.x,clickedTile.y);
    log(clickedTile.x +" : "+clickedTile.y);
  }
  canvas.addEventListener('mousemove', function(e) {
    var r = canvas.getBoundingClientRect(),
      x = e.clientX - r.left,
      y = e.clientY - r.top;
      hoverCords = {x: x, y: y};
      hoveredTile = inTiles(x, y);
  }, false);
}

function drawTile(ctx, xPos, yPos, width, height, tileHeight, tile, tileIndexX, tileIndexY) {
  var yMod = tileHeight*5;

  // Height
  ctx.beginPath();
  ctx.moveTo(xPos,(yPos+height/2)-yMod);
  ctx.lineTo(xPos,((yPos+height/2)));
  ctx.lineTo(xPos+width/2,yPos+height);
  ctx.lineTo(xPos+width,(yPos+height/2));
  ctx.lineTo(xPos+width,(yPos+height/2)-yMod);
  ctx.fillStyle = "#000";
  ctx.strokeStyle = "#000";
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Tile
  ctx.beginPath();
  ctx.moveTo(xPos+width/2,yPos-yMod);
  ctx.lineTo(xPos+width,(yPos+height/2)-yMod);
  ctx.lineTo(xPos+width/2,yPos+height-yMod);
  ctx.lineTo(xPos,(yPos+height/2)-yMod);
  ctx.fillStyle = tile.color;
  ctx.strokeStyle = "#000";
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Overlay
  if(hoveredTile.x === tileIndexX && hoveredTile.y === tileIndexY ) {
    ctx.beginPath();
    ctx.moveTo(xPos+width/2,yPos-yMod);
    ctx.lineTo(xPos+width,(yPos+height/2)-yMod);
    ctx.lineTo(xPos+width/2,yPos+height-yMod);
    ctx.lineTo(xPos,(yPos+height/2)-yMod);
    ctx.fillStyle = "rgba(255,0,0,.5)";
    ctx.closePath();
    ctx.fill();
  }

  if(tileOverlays[tileIndexX+':'+tileIndexY]) {
    ctx.beginPath();
    ctx.moveTo(xPos+width/2,yPos-yMod);
    ctx.lineTo(xPos+width,(yPos+height/2)-yMod);
    ctx.lineTo(xPos+width/2,yPos+height-yMod);
    ctx.lineTo(xPos,(yPos+height/2)-yMod);
    ctx.fillStyle = tileOverlays[tileIndexX+':'+tileIndexY];
    ctx.closePath();
    ctx.fill();
  }
  if(character.drawPosition.drawTile.x == tileIndexX && character.drawPosition.drawTile.y == tileIndexY) {
    // Draw the character
    drawCharacter(character);
  }
}

function drawCharacter(char) {
  // We need
  // (i + j) * tileH + mapX, (i - j) * tileH / 2 + mapY, tileW, tileH, mapHeight[i][j], tiles[map[i][j]], i, j)
  // xPos, yPos, width, height, tileHeight, tile, tileIndexX, tileIndexY
  var drawX = char.drawPosition.x,
  drawY = char.drawPosition.y,
  yMod = mapHeight[char.x][char.y]*5;
  ctx.beginPath();
  ctx.arc(drawX+(tileW/2), drawY+(tileH/2)-yMod, 10, 0, 2 * Math.PI, false);
  ctx.fillStyle = '#FF00FF';
  ctx.fill();
  ctx.strokeStyle = '#000000';
  ctx.stroke();
  ctx.closePath();
  if(char.inMotion) char.moveLoop();
}

function tilePosition(x,y) {
  return {
    x: (x + y) * tileH + mapX,
    y: (x - y) * tileH / 2 + mapY
  }
}

function inTile(x, y, tileX, tileY) {
  var dx = Math.abs(x - tileX),
    dy = Math.abs(y - tileY);

  if (dx / (tileW * 0.5) + dy / (tileH * 0.5) <= 1) { return true };
  return false;
}

function checkRedrawEvents() {
  if(onNextRedraw.length == 0) return;
  var l = onNextRedraw.length;
  for(var i = l-1;i>=l;i--) {
    onNextRedraw[i].call();
    delete onNextRedraw[i];
  }
}

function inTiles(x, y) {
  var yMod;
  var prevHeight = 0;
  var tile = false;
  for (var i = 0; i < map.length; i++) {
      for (var j = map[i].length-1; j > -1; j--) {
        if(map[i][j] < 0) continue;
        //drawTile(ctx, (i + j) * tileH + mapX, (i - j) * tileH / 2 + mapY, tileW, tileH, mapHeight[i][j], tiles[map[i][j]], i, j);
        yMod = mapHeight[i][j]*5;
        //drawTile(ctx, xPos, yPos, width, height, tileHeight, tile, tileIndexX, tileIndexY)
        if(prevHeight <= mapHeight[i][j] && inTile(x, y, ((i + j) * tileH + mapX)+tileW/2, (((i - j) * tileH / 2 + mapY)+tileH/2)-yMod)) {
          prevHeight = mapHeight[i][j];
          tile = {x: i, y: j};
        }
      }
  }
  if(tile) return tile;
  return false;
}

function isWalkable(x,y) {
  return tiles[map[x][y]].walkable;
}

function getNeighbors(x,y,radius) {
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
    cols = map.length,
    rows = map[0].length, 
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

// This was to draw an outline
/*function drawHoverOverlay() {
  draw();
  var xPos = (hoveredTile.x + hoveredTile.y) * tileH + mapX;
  var yPos = (hoveredTile.x - hoveredTile.y) * tileH / 2 + mapY;
  var yMod = mapHeight[hoveredTile.x][hoveredTile.y]*5
  var height = tileH;
  var width = tileW;
  ctx.beginPath();
  ctx.moveTo(xPos+width/2,yPos-yMod);
  ctx.lineTo(xPos+width,(yPos+height/2)-yMod);
  ctx.lineTo(xPos+width/2,yPos+height-yMod);
  ctx.lineTo(xPos,(yPos+height/2)-yMod);
  ctx.strokeStyle = "#F00";
  ctx.closePath();
  ctx.stroke();
}*/

function draw() {
  //ctx.clearRect(0, 0, 500, 500);
  /*var mapYLength = map[0].length;
  for(var j = mapYLength-1; j > -1; j--) {
    for(var i = 0;i < map.length; i++) {
      if(map[i][j] < 0) continue;
        if(map[i][j] < 0) continue;
        drawTile(ctx, (i + j) * tileH + mapX, (i - j) * tileH / 2 + mapY, tileW, tileH, mapHeight[i][j], tiles[map[i][j]], i, j);
    }
  }*/

  for(var i = 0; i< drawMap.length; i++) {
    if(drawMap[i].drawProps.type == "map") {
      drawTileNew(drawMap[i].x, drawMap[i].y, tiles[map[drawMap[i].drawProps.x][drawMap[i].drawProps.y]], drawMap[i].drawProps.x, drawMap[i].drawProps.y);
    } else if(drawMap[i].drawProps.type == "character") {
      drawCharacter(character);
    }
  }

  /*for (var i = 0; i < map.length; i++) {
      for (var j = map[i].length-1; j > -1; j--) {
        if(map[i][j] < 0) continue;
        drawTile(ctx, (i + j) * tileH + mapX, (i - j) * tileH / 2 + mapY, tileW, tileH, mapHeight[i][j], tiles[map[i][j]], i, j);
      }
  }*/
  //checkRedrawEvents();
}

function drawTileNew(xPos, yPos, tile, tileIndexX, tileIndexY) {
  var yMod = mapHeight[tileIndexX][tileIndexY]*5;

  // Height
  ctx.beginPath();
  ctx.moveTo(xPos,(yPos+tileH/2)-yMod);
  ctx.lineTo(xPos,((yPos+tileH/2)));
  ctx.lineTo(xPos+tileW/2,yPos+tileH);
  ctx.lineTo(xPos+tileW,(yPos+tileH/2));
  ctx.lineTo(xPos+tileW,(yPos+tileH/2)-yMod);
  ctx.fillStyle = "#000";
  ctx.strokeStyle = "#000";
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Tile
  ctx.beginPath();
  ctx.moveTo(xPos+tileW/2,yPos-yMod);
  ctx.lineTo(xPos+tileW,(yPos+tileH/2)-yMod);
  ctx.lineTo(xPos+tileW/2,yPos+tileH-yMod);
  ctx.lineTo(xPos,(yPos+tileH/2)-yMod);
  ctx.fillStyle = tile.color;
  ctx.strokeStyle = "#000";
  ctx.closePath();
  ctx.fill();
  ctx.stroke();


  // Overlay
  /*if(hoveredTile.x === tileIndexX && hoveredTile.y === tileIndexY ) {
    ctx.beginPath();
    ctx.moveTo(xPos+width/2,yPos-yMod);
    ctx.lineTo(xPos+width,(yPos+height/2)-yMod);
    ctx.lineTo(xPos+width/2,yPos+height-yMod);
    ctx.lineTo(xPos,(yPos+height/2)-yMod);
    ctx.fillStyle = "rgba(255,0,0,.5)";
    ctx.closePath();
    ctx.fill();
  }

  if(tileOverlays[tileIndexX+':'+tileIndexY]) {
    ctx.beginPath();
    ctx.moveTo(xPos+width/2,yPos-yMod);
    ctx.lineTo(xPos+width,(yPos+height/2)-yMod);
    ctx.lineTo(xPos+width/2,yPos+height-yMod);
    ctx.lineTo(xPos,(yPos+height/2)-yMod);
    ctx.fillStyle = tileOverlays[tileIndexX+':'+tileIndexY];
    ctx.closePath();
    ctx.fill();
  }
  if(character.drawPosition.drawTile.x == tileIndexX && character.drawPosition.drawTile.y == tileIndexY) {
    // Draw the character
    drawCharacter(character);
  }*/
}



var lastCalledTime;
var fps;
var lastRun;
var lastUpdate;
var game_running = true,
  show_fps     = true,
  canvasWidth        = canvas.width,
  canvasHeight       = canvas.height;

function showFPS(){
  ctx.fillStyle = "Black";
  ctx.font      = "normal 16pt Arial";

  ctx.fillText(fps + " fps", 10, 26);
}

function gameLoop() {
  if(!lastRun) {
      lastRun = lastUpdate = new Date().getTime();
      requestAnimFrame(gameLoop);
      return;
  }
  var delta = (new Date().getTime() - lastRun)/1000;
  lastRun = new Date().getTime();
  if(lastUpdate+500 < new Date().getTime()) {
    fps = Math.round(1/delta);
    lastUpdate = new Date().getTime();
  }
  //Clear screen
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  if (show_fps) showFPS();
  draw();
  ctx2.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx2.drawImage(renderCanvas, 0, 0);
  if (game_running) requestAnimFrame(gameLoop);

} 

function tileMapper(tile) {

    // New XY position simply adds Z to X and Y.
    return {
        x: tile.x,
        y: tile.y,
        z: tile.z,
        nearness: tile.x-tile.y-(tile.z)-tile.priority,
        drawProps: tile.drawProps,
        // Compute horizontal distance from origin.
        h: (tile.x - tile.y) * Math.cos(Math.PI/6),

        // Compute vertical distance from origin.
        v: (tile.x + tile.y) / 2
    };
}

function generateDrawMap() {
  drawMap = []; // Clear it
  var drawProps;
  var mapYLength = map[0].length;
  for(var j = mapYLength-1; j > -1; j--) {
    for(var i = 0;i < map.length; i++) {
      if(map[i][j] < 0) continue;
        if(map[i][j] < 0) continue;
        drawProps = {type: "map", x: i, y:j};
        drawMap.push(tileMapper({x: (i + j) * tileH + mapX, y: (i - j) * tileH / 2 + mapY, z: mapHeight[i][j], drawProps: drawProps, priority: 0}));
        if(i == 6 && j == 5) console.log(6,5,drawMap[drawMap.length-1]);
        if(i == 5 && j == 5) console.log(5,5,drawMap[drawMap.length-1]);
        if(i == 5 && j == 4) console.log(5,4,drawMap[drawMap.length-1]);
        if(i == 6 && j == 4) console.log(6,4,drawMap[drawMap.length-1]);
    }
  }
  // drawMap done, add characters
  drawProps = {type: "character", x: character.drawPosition.drawTile.x, y: character.drawPosition.drawTile.y}; // Add props later
  drawMap.push(tileMapper({x: character.drawPosition.x, y: character.drawPosition.y, z: mapHeight[character.drawPosition.drawTile.x][character.drawPosition.drawTile.y], drawProps: drawProps, priority: .1}));
  console.log(drawMap[drawMap.length-1]);
  drawMap.sort(sortDrawMap);
}

function sortDrawMap(box1, box2) {
      // test for intersection x-axis
    // (lower x value is in front)
    /*if(box1.zmax - box2.zmax != 0) return box1.zmax - box2.zmax;
    if(box1.drawProps.x - box2.drawProps.x != 0) return box1.drawProps.x - box2.drawProps.x;
    return box2.drawProps.y - box1.drawProps.y;*/
    //if(box2.nearness-box1.nearness == 0) return box2.z-box1.z
    return box2.nearness-box1.nearness;
    //return;
    if (box1.xmin >= box2.xmax) { return -1; }
    else if (box2.xmin >= box1.xmax) { return 1; }

    // test for intersection y-axis
    // (lower y value is in front)
    if (box1.ymin >= box2.ymax) { return -1; }
    else if (box2.ymin >= box1.ymax) { return 1; }

    // test for intersection z-axis
    // (higher z value is in front)
    if (box1.zmin >= box2.zmax) { return 1; }
    else if (box2.zmin >= box1.zmax) { return -1; }

}
init();