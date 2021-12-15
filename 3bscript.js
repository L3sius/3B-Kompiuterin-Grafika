import * as THREE from "https://unpkg.com/three@0.123.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.123.0/examples/jsm/controls/OrbitControls.js";

// Scene variables
var renderer, scene, spotLight;

// Create variables for different cameras
var currentCamera, cameraC1, cameraC2, cameraC3, cameraHelper, cameraObj;

// Position variable
var dollyPosition = -25;

// Other
var blackCastle, options, targetScale, orbitControls;

function createCameraC1() {
  cameraC1 = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  cameraC1.position.set(-100, 40, 60);
  cameraC1.lookAt(scene.position);
}
function createCameraC2() {
  cameraC2 = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    1,
    150
  );
  cameraHelper = new THREE.CameraHelper(cameraC2);
  scene.add(cameraHelper);
}
function createCameraC3() {
  cameraC3 = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  cameraC3.position.set(0, 35, 0);
}

function createChess() {
  scene = new THREE.Scene();

  // Create each camera
  createCameraC1();
  createCameraC2();
  createCameraC3();

  cameraObj = createCamera();
  // Set position same as the actual visible camera
  cameraObj.position.set(
    cameraC3.position.x,
    cameraC3.position.y,
    cameraC3.position.z
  );
  scene.add(cameraObj);

  // Create renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(0xbefefa, 1);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Create spotlight
  spotLight = new THREE.SpotLight({ intensity: 0.3 });
  spotLight.position.set(-70, 60, -80);
  spotLight.shadow.mapSize.width = 3072;
  spotLight.shadow.mapSize.height = 3072;
  spotLight.angle = Math.PI / 3.5;
  spotLight.castShadow = true;

  scene.add(spotLight);

  // Spotlight helper
  // const spotLightHelper = new THREE.SpotLightHelper(spotLight);
  // scene.add(spotLightHelper);

  const ambientLight = new THREE.AmbientLight(0x404040, 2);
  scene.add(ambientLight);

  document.body.appendChild(renderer.domElement);

  var controls = new (function () {
    this.FieldOfView = 45;
    this.cameraSelection = 1;
    this.dollyZoom = 0;
    this.dollyPyramid = false;
    this.spotlightHelper = false;

    this.asGeom = function () {
      options = {
        FieldOfView: controls.FieldOfView,
        selectCamera: controls.cameraSelection,
        dollyZoom: controls.dollyZoom,
        dollyPyramid: controls.dollyPyramid,
        spotlightHelper: controls.spotlightHelper,
      };

      cameraC1.fov = options.FieldOfView;
      cameraC1.updateProjectionMatrix();
      changeCamera(options.selectCamera);
      zoomInDoly(options.dollyZoom - 130);
      cameraHelper.visible = options.dollyPyramid;
    };
  })();

  var gui = new dat.GUI();
  var cameraC1Folder = gui.addFolder("Camera C1 Options");
  var cameraC2Folder = gui.addFolder("Camera C2 Options");
  var otherFolder = gui.addFolder("Other Options");

  gui.add(controls, "cameraSelection", 1, 3).step(1).onChange(controls.asGeom);
  cameraC1Folder
    .add(controls, "FieldOfView", 2, 90)
    .step(1)
    .onChange(controls.asGeom);

  cameraC2Folder
    .add(controls, "dollyZoom", -250, 100)
    .step(0.01)
    .onChange(controls.asGeom);
  cameraC2Folder
    .add(controls, "dollyPyramid", false, true)
    .onChange(controls.asGeom);
  addFloor();
  otherFolder
    .add(controls, "spotlightHelper", false, true)
    .onChange(controls.asGeom);
  addFloor();

  const whiteCastle = createCastlePiece(0xf3f3f3);
  whiteCastle.position.x = 0;
  whiteCastle.position.z = 35;
  whiteCastle.name = "whiteCastle";

  blackCastle = createCastlePiece(0x444444);
  blackCastle.position.x = -27.4;
  blackCastle.position.z = -27.4;
  blackCastle.name = "blackCastle";

  cameraC2.position.x = -25;
  cameraC2.position.z = -25;
  cameraC2.position.y = 13;
  target = new THREE.Vector3();
  target.set(
    blackCastle.position.x,
    blackCastle.position.y + 50,
    blackCastle.position.z
  );
  cameraC2.lookAt(target);
  cameraC2.updateMatrixWorld();

  cameraC2.far = target;

  var dir = new THREE.Vector3();
  dir.subVectors(cameraC2.position, target);
  targetScale = Math.tan((cameraC2.fov * (Math.PI / 180)) / 2) * dir.length();

  scene.add(whiteCastle);
  scene.add(blackCastle);

  orbitControls = new OrbitControls(cameraC1, renderer.domElement);

  controls.asGeom();
  create();
}

