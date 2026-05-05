"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";

/* =========================================================
   LOADING CONFIG
   ---------------------------------------------------------
   Những chỗ bạn hay chỉnh để ở đây cho dễ sửa.
========================================================= */
const LOADING = {
  // Kích thước vòng dot.
  radius: 80,
  loaderSize: 280,
  dotSize: 14,

  // Dot càng dày thì stepDegree càng nhỏ.
  // radius = 80 nên stepDegree = 4 sẽ ít bị hở dot.
  stepDegree: 4,
  maxSpawnSteps: 45,

  // Tốc độ sinh dot.
  spawnMoveDuration: 0.025,
  spawnGapDuration: 0.003,

  // Dot B tách ra khi dot A chưa dừng hẳn.
  dotBStartAt: 0.58,

  // Tốc độ xoay.
  startSpinSpeed: 2.6,
  finalSpinSpeed: 36,

  // Bộ đếm mph.
  maxSpeed: 100,

  /**
   * Vị trí bộ đếm so với tâm vòng tròn.
   * Tăng số này để chữ xuống thấp hơn.
   * Giảm số này để chữ sát vòng hơn.
   */
  speedHudOffsetY: 140,

  // Màu.
  initialBackground: "#ffffff",
  initialDotColor: "#e10600",
  flashBackground: "#050505",
  neonDotColor: "#ffffff",
} as const;

const DOT_COUNT = 2 + LOADING.maxSpawnSteps * 2;

/* =========================================================
   HELPERS
========================================================= */
function shouldShowLoadingOnMount() {
  if (typeof window === "undefined") return true;

  const navEntry = performance.getEntriesByType(
    "navigation"
  )[0] as PerformanceNavigationTiming | undefined;

  const navType = navEntry?.type;
  const hasLoadedBefore =
    sessionStorage.getItem("app-loading-complete") === "true";

  return navType === "reload" || !hasLoadedBefore;
}

/**
 * Đổi góc thành tọa độ x/y trên vòng tròn.
 *
 * Quy ước màn hình:
 * 0deg   = bên phải
 * 90deg  = phía dưới
 * 180deg = bên trái
 * 270deg = phía trên
 *
 * Tăng góc = theo chiều kim đồng hồ.
 */
function angleToPosition(degree: number, radius: number) {
  const radian = (degree * Math.PI) / 180;

  return {
    x: Math.cos(radian) * radius,
    y: Math.sin(radian) * radius,
  };
}

function setAppLoadingComplete() {
  sessionStorage.setItem("app-loading-complete", "true");
  window.dispatchEvent(new Event("app-loading-complete"));
}

