"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function cleanEmail(formData: FormData) {
  return String(formData.get("email") ?? "").trim().toLowerCase();
}

function cleanPassword(formData: FormData) {
  return String(formData.get("password") ?? "");
}

async function getAuthRedirectUrl() {
  const headerOrigin = (await headers()).get("origin");
  const configuredUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL ??
    headerOrigin ??
    "http://localhost:3000";
  const origin = configuredUrl.startsWith("http") ? configuredUrl : `https://${configuredUrl}`;

  return `${origin.replace(/\/$/, "")}/auth/callback`;
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const email = cleanEmail(formData);
  const password = cleanPassword(formData);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    redirect(`/login?message=${encodeURIComponent("Email ou senha invalidos.")}`);
  }

  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const email = cleanEmail(formData);
  const password = cleanPassword(formData);
  const emailRedirectTo = await getAuthRedirectUrl();

  if (password.length < 8) {
    redirect(`/login?message=${encodeURIComponent("Use uma senha com pelo menos 8 caracteres.")}`);
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo
    }
  });

  if (error) {
    redirect(`/login?message=${encodeURIComponent(error.message)}`);
  }

  if (!data.session) {
    redirect(
      `/login?message=${encodeURIComponent("Conta criada. Confirme seu email antes de entrar.")}`
    );
  }

  redirect("/dashboard");
}

export async function resendConfirmation(formData: FormData) {
  const supabase = await createClient();
  const email = cleanEmail(formData);
  const emailRedirectTo = await getAuthRedirectUrl();

  if (!email) {
    redirect(`/login?message=${encodeURIComponent("Informe o email para reenviar a confirmacao.")}`);
  }

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo
    }
  });

  if (error) {
    redirect(`/login?message=${encodeURIComponent(error.message)}`);
  }

  redirect(
    `/login?message=${encodeURIComponent("Enviamos um novo email de confirmacao. Use o link mais recente.")}`
  );
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
