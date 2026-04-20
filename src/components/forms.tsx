import {
  createClientRecord,
  createContractRecord,
  createWorkEntryRecord,
  deleteClientRecord,
  requestPaidBeta,
  seedDemoData,
  updateOrganizationSettings
} from "@/app/dashboard/actions";
import type { ClientRecord, ContractRecord, Organization } from "@/lib/types";

export function ClientForm() {
  return (
    <form className="form-grid" action={createClientRecord}>
      <div className="field">
        <label className="label" htmlFor="client-name">
          Cliente
        </label>
        <input id="client-name" name="name" placeholder="Ex: Condominio Alfa" required />
      </div>
      <div className="field">
        <label className="label" htmlFor="segment">
          Segmento
        </label>
        <input id="segment" name="segment" placeholder="Ex: Condominios" />
      </div>
      <div className="field">
        <label className="label" htmlFor="monthly-revenue">
          Receita mensal prevista
        </label>
        <input id="monthly-revenue" name="monthly_revenue" inputMode="decimal" placeholder="2500" />
      </div>
      <div className="field">
        <label className="label" htmlFor="notes">
          Observacoes
        </label>
        <textarea id="notes" name="notes" placeholder="O que pesa nesse cliente?" />
      </div>
      <button className="button" type="submit">
        Salvar cliente
      </button>
    </form>
  );
}

export function ContractForm({ clients }: { clients: ClientRecord[] }) {
  return (
    <form className="form-grid" action={createContractRecord}>
      <div className="field">
        <label className="label" htmlFor="contract-client">
          Cliente
        </label>
        <select id="contract-client" name="client_id" required>
          <option value="">Selecione</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label className="label" htmlFor="contract-name">
          Contrato
        </label>
        <input id="contract-name" name="name" placeholder="Ex: Suporte mensal" required />
      </div>
      <div className="field">
        <label className="label" htmlFor="billing-type">
          Tipo
        </label>
        <select id="billing-type" name="billing_type" defaultValue="recurring">
          <option value="recurring">Recorrente</option>
          <option value="project">Projeto</option>
          <option value="hourly">Hora avulsa</option>
        </select>
      </div>
      <div className="field">
        <label className="label" htmlFor="expected-monthly-revenue">
          Receita prevista
        </label>
        <input id="expected-monthly-revenue" name="expected_monthly_revenue" inputMode="decimal" />
      </div>
      <div className="field">
        <label className="label" htmlFor="expected-hours">
          Horas previstas
        </label>
        <input id="expected-hours" name="expected_hours" inputMode="decimal" />
      </div>
      <div className="field">
        <label className="label" htmlFor="start-date">
          Inicio
        </label>
        <input id="start-date" type="date" name="start_date" />
      </div>
      <button className="button" type="submit">
        Salvar contrato
      </button>
    </form>
  );
}

