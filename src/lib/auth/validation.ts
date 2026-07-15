import { z } from "zod";

const safeReturnPath = z
  .string()
  .trim()
  .max(2_048, "The return path is too long.")
  .refine(
    (value) =>
      value.startsWith("/") &&
      !value.startsWith("//") &&
      !value.includes("\\") &&
      !/[\u0000-\u001F\u007F]/u.test(value),
    "The return path must be a local application path.",
  );

const email = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, "Email address is too long.")
  .pipe(z.email("Enter a valid email address."));

const password = z
  .string()
  .min(8, "Password must contain at least 8 characters.")
  .max(128, "Password must contain at most 128 characters.");

export const signInSchema = z.object({
  email,
  password,
  callbackURL: safeReturnPath,
});

export const signUpSchema = signInSchema.extend({
  name: z
    .string()
    .trim()
    .min(1, "Enter your name.")
    .max(100, "Name must contain at most 100 characters.")
    .refine(
      (value) => !/[\u0000-\u001F\u007F]/u.test(value),
      "Name contains unsupported characters.",
    )
    .transform((value) => value.replace(/\s+/gu, " ")),
  terms: z.literal("on", {
    error: "You must accept the terms and privacy policy.",
  }),
});

export const signOutSchema = z.object({
  callbackURL: safeReturnPath,
});

export function parseSafeReturnPath(value: unknown, fallback = "/") {
  const parsed = safeReturnPath.safeParse(value);
  return parsed.success ? parsed.data : fallback;
}
