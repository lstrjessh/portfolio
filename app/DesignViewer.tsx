"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const Model = dynamic(() => import("./DesignModel"), { ssr: false });

export default function DesignViewer({ src, poster, label, filename }: { src: string; poster: string; label: string; filename: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback(() => setFailed(true), []);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { rootMargin: "100px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <div className="design-viewer" ref={host}>
    <Image className={`design-model-poster${ready ? " is-ready" : ""}`} src={poster} width={1600} height={1280} alt={label} aria-hidden={ready} sizes="(max-width: 800px) 90vw, 44vw" />
    {visible && <Model src={src} label={label} filename={filename} onReady={onReady} onError={onError} />}
    {!visible && !failed && <span className="design-model-status" role="status">Loading 3D model…</span>}
    {ready && <span className="design-model-hint">Drag to rotate · Pinch or scroll to zoom</span>}
  </div>;
}
