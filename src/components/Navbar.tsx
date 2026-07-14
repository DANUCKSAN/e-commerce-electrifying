"use client";

import {
  ArrowUpRight,
  Menu,
  Search,
  ShoppingBag,
  SunMedium,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

export interface NavbarLink {
  label: string;
  href: string;
  active?: boolean;
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
  searchHref?: string;
  cartHref?: string;
  cartCount?: number;
  className?: string;
}

const defaultLinks: readonly NavbarLink[] = [
  { label: "Home", href: "#top", active: true },
  { label: "Products", href: "#products" },
  { label: "Solutions", href: "#solutions" },
  { label: "About", href: "#about" },
];

const defaultAction: NavbarAction = {
  label: "Get a quote",
  href: "#contact",
};

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
  action = defaultAction,
  searchHref = "#search",
  cartHref = "#quote",
  cartCount = 0,
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

  const displayedCount = cartCount > 99 ? "99+" : Math.max(0, cartCount);
  const cartLabel =
    cartCount > 0
      ? `View project quote, ${cartCount} ${cartCount === 1 ? "item" : "items"}`
      : "View project quote";

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
                href="#top"
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

            <ul className="hidden flex-1 items-center justify-center gap-1 lg:flex">
              {links.map((item) => (
                <li key={`${item.label}-${item.href}`}>
                  <Link
                    href={item.href}
                    aria-current={item.active ? "page" : undefined}
                    {...externalLinkProps(item.external)}
                    className={`inline-flex min-h-11 items-center rounded-full px-4 text-caption transition-[color,background-color,box-shadow,transform] duration-300 ease-out motion-reduce:transition-none ${focusRing} ${
                      item.active
                        ? "bg-gradient-to-r from-green to-teal-700 text-light-100 shadow-[0_8px_24px_rgba(0,125,72,0.22)]"
                        : "text-dark-700 hover:-translate-y-0.5 hover:bg-light-200 hover:text-dark-900"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex flex-1 items-center justify-end gap-1.5 sm:gap-2">
              <Link
                href={searchHref}
                aria-label="Search products"
                className={`hidden size-11 items-center justify-center rounded-full border border-light-300 bg-light-100 text-dark-900 transition-[background-color,color,transform] duration-300 hover:-translate-y-0.5 hover:bg-light-200 sm:inline-flex ${focusRing}`}
              >
                <Search aria-hidden="true" className="size-[1.1rem]" strokeWidth={1.8} />
              </Link>

              <Link
                href={cartHref}
                aria-label={cartLabel}
                className={`relative inline-flex size-11 items-center justify-center rounded-full border border-light-300 bg-light-100 text-dark-900 transition-[background-color,color,transform] duration-300 hover:-translate-y-0.5 hover:bg-light-200 ${focusRing}`}
              >
                <ShoppingBag
                  aria-hidden="true"
                  className="size-[1.1rem]"
                  strokeWidth={1.8}
                />
                {cartCount > 0 ? (
                  <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-dark-900 px-1 text-[0.62rem] font-bold leading-none text-light-100 ring-2 ring-light-100">
                    {displayedCount}
                  </span>
                ) : null}
              </Link>

              {action ? (
                <Link
                  href={action.href}
                  {...externalLinkProps(action.external)}
                  className={`hidden min-h-11 items-center gap-2 rounded-full bg-dark-900 px-5 text-caption text-light-100 shadow-[0_10px_26px_rgba(17,17,17,0.16)] transition-[background-color,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:bg-green hover:shadow-[0_12px_30px_rgba(0,125,72,0.2)] xl:inline-flex ${focusRing}`}
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
                        aria-current={item.active ? "page" : undefined}
                        {...externalLinkProps(item.external)}
                        onClick={() => setIsOpen(false)}
                        className={`flex min-h-12 items-center justify-between rounded-2xl px-4 text-body-medium transition-colors duration-300 ${focusRing} ${
                          item.active
                            ? "bg-dark-900 text-light-100"
                            : "text-dark-900 hover:bg-light-200"
                        }`}
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

                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-[1fr_1fr_1.35fr]">
                  <Link
                    href={searchHref}
                    onClick={() => setIsOpen(false)}
                    className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-light-300 bg-light-100 text-caption text-dark-900 hover:bg-light-200 ${focusRing}`}
                  >
                    <Search aria-hidden="true" className="size-4" strokeWidth={1.8} />
                    Search
                  </Link>
                  <Link
                    href={cartHref}
                    onClick={() => setIsOpen(false)}
                    className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-light-300 bg-light-100 text-caption text-dark-900 hover:bg-light-200 ${focusRing}`}
                  >
                    <ShoppingBag
                      aria-hidden="true"
                      className="size-4"
                      strokeWidth={1.8}
                    />
                    Quote{cartCount > 0 ? ` (${displayedCount})` : ""}
                  </Link>
                  {action ? (
                    <Link
                      href={action.href}
                      {...externalLinkProps(action.external)}
                      onClick={() => setIsOpen(false)}
                      className={`col-span-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green to-teal-700 px-5 text-caption text-light-100 shadow-[0_10px_24px_rgba(0,125,72,0.18)] sm:col-span-1 ${focusRing}`}
                    >
                      {action.label}
                      <ArrowUpRight
                        aria-hidden="true"
                        className="size-4"
                        strokeWidth={1.8}
                      />
                    </Link>
                  ) : null}
                </div>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
