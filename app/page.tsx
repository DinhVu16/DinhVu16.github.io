"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Tracks from "../components/tracks";
import Championships from "../components/championship";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const teams = [
  {
    name: "Mercedes",
    bg: "/img/1.png",
    route: "/teams/mercedes",
    logo: "/logos/mercedes.svg",
    glowColor: "rgba(0, 210, 190, 0.6)",
  },
  {
    name: "Red Bull",
    bg: "/img/2.png",
    route: "/teams/redbull",
    logo: "/logos/redbull.svg",
    glowColor: "rgba(6, 0, 239, 0.5)",
  },
  {
    name: "Ferrari",
    bg: "/img/3.png",
    route: "/teams/ferrari",
    logo: "/logos/ferrari.svg",
    glowColor: "rgba(220, 0, 0, 0.6)",
  },
  {
    name: "McLaren",
    bg: "/img/4.png",
    route: "/teams/mclaren",
    logo: "/logos/mclaren.svg",
    glowColor: "rgba(255, 135, 0, 0.6)",
  },
  {
    name: "Racing Point",
    bg: "/img/5.png",
    route: "/teams/racingpoint",
    logo: "/logos/racingpoint.svg",
    glowColor: "rgba(245, 150, 200, 0.6)",
  },
  {
    name: "Renault",
    bg: "/img/6.png",
    route: "/teams/renault",
    logo: "/logos/renault.svg",
    glowColor: "rgba(255, 212, 0, 0.6)",
  },
  {
    name: "AlphaTauri",
    bg: "/img/7.png",
    route: "/teams/alphatauri",
    logo: "/logos/alphatauri.svg",
    glowColor: "rgba(255, 255, 255, 0.6)",
  },
  {
    name: "Alfa Romeo",
    bg: "/img/8.png",
    route: "/teams/alfaromeo",
    logo: "/logos/alfaromeo.svg",
    glowColor: "rgba(255, 255, 255, 0.5)",
  },
  {
    name: "Haas F1",
    bg: "/img/9.png",
    route: "/teams/haas",
    logo: "/logos/haas.svg",
    glowColor: "rgba(255, 255, 255, 0.5)",
  },
  {
    name: "Williams",
    bg: "/img/10.png",
    route: "/teams/williams",
    logo: "/logos/williams.svg",
    glowColor: "rgba(0, 160, 222, 0.6)",
  },
];

