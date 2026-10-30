"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

const Ferrofluid = dynamic(() => import("./Ferrofluid"), { ssr: false });
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
  return <div className="ferrofluid-bg" aria-hidden="true">
    {animate && <Ferrofluid colors={["#102b28", "#397c6a", "#a9e6c5"]} speed={0.4} mouseInteraction opacity={0.8} />}
  </div>;
}