/* =========================================================
   COMPONENT
========================================================= */
export default function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(() => shouldShowLoadingOnMount());

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const squashRef = useRef<HTMLDivElement | null>(null);
  const rotateBoxRef = useRef<HTMLDivElement | null>(null);
  const dotRefs = useRef<HTMLSpanElement[]>([]);

  /**
   * speedHudRef:
   * Bộ đếm mph nằm giữa phía dưới vòng tròn.
   * Khi flash nền đen + dot neon, bộ đếm này sẽ biến mất.
   */
  const speedHudRef = useRef<HTMLDivElement | null>(null);
  const speedTextRef = useRef<HTMLSpanElement | null>(null);

  useLayoutEffect(() => {
    if (!isVisible) {
      setAppLoadingComplete();
      return;
    }

    const overlay = overlayRef.current;
    const loader = loaderRef.current;
    const squash = squashRef.current;
    const rotateBox = rotateBoxRef.current;
    const speedHud = speedHudRef.current;
    const speedText = speedTextRef.current;
    const dots = dotRefs.current.filter(Boolean);

    if (
      !overlay ||
      !loader ||
      !squash ||
      !rotateBox ||
      !speedHud ||
      !speedText ||
      dots.length < DOT_COUNT
    ) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const dotAPosition = angleToPosition(180, LOADING.radius);
    const dotBPosition = angleToPosition(0, LOADING.radius);
    const dotAStartX = -window.innerWidth / 2 - 140;

    /**
     * Rotation chạy liên tục bằng ticker.
     * Số mph được tính tỉ lệ thuận với spinSpeed.value.
     */
    const spinSpeed = { value: 0 };
    let rotation = 0;
    let displayedSpeed = 0;

    const updateRotation = () => {
      rotation += spinSpeed.value * gsap.ticker.deltaRatio(60);

      gsap.set(rotateBox, {
        rotate: rotation,
      });

      /**
       * Công thức mph:
       * spinSpeed càng cao thì mph càng cao.
       */
      const targetSpeed = Math.min(
        LOADING.maxSpeed,
        Math.round(
          (spinSpeed.value / LOADING.finalSpinSpeed) * LOADING.maxSpeed
        )
      );

      /**
       * Làm số chạy mượt hơn, không giật quá mạnh.
       */
      displayedSpeed += (targetSpeed - displayedSpeed) * 0.18;
      speedText.textContent = `${Math.round(displayedSpeed)} mph`;
    };

    gsap.ticker.add(updateRotation);

    const spawnDotPair = (step: number) => {
      const aIndex = 2 + (step - 1) * 2;
      const bIndex = aIndex + 1;

      const aStartAngle = 180 + (step - 1) * LOADING.stepDegree;
      const aEndAngle = 180 + step * LOADING.stepDegree;

      const bStartAngle = 0 + (step - 1) * LOADING.stepDegree;
      const bEndAngle = 0 + step * LOADING.stepDegree;

      const aStart = angleToPosition(aStartAngle, LOADING.radius);
      const aEnd = angleToPosition(aEndAngle, LOADING.radius);

      const bStart = angleToPosition(bStartAngle, LOADING.radius);
      const bEnd = angleToPosition(bEndAngle, LOADING.radius);

      return gsap
        .timeline()
        .set(dots[aIndex], {
          x: aStart.x,
          y: aStart.y,
          autoAlpha: 0,
          scale: 1,
        })
        .set(dots[bIndex], {
          x: bStart.x,
          y: bStart.y,
          autoAlpha: 0,
          scale: 1,
        })
        .to(
          dots[aIndex],
          {
            autoAlpha: 1,
            x: aEnd.x,
            y: aEnd.y,
            duration: LOADING.spawnMoveDuration,
            ease: "sine.inOut",
          },
          0
        )
        .to(
          dots[bIndex],
          {
            autoAlpha: 1,
            x: bEnd.x,
            y: bEnd.y,
            duration: LOADING.spawnMoveDuration,
            ease: "sine.inOut",
          },
          0
        );
    };

    const tl = gsap.timeline({
      defaults: {
        ease: "power3.out",
      },
      onComplete: () => {
        gsap.ticker.remove(updateRotation);
        document.body.style.overflow = originalOverflow;

        setAppLoadingComplete();
        setIsVisible(false);
      },
    });

    tl
      /* =========================
         SETUP BAN ĐẦU
      ========================= */
      .set(overlay, {
        autoAlpha: 1,
        backgroundColor: LOADING.initialBackground,
      })
      .set(loader, {
        autoAlpha: 1,
        scale: 1,
        force3D: true,
      })
      .set(squash, {
        scaleX: 1,
        scaleY: 1,
        skewX: 0,
        transformOrigin: "50% 50%",
        force3D: true,
      })
      .set(rotateBox, {
        rotate: 0,
        transformOrigin: "50% 50%",
        force3D: true,
      })
      .set(dots, {
        x: 0,
        y: 0,
        autoAlpha: 0,
        scale: 1,
        backgroundColor: LOADING.initialDotColor,
        boxShadow: "none",
        force3D: true,
      })

      /**
       * Bộ đếm mph:
       * Chỉ set autoAlpha, không set y/transform ở GSAP.
       * Nếu set y bằng GSAP, nó sẽ đè transform CSS và làm chữ chui vào giữa vòng.
       */
      .set(speedHud, {
        autoAlpha: 1,
      })
      .set(speedText, {
        textContent: "0 mph",
      })

      /* =========================
         DOT A + DOT B
      ========================= */
      .set(dots[0], {
        x: dotAStartX,
        y: 0,
        autoAlpha: 1,
      })
      .set(dots[1], {
        x: dotAPosition.x,
        y: dotAPosition.y,
        autoAlpha: 0,
      })
      .addLabel("dotAIn")
      .to(
        dots[0],
        {
          x: dotAPosition.x,
          y: dotAPosition.y,
          duration: 0.9,
          ease: "power4.out",
        },
        "dotAIn"
      )
      .set(
        dots[1],
        {
          x: dotAPosition.x,
          y: dotAPosition.y,
          autoAlpha: 1,
        },
        `dotAIn+=${LOADING.dotBStartAt}`
      )
      .to(
        dots[1],
        {
          x: dotBPosition.x,
          y: dotBPosition.y,
          duration: 0.42,
          ease: "power2.inOut",
        },
        `dotAIn+=${LOADING.dotBStartAt}`
      )

      /* =========================
         BẮT ĐẦU XOAY + HIỆN MPH
      ========================= */
      .to(
        spinSpeed,
        {
          value: LOADING.startSpinSpeed,
          duration: 0.3,
          ease: "sine.inOut",
        },
        "-=0.05"
      )

      .to({}, { duration: 0.12 });

    /* =========================
       SINH DOT THÀNH VÒNG TRÒN
    ========================= */
    for (let step = 1; step <= LOADING.maxSpawnSteps; step += 1) {
      const label = `spawn-${step}`;

      tl.add(spawnDotPair(step), label).to(
        spinSpeed,
        {
          value: LOADING.startSpinSpeed + step * 0.72,
          duration: 0.12,
          ease: "sine.inOut",
        },
        label
      );

      tl.to({}, { duration: LOADING.spawnGapDuration });
    }

    tl
      /* =========================
         TĂNG TỐC + BIẾN DẠNG NHẸ
      ========================= */
      .to(spinSpeed, {
        value: LOADING.finalSpinSpeed,
        duration: 0.42,
        ease: "power2.in",
      })
      .to(
        squash,
        {
          scaleX: 1.04,
          scaleY: 0.96,
          skewX: -2,
          duration: 0.2,
          ease: "sine.inOut",
        },
        "<"
      )
      .to(
        squash,
        {
          scaleX: 1.08,
          scaleY: 0.93,
          skewX: -5,
          duration: 0.22,
          ease: "sine.inOut",
        },
        "<+=0.08"
      )
      .to(
        squash,
        {
          scaleX: 1.12,
          scaleY: 0.9,
          skewX: -8,
          duration: 0.26,
          ease: "power2.inOut",
        },
        "<+=0.08"
      )

      /**
       * Giữ một nhịp sau khi biến dạng nhẹ.
       */
      .to({}, { duration: 0.2 })

      /**
       * Flash 1 phát:
       * - nền đen
       * - dot neon xanh
       * - bộ đếm mph biến mất cùng lúc
       */
      .to(overlay, {
        backgroundColor: LOADING.flashBackground,
        duration: 0.045,
        ease: "none",
      })
      .to(
        dots,
        {
          backgroundColor: LOADING.neonDotColor,
          boxShadow:
            "0 0 6px rgba(255,255,255,0.9), 0 0 14px rgba(255,255,255,0.45)",
          duration: 0.045,
          ease: "none",
        },
        "<"
      )
      .to(
        speedHud,
        {
          autoAlpha: 0,
          duration: 0.045,
          ease: "none",
        },
        "<"
      )

      /**
       * Giữ cực ngắn để thấy flash.
       */
      .to({}, { duration: 0.12 })

      /**
       * Loading biến mất để vào web.
       */
      .to(overlay, {
        autoAlpha: 0,
        duration: 0.22,
        ease: "power2.out",
      });

    return () => {
      tl.kill();
      gsap.ticker.remove(updateRotation);
      gsap.killTweensOf(dots);
      gsap.killTweensOf([
        overlay,
        loader,
        squash,
        rotateBox,
        speedHud,
        speedText,
      ]);
      document.body.style.overflow = originalOverflow;
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const halfLoaderSize = LOADING.loaderSize / 2;
  const halfDotSize = LOADING.dotSize / 2;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-white"
    >
      <div
        ref={loaderRef}
        className="relative will-change-[opacity,transform]"
        style={{
          width: LOADING.loaderSize,
          height: LOADING.loaderSize,
        }}
      >
        {/* Lớp này dùng để bóp vòng tròn thành elip nhẹ */}
        <div
          ref={squashRef}
          className="absolute left-1/2 top-1/2 will-change-transform"
          style={{
            width: LOADING.loaderSize,
            height: LOADING.loaderSize,
            marginLeft: -halfLoaderSize,
            marginTop: -halfLoaderSize,
          }}
        >
          {/* Lớp này chỉ lo xoay dot */}
          <div
            ref={rotateBoxRef}
            className="relative h-full w-full will-change-transform"
          >
            {Array.from({ length: DOT_COUNT }).map((_, index) => (
              <span
                key={index}
                ref={(element) => {
                  if (element) dotRefs.current[index] = element;
                }}
                className="absolute left-1/2 top-1/2 rounded-full"
                style={{
                  width: LOADING.dotSize,
                  height: LOADING.dotSize,
                  marginLeft: -halfDotSize,
                  marginTop: -halfDotSize,
                  backgroundColor: LOADING.initialDotColor,
                }}
              />
            ))}
          </div>
        </div>

        {/*
          Bộ đếm mph nằm giữa phía dưới vòng tròn.
          Chỉnh vị trí ở LOADING.speedHudOffsetY.
        */}
        <div
          ref={speedHudRef}
          className="pointer-events-none absolute left-1/2 top-1/2 z-20 font-mono text-[32px] font-black tracking-[-0.08em] text-black"
          style={{
            transform: `translate(-50%, ${LOADING.speedHudOffsetY}px)`,
          }}
        >
          <span ref={speedTextRef}>0 mph</span>
        </div>
      </div>
    </div>
  );
}