export function WorkEntryForm({
  clients,
  contracts,
  organization
}: {
  clients: ClientRecord[];
  contracts: ContractRecord[];
  organization: Organization;
}) {
  return (
    <form className="form-grid" action={createWorkEntryRecord}>
      <div className="field">
        <label className="label" htmlFor="entry-client">
          Cliente
        </label>
        <select id="entry-client" name="client_id" required>
          <option value="">Selecione</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label className="label" htmlFor="entry-contract">
          Contrato
        </label>
        <select id="entry-contract" name="contract_id">
          <option value="">Sem contrato</option>
          {contracts.map((contract) => (
            <option key={contract.id} value={contract.id}>
              {contract.name}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label className="label" htmlFor="entry-date">
          Data
        </label>
        <input
          id="entry-date"
          type="date"
          name="entry_date"
          defaultValue={new Date().toISOString().slice(0, 10)}
        />
      </div>
      <div className="field">
        <label className="label" htmlFor="revenue">
          Receita
        </label>
        <input id="revenue" name="revenue" inputMode="decimal" placeholder="2500" />
      </div>
      <div className="field">
        <label className="label" htmlFor="hours">
          Horas gastas
        </label>
        <input id="hours" name="hours" inputMode="decimal" placeholder="18" />
      </div>
      <div className="field">
        <label className="label" htmlFor="hourly-cost">
          Custo/hora
        </label>
        <input
          id="hourly-cost"
          name="hourly_cost"
          inputMode="decimal"
          defaultValue={organization.hourly_cost}
        />
      </div>
      <div className="three-column">
        <div className="field">
          <label className="label" htmlFor="tickets">
            Chamados
          </label>
          <input id="tickets" name="ticket_count" inputMode="numeric" defaultValue="0" />
        </div>
        <div className="field">
          <label className="label" htmlFor="urgent">
            Urgencias
          </label>
          <input id="urgent" name="urgent_count" inputMode="numeric" defaultValue="0" />
        </div>
        <div className="field">
          <label className="label" htmlFor="rework">
            Retrabalhos
          </label>
          <input id="rework" name="rework_count" inputMode="numeric" defaultValue="0" />
        </div>
      </div>
      <div className="three-column">
        <div className="field">
          <label className="label" htmlFor="discount">
            Descontos
          </label>
          <input id="discount" name="discount_amount" inputMode="decimal" defaultValue="0" />
        </div>
        <div className="field">
          <label className="label" htmlFor="delay">
            Atraso em dias
          </label>
          <input id="delay" name="payment_delay_days" inputMode="numeric" defaultValue="0" />
        </div>
        <div className="field">
          <label className="label" htmlFor="entry-notes">
            Observacao
          </label>
          <input id="entry-notes" name="notes" placeholder="Opcional" />
        </div>
      </div>
      <button className="button" type="submit">
        Lancar dado
      </button>
    </form>
  );
}

export function SettingsForm({ organization }: { organization: Organization }) {
  return (
    <form className="form-grid" action={updateOrganizationSettings}>
      <div className="field">
        <label className="label" htmlFor="org-name">
          Empresa
        </label>
        <input id="org-name" name="name" defaultValue={organization.name} required />
      </div>
      <div className="three-column">
        <div className="field">
          <label className="label" htmlFor="settings-hourly">
            Custo/hora
          </label>
          <input
            id="settings-hourly"
            name="hourly_cost"
            inputMode="decimal"
            defaultValue={organization.hourly_cost}
          />
        </div>
        <div className="field">
          <label className="label" htmlFor="settings-margin">
            Margem alvo %
          </label>
          <input
            id="settings-margin"
            name="target_margin"
            inputMode="decimal"
            defaultValue={Math.round(organization.target_margin * 100)}
          />
        </div>
        <div className="field">
          <label className="label" htmlFor="settings-late">
            Penalidade atraso % ao dia
          </label>
          <input
            id="settings-late"
            name="late_daily_penalty"
            inputMode="decimal"
            defaultValue={organization.late_daily_penalty * 100}
          />
        </div>
      </div>
      <div className="three-column">
        <div className="field">
          <label className="label" htmlFor="settings-rework">
            Fator retrabalho
          </label>
          <input
            id="settings-rework"
            name="rework_factor"
            inputMode="decimal"
            defaultValue={organization.rework_factor}
          />
        </div>
        <div className="field">
          <label className="label" htmlFor="settings-urgency">
            Fator urgencia
          </label>
          <input
            id="settings-urgency"
            name="urgency_factor"
            inputMode="decimal"
            defaultValue={organization.urgency_factor}
          />
        </div>
      </div>
      <button className="button" type="submit">
        Salvar ajustes
      </button>
    </form>
  );
}

export function SeedDemoButton() {
  return (
    <form action={seedDemoData}>
      <button className="button" type="submit">
        Criar dados demo
      </button>
    </form>
  );
}

export function DeleteClientButton({ clientId }: { clientId: string }) {
  async function action() {
    "use server";
    await deleteClientRecord(clientId);
  }

  return (
    <form action={action}>
      <button className="button-danger" type="submit">
        Excluir cliente
      </button>
    </form>
  );
}

export function BetaRequestForm({
  defaultEmail,
  disabled
}: {
  defaultEmail?: string | null;
  disabled?: boolean;
}) {
  return (
    <form className="form-grid" action={requestPaidBeta}>
      <div className="field">
        <label className="label" htmlFor="billing-email">
          Email para cobranca
        </label>
        <input
          id="billing-email"
          name="contact_email"
          type="email"
          defaultValue={defaultEmail ?? ""}
          placeholder="financeiro@empresa.com"
          required
        />
      </div>
      <div className="field">
        <label className="label" htmlFor="billing-notes">
          Observacao
        </label>
        <textarea
          id="billing-notes"
          name="notes"
          placeholder="Ex: quero liberar beta por PIX e validar com 20 clientes."
        />
      </div>
      <button className="button" type="submit" disabled={disabled}>
        Solicitar beta pago
      </button>
    </form>
  );
}
