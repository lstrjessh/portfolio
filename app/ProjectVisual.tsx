import ScannerCube from "./ScannerCube";
import GeoSafeVisual from "./GeoSafeVisual";
import BakasVisual from "./BakasVisual";

const labels: Record<string, string> = {
  "01": "GEOHAZARD MAPPING", "02": "SPECTRAL ANALYSIS", "03": "SUSCEPTIBILITY / SATELLITE CHANGE",
  "04": "POINT CLOUD CLASSIFICATION", "05": "INSTRUCTION PIPELINE", "06": "EDGE INFERENCE",
  "07": "POINT CLOUD", "08": "WALL FOLLOWING", "09": "TYPHOON TRACKING",
};

export default function ProjectVisual({ id }: { id: string }) {
  return <div className={`project-visual visual-${id}`} aria-hidden="true">
    <svg viewBox="0 0 480 200" fill="none" preserveAspectRatio="xMidYMid meet">
      <g stroke="currentColor" strokeWidth="1.2">
        {id === "01" && <>
          <g className="terrain"><path d="M20 130Q70 55 130 105T250 65M20 150Q70 75 130 125T250 85M20 110Q70 35 130 85T250 45M20 90Q70 15 130 65T250 25"/></g>
          <path className="flood-zone" d="M30 160Q70 100 115 135T230 110L250 170H30Z" fill="currentColor" stroke="none"/>
          <g className="rainfall" stroke="#8aaeff">{[65,100,135,170,205].map((x,i)=><path key={x} d={`M${x} 40l-6 14M${x+12} 70l-6 14`} style={{animationDelay:`${i*-.4}s`}}/>)}</g>
          <circle className="pulse-ring" cx="135" cy="112" r="16"/><circle cx="135" cy="112" r="4" fill="currentColor"/>
          <circle cx="83" cy="138" r="3" fill="currentColor"/><circle cx="192" cy="120" r="3" fill="currentColor"/>
          <path className="chart-grid" d="M275 25V175"/>
          <text x="300" y="40">LIVE CONDITIONS</text>
          <g className="condition-bars" strokeWidth="5"><path d="M302 70h65M302 87h105M302 104h45"/></g>
          <path className="chart-grid" d="M300 130v38h140"/>
          <path className="monitor-trend" d="m302 155 22-8 20 5 24-22 22 10 23-17 24 5"/>
          <text x="300" y="188">REPORTS / WEATHER</text>
        </>}
        {id === "02" && <>
          <path className="chart-grid" d="M45 35V165H440M45 120H440M45 75H440M140 35V165M240 35V165M340 35V165"/>
          <path className="spectrum-fill" stroke="none" fill="currentColor" opacity=".08" d="M45 157C85 157 99 155 109 146S124 53 140 53 155 148 180 148 204 132 218 132 231 143 245 143 263 36 280 36 297 149 324 149 343 88 360 88 375 155 440 155V165H45Z"/>
          <path className="peak-spectrum" d="M45 157C85 157 99 155 109 146S124 53 140 53 155 148 180 148 204 132 218 132 231 143 245 143 263 36 280 36 297 149 324 149 343 88 360 88 375 155 440 155"/>
          <g className="peak-markers"><path strokeDasharray="2 5" opacity=".3" d="M140 53V165M280 36V165M360 88V165"/><circle cx="140" cy="53" r="3" fill="currentColor"/><circle cx="280" cy="36" r="3" fill="currentColor"/><circle cx="360" cy="88" r="3" fill="currentColor"/><text x="140" y="41" textAnchor="middle">λ₁</text><text x="280" y="24" textAnchor="middle">λ₂</text><text x="360" y="76" textAnchor="middle">λ₃</text></g>
          <path className="sweep" opacity=".3" d="M240 30V165"/>
          <text x="45" y="25">ABSORBANCE</text><text x="440" y="185" textAnchor="end">WAVELENGTH →</text>
        </>}
        {id === "03" && <GeoSafeVisual />}
        {id === "09" && <BakasVisual />}
        {id === "04" && <>
          <g className="classifier-sphere">
            {Array.from({length:65},(_,i)=>{const y=1-2*(i+.5)/65;const r=Math.sqrt(1-y*y);const theta=i*2.39996;return <circle key={i} cx={130+Math.cos(theta)*r*48} cy={100+y*48} r="1.8" fill="currentColor" opacity={.4+(Math.sin(theta)+1)*.25} stroke="none"/>})}
          </g>
          <path className="chart-grid" d="M195 100h25m65 0h25"/>
          <rect x="220" y="78" width="65" height="44" rx="4" opacity=".5"/><text x="252" y="103" textAnchor="middle">POINTNET</text>
          <g className="shape-results">
            <text x="325" y="68">SPHERE</text><path className="classification-score" d="M325 80h82" strokeWidth="4"/>
            <text x="325" y="110" opacity=".4">CUBE</text><path d="M325 122h14" strokeWidth="4" opacity=".2"/>
            <text x="325" y="152" opacity=".4">CYLINDER</text><path d="M325 164h8" strokeWidth="4" opacity=".2"/>
          </g>
          <text x="130" y="172" textAnchor="middle" opacity=".5">INPUT POINT CLOUD</text>
        </>}
        {id === "05" && <>{["FETCH","DECODE","EXECUTE","STORE"].map((label,i)=><g key={label}><rect x={35+i*107} y="70" width="84" height="60" rx="4"/><text x={77+i*107} y="104" textAnchor="middle">{label}</text>{i<3&&<path d={`M${119+i*107} 100h23`}/>}</g>)}<circle className="pipeline-dot" cx="35" cy="100" r="4" fill="currentColor"/><path className="chart-grid" d="M77 130V160H398V130"/></>}
        {id === "06" && <>
          <rect x="75" y="30" width="155" height="140" rx="12" className="chart-grid"/>
          <path d="M65 55V20h30M210 20h30v35M65 145v35h30M210 180h30v-35" opacity=".6"/>
          <g className="drowsy-eyes">
            <path d="M90 90q22-28 44 0-22 28-44 0ZM165 90q22-28 44 0-22 28-44 0Z"/>
            <circle cx="112" cy="90" r="7" fill="currentColor"/>
            <circle cx="187" cy="90" r="7" fill="currentColor"/>
          </g>
          <path d="M138 128h24" opacity=".5"/>
          <text x="280" y="40">EYE OPENNESS</text>
          <path className="chart-grid" d="M280 55v65h135"/>
          <path className="alertness-wave" d="M282 67h17l6 25 6-25h24l8 40h26l8-40h36" strokeWidth="2"/>
          <g className="drowsy-alert"><path d="m294 142 12 21h-24Zm0 7v6m0 3v1"/><text x="318" y="158">DROWSY</text></g>
          <g className="awake-status"><circle cx="294" cy="153" r="4" fill="currentColor"/><text x="310" y="157">ATTENTIVE</text></g>
          <text x="150" y="194" textAnchor="middle" opacity=".5">MAX78000 / EDGE AI</text>
        </>}
        {id === "07" && <ScannerCube />}
        {id === "08" && <>
          <path d="M60 45h360v110" strokeWidth="5" opacity=".4"/>
          <path d="M90 105h270q20 0 20 20v45" strokeDasharray="4 6" opacity=".25"/>
          <g className="wall-robot"><rect x="155" y="83" width="54" height="36" rx="6"/><rect x="160" y="78" width="12" height="5" fill="currentColor"/><rect x="160" y="119" width="12" height="5" fill="currentColor"/><rect x="192" y="78" width="12" height="5" fill="currentColor"/><rect x="192" y="119" width="12" height="5" fill="currentColor"/><path className="sonar-ping" d="M176 75q6-8 12 0m-17-8q11-13 22 0m-27-8q16-18 32 0"/><path d="M182 83V48" strokeDasharray="2 4" opacity=".3"/></g>
          <text x="85" y="175">ULTRASONIC / PD CONTROL</text>
        </>}

      </g>
    </svg><span className="visual-caption">{labels[id]}</span>
  </div>;
}
