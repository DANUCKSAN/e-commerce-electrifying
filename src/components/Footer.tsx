import {
  ArrowUpRight,
  Mail,
  MapPin,
  Phone,
  SunMedium,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface FooterGroup {
  title: string;
  links: readonly FooterLink[];
}

export type FooterContactIcon = "location" | "phone" | "email";

export interface FooterContactItem {
  label: string;
  value: string;
  href?: string;
  icon?: FooterContactIcon;
}

export interface FooterSocialLink {
  label: string;
  href: string;
  iconUrl: string;
  invertIcon?: boolean;
}

export interface FooterNewsletter {
  eyebrow?: string;
  title?: string;
  description?: string;
  placeholder?: string;
  buttonLabel?: string;
  consentLabel?: string;
  action?: string;
}

export interface FooterProps {
  brandName?: string;
  brandDescription?: string;
  groups?: readonly FooterGroup[];
  contactItems?: readonly FooterContactItem[];
  socialLinks?: readonly FooterSocialLink[];
  legalLinks?: readonly FooterLink[];
  newsletter?: FooterNewsletter | false;
  copyright?: string;
  acknowledgement?: string;
  className?: string;
}

const defaultGroups: readonly FooterGroup[] = [
  {
    title: "Explore",
    links: [
      { label: "Solar products", href: "#products" },
      { label: "Energy solutions", href: "#solutions" },
      { label: "About us", href: "#about" },
      { label: "Start a project", href: "#contact" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact", href: "#contact" },
      { label: "Delivery", href: "#delivery" },
      { label: "Warranties", href: "#warranties" },
      { label: "FAQs", href: "#faqs" },
    ],
  },
];

const defaultContactItems: readonly FooterContactItem[] = [
  {
    label: "Visit",
    value: "Sydney, NSW, Australia",
    icon: "location",
  },
  {
    label: "Call",
    value: "1300 000 000",
    href: "tel:+611300000000",
    icon: "phone",
  },
  {
    label: "Email",
    value: "hello@pvtoev.com.au",
    href: "mailto:hello@pvtoev.com.au",
    icon: "email",
  },
];

const defaultSocialLinks: readonly FooterSocialLink[] = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/",
    iconUrl: "https://cdn.simpleicons.org/instagram/ffffff",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/",
    iconUrl: "https://cdn.simpleicons.org/facebook/ffffff",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/",
    iconUrl:
      "https://cdn.jsdelivr.net/npm/simple-icons@13.21.0/icons/linkedin.svg",
    invertIcon: true,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/",
    iconUrl: "https://cdn.simpleicons.org/youtube/ffffff",
  },
];

const defaultLegalLinks: readonly FooterLink[] = [
  { label: "Privacy", href: "#privacy" },
  { label: "Terms", href: "#terms" },
  { label: "Accessibility", href: "#accessibility" },
];

const defaultNewsletter: FooterNewsletter = {
  eyebrow: "Keep your energy up",
  title: "Fresh ideas for a lower-energy home.",
  description:
    "Product releases, practical guides and renewable technology news — occasionally, not endlessly.",
  placeholder: "Email address",
  buttonLabel: "Subscribe",
  consentLabel: "I agree to receive occasional product and editorial updates.",
};

const contactIcons: Record<FooterContactIcon, LucideIcon> = {
  location: MapPin,
  phone: Phone,
  email: Mail,
};

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2 focus-visible:ring-offset-light-100";

function externalLinkProps(external?: boolean) {
  return external
    ? ({ rel: "noreferrer", target: "_blank" } as const)
    : undefined;
}

