import gsap, { random } from "gsap";
import * as THREE from "three";

export const Lightflash = (camera: THREE.Camera, light: THREE.Light) => {
  const tl = gsap.timeline({ repeat: 1, delay:1 });
  tl.to(light, { intensity: 8, duration: 0.2, ease: "power2.inOut", delay: 1}, "<"); // "<" starts at same time as previous
  tl.to(light, { intensity: 2, duration: 0.1, ease: "power2.inOut" }, ">");
  tl.to(
    light,
    {
      intensity: 8,
      duration: 0.05,
      yoyo: true,
      ease: "power2.inOut",
      repeat: 2,
    },
    ">",
  );
  return tl; 
};



