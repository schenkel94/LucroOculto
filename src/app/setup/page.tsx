import Link from "next/link";
import { getSetupStatus } from "@/lib/setup-status";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const status = await getSetupStatus();

  return (
    <main className="setup-page">
      <section className="setup-shell">
        <div className="topbar">
          <div className="page-title">
            <p className="eyebrow" style={{ color: "var(--green)" }}>
              Setup
            </p>
            <h1>Lucro Oculto em producao</h1>
            <p>
              Esta checagem confirma se Vercel, variaveis de ambiente e schema
              do Supabase estao conversando.
            </p>
          </div>
          <div className="actions" style={{ marginTop: 0 }}>
            <Link className="button-secondary" href="/">
              Voltar
            </Link>
            <Link className="button" href="/login">
              Entrar
            </Link>
          </div>
        </div>

        <div className={status.ok ? "setup-summary ok" : "setup-summary warn"}>
          <strong>{status.ok ? "Tudo pronto para testar." : "Ainda falta um ajuste."}</strong>
          <span>Ultima verificacao: {new Date(status.checkedAt).toLocaleString("pt-BR")}</span>
        </div>

        <div className="setup-list">
          {status.items.map((item) => (
            <div className="setup-item" key={item.key}>
              <span className={item.ok ? "setup-dot ok" : "setup-dot warn"} />
              <div>
                <strong>{item.label}</strong>
                <p className="muted">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>

        <aside className="empty" style={{ marginTop: 18 }}>
          <h2 style={{ margin: 0 }}>Se alguma tabela falhar</h2>
          <p className="muted">
            Abra o Supabase SQL Editor, cole o conteudo completo de
            supabase/schema.sql e rode de novo. Nao cole apenas o caminho do
            arquivo.
          </p>
          <div className="actions">
            <a className="button-secondary" href="/api/templates/lucro-oculto.csv">
              Baixar CSV modelo
            </a>
          </div>
        </aside>
      </section>
    </main>
  );
}
