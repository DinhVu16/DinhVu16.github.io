"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import styles from "./F1TeamsHero.module.css";
import { useRouter } from "next/navigation";

type F1Team = {
  slug: string;
  label: string;
  carName: string;
  image: string;
  logo: string;
  alt: string;
  href: string;
};

const teams: F1Team[] = [
  {
    slug: "mercedes",
    label: "Mercedes",
    carName: "F1 W11 EQ Performance",
    image: "/images/mercedes.jpg",
    logo: "/logos/mercedes.svg",
    alt: "Xe đua Mercedes",
    href: "/teams/mercedes",
  },
  {
    slug: "redbull",
    label: "Red Bull",
    carName: "RB16",
    image: "/images/redbull.jpg",
    logo: "/logos/redbull.svg",
    alt: "Xe đua Red Bull",
    href: "/teams/redbull",
  },
  {
    slug: "mclaren",
    label: "McLaren",
    carName: "MCL35",
    image: "/images/mclaren.jpg",
    logo: "/logos/mclaren.svg",
    alt: "Xe đua McLaren",
    href: "/teams/mclaren",
  },
  {
    slug: "racingpoint",
    label: "Racing Point",
    carName: "RP20",
    image: "/images/racingpoint.jpg",
    logo: "/logos/racingpoint.svg",
    alt: "Xe đua Racing Point",
    href: "/teams/racingpoint",
  },
  {
    slug: "renault",
    label: "Renault",
    carName: "R.S.20",
    image: "/images/renault.jpg",
    logo: "/logos/renault.svg",
    alt: "Xe đua Renault",
    href: "/teams/renault",
  },
  {
    slug: "ferrari",
    label: "Ferrari",
    carName: "SF1000",
    image: "/images/ferrari.jpg",
    logo: "/logos/ferrari.svg",
    alt: "Xe đua Ferrari",
    href: "/teams/ferrari",
  },
  {
    slug: "alphatauri",
    label: "AlphaTauri",
    carName: "AT01",
    image: "/images/alphatauri.jpg",
    logo: "/logos/alphatauri.svg",
    alt: "Xe đua AlphaTauri",
    href: "/teams/alphatauri",
  },
  {
    slug: "alfaromeo",
    label: "Alfa Romeo",
    carName: "C39",
    image: "/images/alfaromeo.jpg",
    logo: "/logos/alfaromeo.svg",
    alt: "Xe đua Alfa Romeo",
    href: "/teams/alfaromeo",
  },
  {
    slug: "haas",
    label: "Haas",
    carName: "VF-20",
    image: "/images/haas.jpg",
    logo: "/logos/haas.svg",
    alt: "Xe đua Haas",
    href: "/teams/haas",
  },
  {
    slug: "williams",
    label: "Williams",
    carName: "FW43",
    image: "/images/williams.jpg",
    logo: "/logos/williams.svg",
    alt: "Xe đua Williams",
    href: "/teams/williams",
  },
];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function F1TeamsHero() {
  const router = useRouter();

  const [activeSlug, setActiveSlug] = useState("mclaren");
  const colRefs = useRef<Array<HTMLAnchorElement | null>>([]);

  const isNavigatingRef = useRef(false);

  function getCols() {
    return colRefs.current.filter(Boolean) as HTMLAnchorElement[];
  }

  function runHeroIntro() {
    const cols = getCols();

    if (cols.length === 0) return;

    gsap.fromTo(
      cols,
      {
        opacity: 0,
        y: 24,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.06,
        ease: "power3.out",
        clearProps: "opacity,transform",
      }
    );

    gsap.fromTo(
      `.${styles.logo}`,
      {
        y: -18,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 0.38,
        duration: 0.7,
        stagger: 0.04,
        delay: 0.12,
        ease: "power3.out",
        clearProps: "opacity,transform",
      }
    );
  }

  function handleHover(team: F1Team) {
    setActiveSlug(team.slug);
  }

  function handleTeamClick(team: F1Team) {
  /**
   * Chặn double click làm transition bị gọi nhiều lần.
   */
  if (isNavigatingRef.current) return;

  isNavigatingRef.current = true;

  /**
   * Báo cho LoadingScreen biết đây là chuyển trang trong app,
   * không phải refresh lần đầu.
   */
  sessionStorage.setItem("app-loading-complete", "true");

  /**
   * Fallback 1:
   * Nếu Next Link / TransitionRouter bị kẹt,
   * router.push sẽ thử chuyển trang lại.
   */
  window.setTimeout(() => {
    if (window.location.pathname !== team.href) {
      router.push(team.href);
    }
  }, 700);

  /**
   * Fallback 2 mạnh hơn:
   * Nếu sau 1.5s vẫn đứng ở hero, ép trình duyệt sang trang team.
   * Vì sessionStorage đã set app-loading-complete,
   * LoadingScreen sẽ không chạy lại.
   */
  window.setTimeout(() => {
    if (window.location.pathname !== team.href) {
      window.location.assign(team.href);
    }
  }, 1500);
}

  useEffect(() => {
    runHeroIntro();

    return () => {
      /**
       * Chỉ kill animation của cột/logo trong hero.
       * Không dùng gsap.killTweensOf("*") vì có thể kill nhầm
       * LoadingScreen, TransitionRouter, Topbar hoặc animation section khác.
       */
      gsap.killTweensOf(getCols());
      gsap.killTweensOf(`.${styles.logo}`);
    };
  }, []);

  return (
    <main className={styles.root}>
      <header className={styles.heroColumns}>
        <div className={styles.columns}>
          {teams.map((team, index) => (
            <Link
              key={team.slug}
              href={team.href}
              prefetch
              ref={(element) => {
                colRefs.current[index] = element;
              }}
              className={cx(
                styles.col,
                activeSlug === team.slug && styles.active
              )}
              aria-label={team.label}
              onMouseEnter={() => handleHover(team)}
              onFocus={() => handleHover(team)}
              onClick={() => handleTeamClick(team)}
            >
              <img className={styles.image} src={team.image} alt={team.alt} />

              <div className={styles.shade} />

              <img
                className={styles.logo}
                src={team.logo}
                alt={`Logo ${team.label}`}
              />

              <span className={styles.name}>{team.carName}</span>
            </Link>
          ))}
        </div>
      </header>
    </main>
  );
}
