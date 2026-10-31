export default function BakasVisual() {
  return <>
    <text x="30" y="24">WESTERN PACIFIC</text>
    <path className="chart-grid" d="M35 45H240M35 95H240M35 145H240M70 40V175M130 40V175M190 40V175" />
    <path d="M93 55h95v91H65v-39l28-23Z" strokeDasharray="3 5" opacity=".25" />
    <path d="M220 48C195 75 180 103 153 115S110 130 80 155" strokeDasharray="3 5" opacity=".45" />
    {[ [220,48],[193,81],[170,104],[141,120],[108,134],[80,155] ].map(([x,y]) => <circle key={x} cx={x} cy={y} r="2.5" fill="currentColor" opacity=".5" stroke="none" />)}
    <g className="bakas-track-motion">
      <circle r="20" fill="currentColor" fillOpacity=".04" strokeOpacity=".15" />
      <g className="bakas-vortex" strokeWidth="1.5" strokeLinecap="round">
        <path d="M-8 12C-24-9 2-27 17-14M8-12C24 9-2 27-17 14" />
        <circle r="5" fill="#101e20" />
      </g>
      <circle r="2" fill="#e5ad7f" stroke="none" />
    </g>
    <text x="34" y="188" opacity=".5">CURRENT / ARCHIVE</text>
    <path className="chart-grid" d="M267 28V175" />
    <text x="294" y="34">TRACK REPLAY</text>
    <path className="chart-grid" d="M295 58v65h144M295 91h144" />
    <path className="bakas-intensity" pathLength="1" d="m297 115 18-7 17-22 18-17 18 7 17 20 18 8 17 9 18 2" strokeWidth="1.7" />
    <path d="M309 155h130" opacity=".3" />
    <path d="m293 151 6 4-6 4Z" fill="currentColor" stroke="none" />
    <circle className="bakas-playhead" cx="310" cy="155" r="4" fill="currentColor" stroke="#101e20" strokeWidth="2" />
    <text x="294" y="188" opacity=".5">SATELLITE / ADVISORIES</text>
  </>;
}
