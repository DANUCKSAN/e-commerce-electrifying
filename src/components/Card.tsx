import { ArrowUpRight } from "lucide-react";
import Image, { type ImageProps } from "next/image";
import Link from "next/link";

export type CardBadgeTone = "neutral" | "green" | "orange" | "red";
export type CardAspect = "square" | "landscape" | "portrait";
export type CardImageFit = "contain" | "cover";

export interface CardBadge {
  label: string;
  tone?: CardBadgeTone;
}

export interface CardProps {
  title: string;
  description?: string;
  image: ImageProps["src"];
  imageAlt: string;
  href?: string;
  external?: boolean;
  eyebrow?: string;
  meta?: string;
  price?: string;
  previousPrice?: string;
  badge?: CardBadge;
  ctaLabel?: string;
  aspect?: CardAspect;
  imageFit?: CardImageFit;
  imageSizes?: string;
  preload?: boolean;
  /** Opt out only for image sources that cannot use the Next.js image pipeline. */
  unoptimized?: boolean;
  className?: string;
}

const aspectClasses: Record<CardAspect, string> = {
  square: "aspect-square",
  landscape: "aspect-[4/3]",
  portrait: "aspect-[4/5]",
};

const imageFitClasses: Record<CardImageFit, string> = {
  contain: "object-contain p-7 sm:p-9",
  cover: "object-cover",
};

const badgeClasses: Record<CardBadgeTone, string> = {
  neutral: "bg-light-100/90 text-dark-900 ring-light-300",
  green: "bg-emerald-50/95 text-green ring-emerald-200",
  orange: "bg-orange-50/95 text-dark-900 ring-orange/30",
  red: "bg-red-50/95 text-dark-900 ring-red/30",
};

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2 focus-visible:ring-offset-light-100";

function externalLinkProps(external?: boolean) {
  return external
    ? ({ rel: "noreferrer", target: "_blank" } as const)
    : undefined;
}

export function Card({
  title,
  description,
  image,
  imageAlt,
  href,
  external = false,
  eyebrow,
  meta,
  price,
  previousPrice,
  badge,
  ctaLabel = "View details",
  aspect = "square",
  imageFit = "contain",
  imageSizes = "(max-width: 639px) calc(100vw - 2rem), (max-width: 1023px) 50vw, 33vw",
  preload = false,
  unoptimized = false,
  className = "",
}: CardProps) {
  const badgeTone = badge?.tone ?? "neutral";

  const content = (
    <>
      <div
        className={`relative isolate overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-cyan-50 via-light-200 to-emerald-50 ${aspectClasses[aspect]}`}
      >
        <span
          aria-hidden="true"
          className="absolute -left-12 -top-10 size-36 rounded-full bg-cyan-300/20 blur-3xl transition-transform duration-700 motion-reduce:transition-none motion-safe:group-hover:translate-x-5"
        />
        <span
          aria-hidden="true"
          className="absolute -bottom-16 -right-12 size-44 rounded-full bg-green/15 blur-3xl transition-transform duration-700 motion-reduce:transition-none motion-safe:group-hover:-translate-x-5"
        />

        <Image
          fill
          src={image}
          alt={imageAlt}
          sizes={imageSizes}
          preload={preload}
          unoptimized={unoptimized}
          className={`transition-transform duration-700 ease-out motion-reduce:transition-none motion-safe:group-hover:scale-[1.045] ${imageFitClasses[imageFit]}`}
        />

        {badge ? (
          <span
            className={`pointer-events-none absolute left-3 top-3 z-10 inline-flex min-h-8 items-center rounded-full px-3 text-footnote font-medium shadow-sm ring-1 ring-inset backdrop-blur-md sm:left-4 sm:top-4 ${badgeClasses[badgeTone]}`}
          >
            {badge.label}
          </span>
        ) : null}

        {href ? (
          <span className="pointer-events-none absolute bottom-3 right-3 z-10 flex size-10 translate-y-0 items-center justify-center rounded-full bg-dark-900 text-light-100 opacity-100 shadow-[0_8px_24px_rgba(17,17,17,0.18)] transition-[opacity,transform,background-color] duration-300 ease-out motion-reduce:transition-none md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:bg-green md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100">
            <ArrowUpRight
              aria-hidden="true"
              className="size-4"
              strokeWidth={1.8}
            />
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-5 sm:px-4 sm:pb-4">
        {eyebrow || meta ? (
          <div className="mb-2 flex items-center gap-2 text-footnote font-medium uppercase tracking-[0.12em] text-dark-700">
            {eyebrow ? <span className="text-green">{eyebrow}</span> : null}
            {eyebrow && meta ? (
              <span
                aria-hidden="true"
                className="size-1 rounded-full bg-light-400"
              />
            ) : null}
            {meta ? <span>{meta}</span> : null}
          </div>
        ) : null}

        <h3 className="text-heading-3 tracking-[-0.025em] text-dark-900 transition-colors duration-300 group-hover:text-green group-focus-within:text-green">
          {title}
        </h3>

        {description ? (
          <p className="mt-2 line-clamp-2 text-body text-dark-700">
            {description}
          </p>
        ) : null}

        {price || previousPrice ? (
          <div className="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            {price ? (
              <span className="text-lead font-bold tracking-[-0.02em] text-dark-900">
                {price}
              </span>
            ) : null}
            {previousPrice ? (
              <span
                aria-label={`Previous price ${previousPrice}`}
                className="text-caption text-dark-700 line-through decoration-dark-700"
              >
                {previousPrice}
              </span>
            ) : null}
          </div>
        ) : null}

        {href ? (
          <span className="mt-5 inline-flex min-h-12 w-full items-center justify-between rounded-full bg-gradient-to-r from-dark-900 via-dark-900 to-green px-5 text-caption text-light-100 shadow-[0_10px_26px_rgba(17,17,17,0.14)] transition-[transform,box-shadow,background-position] duration-500 [background-size:180%_100%] group-hover:-translate-y-0.5 group-hover:bg-right group-hover:shadow-[0_14px_30px_rgba(0,125,72,0.18)]">
            <span>{ctaLabel}</span>
            <ArrowUpRight
              aria-hidden="true"
              className="size-4 transition-transform duration-300 motion-reduce:transition-none group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              strokeWidth={1.8}
            />
          </span>
        ) : null}
      </div>
    </>
  );

  return (
    <article
      className={`group flex h-full flex-col rounded-[2rem] border border-light-300/80 bg-light-100 p-2 font-jost shadow-[0_14px_50px_rgba(17,17,17,0.04)] transition-[transform,box-shadow,border-color] duration-500 ease-out motion-reduce:transition-none motion-safe:hover:-translate-y-1 motion-safe:hover:border-light-400 motion-safe:hover:shadow-[0_22px_60px_rgba(17,17,17,0.09)] ${className}`}
    >
      {href ? (
        <Link
          href={href}
          aria-label={`View ${title}`}
          {...externalLinkProps(external)}
          className={`flex flex-1 flex-col rounded-[1.65rem] ${focusRing}`}
        >
          {content}
        </Link>
      ) : (
        <div className="flex flex-1 flex-col">{content}</div>
      )}
    </article>
  );
}

export default Card;
