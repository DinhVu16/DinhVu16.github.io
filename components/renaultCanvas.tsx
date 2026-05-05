"use client";

import { SceneManager } from "../renders/ferrari";
import { startMainShow, triggerCameraView } from "../hook/hero-anim";
import { useMemo, useRef, useState } from "react";
import type { CSSProperties, RefObject } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrambleTextPlugin, SplitText } from "gsap/all";

gsap.registerPlugin(SplitText, ScrambleTextPlugin);

/*
  =========================================================
  EASY EDIT AREA
  Sau này muốn nhân bản cho xe khác, bạn chỉ cần sửa 3 phần:
  1. TEAM_MODEL
  2. TEAM_THEME
  3. VIEW_DATA
  =========================================================
*/

type ViewKey = "side" | "front" | "cockpit";
type TextEffect = "blink-slide" | "decode-slide" | "float" | "blur";
type TitleLayer = "behind-car" | "front-car";

type CanvasTheme = {
  sectionBackground: string;
  cinematicBar: string;

  // Màu chữ title lớn riêng
  backgroundTitleColor: string; // chữ FERRARI
  viewTitleColor: string; // chữ SF1000, SIDE, DETAIL...

  mainText: string;
  line: string;

  buttonActiveBg: string;
  buttonActiveText: string;
  buttonActiveBorder: string;

  buttonIdleBg: string;
  buttonIdleText: string;
  buttonIdleBorder: string;
};

type TeamModelConfig = {
  modelPath: string;
  lightColor: number;
  lightIntensity: number;
  ambientLightColor: number;
  ambientIntensity: number;
};

type ViewConfig = {
  title: string;
  titleColor?: string;
  subtitle: string;
  labelLeft: string;
  labelRight: string;
  showLine: boolean;
  titleLayer: TitleLayer;
  leftLabelClass: string;
  rightLabelClass: string;
  titleContainerClass: string;
  titleClass: string;
  textEffect: TextEffect;
  exitAnim: gsap.TweenVars;
  canvasShift: string;
};

export type TeamCanvasProps = {
  /** Đổi nhanh nền/chữ/nút từ page.tsx nếu cần */
  theme?: Partial<CanvasTheme>;

  /** Đổi nhanh model từ page.tsx nếu cần */
  model?: Partial<TeamModelConfig>;
};

// 1) MODEL: đổi đường dẫn model tại đây khi nhân bản sang xe khác.
const TEAM_MODEL: TeamModelConfig = {
  modelPath: "../models/ferrari",
  lightColor: 0xffffff,
  lightIntensity: 5.2,
  ambientLightColor: 0xffffff,
  ambientIntensity: 0.85,
};

// 2) THEME: toàn bộ màu của section nằm ở đây.
const TEAM_THEME: CanvasTheme = {
  sectionBackground:
    "linear-gradient(180deg, #E10600 0%, #D40000 50%, #8B0000 100%)",

  cinematicBar: "#FFFFFF",

  backgroundTitleColor: "rgba(255, 255, 255, 0.24)", // FERRARI phía sau
  viewTitleColor: "rgba(255, 255, 255, 0.52)", // SF1000

  mainText: "#FFFFFF",
  line: "#FFFFFF",

  buttonActiveBg: "#FFFFFF",
  buttonActiveText: "#111111",
  buttonActiveBorder: "#FFFFFF",

  buttonIdleBg: "rgba(255, 255, 255, 0.08)",
  buttonIdleText: "#FFFFFF",
  buttonIdleBorder: "rgba(255, 255, 255, 0.35)",
};

