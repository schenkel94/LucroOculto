import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyButton } from "@/components/copy-button";
import { PrintButton } from "@/components/print-button";
import { StatusBadge } from "@/components/status-badge";
import { calculateClientDiagnosis } from "@/lib/calculations";
import { getDashboardData } from "@/lib/data";
import { buildDecisionReport } from "@/lib/decision-report";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import { filterEntriesByPeriod, normalizePeriod, periodLabel } from "@/lib/periods";

export default async function ClientReportPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ period?: string }>;
}) {
  const [{ id }, { period: periodParam }] = await Promise.all([params, searchParams]);
  const activePeriod = normalizePeriod(periodParam);
  const activePeriodLabel = periodLabel(activePeriod);
  const { organization, clients, entries } = await getDashboardData();
  const client = clients.find((item) => item.id === id);

  if (!client) notFound();

  const clientEntries = filterEntriesByPeriod(
    entries.filter((entry) => entry.client_id === client.id),
    activePeriod
  );
  const diagnosis = calculateClientDiagnosis(client, clientEntries, {
    hourlyCost: organization.hourly_cost,
    targetMargin: organization.target_margin,
    reworkFactor: organization.rework_factor,
    urgencyFactor: organization.urgency_factor,
    lateDailyPenalty: organization.late_daily_penalty
  });
  const report = buildDecisionReport(diagnosis, organization.target_margin);

  return (
    <main className="report-page">
      <section className="report-sheet">
        <div className="report-header">
          <div>
            <p className="eyebrow" style={{ color: "var(--green)" }}>
              Lucro Oculto
            </p>
            <h1 style={{ margin: 0 }}>{client.name}</h1>
            <p className="muted">
              {organization.name} | Periodo: {activePeriodLabel.toLowerCase()}
            </p>
          </div>
          <div className="actions no-print" style={{ marginTop: 0 }}>
            <Link className="button-secondary" href={`/dashboard/clients/${client.id}?period=${activePeriod}`}>
              Voltar
            </Link>
            <CopyButton label="Copiar memo" text={report.copyText} />
            <PrintButton />
          </div>
        </div>

        <section className={`decision-hero ${diagnosis.action}`}>
          <div>
            <p className="eyebrow">Relatorio que vende a decisao</p>
            <h2>{report.headline}</h2>
            <p>{report.summary}</p>
          </div>
          <aside className="decision-summary">
            <span>Decisao recomendada</span>
            <strong>{report.decision}</strong>
            <StatusBadge action={diagnosis.action} />
          </aside>
        </section>

        <div className="dashboard-grid">
          <div className="metric">
            <span>Receita</span>
            <strong>{formatCurrency(diagnosis.revenue)}</strong>
            <small>{activePeriodLabel}.</small>
          </div>
          <div className="metric">
            <span>Lucro atual</span>
            <strong>{formatCurrency(diagnosis.profit)}</strong>
            <small>Depois dos custos invisiveis.</small>
          </div>
          <div className="metric">
            <span>Margem</span>
            <strong>{formatPercent(diagnosis.margin)}</strong>
            <small>Meta: {formatPercent(organization.target_margin)}</small>
          </div>
          <div className="metric">
            <span>Impacto estimado</span>
            <strong>{formatCurrency(report.expectedLift)}</strong>
            <small>Ganho se a proposta for aceita.</small>
          </div>
        </div>

        <section className="report-section">
          <div className="section-heading">
            <h2>Evidencias que sustentam</h2>
            <p>Mostre fato, nao opiniao. A conversa fica mais simples quando a decisao nasce dos numeros.</p>
          </div>
          <div className="evidence-grid">
            {report.evidence.map((item) => (
              <div className="evidence-card" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <small>{item.detail}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="report-section">
          <div className="two-column">
            <div className="panel">
              <h2 style={{ marginTop: 0 }}>Proposta objetiva</h2>
              <ul className="proposal-list">
                {report.proposal.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <aside className="panel">
              <h2 style={{ marginTop: 0 }}>Opcoes para fechar</h2>
              <div className="decision-options">
                {report.options.map((option) => (
                  <div key={option.label}>
                    <strong>{option.label}</strong>
                    <p className="muted">{option.detail}</p>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <section className="report-section">
          <div className="two-column">
            <div className="panel">
              <h2 style={{ marginTop: 0 }}>Roteiro da conversa</h2>
              <ol className="script-list">
                {report.script.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </div>

            <aside className="panel">
              <h2 style={{ marginTop: 0 }}>Resumo financeiro</h2>
              <div className="table-shell">
                <table>
                  <tbody>
                    <tr>
                      <th>Horas consumidas</th>
                      <td>{formatNumber(diagnosis.hours, 1)}</td>
                    </tr>
                    <tr>
                      <th>Custo operacional</th>
                      <td>{formatCurrency(diagnosis.operationalCost)}</td>
                    </tr>
                    <tr>
                      <th>Custo de retrabalho</th>
                      <td>{formatCurrency(diagnosis.reworkCost)}</td>
                    </tr>
                    <tr>
                      <th>Custo de urgencia</th>
                      <td>{formatCurrency(diagnosis.urgencyCost)}</td>
                    </tr>
                    <tr>
                      <th>Descontos e atraso</th>
                      <td>{formatCurrency(diagnosis.discounts + diagnosis.lateCost)}</td>
                    </tr>
                    <tr>
                      <th>Valor recomendado</th>
                      <td>{formatCurrency(report.proposedPrice)}</td>
                    </tr>
                    <tr>
                      <th>Lucro se aceitar</th>
                      <td>{formatCurrency(report.expectedProfit)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </aside>
          </div>
        </section>
      </section>
    </main>
  );
}
