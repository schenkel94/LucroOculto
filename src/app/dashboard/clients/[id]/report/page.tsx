import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyButton } from "@/components/copy-button";
import { PrintButton } from "@/components/print-button";
import { StatusBadge } from "@/components/status-badge";
import { calculateClientDiagnosis } from "@/lib/calculations";
import { getDashboardData } from "@/lib/data";
import { getMainLeak } from "@/lib/diagnosis-insights";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";

export default async function ClientReportPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organization, clients, entries } = await getDashboardData();
  const client = clients.find((item) => item.id === id);

  if (!client) notFound();

  const clientEntries = entries.filter((entry) => entry.client_id === client.id);
  const diagnosis = calculateClientDiagnosis(client, clientEntries, {
    hourlyCost: organization.hourly_cost,
    targetMargin: organization.target_margin,
    reworkFactor: organization.rework_factor,
    urgencyFactor: organization.urgency_factor,
    lateDailyPenalty: organization.late_daily_penalty
  });
  const mainLeak = getMainLeak(diagnosis);
  const conversationText = [
    `Nos ultimos dados analisados, o contrato consumiu ${formatNumber(diagnosis.hours, 1)} horas, teve ${diagnosis.urgentCount} urgencias e ${diagnosis.reworkCount} retrabalhos.`,
    `O principal vazamento foi ${mainLeak.label.toLowerCase()}, estimado em ${formatCurrency(mainLeak.value)}.`,
    `Para manter atendimento sem queimar margem, o valor de referencia para renovacao fica em ${formatCurrency(diagnosis.suggestedPrice)}.`
  ].join(" ");

  return (
    <main className="report-page">
      <section className="report-sheet">
        <div className="report-header">
          <div>
            <p className="eyebrow" style={{ color: "var(--green)" }}>
              Lucro Oculto
            </p>
            <h1 style={{ margin: 0 }}>{client.name}</h1>
            <p className="muted">{organization.name}</p>
          </div>
          <div className="actions no-print" style={{ marginTop: 0 }}>
            <Link className="button-secondary" href={`/dashboard/clients/${client.id}`}>
              Voltar
            </Link>
            <PrintButton />
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="metric">
            <span>Receita</span>
            <strong>{formatCurrency(diagnosis.revenue)}</strong>
            <small>Periodo analisado.</small>
          </div>
          <div className="metric">
            <span>Lucro estimado</span>
            <strong>{formatCurrency(diagnosis.profit)}</strong>
            <small>Depois dos custos invisiveis.</small>
          </div>
          <div className="metric">
            <span>Margem</span>
            <strong>{formatPercent(diagnosis.margin)}</strong>
            <small>Meta: {formatPercent(organization.target_margin)}</small>
          </div>
          <div className="metric">
            <span>Acao</span>
            <strong style={{ fontSize: "1rem" }}>
              <StatusBadge action={diagnosis.action} />
            </strong>
            <small>{diagnosis.reason}</small>
          </div>
        </div>

        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="two-column">
            <div className="panel">
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
                      <th>Preco recomendado</th>
                      <td>{formatCurrency(diagnosis.suggestedPrice)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <aside className="panel">
              <h2 style={{ marginTop: 0 }}>Texto para a conversa</h2>
              <p className="muted">
                Nos ultimos dados analisados, o contrato consumiu{" "}
                {formatNumber(diagnosis.hours, 1)} horas, teve {diagnosis.urgentCount}
                {" "}urgencias e {diagnosis.reworkCount} retrabalhos.
              </p>
              <p className="muted">
                Para manter atendimento sem queimar margem, o valor de referencia
                para renovacao fica em {formatCurrency(diagnosis.suggestedPrice)}.
              </p>
              <p className="muted">
                Principal vazamento: <strong>{mainLeak.label}</strong>, com{" "}
                {formatCurrency(mainLeak.value)}.
              </p>
              <div className="actions no-print">
                <CopyButton text={conversationText} />
              </div>
            </aside>
          </div>
        </section>
      </section>
    </main>
  );
}
