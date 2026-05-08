"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
import { TrackRenderer } from "../renders/trackRender";

// 1. THE COMPONENT
const AnimatedTrack = ({ track }: { track: any }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<TrackRenderer | null>(null);

  useEffect(() => {
    if (mountRef.current && !rendererRef.current) {
      rendererRef.current = new TrackRenderer(mountRef.current);
    }
    return () => {
      if (rendererRef.current) {
        rendererRef.current.destroy();
        rendererRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (rendererRef.current && track?.image) {
      rendererRef.current.loadTrack(track.image);
    }
  }, [track?.image]);

  return <div ref={mountRef} className="absolute inset-0 w-full h-full" />;
};

const tracksData = [
  {
    id: "australia",
    name: "AUSTRALIA GP",
    flag: "au",
    subtitle: "F1 2020",
    circuit: "Melbourne Grand Prix Circuit",
    location: "Melbourne",
    image: "/TracksList/Australia/melbourne-2.svg",
  },
  {
    id: "bahrain",
    name: "BAHRAIN GP",
    flag: "bh",
    subtitle: "F1 2020",
    circuit: "Bahrain International Circuit",
    location: "Sakhir",
    image: "/TracksList/Bahrain/bahrain-1.svg",
  },
  {
    id: "vietnam",
    name: "VIETNAM GP",
    flag: "vn",
    subtitle: "F1 2020",
    circuit: "Hanoi Circuit",
    location: "Hanoi",
    image: "/TracksList/Vietnam/VietnamBlack.svg",
  },
  {
    id: "china",
    name: "CHINA GP",
    flag: "cn",
    subtitle: "F1 2020",
    circuit: "Shanghai International Circuit",
    location: "Shanghai",
    image: "/TracksList/China/shanghai-1.svg",
  },
  {
    id: "netherlands",
    name: "NETHERLANDS GP",
    flag: "nl",
    subtitle: "F1 2020",
    circuit: "Circuit Zandvoort",
    location: "Zandvoort",
    image: "/TracksList/The Netherlands/zandvoort-5.svg",
  },
  {
    id: "spain",
    name: "SPAIN GP",
    flag: "es",
    subtitle: "F1 2020",
    circuit: "Circuit de Barcelona-Catalunya",
    location: "Montmeló",
    image: "/TracksList/Spain/catalunya-6.svg",
  },
  {
    id: "monaco",
    name: "MONACO GP",
    flag: "mc",
    subtitle: "F1 2020",
    circuit: "Circuit de Monaco",
    location: "Monte Carlo",
    image: "/TracksList/Monaco/monaco-6.svg",
  },
  {
    id: "azerbaijan",
    name: "AZERBAIJAN GP",
    flag: "az",
    subtitle: "F1 2020",
    circuit: "Baku City Circuit",
    location: "Baku",
    image: "/TracksList/Azerbaijan/baku-1.svg",
  },
  {
    id: "canada",
    name: "CANADA GP",
    flag: "ca",
    subtitle: "F1 2020",
    circuit: "Circuit Gilles-Villeneuve",
    location: "Montreal",
    image: "/TracksList/Canada/montreal-6.svg",
  },
  {
    id: "france",
    name: "FRANCE GP",
    flag: "fr",
    subtitle: "F1 2020",
    circuit: "Circuit Paul Ricard",
    location: "Le Castellet",
    image: "/TracksList/France/FrenchBlack.svg",
  },
  {
    id: "austria",
    name: "AUSTRIA GP",
    flag: "at",
    subtitle: "F1 2020",
    circuit: "Red Bull Ring",
    location: "Spielberg",
    image: "/TracksList/Austria/spielberg-3.svg",
  },
  {
    id: "britain",
    name: "BRITAIN GP",
    flag: "gb",
    subtitle: "F1 2020",
    circuit: "Silverstone Circuit",
    location: "Silverstone",
    image: "/TracksList/Britain/silverstone-8.svg",
  },
  {
    id: "hungary",
    name: "HUNGARY GP",
    flag: "hu",
    subtitle: "F1 2020",
    circuit: "Hungaroring",
    location: "Mogyoród",
    image: "/TracksList/Hungary/hungaroring-3.svg",
  },
  {
    id: "belgium",
    name: "BELGIUM GP",
    flag: "be",
    subtitle: "F1 2020",
    circuit: "Circuit de Spa-Francorchamps",
    location: "Stavelot",
    image: "/TracksList/Belgium/spa-francorchamps-4.svg",
  },
  {
    id: "italy",
    name: "ITALY GP",
    flag: "it",
    subtitle: "F1 2020",
    circuit: "Autodromo Nazionale Monza",
    location: "Monza",
    image: "/TracksList/Italy/monza-7.svg",
  },
  {
    id: "singapore",
    name: "SINGAPORE GP",
    flag: "sg",
    subtitle: "F1 2020",
    circuit: "Marina Bay Street Circuit",
    location: "Marina Bay",
    image: "/TracksList/Singapore/marina-bay-4.svg",
  },
  {
    id: "russia",
    name: "RUSSIA GP",
    flag: "ru",
    subtitle: "F1 2020",
    circuit: "Sochi Autodrom",
    location: "Sochi",
    image: "/TracksList/Russia/RussianBlack.svg",
  },
  {
    id: "japan",
    name: "JAPAN GP",
    flag: "jp",
    subtitle: "F1 2020",
    circuit: "Suzuka International Racing Course",
    location: "Suzuka",
    image: "/TracksList/Japan/suzuka-2.svg",
  },
  {
    id: "usa",
    name: "USA GP",
    flag: "us",
    subtitle: "F1 2020",
    circuit: "Circuit of the Americas",
    location: "Austin",
    image: "/TracksList/USA/austin-1.svg",
  },
  {
    id: "mexico",
    name: "MEXICO GP",
    flag: "mx",
    subtitle: "F1 2020",
    circuit: "Autódromo Hermanos Rodríguez",
    location: "Mexico City",
    image: "/TracksList/México/mexico-city-3.svg",
  },
  {
    id: "brazil",
    name: "BRAZIL GP",
    flag: "br",
    subtitle: "F1 2020",
    circuit: "Autódromo José Carlos Pace",
    location: "São Paulo",
    image: "/TracksList/Brazil/interlagos-2.svg",
  },
  {
    id: "abudhabi",
    name: "ABUDABHI GP",
    flag: "ae",
    subtitle: "F1 2020",
    circuit: "Yas Marina Circuit",
    location: "Abu Dhabi",
    image: "/TracksList/Abu Dhabi/yas-marina-2.svg",
  },
];

export default function Tracks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedTrack, setSelectedTrack] = useState(tracksData[0]);
  const headerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const scrollTarget = useRef(0);

  // Custom Smooth Scrolling for the nested list
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    // Sync initial scroll position
    scrollTarget.current = scroller.scrollTop;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault(); // Stop the default snappy browser scroll
      e.stopPropagation(); // Stop GSAP ScrollSmoother from interfering

      // Add wheel delta to the target
      scrollTarget.current += e.deltaY;

      // Clamp the target so we don't scroll past the top or bottom
      const maxScroll = scroller.scrollHeight - scroller.clientHeight;
      scrollTarget.current = Math.max(
        0,
        Math.min(scrollTarget.current, maxScroll),
      );

      // Tween the scroll position smoothly using GSAP
      gsap.to(scroller, {
        scrollTop: scrollTarget.current,
        duration: 0.7, // Adjust this to make it more/less "floaty"
        ease: "power3.out",
        overwrite: "auto",
      });
    };

    scroller.addEventListener("wheel", handleWheel, { passive: false });
    return () => scroller.removeEventListener("wheel", handleWheel);
  }, []);
  useGSAP(
    () => {
      const applyBlockReveal = (
        block: any,
        content: any,
        position?: string,
        tl?: any,
      ) => {
        // Reset to 0 width on the left side
        gsap.set(block, { width: "0%", left: "0%" });

        tl.to(
          block,
          // 1. Grow the width to 100% to cover the text
          { width: "100%", duration: 0.2, ease: "power4.inOut" },
          position,
        )
          // 2. Instantly reveal the text behind it
          .set(content, { opacity: 1 })
          .to(
            block,
            // 3. Slide the box out to the right.
            // Because the parent has overflow-hidden, it disappears perfectly.
            { left: "100%", duration: 0.2, ease: "power4.inOut" },
          );
      };
      // --- HEADER REVEAL ---
      const tlHeader = gsap.timeline({
        scrollTrigger: {
          trigger: headerRef.current,
          start: "top 80%",
          once: true,
        },
      });
      applyBlockReveal(blockRef.current, titleRef.current, undefined, tlHeader);
      tlHeader
        .to(
          [line1Ref.current, line2Ref.current],
          { scaleX: 1, duration: 0.5, ease: "power3.out", stagger: 0.1 },
          "-=0.2",
        )
        .to(
          boxRef.current,
          { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.7)" },
          "-=0.3",
        );

      // --- INFO HUD REVEAL ---
      const infoElements = gsap.utils.toArray(".info-reveal") as HTMLElement[];
      infoElements.forEach((el, index) => {
        const block = el.querySelector(".info-block");
        const content = el.querySelector(".info-content");
        if (block && content) {
          applyBlockReveal(block, content, index === 0 ? "-=0.1" : "-=0.3", tlHeader);
        }
      });

      // --- TRACK LIST ROWS (Hybrid Cascade) ---
      const listElements = gsap.utils.toArray(".list-reveal") as HTMLElement[];
      listElements.forEach((el, index) => {
        const block = el.querySelector(".list-block");
        const content = el.querySelector(".list-content");

        if (block && content) {
          // 1. The first 7 items (Visible on load) cascade seamlessly with the HUD
          if (index < 7) {
            applyBlockReveal(
              block,
              content,
              index === 0 ? "-=0.2" : "-=0.7",
              tlHeader,
            );
          }
          // 2. The unseen items (Off-screen) wait until you scroll them into view!
          else {
            const tlRow = gsap.timeline({
              scrollTrigger: {
                trigger: el,
                scroller: "#tracks-scroller",
                start: "top 95%", // Triggers right as the track enters the bottom of the list
                once: true,
              },
            });
            applyBlockReveal(block, content, undefined, tlRow);
          }
        }
      });
    },
    { scope: containerRef },
  );
  return (
    <div
      id="tracks"
      ref={containerRef}
      className="page-content pt-[80px] pb-[80px] min-h-screen bg-transparent text-white"
    >
      <style>
        {`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}
      </style>

      <div className="w-full max-w-[1600px] mx-auto px-0 md:px-6">
        {/* HEADER */}
        {/* HEADER */}
        <div
          ref={headerRef}
          className="mb-10 relative flex flex-col px-6 md:px-0"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4">
            {/* The parent container MUST have overflow-hidden to hide the sliding box */}
            <div className="relative inline-block overflow-hidden pb-1">
              <div ref={titleRef} className="relative opacity-0">
                <h1 className="relative page-title font-akira text-4xl md:text-6xl lg:text-[5rem] xl:text-[6rem] text-white uppercase tracking-[2px] leading-tight z-10">
                  TRACKS
                </h1>
              </div>

              {/* THE FOOLPROOF RED BLOCK */}
              <div
                ref={blockRef}
                className="absolute top-0 left-0 h-full bg-[#e10600] z-20"
                style={{ width: "0%" }}
              ></div>
            </div>
          </div>
          <div className="relative w-full h-[24px]">
            <div className="absolute bottom-0 left-0 w-[calc(100%-15px)] h-[18px] skew-x-[-30deg] origin-bottom-right">
              <div
                ref={line1Ref}
                className="absolute bottom-0 left-0 w-[calc(100%-10px)] h-[8px] bg-[#e10600] origin-left rounded-l-[1px] scale-x-0 z-0"
              />
              <div
                ref={line2Ref}
                className="absolute top-0 left-0 w-[calc(100%-10px)] h-[8px] bg-[#e10600] origin-left rounded-l-[1px] scale-x-0 z-0"
              />
              <div
                ref={boxRef}
                className="absolute bottom-0 right-0 w-[8px] h-[18px] bg-[#e10600] origin-bottom-right rounded-r-[1px] opacity-0 scale-0"
              />
            </div>
          </div>
        </div>

        {/* BORDERLESS HUD DESIGN */}
        <div className="relative w-full min-h-[75vh] md:min-h-[800px] flex overflow-hidden border-y border-white/10 md:border md:rounded-sm bg-[#0a0a0a]">
          {/* LEFT VERTICAL STRIP */}
          <div className="hidden md:flex w-16 lg:w-20 border-r border-white/10 bg-[#0a0a0a] flex-col items-center justify-between py-8 z-20 shrink-0 relative">
            <img
              src={`https://flagcdn.com/w40/${selectedTrack.flag}.png`}
              width="32"
              alt={`${selectedTrack.flag} flag`}
              className="object-cover opacity-80"
            />
            {/* Giant Vertical Text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <h2 className="font-akira text-[4rem] text-white whitespace-nowrap -rotate-90 tracking-widest uppercase">
                {selectedTrack.location}
              </h2>
            </div>
            <span className="font-orbitron font-bold text-white text-lg z-10">
              {(tracksData.findIndex((t) => t.id === selectedTrack.id) + 1)
                .toString()
                .padStart(2, "0")}
            </span>
          </div>

          <div className="flex-1 relative flex flex-col p-6 lg:p-10">
            {/* 3D Track Background (Broken out of flexbox to force massive scale) */}
            <div className="absolute top-1/2 left-1/2 w-[180%] h-[180%] md:w-[160%] md:h-[160%] -translate-x-[-60%] lg:-translate-x-[55%] -translate-y-[45%] z-0 pointer-events-none opacity-90">
              {selectedTrack.image && <AnimatedTrack track={selectedTrack} />}
            </div>

            {/* TOP OVERLAY UI */}
            <div className="relative z-10 flex flex-col lg:flex-row justify-between w-full h-full pointer-events-none">
              {/* TOP LEFT: Flat HUD Stats */}
              <div className="flex flex-col gap-6 w-full lg:w-1/2 pointer-events-auto mb-10 lg:mb-0">
                {/* Reveal Block 1: Track Name */}
                <div className="info-reveal relative overflow-hidden pb-1 w-fit">
                  <div className="info-content opacity-0">
                    <h3 className="font-akira text-2xl lg:text-4xl text-white uppercase tracking-wider mb-2">
                      {selectedTrack.name.replace(" GP", "")}
                    </h3>
                    <p className="font-inter text-white/60 font-bold tracking-[2px] uppercase text-sm">
                      {selectedTrack.circuit}
                    </p>
                  </div>
                  <div
                    className="info-block absolute top-0 left-0 h-full bg-[#e10600] z-20"
                    style={{ width: "0%" }}
                  ></div>
                </div>

                {/* Reveal Block 2: Track Stats */}
                <div className="info-reveal relative overflow-hidden py-1 w-fit">
                  <div className="info-content opacity-0 flex gap-8 border-l-2 border-[#e10600] pl-4">
                    <div className="flex flex-col">
                      <span className="text-white/40 font-inter text-[10px] uppercase tracking-widest mb-1">
                        City
                      </span>
                      <span className="text-white font-bold text-xl uppercase font-orbitron">
                        {selectedTrack.location}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white/40 font-inter text-[10px] uppercase tracking-widest mb-1">
                        Season
                      </span>
                      <span className="text-white font-bold text-xl uppercase font-orbitron">
                        2020
                      </span>
                    </div>
                  </div>
                  <div
                    className="info-block absolute top-0 left-0 h-full bg-[#e10600] z-20"
                    style={{ width: "0%" }}
                  ></div>
                </div>
              </div>

              {/* TOP RIGHT: Floating Scroll List */}
              <div className="w-full lg:w-[240px] xl:w-[280px] flex flex-col pointer-events-auto z-20">
                {/* List Header - Normal HUD reveal */}
                <div className="info-reveal relative overflow-hidden pb-3 mb-2 border-b border-white/20 w-full">
                  <div className="info-content opacity-0 flex justify-between items-end w-full">
                    <span className="text-white/50 font-inter tracking-widest text-[12px] uppercase font-bold">
                      Select Circuit
                    </span>
                    <span className="text-[#e10600] font-orbitron text-xs font-bold">
                      22 RNDS
                    </span>
                  </div>
                  <div
                    className="info-block absolute top-0 left-0 h-full bg-[#e10600] z-30"
                    style={{ width: "0%" }}
                  ></div>
                </div>

                {/* Scrollable Area */}
                <div
                  id="tracks-scroller"
                  ref={scrollerRef}
                  className="flex flex-col max-h-[260px] lg:max-h-[34vh] overflow-y-auto hide-scrollbar pr-1"
                >
                  {tracksData.map((track, index) => {
                    const isActive = selectedTrack.id === track.id;
                    const idx = (index + 1).toString().padStart(2, "0");

                    return (
                      /* NEW: Individual Row Wrapper (.list-reveal) */
                      <div
                        key={track.id}
                        className="list-reveal relative overflow-hidden shrink-0"
                      >
                        <div
                          onClick={() => setSelectedTrack(track)}
                          className={`list-content opacity-0 group relative cursor-pointer flex items-center py-2 lg:py-3 px-2 transition-all duration-200 border-b border-white/5
                          ${isActive ? "text-white bg-white/5" : "text-white/40 hover:text-white hover:bg-white/5"}`}
                        >
                          {/* Status Indicator / Line */}
                          <div
                            className={`absolute left-0 top-0 bottom-0 w-1 transition-colors duration-200 ${isActive ? "bg-[#e10600]" : "bg-transparent group-hover:bg-[#e10600]/50"}`}
                          />

                          {/* Name & Round */}
                          <div className="flex-1 pl-3 pr-2 flex justify-between items-center">
                            <span className="font-orbitron font-bold uppercase tracking-wider truncate block">
                              {track.name.replace(" GP", "")}
                            </span>
                            <span
                              className={`font-orbitron text-[12px] ${isActive ? "text-white/80" : "text-white/20"}`}
                            >
                              R{idx}
                            </span>
                          </div>
                        </div>

                        {/* NEW: Individual Red Sweep Block (.list-block) */}
                        <div
                          className="list-block absolute top-0 left-0 h-full bg-[#e10600] z-30 pointer-events-none"
                          style={{ width: "0%" }}
                        ></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
