"use client";

import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useActionState, useId, useState } from "react";

import SocialProviders from "@/components/SocialProviders";
import {
  signIn,
  signUp,
  type AuthActionState,
} from "@/lib/auth/actions";

export interface AuthFormProps {
  mode: "sign-in" | "sign-up";
  callbackURL?: string;
}

const content = {
  "sign-in": {
    eyebrow: "Welcome back",
    title: "Sign in to your account",
    description: "Pick up where you left off and keep your energy project moving.",
    submitLabel: "Sign in",
    switchPrompt: "New to PVtoEV?",
    switchLabel: "Create an account",
    switchHref: "/sign-up",
  },
  "sign-up": {
    eyebrow: "Start your project",
    title: "Create your account",
    description: "Save products, compare options and shape a smarter home energy plan.",
    submitLabel: "Create account",
    switchPrompt: "Already have an account?",
    switchLabel: "Sign in",
    switchHref: "/sign-in",
  },
} as const;

const inputClassName =
  "min-h-14 w-full rounded-2xl border border-light-300 bg-light-100 py-3 pl-11 pr-4 text-body text-dark-900 shadow-[0_4px_14px_rgba(17,17,17,0.025)] outline-none transition-[border-color,box-shadow,background-color] duration-300 placeholder:text-dark-500 hover:border-light-400 focus:border-green focus:bg-light-100 focus:ring-4 focus:ring-green/10";

const labelClassName = "mb-2 block text-caption text-dark-900";

const initialState: AuthActionState = { status: "idle" };

function FieldError({ id, errors }: { id: string; errors?: string[] }) {
  if (!errors?.length) return null;

  return (
    <p id={id} className="mt-2 text-footnote text-red-700">
      {errors[0]}
    </p>
  );
}

