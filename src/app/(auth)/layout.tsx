import type { Metadata, Viewport } from "next";
import {
  ArrowLeft,
  BatteryCharging,
  CarFront,
  CircleCheck,
  SunMedium,
} from "lucide-react";
import Link from "next/link";

import "../globals.css";

export const metadata: Metadata = {
  title: {
    default: "Account | PVtoEV",
    template: "%s | PVtoEV",
  },
  description:
    "Sign in or create a PVtoEV account to plan your connected home energy system.",
};

export const viewport: Viewport = {
  themeColor: "#0d1714",
};

const energySteps = [
  { label: "Generate", icon: SunMedium },
  { label: "Store", icon: BatteryCharging },
  { label: "Drive", icon: CarFront },
] as const;

const accountBenefits = [
  "Keep product shortlists and project details together",
  "Return to quotes and recommendations whenever you need",
] as const;

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-light-100 antialiased">
      <body className="min-h-full overflow-x-clip bg-light-100 font-jost text-dark-900">
        <div className="min-h-dvh lg:grid lg:grid-cols-[minmax(25rem,0.88fr)_minmax(32rem,1.12fr)]">
          <aside className="relative hidden min-h-dvh overflow-hidden bg-[#0d1714] px-9 py-9 text-light-100 lg:flex lg:flex-col xl:px-14 xl:py-12">
            <div
              aria-hidden="true"
              className="absolute -right-52 top-[10%] size-[34rem] rounded-full border border-white/10"
            />
            <div
              aria-hidden="true"
              className="absolute -right-36 top-[18%] size-[23rem] rounded-full border border-emerald-300/20"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-44 -left-28 size-[30rem] rounded-full bg-green/25 blur-[100px]"
            />

            <Link
              href="/"
              aria-label="PVtoEV home"
              className={`relative z-10 flex w-fit items-center gap-3 rounded-xl ring-offset-[#0d1714] ${focusRing}`}
            >
              <span className="relative flex size-11 items-center justify-center rounded-full bg-light-100 text-dark-900 shadow-[0_14px_30px_rgba(0,0,0,0.22)]">
                <SunMedium aria-hidden="true" className="size-5" strokeWidth={1.8} />
                <span className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full bg-emerald-400 ring-[3px] ring-[#0d1714]" />
              </span>
              <span className="leading-none">
                <span className="block text-[1.08rem] font-bold tracking-[-0.04em]">
                  PVtoEV
                </span>
                <span className="mt-1 block text-[0.62rem] font-medium uppercase tracking-[0.18em] text-white/48">
                  Renewable marketplace
                </span>
              </span>
            </Link>

            <div className="relative z-10 my-auto max-w-2xl py-14">
              <p className="flex items-center gap-2 text-footnote font-semibold uppercase tracking-[0.18em] text-emerald-300">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-emerald-300" />
                Your energy, connected
              </p>
              <p className="mt-5 max-w-[9ch] text-[clamp(3.2rem,5.2vw,5.8rem)] font-bold leading-[0.89] tracking-[-0.07em]">
                One account. Every part of your energy journey.
              </p>
              <p className="mt-6 max-w-xl text-body leading-7 text-white/58 xl:text-lead">
                Plan a smarter home with your products, project notes and clean
                energy ideas all in one considered place.
              </p>

              <div className="mt-9 rounded-[1.75rem] border border-white/10 bg-white/[0.055] p-4 backdrop-blur-sm xl:p-5">
                <ol aria-label="Connected home energy flow" className="grid grid-cols-3">
                  {energySteps.map((step, index) => {
                    const Icon = step.icon;

                    return (
                      <li key={step.label} className="relative flex flex-col items-center">
                        {index > 0 ? (
                          <span
                            aria-hidden="true"
                            className="absolute right-1/2 top-5 h-px w-full bg-gradient-to-r from-emerald-300/70 to-white/12"
                          />
                        ) : null}
                        <span className="relative z-10 flex size-10 items-center justify-center rounded-full border border-white/10 bg-[#17231f] text-emerald-300 shadow-[0_8px_20px_rgba(0,0,0,0.22)]">
                          <Icon aria-hidden="true" className="size-[1.1rem]" strokeWidth={1.8} />
                        </span>
                        <span className="mt-2.5 text-footnote font-medium text-white/68">
                          {step.label}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </div>

              <ul className="mt-7 grid gap-3 text-caption text-white/62">
                {accountBenefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <CircleCheck
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-emerald-300"
                      strokeWidth={1.8}
                    />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="relative z-10 text-footnote text-white/38">
              Thoughtfully selected renewable technology for Australian homes.
            </p>
          </aside>

          <main id="main-content" className="flex min-h-dvh flex-col bg-light-100">
            <header className="mx-auto flex w-full max-w-[38rem] items-center justify-between px-4 pt-4 sm:px-6 sm:pt-6 lg:max-w-none lg:justify-end lg:px-10 lg:pt-8 xl:px-14">
              <Link
                href="/"
                aria-label="PVtoEV home"
                className={`flex items-center gap-2.5 rounded-xl ring-offset-light-100 lg:hidden ${focusRing}`}
              >
                <span className="relative flex size-10 items-center justify-center rounded-full bg-dark-900 text-light-100">
                  <SunMedium aria-hidden="true" className="size-[1.1rem]" strokeWidth={1.8} />
                  <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-green ring-2 ring-light-100" />
                </span>
                <span className="text-base font-bold tracking-[-0.04em]">PVtoEV</span>
              </Link>

              <Link
                href="/"
                className={`group inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-caption text-dark-700 transition-colors hover:text-dark-900 ring-offset-light-100 ${focusRing}`}
              >
                <ArrowLeft
                  aria-hidden="true"
                  className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5 motion-reduce:transition-none"
                  strokeWidth={1.8}
                />
                Back to marketplace
              </Link>
            </header>

            <div className="flex flex-1 items-center px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-16 xl:px-14">
              <div className="mx-auto w-full max-w-[30rem]">{children}</div>
            </div>

            <p className="px-4 pb-5 text-center text-footnote text-dark-700 sm:pb-7 lg:px-10">
              Secure access to your PVtoEV project workspace.
            </p>
          </main>
        </div>
      </body>
    </html>
  );
}
