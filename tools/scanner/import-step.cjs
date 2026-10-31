const fs = require('node:fs');
const path = require('node:path');
const createOCCT = require('occt-import-js');

async function main() {
  const input = process.argv[2];
  if (!input) throw new Error('Pass the assembled STEP file path.');
  const destination = path.resolve(process.argv[3] || '.cache/scanner');
  fs.mkdirSync(destination, { recursive: true });
  console.log('Reading the STEP assembly...');
  const occt = await createOCCT();
  const result = occt.ReadStepFile(fs.readFileSync(input), {
    linearUnit: 'millimeter',
    linearDeflectionType: 'absolute_value',
    linearDeflection: 0.15,
    angularDeflection: 0.15,
  });
  if (!result.success) throw new Error('STEP import failed.');
  let triangles = 0;
  const bounds = [[Infinity, -Infinity], [Infinity, -Infinity], [Infinity, -Infinity]];
  for (const mesh of result.meshes) {
    triangles += mesh.index.array.length / 3;
    mesh.attributes.position.array.forEach((value, index) => {
      const axis = index % 3;
      bounds[axis][0] = Math.min(bounds[axis][0], value);
      bounds[axis][1] = Math.max(bounds[axis][1], value);
    });
  }
  fs.writeFileSync(path.join(destination, 'assembly.json'), JSON.stringify(result));
  const outline = node => ({ name: node.name, meshes: node.meshes.length, children: node.children.map(outline) });
  fs.writeFileSync(path.join(destination, 'assembly-tree.json'), JSON.stringify(outline(result.root), null, 2));
  console.log(JSON.stringify({ meshes: result.meshes.length, triangles, bounds, root: outline(result.root).children.map(node => ({name:node.name, meshes:node.meshes, children:node.children.length})) }));
}
main().catch(error => { console.error(error); process.exit(1); });
