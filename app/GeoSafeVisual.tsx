export default function GeoSafeVisual() {
  return <>
    <text x="25" y="24">SUSCEPTIBILITY</text>
    <g strokeLinejoin="round">
      <path d="m25 61 42-19 39 12 36-17 64 28 26 54-31 49-59 10-44-27-56 10Z" fill="currentColor" opacity=".035" />
      {[0, 1, 2, 3, 4].map(i => <path key={i} opacity=".18" d={`M${30 + i * 9} ${132 - i * 15}q38-65 79-29t105-23`} />)}
      <path d="m49 116 20-38 28 8 17-21 25 18-9 30-31-8-19 26Z" fill="currentColor" fillOpacity=".12" strokeOpacity=".35" />
      <path className="geosafe-zone" d="m115 141 19-38 29-9 14-35 24 12 12 43-29 24-34-8-15 24Z" fill="#d9ac80" fillOpacity=".3" stroke="#d9ac80" strokeOpacity=".6" />
      <path opacity=".22" strokeDasharray="3 5" d="M26 150q58-53 100-18t100-40" />
      <path className="geosafe-scan" d="M45 44V163" stroke="#a9e6c5" opacity=".65" />
      <circle cx="155" cy="111" r="13" className="pulse-ring" opacity=".7" />
      <circle cx="155" cy="111" r="4" fill="currentColor" stroke="#0b1216" strokeWidth="2" />
    </g>
    <path className="chart-grid" d="M250 32V174" />
    <text x="277" y="24">SATELLITE CHANGE</text>
    <path className="chart-grid" d="M277 48v105h173M277 82h173M277 117h173" />
    <path d="m279 82 22-10 21 18 22-22 21 10 22-17 21 9 20-9 21 6" strokeDasharray="3 4" opacity=".35" />
    <path className="geosafe-trace" pathLength="1" d="m279 85 22-10 21 18 22-16 21 34 22 10 21-22 20-11 21-17" strokeWidth="2" />
    <circle className="geosafe-change" cx="387" cy="121" r="5" fill="#d9ac80" stroke="#0b1216" strokeWidth="2" />
    <path d="M278 177h15" strokeDasharray="3 3" opacity=".4" />
    <text x="301" y="180" opacity=".5">BEFORE</text>
    <path d="M366 177h15" />
    <text x="389" y="180">AFTER</text>
  </>;
}
