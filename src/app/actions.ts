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
  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_APP_URL;
  const email = cleanEmail(formData);
  const password = cleanPassword(formData);

  if (password.length < 8) {
    redirect(`/login?message=${encodeURIComponent("Use uma senha com pelo menos 8 caracteres.")}`);
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`
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

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