// 3) TEXT / LAYOUT: sửa nội dung từng góc nhìn tại đây.
const VIEW_DATA: Record<ViewKey, ViewConfig> = {
  side: {
    title: "FERRARI",
    titleColor: "rgba(255, 255, 255, 0.24)",
    subtitle: "SCUDERIA FERRARI",
    labelLeft: "LEGACY SINCE 1929",
    labelRight: "MARANELLO, ITALY",
    showLine: true,
    titleLayer: "behind-car",
    leftLabelClass: "absolute top-[14vh] left-[5vw] overflow-hidden pb-2 pr-4",
    rightLabelClass: "absolute top-[14vh] right-[5vw] overflow-hidden pb-2 pr-4",
    titleContainerClass:
      "absolute inset-0 flex flex-col items-center justify-center font-akira",
    titleClass:
      "font-black uppercase tracking-wide leading-none text-[15vw]",
    textEffect: "blink-slide",
    exitAnim: {
      y: 220,
      duration: 0.5,
      stagger: 0.08,
      ease: "power2.inOut",
    },
    canvasShift: "0vw",
  },

  front: {
    title: "SF1000",
    subtitle: "Scarlet Legacy",
    titleColor: "#ffffff",
    labelLeft: "CHASSIS",
    labelRight: "2020 SEASON",
    showLine: false,
    titleLayer: "behind-car",
    leftLabelClass: "absolute top-[8vh] left-[5vw] overflow-hidden pb-2 pr-4",
    rightLabelClass: "absolute top-[8vh] right-[5vw] overflow-hidden pb-2 pr-4",
    titleContainerClass:
      "absolute top-[6vh] right-[7vw] text-right flex flex-col items-end",
    titleClass:
        "font-black uppercase tracking-[0.04em] leading-none text-[13vw] font-akira",
    textEffect: "decode-slide",
    exitAnim: {
      y: 220,
      duration: 0.5,
      stagger: 0.08,
      ease: "power2.inOut",
    },
    canvasShift: "-15vw",
  },

  cockpit: {
    title: '"AERODYNAMICS ARE FOR PEOPLE WHO CAN\'T BUILD ENGINES."',
    titleColor: "#ffffff",
    subtitle: "ENZO FERRARI",
    labelLeft: "",
    labelRight: "",
    showLine: false,
    titleLayer: "front-car",
    leftLabelClass: "absolute top-[12vh] left-[9vw] overflow-hidden pb-2 pr-4",
    rightLabelClass: "absolute top-[12vh] right-[5vw] overflow-hidden pb-2 pr-4",
    titleContainerClass:
      "absolute top-[35vh] w-full flex justify-center flex-col items-center",
    titleClass:
      "text-3xl md:text-5xl text-center max-w-5xl leading-tight font-mono",
    textEffect: "blur",
    exitAnim: {
      scale: 1.05,
      filter: "blur(10px)",
      opacity: 0,
      duration: 0.4,
      ease: "power2.in",
    },
    canvasShift: "0vw",
  },
};

const VIEW_ORDER: ViewKey[] = ["side", "front", "cockpit"];

// Cache theo modelPath để sau này dùng nhiều xe không bị lẫn engine.
const engineCache = new Map<string, SceneManager>();

function mergeModelConfig(model?: Partial<TeamModelConfig>) {
  return { ...TEAM_MODEL, ...model };
}

function mergeTheme(theme?: Partial<CanvasTheme>) {
  return { ...TEAM_THEME, ...theme };
}

function getTextColor(view: ViewConfig, theme: CanvasTheme) {
  return (
    view.titleColor ??
    (view.titleLayer === "behind-car"
      ? theme.backgroundTitleColor
      : theme.viewTitleColor)
  );
}

type TextLayerProps = {
  layer: TitleLayer;
  activeView: ViewKey;
  titleRef: RefObject<HTMLHeadingElement | null>;
  theme: CanvasTheme;
};