let direction;
let target;

function zoomInDoly(level) {
  cameraC2.position.x = dollyPosition - (dollyPosition * level) / 50;
  cameraC2.position.z = dollyPosition - (dollyPosition * level) / 50;

  target = new THREE.Vector3();
  target.set(
    blackCastle.position.x,
    blackCastle.position.y + 10,
    blackCastle.position.z
  );

  direction = new THREE.Vector3();
  direction.subVectors(cameraC2.position, target);

  cameraC2.near = direction.length() / 100;
  cameraC2.far = direction.length() + 100;
  cameraC2.fov =
    (180 / Math.PI) * 2 * Math.atan(targetScale / direction.length());
  cameraC2.lookAt(target);

  cameraC2.updateProjectionMatrix();
  cameraC2.updateMatrixWorld();
  cameraHelper.update();
}

function changeCamera(cameraNo) {
  if (cameraNo == 1) {
    currentCamera = cameraC1;
  } else if (cameraNo == 2) {
    currentCamera = cameraC2;
  } else if (cameraNo == 3) {
    currentCamera = cameraC3;
  } else {
    currentCamera = cameraC1;
  }
}

function createCamera() {
  const cameraElements = new THREE.Group();

  // Camera body
  const cameraBody = new THREE.Mesh(
    new THREE.BoxGeometry(7, 4, 3),
    new THREE.MeshPhongMaterial({ color: "lightgray" })
  );
  cameraElements.add(cameraBody);

  // Camera lens
  const cameraLens = new THREE.Mesh(
    new THREE.CylinderGeometry(1.5, 1, 3, 100),
    new THREE.MeshPhongMaterial({ color: "lightgray" })
  );
  cameraLens.position.x += 5;
  cameraLens.rotation.z = -Math.PI / 2;
  cameraElements.add(cameraLens);

  // Camera first bar
  const cameraBar1 = new THREE.Mesh(
    new THREE.CylinderGeometry(2, 2, 2, 100),
    new THREE.MeshPhongMaterial({ color: "lightgray" })
  );
  cameraBar1.rotation.x = -Math.PI / 2;
  cameraBar1.position.set(-2.5, 2, 0);
  cameraElements.add(cameraBar1);

  // Camera second bar
  const cameraBar2 = new THREE.Mesh(
    new THREE.CylinderGeometry(2, 2, 2, 100),
    new THREE.MeshPhongMaterial({ color: "lightgray" })
  );
  cameraBar2.rotation.x = -Math.PI / 2;
  cameraBar2.position.set(2.5, 2, 0);
  cameraElements.add(cameraBar2);

  cameraElements.rotation.y = -Math.PI / 2;
  cameraElements.position.z = -4;
  // Create orientation
  const orientedGroup = new THREE.Group();
  orientedGroup.add(cameraElements);

  return orientedGroup;
}

const height = 10;

