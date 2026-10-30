"use client";

import { useId, useState } from "react";

export default function ProjectDescription({ text, title }: { text: string; title: string }) {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  return <div className="project-description" data-expanded={expanded}>
    <p id={id}>{text}</p>
    <button type="button" className="description-toggle" aria-expanded={expanded} aria-controls={id} aria-label={`${expanded ? "Show less" : "Read more"} about ${title}`} onClick={() => setExpanded(!expanded)}>
      {expanded ? "Show less" : "Read more"}<span aria-hidden="true">{expanded ? "−" : "+"}</span>
    </button>
  </div>;
}
