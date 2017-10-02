var loader = new THREE.TextureLoader();
THREE.Cache.enabled = true;

var TextureLoader = (function () {
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

var tileMaterials = {};
// URL of texture

tileMaterials.grass = function() {
    return new THREE.MultiMaterial([
     new THREE.MeshBasicMaterial( { color: 0x333300 }), // Right
     new THREE.MeshBasicMaterial( { color: 0x333300 }), // back left
     new THREE.MeshLambertMaterial({map: TextureLoader.getInstance().load("grass.jpg")}), // Top
     new THREE.MeshBasicMaterial( { color: 0x333300 }), // Bottom
     new THREE.MeshBasicMaterial( { color: 0x333300 }), // Left
     new THREE.MeshBasicMaterial( { color: 0x333300 }) // Back Right
  ]);
}

tileMaterials.water = function() {
    return new THREE.MultiMaterial([
     new THREE.MeshBasicMaterial( { color: 0x005577 }), // Right
     new THREE.MeshBasicMaterial( { color: 0x005577 }), // back left
     new THREE.MeshLambertMaterial({map: TextureLoader.getInstance().load("water.jpg")}), // Top
     new THREE.MeshBasicMaterial( { color: 0x005577 }), // Bottom
     new THREE.MeshBasicMaterial( { color: 0x005577 }), // Left
     new THREE.MeshBasicMaterial( { color: 0x005577 }) // Back Right
  ]);
}