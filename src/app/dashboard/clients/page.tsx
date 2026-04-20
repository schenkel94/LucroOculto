import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import {
  ClientForm,
  ContractForm,
  DeleteClientButton,
  WorkEntryForm
} from "@/components/forms";
import { PlanGate } from "@/components/plan-gate";
import { StatusBadge } from "@/components/status-badge";
import { calculateDiagnoses } from "@/lib/calculations";
import { getDashboardData } from "@/lib/data";
import { formatCurrency, formatPercent } from "@/lib/format";
import { getUsageStatus } from "@/lib/plans";

export default async function ClientsPage() {
  const { organization, clients, contracts, entries, imports } = await getDashboardData();
  const diagnoses = calculateDiagnoses(clients, entries, {
    hourlyCost: organization.hourly_cost,
    targetMargin: organization.target_margin,
    reworkFactor: organization.rework_factor,
    urgencyFactor: organization.urgency_factor,
    lateDailyPenalty: organization.late_daily_penalty
  });

  const diagnosisMap = new Map(diagnoses.map((diagnosis) => [diagnosis.clientId, diagnosis]));
  const usage = getUsageStatus({ organization, clientsCount: clients.length, imports });

  return (
    <AppShell organization={organization}>
      <div className="topbar">
        <div className="page-title">
          <h1>Clientes</h1>
          <p>Cadastre o basico, lance dados soltos ou organize por contrato.</p>
        </div>
      </div>

      <div className="two-column">
        <section className="panel">
          <h2 style={{ marginTop: 0 }}>Carteira</h2>
          {clients.length === 0 ? (
            <p className="muted">Nenhum cliente cadastrado ainda.</p>
          ) : (
            <div className="table-shell">
              <table>
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Status</th>
                    <th>Receita</th>
                    <th>Margem</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => {
                    const diagnosis = diagnosisMap.get(client.id);
                    return (
                      <tr key={client.id}>
                        <td>
                          <Link href={`/dashboard/clients/${client.id}`}>
                            <strong>{client.name}</strong>
                          </Link>
                          <br />
                          <span className="muted">{client.segment || "Sem segmento"}</span>
                        </td>
                        <td>
                          {diagnosis ? <StatusBadge action={diagnosis.action} /> : "Sem dados"}
                        </td>
                        <td>{formatCurrency(diagnosis?.revenue ?? client.monthly_revenue)}</td>
                        <td>{diagnosis ? formatPercent(diagnosis.margin) : "-"}</td>
                        <td>
                          <DeleteClientButton clientId={client.id} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="form-grid">
          <div className="panel">
            <h2 style={{ marginTop: 0 }}>Novo cliente</h2>
            {usage.clients.reached ? (
              <PlanGate
                title="Carteira free completa"
                description="O plano Free valida com 3 clientes. Para cadastrar mais contas, libere o beta pago."
                used={usage.clients.used}
                limit={usage.clients.limit}
              />
            ) : (
              <ClientForm />
            )}
          </div>
          <div className="panel">
            <h2 style={{ marginTop: 0 }}>Novo contrato</h2>
            <ContractForm clients={clients} />
          </div>
          <div className="panel">
            <h2 style={{ marginTop: 0 }}>Lancamento manual</h2>
            <WorkEntryForm clients={clients} contracts={contracts} organization={organization} />
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
