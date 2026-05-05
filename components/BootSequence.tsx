"use client";

import { useRef, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

let isInitialAppLoad = true;

export default function DotBootSequence() {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);

  const dotRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressLineRef = useRef<HTMLDivElement>(null);
  const progressTextRef = useRef<HTMLSpanElement>(null);
  const f1LogoBoxRef = useRef<HTMLDivElement>(null);
  const progressTextContainerRef = useRef<HTMLDivElement>(null); 
  const progressTrackRef = useRef<HTMLDivElement>(null); 

  const [shouldRender, setShouldRender] = useState(false);

  // === THE FIX IS HERE ===
  useEffect(() => {
    const isFirst = isInitialAppLoad;
    isInitialAppLoad = false;
    
    // Only set shouldRender to true if it's the first load AND we are exactly on the home page
    if (isFirst && pathname === "/") {
      setShouldRender(true);
    }
  }, [pathname]); // Added pathname as a dependency
  // =======================

  useGSAP(
    () => {
      if (!shouldRender) return;

      const tl = gsap.timeline({
        onComplete: () => setShouldRender(false),
      });

      // 0. THE PHYSICS STATE
      const physics = {
        t: 0,
        cy: 0,
      };

      // THE MATH RENDERER
      const renderDot = () => {
        if (!dotRef.current) return;
        const baseAngle = physics.t * Math.PI * 6;
        const FRICTION = 0.7;
        const angle = -Math.PI / 2 + baseAngle - FRICTION * Math.sin(baseAngle);
        const r = 100;

        gsap.set(dotRef.current, {
          x: Math.cos(angle) * r,
          y: physics.cy + Math.sin(angle) * r,
        });
      };

      // 0. INITIAL SETUP
      tl.set(progressBarRef.current, { autoAlpha: 0 })
        .set(progressLineRef.current, {
          scaleX: 0,
          transformOrigin: "left center",
        })
        .set(f1LogoBoxRef.current, {
          autoAlpha: 0,
          xPercent: -50,
          yPercent: -50,
        })
        .set(dotRef.current, { scale: 0 });

      renderDot();

      // 1. THE POP IN
      tl.to(
        dotRef.current,
        {
          scale: 1,
          duration: 0.6,
          ease: "back.out(2)",
        },
        "start",
      ).to(
        progressBarRef.current,
        {
          autoAlpha: 1,
          duration: 0.6,
          ease: "power2.out",
        },
        "start+=0.4",
      );

      // 2. THE ORBIT (Exactly 3.0 Seconds)
      const progressProxy = { val: 0 };
      tl.add("spin");

      tl.to(
        physics,
        {
          t: 1,
          duration: 3.0,
          ease: "none",
          onUpdate: renderDot,
        },
        "spin",
      )
        .to(
          progressLineRef.current,
          {
            scaleX: 1,
            duration: 3.0,
            ease: "power2.inOut",
          },
          "spin",
        )
        .to(
          progressProxy,
          {
            val: 100,
            duration: 3.0,
            ease: "power2.inOut",
            onUpdate: () => {
              if (progressTextRef.current)
                progressTextRef.current.textContent = `${Math.floor(progressProxy.val)}%`;
            },
          },
          "spin",
        );

      // 3. THE PERFECT SPIRAL HOOK
      tl.add("hook", "spin+=2.65");

      tl.to(
        physics,
        {
          cy: -40,
          duration: 0.35,
          ease: "power2.out",
          onUpdate: renderDot,
        },
        "hook",
      );

      // 4. THE GRAVITY DROP (Solid bowling ball drop. No squash or stretch.)
      tl.add("drop", "spin+=2.8");

      tl.to(
        physics,
        {
          cy: 68,
          duration: 0.2,
          ease: "power2.in",
          onUpdate: renderDot,
        },
        "drop",
      );

      // 5. THE IMPACT: THE KINETIC SKID
      tl.add("impact", "drop+=0.2");

      tl.set(dotRef.current, { autoAlpha: 0 }, "impact");

      // Spawn the logo slightly left, tilted, and pushed DOWN into the floor by the heavy impact
      tl.set(
        f1LogoBoxRef.current,
        {
          autoAlpha: 1,
          yPercent: 30, // Plunged slightly past center into the ground
        },
        "impact",
      )

        // The Horizontal Skid (Sliding to the right due to momentum)
        .to(
          f1LogoBoxRef.current,
          {
            yPercent: -50,
            duration: 0.5,
            ease: "elastic.out(1.3,0.7)",
          },
          "impact",
        )
        .to(
          containerRef.current,
          {
            backgroundColor: "#FFFFFF", // Flash to pure white instantly
            duration: 0.05, // 50 milliseconds (lightning fast)
            ease: "none",
          },
          "impact",
        )
        .to(
          progressTextContainerRef.current,
          {
            color: "#000000",
            mixBlendMode: "normal", // Kills the inversion so it stays strictly black
            duration: 0.05,
            ease: "none",
          },
          "impact",
        )
        .to(
          progressLineRef.current,
          {
            backgroundColor: "#000000", // Snaps the red progress line to black
            duration: 0.05,
            ease: "none",
          },
          "impact",
        )
        .to(
          progressTrackRef.current,
          {
            backgroundColor: "rgba(0,0,0,0.15)", // Darkens the faint track so the black line stands out
            duration: 0.05,
            ease: "none",
          },
          "impact",
        );

      // 6. THE EXIT MASK (10 Vertical Strips Wipe Up)
      const maskStrips = Array.from({ length: 10 }, () => ({ y: 0 }));
      tl.add("exit", "impact+=0.6");

      tl.to(progressBarRef.current, { autoAlpha: 0, duration: 0.4 }, "exit").to(
        maskStrips,
        {
          y: -110,
          duration: 1.2,
          stagger: {
            amount: 0.5,
            from: "start", // Strictly typed to prevent TS errors
          },
          ease: "expo.inOut",
          onUpdate: () => {
            if (!containerRef.current) return;

            // Strictly typed arrays
            const images: string[] = [];
            const sizes: string[] = [];
            const positions: string[] = [];

            maskStrips.forEach((strip, i) => {
              images.push(`linear-gradient(black, black)`);
              sizes.push(`10.5vw 100vh`);
              positions.push(`${i * 10}vw ${strip.y}vh`);
            });

            const maskImage = images.join(", ");
            const maskSize = sizes.join(", ");
            const maskPosition = positions.join(", ");

            containerRef.current.style.maskImage = maskImage;
            containerRef.current.style.maskSize = maskSize;
            containerRef.current.style.maskPosition = maskPosition;
            containerRef.current.style.maskRepeat = "no-repeat";

            containerRef.current.style.webkitMaskImage = maskImage;
            containerRef.current.style.webkitMaskSize = maskSize;
            containerRef.current.style.webkitMaskPosition = maskPosition;
            containerRef.current.style.webkitMaskRepeat = "no-repeat";
          },
        },
        "exit",
      );
    },
    { scope: containerRef, dependencies: [shouldRender] },
  );

  if (!shouldRender) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[99999] bg-[#050505] text-[#E0E0E0] pointer-events-auto overflow-hidden"
    >
      {/* THE RIG LAYER */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {/* CENTER ANCHOR: THE DOT */}
        <div className="absolute top-[50%] left-[50%] w-0 h-0">
          <div
            ref={dotRef}
            className="absolute w-6 h-6 bg-[#ffffff] rounded-full will-change-transform"
            style={{ top: "-8px", left: "-8px" }}
          />
        </div>

        {/* CENTER ANCHOR: THE FINAL F1 LOGO */}
        <div
          ref={f1LogoBoxRef}
          className="absolute top-[50%] left-[50%] w-32 md:w-48 z-[999] will-change-transform"
        >
          <img
            src="/trans-items/F1-trans.svg"
            alt="F1 Logo"
            className="w-full h-auto object-contain block"
          />
        </div>
      </div>

      {/* THE BOTTOM PROGRESS BAR */}
      <div
        ref={progressBarRef}
        className="absolute bottom-18 left-0 w-full px-36 flex flex-col gap-4 z-30 invisible"
      >
        <div ref={progressTextContainerRef} className="w-full flex justify-between font-mono tracking-widest text-white">
          <span>SYS.LOADING</span>
          <span ref={progressTextRef}>0%</span>
        </div>
        <div ref={progressTrackRef} className="w-full h-[1px] bg-white/20 relative">
          <div
            ref={progressLineRef}
            className="absolute top-0 left-0 w-full h-full bg-[#ffffff] will-change-transform"
          />
        </div>
      </div>
    </div>
  );
}