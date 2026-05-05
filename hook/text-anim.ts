import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/all";
import { ScrambleTextPlugin } from "gsap/all";
gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(SplitText);
gsap.registerPlugin(ScrambleTextPlugin) 

export const FloatinByText = (targets: gsap.DOMTarget) => {
  const chars = SplitText.create(targets, { type: "chars" });
  gsap.from(chars.chars, {
    scrollTrigger: {
      trigger: targets,
      toggleActions: "restart pause resume pause",
      start: "top-=150% bottom",
    },
    yPercent: 150,
    opacity: 0,
    duration: 1,
    stagger: 0.05,
    ease: "power2.out",
  });
};

export const DecodeText = (targets: gsap.DOMTarget) => {
  gsap.to(targets, {
    scrollTrigger: {
      trigger: targets,
      toggleActions: "restart pause resume pause",
      start: "top bottom",
    },
    scrambleText: {
      text: "{original}",
      chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      speed: 0.5,
    },
    duration: 1.5,
  });
};
