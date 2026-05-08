"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother"; // Note: This is a Club GreenSock (Premium) plugin
import { useGSAP } from "@gsap/react";

// Register the plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, useGSAP);
}

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Initialize the smooth scroller
      const smoother = ScrollSmoother.create({
        wrapper: wrapperRef.current,
        content: contentRef.current,
        smooth: 1.5, // How long it takes to "catch up" (seconds)
        effects: true, // Enables data-speed and data-lag parallax effects
        smoothTouch: 0.1, // Slight smoothing on touch devices (keep this low!)
      });

      // Optional: Refresh ScrollTrigger when the route changes or images load
      ScrollTrigger.refresh();

      return () => {
        smoother.kill(); // Cleanup when unmounted
      };
    },
    { scope: wrapperRef }
  );

  return (
    <div ref={wrapperRef} id="smooth-wrapper">
      <div ref={contentRef} id="smooth-content">
        {children}
      </div>
    </div>
  );
}