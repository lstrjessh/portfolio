import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../../SiteHeader";
import ProjectVisual from "../../ProjectVisual";

export const metadata: Metadata = {
  title: "GAKIT | Lester Heyrana",
  description: "A closer look at GAKIT’s flood modeling, automated validation, weather data pipeline, and geohazard mapping platform.",
};

const systems = [
  {
    id: "flood-modeling", title: "Flood modeling & simulation", label: "MODEL / INFERENCE",
    intro: "Turning rainfall inputs into mapped flood estimates, with replay and forecast views.",
    description: "An eight-channel U-Net emulates NOAH hazard patterns using a trailing 24-hour rainfall total. ONNX inference produces mapped estimates, while background workers publish consistent snapshots for the public and scenario views.",
    detail: "Each snapshot pins its inputs and model version. The map reads published frames rather than starting a new inference job for every visitor.",
    note: "The current model is a rainfall-conditioned hazard emulator. It does not retain water state or simulate river routing; its outputs are research estimates, not independently validated flood forecasts.",
    tags: ["Python", "U-Net", "ONNX Runtime"],
    stages: ["Rainfall + terrain", "Model inference", "Published frames"],
  },
  {
    id: "report-validation", title: "Automated report validation", label: "EVIDENCE / DECISIONS",
    intro: "Assessing community reports automatically, with staff review when needed.",
    description: "The validation engine checks report timing, event support, location, and available observation evidence. It produces validated, pending, or rejected decisions with explanations and an assessment history.",
    detail: "Incomplete context stays pending for review. Staff can confirm or override automated decisions, with a required reason and an audit trail.",
    note: "Validated means accepted for operational use. It does not independently establish the reported water depth.",
    tags: ["Python", "FastAPI", "PostGIS"],
    stages: ["Community report", "Evidence assessment", "Decision / review"],
  },
  {
    id: "weather-pipeline", title: "Weather data pipeline", label: "INGESTION / PUBLICATION",
    intro: "Bringing satellite observations, forecasts, and advisories into a shared data pipeline.",
    description: "JAXA GSMaP feeds supply current and accumulated rainfall. Forecast inputs combine available satellite forecast intervals with a numerical-weather fallback, while separate services publish heat index, PAGASA drought assessments, and weather advisories.",
    detail: "Caching, source timestamps, and freshness checks help keep observations and forecasts aligned. Missing or stale inputs are surfaced as unavailable rather than displayed as current conditions.",
    tags: ["Python", "FastAPI", "NumPy", "netCDF4"],
    stages: ["Observations / forecasts", "Normalize + cache", "Shared APIs"],
  },
  {
    id: "mapping-platform", title: "Geohazard mapping platform", label: "SPATIAL DATA / WEB",
    intro: "A public map and staff workspace built around the same geohazard information.",
    description: "The public interface combines location-based flood, landslide, and storm surge assessment with rainfall and other weather overlays. Community members can submit reports, while staff use monitoring dashboards, alerts, and report management tools.",
    detail: "MapLibre renders the geographic layers, with PMTiles for flood hazard tiles and PostGIS for spatial data. Separate staff and admin interfaces handle review, access management, and audit history.",
    tags: ["Next.js", "TypeScript", "PMTiles", "PostGIS", "Supabase", "Docker"],
    stages: ["Location + layers", "Spatial assessment", "Public / staff views"],
  },
];

export default function Gakit() {
  return <main className="gakit-page">
    <SiteHeader />
    <section className="gakit-intro">
      <Link className="back-link" href="/#work">← All projects</Link>
      <div className="gakit-intro-grid"><div>
        <span className="section-label">RESEARCH / GEOHAZARDS</span>
        <h1>GAKIT</h1>
        <p>A geohazard research platform bringing together flood modeling, weather data, and community observations.</p>
        <div className="gakit-context"><span>Lead developer</span><span>Internally funded research · MSU-IIT</span></div>
        <div className="gakit-links"><a href="https://project-gakit-client-2026-three.vercel.app/" target="_blank" rel="noopener noreferrer">Live platform ↗<span className="sr-only"> (opens in a new tab)</span></a><Link href="/blog/working-on-gakit">Project notes ↗</Link></div>
      </div><ProjectVisual id="01" /></div>
    </section>
    <nav className="gakit-nav" aria-label="GAKIT subprojects">
      {systems.map((system, i) => <a key={system.id} href={`#${system.id}`}><span>0{i + 1}</span>{system.title}</a>)}
    </nav>
    <div className="gakit-systems">
      {systems.map((system, i) => <section className="gakit-system" id={system.id} key={system.id}>
        <div className="system-index" aria-hidden="true">0{i + 1}</div>
        <div className="system-copy"><span className="section-label">{system.label}</span><h2>{system.title}</h2><p className="system-intro">{system.intro}</p><p>{system.description}</p><p>{system.detail}</p><div className="tags">{system.tags.map(tag => <span key={tag}>{tag}</span>)}</div>{system.note && <p className="system-note">{system.note}</p>}</div>
        <div className="system-flow" aria-label={`${system.title} workflow`}><ol>{system.stages.map(stage => <li key={stage}><span className="flow-node" aria-hidden="true"/>{stage}</li>)}</ol></div>
      </section>)}
    </div>
    <footer><Link href="/#work">← All projects</Link><Link href="/blog/working-on-gakit">GAKIT notes ↗</Link><span>© 2026 LESTER HEYRANA</span><Link href="/privacy">Privacy</Link></footer>
  </main>;
}
