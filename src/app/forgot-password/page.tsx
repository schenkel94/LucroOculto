import Link from "next/link";
import { requestPasswordReset } from "@/app/actions";

export default async function ForgotPasswordPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="auth-page">
      <section className="auth-visual" aria-label="Mesa de trabalho com planilhas" />
      <section className="auth-side">
        <Link className="brand" href="/" style={{ color: "var(--text)" }}>
          <span className="brand-mark">LO</span>
          <span>Lucro Oculto</span>
        </Link>

        <div className="auth-box">
          <h1>Recuperar senha</h1>
          <p className="muted">
            Informe seu email e enviaremos um link unico para criar uma nova senha.
          </p>

          {params.message ? <p className="message">{params.message}</p> : null}

          <form className="form-grid" action={requestPasswordReset}>
            <div className="field">
              <label className="label" htmlFor="reset-email">
                Email
              </label>
              <input id="reset-email" type="email" name="email" required />
            </div>
            <button className="button" type="submit">
              Enviar link
            </button>
            <Link className="table-link" href="/login">
              Voltar para o login
            </Link>
          </form>
        </div>
      </section>
    </main>
  );
}
