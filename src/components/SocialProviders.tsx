import { Apple } from "lucide-react";
import Image from "next/image";

export interface SocialProvidersProps {
  mode: "sign-in" | "sign-up";
}

const providerButton =
  "inline-flex min-h-13 cursor-not-allowed items-center justify-center gap-2.5 rounded-2xl border border-light-300 bg-light-100 px-4 text-caption text-dark-500 opacity-70 shadow-[0_5px_18px_rgba(17,17,17,0.035)]";

export default function SocialProviders({ mode }: SocialProvidersProps) {
  const action = mode === "sign-in" ? "Sign in" : "Sign up";

  return (
    <div
      role="group"
      className="grid gap-3 min-[420px]:grid-cols-2"
      aria-label="Social account options"
    >
      <button
        type="button"
        disabled
        className={providerButton}
        aria-label={`${action} with Google (coming soon)`}
      >
        <Image src="/google.svg" alt="" width={18} height={18} aria-hidden="true" />
        <span>Google</span>
      </button>
      <button
        type="button"
        disabled
        className={providerButton}
        aria-label={`${action} with Apple (coming soon)`}
      >
        <Apple aria-hidden="true" className="size-[1.2rem]" fill="currentColor" strokeWidth={1.7} />
        <span>Apple</span>
      </button>
    </div>
  );
}
