import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { MeshoptSimplifier } from '/meshoptimizer/meshopt_simplifier.js';

const result=await (await fetch('/assembly.json')).json();
const cat=await (await fetch('/cat.json')).json();
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true,alpha:true});
renderer.setPixelRatio(1);renderer.setSize(1600,1266);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();scene.background=new THREE.Color('#0b1216');
const environment=new RoomEnvironment();
const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(environment,.04).texture;
environment.dispose();pmrem.dispose();scene.environmentIntensity=.7;
const model=new THREE.Group();model.rotation.x=-Math.PI/2;scene.add(model);
const root=result.root.children[0];
const partGroups=[];

function colorFor(mesh,groupName){
  if(/^(Base |Front Cover|Back Cover)/i.test(groupName))return {color:'#aebcaf',metalness:0,roughness:.48};
  if(/Carriage|Frame Mount/i.test(groupName))return {color:'#87aa98',metalness:.05,roughness:.4};
  if(/Turntable/i.test(groupName))return {color:'#cbd1c3',metalness:.05,roughness:.4};
  if(/cat/i.test(groupName))return {color:'#c7b18e',metalness:0,roughness:.65};
  if(/LeadScrew Nut|Coupling/i.test(groupName))return {color:/Nut/i.test(groupName)?'#ad8e53':'#9eabad',metalness:.8,roughness:.27};
  if(/LeadScrew|LM8UU|Frame Rods/i.test(groupName))return {color:'#aebfc3',metalness:.9,roughness:.21};
  const rgb=mesh.color||[.25,.3,.29];
  return {color:new THREE.Color().setRGB(...rgb,THREE.SRGBColorSpace).getHex(),metalness:/Motor/i.test(groupName)?.55:.18,roughness:/Motor/i.test(groupName)?.29:.48};
}
for(const [number,node] of root.children.entries()){
  const group=new THREE.Group();group.name=node.name;group.userData.component=number;model.add(group);
  const buckets=new Map();
  const meshes=node.meshes.map(index=>result.meshes[index]);
  if(/cat/i.test(node.name))meshes.push(cat);
  for(const mesh of meshes){
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(mesh.attributes.position.array,3));
    geometry.setIndex(mesh.index.array);
    if(mesh.attributes.normal)geometry.setAttribute('normal',new THREE.Float32BufferAttribute(mesh.attributes.normal.array,3));
    else geometry.computeVertexNormals();
    const spec=colorFor(mesh,node.name);const key=JSON.stringify(spec);
    if(!buckets.has(key))buckets.set(key,{spec,geometries:[]});
    buckets.get(key).geometries.push(geometry);
  }
  for(const {spec,geometries} of buckets.values()){
    const geometry=mergeGeometries(geometries,false);
    const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({...spec,side:THREE.DoubleSide}));
    mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);
    for(const source of geometries)source.dispose();
  }
  const box=new THREE.Box3().setFromObject(group);const center=box.getCenter(new THREE.Vector3());
  let offset=new THREE.Vector3(0,0,0);
  const name=node.name;
  if(/Cover/.test(name))offset.set(0,/Front/.test(name)?60:/Back/.test(name)?-60:0,100);
  else if(/Base Back/.test(name))offset.set(-45,-65,0);
  else if(/Base Front/.test(name))offset.set(45,65,0);
  else if(/Base Middle$/.test(name))offset.set(0,0,-35);
  else if(/Motor/.test(name))offset.set(center.x<6?-60:60,center.y>60?40:-35,15);
  else if(/Carriage|Sharp_IR|LM8UU|LeadScrew Nut/.test(name))offset.set(80,0,30);
  else if(/Frame Rods/.test(name))offset.set(-55,0,30);
  else if(/Frame Mount/.test(name))offset.set(-55,0,90);
  else if(/LeadScrew/.test(name))offset.set(0,-50,85);
  else if(/Coupling/.test(name))offset.set(0,-50,35);
  else if(/Turntable/.test(name))offset.set(0,70,75);
  else if(/cat/.test(name))offset.set(0,70,135);
  else if(/Ardi|Platine|A4988/.test(name))offset.set(-90,0,30+number*1.5);
  group.userData.explode=offset.toArray();partGroups.push(group);
}
model.updateMatrixWorld(true);
let box=new THREE.Box3().setFromObject(model);
const center=box.getCenter(new THREE.Vector3());
model.position.set(-center.x,-box.min.y,-center.z);
model.updateMatrixWorld(true);
const overall=new THREE.Box3().setFromObject(model);const size=overall.getSize(new THREE.Vector3());
const target=new THREE.Vector3(0,size.y*.46,0);
const camera=new THREE.OrthographicCamera(-250,250,200,-200,.1,5000);camera.up.set(0,1,0);
const floor=new THREE.Mesh(new THREE.PlaneGeometry(3000,3000),new THREE.ShadowMaterial({color:'#000000',opacity:.35}));
floor.rotation.x=-Math.PI/2;floor.position.y=-2;floor.receiveShadow=true;scene.add(floor);
scene.add(new THREE.HemisphereLight('#e6f0eb','#344741',1.0));
const key=new THREE.DirectionalLight('#edf6f0',3.4);key.position.set(-280,430,300);key.castShadow=true;
key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-350;key.shadow.camera.right=350;key.shadow.camera.top=400;key.shadow.camera.bottom=-300;key.shadow.camera.far=1500;key.shadow.bias=-.0002;key.shadow.normalBias=.3;key.shadow.radius=4;scene.add(key);
const rim=new THREE.DirectionalLight('#a9d3c9',2.2);rim.position.set(250,250,-180);scene.add(rim);
const fill=new THREE.DirectionalLight('#cad7ee',1.0);fill.position.set(120,120,250);scene.add(fill);

