import { AppShell } from "@/components/app-shell";
import { getDashboardData } from "@/lib/data";
import { formatCurrency, formatNumber } from "@/lib/format";

export default async function AdminPage() {
  const { organization, clients, contracts, entries, imports } = await getDashboardData();

  const revenue = entries.reduce((total, entry) => total + entry.revenue, 0);

  return (
    <AppShell organization={organization}>
      <div className="topbar">
        <div className="page-title">
          <h1>Admin beta</h1>
          <p>
            Controle simples para operacao beta. Gestao multiempresa com
            auditoria entra na sprint de cobranca.
          </p>
        </div>
      </div>

      <section className="dashboard-grid">
        <div className="metric">
          <span>Plano</span>
          <strong>{organization.plan}</strong>
          <small>Alteracao manual no banco por enquanto.</small>
        </div>
        <div className="metric">
          <span>Clientes</span>
          <strong>{clients.length}</strong>
          <small>Carteira cadastrada.</small>
        </div>
        <div className="metric">
          <span>Contratos</span>
          <strong>{contracts.length}</strong>
          <small>Escopos ativos ou importados.</small>
        </div>
        <div className="metric">
          <span>Receita lida</span>
          <strong>{formatCurrency(revenue)}</strong>
          <small>{formatNumber(imports.length)} importacoes recentes.</small>
        </div>
      </section>

      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="empty">
          <h2 style={{ margin: 0 }}>Proximo passo de admin</h2>
          <p className="muted">
            Na sprint de monetizacao entram liberacao de plano, limites por
            organizacao e auditoria basica. Hoje o acesso fica preso aos dados
            da sua propria organizacao por seguranca de RLS.
          </p>
        </div>
      </section>
    </AppShell>
  );
}
