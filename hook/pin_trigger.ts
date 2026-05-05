import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const PinTrigger = (
  canvasContainer: HTMLElement,
  scrollRef: HTMLElement,
) => {
  ScrollTrigger.create({
    trigger: scrollRef,
    start: "top top",
    end: "bottom top",

    pin: canvasContainer,
    pinSpacing: false,
  });
};
