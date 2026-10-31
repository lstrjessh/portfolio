import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../SiteHeader";
import { designs } from "./items";
import DesignViewer from "../DesignViewer";

export const metadata: Metadata = {
  title: "Designs | Lester Heyrana",
  description: "CAD assemblies, 3D models, and the parts I design and build.",
};

export default function Designs() {
  return <main className="designs-page">
    <SiteHeader designs />
    <section className="designs-heading">
      <span className="section-label">CAD / 3D MODELS</span>
      <h1>Designs<span>.</span></h1>
      <p>A collection of my parts, assemblies, and 3D models.</p>
    </section>
    <section className="designs-gallery" aria-label="Design collection">
      {designs.map(design => <article className="design-entry" key={design.slug}>
        <DesignViewer src={design.model} poster={design.image} label={design.alt} filename={`${design.slug}.glb`} />
        <div className="design-entry-copy">
          <span className="section-label">{design.category}</span>
          <h2>{design.title}</h2>
          <p>{design.description}</p>
          <div className="design-entry-tags">{design.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
        </div>
      </article>)}
    </section>
    <footer><Link href="/">← Portfolio</Link><a href="https://github.com/lstrjessh">GitHub ↗</a><span>© 2026 LESTER HEYRANA</span><Link href="/privacy">Privacy</Link></footer>
  </main>;
}
