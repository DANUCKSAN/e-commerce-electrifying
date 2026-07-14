"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowDownRight,
  ArrowUpRight,
  BatteryCharging,
  ShieldCheck,
  Sparkles,
  SunMedium,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useLayoutEffect, useRef } from "react";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2 focus-visible:ring-offset-[#e8f7f1]";

const batteryModules = Array.from({ length: 6 }, (_, index) => index);

function BatteryCabinet() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto aspect-[0.73] w-[min(72vw,20.5rem)] rounded-[2.6rem] border border-white/15 bg-[linear-gradient(145deg,#26322f_0%,#0b1110_46%,#18201e_100%)] p-2.5 shadow-[0_38px_90px_rgba(4,20,15,0.28),inset_0_1px_0_rgba(255,255,255,0.16)] sm:w-[22rem] sm:rounded-[3rem] sm:p-3 xl:w-[24rem]"
    >
      <span className="absolute -right-1 top-[13%] h-[73%] w-3 rounded-r-full bg-[linear-gradient(180deg,#82f2c4,#007d48_45%,#09120f)] opacity-70 shadow-[0_0_24px_rgba(57,211,147,0.5)]" />
      <span className="absolute -left-1 top-[22%] h-[53%] w-2 rounded-l-full bg-white/10" />

      <div className="relative flex h-full flex-col overflow-hidden rounded-[2.15rem] border border-white/10 bg-[linear-gradient(155deg,rgba(255,255,255,0.08),rgba(255,255,255,0.015)_34%,rgba(0,0,0,0.26))] px-4 pb-4 pt-5 sm:rounded-[2.5rem] sm:px-5 sm:pb-5 sm:pt-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-white">
              <span className="flex size-7 items-center justify-center rounded-full bg-emerald-400/15 ring-1 ring-inset ring-emerald-300/30">
                <SunMedium className="size-3.5 text-emerald-300" strokeWidth={1.8} />
              </span>
              <span className="text-[0.72rem] font-semibold tracking-[0.18em]">
                NOVA CELL
              </span>
            </div>
            <p className="mt-2 text-[0.58rem] font-medium uppercase tracking-[0.22em] text-white/42">
              Home energy system
            </p>
          </div>

          <div className="grid grid-cols-5 gap-1 pt-1">
            {Array.from({ length: 10 }, (_, index) => (
              <span
                key={index}
                className="h-3 w-px rounded-full bg-white/25"
              />
            ))}
          </div>
        </div>

        <div className="mt-5 grid flex-1 grid-cols-2 gap-2 sm:mt-6 sm:gap-2.5">
          {batteryModules.map((module) => (
            <div
              key={module}
              className="relative overflow-hidden rounded-[1.05rem] border border-white/[0.07] bg-[linear-gradient(145deg,rgba(255,255,255,0.055),rgba(0,0,0,0.18))] shadow-[inset_0_1px_0_rgba(255,255,255,0.055)]"
            >
              <span className="absolute inset-x-3 top-3 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              <span className="absolute bottom-3 left-3 size-1 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.9)]" />
              <span className="absolute bottom-3 right-3 text-[0.46rem] font-medium tracking-[0.16em] text-white/25">
                M{String(module + 1).padStart(2, "0")}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-[1fr_auto] items-center gap-3 rounded-[1.2rem] border border-emerald-200/15 bg-black/30 px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-sm sm:mt-4 sm:px-4">
          <div className="flex items-center gap-2.5">
            <span className="relative flex size-7 items-center justify-center rounded-full bg-emerald-400/10">
              <Zap className="size-3.5 text-emerald-300" strokeWidth={1.8} />
              <span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.85)]" />
            </span>
            <div>
              <p className="text-[0.55rem] uppercase tracking-[0.16em] text-white/38">
                Available now
              </p>
              <p className="mt-0.5 text-[0.68rem] font-medium text-white/75">
                8.4 kW output
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold leading-none tracking-[-0.05em] text-white sm:text-[1.7rem]">
              78<span className="ml-0.5 text-sm text-emerald-300">%</span>
            </p>
            <p className="mt-1 text-[0.48rem] uppercase tracking-[0.17em] text-white/32">
              charged
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpecChip({
  className,
  icon: Icon,
  label,
  value,
}: {
  className: string;
  icon: typeof BatteryCharging;
  label: string;
  value: string;
}) {
  return (
    <div
      data-spec-chip
      className={`absolute z-20 flex items-center gap-2.5 rounded-2xl border border-white/65 bg-white/72 px-3 py-2.5 shadow-[0_16px_45px_rgba(16,68,51,0.12)] backdrop-blur-xl sm:gap-3 sm:rounded-[1.25rem] sm:px-4 sm:py-3 ${className}`}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-dark-900 text-emerald-300 sm:size-9">
        <Icon className="size-4" strokeWidth={1.8} />
      </span>
      <span className="min-w-0 leading-tight">
        <span className="block whitespace-nowrap text-[0.63rem] uppercase tracking-[0.12em] text-dark-700">
          {label}
        </span>
        <span className="mt-0.5 block whitespace-nowrap text-sm font-semibold tracking-[-0.02em] text-dark-900 sm:text-[0.95rem]">
          {value}
        </span>
      </span>
    </div>
  );
}

export function BatteryHero() {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);

    let media: ReturnType<typeof gsap.matchMedia> | undefined;
    const context = gsap.context(() => {
      media = gsap.matchMedia();
      media.add(
        {
          desktop: "(min-width: 64rem)",
          finePointer: "(hover: hover) and (pointer: fine)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (mediaContext) => {
          const conditions = mediaContext.conditions as {
            desktop: boolean;
            finePointer: boolean;
            reduceMotion: boolean;
          };

          if (conditions.reduceMotion) {
            gsap.set(
              "[data-hero-eyebrow], [data-hero-title], [data-hero-copy], [data-hero-actions], [data-battery-intro], [data-battery-orbit], [data-spec-chip], [data-hero-proof]",
              { clearProps: "all" },
            );
            return;
          }

          const intro = gsap.timeline({
            defaults: { duration: 0.9, ease: "power3.out" },
          });

          intro
            .from("[data-hero-eyebrow]", { opacity: 0, y: 18 }, 0.05)
            .from(
              "[data-hero-word]",
              { opacity: 0, yPercent: 28, stagger: 0.08, duration: 1.2 },
              0,
            )
            .from("[data-hero-title]", { opacity: 0, y: 42 }, 0.12)
            .from("[data-hero-copy]", { opacity: 0, y: 24 }, 0.25)
            .from("[data-hero-actions]", { opacity: 0, y: 20 }, 0.36)
            .from(
              "[data-battery-intro]",
              {
                opacity: 0,
                y: conditions.desktop ? 88 : 52,
                scale: 0.87,
                rotation: conditions.desktop ? 5 : 2,
                duration: 1.25,
              },
              0.16,
            )
            .from(
              "[data-spec-chip]",
              { opacity: 0, scale: 0.88, y: 14, stagger: 0.1 },
              0.72,
            )
            .from("[data-hero-proof]", { opacity: 0, y: 18 }, 0.82);

          gsap
            .timeline({
              scrollTrigger: {
                trigger: root,
                start: "top top+=72",
                end: "bottom top+=72",
                scrub: 0.65,
                invalidateOnRefresh: true,
              },
            })
            .to(
              "[data-battery-orbit]",
              {
                yPercent: conditions.desktop ? 16 : 7,
                rotation: conditions.desktop ? 3.5 : 1,
                scale: conditions.desktop ? 0.95 : 0.98,
                ease: "none",
              },
              0,
            )
            .to(
              "[data-hero-wordmark]",
              { opacity: 0.2, yPercent: -6, ease: "none" },
              0,
            )
            .to(
              "[data-hero-copy-block]",
              {
                opacity: conditions.desktop ? 0.42 : 0.7,
                yPercent: -5,
                ease: "none",
              },
              0,
            );

          if (!conditions.desktop || !conditions.finePointer) return;

          const pointerLayer = root.querySelector<HTMLElement>(
            "[data-battery-pointer]",
          );
          if (!pointerLayer) return;

          const moveX = gsap.quickTo(pointerLayer, "x", {
            duration: 0.85,
            ease: "power3.out",
          });
          const moveY = gsap.quickTo(pointerLayer, "y", {
            duration: 0.85,
            ease: "power3.out",
          });

          const onPointerMove = (event: PointerEvent) => {
            const bounds = root.getBoundingClientRect();
            const x = (event.clientX - bounds.left) / bounds.width - 0.5;
            const y = (event.clientY - bounds.top) / bounds.height - 0.5;

            moveX(x * 22);
            moveY(y * 16);
          };

          const onPointerLeave = () => {
            moveX(0);
            moveY(0);
          };

          root.addEventListener("pointermove", onPointerMove);
          root.addEventListener("pointerleave", onPointerLeave);

          return () => {
            root.removeEventListener("pointermove", onPointerMove);
            root.removeEventListener("pointerleave", onPointerLeave);
          };
        },
      );
    }, root);

    return () => {
      media?.revert();
      context.revert();
    };
  }, []);

  return (
    <section
      ref={rootRef}
      id="top"
      aria-labelledby="hero-title"
      className="relative isolate min-h-[calc(100svh-4.5rem)] overflow-clip bg-[#e8f7f1] font-jost text-dark-900"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_78%_22%,rgba(47,210,198,0.32),transparent_32%),radial-gradient(circle_at_8%_78%,rgba(0,125,72,0.2),transparent_34%),linear-gradient(135deg,#eefaf6_0%,#dff4ee_44%,#e9f4fb_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.28] [background-image:linear-gradient(rgba(17,17,17,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(17,17,17,0.06)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:linear-gradient(to_bottom,transparent,black_22%,black_72%,transparent)]"
      />

      <div
        data-hero-wordmark
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[19%] z-0 overflow-hidden text-center sm:top-[14%] lg:top-1/2 lg:-translate-y-1/2"
      >
        <div className="mx-auto flex max-w-[110rem] flex-col text-[clamp(4.2rem,14.8vw,14rem)] font-bold uppercase leading-[0.72] tracking-[-0.085em] text-[#1e5fa6]/[0.12] sm:leading-[0.74] lg:text-[#1058a7]/[0.14]">
          <span data-hero-word>Power</span>
          <span data-hero-word>after sunset</span>
        </div>
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-4.5rem)] w-full max-w-[100rem] flex-col px-4 pb-5 pt-7 sm:px-6 sm:pb-6 sm:pt-9 lg:px-8 lg:pb-7 lg:pt-8">
        <div className="flex items-center justify-between gap-4">
          <p
            data-hero-eyebrow
            className="inline-flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.17em] text-green sm:text-footnote"
          >
            <Sparkles className="size-3.5" strokeWidth={1.8} />
            Energy, on your terms
          </p>
          <p className="hidden items-center gap-2 text-footnote font-medium uppercase tracking-[0.13em] text-dark-700 sm:flex">
            Sydney · Australia
            <span className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" />
          </p>
        </div>

        <div className="grid flex-1 items-center gap-4 pb-4 pt-6 lg:grid-cols-[1fr_1.15fr_0.55fr] lg:gap-3 lg:pb-5 lg:pt-2 xl:grid-cols-[1.02fr_1.14fr_0.58fr]">
          <div
            data-hero-copy-block
            className="relative z-30 max-w-xl self-start pt-2 lg:self-center lg:pt-0"
          >
            <h1
              id="hero-title"
              data-hero-title
              className="max-w-[10ch] text-[clamp(2.75rem,6.5vw,5.25rem)] font-bold leading-[0.92] tracking-[-0.065em] text-dark-900"
            >
              Store more of the energy you make.
            </h1>
            <p
              data-hero-copy
              className="mt-5 max-w-[32rem] text-[1.02rem] leading-7 text-dark-700 sm:text-lead lg:max-w-[26rem]"
            >
              A modular home battery that learns your rhythm, protects your
              essentials, and keeps rooftop solar working long after dark.
            </p>

            <div
              data-hero-actions
              className="mt-7 flex flex-wrap items-center gap-3"
            >
              <Link
                href="#products"
                className={`inline-flex min-h-12 items-center gap-3 rounded-full bg-dark-900 px-5 text-caption text-light-100 shadow-[0_14px_35px_rgba(17,17,17,0.2)] transition-[background-color,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:bg-green hover:shadow-[0_16px_38px_rgba(0,125,72,0.24)] motion-reduce:transition-none ${focusRing}`}
              >
                Explore storage
                <ArrowDownRight className="size-4" strokeWidth={1.8} />
              </Link>
              <Link
                href="#solutions"
                className={`inline-flex min-h-12 items-center gap-3 rounded-full border border-dark-900/15 bg-white/55 px-5 text-caption text-dark-900 backdrop-blur-lg transition-[background-color,transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-dark-900/30 hover:bg-white/90 motion-reduce:transition-none ${focusRing}`}
              >
                Build your system
                <ArrowUpRight className="size-4" strokeWidth={1.8} />
              </Link>
            </div>
          </div>

          <div
            data-hero-stage
            className="relative z-20 mx-auto h-[27rem] w-full max-w-[35rem] sm:h-[31rem] lg:h-[min(64vh,40rem)] lg:min-h-[31rem] xl:max-w-[39rem]"
          >
            <SpecChip
              className="left-0 top-[19%] sm:left-[2%] lg:left-0"
              icon={BatteryCharging}
              label="Usable capacity"
              value="13.5 kWh"
            />
            <SpecChip
              className="right-0 top-[10%] sm:right-[2%] lg:right-0"
              icon={ShieldCheck}
              label="Power security"
              value="Blackout ready"
            />
            <SpecChip
              className="bottom-[8%] right-[1%] sm:bottom-[10%] sm:right-[5%] lg:right-0"
              icon={Zap}
              label="Confidence"
              value="10-year warranty"
            />

            <div
              data-battery-pointer
              className="absolute inset-0 will-change-transform"
            >
              <div
                data-battery-intro
                className="absolute inset-0"
              >
                <div
                  data-battery-orbit
                  className="absolute inset-0 flex items-center justify-center will-change-transform"
                >
                  <div className="battery-shadow absolute bottom-[7.5%] left-1/2 h-8 w-[52%] -translate-x-1/2 rounded-full bg-[#052e24]/25 blur-xl sm:bottom-[8.5%]" />
                  <div className="battery-float will-change-transform">
                    <BatteryCabinet />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside
            data-hero-proof
            aria-label="System highlights"
            className="relative z-30 mb-14 hidden self-end rounded-[1.75rem] border border-white/55 bg-white/52 p-3 shadow-[0_18px_50px_rgba(14,65,49,0.08)] backdrop-blur-xl lg:grid lg:grid-cols-1 lg:gap-1.5"
          >
            {[
              ["80%", "typical self-use"],
              ["<20ms", "backup switchover"],
              ["24/7", "energy visibility"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-[1.1rem] px-2 py-2.5 text-center lg:bg-white/55 lg:px-4 lg:py-3.5 lg:text-left"
              >
                <p className="text-base font-bold tracking-[-0.04em] text-dark-900 sm:text-lg">
                  {value}
                </p>
                <p className="mt-0.5 text-[0.58rem] leading-4 text-dark-700 sm:text-footnote">
                  {label}
                </p>
              </div>
            ))}
          </aside>
        </div>

        <div className="flex items-end justify-between gap-5 border-t border-dark-900/10 pt-4 text-footnote text-dark-700">
          <p className="max-w-xs">
            Designed for Australian homes, weather and energy tariffs.
          </p>
          <Link
            href="#products"
            className={`group hidden min-h-11 items-center gap-2 rounded-full px-2 font-medium text-dark-900 sm:inline-flex ${focusRing}`}
          >
            Discover the range
            <ArrowDownRight
              className="size-4 transition-transform duration-300 group-hover:translate-y-1 motion-reduce:transition-none"
              strokeWidth={1.8}
            />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default BatteryHero;
