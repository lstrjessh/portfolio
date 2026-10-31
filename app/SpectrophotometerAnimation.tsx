"use client";

import { useEffect, useRef } from "react";

const spectrum = "M253 140C263 140 266 139 270 129S274 97 280 97 286 138 295 138 307 76 315 76 322 137 330 137 339 113 345 113 352 139 363 139";

export default function SpectrophotometerAnimation() {
  const host = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let visible = false;
    const sync = () => element.style.setProperty("--spectro-play-state", visible && !document.hidden ? "running" : "paused");
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(element);
    document.addEventListener("visibilitychange", sync);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", sync); };
  }, []);

  return <svg ref={host} className="scanning-animation spectro-animation" viewBox="0 48 380 140" role="img" aria-label="Light passes through a sample cuvette to a detector. The transmitted light is dimmer, and a spectrum with absorption peaks forms beside it.">
    <g fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="24" cy="110" r="11" opacity=".4" />
      <circle className="spectro-motion spectro-source" cx="24" cy="110" r="4" fill="currentColor" stroke="none" />
      <path d="M24 88v-5m0 54v-5M4 110H0m38-14 4-4m-4 32 4 4" opacity=".2" />
      <path d="M36 106h49v8H36Z" fill="currentColor" stroke="none" opacity=".1" />
      <path d="M36 110h49" opacity=".5" />
      <path className="spectro-motion spectro-incident" d="M36 110h9" strokeWidth="2" />
      <path d="M85 69h32v80H85Zm0 0 10-7h31v80l-9 7m0-80 9-7" opacity=".5" />
      <path className="spectro-motion spectro-sample" d="M88 99h26v47H88Z" fill="currentColor" stroke="none" />
      <path d="M88 99q6-3 13 0t13 0" opacity=".3" />
      <path d="M85 106h41v8H85Z" fill="currentColor" stroke="none" opacity=".08" />
      <path d="M126 106h44v8h-44Z" fill="currentColor" stroke="none" opacity=".04" />
      <path d="M126 110h44" opacity=".2" />
      <path className="spectro-motion spectro-transmitted" d="M127 110h6" strokeWidth="1.5" />
      <rect x="170" y="91" width="20" height="38" rx="3" opacity=".4" />
      <path d="M175 99v22m10-22v22m-10 12v6h10v-6" opacity=".2" />
      <circle className="spectro-motion spectro-detector" cx="180" cy="110" r="3" fill="currentColor" stroke="none" />
      <path d="M203 110h31m-5-4 5 4-5 4" opacity=".25" />
      <path d="M251 63v84h114m-114-31h114m-114-26h114" opacity=".16" />
      <path d={spectrum} opacity=".1" />
      <path className="spectro-motion spectro-curve" d={spectrum} pathLength="1" strokeDasharray="1" strokeWidth="1.6" />
      <g className="spectro-motion spectro-peaks" fill="currentColor" stroke="none"><circle cx="280" cy="97" r="2" /><circle cx="315" cy="76" r="2" /><circle cx="345" cy="113" r="2" /></g>
    </g>
    <g className="scanning-labels" textAnchor="middle"><text x="105" y="181">Measurement</text><text x="310" y="181">Spectrum</text></g>
  </svg>;
}
