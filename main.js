import * as THREE from '/libs/three.module.js';
import { OrbitControls } from './libs/OrbitControls.js';
import { GLTFLoader } from './libs/GLTFLoader.js';

let gltfScene;

const manager = new THREE.LoadingManager();
let container = document.getElementById('sceneContainer');

const gltfLoader = new GLTFLoader();

const scene = new THREE.Scene();
const clock = new THREE.Clock();
const loader = new GLTFLoader();
const fov = 50;
const aspect = 1 / 1;
const near = 0.1;
const far = 1000;


// Create a camera
const camera = new THREE.PerspectiveCamera(
  fov,
  aspect,
  near,
  far
)

// Create a Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;

// Set the rendering atmosphere color
// renderer.setClearColor(new THREE.Color(0x123456))

// Setup Controls
const orbitControls = new OrbitControls(
  camera,
  renderer.domElement
); // orbit controls

const controls = orbitControls;
controls.enabled = true; // enables user controls of the scene

// Animation
const animationMixer = new THREE.AnimationMixer(scene);

document
  .getElementById('sceneContainer')
  .appendChild(renderer.domElement);
window.addEventListener('resize', () => onWindowResize())
camera.position.set( 0, 1, 2.5 );

function addLigt() {
  const ambientLight = new THREE.AmbientLight( 0x404040, 5 ); // soft white light

  scene.add( ambientLight );

}; // addLigt

function getGLTF () {
  gltfLoader.load( 
    './model/cuttlefish.glb',
    gltf => {
console.log(gltf, 'glTF model info');
      gltfScene = gltf.scene;

      gltf.scene.name = 'cuttlefish';
      gltf.scene.position.set( 0, 0, 0 );

      gltf.scene.traverse(obj => {
        obj.castShadow = true;
        obj.receiveShadow = true;
      });

      // gltfScene.rotation.z = 0.225;
      scene.add( gltfScene );
    } // gltf
  )
}; // getGLTF

function animate() {
  if ( gltfScene ) {
    gltfScene.rotation.y -= 0.005;
  }

  requestAnimationFrame(animate);

  renderer.render(scene, camera);
}; // animate

function render () {
// function render(time) {

  // texture.encoding = THREE.sRGBEncoding;
  animationMixer.update(clock.getDelta());
  renderer.render(scene, camera);
  orbitControls.update();
  
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
  
  window.requestAnimationFrame(() => render());
}; // render

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}; // resizeRendererToDisplaySize

function onWindowResize () {
  camera.aspect = container.clientWidth / container.clientHeight
  camera.updateProjectionMatrix()

  renderer.setSize(container.clientWidth, container.clientHeight)
}; // onWindowResize

function switchToBlue () {
  let mesh = gltfScene.children[2].children[0].material;
  mesh.color.setHex( 0xFAFF2E );
  container.style.backgroundColor = "#f3fe61";
// console.log('made it blue');
}; // switch to blue

function switchToGreen () {
  let mesh = gltfScene.children[2].children[0].material;
  mesh.color.setHex( 0xFF8057 );
  container.style.backgroundColor = "#ee8661";
// console.log('made it green');
}; // switch to green

addLigt();
getGLTF();
animate();
render();

document.getElementById( 'blue' ).addEventListener( 'click', switchToBlue );

document.getElementById( 'green' ).addEventListener( 'click', switchToGreen );