function TextLayer({ layer, activeView, titleRef, theme }: TextLayerProps) {
  const data = VIEW_DATA[activeView];
  const isTitleActiveOnThisLayer = data.titleLayer === layer;
  const shouldShowExtraTextOnThisLayer = layer === "front-car";

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className={data.titleContainerClass}>
        <div className="overflow-hidden pb-2 pr-10 pl-10">
          <h1
            ref={isTitleActiveOnThisLayer ? titleRef : null}
            key={`${layer}-${activeView}`}
            className={`${data.titleClass} ${isTitleActiveOnThisLayer ? "opacity-0" : "opacity-0 pointer-events-none select-none"}`}
            style={{ color: data.titleColor ?? getTextColor(data, theme) }}
          >
            {data.title}
          </h1>
        </div>

        {shouldShowExtraTextOnThisLayer && data.showLine && (
          <div className="mt-2 mb-4 flex w-full max-w-[45vw] justify-center overflow-hidden">
            <div
              className="decorative-line h-0.5 w-full origin-center opacity-0 will-change-transform"
              style={{ backgroundColor: theme.line }}
            />
          </div>
        )}

        {shouldShowExtraTextOnThisLayer && data.subtitle && (
          <div className="mt-0 overflow-hidden pr-10 pl-10 text-center">
            <p
              className="text-extra font-akira text-[12px] leading-[1.2] tracking-[0.24em] opacity-0"
              style={{ color: theme.mainText }}
            >
              {data.subtitle}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FerrariCanvas({ theme, model }: TeamCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const barsContainerRef = useRef<HTMLDivElement>(null);
  const topBarRef = useRef<HTMLDivElement>(null);
  const bottomBarRef = useRef<HTMLDivElement>(null);

  const engineRef = useRef<SceneManager | null>(null);
  const [activeView, setActiveView] = useState<ViewKey>("side");
  const [isEngineReady, setIsEngineReady] = useState(false);

  const uiTheme = useMemo(() => mergeTheme(theme), [theme]);
  const modelConfig = useMemo(() => mergeModelConfig(model), [model]);

  // === HOOK 1: setup 3D engine ===
  useGSAP(
    () => {
      let isCancelled = false;

      const setup = async () => {
        if (!containerRef.current) return;

        let engine = engineCache.get(modelConfig.modelPath) ?? null;

        if (!engine) {
          engine = new SceneManager(containerRef.current, modelConfig);
          engineCache.set(modelConfig.modelPath, engine);
          engineRef.current = engine;

          await engine.init();
          engine.precompileShaders();
          engine.warmUpGPU();
        } else {
          engineRef.current = engine;
          containerRef.current.appendChild(engine.renderer.domElement);
        }

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (!isCancelled && engineRef.current) {
              startMainShow(
                engineRef.current,
                topBarRef.current,
                bottomBarRef.current,
                () => setIsEngineReady(true),
              );
            }
          });
        });
      };

      setup();

      return () => {
        isCancelled = true;
        const engine = engineRef.current;

        if (engine && containerRef.current) {
          const canvas = engine.renderer.domElement;
          if (containerRef.current.contains(canvas)) {
            containerRef.current.removeChild(canvas);
          }
        }
      };
    },
    { dependencies: [modelConfig.modelPath] },
  );

  // === HOOK 2: text enter animations ===
  useGSAP(
    () => {
      if (!isEngineReady || !titleRef.current || !triggerRef.current) return;

      const currentData = VIEW_DATA[activeView];
      const titleEl = titleRef.current;
      const uiContainer = triggerRef.current;

      const extras = uiContainer.querySelectorAll(".text-extra");
      const lineEl = uiContainer.querySelector(".decorative-line");
      const splitInstances: SplitText[] = [];

      const allElements = [titleEl, ...Array.from(extras), lineEl].filter(
        Boolean,
      ) as Element[];

      gsap.killTweensOf(allElements);
      gsap.set(allElements, {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
      });

      if (lineEl) {
        gsap.fromTo(
          lineEl,
          { scaleX: 0, opacity: 0 },
          {
            scaleX: 1,
            opacity: 1,
            duration: 1.2,
            ease: "power3.out",
            delay: 0.3,
          },
        );
      }

      if (currentData.textEffect !== "decode-slide" && extras.length > 0) {
        gsap.fromTo(
          extras,
          { opacity: 0, y: 15 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            delay: 0.4,
          },
        );
      }

      if (currentData.textEffect === "blink-slide") {
        gsap.fromTo(
          titleEl,
          { x: -150, opacity: 0 },
          { x: 0, opacity: 1, duration: 1.2, ease: "power3.out" },
        );

        const split = new SplitText(titleEl, { type: "chars" });
        splitInstances.push(split);

        gsap.set(split.chars, { opacity: 0 });
        gsap.to(split.chars, {
          keyframes: [
            { opacity: 1, duration: 0.05 },
            { opacity: 0, duration: 0.05 },
            { opacity: 1, duration: 0.05 },
            { opacity: 0.2, duration: 0.05 },
            { opacity: 1, duration: 0.2 },
          ],
          stagger: 0.08,
          ease: "none",
        });
      }

      if (currentData.textEffect === "decode-slide") {
        const allTextElements = [titleEl, ...Array.from(extras)];

        allTextElements.forEach((el, index) => {
          const textNode = el as HTMLElement;

          gsap.fromTo(
            textNode,
            { y: -220, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 1.2,
              ease: "power3.out",
              delay: index * 0.15,
            },
          );

          const split = new SplitText(textNode, { type: "chars" });
          splitInstances.push(split);

          gsap.to(split.chars, {
            duration: 1.2,
            scrambleText: {
              text: "{original}",
              chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
              speed: 1,
            },
            delay: index * 0.15,
          });
        });
      }

      if (currentData.textEffect === "float") {
        gsap.set(titleEl, { opacity: 1 });
        const split = new SplitText(titleEl, { type: "chars" });
        splitInstances.push(split);
        gsap.from(split.chars, {
          yPercent: 150,
          opacity: 0,
          duration: 1,
          stagger: 0.05,
          ease: "power2.out",
        });
      }

      if (currentData.textEffect === "blur") {
        gsap.fromTo(
          titleEl,
          { scale: 0.95, filter: "blur(10px)", opacity: 0 },
          {
            scale: 1,
            filter: "blur(0px)",
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
          },
        );
      }

      return () => {
        splitInstances.forEach((split) => split.revert());
      };
    },
    { dependencies: [activeView, isEngineReady] },
  );

  const handleViewChange = (view: ViewKey) => {
    if (
      activeView === view ||
      !engineRef.current ||
      !isEngineReady ||
      !triggerRef.current
    ) {
      return;
    }

    triggerCameraView(
      engineRef.current,
      view,
      topBarRef.current,
      bottomBarRef.current,
      barsContainerRef.current,
    );

    gsap.to(containerRef.current, {
      x: VIEW_DATA[view].canvasShift,
      duration: 1.8,
      ease: "power3.inOut",
    });

    const exitTargets = [
      titleRef.current,
      ...Array.from(triggerRef.current.querySelectorAll(".text-extra")),
      ...Array.from(triggerRef.current.querySelectorAll(".decorative-line")),
    ].filter(Boolean);

    gsap.to(exitTargets, {
      ...VIEW_DATA[activeView].exitAnim,
      onComplete: () => setActiveView(view),
    });
  };

  const rootStyle: CSSProperties = {
      background: uiTheme.sectionBackground,
  };

  return (
    <div
      ref={triggerRef}
      className="relative h-screen w-full overflow-hidden"
      style={rootStyle}
    >
      {/* 1. Cinematic bars */}
      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
        <div
          ref={barsContainerRef}
          className="absolute top-1/2 left-1/2 h-0 w-0"
        >
          <div
            ref={topBarRef}
            className="absolute bottom-0 left-[-150vmax] h-[300vmax] w-[300vmax] shadow-2xl"
            style={{
              transform: "translateY(-50vh)",
              backgroundColor: uiTheme.cinematicBar,
            }}
          />
          <div
            ref={bottomBarRef}
            className="absolute top-0 left-[-150vmax] h-[300vmax] w-[300vmax] shadow-2xl"
            style={{
              transform: "translateY(50vh)",
              backgroundColor: uiTheme.cinematicBar,
            }}
          />
        </div>
      </div>

      {/* 2. Text behind car */}
      <div className="pointer-events-none absolute inset-0 z-[15]">
        <TextLayer
          layer="behind-car"
          activeView={activeView}
          titleRef={titleRef}
          theme={uiTheme}
        />
      </div>

      {/* 3. 3D canvas */}
      <div
        ref={containerRef}
        className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center will-change-transform"
      />

      {/* 4. Text in front of car */}
      <div className="pointer-events-none absolute inset-0 z-[25]">
        {VIEW_DATA[activeView].labelLeft && (
          <div className={VIEW_DATA[activeView].leftLabelClass}>
            <div
              className="text-extra font-akira text-[11px] uppercase leading-none tracking-[0.24em] opacity-0"
              style={{ color: uiTheme.mainText }}
            >
              {VIEW_DATA[activeView].labelLeft}
            </div>
          </div>
        )}

        {VIEW_DATA[activeView].labelRight && (
          <div className={VIEW_DATA[activeView].rightLabelClass}>
            <div
              className="text-extra font-akira text-[11px] uppercase leading-none tracking-[0.24em] opacity-0"
              style={{ color: uiTheme.mainText }}
            >
              {VIEW_DATA[activeView].labelRight}
            </div>
          </div>
        )}

        <TextLayer
          layer="front-car"
          activeView={activeView}
          titleRef={titleRef}
          theme={uiTheme}
        />
      </div>

      {/* 5. View buttons */}
      <div className="pointer-events-none absolute inset-0 z-30 flex justify-center">
        <div className="pointer-events-auto absolute bottom-[14vh] flex gap-6">
          {VIEW_ORDER.map((view, index) => {
            const isActive = activeView === view;
            const label = `0${index + 1}`;

            return (
              <button
                key={view}
                onClick={() => handleViewChange(view)}
                className={`flex h-12 w-12 cursor-pointer items-center justify-center border font-mono text-sm font-bold backdrop-blur-sm transition-all duration-500 hover:scale-110 ${isActive ? "scale-110" : ""}`}
                style={{
                  backgroundColor: isActive
                    ? uiTheme.buttonActiveBg
                    : uiTheme.buttonIdleBg,
                  color: isActive
                    ? uiTheme.buttonActiveText
                    : uiTheme.buttonIdleText,
                  borderColor: isActive
                    ? uiTheme.buttonActiveBorder
                    : uiTheme.buttonIdleBorder,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
