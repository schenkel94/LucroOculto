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

async function getAuthRedirectUrl(next = "/dashboard") {
  const headerOrigin = (await headers()).get("origin");
  const configuredUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL ??
    headerOrigin ??
    "http://localhost:3000";
  const origin = configuredUrl.startsWith("http") ? configuredUrl : `https://${configuredUrl}`;

  const callbackUrl = new URL("/auth/callback", origin.replace(/\/$/, ""));
  callbackUrl.searchParams.set("next", next);

  return callbackUrl.toString();
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
  const emailRedirectTo = await getAuthRedirectUrl("/dashboard");

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

export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient();
  const email = cleanEmail(formData);
  const redirectTo = await getAuthRedirectUrl("/reset-password");

  if (!email) {
    redirect(`/forgot-password?message=${encodeURIComponent("Informe seu email.")}`);
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo
  });

  if (error) {
    redirect(`/forgot-password?message=${encodeURIComponent(error.message)}`);
  }

  redirect(
    `/login?message=${encodeURIComponent("Enviamos o link para redefinir sua senha. Confira seu email.")}`
  );
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const password = cleanPassword(formData);
  const confirmation = String(formData.get("password_confirmation") ?? "");

  if (password.length < 8) {
    redirect(
      `/reset-password?message=${encodeURIComponent("Use uma senha com pelo menos 8 caracteres.")}`
    );
  }

  if (password !== confirmation) {
    redirect(`/reset-password?message=${encodeURIComponent("As senhas nao conferem.")}`);
  }

  const { error } = await supabase.auth.updateUser({
    password
  });

  if (error) {
    redirect(`/reset-password?message=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
