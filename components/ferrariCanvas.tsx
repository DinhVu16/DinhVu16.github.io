import { SceneManager } from "../renders/ferrari";
import { startMainShow } from "../hook/hero-anim";
import { PinTrigger } from "../hook/pin_trigger";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";

export default function FerrariCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<SceneManager | null>(null);

  useGSAP(() => {
    let isCancelled = false;
    const setup = async () => {
      // Initialize only if we have the container
      if (!containerRef.current) return;

      const engine = new SceneManager(containerRef.current);
      engineRef.current = engine;

      await engine.init();

      // Only start if the user hasn't already clicked a link
      if (!isCancelled) {
        startMainShow(engine);
        if (triggerRef.current)
          PinTrigger(containerRef.current, triggerRef.current);
      } else {
        engine.cleanup(containerRef.current);
      }
    };

    setup();

    return () => {
      isCancelled = true;
      if (engineRef.current) {
        engineRef.current.cleanup(containerRef.current!);
        engineRef.current = null;
      }
    };
  });
  return (
    <div
      ref={triggerRef}
      className="w-full bg-transparent z-1 absolute h-screen"
    >
      <div
        ref={containerRef}
        className="w-full h-screen flex items-center justify-center z-0"
      ></div>
    </div>
  );
}