function NewsletterSignup({ newsletter }: { newsletter: FooterNewsletter }) {
  const canSubmit = Boolean(newsletter.action);
  const fields = (
    <>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-1.5 rounded-full border border-light-300 bg-light-200 p-1.5 transition-[border-color,box-shadow] duration-300 focus-within:border-green focus-within:ring-2 focus-within:ring-green/15">
        <label className="min-w-0">
          <span className="sr-only">Email address</span>
          <input
            required={canSubmit}
            type="email"
            name="email"
            autoComplete="email"
            placeholder={newsletter.placeholder ?? defaultNewsletter.placeholder}
            className="min-h-11 w-full min-w-0 bg-transparent px-3 text-body text-dark-900 placeholder:text-dark-700 focus:outline-none sm:px-4"
          />
        </label>
        <button
          type={canSubmit ? "submit" : "button"}
          className={`inline-flex min-h-11 items-center gap-2 rounded-full bg-dark-900 px-4 text-caption text-light-100 transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-green sm:px-5 ${focusRing}`}
        >
          <span className="hidden min-[380px]:inline">
            {newsletter.buttonLabel ?? defaultNewsletter.buttonLabel}
          </span>
          <span className="sr-only min-[380px]:hidden">
            {newsletter.buttonLabel ?? defaultNewsletter.buttonLabel}
          </span>
          <ArrowUpRight
            aria-hidden="true"
            className="size-4"
            strokeWidth={1.8}
          />
        </button>
      </div>

      <label className="mt-2 flex max-w-lg cursor-pointer items-start gap-2.5 text-footnote text-dark-700">
        <input
          required={canSubmit}
          type="checkbox"
          name="consent"
          className="mt-0.5 size-4 shrink-0 accent-green"
        />
        <span>{newsletter.consentLabel ?? defaultNewsletter.consentLabel}</span>
      </label>
    </>
  );

  return newsletter.action ? (
    <form action={newsletter.action} method="post" className="mt-5 max-w-xl">
      {fields}
    </form>
  ) : (
    <div
      role="group"
      aria-label="Newsletter signup preview"
      className="mt-5 max-w-xl"
    >
      {fields}
    </div>
  );
}

