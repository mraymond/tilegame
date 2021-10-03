export default {};
const width = window.innerWidth,
    height = window.innerHeight,
    aspect = width/height,
    D = 20;
export const renderer = new THREE.WebGLRenderer({ alpha: true });
export const scene = new THREE.Scene();
export const camera = new THREE.OrthographicCamera(-D*aspect, D*aspect, D, -D, .1, 1000);
export const controls = new THREE.OrbitControls( camera, renderer.domElement );