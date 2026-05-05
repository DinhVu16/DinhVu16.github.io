"use client";

export default function TelemetryText() {
  const textLine1 =
    "GEAR: 8 // RPM: 11,500 // SPEED: 322 KM/H // DRS: ENABLED // ERS: DEPLOY // BRAKE BIAS: 56% // ";
  const textLine2 =
    "THROTTLE: 100% // G-FORCE: 4.5G // TYRE TEMP: 102°C // FUEL LOAD: 85KG // MGU-K: ACTIVE // ";
  const textLine3 =
    "MERCEDES W11 // RED BULL RB16 // FERRARI SF1000 // MCLAREN MCL35 // RENAULT R.S.20 // ";
  const textLine4 =
    "SECTOR 1: 27.452 // SECTOR 2: 29.104 // SECTOR 3: 23.881 // COMPOUND: C4 SOFT // PLAN A // ";

  return (
    <div className="absolute inset-0 flex flex-col justify-center gap-6 overflow-hidden pointer-events-none opacity-80">
      <style>{`
        @keyframes scroll-left {
          0% { transform: translateX(0) translateZ(0); }
          100% { transform: translateX(-50%) translateZ(0); }
        }
        @keyframes scroll-right {
          0% { transform: translateX(-50%) translateZ(0); }
          100% { transform: translateX(0) translateZ(0); }
        }
        .animate-scroll-left { animation: scroll-left 30s linear infinite; will-change: transform; }
        .animate-scroll-right { animation: scroll-right 30s linear infinite; will-change: transform; }
      `}</style>

      {/* ROW 1 */}
      <div className="relative flex w-max animate-scroll-left">
        {/* 1. The Invisible Anchor: Forces the width so the scroll animation loops flawlessly */}
        <span className="whitespace-nowrap text-[16vw] uppercase leading-none font-bebas-neue invisible select-none">
          {textLine1.repeat(2)}
        </span>
        {/* 2. The Flawless Vector Overlay: Physically cannot have a ghost fill */}
        <svg className="absolute inset-0 w-full h-full overflow-visible drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
          <text
            x="0"
            y="85%" /* Aligns the baseline of the SVG text with the HTML text */
            fill="none" /* ABSOLUTE ZERO FILL */
            stroke="#FFFFFF"
            strokeWidth="3"
            className="text-[16vw] uppercase font-bebas-neue"
          >
            {textLine1.repeat(2)}
          </text>
        </svg>
      </div>

      {/* ROW 2 */}
      <div className="relative flex w-max animate-scroll-right">
        <span className="whitespace-nowrap text-[16vw] uppercase leading-none font-bebas-neue invisible select-none">
          {textLine2.repeat(2)}
        </span>
        <svg className="absolute inset-0 w-full h-full overflow-visible drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
          <text x="0" y="85%" fill="none" stroke="#FFFFFF" strokeWidth="3" className="text-[16vw] uppercase font-bebas-neue">
            {textLine2.repeat(2)}
          </text>
        </svg>
      </div>

      {/* ROW 3 */}
      <div className="relative flex w-max animate-scroll-left">
        <span className="whitespace-nowrap text-[16vw] uppercase leading-none font-bebas-neue invisible select-none">
          {textLine3.repeat(2)}
        </span>
        <svg className="absolute inset-0 w-full h-full overflow-visible drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
          <text x="0" y="85%" fill="none" stroke="#FFFFFF" strokeWidth="3" className="text-[16vw] uppercase font-bebas-neue">
            {textLine3.repeat(2)}
          </text>
        </svg>
      </div>

      {/* ROW 4 */}
      <div className="relative flex w-max animate-scroll-right">
        <span className="whitespace-nowrap text-[16vw] uppercase leading-none font-bebas-neue invisible select-none">
          {textLine4.repeat(2)}
        </span>
        <svg className="absolute inset-0 w-full h-full overflow-visible drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
          <text x="0" y="85%" fill="none" stroke="#FFFFFF" strokeWidth="3" className="text-[16vw] uppercase font-bebas-neue">
            {textLine4.repeat(2)}
          </text>
        </svg>
      </div>
    </div>
  );
}