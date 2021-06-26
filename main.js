import * as THREE from '/libs/three.module.js';
import { OrbitControls } from './libs/OrbitControls.js';

const scene = new THREE.Scene();

const container = document.getElementById('sceneContainer');

// Create the camera
const fov = 50; // field of view
const aspect = container.innerWidth / container.innerHeight; // aspect ratio
const near = 0.1; // near clipping plane
const far = 1000; // far clipping plane
const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );

// Create the renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true});
renderer.shadowMap.enabled = true; // show shadows
renderer.setSize( container.innerWidth, container.innerHeight);
container.appendChild( renderer.domElement );

// Setup the camera controls
const controls = new OrbitControls( camera, renderer.domElement );
camera.position.set( 0, 10, 10 );
controls.update();

// Create the lights
const getLight = function() {
  const globalLight = new THREE.AmbientLight ( 0x404040 ); // soft white light

  scene.add( globalLight );
}; // getLight


// Animate or render the scene
const animate = function () {
  requestAnimationFrame( animate );

  // add animations here

  controls.update();

  renderer.render( scene, camera );
}; // animate

getLight();
animate();