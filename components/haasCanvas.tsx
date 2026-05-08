"use client";

import { SceneManager } from "../renders/render";
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
  Khi muốn nhân bản sang xe khác, bạn chủ yếu sửa 3 phần:
  1. TEAM_MODEL  -> đường dẫn model và ánh sáng
  2. TEAM_THEME  -> màu nền, màu chữ, màu nút
  3. VIEW_DATA   -> chữ, vị trí, layout từng góc nhìn
  =========================================================
*/

type ViewKey = "side" | "front" | "cockpit";
type TextEffect = "blink-slide" | "decode-slide" | "float" | "blur";
type TitleLayer = "behind-car" | "front-car";

type CanvasTheme = {
  sectionBackground: string;
  cinematicBar: string;

  // Màu mặc định cho title lớn nếu từng view không tự set titleColor.
  backgroundTitleColor: string;
  viewTitleColor: string;

  // Màu chữ phụ: label, line, nút...
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
  subtitle: string;

  /** Màu title riêng cho từng view. Nếu bỏ trống sẽ lấy màu từ TEAM_THEME. */
  titleColor?: string;

  /**
   * Màu subtitle riêng.
   * Nếu bỏ trống và subtitleUseTitleColor = true, subtitle sẽ cùng màu với title.
   * Nếu bỏ trống và subtitleUseTitleColor không bật, subtitle sẽ lấy màu mainText.
   */
  subtitleColor?: string;
  subtitleUseTitleColor?: boolean;

  labelLeft: string;
  labelRight: string;
  labelColor?: string;

  showLine: boolean;
  titleLayer: TitleLayer;

  leftLabelClass: string;
  rightLabelClass: string;
  titleContainerClass: string;
  titleClass: string;
  subtitleClass?: string;

  textEffect: TextEffect;
  exitAnim: gsap.TweenVars;
  canvasShift: string;
};

export type TeamCanvasProps = {
  /** Đổi nhanh nền/chữ/nút từ page.tsx nếu cần. */
  theme?: Partial<CanvasTheme>;

  /** Đổi nhanh model từ page.tsx nếu cần. */
  model?: Partial<TeamModelConfig>;

  /** View đầu tiên khi mở section. Mặc định là side. */
  initialView?: ViewKey;
};

// =========================================================
// 1) MODEL: đổi đường dẫn model tại đây khi nhân bản xe khác.
// =========================================================
const TEAM_MODEL: TeamModelConfig = {
    modelPath: "../models/haas",
    lightColor: 0xffffff,
    lightIntensity: 3.8,
    ambientLightColor: 0xffffff,
    ambientIntensity: 0.9,
};

// =========================================================
// 2) THEME: toàn bộ màu chính của section nằm ở đây.
// =========================================================
const TEAM_THEME: CanvasTheme = {
    sectionBackground:
      "linear-gradient(180deg, #F4F4F4 0%, #FFFFFF 48%, #CFCFCF 100%)",
    cinematicBar: "#C8102E",

    backgroundTitleColor: "rgba(200, 16, 46, 0.22)",
    viewTitleColor: "#C8102E",

    mainText: "#C8102E",
    line: "#C8102E",

    buttonActiveBg: "#C8102E",
    buttonActiveText: "#FFFFFF",
    buttonActiveBorder: "#C8102E",

    buttonIdleBg: "rgba(255, 255, 255, 0.72)",
    buttonIdleText: "#111111",
    buttonIdleBorder: "rgba(200, 16, 46, 0.45)",
};

