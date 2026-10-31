"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

type Props = { src: string; label: string; filename: string; onReady: () => void; onError: () => void };

function partName(object: THREE.Object3D) {
  const name = (object.userData.label || object.name).replace(/_/g, " ");
  if (/Sharp IR/i.test(name)) return "Infrared sensor";
  if (/LeadScrew Nut/i.test(name)) return "Lead screw nut";
  if (/LeadScrew/i.test(name)) return "Lead screw";
  if (/Motor/i.test(name)) return "Stepper motor";
  if (/LM8UU/i.test(name)) return "Linear bearing";
  if (/Ardi UNO/i.test(name)) return "Arduino Uno";
  if (/A4988/i.test(name)) return "Stepper driver";
  if (/Platine/i.test(name)) return "Prototype board";
  if (/^cat\b/i.test(name)) return "Sample object";
  return name.replace(/_/g, " ").replace(/\s+v\d+$/i, "") || "Component";
}

export default function DesignModel({ src, label, filename, onReady, onError }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const resetView = useRef<(() => void) | null>(null);
  const toggleAssembly = useRef<(() => void) | null>(null);
  const [exploded, setExploded] = useState(false);
  const [canExplode, setCanExplode] = useState(false);
  const [status, setStatus] = useState("Loading the assembly…");
  const [failed, setFailed] = useState(false);
  const [selectedPart, setSelectedPart] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  useEffect(() => {
    const container = host.current;
    if (!container) return;
    const controller = new AbortController();
    let disposed = false;
    let renderer: THREE.WebGLRenderer | undefined;
    let controls: OrbitControls | undefined;
    let scene: THREE.Scene | undefined;
    let environment: THREE.Texture | undefined;
    let observer: ResizeObserver | undefined;
    let animation = 0;
    let hoverFrame = 0;
    let modelUrl: string | undefined;
    let releaseSelection = () => {};
    const highlightedMaterials = new Map<THREE.Material, THREE.Material>();
    const disposeObject = (root: THREE.Object3D) => root.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      object.geometry.dispose();
      (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => material.dispose());
    });
    const load = async () => {
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        renderer.domElement.setAttribute("aria-label", `${label}. Drag to rotate, arrow keys to pan, and scroll or pinch to zoom.`);
        renderer.domElement.tabIndex = 0;
        container.appendChild(renderer.domElement);
        scene = new THREE.Scene();
        const pmrem = new THREE.PMREMGenerator(renderer);
        const room = new RoomEnvironment();
        environment = pmrem.fromScene(room, .04).texture;
        room.dispose(); pmrem.dispose();
        scene.environment = environment;
        scene.environmentIntensity = .7;
        scene.add(new THREE.HemisphereLight(0xe6f0eb, 0x344741, 1));
        const key = new THREE.DirectionalLight(0xedf6f0, 3.4); key.position.set(-1, 2, 1); scene.add(key);
        const rim = new THREE.DirectionalLight(0xa9d3c9, 2.2); rim.position.set(1, 1, -1); scene.add(rim);
        const camera = new THREE.PerspectiveCamera(38, 1, .001, 20);
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = false;
        controls.enablePan = true;
        controls.listenToKeyEvents(renderer.domElement);
        const render = () => { if (!disposed && renderer && scene) renderer.render(scene, camera); };
        controls.addEventListener("change", render);
        const response = await fetch(src, { signal: controller.signal });
        if (!response.ok || !response.body) throw new Error("The model could not load.");
        if (typeof DecompressionStream === "undefined") throw new Error("The 3D model is not supported in this browser.");
        const data = await new Response(response.body.pipeThrough(new DecompressionStream("gzip"))).arrayBuffer();
        controller.signal.throwIfAborted();
        const gltf = await new GLTFLoader().parseAsync(data, "");
        if (disposed) { disposeObject(gltf.scene); return; }
        modelUrl = URL.createObjectURL(new Blob([data], { type: "model/gltf-binary" }));
        setDownloadUrl(modelUrl);
        scene.add(gltf.scene);
        const parts: { object: THREE.Object3D; position: THREE.Vector3; offset: THREE.Vector3 }[] = [];
        gltf.scene.traverse(object => {
          if (Array.isArray(object.userData.explode)) parts.push({ object, position: object.position.clone(), offset: new THREE.Vector3(...object.userData.explode as [number, number, number]) });
        });
        setCanExplode(parts.length > 0);
        const componentObjects = new Set(parts.map(part => part.object));
        let selected: THREE.Object3D | null = null;
        const originals = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();
        const highlight = (object: THREE.Object3D | null) => {
          if (object === selected) return;
          for (const [mesh, material] of originals) mesh.material = material;
          originals.clear(); selected = object;
          object?.traverse(child => {
            if (!(child instanceof THREE.Mesh)) return;
            originals.set(child, child.material);
            const tint = (material: THREE.Material) => {
              if (!highlightedMaterials.has(material)) {
                const clone = material.clone();
                if (clone instanceof THREE.MeshStandardMaterial) {
                  clone.color.set("#3aaf7a");
                  clone.emissive.set("#3fd28f"); clone.emissiveIntensity = .4;
                  clone.metalness = Math.min(clone.metalness, .15);
                  clone.roughness = .45;
                }
                highlightedMaterials.set(material, clone);
              }
              return highlightedMaterials.get(material)!;
            };
            child.material = Array.isArray(child.material) ? child.material.map(tint) : tint(child.material);
          });
          setSelectedPart(object ? partName(object) : ""); render();
        };
        releaseSelection = () => highlight(null);
        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();
        const canvas = renderer.domElement;
        const pick = (x: number, y: number) => {
          const bounds = canvas.getBoundingClientRect();
          pointer.set((x - bounds.left) / bounds.width * 2 - 1, -(y - bounds.top) / bounds.height * 2 + 1);
          raycaster.setFromCamera(pointer, camera);
          let object: THREE.Object3D | null = raycaster.intersectObject(gltf.scene, true)[0]?.object ?? null;
          if (componentObjects.size) while (object && !componentObjects.has(object)) object = object.parent;
          highlight(object);
        };
        const activePointers = new Set<number>();
        let down: { x: number; y: number; id: number } | null = null;
        const eventOptions = { signal: controller.signal };
        canvas.addEventListener("pointerdown", event => {
          cancelAnimationFrame(hoverFrame); activePointers.add(event.pointerId);
          down = activePointers.size === 1 ? { x: event.clientX, y: event.clientY, id: event.pointerId } : null;
          highlight(null);
        }, eventOptions);
        canvas.addEventListener("pointermove", event => {
          if (down && Math.hypot(event.clientX - down.x, event.clientY - down.y) > 6) down = null;
          if (event.pointerType !== "mouse" || event.buttons || activePointers.size) return;
          cancelAnimationFrame(hoverFrame);
          hoverFrame = requestAnimationFrame(() => pick(event.clientX, event.clientY));
        }, eventOptions);
        canvas.addEventListener("pointerup", event => {
          if (down?.id === event.pointerId && Math.hypot(event.clientX - down.x, event.clientY - down.y) <= 6) pick(event.clientX, event.clientY);
          activePointers.delete(event.pointerId); down = null;
        }, eventOptions);
        canvas.addEventListener("pointercancel", event => { activePointers.delete(event.pointerId); down = null; }, eventOptions);
        canvas.addEventListener("pointerleave", event => {
          cancelAnimationFrame(hoverFrame);
          if (event.pointerType === "mouse") highlight(null);
        }, eventOptions);
        canvas.addEventListener("keydown", event => { if (event.key === "Escape") highlight(null); }, eventOptions);
        canvas.addEventListener("wheel", () => highlight(null), { ...eventOptions, passive: true });
        let amount = 0, expanded = false;
        const fit = () => {
          if (!controls) return;
          const bounds = new THREE.Box3().setFromObject(gltf.scene);
          const center = bounds.getCenter(new THREE.Vector3());
          const size = bounds.getSize(new THREE.Vector3());
          const length = Math.max(size.x, size.y, size.z);
          const direction = new THREE.Vector3(1.1, .7, -1.4).normalize();
          const right = new THREE.Vector3().crossVectors(camera.up, direction).normalize();
          const up = new THREE.Vector3().crossVectors(direction, right).normalize();
          const tangent = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
          let distance = 0;
          for (let i = 0; i < 8; i++) {
            const corner = new THREE.Vector3(i & 1 ? bounds.max.x : bounds.min.x, i & 2 ? bounds.max.y : bounds.min.y, i & 4 ? bounds.max.z : bounds.min.z).sub(center);
            distance = Math.max(distance, Math.abs(corner.dot(right)) / (tangent * camera.aspect) + corner.dot(direction), Math.abs(corner.dot(up)) / tangent + corner.dot(direction));
          }
          distance *= expanded ? 1.15 : 1.02;
          controls.minDistance = length * .3; controls.maxDistance = length * 7;
          controls.target.copy(center);
          camera.position.copy(center).addScaledVector(direction, distance);
          controls.update(); render();
        };
        resetView.current = () => {
          highlight(null); cancelAnimationFrame(animation); fit();
        };
        toggleAssembly.current = () => {
          highlight(null);
          cancelAnimationFrame(animation);
          expanded = !expanded; setExploded(expanded);
          const from = amount, to = expanded ? 1 : 0;
          const start = performance.now();
          const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
          const tick = (now: number) => {
            const t = reduced ? 1 : Math.min((now - start) / 600, 1);
            amount = from + (to - from) * (1 - Math.cos(t * Math.PI)) / 2;
            for (const part of parts) part.object.position.copy(part.position).addScaledVector(part.offset, amount);
            fit();
            if (t < 1 && !disposed) animation = requestAnimationFrame(tick);
          };
          animation = requestAnimationFrame(tick);
        };
        const resize = () => {
          if (!renderer) return;
          const width = container.clientWidth, height = container.clientHeight;
          renderer.setSize(width, height);
          camera.aspect = width / height; camera.updateProjectionMatrix(); fit();
        };
        observer = new ResizeObserver(resize); observer.observe(container);
        resize(); setStatus(""); onReady();
      } catch (error) {
        if (!disposed && !controller.signal.aborted) { setFailed(true); setStatus(error instanceof Error ? error.message : "The 3D viewer could not start."); onError(); }
      }
    };
    void load();
    return () => {
      disposed = true; controller.abort(); cancelAnimationFrame(animation); cancelAnimationFrame(hoverFrame); observer?.disconnect(); controls?.dispose();
      releaseSelection();
      highlightedMaterials.forEach(material => material.dispose());
      if (modelUrl) URL.revokeObjectURL(modelUrl);
      if (scene) disposeObject(scene);
      environment?.dispose(); renderer?.dispose(); renderer?.forceContextLoss(); renderer?.domElement.remove(); resetView.current = null; toggleAssembly.current = null;
    };
  }, [src, label, onReady, onError]);
  return <><div ref={host} className="design-model-canvas" />{status && <p className="design-model-status" role={failed ? "alert" : "status"}>{status}</p>}{!status && <><div className="design-model-controls">{canExplode && <button onClick={() => toggleAssembly.current?.()} aria-pressed={exploded}>{exploded ? "Assemble" : "Explode"}</button>}<button onClick={() => resetView.current?.()}>Reset view ↺</button>{downloadUrl && <a className="design-model-download" href={downloadUrl} download={filename} title="Download GLB" aria-label="Download 3D model as GLB"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v12m-4-4 4 4 4-4M5 16v5h14v-5" /></svg></a>}</div>{selectedPart && <span className="design-model-part" role="status">{selectedPart}</span>}</>}</>;
}
