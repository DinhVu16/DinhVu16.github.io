"use client";

import { startTransition, useRef } from "react";
import { gsap } from "gsap";
import { TransitionRouter } from "next-transition-router";

export default function TransitionFunc({
  children,
}: {
  children: React.ReactNode;
}) {
  const leftCanvasRef = useRef<HTMLDivElement | null>(null);
  const rightCanvasRef = useRef<HTMLDivElement | null>(null);
  const lineRef = useRef<HTMLDivElement | null>(null);

  return (
    <TransitionRouter
      auto={true}
      leave={(next) => {
        const leftCanvas = leftCanvasRef.current;
        const rightCanvas = rightCanvasRef.current;
        const line = lineRef.current;

        /**
         * Nếu ref chưa sẵn sàng thì cho chuyển trang luôn,
         * tránh bị đứng ở transition.
         */
        if (!leftCanvas || !rightCanvas || !line) {
          next();
          return () => {};
        }

        /**
         * Báo cho LoadingScreen biết đây là chuyển trang trong app,
         * không phải refresh thật.
         */
        sessionStorage.setItem("app-loading-complete", "true");

        let hasNavigated = false;

        const safeNext = () => {
          if (hasNavigated) return;

          hasNavigated = true;
          window.clearTimeout(fallbackTimer);
          next();
        };

        /**
         * Fallback:
         * Nếu GSAP onComplete bị miss ở production/GitHub,
         * vẫn ép chuyển trang sau 1 giây.
         */
        const fallbackTimer = window.setTimeout(() => {
          safeNext();
        }, 1000);

        const tl = gsap
          .timeline({
            onComplete: safeNext,
          })
          .set(line, {
            y: 0,
            scaleY: 0,
          })
          .set(leftCanvas, {
            x: "0%",
            scaleX: 0,
          })
          .set(rightCanvas, {
            x: "0%",
            scaleX: 0,
          })

          /**
           * 1. Đường line đen rơi xuống giữa màn hình.
           */
          .to(line, {
            scaleY: 1,
            duration: 0.35,
            ease: "expo.inOut",
          })

          /**
           * 2. Hai mảng trắng mở ra từ giữa.
           */
          .to(
            [leftCanvas, rightCanvas],
            {
              scaleX: 1,
              duration: 0.45,
              ease: "power2.inOut",
            },
            "-=0.15"
          );

        return () => {
          window.clearTimeout(fallbackTimer);
          tl.kill();
        };
      }}
      enter={(next) => {
        const leftCanvas = leftCanvasRef.current;
        const rightCanvas = rightCanvasRef.current;
        const line = lineRef.current;

        if (!leftCanvas || !rightCanvas || !line) {
          startTransition(next);
          return () => {};
        }

        let hasEntered = false;

        const safeEnter = () => {
          if (hasEntered) return;

          hasEntered = true;
          window.clearTimeout(fallbackTimer);

          requestAnimationFrame(() => {
            startTransition(next);
          });
        };

        /**
         * Fallback:
         * Nếu enter animation gặp vấn đề, vẫn render page mới.
         */
        const fallbackTimer = window.setTimeout(() => {
          safeEnter();
        }, 900);

        const tl = gsap
          .timeline()
          /**
           * Render page mới khi màn trắng đang che.
           */
          .call(() => {
            safeEnter();
          })

          /**
           * Giữ màn trắng một nhịp ngắn.
           */
          .to({}, { duration: 0.3 })

          /**
           * 3. Line đen chạy xuống dưới.
           */
          .fromTo(
            line,
            {
              scaleY: 1,
              y: 0,
            },
            {
              y: "100vh",
              duration: 0.3,
              ease: "power2.in",
            }
          )

          /**
           * 4. Hai mảng trắng kéo ra hai bên để reveal page mới.
           */
          .fromTo(
            leftCanvas,
            {
              scaleX: 1,
              x: "0%",
            },
            {
              x: "-100%",
              duration: 0.6,
              ease: "expo.out",
            },
            "-=0.1"
          )
          .fromTo(
            rightCanvas,
            {
              scaleX: 1,
              x: "0%",
            },
            {
              x: "100%",
              duration: 0.6,
              ease: "expo.out",
            },
            "<"
          )
          .set([leftCanvas, rightCanvas], {
            scaleX: 0,
            x: "0%",
          })
          .set(line, {
            scaleY: 0,
            y: 0,
          });

        return () => {
          window.clearTimeout(fallbackTimer);
          tl.kill();
        };
      }}
    >
      {children}

      <div className="pointer-events-none fixed inset-0 z-[9999] flex overflow-hidden">
        <div
          ref={leftCanvasRef}
          className="h-full w-1/2 origin-right scale-x-0 bg-white"
        />

        <div
          ref={rightCanvasRef}
          className="h-full w-1/2 origin-left scale-x-0 bg-white"
        />

        <div
          ref={lineRef}
          className="absolute left-1/2 top-0 h-full w-[5px] origin-top -translate-x-1/2 scale-y-0 bg-black"
        />
      </div>
    </TransitionRouter>
  );
}