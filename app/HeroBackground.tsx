"use client";

import { useSyncExternalStore } from "react";
import Topography from "./Topography";

function useMedia(query: string) {
  const subscribe = (callback: () => void) => {
    const media = window.matchMedia(query);
    media.addEventListener("change", callback);
    return () => media.removeEventListener("change", callback);
  };
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
}

export default function HeroBackground() {
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const desktop = useMedia("(min-width: 901px) and (hover: hover) and (pointer: fine)");

  if (reduced) {
    return <div className="topography-bg" aria-hidden="true" />;
  }

  return (
    <div className="topography-bg" aria-hidden="true">
      <Topography
        color="#a9e6c5"
        lineCount={desktop ? 26 : 22}
        lineWidth={1.1}
        tilt={24}
        glow={desktop ? 0.75 : 0.55}
        depthOfField={0.3}
        fog={desktop ? 0.4 : 0.5}
        brightness={desktop ? 0.7 : 0.65}
        opacity={0.85}
        speed={desktop ? 0.22 : 0.18}
        elevation={desktop ? 1.2 : 1}
        hoverEffect="light"
        mouseStrength={0.55}
        clickEffect="pulse"
        markers="dots"
        dpr={desktop ? undefined : 1.3}
        intro
      />
    </div>
  );
}
