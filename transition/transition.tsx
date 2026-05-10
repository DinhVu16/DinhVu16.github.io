"use client";

import { useRef, startTransition } from "react";
import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/dist/DrawSVGPlugin";
import { useGSAP } from "@gsap/react";
import { TransitionRouter } from "next-transition-router";

import { ReactSVG } from "react-svg";

if (typeof window !== "undefined") {
  gsap.registerPlugin(DrawSVGPlugin, useGSAP);
}

export default function TransitionFunc({
  children,
}: {
  children: React.ReactNode;
}) {
  const container = useRef<HTMLDivElement | null>(null);
  const masterScaleRef = useRef<HTMLDivElement | null>(null);
  const holePlugRef = useRef<HTMLDivElement | null>(null);
  const bgRef = useRef<HTMLDivElement | null>(null);

  // 1. SAFE HIDE ON MOUNT
  // We use GSAP to hide the container on the first load instead of Tailwind.
  // This prevents the initial flash but keeps it in the DOM so DrawSVG can measure it.
  useGSAP(
    () => {
      gsap.set(container.current, { autoAlpha: 0 });
    },
    { scope: container },
  );

  return (
    <TransitionRouter
      auto={true}
      leave={(next) => {
        const tl = gsap.timeline({ onComplete: next });

        // 0. THE HARD RESET
        tl.set(masterScaleRef.current, { scale: 1 })
          .set(holePlugRef.current, { opacity: 1, yPercent: 50 })
          .set(".f1-path", {
            stroke: "#ee2e25",
            strokeWidth: 4,
            fill: "transparent",
            drawSVG: "0%",
            yPercent: 50,
          })
          .set(bgRef.current, { opacity: 1, yPercent: 20 })

          // 1. ACTIVATE TRANSITION SCREEN: The Wiping Mask
          // We use a polygon clip-path. It starts squeezed to 0% width on the left edge.
          .set(container.current, {
            autoAlpha: 1,
            clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
          })
          // We expand the right edge of the polygon to 100%, revealing the static scene inside.
          .to(container.current, {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            duration: 0.8,
            ease: "power4.inOut",
          })
          .to(
            bgRef.current,
            { yPercent: 0, duration: 1, ease: "power2.out" },
            "<",
          )
          .to(
            holePlugRef.current,
            {
              yPercent: 0,
              duration: 1.3,
              ease: "power2.Out",
            },
            "<",
          )
          .to(
            ".f1-path",
            {
              yPercent: 0,
              duration: 1.5,
              ease: "power2.Out",
            },
            "<",
          )

          // 2. THE DRAW SEQUENCE
          // Starts right as the mask finishes wiping across the logo
          .to(
            ".f1-path",
            {
              drawSVG: "100%",
              duration: 1,
              stagger: 0.1,
              ease: "power1.inOut",
            },
            "-=1",
          )
          .to(
            ".f1-path",
            { fill: "#ee2e25", duration: 0.5, ease: "power2.out" },
            "+=0.1",
          );

        return () => tl.kill();
      }}
      enter={(next) => {
        const tl = gsap
          .timeline()

          // 3. THE BREATHER
          .to({}, { duration: 1 })

          // 4. OPEN THE PORTAL
          .to(".f1-path", {
            fill: "transparent",
            stroke: "transparent",
            duration: 0.3,
            ease: "power2.inOut",
          })
          .to(
            holePlugRef.current,
            {
              opacity: 0,
              duration: 0.3,
              ease: "power2.inOut",
            },
            "<",
          )

          // 5. THE FLY-THROUGH
          .to(
            masterScaleRef.current,
            {
              scale: 70,
              transformOrigin: "50% 48%",
              duration: 0.6,
              ease: "expo.in",
            },
            "-=0.2",
          )
          .to(
            bgRef.current,
            {
              opacity: 0,
              duration: 0.4,
              ease: "power2.out",
            },
            "-=0.4",
          )

          // 6. GARBAGE COLLECTION
          // Hide it and clear the clipPath so it doesn't break future layout measurements
          .set(container.current, { autoAlpha: 0, clearProps: "clipPath" })
          .call(() => {
            requestAnimationFrame(() => startTransition(next));
          });

        return () => tl.kill();
      }}
    >
      {children}

      <div
        ref={container}
        className="fixed inset-0 z-9999 pointer-events-none flex items-center justify-center overflow-hidden"
      >
        <div
          ref={masterScaleRef}
          className="relative w-full h-full flex items-center justify-center origin-center will-change-transform"
        >
          {/* THE INVERSE MASK */}
          <div
            className="absolute inset-0 bg-[#ffffff]"
            style={{
              WebkitMaskImage: `url('/trans-items/F1-trans.svg'), linear-gradient(black, black)`,
              WebkitMaskPosition: "center, center",
              WebkitMaskRepeat: "no-repeat, no-repeat",
              WebkitMaskSize: "12rem auto, 100% 100%",
              WebkitMaskComposite: "xor",
              maskImage: `url('/trans-items/F1-trans.svg'), linear-gradient(black, black)`,
              maskPosition: "center, center",
              maskRepeat: "no-repeat, no-repeat",
              maskSize: "12rem auto, 100% 100%",
              maskComposite: "exclude",
            }}
          />

          {/* THE HOLE PLUG */}
          <div ref={holePlugRef} className="absolute w-75 h-75 bg-[#ffffff]" />

          {/* THE SVG INJECTOR */}
          <div className="absolute inset-0 flex items-center justify-center">
            <ReactSVG
              src="/trans-items/F1-trans.svg"
              afterInjection={(svg) => {
                // Just tag the paths and hide them. The routers will handle the rest.
                if (svg) {
                  const paths = svg.querySelectorAll(
                    "path, line, polyline, circle, rect",
                  );
                  paths.forEach((path) => path.classList.add("f1-path"));
                  gsap.set(paths, {
                    fill: "transparent",
                    stroke: "transparent",
                  });
                }
              }}
              onError={(error) => console.error(error)}
              className="w-48 h-auto"
            />
          </div>
        </div>
      </div>
    </TransitionRouter>
  );
}