export default function AuthForm({ mode, callbackURL = "/" }: AuthFormProps) {
  const ids = {
    heading: useId(),
    name: useId(),
    nameError: useId(),
    email: useId(),
    emailError: useId(),
    password: useId(),
    passwordHint: useId(),
    passwordError: useId(),
    terms: useId(),
    termsError: useId(),
    formError: useId(),
  };
  const [showPassword, setShowPassword] = useState(false);
  const isSignUp = mode === "sign-up";
  const copy = content[mode];
  const serverAction = isSignUp ? signUp : signIn;
  const [state, formAction, isPending] = useActionState(
    serverAction,
    initialState,
  );
  const switchHref = `${copy.switchHref}?callbackURL=${encodeURIComponent(callbackURL)}`;

  return (
    <section aria-labelledby={ids.heading}>
      <div>
        <p className="text-footnote font-semibold uppercase tracking-[0.18em] text-green">
          {copy.eyebrow}
        </p>
        <h1
          id={ids.heading}
          className="mt-3 text-[clamp(2.35rem,7vw,3.35rem)] font-bold leading-[0.94] tracking-[-0.065em] text-dark-900"
        >
          {copy.title}
        </h1>
        <p className="mt-4 max-w-md text-body leading-7 text-dark-700">
          {copy.description}
        </p>
      </div>

      <div className="mt-8">
        <SocialProviders mode={mode} />
      </div>

      <div className="my-7 flex items-center gap-4" aria-hidden="true">
        <span className="h-px flex-1 bg-light-300" />
        <span className="text-footnote font-medium uppercase tracking-[0.12em] text-dark-500">
          or use email
        </span>
        <span className="h-px flex-1 bg-light-300" />
      </div>

      <form action={formAction} className="grid gap-5">
        <input type="hidden" name="callbackURL" value={callbackURL} />

        {state.status === "error" && state.message ? (
          <div
            id={ids.formError}
            role="alert"
            aria-live="polite"
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-caption text-red-800"
          >
            {state.message}
          </div>
        ) : null}

        {isSignUp ? (
          <div>
            <label htmlFor={ids.name} className={labelClassName}>
              Full name
            </label>
            <div className="relative">
              <UserRound
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 size-[1.05rem] -translate-y-1/2 text-dark-700"
                strokeWidth={1.8}
              />
              <input
                id={ids.name}
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Your full name"
                required
                maxLength={100}
                aria-invalid={Boolean(state.fieldErrors?.name?.length)}
                aria-describedby={
                  state.fieldErrors?.name?.length ? ids.nameError : undefined
                }
                className={inputClassName}
              />
            </div>
            <FieldError id={ids.nameError} errors={state.fieldErrors?.name} />
          </div>
        ) : null}

        <div>
          <label htmlFor={ids.email} className={labelClassName}>
            Email address
          </label>
          <div className="relative">
            <Mail
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 size-[1.05rem] -translate-y-1/2 text-dark-700"
              strokeWidth={1.8}
            />
            <input
              id={ids.email}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              maxLength={254}
              aria-invalid={Boolean(state.fieldErrors?.email?.length)}
              aria-describedby={
                state.fieldErrors?.email?.length ? ids.emailError : undefined
              }
              className={inputClassName}
            />
          </div>
          <FieldError id={ids.emailError} errors={state.fieldErrors?.email} />
        </div>

        <div>
          <label htmlFor={ids.password} className={labelClassName}>
            Password
          </label>
          <div className="relative">
            <LockKeyhole
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 size-[1.05rem] -translate-y-1/2 text-dark-700"
              strokeWidth={1.8}
            />
            <input
              id={ids.password}
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              placeholder={isSignUp ? "At least 8 characters" : "Enter your password"}
              minLength={8}
              maxLength={128}
              required
              aria-invalid={Boolean(state.fieldErrors?.password?.length)}
              aria-describedby={
                [
                  isSignUp ? ids.passwordHint : null,
                  state.fieldErrors?.password?.length
                    ? ids.passwordError
                    : null,
                ]
                  .filter(Boolean)
                  .join(" ") || undefined
              }
              className={`${inputClassName} pr-12`}
            />
            <button
              type="button"
              aria-controls={ids.password}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute right-2 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-xl text-dark-700 transition-colors hover:bg-light-200 hover:text-dark-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
            >
              {showPassword ? (
                <EyeOff aria-hidden="true" className="size-[1.1rem]" strokeWidth={1.8} />
              ) : (
                <Eye aria-hidden="true" className="size-[1.1rem]" strokeWidth={1.8} />
              )}
            </button>
          </div>
          {isSignUp ? (
            <p id={ids.passwordHint} className="mt-2 text-footnote text-dark-700">
              Use 8 or more characters for a stronger password.
            </p>
          ) : null}
          <FieldError
            id={ids.passwordError}
            errors={state.fieldErrors?.password}
          />
        </div>

        {isSignUp ? (
          <label
            htmlFor={ids.terms}
            className="flex cursor-pointer items-start gap-3 text-footnote leading-5 text-dark-700"
          >
            <input
              id={ids.terms}
              name="terms"
              type="checkbox"
              required
              aria-invalid={Boolean(state.fieldErrors?.terms?.length)}
              aria-describedby={
                state.fieldErrors?.terms?.length ? ids.termsError : undefined
              }
              className="mt-0.5 size-4.5 shrink-0 rounded border-light-400 accent-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2"
            />
            <span>
              I agree to the{" "}
              <Link href="/#terms" className="font-medium text-dark-900 underline decoration-light-400 underline-offset-4 hover:decoration-green">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/#privacy" className="font-medium text-dark-900 underline decoration-light-400 underline-offset-4 hover:decoration-green">
                Privacy Policy
              </Link>
              .
            </span>
            <FieldError id={ids.termsError} errors={state.fieldErrors?.terms} />
          </label>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <span className="text-caption text-dark-700">Secure 7-day session</span>
            <button
              type="button"
              disabled
              title="Password recovery is planned after the MVP."
              className="min-h-10 cursor-not-allowed rounded-lg px-1 text-caption font-medium text-dark-500"
            >
              Forgot password? (soon)
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          aria-describedby={state.status === "error" ? ids.formError : undefined}
          className="group mt-1 inline-flex min-h-14 w-full items-center justify-center gap-2.5 rounded-2xl bg-dark-900 px-5 text-body-medium text-light-100 shadow-[0_14px_30px_rgba(17,17,17,0.16)] transition-[background-color,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:bg-green hover:shadow-[0_16px_34px_rgba(0,125,72,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2 focus-visible:ring-offset-light-100 active:translate-y-0 disabled:cursor-wait disabled:opacity-65 motion-reduce:transition-none"
        >
          {isPending ? "Please wait…" : copy.submitLabel}
          <ArrowRight
            aria-hidden="true"
            className="size-[1.05rem] transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none"
            strokeWidth={1.8}
          />
        </button>
      </form>

      <div className="mt-6 flex items-center justify-center gap-2 text-caption text-dark-700">
        <span>{copy.switchPrompt}</span>
        <Link
          href={switchHref}
          className="rounded-md font-semibold text-green underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2"
        >
          {copy.switchLabel}
        </Link>
      </div>

      <p className="mt-6 flex items-center justify-center gap-2 text-footnote text-dark-500">
        <ShieldCheck aria-hidden="true" className="size-4 text-green" strokeWidth={1.8} />
        Your details stay private and protected.
      </p>
    </section>
  );
}
