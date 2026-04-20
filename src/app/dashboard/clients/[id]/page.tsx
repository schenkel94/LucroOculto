import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { CopyButton } from "@/components/copy-button";
import { MetricCard } from "@/components/metric-card";
import { PriceSimulator } from "@/components/price-simulator";
import { StatusBadge } from "@/components/status-badge";
import { calculateClientDiagnosis } from "@/lib/calculations";
import { getDashboardData } from "@/lib/data";
import { getMainLeak } from "@/lib/diagnosis-insights";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";

export default async function ClientDetailPage({
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
  const renewalArgument = [
    `Nos dados analisados, ${client.name} gerou ${formatCurrency(diagnosis.revenue)} de receita.`,
    `O atendimento consumiu ${formatNumber(diagnosis.hours, 1)} horas, teve ${diagnosis.urgentCount} urgencias e ${diagnosis.reworkCount} retrabalhos.`,
    `A margem real ficou em ${formatPercent(diagnosis.margin)}, enquanto a meta da empresa e ${formatPercent(organization.target_margin)}.`,
    `Para manter o atendimento sem queimar margem, o novo valor de referencia e ${formatCurrency(diagnosis.suggestedPrice)}.`
  ].join(" ");

  return (
    <AppShell organization={organization}>
      <div className="topbar">
        <div className="page-title">
          <h1>{client.name}</h1>
          <p>{diagnosis.reason}</p>
        </div>
        <div className="actions" style={{ marginTop: 0 }}>
          <Link className="button-secondary" href="/dashboard/clients">
            Voltar
          </Link>
          <Link className="button" href={`/dashboard/clients/${client.id}/report`}>
            Relatorio
          </Link>
        </div>
      </div>

      <section className="dashboard-grid">
        <MetricCard label="Receita" value={formatCurrency(diagnosis.revenue)} hint="Valor analisado no periodo." />
        <MetricCard label="Lucro estimado" value={formatCurrency(diagnosis.profit)} hint="Receita menos custo operacional." />
        <MetricCard label="Margem" value={formatPercent(diagnosis.margin)} hint="Comparada com a meta da empresa." />
        <MetricCard label="Caos" value={`${formatNumber(diagnosis.chaosScore)}/100`} hint="Urgencia, retrabalho e atraso." />
      </section>

      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="two-column">
          <div className="panel">
            <div className="topbar" style={{ marginBottom: 18 }}>
              <div>
                <h2 style={{ margin: 0 }}>Diagnostico comercial</h2>
                <p className="muted">Preco minimo sugerido: {formatCurrency(diagnosis.suggestedPrice)}</p>
              </div>
              <StatusBadge action={diagnosis.action} />
            </div>

            <div className="bars">
              <Bar label="Custo operacional" value={diagnosis.operationalCost} max={diagnosis.revenue} tone="ok" />
              <Bar label="Retrabalho" value={diagnosis.reworkCost} max={diagnosis.revenue} tone="warning" />
              <Bar label="Urgencias" value={diagnosis.urgencyCost} max={diagnosis.revenue} tone="warning" />
              <Bar label="Descontos e atraso" value={diagnosis.discounts + diagnosis.lateCost} max={diagnosis.revenue} tone="danger" />
            </div>
          </div>

          <aside className="panel">
            <h2 style={{ marginTop: 0 }}>Argumento para renovacao</h2>
            <p className="muted">
              Nos dados analisados, {client.name} gerou {formatCurrency(diagnosis.revenue)}
              {" "}de receita, consumiu {formatNumber(diagnosis.hours, 1)} horas e fechou com
              {" "}margem de {formatPercent(diagnosis.margin)}.
            </p>
            <p className="muted">
              Para buscar a margem alvo, o novo valor de referencia e{" "}
              <strong>{formatCurrency(diagnosis.suggestedPrice)}</strong>.
            </p>
            <p className="muted">
              Principal vazamento: <strong>{mainLeak.label}</strong>, com{" "}
              {formatCurrency(mainLeak.value)}. {mainLeak.description}
            </p>
            <div className="actions">
              <CopyButton text={renewalArgument} />
            </div>
          </aside>
        </div>
      </section>

      <section className="section" style={{ paddingBottom: 0 }}>
        <PriceSimulator
          currentRevenue={diagnosis.revenue}
          suggestedPrice={diagnosis.suggestedPrice}
          targetMargin={organization.target_margin}
          totalCost={diagnosis.totalCost}
        />
      </section>

      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="table-shell">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Contrato</th>
                <th>Receita</th>
                <th>Horas</th>
                <th>Chamados</th>
                <th>Urgencias</th>
                <th>Retrabalho</th>
              </tr>
            </thead>
            <tbody>
              {clientEntries.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.entry_date}</td>
                  <td>{entry.contracts?.name ?? "Sem contrato"}</td>
                  <td>{formatCurrency(entry.revenue)}</td>
                  <td>{formatNumber(entry.hours, 1)}</td>
                  <td>{entry.ticket_count}</td>
                  <td>{entry.urgent_count}</td>
                  <td>{entry.rework_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}

function Bar({
  label,
  value,
  max,
  tone
}: {
  label: string;
  value: number;
  max: number;
  tone: "ok" | "warning" | "danger";
}) {
  const width = Math.min(100, Math.round((value / Math.max(max, 1)) * 100));
  const className = tone === "ok" ? "bar-fill" : `bar-fill ${tone}`;

  return (
    <div className="bar-row">
      <div className="bar-label">
        <span>{label}</span>
        <span>{formatCurrency(value)}</span>
      </div>
      <div className="bar-track">
        <div className={className} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}
