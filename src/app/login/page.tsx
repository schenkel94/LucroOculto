import Link from "next/link";
import { signIn, signUp } from "@/app/actions";

export default async function LoginPage({
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
          <h1>Entrar</h1>
          <p className="muted">
            Acesse o diagnostico de margem com email e senha. Plano Free valida
            com 3 clientes; beta pago libera a operacao comercial.
          </p>

          {params.message ? <p className="message">{params.message}</p> : null}

          <form className="form-grid" action={signIn}>
            <div className="field">
              <label className="label" htmlFor="signin-email">
                Email
              </label>
              <input id="signin-email" type="email" name="email" required />
            </div>
            <div className="field">
              <label className="label" htmlFor="signin-password">
                Senha
              </label>
              <input id="signin-password" type="password" name="password" required />
            </div>
            <button className="button" type="submit">
              Entrar
            </button>
            <Link className="table-link" href="/forgot-password">
              Esqueci minha senha
            </Link>
          </form>

          <form className="form-grid" action={signUp}>
            <h2 style={{ margin: 0 }}>Criar acesso</h2>
            <div className="field">
              <label className="label" htmlFor="signup-email">
                Email
              </label>
              <input id="signup-email" type="email" name="email" required />
            </div>
            <div className="field">
              <label className="label" htmlFor="signup-password">
                Senha
              </label>
              <input id="signup-password" type="password" name="password" minLength={8} required />
            </div>
            <button className="button-secondary" type="submit">
              Criar conta
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
