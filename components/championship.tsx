"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Driver {
  pos: number;
  name: string;
  team: string;
  points: number;
  wins: number;
}
interface Constructor {
  pos: number;
  team: string;
  points: number;
}
interface Stats {
  worldChampion: string;
  constructorChampion: string;
  totalRaces: number;
  mostWinsDriver: { name: string; wins: number };
}
interface Race {
  round: number;
  name: string;
  winner: string;
}
interface SeasonData {
  season: number;
  drivers: Driver[];
  constructors: Constructor[];
  stats: Stats;
  races: Race[];
}

const StatCard = ({ title, value }: { title: string; value: string }) => (
  <div className="stat-card opacity-0 relative border-b border-white/10 py-5 md:py-6 px-4 transition-colors duration-200 hover:bg-[#e10600] group cursor-default overflow-hidden">
    <div className="absolute inset-0 bg-[#e10600] origin-left scale-x-0 z-10 pointer-events-none group-hover:scale-x-100 transition-transform duration-300"></div>
    <div className="relative z-20 flex items-center gap-4 md:gap-8 w-full">
      <div className="relative font-akira text-2xl md:text-4xl text-white/40 group-hover:text-black italic w-10 md:w-16 flex-shrink-0 will-change-transform">
        <div className="absolute top-1/2 right-[50%] w-[156%] h-[20px] bg-[#e10600] group-hover:bg-black rotate-90 -translate-y-1/2 transition-colors duration-200"></div>
      </div>
      <div className="flex flex-col overflow-hidden">
        <span className="font-akira text-lg md:text-2xl text-white group-hover:text-black uppercase truncate tracking-tight">
          {value}
        </span>
        <span className="font-inter text-[10px] md:text-xs text-white/50 group-hover:text-black/70 uppercase tracking-widest mt-1 truncate">
          {title}
        </span>
      </div>
    </div>
  </div>
);

