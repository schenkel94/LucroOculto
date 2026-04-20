import Link from "next/link";
import { updatePassword } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";

export default async function ResetPasswordPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <main className="auth-page">
      <section className="auth-visual" aria-label="Mesa de trabalho com planilhas" />
      <section className="auth-side">
        <Link className="brand" href="/" style={{ color: "var(--text)" }}>
          <span className="brand-mark">LO</span>
          <span>Lucro Oculto</span>
        </Link>

        <div className="auth-box">
          <h1>Nova senha</h1>
          <p className="muted">
            Crie uma senha com pelo menos 8 caracteres para voltar ao diagnostico.
          </p>

          {params.message ? <p className="message">{params.message}</p> : null}

          {user ? (
            <form className="form-grid" action={updatePassword}>
              <div className="field">
                <label className="label" htmlFor="new-password">
                  Nova senha
                </label>
                <input id="new-password" type="password" name="password" minLength={8} required />
              </div>
              <div className="field">
                <label className="label" htmlFor="password-confirmation">
                  Confirmar senha
                </label>
                <input
                  id="password-confirmation"
                  type="password"
                  name="password_confirmation"
                  minLength={8}
                  required
                />
              </div>
              <button className="button" type="submit">
                Atualizar senha
              </button>
            </form>
          ) : (
            <div className="form-grid">
              <p className="message">
                Abra esta pagina pelo link recebido no email. Se o link expirou,
                solicite um novo.
              </p>
              <Link className="button" href="/forgot-password">
                Solicitar novo link
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
