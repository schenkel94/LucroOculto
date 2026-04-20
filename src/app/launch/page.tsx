import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { BetaRequestForm } from "@/components/forms";
import { getBillingEvents, getDashboardData } from "@/lib/data";
import { formatCurrency, formatNumber } from "@/lib/format";
import {
  formatLimit,
  getBillingStatusLabel,
  getUsageStatus,
  PLAN_DEFINITIONS
} from "@/lib/plans";

export const dynamic = "force-dynamic";

export default async function LaunchPage() {
  const { organization, user, clients, entries, imports } = await getDashboardData();
  const billingEvents = await getBillingEvents(organization.id);
  const usage = getUsageStatus({ organization, clientsCount: clients.length, imports });
  const hasOpenRequest = billingEvents.some(
    (event) => event.event_type === "beta_requested" && event.status === "open"
  );
  const hasPaidAccess = organization.plan !== "free" || organization.billing_status === "active";
  const effectiveBillingStatus =
    organization.billing_status === "trial" && hasOpenRequest
      ? "requested"
      : organization.billing_status;

  return (
    <AppShell organization={organization}>
      <div className="topbar">
        <div className="page-title">
          <h1>Planos do Lucro Oculto</h1>
          <p>
            Comece no Free, prove a dor com poucos clientes e libere o beta
            pago quando a carteira real pedir mais volume.
          </p>
        </div>
        <Link className="button-secondary" href="/dashboard">
          Voltar ao diagnostico
        </Link>
      </div>

      <section className="dashboard-grid">
        <div className="metric">
          <span>Plano atual</span>
          <strong>{usage.plan.name}</strong>
          <small>{getBillingStatusLabel(effectiveBillingStatus)}</small>
        </div>
        <div className="metric">
          <span>Clientes</span>
          <strong>
            {clients.length}/{formatLimit(usage.clients.limit)}
          </strong>
          <small>Carteira carregada no workspace.</small>
        </div>
        <div className="metric">
          <span>Imports no mes</span>
          <strong>
            {usage.imports.used}/{formatLimit(usage.imports.limit)}
          </strong>
          <small>CSV recorrente e sinal de plano pago.</small>
        </div>
        <div className="metric">
          <span>Lancamentos</span>
          <strong>{formatNumber(entries.length)}</strong>
          <small>Dados analisados pelo motor.</small>
        </div>
      </section>

      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="section-heading">
          <h2>Escolha pelo momento da operacao</h2>
          <p>
            Nao vendemos tela bonita. Vendemos a decisao que tira cliente ruim
            da agenda, sustenta reajuste e protege margem.
          </p>
        </div>

        <div className="plan-grid">
          {PLAN_DEFINITIONS.map((plan) => {
            const isCurrent = plan.key === usage.plan.key;
            const isComingSoon = plan.key === "pro";
            const ctaHref = isCurrent
              ? "/dashboard"
              : isComingSoon
                ? "mailto:schenkel.mario@hotmail.com?subject=Lista Pro Lucro Oculto"
                : "#beta";
            const ctaClassName = isComingSoon || isCurrent ? "button-secondary" : "button";

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
                <a className={ctaClassName} href={ctaHref}>
                  {isCurrent ? "Plano atual" : plan.cta}
                </a>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section" id="beta" style={{ paddingBottom: 0 }}>
        <div className="two-column">
          <div className="panel">
            <h2 style={{ marginTop: 0 }}>Liberar beta pago</h2>
            <p className="muted">
              O beta e manual de proposito: voce pede acesso, a gente confirma
              pagamento por fora e libera o plano. Menos friccao, mais conversa
              com cliente real.
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
              disabled={hasOpenRequest || hasPaidAccess}
            />
          </div>

          <aside className="panel">
            <h2 style={{ marginTop: 0 }}>Quando o Beta pago faz sentido</h2>
            <div className="decision-options">
              <div>
                <strong>Voce tem mais de 3 clientes</strong>
                <p className="muted">
                  O Free prova o metodo. O Beta deixa analisar a carteira real.
                </p>
              </div>
              <div>
                <strong>Voce importa CSV mais de uma vez por mes</strong>
                <p className="muted">
                  Recorrencia mostra que a ferramenta entrou na rotina.
                </p>
              </div>
              <div>
                <strong>Voce vai usar relatorio com cliente</strong>
                <p className="muted">
                  O ganho aparece quando o diagnostico vira conversa de reajuste,
                  escopo ou corte.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </AppShell>
  );
}