export default function Championships() {
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const [seasonData, setSeasonData] = useState<SeasonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // 1. Only store the initial mount coordinates to prevent thrashing
  const [hoveredTeam, setHoveredTeam] = useState<{
    name: string;
    startX: number;
    startY: number;
  } | null>(null);

  const [hoveredDriver, setHoveredDriver] = useState<{
    name: string;
    startX: number;
    startY: number;
  } | null>(null);

  // 2. Create refs to control the popups directly in the DOM
  const teamPopupRef = useRef<HTMLDivElement>(null);
  const driverPopupRef = useRef<HTMLDivElement>(null);

  // 3. Direct DOM manipulation for movement (60fps, no React re-renders)
  const handleTeamMouseMove = (e: React.MouseEvent) => {
    if (teamPopupRef.current) {
      const xOffset =
        e.clientX + 40 > window.innerWidth - 300
          ? e.clientX - 340
          : e.clientX + 40;
      teamPopupRef.current.style.transform = `translate3d(${xOffset}px, ${e.clientY}px, 0) translateY(-50%)`;
    }
  };

  const handleDriverMouseMove = (e: React.MouseEvent) => {
    if (driverPopupRef.current) {
      const xOffset =
        e.clientX + 40 > window.innerWidth - 300
          ? e.clientX - 340
          : e.clientX + 40;
      // Using translate3d for GPU acceleration and translateY(-50%) for vertical centering
      driverPopupRef.current.style.transform = `translate3d(${xOffset}px, ${e.clientY}px, 0) translateY(-50%)`;
    }
  };

  const getTeamLogo = (teamName: string) => {
    const map: Record<string, string> = {
      Mercedes: "mercedes.svg",
      "Red Bull Racing": "redbull.svg",
      McLaren: "mclaren.svg",
      "Racing Point": "racingpoint.svg",
      Renault: "renault.svg",
      Ferrari: "ferrari.svg",
      AlphaTauri: "alphatauri.svg",
      "Alfa Romeo": "alfaromeo.svg",
      Haas: "haas.svg",
      Williams: "williams.svg",
    };
    const key = Object.keys(map).find(
      (k) => k.toLowerCase() === teamName.toLowerCase().trim(),
    );
    return key ? `/logos/${map[key]}` : `/logos/F1.svg`;
  };

  const getDriverImage = (driverName: string) => {
    const map: Record<string, string> = {
      "Lewis Hamilton": "lewis hamilton.png",
      "Valtteri Bottas": "valtteri bottas.png",
      "Max Verstappen": "max verstapen.png",
      "Sergio Perez": "sergio perez.png",
      "Daniel Ricciardo": "daniel ricciardo.png",
      "Carlos Sainz": "carlos sains.png",
      "Alexander Albon": "alexander albon.png",
      "Charles Leclerc": "charles leclerc.png",
      "Lando Norris": "lando norris.png",
      "Pierre Gasly": "pierre gasly.png",
      "Lance Stroll": "lance stroll.png",
      "Esteban Ocon": "esteban ocon.png",
      "Sebastian Vettel": "sebastian vettel.png",
      "Daniil Kvyat": "daniil kvyat.png",
      "Nico Hulkenberg": "nico hulkenberg.png",
      "Kimi Raikkonen": "kimi raikkonen.png",
      "Antonio Giovinazzi": "antonio giovinazzi.png",
      "Romain Grosjean": "romain grosjean.png",
      "Kevin Magnussen": "kevin magnussen.png",
      "George Russell": "george russell.png",
      "Nicholas Latifi": "nicholas latifi.png",
    };

    const key = Object.keys(map).find(
      (k) => k.toLowerCase() === driverName.toLowerCase().trim(),
    );

    return key ? encodeURI(`/Driver/${map[key]}`) : `/Driver/default.png`;
  };

  const getRaceFlag = (raceName: string) => {
    const name = raceName.toLowerCase();
    if (name.includes("austria") || name.includes("styria")) return "at";
    if (name.includes("hungar")) return "hu";
    if (name.includes("briti") || name.includes("70th")) return "gb";
    if (name.includes("spain") || name.includes("spanish")) return "es";
    if (name.includes("belgi")) return "be";
    if (
      name.includes("ital") ||
      name.includes("tuscan") ||
      name.includes("emilia")
    )
      return "it";
    if (name.includes("russia")) return "ru";
    if (name.includes("eifel")) return "de";
    if (name.includes("portug")) return "pt";
    if (name.includes("turkish")) return "tr";
    if (name.includes("bahrain") || name.includes("sakhir")) return "bh";
    if (name.includes("abu dhabi")) return "ae";
    return "un";
  };

  const headerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const titleBlockRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const statsRef = useRef<HTMLDivElement>(null);
  const driversRef = useRef<HTMLDivElement>(null);
  const constructorsRef = useRef<HTMLDivElement>(null);
  const racesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
    fetch("/championships2020.json")
      .then((res) => res.json())
      .then((data) => {
        setSeasonData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch championship data:", err);
        setLoading(false);
      });
  }, []);

  useGSAP(
    () => {
      if (!seasonData) return;

      const applyBlockReveal = (
        block: any,
        content: any,
        tlObj: any,
        position?: string,
      ) => {
        tlObj
          .set(block, { transformOrigin: "left" }, position)
          .to(
            block,
            { scaleX: 1, duration: 0.4, ease: "power4.inOut" },
            position,
          )
          .set(content, { opacity: 1 })
          .set(block, { transformOrigin: "right" })
          .to(block, { scaleX: 0, duration: 0.4, ease: "power4.inOut" });
      };

      const tlHeader = gsap.timeline({
        scrollTrigger: {
          trigger: headerRef.current,
          start: "top 80%",
          once: true,
        },
      });
      applyBlockReveal(titleBlockRef.current, titleRef.current, tlHeader);
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

      gsap.fromTo(
        ".stat-card",
        { x: -30, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: statsRef.current,
            start: "top 85%",
            once: true,
          },
        },
      );

      // DRIVERS ENTRANCE
      gsap.fromTo(
        driversRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          scrollTrigger: {
            trigger: driversRef.current,
            start: "top 85%",
            once: true,
          },
        },
      );
      if (driversRef.current) {
        const rows = gsap.utils.toArray(
          driversRef.current.querySelectorAll(".row-reveal-container"),
        ) as HTMLElement[];
        rows.forEach((row) => {
          const block = row.querySelector(".row-block");
          const content = row.querySelector(".row-content");
          if (block && content) {
            const tl = gsap.timeline({
              scrollTrigger: { trigger: row, start: "top 95%", once: true },
            });
            tl.set(block, { transformOrigin: "left" })
              .to(block, { scaleX: 1, duration: 0.3, ease: "power3.inOut" })
              .set(content, { opacity: 1 })
              .set(block, { transformOrigin: "right" })
              .to(block, { scaleX: 0, duration: 0.3, ease: "power3.inOut" });
          }
        });
      }

      // CONSTRUCTORS ENTRANCE
      gsap.fromTo(
        constructorsRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          scrollTrigger: {
            trigger: constructorsRef.current,
            start: "top 85%",
            once: true,
          },
        },
      );
      if (constructorsRef.current) {
        const rows = gsap.utils.toArray(
          constructorsRef.current.querySelectorAll(".row-reveal-container"),
        ) as HTMLElement[];
        rows.forEach((row) => {
          const block = row.querySelector(".row-block");
          const content = row.querySelector(".row-content");
          if (block && content) {
            const tl = gsap.timeline({
              scrollTrigger: { trigger: row, start: "top 95%", once: true },
            });
            tl.set(block, { transformOrigin: "left" })
              .to(block, { scaleX: 1, duration: 0.3, ease: "power3.inOut" })
              .set(content, { opacity: 1 })
              .set(block, { transformOrigin: "right" })
              .to(block, { scaleX: 0, duration: 0.3, ease: "power3.inOut" });
          }
        });
      }

      // RACES ENTRANCE
      gsap.fromTo(
        racesRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          scrollTrigger: {
            trigger: racesRef.current,
            start: "top 85%",
            once: true,
          },
        },
      );
      gsap.fromTo(
        ".race-row",
        { x: -30, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.05,
          ease: "power3.out",
          delay: 0.2,
          scrollTrigger: {
            trigger: racesRef.current,
            start: "top 85%",
            once: true,
          },
        },
      );
    },
    { scope: mainContainerRef, dependencies: [seasonData] },
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#e10600]/20 border-t-[#e10600] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!seasonData)
    return (
      <div className="min-h-screen bg-transparent text-white pt-32 text-center">
        Data not found.
      </div>
    );

  return (
    <div
      id="championships"
      ref={mainContainerRef}
      className="page-content pt-[120px] px-6 md:px-[50px] pb-[80px] min-h-screen bg-transparent text-white overflow-x-hidden font-inter"
    >
      {/* 
        OPTIMIZED ANIMATION:
        Using translate3d and will-change pushes the animation to the GPU,
        drastically reducing lag when combined with masking gradients.
      */}
      <style>{`
        @keyframes marquee-rtl {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .animate-marquee {
          animation: marquee-rtl 8s linear infinite;
          will-change: transform;
          backface-visibility: hidden;
        }
      `}</style>

      <div className="max-w-[1400px] mx-auto">
        {/* HEADER SECTION */}
        <div ref={headerRef} className="mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4">
            <div className="relative inline-block w-fit overflow-hidden">
              <div ref={titleRef} className="relative opacity-0">
                <h1 className="relative page-title font-akira text-[2.5rem] md:text-[6rem] text-white uppercase tracking-[2px] leading-tight z-10">
                  CHAMPIONSHIPS
                </h1>
              </div>
              <div
                ref={titleBlockRef}
                className="absolute top-0 left-0 w-full h-full bg-[#e10600] origin-left scale-x-0 z-20"
              ></div>
            </div>
          </div>

          <div className="relative w-full h-[24px]">
            <div className="absolute bottom-0 left-0 w-[calc(100%-15px)] h-[18px] skew-x-[-30deg] origin-bottom-right">
              <div
                ref={line1Ref}
                className="absolute bottom-0 left-0 w-[calc(100%-10px)] h-[8px] bg-[#e10600] origin-left rounded-l-[1px] scale-x-0 z-0"
              ></div>
              <div
                ref={line2Ref}
                className="absolute top-0 left-0 w-[calc(100%-10px)] h-[8px] bg-[#e10600] origin-left rounded-l-[1px] scale-x-0 z-0"
              ></div>
              <div
                ref={boxRef}
                className="absolute bottom-0 right-0 w-[8px] h-[18px] bg-[#e10600] origin-bottom-right rounded-r-[1px] opacity-0 scale-0"
              ></div>
            </div>
          </div>
        </div>

        {/* 4 STATS SECTION - Transformed to match the exact row style */}
        <div
          ref={statsRef}
          className="grid grid-cols-1 lg:grid-cols-2 gap-y-0 mb-20 border-t border-white/10"
        >
          <StatCard
            title="World Champion"
            value={seasonData.stats.worldChampion}
          />
          <StatCard
            title="Constructor Champion"
            value={seasonData.stats.constructorChampion}
          />
          <StatCard
            title="Most Wins"
            value={`${seasonData.stats.mostWinsDriver.name} (${seasonData.stats.mostWinsDriver.wins})`}
          />
          <StatCard
            title="Total Races"
            value={seasonData.stats.totalRaces.toString()}
          />
        </div>

        {/* STANDINGS GRID */}
        <div className="grid grid-cols-1 gap-16 mb-20">
          {/* DRIVER STANDINGS */}
          <div ref={driversRef} className="opacity-0 relative z-10 w-full">
            <div className="border-b border-white/20 pb-4 mb-0 flex items-end">
              <h2 className="font-akira text-2xl md:text-5xl text-white uppercase tracking-wider">
                Driver Standings
              </h2>
            </div>

            <div className="flex flex-col w-full border-t border-white/10">
              {/* Header Row - Aligned for Universal Widths */}
              <div className="flex items-center justify-between py-3 px-4 border-b border-white/10 text-white/30 font-orbitron text-[10px] md:text-xs uppercase tracking-widest">
                <div className="flex items-center gap-4 md:gap-8 flex-1">
                  <div className="w-10 md:w-16">Pos</div>
                  <div>Driver</div>
                </div>
                <div className="flex items-center justify-end gap-4 md:gap-8 shrink-0 ml-4">
                  <div className="hidden sm:block w-12 md:w-20 text-right">
                    Wins
                  </div>
                  <div className="w-16 md:w-24 text-right">Pts</div>
                </div>
              </div>

              {/* Data Rows - Standardized Layout */}
              {seasonData.drivers.map((driver) => {
                const idx = driver.pos.toString().padStart(2, "0");
                return (
                  <div
                    key={driver.name}
                    className="row-reveal-container relative border-b border-white/10"
                  >
                    <div className="row-block absolute inset-0 bg-[#e10600] origin-left scale-x-0 z-10 pointer-events-none"></div>

                    <div
                      className="row-content opacity-0 flex items-center justify-between py-4 px-4 transition-colors duration-200 hover:bg-[#e10600] group relative z-20 cursor-pointer pointer-events-auto"
                      onMouseEnter={(e) =>
                        setHoveredDriver({
                          name: driver.name,
                          startX: e.clientX,
                          startY: e.clientY,
                        })
                      }
                      onMouseMove={handleDriverMouseMove}
                      onMouseLeave={() => setHoveredDriver(null)}
                    >
                      <div className="flex items-center gap-4 md:gap-8 flex-1 overflow-hidden">
                        <div className="relative tracking-wide font-akira text-2xl md:text-4xl text-white/50 group-hover:text-black italic w-10 md:w-16 flex-shrink-0">
                          {idx}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="font-akira text-lg md:text-3xl text-white group-hover:text-black uppercase truncate tracking-tight">
                            {driver.name}
                          </span>
                          <span className="font-inter text-[10px] md:text-xs text-white/50 group-hover:text-black/70 uppercase tracking-widest mt-1 truncate">
                            {driver.team}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-4 md:gap-8 shrink-0 ml-4">
                        <div className="hidden sm:block w-12 md:w-20 text-right font-akira text-lg md:text-4xl text-white/80 group-hover:text-black">
                          {driver.wins}
                        </div>
                        <div className="w-16 md:w-24 text-right font-akira text-2xl md:text-4xl text-[#e10600] group-hover:text-black">
                          {driver.points}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CONSTRUCTOR STANDINGS */}
          <div ref={constructorsRef} className="opacity-0 relative z-10 w-full">
            <div className="border-b border-white/20 pb-4 mb-0 flex items-end">
              <h2 className="font-akira text-2xl md:text-5xl text-white uppercase tracking-wider">
                Team Standings
              </h2>
            </div>

            <div className="flex flex-col w-full border-t border-white/10">
              {/* Header Row - Aligned for Universal Widths */}
              <div className="flex items-center justify-between py-3 px-4 border-b border-white/10 text-white/30 font-orbitron text-[10px] md:text-xs uppercase tracking-widest">
                <div className="flex items-center gap-4 md:gap-8 flex-1">
                  <div className="w-10 md:w-16">Pos</div>
                  <div>Team</div>
                </div>
                <div className="flex items-center justify-end gap-4 md:gap-8 shrink-0 ml-4">
                  <div className="hidden sm:block w-12 md:w-20 text-right"></div>{" "}
                  {/* Placeholder to perfectly align Points */}
                  <div className="w-16 md:w-24 text-right">Pts</div>
                </div>
              </div>

              {/* Data Rows - Standardized Layout */}
              {seasonData.constructors.map((team) => {
                const idx = team.pos.toString().padStart(2, "0");
                return (
                  <div
                    key={team.team}
                    className="row-reveal-container relative border-b border-white/10"
                  >
                    <div className="row-block absolute inset-0 bg-[#e10600] origin-left scale-x-0 z-10 pointer-events-none"></div>

                    <div
                      className="row-content opacity-0 flex items-center justify-between py-4 px-4 transition-colors duration-200 hover:bg-[#e10600] group relative z-20 cursor-pointer pointer-events-auto"
                      onMouseEnter={(e) =>
                        setHoveredTeam({
                          name: team.team,
                          startX: e.clientX,
                          startY: e.clientY,
                        })
                      }
                      onMouseMove={handleTeamMouseMove}
                      onMouseLeave={() => setHoveredTeam(null)}
                    >
                      <div className="flex items-center gap-4 md:gap-8 flex-1 overflow-hidden">
                        <div className="relative tracking-wide font-akira text-2xl md:text-4xl text-white/40 group-hover:text-black italic w-10 md:w-16 flex-shrink-0">
                          {idx}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="font-akira text-lg md:text-3xl text-white group-hover:text-black uppercase truncate tracking-tight">
                            {team.team}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-4 md:gap-8 shrink-0 ml-4">
                        <div className="hidden sm:block w-12 md:w-20 text-right"></div>
                        <div className="w-16 md:w-24 text-right">
                          <span className="font-akira text-2xl md:text-4xl text-[#e10600] group-hover:text-black">
                            {team.points}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RACE TIMELINE - Marquee AND Hover Kept Together (Optimized) */}
        <div ref={racesRef} className="opacity-0 w-full mt-12 ">
          <div className="border-b border-white/20 pb-4 mb-0 flex items-end">
            <h2 className="font-akira text-2xl md:text-3xl text-white uppercase tracking-wider">
              Race Calendar Results
            </h2>
          </div>

          <div className="flex flex-col w-full border-t border-white/10">
            {seasonData.races.map((race) => {
              const idx = race.round.toString().padStart(2, "0");
              return (
                <div
                  key={race.round}
                  className="race-row group relative flex items-center justify-between py-6 px-4 md:px-4 border-b border-white/10 hover:bg-[#e10600] transition-colors duration-200 cursor-pointer"
                >
                  {/* LEFT: Round, Race Name, Flag */}
                  <div className="flex items-center md:gap-8 flex-1 overflow-hidden">
                    {/* Number with Red Strikethrough */}
                    <div className="relative font-akira text-4xl md:text-4xl text-white/40 group-hover:text-black italic w-10 md:w-16 flex-shrink-0">
                      {idx}
                    </div>

                    {/* Location Name & Flag */}
                    <div className="flex items-center gap-4 overflow-hidden">
                      <span className="font-akira text-2xl md:text-3xl text-white group-hover:text-black uppercase truncate tracking-wide">
                        {race.name.split(" ")[0]}
                      </span>
                      <img
                        src={`https://flagcdn.com/w40/${getRaceFlag(race.name)}.png`}
                        alt={`${race.name} flag`}
                        className="hidden sm:block w-6 h-4 md:w-8 md:h-5 object-cover rounded-sm flex-shrink-0"
                      />
                    </div>
                  </div>
                  {/* RIGHT: Marquee Winner Name / Info */}

                  <div className="flex items-center justify-end gap-4 md:gap-8 shrink-0 ml-4 pr-4">
                    <div className="w-40 md:w-100 text-right overflow-hidden ">
                      <span className="font-akira md:text-3xl text-white/90 group-hover:text-black transition-colors duration-200 truncate ">
                        {race.winner}
                      </span>
                    </div>
                    <div className="hidden lg:block w-24 text-right font-akira text-sm md:text-lg text-white/30 group-hover:text-black/50 tracking-widest transition-colors duration-200">
                      WINNER
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MASSIVE TEAM POPUP */}
      {isClient &&
        hoveredTeam &&
        createPortal(
          <div
            ref={teamPopupRef} // Keep ref for direct DOM manipulation
            className="fixed pointer-events-none z-[99999] transition-opacity duration-200" // Removed transform from className
            style={{
              transform: `translate3d(${hoveredTeam.startX + 40 > window.innerWidth - 300 ? hoveredTeam.startX - 340 : hoveredTeam.startX + 40}px, ${hoveredTeam.startY}px, 0) translateY(-50%)`,
            }} // Initial transform for GPU acceleration
          >
            <div className="w-64 h-96 md:w-[300px] md:h-[200px] bg-[#000000] rounded-xl border border-[#e10600] flex flex-col items-center justify-center p-8 relative overflow-hidden">
              <img
                src={getTeamLogo(hoveredTeam.name)}
                alt={hoveredTeam.name}
                className="w-3/4 h-3/4 object-contain"
              />
              <div className="absolute bottom-0 left-0 w-full h-2 bg-[#e10600]"></div>
            </div>
          </div>,
          document.body,
        )}

      {/* MASSIVE DRIVER POPUP */}
      {isClient &&
        hoveredDriver &&
        createPortal(
          <div
            ref={driverPopupRef} // Keep ref for direct DOM manipulation
            className="fixed pointer-events-none z-[99999] transition-opacity duration-200" // Removed transform from className
            style={{
              transform: `translate3d(${hoveredDriver.startX + 40 > window.innerWidth - 300 ? hoveredDriver.startX - 340 : hoveredDriver.startX + 40}px, ${hoveredDriver.startY}px, 0) translateY(-50%)`,
            }} // Initial transform for GPU acceleration
          >
            <div className="w-64 h-96 md:w-[300px] md:h-[400px] bg-[#000000] overflow-hidden flex flex-col relative rounded-xl border border-[#e10600]">
              {/* Image Box */}
              <div className="flex-1 flex items-end justify-center relative z-10 ">
                <img
                  key={hoveredDriver.name}
                  src={getDriverImage(hoveredDriver.name)}
                  alt={hoveredDriver.name}
                  className="w-full h-full object-contain object-bottom filter contrast-125 saturate-110"
                  onError={(e) => {
                    e.currentTarget.src = "/logos/F1.svg";
                    e.currentTarget.className =
                      "w-1/2 h-1/2 object-contain opacity-40 mb-10";
                  }}
                />
              </div>
              {/* Name Box */}
              <div className="w-full bg-[#1a1a1a] py-4 md:py-6 text-center z-20">
                <span className="text-white font-akira text-sm md:text-xl uppercase tracking-wider">
                  {hoveredDriver.name}
                </span>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-2 bg-[#e10600] z-20"></div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
