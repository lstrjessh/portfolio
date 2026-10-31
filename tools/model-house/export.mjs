import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import * as THREE from '../scanner/node_modules/three/build/three.module.js';
import { GLTFExporter } from '../scanner/node_modules/three/examples/jsm/exporters/GLTFExporter.js';
import { MeshoptSimplifier } from '../scanner/node_modules/meshoptimizer/index.js';

// GLTFExporter uses FileReader for binary buffers; Node provides Blob.arrayBuffer().
globalThis.FileReader ??= class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then(data => { this.result = data; this.onloadend?.(); });
  }
};

const input = path.resolve(process.argv[2] || '.cache/model-house/assembly.json');
const result = JSON.parse(fs.readFileSync(input, 'utf8'));
const appearances = JSON.parse(fs.readFileSync(path.join(path.dirname(input), 'colors.json'), 'utf8'));
if (!result.success || !result.meshes.length) throw new Error('No imported house geometry.');
const components = [
  { name: 'Toilet', ids: [0, 1] },
  { name: 'Bathroom sink', ids: [2] },
  ...Array.from({ length: 6 }, (_, panel) => ({ name: `Solar panel ${panel + 1}`, ids: Array.from({ length: 5 }, (_, part) => 3 + panel * 5 + part), offset: [0, 0, 34] })),
  { name: 'TV cabinet', ids: [33, 34, 35, 36] },
  { name: 'Ground-floor doors', ids: [37, 38, 39] },
  { name: 'Staircase', ids: [40] },
  { name: 'Upper-floor door', ids: [41], offset: [0, 0, 16] },
  { name: 'Roof', ids: [42], offset: [0, 0, 34] },
  { name: 'Side wall', ids: [43], offset: [-16, 0, 0] },
  { name: 'Ground-floor structure', ids: [44] },
  { name: 'Upper-floor structure', ids: [45], offset: [0, 0, 16] },
];
const used = components.flatMap(component => component.ids).sort((a, b) => a - b);
if (used.length !== result.meshes.length || used.some((id, i) => id !== i)) throw new Error('Source hierarchy changed; review component assignments.');
await MeshoptSimplifier.ready;
const model = new THREE.Group(); model.name = 'Model House'; model.rotation.x = -Math.PI / 2;
let before = 0, after = 0;
const materialCache = new Map();
for (const [componentId, component] of components.entries()) {
  const group = new THREE.Group(); group.name = component.name;
  group.userData.label = component.name; group.userData.component = componentId;
  if (component.offset) group.userData.explode = component.offset;
  for (const id of component.ids) {
    const source = result.meshes[id];
    const buckets = new Map();
    source.brep_faces.forEach((face, faceId) => {
      const rgb = appearances[id].faces[faceId];
      const key = rgb.join(',');
      if (!buckets.has(key)) buckets.set(key, { rgb, indices: [] });
      const indices = buckets.get(key).indices;
      for (let index = face.first * 3; index < (face.last + 1) * 3; index++) indices.push(source.index.array[index]);
    });
    if ([...buckets.values()].reduce((sum, bucket) => sum + bucket.indices.length, 0) !== source.index.array.length) throw new Error(`Face ranges do not cover source mesh ${id}`);
    for (const { rgb, indices } of buckets.values()) {
    let geometry = new THREE.BufferGeometry();
    const compactIndices = new Uint32Array(indices);
    const [initialRemap, initialCount] = MeshoptSimplifier.compactMesh(compactIndices);
    for (const [name, attribute] of Object.entries(source.attributes)) {
      const data = new Float32Array(initialCount * 3);
      for (let old = 0; old < initialRemap.length; old++) if (initialRemap[old] !== 0xffffffff) for (let axis = 0; axis < 3; axis++) data[initialRemap[old] * 3 + axis] = attribute.array[old * 3 + axis];
      geometry.setAttribute(name, new THREE.BufferAttribute(data, 3));
    }
    geometry.setIndex(new THREE.BufferAttribute(compactIndices, 1));
    if (!source.attributes.normal) geometry.computeVertexNormals();
    before += geometry.index.count / 3;
    if (geometry.index.count > 30000) {
      const indices = new Uint32Array(geometry.index.array);
      const [reduced] = MeshoptSimplifier.simplifyWithAttributes(indices, geometry.attributes.position.array, 3, geometry.attributes.normal.array, 3, [.3, .3, .3], null, Math.floor(indices.length * .35 / 3) * 3, .0008, ['Permissive']);
      const [remap, count] = MeshoptSimplifier.compactMesh(reduced);
      const replacement = new THREE.BufferGeometry();
      for (const [name, attribute] of Object.entries(geometry.attributes)) {
        const data = new Float32Array(count * attribute.itemSize);
        for (let old = 0; old < remap.length; old++) if (remap[old] !== 0xffffffff) for (let axis = 0; axis < attribute.itemSize; axis++) data[remap[old] * attribute.itemSize + axis] = attribute.array[old * attribute.itemSize + axis];
        replacement.setAttribute(name, new THREE.BufferAttribute(data, attribute.itemSize));
      }
      replacement.setIndex(new THREE.BufferAttribute(reduced, 1)); geometry.dispose(); geometry = replacement;
    }
    after += geometry.index.count / 3;
    const solar = component.name.startsWith('Solar panel');
    const cellSurface = solar && (id - 3) % 5 === 4 && rgb.every((value, axis) => value === appearances[id].body[axis]);
    const glass = solar && !cellSurface && rgb[0] > .7 && rgb[0] < .95 && rgb[1] > .7 && rgb[2] > .8;
    const key = `${rgb.join(',')}:${cellSurface ? 'solar-cell' : glass ? 'solar-glass' : solar ? 'solar' : 'solid'}`;
    const color = cellSurface ? new THREE.Color('#20334a') : new THREE.Color().setRGB(...rgb, THREE.SRGBColorSpace);
    if (!materialCache.has(key)) materialCache.set(key, new THREE.MeshStandardMaterial({ color, roughness: glass ? .12 : cellSurface ? .4 : .65, metalness: solar && !glass ? .15 : 0, side: THREE.DoubleSide, transparent: glass, opacity: glass ? .14 : 1, depthWrite: !glass }));
    const mesh = new THREE.Mesh(geometry, materialCache.get(key));
    mesh.name = component.name; mesh.userData.sourceId = id; group.add(mesh);
    }
  }
  model.add(group);
}
model.updateMatrixWorld(true);
const bounds = new THREE.Box3().setFromObject(model), center = bounds.getCenter(new THREE.Vector3());
model.position.set(-center.x, -bounds.min.y, -center.z).multiplyScalar(.001);
model.scale.setScalar(.001); model.updateMatrixWorld(true);
const data = await new GLTFExporter().parseAsync(model, { binary: true });
const compressed = gzipSync(Buffer.from(data), { level: 9 });
const destination = path.resolve('public/model-house'); fs.mkdirSync(destination, { recursive: true });
fs.writeFileSync(path.join(destination, 'model.glb.gz'), compressed);
console.log(JSON.stringify({ components: components.length, before, after, rawBytes: data.byteLength, compressedBytes: compressed.length }));
