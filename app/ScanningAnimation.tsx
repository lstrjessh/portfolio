"use client";

import { useEffect, useRef } from "react";

const layers = 9;
const samples = 28;
const scanDuration = 11.2;
const cycleDuration = 13.5;
const radii = [.66, .87, 1, .96, .77, .5, .44, .48, .64];

function point(layer: number, angle: number, rotation: number, center: number) {
  const radius = radii[layer] * 29 * (1 + .08 * Math.cos(angle * 3));
  const turn = angle + rotation;
  return [center + Math.cos(turn) * radius, 145 - layer * 10 + Math.sin(turn) * radius * .3];
}

const coordinates = (p: number[]) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`;
const cloud = Array.from({ length: layers * samples }, (_, i) => {
  const layer = Math.floor(i / samples);
  return { position: point(layer, i % samples / samples * Math.PI * 2, .6, 311), progress: i / (layers * samples) };
});
const dots = (count: number) => cloud.slice(0, count).map(p => `M${coordinates(p.position)}h.01`).join("");

export default function ScanningAnimation() {
  const host = useRef<SVGSVGElement>(null);
  const object = useRef<SVGPathElement>(null);
  const sensor = useRef<SVGGElement>(null);
  const beam = useRef<SVGPathElement>(null);
  const points = useRef<SVGPathElement>(null);
  const marker = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0, elapsed = 0, last = 0, visible = false, previousCount = -1;
    const draw = (time: number) => {
      const t = time % cycleDuration;
      const progress = Math.min(t / scanDuration, 1);
      const level = Math.min(Math.floor(progress * layers), layers - 1);
      const rotation = t / (scanDuration / layers) * Math.PI * 2;
      let wire = "";
      for (let layer = 0; layer < layers; layer++) {
        for (let sample = 0; sample <= samples; sample++) wire += `${sample ? "L" : "M"}${coordinates(point(layer, sample / samples * Math.PI * 2, rotation, 130))}`;
      }
      for (let meridian = 0; meridian < 8; meridian++) {
        for (let layer = 0; layer < layers; layer++) wire += `${layer ? "L" : "M"}${coordinates(point(layer, meridian / 8 * Math.PI * 2, rotation, 130))}`;
      }
      object.current?.setAttribute("d", wire);
      const sensorY = 145 - level * 10;
      const hitX = Math.min(...Array.from({ length: samples }, (_, sample) => point(level, sample / samples * Math.PI * 2, rotation, 130)[0]));
      sensor.current?.setAttribute("transform", `translate(0 ${sensorY})`);
      beam.current?.setAttribute("d", `M51 ${sensorY}L${hitX} ${sensorY - 2}L${hitX} ${sensorY + 2}Z`);
      marker.current?.setAttribute("cx", String(hitX));
      marker.current?.setAttribute("cy", String(sensorY));
      const count = Math.floor(progress * cloud.length);
      if (count !== previousCount) { points.current?.setAttribute("d", dots(count)); previousCount = count; }
      element.style.setProperty("--scan-active", t < scanDuration ? "1" : "0");
    };
    const tick = (now: number) => {
      if (!last) last = now;
      if (now - last >= 1000 / 24) {
        elapsed += Math.min((now - last) / 1000, .1); last = now; draw(elapsed);
      }
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(frame); last = 0;
      if (motion.matches) draw(scanDuration);
      else if (visible && !document.hidden) frame = requestAnimationFrame(tick);
    };
    draw(motion.matches ? scanDuration : 0);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(element);
    motion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      cancelAnimationFrame(frame); observer.disconnect();
      motion.removeEventListener("change", sync); document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return <svg ref={host} className="scanning-animation" viewBox="0 48 380 140" role="img" aria-label="A rotating object is measured by a rising infrared sensor, building a point cloud layer by layer.">
    <g fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M33 52v103m7-103v103M27 155h26" opacity=".2" />
      <ellipse cx="130" cy="150" rx="43" ry="12" opacity=".35" />
      <path d="M87 150v5c0 16 86 16 86 0v-5M130 163v5m-20 0h40" opacity=".25" />
      <path ref={object} opacity=".38" />
      <g ref={sensor} transform="translate(0 145)"><rect x="25" y="-6" width="26" height="12" rx="2" fill="var(--bg)" opacity=".85" /><circle cx="46" cy="0" r="2" fill="currentColor" stroke="none" /></g>
      <path ref={beam} className="scanning-beam" fill="currentColor" stroke="none" />
      <circle ref={marker} r="2.5" fill="currentColor" stroke="none" className="scanning-hit" />
      <path d="M205 109h35m-5-4 5 4-5 4" opacity=".25" />
      <path d={dots(cloud.length)} strokeWidth="1.5" opacity=".07" />
      <path ref={points} strokeWidth="2.5" opacity=".85" />
      <ellipse cx="311" cy="158" rx="35" ry="9" strokeDasharray="2 5" opacity=".16" />
    </g>
    <g className="scanning-labels" textAnchor="middle">
      <text x="130" y="181">Scanning</text>
      <text x="311" y="181">Point cloud</text>
    </g>
  </svg>;
}
