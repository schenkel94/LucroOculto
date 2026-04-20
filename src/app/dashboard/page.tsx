import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { SeedDemoButton } from "@/components/forms";
import { StatusBadge } from "@/components/status-badge";
import { calculateDiagnoses } from "@/lib/calculations";
import { getDashboardData } from "@/lib/data";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";

export default async function DashboardPage() {
  const { organization, clients, entries } = await getDashboardData();
  const diagnoses = calculateDiagnoses(clients, entries, {
    hourlyCost: organization.hourly_cost,
    targetMargin: organization.target_margin,
    reworkFactor: organization.rework_factor,
    urgencyFactor: organization.urgency_factor,
    lateDailyPenalty: organization.late_daily_penalty
  });

  const totals = diagnoses.reduce(
    (acc, diagnosis) => {
      acc.revenue += diagnosis.revenue;
      acc.profit += diagnosis.profit;
      acc.hours += diagnosis.hours;
      acc.risk += diagnosis.action === "cortar" || diagnosis.action === "renegociar" ? 1 : 0;
      return acc;
    },
    { revenue: 0, profit: 0, hours: 0, risk: 0 }
  );

  const margin = totals.revenue > 0 ? totals.profit / totals.revenue : 0;

  return (
    <AppShell organization={organization}>
      <div className="topbar">
        <div className="page-title">
          <h1>Diagnostico</h1>
          <p>
            A carteira em ordem de dor: prejuizo primeiro, cliente bom por ultimo.
          </p>
        </div>
        <Link className="button" href="/dashboard/import">
          Importar CSV
        </Link>
      </div>

      <section className="dashboard-grid" aria-label="Resumo">
        <MetricCard label="Receita analisada" value={formatCurrency(totals.revenue)} hint="Soma dos lancamentos." />
        <MetricCard label="Lucro estimado" value={formatCurrency(totals.profit)} hint="Depois de horas, caos e descontos." />
        <MetricCard label="Margem media" value={formatPercent(margin)} hint="Meta configuravel nos ajustes." />
        <MetricCard label="Clientes em risco" value={String(totals.risk)} hint="Renegociar, cortar ou mudar escopo." />
      </section>

      <section className="section" style={{ paddingBottom: 0 }}>
        {diagnoses.length === 0 ? (
          <div className="empty">
            <h2 style={{ margin: 0 }}>Primeiro diagnostico ainda vazio.</h2>
            <p className="muted">
              Cadastre clientes, importe um CSV ou crie dados demo para ver o motor funcionando.
            </p>
            <div className="actions">
              <SeedDemoButton />
              <Link className="button-secondary" href="/dashboard/import">
                Importar CSV
              </Link>
              <Link className="button-secondary" href="/dashboard/clients">
                Cadastrar manualmente
              </Link>
              <a className="button-secondary" href="/api/templates/lucro-oculto.csv">
                Baixar modelo
              </a>
            </div>
          </div>
        ) : (
          <div className="table-shell">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Acao</th>
                  <th>Receita</th>
                  <th>Lucro</th>
                  <th>Margem</th>
                  <th>Caos</th>
                  <th>Preco sugerido</th>
                  <th>Motivo</th>
                </tr>
              </thead>
              <tbody>
                {diagnoses.map((diagnosis) => (
                  <tr key={diagnosis.clientId}>
                    <td>
                      <Link href={`/dashboard/clients/${diagnosis.clientId}`}>
                        <strong>{diagnosis.clientName}</strong>
                      </Link>
                    </td>
                    <td>
                      <StatusBadge action={diagnosis.action} />
                    </td>
                    <td>{formatCurrency(diagnosis.revenue)}</td>
                    <td>{formatCurrency(diagnosis.profit)}</td>
                    <td>{formatPercent(diagnosis.margin)}</td>
                    <td>{formatNumber(diagnosis.chaosScore)}/100</td>
                    <td>{formatCurrency(diagnosis.suggestedPrice)}</td>
                    <td>{diagnosis.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppShell>
  );
}
