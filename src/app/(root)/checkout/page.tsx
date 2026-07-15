import type { Metadata } from "next";
import Link from "next/link";

import { requireAuthenticatedUser } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Secure checkout for your PVtoEV project.",
};

export default async function CheckoutPage() {
  const { user } = await requireAuthenticatedUser("/checkout");

  return (
    <main className="mx-auto min-h-[60vh] w-full max-w-3xl px-5 py-20 sm:px-8">
      <p className="text-footnote font-semibold uppercase tracking-[0.18em] text-green">
        Secure checkout
      </p>
      <h1 className="mt-3 text-[clamp(2.5rem,7vw,4.5rem)] font-bold leading-none tracking-[-0.06em] text-dark-900">
        You&apos;re signed in.
      </h1>
      <p className="mt-5 max-w-xl text-body leading-7 text-dark-700">
        Continue as {user.email}. Checkout data will appear here when cart and
        order persistence are introduced.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex min-h-12 items-center rounded-full bg-dark-900 px-6 text-caption text-light-100 transition-colors hover:bg-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2"
      >
        Return to marketplace
      </Link>
    </main>
  );
}