function createCastlePiece(color) {
  var pointsX = [
    208, 208, 208, 208, 208, 208, 208, 208, 208, 250, 250, 250, 250, 205, 210,
    212, 215, 215, 215, 215, 215, 215, 215, 215, 215, 212, 205, 196, 191, 191,
    177, 169, 168, 175, 180, 180, 169, 167,
  ];
  //good
  // var pointsX = [
  //   208, 208, 208, 208, 208, 208, 208, 208, 205, 210, 212, 215, 215, 215, 215,
  //   215, 215, 215, 215, 215, 212, 205, 196, 191, 191, 177, 169, 168, 175, 180,
  //   180, 169, 167,
  // ];
  // var pointsY = [
  //   30, 32, 35, 39, 44, 48, 57, 65, 75, 80, 84, 90, 114, 115, 118, 121, 123,
  //   155, 171, 186, 202, 214, 226, 238, 250, 262, 274, 286, 292, 298, 310, 322,
  //   334, 346, 347, 351, 351, 360,
  // ];
  var pointsY = [
    50, 52, 55, 59, 64, 68, 77, 85, 95, 100, 100, 98, 96, 95, 104, 110, 134,
    135, 138, 141, 143, 165, 171, 186, 202, 214, 226, 238, 250, 262, 274, 286,
    292, 298, 310, 322, 334, 346, 347, 351, 351, 360,
  ];

  var points = [];
  var count = pointsX.length;
  for (var i = 0; i < count; i++) {
    points.push(
      new THREE.Vector3(
        25 - pointsX[i] / 10,
        pointsY[i] / -height + 12.5,
        (pointsY[30] - pointsY[i] - 150) / 10
      )
    );
  }

  var geometry = new THREE.LatheGeometry(points, 100, 0, 2 * Math.PI);

  var meshStandardMaterial = new THREE.MeshStandardMaterial();

  meshStandardMaterial.color = new THREE.Color(color);
  meshStandardMaterial.metalness = 0.5;
  meshStandardMaterial.roughness = 0.17;

  meshStandardMaterial.side = THREE.DoubleSide;
  var mesh1 = new THREE.Mesh(geometry, meshStandardMaterial);
  mesh1.castShadow = true;

  const s = 0.38;
  mesh1.scale.set(s, s, s);

  const group = new THREE.Group();

  mesh1.position.y = 13.5;

  group.add(mesh1);
  return group;
}

function addFloor() {
  var planeGeometry = new THREE.PlaneGeometry(100, 100, 20, 20);
  var phongMaterial = new THREE.MeshPhongMaterial({ shininess: 35 });
  phongMaterial.map = new THREE.TextureLoader().load(
    "./textures/chessboard.png"
  );
  phongMaterial.side = THREE.DoubleSide;

  var mesh = new THREE.Mesh(planeGeometry, phongMaterial);
  mesh.rotation.x = -0.5 * Math.PI;
  mesh.receiveShadow = true;
  mesh.position.y = 5;
  scene.add(mesh);
}

let number = 0;
let rotation, temp;
const delta = 40;

function create() {
  renderer.render(scene, currentCamera);

  if (currentCamera == cameraC1 || currentCamera == cameraC2) {
    orbitControls.update();
    if (options.dollyPyramid) {
      cameraHelper.visible = true;
    }
  } else cameraHelper.visible = false;

  if (options.spotlightHelper) {
    const spotLightHelper = new THREE.SpotLightHelper(spotLight);
    scene.add(spotLightHelper);
  }

  var whiteCastle = scene.getObjectByName("whiteCastle");

  // movement of white castle
  number += 0.016;
  whiteCastle.position.z = -35 * Math.cos(number);
  whiteCastle.position.x = 4 + Math.cos(number);

  cameraC3.lookAt(whiteCastle.position);
  cameraObj.lookAt(whiteCastle.position);

  if (Math.abs(whiteCastle.position.z) - delta < cameraC3.position.z) {
    temp = Math.sin((-Math.PI / (2 * delta)) * whiteCastle.position.z);
    rotation = (temp * Math.PI) / 2 - Math.PI / 2;
    cameraC3.rotation.z = rotation;
    cameraObj.rotation.z = rotation + Math.PI;
  }

  requestAnimationFrame(create);
}

window.onload = createChess;