export default function Home() {
  const mainRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLElement>(null);
  useEffect(() => {
    // 1. Tell the browser NOT to restore the previous scroll position
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    // 2. Instantly snap the window to the very top before anything renders
    window.scrollTo(0, 0);
  }, []);
  const total = teams.length;
  const baseWidth = 100 / total;
  const hoverWidth = 25;

  const getClipPath = (index: number, hIndex: number) => {
    if (hIndex === -1) {
      return `polygon(${index * baseWidth}% 0%, ${(index + 1) * baseWidth}% 0%, ${(index + 1) * baseWidth}% 100%, ${index * baseWidth}% 100%)`;
    }
    const minRestWidth = 5;
    const idealLeft = hIndex * baseWidth + baseWidth / 2 - hoverWidth / 2;
    const minLeft = hIndex * minRestWidth;
    const maxLeft = 100 - hoverWidth - (total - 1 - hIndex) * minRestWidth;
    const leftEdge = Math.max(minLeft, Math.min(idealLeft, maxLeft));
    const rightEdge = leftEdge + hoverWidth;

    if (index === hIndex) {
      return `polygon(${leftEdge}% 0%, ${rightEdge}% 0%, ${rightEdge}% 100%, ${leftEdge}% 100%)`;
    }
    if (index < hIndex) {
      const wL = leftEdge / hIndex;
      return `polygon(${index * wL}% 0%, ${(index + 1) * wL}% 0%, ${(index + 1) * wL}% 100%, ${index * wL}% 100%)`;
    }
    const wR = (100 - rightEdge) / (total - 1 - hIndex);
    const offset = rightEdge + (index - hIndex - 1) * wR;
    return `polygon(${offset}% 0%, ${offset + wR}% 0%, ${offset + wR}% 100%, ${offset}% 100%)`;
  };

  const getLogoCenter = (index: number, hIndex: number) => {
    if (hIndex === -1) {
      return index * baseWidth + baseWidth / 2;
    }
    const minRestWidth = 5;
    const idealLeft = hIndex * baseWidth + baseWidth / 2 - hoverWidth / 2;
    const minLeft = hIndex * minRestWidth;
    const maxLeft = 100 - hoverWidth - (total - 1 - hIndex) * minRestWidth;
    const leftEdge = Math.max(minLeft, Math.min(idealLeft, maxLeft));
    const rightEdge = leftEdge + hoverWidth;

    if (index === hIndex) {
      return leftEdge + hoverWidth / 2;
    }
    if (index < hIndex) {
      const wL = leftEdge / hIndex;
      return index * wL + wL / 2;
    }
    const wR = (100 - rightEdge) / (total - 1 - hIndex);
    return rightEdge + (index - hIndex - 1) * wR + wR / 2;
  };

  const { contextSafe } = useGSAP(
    () => {
      // 1. Smooth GSAP Entrance Animation
      gsap.fromTo(
        ".slice",
        { y: "5vh", opacity: 0 },
        {
          y: "0vh",
          opacity: 1,
          duration: 1.2,
          stagger: 0.05,
          ease: "power3.out",
          overwrite: "auto",
        },
      );

      // 2. Topbar Hide & Reveal Logic
      const topbar = document.getElementById("f1-topbar");
      let trigger: ScrollTrigger | null = null; // Store a reference to the trigger

      if (topbar) {
        gsap.set(topbar, {
          yPercent: -100,
          autoAlpha: 0,
        });

        trigger = ScrollTrigger.create({
          trigger: heroRef.current,
          start: "75% top",
          onEnter: () => {
            gsap.to(topbar, {
              yPercent: 0,
              autoAlpha: 1,
              duration: 0.45,
              ease: "power3.out",
              overwrite: "auto",
            });
          },
          onLeaveBack: () => {
            gsap.to(topbar, {
              yPercent: -100,
              autoAlpha: 0,
              duration: 0.35,
              ease: "power3.in",
              overwrite: "auto",
            });
          },
        });
      }

      // 3. CLEANUP FUNCTION
      // This runs automatically when the component unmounts (navigating away)
      return () => {
        if (trigger) {
          trigger.kill(); // Destroys the ScrollTrigger, preventing memory leaks
        }
      };
    },
    { scope: mainRef },
  );

  // OPTIMIZED HOVER: Uses GSAP class selectors instead of React Refs to prevent memory leaks during page transitions.
  const handleHover = contextSafe((targetIndex: number) => {
    teams.forEach((_, i) => {
      const isHovered = targetIndex === i;
      const isOtherHovered = targetIndex !== -1 && !isHovered;

      gsap.to(`.slice-${i}`, {
        clipPath: getClipPath(i, targetIndex),
        duration: 0.8,
        ease: "power4.out",
        overwrite: "auto",
      });

      // 1. Only animate the scale on the background image
      gsap.to(`.bg-${i}`, {
        scale: isHovered ? 1.05 : 1,
        duration: 0.8,
        ease: "power4.out",
        overwrite: "auto",
      });

      // 2. Animate the opacity of the black overlay to dim non-hovered items
      gsap.to(`.dimmer-${i}`, {
        opacity: isHovered ? 0 : isOtherHovered ? 0.7 : 0,
        duration: 0.8,
        ease: "power4.out",
        overwrite: "auto",
      });

      gsap.to(`.glow-${i}`, {
        opacity: isHovered ? 0.8 : 0.5, // Glow is always visible, but brighter on hover
        duration: 0.5,
        ease: "power4.out",
        overwrite: "auto",
      });

      gsap.to(`.logo-container-${i}`, {
        left: `${getLogoCenter(i, targetIndex)}%`,
                opacity: isHovered ? 1 : 0, // Only the hovered logo should be visible
        duration: 0.5,
        ease: "power4.out",
        overwrite: "auto",
      });

      gsap.to(`.logo-${i}`, {
        scale: isHovered ? 1.15 : 0.95,
        duration: 0.5,
        ease: "power4.out",
        overwrite: "auto",
      });
    });
  });

  // NEW: F1 2020 ABOUT SECTION ANIMATIONS
  useGSAP(
    () => {
      if (!aboutRef.current) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: aboutRef.current,
          start: "top 75%", // Triggers when the top of the section hits 75% down the screen
          once: true,
        },
      });

      // 1. Draw the top red horizontal line
      tl.fromTo(
        ".about-top-line",
        { scaleX: 0 },
        { scaleX: 1, duration: 0.6, ease: "power3.out" },
      );

      // 2. Sequential Red Box Scan Reveals for the Massive Titles
      const wipeElements = gsap.utils.toArray(
        ".about-wipe-reveal",
      ) as HTMLElement[];
      wipeElements.forEach((el, index) => {
        const block = el.querySelector(".about-block");
        const content = el.querySelector(".about-content");
        if (block && content) {
          gsap.set(block, { width: "0%", left: "0%" });

          // Start the first wipe slightly before the line finishes drawing
          const pos = index === 0 ? "-=0.2" : "-=0.3";

          tl.to(
            block,
            { width: "100%", duration: 0.2, ease: "power4.inOut" },
            pos,
          )
            .set(content, { opacity: 1 })
            .to(block, { left: "100%", duration: 0.2, ease: "power4.inOut" });
        }
      });

      // 3. Smoothly stagger fade-up the editorial text and stats
      tl.fromTo(
        ".about-fade-up",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.15, ease: "power3.out" },
        "-=0.4", // Start fading up while the "SEASON" wipe is finishing
      );
    },
    { scope: aboutRef },
  );

  return (
    <main ref={mainRef} className="w-full relative bg-[#0a0a0a]">
      <div
        id="hero"
        ref={heroRef}
        className="relative w-full h-screen overflow-hidden bg-black z-10"
      >
        {teams.map((team, index) => {
          return (
            <Link
              href={team.route}
              key={index}
              className={`slice slice-${index} absolute top-0 left-0 w-full h-full cursor-pointer z-1 block`}
              style={{
                clipPath: getClipPath(index, -1),
                willChange: "clip-path",
                transform: "translateZ(0)", // Force hardware acceleration
              }}
              onMouseEnter={() => handleHover(index)}
              onMouseLeave={() => handleHover(-1)}
            >
              {/* Background Image Layer */}
              <div
                className={`slice-bg bg-${index} absolute top-0 left-0 w-screen h-screen bg-cover bg-center bg-no-repeat`}
                style={{
                  backgroundImage: `url(${team.bg})`,
                  transform: "scale(1) translateZ(0)",
                  willChange: "transform", // Force hardware acceleration
                }}
              />

              {/* Dimmer Box */}
              <div
                className={`dimmer-${index} absolute inset-0 bg-[#050505] pointer-events-none z-[5]`}
                style={{ opacity: 0, willChange: "opacity" }}
              />

              {/* THE FIX: Hidden on mobile (hidden md:block). Mix-blend-mode melts mobile GPUs. */}
              <div className="slice-tint hidden md:block absolute inset-0 mix-blend-overlay opacity-60 pointer-events-none z-[6]" />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 pointer-events-none z-[10] bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />

              {/* Glow Layer */}
              <div
                className={`glow-${index} absolute top-0 left-0 w-full h-[60vh] pointer-events-none z-20`}
                style={{
                  background: `linear-gradient(to bottom, ${team.glowColor}, transparent)`,
                  opacity: 0.5,
                  willChange: "opacity",
                }}
              />

              {/* Logo Container */}
              <div
                className={`team-logo-container logo-container-${index} absolute top-[15%] flex items-center justify-center z-30 pointer-events-none`}
                style={{
                  height: "110px",
                  left: `${getLogoCenter(index, -1)}%`,
                  transform: "translateX(-50%) translateZ(0)",
                  opacity: 0,
                  willChange: "left, opacity, transform",
                }} // Force hardware acceleration for transform
              >
                <div
                  className={`logo-${index} w-[90px] h-[90px] md:w-[130px] md:h-[130px] flex items-center justify-center relative`}
                  style={{
                    transform: `scale(0.95) translateZ(0)`,
                    willChange: "transform", // Force hardware acceleration
                  }}
                >
                  <Image
                    src={team.logo}
                    alt={team.name}
                    fill
                    style={{ objectFit: "contain" }}
                    sizes="(max-width: 768px) 80px, 130px"
                    className="z-10"
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* NEW: F1 2020 EDITORIAL ABOUT / SUMMARY SECTION (ANIMATED) */}
      <section
        ref={aboutRef}
        className="w-full max-w-[1400px] mx-auto px-6 md:px-[50px] pt-32 pb-24 relative overflow-hidden"
      >
        {/* Giant Background Anchor */}
        <div className="absolute top-0 right-0 text-[18vw] font-akira text-white/[0.02] hover:text-[#e10600]/15 transition-colors duration-500 ease-in-out leading-none select-none z-0 cursor-default">
          2020
        </div>

        <div className="flex flex-col w-full relative z-10">
          {/* TOP ROW: Massive Full-Width Typography */}
          <div className="w-full pointer-events-none flex flex-col gap-2">
            {/* Animated Top Line */}
            <div className="about-top-line w-20 h-[4px] bg-[#e10600] mb-8 md:mb-10 origin-left scale-x-0 pointer-events-auto"></div>

            {/* Word 1: AN */}
            <div className="about-wipe-reveal relative overflow-hidden w-fit pb-1">
              <div className="about-content opacity-0">
                <h2 className="font-akira text-4xl md:text-6xl lg:text-[5rem] xl:text-[6rem] text-white uppercase tracking-wide leading-[1.1] pointer-events-auto">
                  AN
                </h2>
              </div>
              <div
                className="about-block absolute top-0 left-0 h-full bg-[#e10600] z-20"
                style={{ width: "0%" }}
              ></div>
            </div>

            {/* Word 2: UNPRECEDENTED */}
            <div className="about-wipe-reveal relative overflow-hidden w-fit pb-1">
              <div className="about-content opacity-0">
                <h2 className="font-akira text-4xl md:text-6xl lg:text-[5rem] xl:text-[6rem] text-white uppercase tracking-wide leading-[1.1] pointer-events-auto">
                  UNPRECEDENTED
                </h2>
              </div>
              <div
                className="about-block absolute top-0 left-0 h-full bg-[#e10600] z-20"
                style={{ width: "0%" }}
              ></div>
            </div>
          </div>

          {/* BOTTOM ROW: "SEASON" and Text side-by-side */}
          <div className="w-full flex flex-col lg:flex-row justify-between items-start gap-10 lg:gap-12 mt-2 md:mt-4">
            {/* Left Column: Word 3 (SEASON) */}
            <div className="lg:w-5/12 shrink-0">
              <div className="about-wipe-reveal relative overflow-hidden w-fit pb-1">
                <div className="about-content opacity-0">
                  <h2
                    className="w-fit font-akira text-4xl md:text-6xl lg:text-[5rem] xl:text-[6rem] text-transparent hover:text-[#e10600] transition-colors duration-500 ease-in-out uppercase tracking-wide leading-[1.1] cursor-default"
                    style={{ WebkitTextStroke: "2px #e10600" }}
                  >
                    SEASON
                  </h2>
                </div>
                <div
                  className="about-block absolute top-0 left-0 h-full bg-[#e10600] z-20"
                  style={{ width: "0%" }}
                ></div>
              </div>
            </div>

            {/* Right Column: Editorial Text & Mini-Stats (Stagger Fade Up) */}
            <div className="lg:w-7/12 flex flex-col gap-10 lg:pt-4">
              {/* Paragraph 1 */}
              <div className="about-fade-up opacity-0 flex gap-6">
                <div className="w-[2px] bg-[#e10600] shrink-0 mt-2 h-10"></div>
                <p className="font-inter text-white/80 text-sm md:text-base leading-[1.8] tracking-wide">
                  The 2020 FIA Formula One World Championship was a season
                  unlike any other. Originally planned as a record-breaking
                  22-race calendar, the global pandemic forced a complete
                  restructuring of the sport.
                </p>
              </div>

              {/* Paragraph 2 */}
              <div className="about-fade-up opacity-0 flex gap-6">
                <div className="w-[2px] bg-[#e10600] shrink-0 mt-2 h-10"></div>
                <p className="font-inter text-white/80 text-sm md:text-base leading-[1.8] tracking-wide">
                  What emerged was a grueling, highly compressed sprint across
                  Europe and the Middle East. It featured dramatic
                  double-headers, relentless triple-headers, and the return of
                  unexpected classic circuits like Imola, Istanbul Park, and the
                  Nürburgring. Against all odds, history was rewritten as
                  long-standing records were shattered on the track.
                </p>
              </div>

              {/* Clean Data Bar */}
              <div className="about-fade-up opacity-0 flex justify-between items-end pt-8 border-t border-white/10 mt-2">
                <div className="flex flex-col gap-2">
                  <span className="font-akira text-3xl md:text-5xl text-white">
                    17
                  </span>
                  <span className="font-orbitron text-[10px] md:text-xs text-white/50 uppercase tracking-[0.2em]">
                    Races
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="font-akira text-3xl md:text-5xl text-white">
                    4
                  </span>
                  <span className="font-orbitron text-[10px] md:text-xs text-white/50 uppercase tracking-[0.2em]">
                    New Tracks
                  </span>
                </div>
                <div className="flex flex-col gap-2 text-right">
                  <span className="font-akira text-3xl md:text-5xl text-[#e10600]">
                    1
                  </span>
                  <span className="font-orbitron text-[10px] md:text-xs text-[#e10600]/80 uppercase tracking-[0.2em]">
                    Pandemic
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10 bg-transparent">
        <Tracks />
        <Championships />
      </div>

      {/* NEW: FOOTER AS A MASSIVE BUTTON WITH PERFECT LAYOUT PACING */}
      <footer
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="group w-full h-[160px] bg-[#000000] border-t border-white/10 py-8 px-6 md:px-[50px] flex justify-center relative z-20 overflow-hidden cursor-pointer"
      >
        {/* THE STEEP CONTINUOUS CHEVRON PATTERN (Comfortable 15s speed) */}
        <style>{`
            @keyframes scrollContinuousChevron {
              from { background-position: center 0px; }
              to { background-position: center -1600px; } 
            }
            .animate-continuous-chevron {
              background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'%3E%3Cpath d='M0,0 L50,-50 L100,0 L100,6.25 L50,-43.75 L0,6.25 Z M0,12.5 L50,-37.5 L100,12.5 L100,18.75 L50,-31.25 L0,18.75 Z M0,25 L50,-25 L100,25 L100,31.25 L50,-18.75 L0,31.25 Z M0,37.5 L50,-12.5 L100,37.5 L100,43.75 L50,-6.25 L0,43.75 Z M0,50 L50,0 L100,50 L100,56.25 L50,6.25 L0,56.25 Z M0,62.5 L50,12.5 L100,62.5 L100,68.75 L50,18.75 L0,68.75 Z M0,75 L50,25 L100,75 L100,81.25 L50,31.25 L0,81.25 Z M0,87.5 L50,37.5 L100,87.5 L100,93.75 L50,43.75 L0,93.75 Z M0,100 L50,50 L100,100 L100,106.25 L50,56.25 L0,106.25 Z M0,112.5 L50,62.5 L100,112.5 L100,118.75 L50,68.75 L0,118.75 Z M0,125 L50,75 L100,125 L100,131.25 L50,81.25 L0,131.25 Z M0,137.5 L50,87.5 L100,137.5 L100,143.75 L50,93.75 L0,143.75 Z' fill='%23ffffff'/%3E%3C/svg%3E");
              background-size: 200vw 1600px; 
              background-repeat: repeat-y; 
              
              animation: scrollContinuousChevron 45s linear infinite; 
              animation-play-state: paused;
              transform: translateZ(0);
            }
          .group:hover .animate-continuous-chevron {
              /* Only run the heavy animation when the user actually hovers */
              animation-play-state: running;
            }
          `}</style>

        {/* THE PATTERN LAYER */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out z-0 pointer-events-none animate-continuous-chevron" />

        {/* CONTENT WRAPPER: 3-Column Layout with items-end to lock baselines */}
        <div className="w-full max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center md:items-end gap-12 md:gap-4 relative z-10 mix-blend-difference pointer-events-none">
          {/* Left Column: Branding */}
          <div className="flex flex-col items-center md:items-start gap-3 flex-1 basis-0 w-full">
            <Image
              src="/logos/F1.svg"
              alt="Foxil F1 Archive"
              width={70}
              height={24}
              className="brightness-0 invert mb-2"
            />
            <h2 className="font-akira text-2xl md:text-3xl text-[#ffffff] tracking-[0.15em]">
              ARCHIVE 2020
            </h2>
            <p className="font-orbitron text-[#ffffff] text-[10px] tracking-[0.2em] uppercase text-center md:text-left opacity-80">
              Curated & Designed by Beostudio
            </p>
          </div>

          {/* Center Column: Return to Top */}
          <div className="flex justify-center items-end flex-1 basis-0 w-full pb-1">
            <span className="font-akira text-[#ffffff] text-sm md:text-base tracking-[0.2em] uppercase group-hover:-translate-y-2 transition-transform duration-500 ease-out">
              return to top
            </span>
          </div>

          {/* Right Column: Disclaimer */}
          <div className="flex justify-center md:justify-end flex-1 basis-0 w-full pb-4">
            <p className="w-full md:max-w-[440px] font-inter text-[#ffffff] text-[10px] md:text-[10.5px] leading-[1.8] uppercase tracking-wider text-center md:text-right">
              This website is an unofficial portfolio piece and is not
              associated in any way with the Formula 1 companies. F1, FORMULA
              ONE, FORMULA 1, FIA FORMULA ONE WORLD CHAMPIONSHIP, GRAND PRIX and
              related marks are trade marks of Formula One Licensing B.V.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
