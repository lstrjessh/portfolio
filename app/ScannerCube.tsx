"use client";

import { useEffect, useState } from "react";

const vertices = Array.from({ length: 8 }, (_, i) => [i & 1 ? 1 : -1, i & 2 ? 1 : -1, i & 4 ? 1 : -1]);
const edges = vertices.flatMap((_, i) => [1, 2, 4].filter(bit => !(i & bit)).map(bit => [i, i | bit]));
const cloud = Array.from({ length: 100 }, (_, i) => [
  (((i * 37 + 11) % 101) / 100 - 0.5) * 1.4,
  (((i * 53 + 23) % 103) / 102 - 0.5) * 1.4,
  (((i * 71 + 7) % 107) / 106 - 0.5) * 1.4,
]);

export default function ScannerCube() {
  const [angle, setAngle] = useState(0.45);
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let last = 0;
    let elapsed = 0;
    const tick = (now: number) => {
      if (last && !document.hidden && !motion.matches) elapsed += Math.min(now - last, 50);
      last = now;
      setAngle(0.45 + elapsed * 0.0004);
      frame = requestAnimationFrame(tick);
    };
    if (!motion.matches) frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);
  const project = ([x, y, z]: number[]) => {
    const rx = x * Math.cos(angle) + z * Math.sin(angle);
    const rz = -x * Math.sin(angle) + z * Math.cos(angle);
    const ry = y * Math.cos(0.35) - rz * Math.sin(0.35);
    const depth = y * Math.sin(0.35) + rz * Math.cos(0.35);
    const scale = 58 * 5 / (5 + depth);
    return { x: 240 + rx * scale, y: 96 + ry * scale, depth };
  };
  const corners = vertices.map(project);
  const points = cloud.map(project).sort((a, b) => b.depth - a.depth);
  return <g>
    <ellipse cx="240" cy="180" rx="65" ry="7" fill="currentColor" opacity=".06" stroke="none" />
    {edges.map(([a, b]) => <line key={`${a}-${b}`} x1={corners[a].x} y1={corners[a].y} x2={corners[b].x} y2={corners[b].y} opacity={0.55 - (corners[a].depth + corners[b].depth) * 0.12} />)}
    {points.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={1.7 - p.depth * 0.45} opacity={0.65 - p.depth * 0.3} fill="currentColor" stroke="none" />)}
  </g>;
}
