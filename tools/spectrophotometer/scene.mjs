import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { MeshoptSimplifier } from '/meshoptimizer/meshopt_simplifier.js';
import { components, instrumentIds } from '/components.mjs';

const [source, materialSource] = await Promise.all([fetch('/assembly.obj').then(r => r.text()), fetch('/assembly.mtl').then(r => r.text())]);
const materials = new MTLLoader().parse(materialSource, '/');
const assembly = new OBJLoader().setMaterials(materials).parse(source);
const model = new THREE.Group(); model.rotation.x = -Math.PI / 2; model.add(assembly);
const themed = new Map();
assembly.children.forEach((object, i) => {
  object.userData.sourceId = i;
  object.userData.label = `Part ${i + 1}`;
  const convert = original => {
    if (themed.has(original.name)) return themed.get(original.name);
    const color = original.color.clone();
    if (color.r > .75 && color.g > .75 && color.b > .75 || /MATERIAL_NOT_DEFINED/.test(original.name)) color.set('#b6c3bc');
    const glass = /^(Glass|Clear)/.test(original.name);
    if (glass) color.set('#b3cfd0');
    const material = new THREE.MeshStandardMaterial({
      name: original.name, color, roughness: glass ? .18 : .48,
      metalness: /Steel|Stainless/.test(original.name) ? .65 : .05,
      transparent: glass, opacity: glass ? .3 : 1, depthWrite: !glass, side: THREE.DoubleSide,
    });
    themed.set(original.name, material); return material;
  };
  object.material = Array.isArray(object.material) ? object.material.map(convert) : convert(object.material);
});
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(1600, 1266);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.2;
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene(); scene.add(model);
const pmrem = new THREE.PMREMGenerator(renderer), room = new RoomEnvironment();
scene.environment = pmrem.fromScene(room, .04).texture;
room.dispose(); pmrem.dispose(); scene.environmentIntensity = .7;
scene.add(new THREE.HemisphereLight('#e6f0eb', '#344741', 1));
const key = new THREE.DirectionalLight('#edf6f0', 3.4); key.position.set(-280, 430, 300); scene.add(key);
const rim = new THREE.DirectionalLight('#a9d3c9', 2.2); rim.position.set(250, 250, -180); scene.add(rim);
const camera = new THREE.PerspectiveCamera(38, 1600 / 1266, .1, 10000);

function render({ width = 1600, height = 1266, ids = null, angle = [1.1, .7, -1.4] } = {}) {
  assembly.children.forEach((object, id) => object.visible = !ids || ids.includes(id));
  renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix();
  const bounds = new THREE.Box3();
  assembly.children.filter(o => o.visible).forEach(o => bounds.expandByObject(o));
  const center = bounds.getCenter(new THREE.Vector3());
  const direction = new THREE.Vector3(...angle).normalize();
  const right = new THREE.Vector3().crossVectors(camera.up, direction).normalize();
  const up = new THREE.Vector3().crossVectors(direction, right).normalize();
  const tangent = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  let distance = 0;
  for (let i = 0; i < 8; i++) {
    const corner = new THREE.Vector3(i & 1 ? bounds.max.x : bounds.min.x, i & 2 ? bounds.max.y : bounds.min.y, i & 4 ? bounds.max.z : bounds.min.z).sub(center);
    distance = Math.max(distance, Math.abs(corner.dot(right)) / (tangent * camera.aspect) + corner.dot(direction), Math.abs(corner.dot(up)) / tangent + corner.dot(direction));
  }
  camera.position.copy(center).addScaledVector(direction, distance * 1.05); camera.lookAt(center);
  renderer.render(scene, camera);
  return renderer.domElement.toDataURL('image/png');
}

async function exportModel() {
  await MeshoptSimplifier.ready;
  const output = new THREE.Group(); output.rotation.x = -Math.PI / 2;
  const groups = components.map((component, i) => {
    const group = new THREE.Group(); group.name = component.name;
    group.userData.label = component.name; group.userData.component = i; group.userData.explode = component.offset;
    output.add(group); return group;
  });
  for (const id of instrumentIds) {
    const object = assembly.children[id].clone();
    let geometry = mergeVertices(object.geometry, 1e-5);
    if (geometry.index.count > 60000) {
      const indices = new Uint32Array(geometry.index.array);
      const [reduced] = MeshoptSimplifier.simplifyWithAttributes(indices, geometry.attributes.position.array, 3, geometry.attributes.normal.array, 3, [.3, .3, .3], null, Math.floor(indices.length * .2 / 3) * 3, .001, ['Permissive']);
      const [remap, count] = MeshoptSimplifier.compactMesh(reduced);
      const replacement = new THREE.BufferGeometry();
      for (const [name, attr] of Object.entries(geometry.attributes)) {
        const data = new Float32Array(count * attr.itemSize);
        for (let old = 0; old < remap.length; old++) if (remap[old] !== 0xffffffff) for (let axis = 0; axis < attr.itemSize; axis++) data[remap[old] * attr.itemSize + axis] = attr.array[old * attr.itemSize + axis];
        replacement.setAttribute(name, new THREE.BufferAttribute(data, attr.itemSize));
      }
      replacement.setIndex(new THREE.BufferAttribute(reduced, 1));
      // The dense generative housing uses a single material.
      if (geometry.groups.length > 1) throw new Error('Refusing to simplify a mesh with multiple materials.');
      geometry.dispose(); geometry = replacement;
    }
    object.geometry = geometry; object.visible = true;
    delete object.userData.label;
    groups[components.findIndex(component => component.ids.includes(id))].add(object);
  }
  output.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(output), center = bounds.getCenter(new THREE.Vector3());
  output.position.set(-center.x, -bounds.min.y, -center.z).multiplyScalar(.001); output.scale.setScalar(.001);
  output.updateMatrixWorld(true);
  const data = await new GLTFExporter().parseAsync(output, { binary: true });
  return (await fetch('/save-model', { method: 'POST', body: data })).json();
}
window.studio = { render, exportModel, instrumentIds, ready: true };
render();
