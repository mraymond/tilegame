import * as THREE from 'three';
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

export default TextureLoader;