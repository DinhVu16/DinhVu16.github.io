"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/ScrollTrigger";

/* =========================================================
   0. GSAP SETUP
========================================================= */
gsap.registerPlugin(ScrollTrigger, useGSAP);


/* =========================================================
   1. 3D MODEL
   ---------------------------------------------------------
   Muốn đổi model/canvas cho xe khác thì đổi dòng import này.


   Ví dụ:
   Ferrari:    "../../../components/ferrariCanvas"
   AlphaTauri: "../../../components/alphatauriCanvas"
   Alfa Romeo: "../../../components/alfaromeoCanvas"
========================================================= */
const TeamScene = dynamic(() => import("../../../components/haasCanvas"), {
  ssr: false,
});


/* =========================================================
   2. TYPES
========================================================= */
type GalleryItem = {
  label: string;
  src: string;
  alt: string;
  cardClassName: string;
  imageBoxClassName: string;
};


type DriverStats = [label: string, value: string];


type HighlightItem = [label: string, value: string, note: string];


type TeamTheme = {
  /**
   * pageBackground:
   * Màu nền các section lớn: title, gallery, story.
   */
  pageBackground: string;


  /**
   * surface:
   * Màu nền các section thông tin xe/tay đua.
   */
  surface: string;


  /**
   * text / mutedText:
   * Màu chữ chính và chữ phụ.
   */
  text: string;
  mutedText: string;


  /**
   * accent:
   * Màu chính của team/xe.
   */
  accent: string;


  /**
   * accentDark:
   * Màu đậm hơn cho khối highlight.
   */
  accentDark: string;


  /**
   * footerAccent:
   * Màu footer cuối trang.
   */
  footerAccent: string;


  /**
   * storyBefore / storyAfter:
   * Màu chữ story reveal trước và sau khi scroll reveal.
   */
  storyBefore: string;
  storyAfter: string;
};


type TeamPageData = {
  /**
   * ĐỔI TÊN XE Ở ĐÂY.
   * carName dùng cho title lớn và alt text.
   * Ví dụ: "SF1000", "AT01", "RB16", "MCL35"...
   */
  carName: string;


  teamName: string;
  season: string;


  logoSrc: string;
  logoAlt: string;


  storyLabelLeft: string;


  theme: TeamTheme;


  images: {
    heroCar: string;
    primaryDriverBackground: string;
    primaryDriverPortrait: string;
    secondaryDriverPortrait: string;
    highlightThumbnail: string;
  };


  galleryItems: GalleryItem[];


  storyText: string;


  primaryDriver: {
    name: string;
    videoUrl: string;
    videoLabel: string;
    description: string;
  };


  secondaryDriver: {
    name: string;
    description: string;
    statsTitle: string;
    statsSubTitle: string;
    stats: DriverStats[];
  };


  highlight: {
    title: string;
    subTitle: string;
    videoUrl: string;
    videoLabel: string;
    items: HighlightItem[];
  };
};