// =========================================================
// 3) VIEW DATA: sửa nội dung, màu chữ, vị trí từng góc nhìn.
// =========================================================
const VIEW_DATA: Record<ViewKey, ViewConfig> = {
  side: {
    title: "HAAS",
    subtitle: "Haas F1 Team",
    titleColor: "rgba(200, 16, 46, 0.22)",
    subtitleUseTitleColor: false,

    labelLeft: "AMERICAN OUTSIDER",
    labelRight: "KANNAPOLIS, USA",

    showLine: true,
    titleLayer: "behind-car",

    leftLabelClass: "absolute top-[14vh] left-[5vw] overflow-hidden pb-2 pr-4",
    rightLabelClass: "absolute top-[14vh] right-[5vw] overflow-hidden pb-2 pr-4",
    titleContainerClass:
      "absolute inset-0 flex flex-col items-center justify-center font-akira",
    titleClass: "font-black uppercase tracking-wide leading-none text-[15vw]",

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
    title: "VF-20",
    subtitle: "Silver Grit",
    titleColor: "#C8102E",

    // Đây là dòng bạn cần: subtitle sẽ tự cùng màu với title SF1000.
    subtitleUseTitleColor: true,

    labelLeft: "CHASSIS",
    labelRight: "2020",

    showLine: false,
    titleLayer: "behind-car",

    leftLabelClass: "absolute top-[8vh] left-[5vw] overflow-hidden pb-2 pr-4",
    rightLabelClass: "absolute top-[8vh] right-[5vw] overflow-hidden pb-2 pr-4",
    titleContainerClass:
      "absolute top-[6vh] right-[7vw] text-right flex flex-col items-end",
    titleClass:
      "font-akira text-[13vw] font-black uppercase leading-none tracking-[0.04em]",

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
    title: '"WE KEEP FIGHTING, EVEN WHEN IT GETS MESSY."',
    subtitle: "GUENTHER STEINER",
    titleColor: "#C8102E",
    subtitleUseTitleColor: true,

    labelLeft: "",
    labelRight: "",

    showLine: false,
    titleLayer: "front-car",

    leftLabelClass: "absolute top-[12vh] left-[9vw] overflow-hidden pb-2 pr-4",
    rightLabelClass: "absolute top-[12vh] right-[5vw] overflow-hidden pb-2 pr-4",
    titleContainerClass:
      "absolute top-[35vh] w-full flex flex-col items-center justify-center",
    titleClass: "max-w-5xl text-center font-mono text-3xl leading-tight md:text-5xl",

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

const BASE_LABEL_CLASS =
  "text-extra font-akira text-[11px] uppercase leading-none tracking-[0.24em] opacity-0";

const BASE_SUBTITLE_CLASS =
  "text-extra font-akira text-[12px] leading-[1.2] tracking-[0.24em] opacity-0";

const BASE_BUTTON_CLASS =
  "flex h-12 w-12 cursor-pointer items-center justify-center border font-mono text-sm font-bold backdrop-blur-sm transition-all duration-500 hover:scale-110";

function mergeModelConfig(model?: Partial<TeamModelConfig>): TeamModelConfig {
  return { ...TEAM_MODEL, ...model };
}

function mergeTheme(theme?: Partial<CanvasTheme>): CanvasTheme {
  return { ...TEAM_THEME, ...theme };
}

function getTitleColor(view: ViewConfig, theme: CanvasTheme) {
  return (
    view.titleColor ??
    (view.titleLayer === "behind-car"
      ? theme.backgroundTitleColor
      : theme.viewTitleColor)
  );
}

function getSubtitleColor(view: ViewConfig, theme: CanvasTheme) {
  if (view.subtitleColor) return view.subtitleColor;
  if (view.subtitleUseTitleColor) return getTitleColor(view, theme);
  return theme.mainText;
}

function getLabelColor(view: ViewConfig, theme: CanvasTheme) {
  return view.labelColor ?? theme.mainText;
}

type TextLayerProps = {
  layer: TitleLayer;
  activeView: ViewKey;
  titleRef: RefObject<HTMLHeadingElement | null>;
  theme: CanvasTheme;
};

function TextLayer({ layer, activeView, titleRef, theme }: TextLayerProps) {
  const data = VIEW_DATA[activeView];
  const isTitleOnThisLayer = data.titleLayer === layer;
  const shouldShowExtraText = layer === "front-car";
  const hiddenTitleClass = isTitleOnThisLayer
    ? "opacity-0"
    : "opacity-0 pointer-events-none select-none";

  return (
    <div className="pointer-events-none absolute inset-0">
      <div className={data.titleContainerClass}>
        <div className="overflow-hidden pb-2 pl-10 pr-10">
          <h1
            ref={isTitleOnThisLayer ? titleRef : null}
            key={`${layer}-${activeView}`}
            className={`${data.titleClass} ${hiddenTitleClass}`}
            style={{ color: getTitleColor(data, theme) }}
          >
            {data.title}
          </h1>
        </div>

        {shouldShowExtraText && data.showLine && (
          <div className="mb-4 mt-2 flex w-full max-w-[45vw] justify-center overflow-hidden">
            <div
              className="decorative-line h-0.5 w-full origin-center opacity-0 will-change-transform"
              style={{ backgroundColor: theme.line }}
            />
          </div>
        )}

        {shouldShowExtraText && data.subtitle && (
          <div className="mt-0 overflow-hidden pl-10 pr-10 text-center">
            <p
              className={data.subtitleClass ?? BASE_SUBTITLE_CLASS}
              style={{ color: getSubtitleColor(data, theme) }}
            >
              {data.subtitle}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function getAnimatedExtras(container: HTMLElement) {
  return Array.from(container.querySelectorAll(".text-extra"));
}

function getAnimatedLine(container: HTMLElement) {
  return container.querySelector(".decorative-line");
}

function resetAnimatedElements(elements: Element[]) {
  gsap.killTweensOf(elements);
  gsap.set(elements, {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
  });
}

function animateLine(lineEl: Element | null) {
  if (!lineEl) return;

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

function animateExtras(extras: Element[], textEffect: TextEffect) {
  if (textEffect === "decode-slide" || extras.length === 0) return;

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

function animateTitleByEffect(
  titleEl: HTMLHeadingElement,
  extras: Element[],
  textEffect: TextEffect,
) {
  const splitInstances: SplitText[] = [];

  if (textEffect === "blink-slide") {
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

  if (textEffect === "decode-slide") {
    const allTextElements = [titleEl, ...extras];

    allTextElements.forEach((element, index) => {
      const textNode = element as HTMLElement;

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

  if (textEffect === "float") {
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

  if (textEffect === "blur") {
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

  return splitInstances;
}

export default function HaasCanvas({
  theme,
  model,
  initialView = "side",
}: TeamCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const barsContainerRef = useRef<HTMLDivElement>(null);
  const topBarRef = useRef<HTMLDivElement>(null);
  const bottomBarRef = useRef<HTMLDivElement>(null);

  const engineRef = useRef<SceneManager | null>(null);
  const [activeView, setActiveView] = useState<ViewKey>(initialView);
  const [isEngineReady, setIsEngineReady] = useState(false);

  const uiTheme = useMemo(() => mergeTheme(theme), [theme]);
  const modelConfig = useMemo(() => mergeModelConfig(model), [model]);
  const currentView = VIEW_DATA[activeView];

  // === HOOK 1: setup 3D engine ===
  useGSAP(
    () => {
      let isCancelled = false;

      // 🚨 THE FIX: Use a locally scoped variable to track this exact engine instance
      let localEngine: SceneManager | null = null;

      const setup = async () => {
        if (!containerRef.current) return;

        // Assign to both the local variable and the ref
        localEngine = new SceneManager(containerRef.current, modelConfig);
        engineRef.current = localEngine;

        try {
          await localEngine.init();

          // 🚨 CIRCUIT BREAKER: Stop executing if user navigated away
          if (isCancelled) return;

          localEngine.precompileShaders();
          localEngine.warmUpGPU();

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (!isCancelled && localEngine) {
                startMainShow(
                  localEngine,
                  topBarRef.current,
                  bottomBarRef.current,
                  () => setIsEngineReady(true)
                );
              }
            });
          });
        } catch (e) {
          console.warn("Engine setup aborted", e);
        }
      };

      setup();

      return () => {
        isCancelled = true;

        // 🚨 THE FIX: Clean up the LOCAL engine, not the ref.
        // This guarantees 100% memory disposal even if React double-renders quickly.
        if (localEngine) {
          if (containerRef.current && localEngine.renderer.domElement) {
            if (containerRef.current.contains(localEngine.renderer.domElement)) {
              containerRef.current.removeChild(localEngine.renderer.domElement);
            }
          }

          if (typeof localEngine.destroy === "function") {
            localEngine.destroy();
          }
        }
      };
    },
    {
      dependencies: [
        modelConfig.modelPath,
        modelConfig.lightColor,
        modelConfig.lightIntensity,
        modelConfig.ambientLightColor,
        modelConfig.ambientIntensity,
      ],
    }
  );

  // === HOOK 2: text enter animations ===
  useGSAP(
    () => {
      if (!isEngineReady || !titleRef.current || !triggerRef.current) return;

      const titleEl = titleRef.current;
      const uiContainer = triggerRef.current;
      const extras = getAnimatedExtras(uiContainer);
      const lineEl = getAnimatedLine(uiContainer);
      const allElements = [titleEl, ...extras, lineEl].filter(Boolean) as Element[];

      resetAnimatedElements(allElements);
      animateLine(lineEl);
      animateExtras(extras, currentView.textEffect);

      const splitInstances = animateTitleByEffect(
        titleEl,
        extras,
        currentView.textEffect,
      );

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
      ...getAnimatedExtras(triggerRef.current),
      getAnimatedLine(triggerRef.current),
    ].filter(Boolean) as Element[];

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
          className="absolute left-1/2 top-1/2 h-0 w-0"
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
            className="absolute left-[-150vmax] top-0 h-[300vmax] w-[300vmax] shadow-2xl"
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
        {currentView.labelLeft && (
          <div className={currentView.leftLabelClass}>
            <div
              className={BASE_LABEL_CLASS}
              style={{ color: getLabelColor(currentView, uiTheme) }}
            >
              {currentView.labelLeft}
            </div>
          </div>
        )}

        {currentView.labelRight && (
          <div className={currentView.rightLabelClass}>
            <div
              className={BASE_LABEL_CLASS}
              style={{ color: getLabelColor(currentView, uiTheme) }}
            >
              {currentView.labelRight}
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
                className={`${BASE_BUTTON_CLASS} ${isActive ? "scale-110" : ""}`}
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