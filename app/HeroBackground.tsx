"use client";

import { useSyncExternalStore } from "react";
import Topography from "./Topography";

const query = "(min-width: 901px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

function subscribe(callback: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(query).matches;
}

export default function HeroBackground() {
  const animate = useSyncExternalStore(subscribe, getSnapshot, () => false);
  return <div className="topography-bg" aria-hidden="true">
    {animate && <Topography
      color="#a9e6c5"
      lineCount={26}
      lineWidth={1.1}
      tilt={24}
      glow={0.75}
      depthOfField={0.3}
      brightness={0.7}
      opacity={0.85}
      speed={0.22}
      fog={0.4}
      elevation={1.2}
      hoverEffect="light"
      mouseStrength={0.55}
      clickEffect="pulse"
      markers="dots"
      intro
    />}
  </div>;
}