/* =========================================================
   3. TEAM DATA — CHỈNH NỘI DUNG CHÍNH Ở ĐÂY
   ---------------------------------------------------------
   Muốn đổi xe/team:
   - đổi carName
   - đổi teamName
   - đổi logoSrc
   - đổi theme màu
   - đổi ảnh trong images / galleryItems
   - đổi text driver/story/highlight
========================================================= */
const teamPageData: TeamPageData = {
  teamName: "HAAS F1 TEAM",


  // Đổi tên xe ở đây.
  carName: "VF-20",


  season: "2020",


  logoSrc: "/logos/haas.svg",
  logoAlt: "Haas logo",


  storyLabelLeft: "The Story",


  theme: {
    pageBackground: "#F4F4F4",
    surface: "#FFFFFF",
    text: "#111111",
    mutedText: "#555555",
    accent: "#C8102E",
    accentDark: "#8F0B22",
    footerAccent: "#2A2A2A",
    storyBefore: "rgba(200, 16, 46, 0.16)",
    storyAfter: "#111111",
  },


  images: {
    heroCar: "/images/haas/anh-xe.webp",
    primaryDriverBackground: "/images/haas/pdb.webp",
    primaryDriverPortrait: "/images/haas/pdp.webp",
    secondaryDriverPortrait: "/images/haas/sdp.webp",
    highlightThumbnail: "/images/haas/thumbnail.webp",
  },


  galleryItems: [
    {
      label: "Haas / 2020",
      src: "/images/haas/haas-1.webp",
      alt: "Haas archive 1",
      cardClassName: "mt-[-18vh] w-[26vw]",
      imageBoxClassName: "aspect-[16/10]",
    },
    {
      label: "VF-20 Detail",
      src: "/images/haas/haas-2.webp",
      alt: "Haas archive 2",
      cardClassName: "mt-[12vh] w-[42vw]",
      imageBoxClassName: "aspect-[16/9]",
    },
    {
      label: "Chassis",
      src: "/images/haas/haas-3.webp",
      alt: "Haas archive 3",
      cardClassName: "mt-[-22vh] w-[22vw]",
      imageBoxClassName: "aspect-[16/9]",
    },
    {
      label: "Race Frame",
      src: "/images/haas/haas-4.webp",
      alt: "Haas archive 4",
      cardClassName: "mt-[20vh] w-[30vw]",
      imageBoxClassName: "aspect-[4/3]",
    },
    {
      label: "Haas Detail",
      src: "/images/haas/haas-5.webp",
      alt: "Haas archive 5",
      cardClassName: "mt-[-5vh] w-[23vw]",
      imageBoxClassName: "aspect-[2/2]"
    },
    {
      label: "Engine Era",
      src: "/images/haas/haas-6.webp",
      alt: "Haas archive 6",
      cardClassName: "mt-[16vh] w-[24vw]",
      imageBoxClassName: "aspect-square",
    },
  ],


  storyText:
    "It was a survival year for Haas. The team opted not to develop the car significantly due to financial constraints and the pandemic. The season was overshadowed by Romain Grosjean’s horrific crash in Bahrain, where he miraculously survived a fiery impact. This event led to the team fielding reserve driver Pietro Fittipaldi for the final two rounds.",


  primaryDriver: {
    name: "Kevin Magnussen",
    videoUrl: "https://www.youtube.com/results?search_query=Kevin+Magnussen+Haas+2020+highlights",
    videoLabel: "WATCH MAGNUSSEN'S 2020 HIGHLIGHTS",
    description:
      "Fought hard in an uncompetitive VF-20 and maximized limited chances when chaos opened opportunities. His aggressive style remained one of Haas's strongest weapons.",
  },


  secondaryDriver: {
    name: "Romain Grosjean",
    description:
      "Faced a difficult final season with Haas but remained experienced and committed. His dramatic Bahrain accident became one of the most unforgettable moments of the 2020 season.",
    statsTitle: "Driver Information",
    statsSubTitle: "(2020 SEASON)",
    stats: [
      ["2020 Points", "2"],
      ["Best Finish", "P9"],
      ["Wins", "0"],
      ["Podiums", "0"],
      ["Poles", "0"],
      ["Standings", "19th"],
    ],
  },


  highlight: {
    title: "Highlight",
    subTitle: "Team Highlights (2020):",
    videoUrl: "https://www.youtube.com/playlist?list=PLfoNZDHitwjXRANMnqmL0BzNGianZ2eX_",
    videoLabel: "WATCH 2020 HIGHLIGHTS",
    items: [
      ["Constructors", "9th", ""],
      ["Total Points", "3", ""],
      ["Best Finish", "P9", "(Grosjean at Eifel)"],
      ["Key Moment", "Bahrain Escape", "(Grosjean's survival became unforgettable)"],
    ],
  },
};

/* =========================================================
   4. ANIMATION CONFIG
   ---------------------------------------------------------
   Các số hay chỉnh animation gom ở đây.
========================================================= */
const ANIMATION = {
  loading: {
    /**
     * Delay render model 3D sau khi loading xong.
     * Tăng lên nếu page bị khựng khi vừa load.
     */
    modelDelay: 300,

    /**
     * Nếu LoadingScreen không dispatch event, page vẫn tự chạy.
     */
    fallbackDelay: 500,
  },

  topbar: {
    start: "75% top",
    showDuration: 0.45,
    hideDuration: 0.35,
  },

  heroModel: {
    y: -160,
    scale: 1.12,
    rotate: -2.5,
  },

  gallery: {
    startXRatio: 0.82,
    scrollLengthMultiplier: 2,
    scrub: 1.5,
  },

  storyReveal: {
    scrollLength: 2800,
    wordStagger: 0.025,
  },

  carDetails: {
    fadeUpY: 60,
    slideX: 100,
    fadeDuration: 1,
    scaleDuration: 1.2,
  },
} as const;

