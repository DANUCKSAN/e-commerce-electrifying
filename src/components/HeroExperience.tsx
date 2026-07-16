"use client";

import {
  ArrowDown,
  ArrowRight,
  BatteryCharging,
  Check,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, type MouseEvent } from "react";

import powerStationImage from "../../public/images/portable-power-station-hero.png";
import styles from "./HeroExperience.module.css";

const NAV_HEIGHT = 72;

const sectors = [
  { label: "Solar", href: "/?sector=solar#catalogue" },
  { label: "Storage", href: "/?sector=storage#catalogue" },
  { label: "EV charging", href: "/?sector=charging#catalogue" },
  { label: "Outdoors", href: "/?sector=outdoors#catalogue" },
] as const;

const productDepthLayers = Array.from({ length: 9 }, (_, index) => ({
  opacity: 0.055 + index * 0.012,
  transform: `translate3d(${(index + 1) * 0.7}px, ${(index + 1) * 0.3}px, ${-(index + 1) * 2.2}px)`,
}));

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

function smoothstep(value: number) {
  const bounded = clamp(value);
  return bounded * bounded * (3 - 2 * bounded);
}

export default function HeroExperience() {
  const heroRef = useRef<HTMLElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const dealsRef = useRef<HTMLDivElement>(null);

  const revealDeal = (event: MouseEvent<HTMLAnchorElement>) => {
    const hero = heroRef.current;

    if (!hero || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    event.preventDefault();

    const heroTop = window.scrollY + hero.getBoundingClientRect().top;
    const stickyHeight = Math.max(1, window.innerHeight - NAV_HEIGHT);
    const scrollRange = Math.max(1, hero.offsetHeight - stickyHeight);

    window.scrollTo({
      top: heroTop - NAV_HEIGHT + scrollRange * 0.78,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const hero = heroRef.current;
    const intro = introRef.current;
    const deals = dealsRef.current;

    if (!hero || !intro || !deals) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reducedMotion.matches) return;

    hero.dataset.motion = "ready";

    let frame = 0;
    let currentProgress = 0;
    let targetProgress = 0;
    let previousTime = 0;
    let introIsInteractive = true;
    let dealsAreInteractive = true;

    const updateIntroAccessibility = (isInteractive: boolean) => {
      if (isInteractive === introIsInteractive) return;

      introIsInteractive = isInteractive;
      intro.inert = !isInteractive;

      if (isInteractive) {
        intro.removeAttribute("aria-hidden");
        hero.setAttribute("aria-labelledby", "hero-title");
      } else {
        intro.setAttribute("aria-hidden", "true");
        hero.setAttribute("aria-labelledby", "featured-deal-title");
      }
    };

    const updateDealAccessibility = (isInteractive: boolean) => {
      if (isInteractive === dealsAreInteractive) return;

      dealsAreInteractive = isInteractive;
      deals.inert = !isInteractive;

      if (isInteractive) {
        deals.removeAttribute("aria-hidden");
      } else {
        deals.setAttribute("aria-hidden", "true");
      }
    };

    const render = (rawProgress: number) => {
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const sceneProgress = smoothstep((rawProgress - 0.04) / 0.88);
      const productProgress = smoothstep(sceneProgress / 0.74);
      const firstDeal = smoothstep((sceneProgress - 0.48) / 0.3);
      const secondDeal = smoothstep((sceneProgress - 0.67) / 0.22);
      const trustRow = smoothstep((sceneProgress - 0.78) / 0.18);
      const isDesktop = viewportWidth >= 960;
      const rotationArc = Math.sin(productProgress * Math.PI);

      const travel = isDesktop
        ? Math.min(viewportWidth * 0.39, 620)
        : viewportWidth * 0.08;
      const verticalTravel = isDesktop
        ? (1 - productProgress) * -16
        : (1 - productProgress) * Math.min(viewportHeight * 0.28, 180);
      const scale = isDesktop
        ? 0.78 + productProgress * 0.26
        : 0.94 - productProgress * 0.1;
      const yaw = isDesktop
        ? -10 * (1 - productProgress) + rotationArc * 28
        : -5 * (1 - productProgress) + rotationArc * 9;
      const pitch = isDesktop ? 2 - rotationArc * 9 : -rotationArc * 4;
      const roll = isDesktop
        ? -5 * (1 - productProgress) + rotationArc * 2.5
        : -4 + productProgress * 7;
      const depth = isDesktop ? rotationArc * 72 : rotationArc * 24;
      const introOpacity = Math.max(
        0,
        1 - productProgress * (isDesktop ? 1.45 : 1.6),
      );

      hero.style.setProperty(
        "--battery-x",
        `${(1 - productProgress) * travel}px`,
      );
      hero.style.setProperty("--battery-y", `${verticalTravel}px`);
      hero.style.setProperty("--battery-rotate", `${roll}deg`);
      hero.style.setProperty("--battery-yaw", `${yaw}deg`);
      hero.style.setProperty("--battery-pitch", `${pitch}deg`);
      hero.style.setProperty("--battery-z", `${depth}px`);
      hero.style.setProperty("--battery-counter-yaw", `${-yaw}deg`);
      hero.style.setProperty("--battery-scale", scale.toFixed(3));
      hero.style.setProperty(
        "--sheen-x",
        `${-72 + productProgress * 144}%`,
      );
      hero.style.setProperty(
        "--sheen-opacity",
        (rotationArc * 0.5).toFixed(3),
      );
      hero.style.setProperty(
        "--shadow-scale",
        (0.78 + productProgress * 0.22).toFixed(3),
      );
      hero.style.setProperty("--shadow-x", `${yaw * -0.8}px`);
      hero.style.setProperty("--intro-opacity", introOpacity.toFixed(3));
      hero.style.setProperty(
        "--intro-y",
        `${-productProgress * (isDesktop ? 24 : 76)}px`,
      );
      hero.style.setProperty("--deal-opacity", firstDeal.toFixed(3));
      hero.style.setProperty("--deal-x", `${(1 - firstDeal) * 96}px`);
      hero.style.setProperty(
        "--deal-scale",
        (0.94 + firstDeal * 0.06).toFixed(3),
      );
      hero.style.setProperty("--bundle-opacity", secondDeal.toFixed(3));
      hero.style.setProperty("--bundle-y", `${(1 - secondDeal) * 32}px`);
      hero.style.setProperty("--trust-opacity", trustRow.toFixed(3));
      hero.style.setProperty("--split-opacity", firstDeal.toFixed(3));
      hero.style.setProperty("--scene-progress", rawProgress.toFixed(3));

      updateIntroAccessibility(introOpacity > 0.12);
      updateDealAccessibility(firstDeal > 0.12);
    };

    const measure = () => {
      const rect = hero.getBoundingClientRect();
      const stickyHeight = Math.max(1, window.innerHeight - NAV_HEIGHT);
      const scrollRange = Math.max(1, hero.offsetHeight - stickyHeight);
      targetProgress = clamp((NAV_HEIGHT - rect.top) / scrollRange);
    };

    const animate = (time: number) => {
      const elapsed = previousTime ? Math.min(64, time - previousTime) : 16;
      previousTime = time;
      const responsiveness = window.innerWidth >= 960 ? 12 : 15;
      const blend = 1 - Math.exp((-responsiveness * elapsed) / 1000);

      currentProgress += (targetProgress - currentProgress) * blend;

      if (Math.abs(targetProgress - currentProgress) < 0.0005) {
        currentProgress = targetProgress;
      }

      render(currentProgress);

      if (currentProgress !== targetProgress) {
        frame = window.requestAnimationFrame(animate);
      } else {
        frame = 0;
        previousTime = 0;
      }
    };

    const requestRender = () => {
      measure();
      if (frame) return;
      frame = window.requestAnimationFrame(animate);
    };

    measure();
    currentProgress = targetProgress;
    render(currentProgress);
    window.addEventListener("scroll", requestRender, { passive: true });
    window.addEventListener("resize", requestRender);

    return () => {
      window.removeEventListener("scroll", requestRender);
      window.removeEventListener("resize", requestRender);
      if (frame) window.cancelAnimationFrame(frame);
      intro.inert = false;
      intro.removeAttribute("aria-hidden");
      deals.inert = false;
      deals.removeAttribute("aria-hidden");
      hero.setAttribute("aria-labelledby", "hero-title");
      delete hero.dataset.motion;
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className={styles.hero}
      aria-labelledby="hero-title"
    >
      <div className={styles.stickyScene}>
        <div className={styles.canvas}>
          <div className={styles.grid} aria-hidden="true" />
          <div className={styles.glowOne} aria-hidden="true" />
          <div className={styles.glowTwo} aria-hidden="true" />
          <div className={styles.splitLine} aria-hidden="true" />
          <div className={styles.orbit} aria-hidden="true">
            <span />
            <span />
          </div>

          <div className={styles.sceneMeta}>
            <p>
              <span className={styles.liveDot} aria-hidden="true" />
              Winter energy edit
            </p>
            <p className={styles.edition}>Featured drop · 01</p>
          </div>

          <div ref={introRef} className={styles.intro}>
            <p className={styles.eyebrow}>
              <Sparkles aria-hidden="true" />
              Portable power, reimagined
            </p>
            <h1 id="hero-title" className={styles.title}>
              Power goes
              <span>where you go.</span>
            </h1>
            <p className={styles.description}>
              Meet our Anker SOLIX-inspired demo drop: compact backup energy
              for road trips, blackouts and everything beyond the grid.
            </p>
            <div className={styles.actions}>
              <Link
                href="/?sector=storage#catalogue"
                className={styles.primaryAction}
              >
                Shop the drop
                <ArrowRight aria-hidden="true" />
              </Link>
              <Link
                href="#featured-deal"
                className={styles.secondaryAction}
                onClick={revealDeal}
              >
                View demo deal
              </Link>
            </div>
            <ul className={styles.quickSpecs} aria-label="Product highlights">
              <li>
                <strong>1.0 kWh</strong>
                <span>portable capacity</span>
              </li>
              <li>
                <strong>Fast charge</strong>
                <span>ready</span>
              </li>
              <li>
                <strong>Clean energy</strong>
                <span>compatible</span>
              </li>
            </ul>
          </div>

          <div className={styles.productStage}>
            <div className={styles.productHalo} aria-hidden="true" />
            <div className={styles.productDepth} aria-hidden="true">
              {productDepthLayers.map((layer, index) => (
                <span key={index} style={layer} />
              ))}
            </div>
            <div className={styles.productFloat}>
              <Image
                src={powerStationImage}
                alt="Graphite portable power station featured in the demo deal"
                className={styles.productImage}
                sizes="(max-width: 767px) 92vw, (max-width: 1199px) 48vw, 38vw"
                preload
                draggable={false}
              />
            </div>
            <div className={styles.productSheen} aria-hidden="true" />
            <div className={styles.productLabel}>
              <span>
                <BatteryCharging aria-hidden="true" />
              </span>
              <p>
                <strong>Power station</strong>
                <small>Demo product · 1.0 kWh class</small>
              </p>
            </div>
          </div>

          <div ref={dealsRef} id="featured-deal" className={styles.deals}>
            <div className={styles.dealHeading}>
              <div>
                <span className={styles.dealKicker}>Hot right now</span>
                <h2 id="featured-deal-title">One powerful drop.</h2>
              </div>
              <span className={styles.demoPill}>Demo pricing</span>
            </div>

            <article className={styles.mainDeal}>
              <div className={styles.cardTopline}>
                <span>Save 32%</span>
                <Zap aria-hidden="true" />
              </div>
              <p className={styles.productName}>Anker SOLIX C1000</p>
              <p className={styles.productType}>Portable power station</p>
              <div className={styles.priceRow}>
                <p>
                  <span className={styles.price}>$1,099</span>
                  <span className={styles.wasPrice}>$1,619</span>
                </p>
                <span className={styles.saveBadge}>Save $520</span>
              </div>
              <ul className={styles.cardChecks}>
                <li>
                  <Check aria-hidden="true" /> Power a weekend off-grid
                </li>
                <li>
                  <Check aria-hidden="true" /> Solar recharge compatible
                </li>
              </ul>
              <Link
                href="/?sector=storage#catalogue"
                className={styles.dealAction}
              >
                Claim this deal
                <ArrowRight aria-hidden="true" />
              </Link>
            </article>

            <article className={styles.bundleDeal}>
              <div className={styles.bundleIcon}>
                <Zap aria-hidden="true" />
              </div>
              <div>
                <span>Complete the setup</span>
                <strong>Add a 200W solar panel</strong>
                <small>Bundle price · +$249</small>
              </div>
              <span className={styles.bundleSaving}>-$130</span>
            </article>

            <ul className={styles.trustRow} aria-label="Purchase benefits">
              <li>
                <PackageCheck aria-hidden="true" /> Free delivery
              </li>
              <li>
                <ShieldCheck aria-hidden="true" /> 5-year cover
              </li>
            </ul>
          </div>

          <div className={styles.scrollCue} aria-hidden="true">
            <span className={styles.scrollTrack}>
              <span className={styles.scrollFill} />
            </span>
            <span>Scroll to reveal</span>
            <ArrowDown />
          </div>

          <nav className={styles.sectorNav} aria-label="Explore product sectors">
            <span className={styles.sectorLabel}>Explore</span>
            {sectors.map((sector) => (
              <Link key={sector.href} href={sector.href}>
                {sector.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}
