import * as THREE from './three.module.js';

import { GUI } from './libs/dat.gui.module.js';

import { OrbitControls } from './OrbitControls.js';
import { GLTFLoader } from './GLTFLoader.js';
// import { DRACOLoader } from './DRACOLoader.js';
// import { AmbientLight } from 'three';

// CREATE _RLC OBJECT IF DOESN'T EXIST
if (!window._rlc) {
  window._rlc = {}
}

const container = document.getElementById('rlc-sceneContainer');
const modelPath = container.getAttribute('data-modelfolder');

let gui;

const poloColor = [ 'yellow', 'white', 'red', 'softyellow', 'neongreen', 'green', 'blue', 'custom' ];
poloColor[0] = modelPath + 'polo-shirt-yellow.gltf';
poloColor[1] = modelPath + 'polo-shirt-white.gltf';
poloColor[2] = modelPath + 'polo-shirt-red.gltf';
poloColor[3] = modelPath + 'polo-shirt-softyellow.gltf';
poloColor[4] = modelPath + 'polo-shirt-neongreen.gltf';
poloColor[5] = modelPath + 'polo-shirt-green.gltf';
poloColor[6] = modelPath + 'polo-shirt-blue.gltf';
poloColor[7] = modelPath + 'polo-shirt-custom.gltf';

THREE.Cache.enabled = true;

const state = { variant: 'yellow' };

let colorIndex = 0;
let oldIndex = 0;
let newIndex = 0;
let currentColor = poloColor[newIndex];
let previousColor = poloColor[oldIndex];
let colorChanged = false;
let modelLoaded = false;

if ( colorIndex <= 0 ) {
  previousColor = poloColor[0];
}

const startRotate = false;
const stopRotate = true;

// let mixer, actions, activeAction, previousAction;
// let background, model, obj, gltfScene, test;
let gltfScene, gltfScene2, mixer, model, newModel;

const manager = new THREE.LoadingManager();

const gltfLoader = new GLTFLoader( manager );
let requestID, animationID;

const now = Date.now();
const last = now;
const time = 0.001;
let rotating = false;

const scene = new THREE.Scene();
const clock = new THREE.Clock();
const loader = new GLTFLoader();
// const dracoLoader = new DRACOLoader();

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
// renderer.gammaOutput = true;
renderer.gammaFactor = 2.2;
renderer.physicallyCorrectLights = true;
// texture.encoding = THREE.sRGBEncoding;

// Set the rendering atmosphere color
// this.renderer.setClearColor(new THREE.Color(0xffffff))

// Setup Controls
const orbitControls = new OrbitControls(
  camera,
  renderer.domElement
); // orbit controls

const controls = orbitControls;
controls.enableDamping = true;
controls.enabled = true; // disables user controls of the scene

// Animation
// const animationMixer = new THREE.AnimationMixer(scene);

renderer.setSize( 500, 500 );

document
  .getElementById('rlc-sceneContainer')
  .appendChild(renderer.domElement);
// window.addEventListener('resize', () => onWindowResize())
camera.position.set( 0, 0.2, 1.1 );


const getLigt = function() {
  let hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444, 1.75 );
  hemiLight.position.set( 0, 300, 0 );
  scene.add( hemiLight );

  let dirLight = new THREE.DirectionalLight( 0xffffff, 0.75 );
  // dirLight.position.set( 75, 300, -75 );
  dirLight.position.set( 0, 150, 300 );
  dirLight.target.position.set( 0, 0, 0 );
  scene.add( dirLight );
}; // getLight

function selectVariant( scene, parser, extension, variantName ) {
  const variantIndex = extension.variants.findIndex( ( v ) => v.name.includes( variantName ) );

  scene.traverse( async ( object ) => {
    if ( ! object.isMesh || ! object.userData.gltfExtensions ) return;
    const meshVariantDef = object.userData.gltfExtensions[ 'KHR_materials_variants' ];

    if ( ! meshVariantDef ) return;
    if ( ! object.userData.originalMaterial ) {
      object.userData.originalMaterial = object.material;
    }

    const mapping = meshVariantDef.mappings
      .find( ( mapping ) => mapping.variants.includes( variantIndex ) );

    if ( mapping ) {
      object.material = await parser.getDependency( 'material', mapping.material );
      parser.assignFinalMaterial(object);
    } else {
      object.material = object.userData.originalMaterial;
    }

    render();
  } );
} // select Variant

const getGLTF = function() {
  const newName = 'polo-shirt';
  // dracoLoader.setDecoderPath( './libs/' );
  // gltfLoader.setDRACOLoader( dracoLoader );

  gltfLoader.load( 
    currentColor,
    function ( gltf )  {
console.log(gltf, 'glTF model info');
      model = gltf.scene;
      // obj.matrixAutoUpdate  = false;

      model.name = 'poloScene';
      model.position.set( 0, 0, 0 );
      model.traverse(obj => {
        obj.castShadow = true;
        obj.receiveShadow = true;
        obj.transparent = true;
        obj.opacity = 1;
      });

      scene.add( model );

      // GUI
      gui = new GUI();

      const parser = gltf.parser;
      const variantsExtension = gltf.userData.gltfExtensions[ 'KHR_materials_variants' ];
      const variants = variantsExtension.variants.map( ( variant ) => variant.name );
      const variantsCtrl = gui.add( state, 'variant', variants ).name( 'Variant' );
      selectVariant( scene, parser, variantsExtension, state.variant );
      variantsCtrl.onChange( ( value ) => selectVariant( scene, parser, variantsExtension, value ) );
      // mixer = new THREE.AnimationMixer( model );
      // mixer.clipAction( gltf.animations[ 0 ] ).play();
      // mixer.LoopRepeat;

      manager.onLoad = function () {
        modelLoaded = true;
        const modelReady = new CustomEvent('modelready', {
          detail: {},
          bubbles: true,
          cancelable: true,
          composed: false
        });
        container.classList.add("rlc-isready");
        container.dispatchEvent(modelReady);
console.log( 'Loading complete!');
      }; // mananger.onload
    } // gltf
  )
}; // getGLTF