/* =========================================================
   5. SELECTORS
   ---------------------------------------------------------
   Nếu đổi className trong JSX, nhớ đổi selector ở đây.
========================================================= */
const SELECTORS = {
  /**
   * Topbar.tsx cần có:
   * - wrapper: id="f1-topbar-root"
   * - header:  id="f1-topbar"
   */
  topbarRoot: "#f1-topbar-root",
  topbar: "#f1-topbar",

  heroSection: ".team-hero",
  modelWrapper: ".team-car-scroll",

  horizontalSection: ".team-horizontal-section",
  horizontalTrack: ".team-horizontal-track",

  textRevealSection: ".team-text-reveal-section",
  revealWord: ".team-reveal-word",

  carDetailRoot: ".team-car-detail-root",
} as const;

/* =========================================================
   6. HELPERS
========================================================= */
function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function splitStoryText(text: string) {
  return text.split(" ");
}

function getAccentShadow(color: string) {
  return `0 20px 50px ${color}4D`;
}

/**
 * Truyền màu từ page hiện tại sang Topbar.tsx bằng CSS variables.
 *
 * Nhờ vậy bạn chỉ cần đổi màu trong teamPageData.theme:
 * - pageBackground: nền topbar
 * - accent: màu chữ, viền, hover, overlay Top
 */
function applyTopbarTheme(theme: TeamTheme) {
  const topbarRoot = document.querySelector(
    SELECTORS.topbarRoot
  ) as HTMLElement | null;

  const topbar = document.querySelector(SELECTORS.topbar) as HTMLElement | null;

  if (!topbarRoot || !topbar) return;

  topbarRoot.style.setProperty("--topbar-bg", theme.pageBackground);
  topbarRoot.style.setProperty("--topbar-accent", theme.accent);
  topbarRoot.style.setProperty("--topbar-hover-text", theme.pageBackground);
  topbarRoot.style.setProperty("--topbar-button-shadow", `${theme.accent}66`);
  topbarRoot.style.setProperty("--topbar-overlay", theme.accent);

  /**
   * Set màu nền/viền cho chính thanh topbar.
   * Màu nút và hiệu ứng hover nên để Topbar.tsx đọc từ CSS variables.
   */
  gsap.set(topbar, {
    backgroundColor: theme.pageBackground,
    color: theme.accent,
    borderColor: theme.accent,
  });
}

/* =========================================================
   7. PAGE COMPONENT
========================================================= */
export default function TeamPage() {
  const pageRef = useRef<HTMLElement | null>(null);

  /**
   * isPageReady:
   * Cho GSAP/ScrollTrigger chạy sau khi LoadingScreen xong.
   *
   * canRenderScene:
   * Cho model 3D render trễ hơn GSAP một chút để tránh khựng.
   */
  const [isPageReady, setIsPageReady] = useState(false);
  const [canRenderScene, setCanRenderScene] = useState(false);

  const storyWords = useMemo(() => splitStoryText(teamPageData.storyText), []);

  useEffect(() => {
    let hasStarted = false;
    let modelTimer: number | undefined;
    let fallbackTimer: number | undefined;

    const startPage = () => {
      if (hasStarted) return;

      hasStarted = true;
      setIsPageReady(true);

      modelTimer = window.setTimeout(() => {
        setCanRenderScene(true);
      }, ANIMATION.loading.modelDelay);
    };

    const handleLoadingComplete = () => {
      sessionStorage.setItem("app-loading-complete", "true");
      startPage();
    };

    /**
     * Nếu loading đã xong từ trước, ví dụ click từ Hero sang team bằng Link,
     * thì page chạy ngay, không cần đợi event.
     */
    if (sessionStorage.getItem("app-loading-complete") === "true") {
      startPage();

      return () => {
        if (modelTimer) window.clearTimeout(modelTimer);
      };
    }

    window.addEventListener("app-loading-complete", handleLoadingComplete);

    /**
     * Fallback: tránh page chờ mãi nếu LoadingScreen lỗi.
     */
    fallbackTimer = window.setTimeout(() => {
      startPage();
    }, ANIMATION.loading.fallbackDelay);

    return () => {
      window.removeEventListener("app-loading-complete", handleLoadingComplete);

      if (modelTimer) window.clearTimeout(modelTimer);
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
    };
  }, []);

  /**
   * Khi model 3D vừa render xong, refresh ScrollTrigger một lần.
   */
  useEffect(() => {
    if (!canRenderScene) return;

    const refreshTimer = window.setTimeout(() => {
      ScrollTrigger.refresh();
    }, 350);

    return () => {
      window.clearTimeout(refreshTimer);
    };
  }, [canRenderScene]);

useGSAP(
  () => {
    if (!pageRef.current) return;

    setupTopbarAnimation(teamPageData.theme);
    setupHeroModelParallax();
    setupStoryRevealAnimation(teamPageData.theme);
    setupHorizontalGallery(pageRef.current);
    setupCarDetailAnimations(pageRef.current);

    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  },
  {
    scope: pageRef,
  }
);

  return (
    <main
      ref={pageRef}
      className="relative overflow-x-hidden"
      style={{
        backgroundColor: teamPageData.theme.pageBackground,
        color: teamPageData.theme.text,
      }}
    >
      <FixedModelLayer canRenderScene={canRenderScene} />

      <HeroSection />

      <StoryRevealSection data={teamPageData} storyWords={storyWords} />

      <HorizontalGallery data={teamPageData} />

      <CarDetailSections data={teamPageData} />
    </main>
  );
}