export function Footer({
  brandName = "PVtoEV",
  brandDescription =
    "A modern marketplace for solar, storage, EV charging and the products powering a cleaner Australian home.",
  groups = defaultGroups,
  contactItems = defaultContactItems,
  socialLinks = defaultSocialLinks,
  legalLinks = defaultLegalLinks,
  newsletter = false,
  copyright,
  acknowledgement =
    "We acknowledge the Traditional Custodians of Country throughout Australia and recognise their continuing connection to land, waters and community.",
  className = "",
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      id="contact"
      className={`relative border-t border-light-300 bg-light-100 font-jost text-dark-900 ${className}`}
    >
      <div
        aria-hidden="true"
        className="h-1 w-full bg-gradient-to-r from-green via-cyan-500 to-blue-600"
      />

      <div className="mx-auto max-w-[94rem] px-4 py-8 sm:px-6 sm:py-9 lg:px-8 lg:py-10">
        <div className="grid grid-cols-2 gap-x-6 gap-y-7 lg:grid-cols-[1.25fr_0.55fr_0.55fr_0.85fr] lg:gap-x-10">
          {newsletter ? (
            <section
              id="newsletter"
              aria-labelledby="newsletter-heading"
              className="col-span-2 lg:col-span-1"
            >
              <p className="text-footnote font-medium uppercase tracking-[0.16em] text-green">
                {newsletter.eyebrow ?? defaultNewsletter.eyebrow}
              </p>
              <h2
                id="newsletter-heading"
                className="mt-3 max-w-xl text-[clamp(1.8rem,3vw,2.65rem)] font-bold leading-[0.98] tracking-[-0.05em] text-dark-900"
              >
                {newsletter.title ?? defaultNewsletter.title}
              </h2>
              <p className="mt-4 max-w-lg text-body text-dark-700">
                {newsletter.description ?? defaultNewsletter.description}
              </p>

              <NewsletterSignup newsletter={newsletter} />
            </section>
          ) : (
            <section
              aria-label={`${brandName} introduction`}
              className="col-span-2 lg:col-span-1"
            >
              <p className="max-w-lg text-heading-3 text-dark-900">
                Renewable products, thoughtfully selected.
              </p>
              <p className="mt-3 max-w-lg text-body text-dark-700">
                {brandDescription}
              </p>
            </section>
          )}

          {groups.map((group) => (
            <nav
              key={group.title}
              aria-label={`${group.title} footer navigation`}
            >
              <h2 className="text-caption font-bold text-dark-900">
                {group.title}
              </h2>
              <ul className="mt-3 grid gap-0.5">
                {group.links.map((link) => (
                  <li key={`${group.title}-${link.label}-${link.href}`}>
                    <Link
                      href={link.href}
                      {...externalLinkProps(link.external)}
                      className={`group/link inline-flex min-h-9 items-center gap-1.5 rounded-lg text-caption text-dark-700 transition-colors duration-300 hover:text-green sm:min-h-10 sm:text-body ${focusRing}`}
                    >
                      <span>{link.label}</span>
                      <ArrowUpRight
                        aria-hidden="true"
                        className="size-3.5 translate-y-1 opacity-0 transition-[opacity,transform] duration-300 group-hover/link:translate-y-0 group-hover/link:opacity-100 group-focus-visible/link:translate-y-0 group-focus-visible/link:opacity-100 motion-reduce:transition-none"
                        strokeWidth={1.8}
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <section
            aria-labelledby="contact-heading"
            className="col-span-2 lg:col-span-1"
          >
            <h2 id="contact-heading" className="text-caption font-bold text-dark-900">
              Let&apos;s talk energy
            </h2>
            <address className="mt-3 grid gap-2.5 not-italic">
              {contactItems.map((item) => {
                const Icon = contactIcons[item.icon ?? "location"];
                const content = (
                  <>
                    <Icon
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-green"
                      strokeWidth={1.8}
                    />
                    <span>
                      <span className="sr-only">{item.label}: </span>
                      {item.value}
                    </span>
                  </>
                );

                return item.href ? (
                  <a
                    key={`${item.label}-${item.value}`}
                    href={item.href}
                    className={`flex items-start gap-2.5 rounded-lg text-body text-dark-700 transition-colors duration-300 hover:text-green ${focusRing}`}
                  >
                    {content}
                  </a>
                ) : (
                  <p
                    key={`${item.label}-${item.value}`}
                    className="flex items-start gap-2.5 text-body text-dark-700"
                  >
                    {content}
                  </p>
                );
              })}
            </address>

            <div className="mt-4 flex flex-wrap gap-2" aria-label="Social media">
              {socialLinks.map((social) => (
                <a
                  key={`${social.label}-${social.href}`}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Follow ${brandName} on ${social.label}`}
                  className={`inline-flex size-10 items-center justify-center rounded-full bg-dark-900 text-light-100 transition-[background-color,transform] duration-300 hover:-translate-y-1 hover:bg-green motion-reduce:transition-none ${focusRing}`}
                >
                  <Image
                    unoptimized
                    aria-hidden="true"
                    src={social.iconUrl}
                    alt=""
                    width={17}
                    height={17}
                    className={`size-[1.05rem] object-contain ${
                      social.invertIcon ? "invert" : ""
                    }`}
                  />
                </a>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-6 grid gap-4 border-t border-light-300 pt-5 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <Link
              href="#top"
              aria-label={`${brandName} home`}
              className={`group inline-flex items-center gap-3 rounded-xl ${focusRing}`}
            >
              <span className="relative flex size-11 items-center justify-center overflow-hidden rounded-full bg-dark-900 text-light-100">
                <SunMedium
                  aria-hidden="true"
                  className="size-5"
                  strokeWidth={1.8}
                />
                <span
                  aria-hidden="true"
                  className="absolute -bottom-1 -right-1 size-4 rounded-full bg-gradient-to-br from-green to-cyan-400 ring-2 ring-dark-900 transition-transform duration-500 group-hover:scale-125 motion-reduce:transition-none"
                />
              </span>
              <span className="text-lead font-bold tracking-[-0.035em]">
                {brandName}
              </span>
            </Link>
          </div>

          <nav aria-label="Legal navigation">
            <ul className="flex flex-wrap gap-x-5 gap-y-2 sm:justify-end">
              {legalLinks.map((link) => (
                <li key={`${link.label}-${link.href}`}>
                  <Link
                    href={link.href}
                    {...externalLinkProps(link.external)}
                    className={`rounded-md text-caption text-dark-700 transition-colors hover:text-green ${focusRing}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-footnote text-dark-700 sm:text-right">
              {copyright ?? `© ${currentYear} ${brandName}. All rights reserved.`}
            </p>
          </nav>
        </div>

        <p className="mt-4 max-w-5xl text-[0.68rem] leading-4 text-dark-700">
          {acknowledgement}
        </p>
      </div>
    </footer>
  );
}

export default Footer;
