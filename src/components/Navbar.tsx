"use client";

import { ArrowUpRight, Menu, SunMedium, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

export interface NavbarLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface NavbarAction {
  label: string;
  href: string;
  external?: boolean;
}

export interface NavbarProps {
  brandName?: string;
  brandTagline?: string;
  links?: readonly NavbarLink[];
  action?: NavbarAction | null;
  className?: string;
}

const defaultLinks: readonly NavbarLink[] = [
  { label: "All products", href: "/#catalogue" },
  { label: "Solar", href: "/?sector=solar#catalogue" },
  { label: "Storage", href: "/?sector=storage#catalogue" },
  { label: "EV chargers", href: "/?sector=charging#catalogue" },
  { label: "Coolers", href: "/?sector=outdoors#catalogue" },
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2 focus-visible:ring-offset-light-100";

function externalLinkProps(external?: boolean) {
  return external
    ? ({ rel: "noreferrer", target: "_blank" } as const)
    : undefined;
}

export function Navbar({
  brandName = "PVtoEV",
  brandTagline = "Renewable marketplace",
  links = defaultLinks,
  action = null,
  className = "",
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsOpen(false);
      menuButtonRef.current?.focus();
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 64rem)");
    const closeAtDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setIsOpen(false);
    };

    desktopQuery.addEventListener("change", closeAtDesktop);
    return () => desktopQuery.removeEventListener("change", closeAtDesktop);
  }, []);

  return (
    <header
      className={`sticky inset-x-0 top-0 z-50 w-full border-b border-light-300/80 bg-light-100/88 font-jost shadow-[0_8px_30px_rgba(17,17,17,0.045)] backdrop-blur-xl ${className}`}
    >
      <div className="mx-auto w-full max-w-[100rem] px-3 sm:px-5 lg:px-8">
        <div className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute inset-x-[12%] top-0 h-px bg-gradient-to-r from-transparent via-green/80 to-transparent"
          />

          <nav
            aria-label="Primary navigation"
            className="flex min-h-[4.5rem] items-center gap-3"
          >
            <div className="flex min-w-0 flex-1 items-center">
              <Link
                href="/"
                aria-label={`${brandName} home`}
                onClick={() => setIsOpen(false)}
                className={`group flex min-w-0 items-center gap-2.5 rounded-xl ${focusRing}`}
              >
                <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-dark-900 text-light-100 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]">
                  <SunMedium aria-hidden="true" className="size-5" strokeWidth={1.8} />
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-1 -right-1 size-4 rounded-full bg-gradient-to-br from-green to-cyan-400 ring-2 ring-dark-900 transition-transform duration-500 ease-out group-hover:scale-125 motion-reduce:transition-none"
                  />
                </span>

                <span className="min-w-0 leading-none">
                  <span className="block truncate text-[1.05rem] font-bold tracking-[-0.035em] text-dark-900">
                    {brandName}
                  </span>
                  <span className="mt-1 hidden truncate text-[0.64rem] font-medium uppercase tracking-[0.16em] text-dark-700 sm:block">
                    {brandTagline}
                  </span>
                </span>
              </Link>
            </div>

            <ul className="hidden items-center justify-center gap-1 lg:flex">
              {links.map((item) => (
                <li key={`${item.label}-${item.href}`}>
                  <Link
                    href={item.href}
                    {...externalLinkProps(item.external)}
                    className={`inline-flex min-h-11 items-center rounded-full px-4 text-caption text-dark-700 transition-[color,background-color,transform] duration-300 ease-out hover:-translate-y-0.5 hover:bg-light-200 hover:text-dark-900 motion-reduce:transition-none ${focusRing}`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex flex-1 items-center justify-end gap-2">
              {action ? (
                <Link
                  href={action.href}
                  {...externalLinkProps(action.external)}
                  className={`hidden min-h-11 items-center gap-2 rounded-full bg-dark-900 px-5 text-caption text-light-100 transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-green xl:inline-flex ${focusRing}`}
                >
                  {action.label}
                  <ArrowUpRight aria-hidden="true" className="size-4" strokeWidth={1.8} />
                </Link>
              ) : null}

              <button
                ref={menuButtonRef}
                type="button"
                aria-controls={menuId}
                aria-expanded={isOpen}
                aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
                onClick={() => setIsOpen((open) => !open)}
                className={`inline-flex size-11 items-center justify-center rounded-full bg-dark-900 text-light-100 transition-[background-color,transform] duration-300 hover:bg-green active:scale-95 lg:hidden ${focusRing}`}
              >
                {isOpen ? (
                  <X aria-hidden="true" className="size-5" strokeWidth={1.8} />
                ) : (
                  <Menu aria-hidden="true" className="size-5" strokeWidth={1.8} />
                )}
              </button>
            </div>
          </nav>

          <div
            id={menuId}
            aria-hidden={!isOpen}
            inert={!isOpen}
            className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none lg:hidden ${
              isOpen
                ? "grid-rows-[1fr] border-t border-light-300/80 opacity-100"
                : "pointer-events-none grid-rows-[0fr] border-t border-transparent opacity-0"
            }`}
          >
            <div className="min-h-0 overflow-hidden">
              <nav
                aria-label="Mobile navigation"
                className="max-h-[calc(100dvh-4.5rem)] overflow-y-auto overscroll-contain pb-4 pt-3"
              >
                <ul className="grid gap-1">
                  {links.map((item, index) => (
                    <li key={`mobile-${item.label}-${item.href}`}>
                      <Link
                        href={item.href}
                        {...externalLinkProps(item.external)}
                        onClick={() => setIsOpen(false)}
                        className={`flex min-h-12 items-center justify-between rounded-2xl px-4 text-body-medium text-dark-900 transition-colors duration-300 hover:bg-light-200 ${focusRing}`}
                      >
                        <span>
                          <span className="mr-3 text-footnote tabular-nums text-dark-700">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          {item.label}
                        </span>
                        <ArrowUpRight
                          aria-hidden="true"
                          className="size-4"
                          strokeWidth={1.8}
                        />
                      </Link>
                    </li>
                  ))}
                </ul>

                {action ? (
                  <Link
                    href={action.href}
                    {...externalLinkProps(action.external)}
                    onClick={() => setIsOpen(false)}
                    className={`mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-green px-5 text-caption text-light-100 ${focusRing}`}
                  >
                    {action.label}
                    <ArrowUpRight
                      aria-hidden="true"
                      className="size-4"
                      strokeWidth={1.8}
                    />
                  </Link>
                ) : null}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
