import type { Organization } from "@/lib/types";

const DEFAULT_FOUNDER_EMAILS = ["schenkel.mario@hotmail.com"];

export function isFounderEmail(email?: string | null) {
  if (!email) return false;

  const rawEmails = process.env.FOUNDER_EMAILS?.trim();
  const configured = rawEmails ? rawEmails.split(",") : DEFAULT_FOUNDER_EMAILS;
  const allowedEmails = configured
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  return allowedEmails.includes(email.trim().toLowerCase());
}

export function applyAccessProfile(
  organization: Organization,
  email?: string | null
): Organization {
  if (!isFounderEmail(email)) {
    return {
      ...organization,
      is_founder: false
    };
  }

  return {
    ...organization,
    plan: "pro",
    billing_status: "active",
    is_founder: true
  };
}