function cameraAt(yaw=0,closeup=null,aspect=1600/1266){
 let focus=target.clone(),extent=380;
 if(closeup==='carriage'){focus=new THREE.Vector3(0,96,98);extent=145;}
 if(closeup==='turntable'){focus=new THREE.Vector3(0,100,-71);extent=185;}
 if(closeup==='enclosure'){focus=new THREE.Vector3(0,24,-5);extent=245;}
 if(closeup==='exploded'){extent=590;focus.y+=35;}
 const a=.68+yaw;
 const direction=new THREE.Vector3(Math.cos(a),.55,Math.sin(a));
 camera.position.copy(focus).addScaledVector(direction,620);camera.lookAt(focus);
 camera.left=-extent*aspect/2;camera.right=extent*aspect/2;camera.top=extent/2;camera.bottom=-extent/2;camera.updateProjectionMatrix();
}
function explosion(amount){for(const group of partGroups){const e=group.userData.explode;group.position.set(e[0]*amount,e[1]*amount,e[2]*amount);}}
let lastExplode=-1,lastCloseup="unset";
function render({width=1600,height=1266,yaw=0,explode=0,closeup=null,transparent=true}={}){
  renderer.setSize(width,height,false);explosion(explode);floor.position.y=-2-explode*40;for(const part of partGroups)part.visible=!(closeup==='enclosure'&&/Cover|cat/.test(part.name));cameraAt(yaw,closeup,width/height);
  scene.background=transparent?null:new THREE.Color('#0b1216');
  renderer.setClearColor('#0b1216',transparent?0:1);
  if(explode!==lastExplode||closeup!==lastCloseup){renderer.shadowMap.needsUpdate=true;lastExplode=explode;lastCloseup=closeup;}
  renderer.render(scene,camera);
  renderer.shadowMap.autoUpdate=false;
  return renderer.domElement.toDataURL('image/png');
}
async function exportModel(){
  await optimize();
  explosion(0);for(const part of partGroups)part.visible=true;model.updateMatrixWorld(true);
  const copy=model.clone(true);copy.scale.setScalar(.001);copy.position.multiplyScalar(.001);copy.updateMatrixWorld(true);
  const exporter=new GLTFExporter();const data=await exporter.parseAsync(copy,{binary:true,onlyVisible:true});
  return await (await fetch('/save-model',{method:'POST',body:data})).json();
}
let optimized=false;
async function optimize(){
  if(optimized)return;
  await MeshoptSimplifier.ready;
  let before=0,after=0;
  for(const group of partGroups)for(const mesh of group.children){
    const geometry=mesh.geometry;
    const indices=new Uint32Array(geometry.index.array);
    before+=indices.length/3;
    if(indices.length<12000){after+=indices.length/3;continue;}
    const positions=geometry.attributes.position.array;
    const normals=geometry.attributes.normal.array;
    const reference=/Ardi|Platine|A4988|Motor|cat/i.test(group.name);
    const [reduced]=MeshoptSimplifier.simplifyWithAttributes(indices,positions,3,normals,3,[.3,.3,.3],null,Math.floor(indices.length*(reference?.16:.5)/3)*3,reference?.003:.0006,['Permissive']);
    const [remap,count]=MeshoptSimplifier.compactMesh(reduced);
    const replacement=new THREE.BufferGeometry();
    for(const [name,attribute] of Object.entries(geometry.attributes)){
      const output=new Float32Array(count*attribute.itemSize);
      for(let old=0;old<remap.length;old++)if(remap[old]!==0xffffffff)for(let axis=0;axis<attribute.itemSize;axis++)output[remap[old]*attribute.itemSize+axis]=attribute.array[old*attribute.itemSize+axis];
      replacement.setAttribute(name,new THREE.BufferAttribute(output,attribute.itemSize));
    }
    replacement.setIndex(new THREE.BufferAttribute(reduced,1));
    mesh.geometry=replacement;geometry.dispose();after+=reduced.length/3;
  }
  optimized=true;renderer.shadowMap.needsUpdate=true;
  return {before,after};
}
window.studio={render,exportModel,stats:{triangles:result.meshes.reduce((n,m)=>n+m.index.array.length/3,0),drawCalls:renderer.info.render.calls,parts:partGroups.length,size:size.toArray()},components:partGroups.map(group=>({name:group.name,center:new THREE.Box3().setFromObject(group).getCenter(new THREE.Vector3()).toArray()}))};
render();window.studio.ready=true;