/* =========================================================
   8. PAGE SECTIONS — HERO / TITLE / GALLERY / STORY
========================================================= */
function FixedModelLayer({ canRenderScene }: { canRenderScene: boolean }) {
  return (
    <div className="team-car-scroll pointer-events-none fixed left-0 top-0 z-0 h-screen w-screen scale-[1.08] overflow-hidden will-change-transform">
      {canRenderScene && <TeamScene />}
    </div>
  );
}

function HeroSection() {
  return (
    <section className="team-hero pointer-events-none relative z-10 flex h-screen items-center justify-center overflow-hidden" />
  );
}

function HorizontalGallery({ data }: { data: TeamPageData }) {
  return (
    <section
      className="team-horizontal-section relative z-30 h-screen overflow-hidden"
      style={{ backgroundColor: data.theme.pageBackground }}
    >
      <div className="team-horizontal-track flex h-full w-max items-center gap-[7vw] px-[8vw]">
        {data.galleryItems.map((item, index) => (
          <article
            key={`${item.label}-${index}`}
            className={cn("team-horizontal-card shrink-0", item.cardClassName)}
          >
            <p
              className="mb-3 font-akira text-[10px] uppercase tracking-[0.18em]"
              style={{ color: data.theme.accent }}
            >
              {item.label}
            </p>

            <div className={cn("overflow-hidden bg-black", item.imageBoxClassName)}>
              <img
                src={item.src}
                alt={item.alt}
                className="h-full w-full object-cover"
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function StoryRevealSection({
  data,
  storyWords,
}: {
  data: TeamPageData;
  storyWords: string[];
}) {
  return (
    <section
      className="team-text-reveal-section relative z-20 flex h-screen items-center justify-center"
      style={{ backgroundColor: data.theme.pageBackground }}
    >
      <div className="w-full px-[6vw]">
        <SectionLabel
          position="left"
          text={data.storyLabelLeft}
          color={data.theme.accent}
        />

        <SectionLabel
          position="right"
          text={data.season}
          color={data.theme.accent}
        />

        <p className="mx-auto max-w-6xl text-center font-sans text-[30px] font-light leading-[1.25] tracking-[-0.05em] md:text-[50px]">
          {storyWords.map((word, index) => (
            <span
              key={`${word}-${index}`}
              className="team-reveal-word mr-[0.22em] inline-block"
              style={{ color: data.theme.storyBefore }}
            >
              {word}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}

/* =========================================================
   9. PAGE SECTIONS — CAR DETAIL / DRIVERS / HIGHLIGHT
========================================================= */
function CarDetailSections({ data }: { data: TeamPageData }) {
  return (
    <section
      className="team-car-detail-root relative z-40 w-full overflow-hidden shadow-2xl"
      style={{
        backgroundColor: data.theme.surface,
        color: data.theme.text,
      }}
    >
      <CarHeaderSection data={data} />

      <Divider color={data.theme.accent} />

      <PrimaryDriverSection data={data} />

      <SecondaryDriverSection data={data} />

      <HighlightSection data={data} />

      <FooterSection data={data} />
    </section>
  );
}

function CarHeaderSection({ data }: { data: TeamPageData }) {
  return (
    <section
      className="relative h-[200vh] w-full overflow-hidden"
      style={{
        backgroundColor: data.theme.surface,
        color: data.theme.text,
      }}
    >
      {/* 
        Bên trong cũng cao h-full,
        nên ảnh, khung chữ, layout đều dài đúng 2 section.
      */}
      <div className="relative flex h-full w-full overflow-hidden">
        {/* KHUNG TÊN ĐỘI BÊN TRÁI */}
        <aside
          className="relative z-20 h-full w-[120px] shrink-0 overflow-hidden border-r shadow-[8px_0_20px_rgba(0,0,0,0.06)]"
          style={{
            backgroundColor: data.theme.surface,
            borderColor: `${data.theme.accent}33`,
          }}
        >
          <VerticalTeamTicker
            text={data.teamName}
            color={data.theme.accent}
          />
        </aside>

        {/* NỘI DUNG CHÍNH */}
        <div
          className="relative h-full flex-1 overflow-hidden"
          style={{
            backgroundColor: data.theme.surface,
          }}
        >
          {/* Ảnh bây giờ cao đúng 200vh */}
          <img
            src={data.images.heroCar}
            alt={`${data.carName} car`}
            className="absolute inset-0 h-full w-full object-cover opacity-80"
          />

          {/* Logo nhỏ góc phải trên */}
          <div
            className="absolute right-0 top-0 z-20 flex h-24 w-24 items-center justify-center shadow-lg"
            style={{ backgroundColor: data.theme.accent }}
          >
            <img
              src={data.logoSrc}
              alt={data.logoAlt}
              className="h-12 w-12 object-contain"
            />
          </div>

          {/* Bảng season nằm ở gần cuối section 200vh */}
          <div
            className="gsap-fade-up absolute bottom-[12vh] right-[8%] z-30 w-[480px] p-10 transition-transform duration-500 hover:-translate-y-2"
            style={{
              backgroundColor: data.theme.accent,
              boxShadow: getAccentShadow(data.theme.accent),
            }}
          >
            <h2
              className="text-[4rem] font-black uppercase leading-[1.05] tracking-wider"
              style={{ color: data.theme.surface }}
            >
              {data.season}
              <br />
              Season
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}

function VerticalTeamTicker({
  text,
  color,
}: {
  text: string;
  color: string;
}) {
  /**
   * 1 vòng nội dung. Nhân đôi vòng này để tạo loop khép kín.
   * Tăng length nếu tên đội ngắn và bạn thấy khoảng trống.
   */
  const loopItems = Array.from({ length: 5 }, () => text);

  return (
    <>
      <div className="absolute inset-0 overflow-hidden">
        <div className="vertical-team-ticker-track absolute left-1/2 top-0 flex flex-col will-change-transform">
          {[...loopItems, ...loopItems].map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="mb-16 whitespace-nowrap font-akira text-[5.2rem] uppercase leading-none tracking-[0.02em] [writing-mode:vertical-rl] rotate-180"
              style={{ color }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .vertical-team-ticker-track {
          animation: verticalTickerLoop 20s linear infinite;
        }

        @keyframes verticalTickerLoop {
          from {
            transform: translate(-50%, -50%);
          }

          to {
            transform: translate(-50%, 0%);
          }
        }
      `}</style>
    </>
  );
}

function Divider({ color }: { color: string }) {
  return (
    <div
      className="ml-[8%] mb-10 mt-32 h-[2px] w-[30%]"
      style={{ backgroundColor: `${color}4D` }}
    />
  );
}

function PrimaryDriverSection({ data }: { data: TeamPageData }) {
  const driver = data.primaryDriver;

  return (
    <section className="relative w-full px-[5%] py-20">
      <div className="absolute inset-0 z-0 ml-[8%] flex justify-end">
        <div className="relative h-full w-full bg-gray-200/50">
          <img
            src={data.images.primaryDriverBackground}
            alt={`${driver.name} background`}
            className="h-full w-full object-cover opacity-50"
          />
        </div>
      </div>

      <div className="relative z-10 flex w-full items-center">
        <div className="gsap-slide-left relative z-20 mt-5 flex w-[45%] flex-col justify-center bg-[#111] p-16 text-white shadow-2xl xl:p-24">
          <div className="absolute -top-10 left-16">
            <PlayLink href={driver.videoUrl} accent={data.theme.accent} />
          </div>

          <h3
            className="mt-10 mb-6 inline-block w-max border-b-4 pb-4 text-4xl font-black uppercase tracking-wide"
            style={{ borderColor: data.theme.accent }}
          >
            {driver.name}
          </h3>

          <p className="mb-8 text-lg font-light leading-relaxed text-gray-300">
            {driver.description}
          </p>

          <Link
            href={driver.videoUrl}
            target="_blank"
            className="text-sm underline transition-colors hover:text-white"
            style={{ color: data.theme.accent }}
          >
            {driver.videoLabel}
          </Link>
        </div>

        <div className="gsap-slide-right relative z-30 -ml-16 flex w-[55%] items-center">
          <div className="flex h-[500px] w-full items-center justify-center overflow-hidden border-8 border-white bg-gray-300 shadow-2xl md:h-[600px]">
            <img
              src={data.images.primaryDriverPortrait}
              alt={driver.name}
              className="h-full w-full object-cover object-top"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function SecondaryDriverSection({ data }: { data: TeamPageData }) {
  const driver = data.secondaryDriver;

  return (
    <section
      className="relative z-10 flex w-full items-center overflow-hidden px-[5%] py-32"
      style={{ backgroundColor: data.theme.surface, color: data.theme.accent }}
    >
      <div
        className="gsap-slide-left flex w-[30%] flex-col justify-center pl-[5%] text-sm font-bold md:text-base"
        style={{ color: data.theme.accent }}
      >
        <h4
          className="mb-6 border-l-4 pl-4 text-xl uppercase tracking-widest"
          style={{ borderColor: data.theme.accent }}
        >
          {driver.statsTitle}
          <br />
          <span className="text-sm text-gray-500">{driver.statsSubTitle}</span>:
        </h4>

        <StatsList stats={driver.stats} accent={data.theme.accent} />
      </div>

      <div className="gsap-scale-up relative z-20 flex w-[40%] items-end justify-center px-10">
        <div className="flex h-[600px] w-full items-center justify-center overflow-hidden drop-shadow-2xl md:h-[700px]">
          <img
            src={data.images.secondaryDriverPortrait}
            alt={driver.name}
            className="h-full w-full object-contain"
          />
        </div>
      </div>

      <div className="gsap-slide-right flex w-[30%] flex-col justify-center pr-[5%]">
        <h2
          className="mb-6 text-4xl font-black uppercase tracking-wide xl:text-5xl"
          style={{ color: data.theme.accent }}
        >
          {driver.name.split(" ").map((part) => (
            <span key={part} className="block">
              {part}
            </span>
          ))}
        </h2>

        <div
          className="mb-6 h-2 w-16"
          style={{ backgroundColor: data.theme.accent }}
        />

        <p
          className="text-base font-medium leading-relaxed xl:text-lg"
          style={{ color: data.theme.mutedText }}
        >
          {driver.description}
        </p>
      </div>
    </section>
  );
}

function HighlightSection({ data }: { data: TeamPageData }) {
  const highlight = data.highlight;

  return (
    <section className="relative flex w-full items-stretch pb-32">
      <div
        className="gsap-fade-up relative z-30 ml-[8%] mt-32 w-[35%] p-16 text-white shadow-[20px_20px_60px_rgba(0,0,0,0.3)]"
        style={{ backgroundColor: data.theme.accentDark }}
      >
        <h3 className="mb-8 inline-block border-b-2 border-white pb-4 text-4xl font-black uppercase tracking-wider">
          {highlight.title}
        </h3>

        <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-gray-300">
          {highlight.subTitle}
        </h4>

        <ul className="space-y-2 text-base font-medium">
          {highlight.items.map(([label, value, note]) => (
            <li key={label}>
              {label}: <span className="text-xl font-bold">{value}</span>{" "}
              {note}
            </li>
          ))}
        </ul>
      </div>

      <div className="gsap-slide-right group relative z-20 -ml-10 flex min-h-[600px] w-[55%] cursor-pointer flex-col items-center justify-center overflow-hidden bg-black p-12 shadow-2xl">
        <div 
          className="absolute inset-0 z-0 flex items-center justify-center bg-gray-900  opacity-50 transition-opacity group-hover:opacity-40"
          style={{ color: data.theme.text }}
        >
          <img
            src={data.images.highlightThumbnail}
            alt="Video Thumbnail"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        <PlayLink href={highlight.videoUrl} accent={data.theme.accent} size="large" />

        <Link
          href={highlight.videoUrl}
          target="_blank"
          className="absolute bottom-10 right-10 z-10 text-sm uppercase tracking-widest text-gray-400 underline transition-colors hover:text-white"
        >
          {highlight.videoLabel}
        </Link>
      </div>
    </section>
  );
}

function FooterSection({ data }: { data: TeamPageData }) {
  const footerText = `${data.season} ${data.teamName}`;

  return (
    <footer
      className="flex w-full flex-col items-center pb-0"
      style={{
        backgroundColor: data.theme.surface,
        color: data.theme.text,
      }}
    >
      <div className="flex w-full items-center justify-center gap-8 px-[10%] py-16">
        <FooterLine text={footerText} align="right" color={data.theme.accent} />

        <div className="px-8 transition-transform duration-300 hover:-translate-y-2">
          <img
            src={data.logoSrc}
            alt={data.logoAlt}
            className="h-24 w-auto object-contain"
          />
        </div>

        <FooterLine text={footerText} align="left" color={data.theme.accent} />
      </div>

      <div
        className="w-full cursor-default py-6 text-center transition-colors duration-500"
        style={{ backgroundColor: data.theme.footerAccent }}
      >
        <span className="text-lg font-black tracking-[10px] text-white">
          {data.teamName}
        </span>
      </div>
    </footer>
  );
}

/* =========================================================
   10. SMALL COMPONENTS
========================================================= */
function SectionLabel({
  position,
  text,
  color,
}: {
  position: "left" | "right";
  text: string;
  color: string;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute top-[10vh] z-30 font-akira text-[11px] uppercase leading-none tracking-[0.24em]",
        position === "left" ? "left-[4vw]" : "right-[4vw]"
      )}
      style={{ color }}
    >
      {text}
    </div>
  );
}

function PlayLink({
  href,
  accent,
  size = "normal",
}: {
  href: string;
  accent: string;
  size?: "normal" | "large";
}) {
  const isLarge = size === "large";

  return (
    <Link href={href} target="_blank" className="group relative z-10 flex">
      <div
        className={
          isLarge
            ? "flex h-24 w-24 items-center justify-center rounded-full border-4 border-white shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all duration-300 group-hover:scale-110"
            : "flex h-20 w-20 items-center justify-center rounded-full border-2 border-white bg-[#111] shadow-xl transition-all duration-300 group-hover:scale-110"
        }
        onMouseEnter={(event) => {
          event.currentTarget.style.backgroundColor = accent;
          event.currentTarget.style.borderColor = accent;
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.backgroundColor = isLarge
            ? "transparent"
            : "#111111";
          event.currentTarget.style.borderColor = "#ffffff";
        }}
      >
        <svg
          className={isLarge ? "ml-2 h-10 w-10 text-white" : "ml-2 h-8 w-8 text-white"}
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    </Link>
  );
}

function StatsList({ stats, accent }: { stats: DriverStats[]; accent: string }) {
  return (
    <ul className="space-y-3 text-gray-800">
      {stats.map(([label, value]) => {
        const isImportant = label === "Total Races" || label === "Total Points";

        return (
          <li
            key={label}
            className="flex justify-between border-b border-gray-100 pb-2"
          >
            <span>{label}:</span>

            <span
              className={isImportant ? "text-xl font-black" : "font-normal text-gray-600"}
              style={isImportant ? { color: accent } : undefined}
            >
              {value}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function FooterLine({
  text,
  align,
  color,
}: {
  text: string;
  align: "left" | "right";
  color: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-1 items-center gap-6 opacity-60 transition-opacity hover:opacity-100",
        align === "right" ? "justify-end" : "justify-start"
      )}
    >
      {align === "left" && (
        <div className="h-[2px] w-24" style={{ backgroundColor: color }} />
      )}

      <span className="text-sm font-bold tracking-[0.3em]" style={{ color }}>
        {text}
      </span>

      {align === "right" && (
        <div className="h-[2px] w-24" style={{ backgroundColor: color }} />
      )}
    </div>
  );
}

/* =========================================================
   11. GSAP ANIMATIONS
========================================================= */
function setupTopbarAnimation(theme: TeamTheme) {
  const topbar = document.querySelector(SELECTORS.topbar) as HTMLElement | null;

  if (!topbar) return;

  /**
   * Đổi màu topbar + nút Hero/Top theo theme của xe.
   *
   * Lưu ý:
   * Không set trực tiếp backgroundColor cho button ở đây,
   * vì nó có thể đè mất hiệu ứng hover/active trong Topbar.tsx.
   */
  applyTopbarTheme(theme);

  const topbarItems = topbar.querySelectorAll("a, button");
  const topbarIcons = topbar.querySelectorAll("svg, path");

  gsap.set(topbarItems, {
    borderColor: theme.accent,
  });

  gsap.set(topbarIcons, {
    stroke: theme.accent,
  });

  gsap.set(topbar, {
    yPercent: -100,
    autoAlpha: 0,
  });

  ScrollTrigger.create({
    trigger: SELECTORS.heroSection,
    start: ANIMATION.topbar.start,

    onEnter: () => {
      gsap.to(topbar, {
        yPercent: 0,
        autoAlpha: 1,
        duration: ANIMATION.topbar.showDuration,
        ease: "power3.out",
      });
    },

    onLeaveBack: () => {
      gsap.to(topbar, {
        yPercent: -100,
        autoAlpha: 0,
        duration: ANIMATION.topbar.hideDuration,
        ease: "power3.in",
      });
    },
  });
}

function setupHeroModelParallax() {
  gsap.to(SELECTORS.modelWrapper, {
    y: ANIMATION.heroModel.y,
    scale: ANIMATION.heroModel.scale,
    rotate: ANIMATION.heroModel.rotate,
    ease: "none",
    scrollTrigger: {
      trigger: SELECTORS.heroSection,
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });
}

function setupHorizontalGallery(pageElement: HTMLElement) {
  const horizontalTrack = pageElement.querySelector(
    SELECTORS.horizontalTrack
  ) as HTMLElement | null;

  if (!horizontalTrack) return;

  gsap.fromTo(
    horizontalTrack,
    {
      x: () => window.innerWidth * ANIMATION.gallery.startXRatio,
    },
    {
      x: () => -(horizontalTrack.scrollWidth - window.innerWidth),
      ease: "none",
      scrollTrigger: {
        trigger: SELECTORS.horizontalSection,
        start: "top top",
        end: () =>
          `+=${horizontalTrack.scrollWidth * ANIMATION.gallery.scrollLengthMultiplier}`,
        scrub: ANIMATION.gallery.scrub,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    }
  );
}

function setupStoryRevealAnimation(theme: TeamTheme) {
  gsap.fromTo(
    SELECTORS.revealWord,
    {
      color: theme.storyBefore,
    },
    {
      color: theme.storyAfter,
      stagger: ANIMATION.storyReveal.wordStagger,
      ease: "none",
      scrollTrigger: {
        trigger: SELECTORS.textRevealSection,

        // Ghim text reveal ngay khi nó chạm đầu màn hình
        start: "top top",

        // Tăng độ dài scroll của text reveal
        // Nếu vẫn chưa đọc hết đã xuống gallery, tăng số này lên
        end: `+=${ANIMATION.storyReveal.scrollLength}`,

        scrub: true,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    }
  );
}

function setupCarDetailAnimations(pageElement: HTMLElement) {
  const carDetailRoot = pageElement.querySelector(
    SELECTORS.carDetailRoot
  ) as HTMLElement | null;

  if (!carDetailRoot) return;

  /**
   * Mục 9 section:
   * - Chỉ slide in
   * - Không fade in
   * - Chỉ chạy 1 lần duy nhất
   */
  setupSlideInAnimation(carDetailRoot, ".gsap-fade-up", {
    y: ANIMATION.carDetails.fadeUpY,
  });

  setupSlideInAnimation(carDetailRoot, ".gsap-slide-left", {
    x: -ANIMATION.carDetails.slideX,
  });

  setupSlideInAnimation(carDetailRoot, ".gsap-slide-right", {
    x: ANIMATION.carDetails.slideX,
  });

  setupSlideInAnimation(carDetailRoot, ".gsap-scale-up", {
    y: 80,
  });
}

function setupSlideInAnimation(
  root: HTMLElement,
  selector: string,
  fromVars: gsap.TweenVars
) {
  const elements = Array.from(root.querySelectorAll<HTMLElement>(selector));

  elements.forEach((element) => {
    gsap.from(element, {
      ...fromVars,

      /**
       * Không dùng opacity ở đây,
       * nên element sẽ không fade in nữa.
       */
      duration: ANIMATION.carDetails.fadeDuration,
      ease: "power3.out",

      scrollTrigger: {
        trigger: element,
        start: "top 85%",

        /**
         * Chỉ chạy 1 lần.
         * Khi scroll lên/xuống lại sẽ không replay, không reverse.
         */
        once: true,
        toggleActions: "play none none none",
      },
    });
  });
}

function setupScrollTriggerRefresh() {
  const refreshScrollTrigger = () => {
    ScrollTrigger.refresh();
  };

  window.addEventListener("load", refreshScrollTrigger);

  document.fonts?.ready.then(() => {
    ScrollTrigger.refresh();
  });

  requestAnimationFrame(() => {
    ScrollTrigger.refresh();
  });

  /**
   * Refresh thêm 1 lần sau khi layout ổn định.
   * Không refresh quá nhiều để tránh khựng khi gallery/story có pin.
   */
  const delayedRefresh = gsap.delayedCall(1, () => {
    ScrollTrigger.refresh();
  });

  return () => {
    window.removeEventListener("load", refreshScrollTrigger);
    delayedRefresh.kill();
  };
}
