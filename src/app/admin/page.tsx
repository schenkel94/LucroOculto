import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { CopyButton } from "@/components/copy-button";
import { BetaRequestForm } from "@/components/forms";
import { getBillingEvents, getDashboardData } from "@/lib/data";
import { formatCurrency, formatNumber } from "@/lib/format";
import {
  formatLimit,
  getBillingStatusLabel,
  getUsageStatus,
  PLAN_DEFINITIONS
} from "@/lib/plans";

export default async function AdminPage() {
  const { organization, user, clients, contracts, entries, imports } = await getDashboardData();

  if (!organization.is_founder) {
    redirect("/launch");
  }

  const billingEvents = await getBillingEvents(organization.id);

  const revenue = entries.reduce((total, entry) => total + entry.revenue, 0);
  const usage = getUsageStatus({ organization, clientsCount: clients.length, imports });
  const hasOpenRequest = billingEvents.some(
    (event) => event.event_type === "beta_requested" && event.status === "open"
  );
  const effectiveBillingStatus =
    organization.billing_status === "trial" && hasOpenRequest
      ? "requested"
      : organization.billing_status;
  const activationSql = `update public.organizations
set plan = 'beta',
    billing_status = 'active',
    paid_until = current_date + interval '30 days'
where id = '${organization.id}';`;

  return (
    <AppShell organization={organization}>
      <div className="topbar">
        <div className="page-title">
          <h1>Admin, planos e beta pago</h1>
          <p>
            Cockpit de fundador para vender beta, acompanhar limite e liberar
            acesso manualmente sem expor SQL para usuarios normais.
          </p>
        </div>
      </div>

      <section className="dashboard-grid">
        <div className="metric">
          <span>Plano</span>
          <strong>{usage.plan.name}</strong>
          <small>{getBillingStatusLabel(effectiveBillingStatus)}</small>
        </div>
        <div className="metric">
          <span>Clientes no limite</span>
          <strong>
            {clients.length}/{formatLimit(usage.clients.limit)}
          </strong>
          <small>Free trava em 3 clientes.</small>
        </div>
        <div className="metric">
          <span>Imports no mes</span>
          <strong>
            {usage.imports.used}/{formatLimit(usage.imports.limit)}
          </strong>
          <small>CSV recorrente vira argumento de upgrade.</small>
        </div>
        <div className="metric">
          <span>Receita lida</span>
          <strong>{formatCurrency(revenue)}</strong>
          <small>
            {formatNumber(contracts.length)} contratos e {formatNumber(imports.length)} imports.
          </small>
        </div>
      </section>

      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="section-heading">
          <h2>Planos</h2>
          <p>Free serve para provar dor. Beta pago serve para destravar decisao e caixa.</p>
        </div>
        <div className="plan-grid">
          {PLAN_DEFINITIONS.map((plan) => {
            const isCurrent = plan.key === usage.plan.key;

            return (
              <article className="plan-card" key={plan.key}>
                <div className="plan-card-head">
                  <span className="badge observar">{plan.badge}</span>
                  {isCurrent ? <span className="plan-current">Atual</span> : null}
                </div>
                <h3>{plan.name}</h3>
                <strong>{plan.price === 0 ? "R$ 0" : `${formatCurrency(plan.price)}/mes`}</strong>
                <p className="muted">{plan.description}</p>
                <div className="limit-list">
                  <div className="limit-row">
                    <span>Clientes</span>
                    <strong>{formatLimit(plan.limits.clients)}</strong>
                  </div>
                  <div className="limit-row">
                    <span>Imports/mes</span>
                    <strong>{formatLimit(plan.limits.importsPerMonth)}</strong>
                  </div>
                  <div className="limit-row">
                    <span>Relatorios</span>
                    <strong>{formatLimit(plan.limits.decisionReports)}</strong>
                  </div>
                </div>
                <ul className="plain-list">
                  {plan.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="two-column">
          <div className="panel">
            <h2 style={{ marginTop: 0 }}>Pedido de beta pago</h2>
            <p className="muted">
              O cliente pede o beta, voce cobra por fora e libera o plano pelo
              SQL abaixo. Simples, auditavel e sem dependencia de gateway nesta fase.
            </p>
            <div className="billing-status">
              <div>
                <span>Status</span>
                <strong>{getBillingStatusLabel(effectiveBillingStatus)}</strong>
              </div>
              <div>
                <span>Vencimento</span>
                <strong>{organization.paid_until ?? "Nao liberado"}</strong>
              </div>
            </div>
            <BetaRequestForm
              defaultEmail={organization.billing_email ?? user.email}
              disabled={hasOpenRequest}
            />
          </div>

          <aside className="panel">
            <h2 style={{ marginTop: 0 }}>Liberacao manual</h2>
            <p className="muted">
              Depois de receber o PIX ou confirmar o pagamento, rode isto no SQL
              Editor do Supabase.
            </p>
            <pre className="sql-box">{activationSql}</pre>
            <div className="actions">
              <CopyButton label="Copiar SQL" text={activationSql} />
            </div>
            <p className="muted">
              A app nao permite update desses campos pelo usuario autenticado.
              Essa liberacao fica no operador fundador por enquanto.
            </p>
          </aside>
        </div>
      </section>

      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="panel">
          <h2 style={{ marginTop: 0 }}>Historico comercial</h2>
          {billingEvents.length === 0 ? (
            <p className="muted">Nenhum pedido de beta registrado ainda.</p>
          ) : (
            <div className="billing-timeline">
              {billingEvents.map((event) => (
                <div className="billing-event" key={event.id}>
                  <div>
                    <strong>{event.event_type === "beta_requested" ? "Beta solicitado" : event.event_type}</strong>
                    <span>{new Date(event.created_at).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <p className="muted">
                    {event.contact_email ?? "Sem email"} - {formatCurrency(event.amount)} -{" "}
                    {event.status}
                  </p>
                  {event.notes ? <p>{event.notes}</p> : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