const animate = function() {
  if ( model ) {
    model.rotation.y -= 0.01;
  }
  requestID = requestAnimationFrame( animate );

  // let delta = clock.getDelta();
  // if ( mixer ) mixer.update( delta );
  // const delta = clock.getDelta();
  // mixer.update( delta );
  
  controls.update();

  renderer.render(scene, camera);
}; // animate

const render = function() {
  // animationMixer.update(clock.getDelta());
  renderer.render(scene, camera);
  orbitControls.update();
  
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  window.requestAnimationFrame(() => render());
}; // render

const modelChanged = function( newIndex, previousColor, currentColor ) {
  // let newColor = modelContainer.getAttribute('data-filepath');

  let oldColor = previousColor;
  let newColor = currentColor;
  
  function oldModelFadeOut() {
    let oldTextures = "";
    const oldObject = model.children[2];
  // console.log('vis before:', oldObject.visible);
  // let tl = gsap.timeline({onComplete: visiblityNope()});

  for ( let i=0; i<18; i++ ){
    oldObject.children[i].material.transparent = true;
    oldObject.children[i].material.opacity = 1;
    // newTextures.castShadow = true;

    gsap.to(
      oldObject.children[i].material,
      { duration: 1.7,
        ease: "sine.in",
        opacity: 0,
        onComplete: visiblityNope() 
        // visible: false
      }
    );

    function visiblityNope() {
      // console.log('bye');
      // oldObject.children[i].material.visible = false;

      setTimeout(function(){ 
        // console.log('bye');
        oldObject.children[i].material.visible = false;
      }, 1700);
    }; // visibility nope

  }; 

    // gsap.to(
    //   oldTextures.material,
    //   { duration: 2.5,
    //     ease: "power2.inOut",
    //     opacity: 0 }
    // );
    // gsap.to(
    //   model.rotation,
    //   { duration: 3,
    //   ease: "power2.inOut",
    //   y: -6.3 }
    // );
      
// console.log('vis after:', oldObject.visible);    
  }; // old model fade out

  function newModelFadeIn() {
    const newLoader = new GLTFLoader( manager );
    // dracoLoader.setDecoderPath( './src/libs/' );
    // newLoader.setDRACOLoader( dracoLoader );
    var tl = gsap.timeline({repeat: 2, repeatDelay: 1});
    

    newLoader.load(
      newColor,
      function ( gltf ) {
        newModel = gltf.scene;
        gltf.asset; // Object
        let newTextures = model.children[2];

        newModel.traverse(obj => {
          obj.castShadow = true;
          obj.receiveShadow = true;
          // if (obj2.name !== '') {
          //   console.log('Here is the name:' + obj2.name)
          // }
          obj.transparent = true;
          obj.opacity = 1;
        }); // traverse
  
        for ( let i=0; i<18; i++ ){
          newTextures.children[i].material.transparent = true;
          newTextures.children[i].material.opacity = 0;
          // newTextures.castShadow = true;

          gsap.to(
            newTextures.children[i].material,
            { duration: 1,
              ease: "power3.in",
              opacity: 1 }
          );  
        }; 
        
        scene.add( newModel );
console.log(gltf, 'new gltf model' );
      }
    );


    // gsap.to(
    //   newTextures.material,
    //   { duration: 3.5,
    //     ease: "power2.inOut",
    //     opacity: 1 }
    // );
    // gsap.to(
    //   newModel.rotation,
    //   { duration: 2.5,
    //   ease: "power2.inOut",
    //   y: -6.3 }
    // );
  }; // new model fade in

  oldModelFadeOut();
  newModelFadeIn();
  oldIndex = newIndex;
  colorChanged = false;
}; // model changed


const rotateIt = function() {
  // mixer.timeScale = 1;
  // mixer.LoopRepeat;
  if (model) {
    model.rotation.y -= 0.01;
  }
  requestAnimationFrame(animate);

  if ( requestID ) {
    cancelAnimationFrame( requestID );
  }
  
  renderer.render(scene, camera);
}; // rotateIt

const pauseIt = function() {
  // mixer.timeScale = 0;
  // if ( model.rotation.y !== 0 ) {
  //   model.rotation.y = 0;
  // }
  cancelAnimationFrame( requestID );
  // renderer.render(scene, camera);
}; // pauseIt

const resizeRendererToDisplaySize = function(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}; // resizeRendererToDisplaySize

const onWindowResize = function() {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
console.log(container.clientWidth + ' ' + container.clientHeight);
}; // onWindowResize

// EXPOSE poloShirt Object
window._rlc.poloShirt = {
  rotateIt: rotateIt,
  pauseIt: pauseIt,
  changeModel: function ( newIndex ) {
// console.log('old i =', oldIndex);
// console.log('new i =', newIndex);

      let previousColor = poloColor[ oldIndex ];
      let currentColor = poloColor[ newIndex ];
      modelChanged(newIndex, previousColor, currentColor);
// console.log('old i 2 =', oldIndex);
// console.log('new i 2 =', newIndex);

  },
  init: function () {
    // initialize();
    getLigt();
    getGLTF();
    render();
  }
} // window._rlc.poloShirt

window._rlc.poloShirt.init();
