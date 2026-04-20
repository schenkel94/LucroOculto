import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { CopyButton } from "@/components/copy-button";
import { calculateDiagnoses } from "@/lib/calculations";
import { getDashboardData } from "@/lib/data";
import { formatCurrency } from "@/lib/format";
import { getSetupStatus } from "@/lib/setup-status";

export const dynamic = "force-dynamic";

type LaunchItem = {
  label: string;
  detail: string;
  ok: boolean;
};

export default async function LaunchPage() {
  const [{ organization, clients, entries }, setup] = await Promise.all([
    getDashboardData(),
    getSetupStatus()
  ]);
  const diagnoses = calculateDiagnoses(clients, entries, {
    hourlyCost: organization.hourly_cost,
    targetMargin: organization.target_margin,
    reworkFactor: organization.rework_factor,
    urgencyFactor: organization.urgency_factor,
    lateDailyPenalty: organization.late_daily_penalty
  });
  const worstDiagnosis = diagnoses[0];
  const launchPitch = buildLaunchPitch(worstDiagnosis?.clientName);
  const checklist = buildChecklist({
    clientCount: clients.length,
    entriesCount: entries.length,
    hasSetup: setup.ok,
    hasDecision: Boolean(worstDiagnosis)
  });
  const doneCount = checklist.filter((item) => item.ok).length;
  const readiness = Math.round((doneCount / checklist.length) * 100);

  return (
    <AppShell organization={organization}>
      <div className="topbar">
        <div className="page-title">
          <h1>Polimento, seguranca e lancamento</h1>
          <p>
            O minimo para chamar beta pago sem parecer improviso: setup limpo,
            demo convincente, decisao clara e proxima acao pronta.
          </p>
        </div>
        <Link className="button" href="/admin">
          Ver planos
        </Link>
      </div>

      <section className="dashboard-grid">
        <div className="metric">
          <span>Prontidao</span>
          <strong>{readiness}%</strong>
          <small>{doneCount} de {checklist.length} itens fechados.</small>
        </div>
        <div className="metric">
          <span>Clientes</span>
          <strong>{clients.length}</strong>
          <small>Meta de demo: pelo menos 3.</small>
        </div>
        <div className="metric">
          <span>Lancamentos</span>
          <strong>{entries.length}</strong>
          <small>Precisa de dado para vender decisao.</small>
        </div>
        <div className="metric">
          <span>Pior caso</span>
          <strong>{worstDiagnosis ? formatCurrency(worstDiagnosis.profit) : "-"}</strong>
          <small>{worstDiagnosis?.clientName ?? "Ainda sem diagnostico."}</small>
        </div>
      </section>

      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="two-column">
          <div className="panel">
            <h2 style={{ marginTop: 0 }}>Checklist de go-live</h2>
            <div className="launch-checklist">
              {checklist.map((item) => (
                <div className="launch-item" key={item.label}>
                  <span className={item.ok ? "setup-dot ok" : "setup-dot warn"} />
                  <div>
                    <strong>{item.label}</strong>
                    <p className="muted">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="actions">
              <Link className="button-secondary" href="/setup">
                Checar setup
              </Link>
              <Link className="button-secondary" href="/dashboard">
                Abrir diagnostico
              </Link>
            </div>
          </div>

          <aside className="panel">
            <h2 style={{ marginTop: 0 }}>Mensagem de beta</h2>
            <p className="muted">
              Convite curto para mandar no WhatsApp, LinkedIn ou email. Venda
              uma decisao, nao uma ferramenta.
            </p>
            <pre className="sql-box">{launchPitch}</pre>
            <div className="actions">
              <CopyButton label="Copiar mensagem" text={launchPitch} />
            </div>
          </aside>
        </div>
      </section>

      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="launch-steps">
          <div>
            <span>1</span>
            <strong>Fechar setup</strong>
            <p className="muted">
              Rode o schema completo no Supabase ate o setup ficar verde.
            </p>
          </div>
          <div>
            <span>2</span>
            <strong>Carregar carteira real</strong>
            <p className="muted">
              Use 3 a 10 clientes. Se nao tiver CSV pronto, cadastre manualmente.
            </p>
          </div>
          <div>
            <span>3</span>
            <strong>Abrir o pior relatorio</strong>
            <p className="muted">
              O primeiro print precisa mostrar prejuizo, margem ou caos de agenda.
            </p>
          </div>
          <div>
            <span>4</span>
            <strong>Cobrar beta fundador</strong>
            <p className="muted">
              R$ 97 por 30 dias, liberacao manual e feedback direto.
            </p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function buildChecklist({
  clientCount,
  entriesCount,
  hasDecision,
  hasSetup
}: {
  clientCount: number;
  entriesCount: number;
  hasDecision: boolean;
  hasSetup: boolean;
}): LaunchItem[] {
  return [
    {
      label: "Supabase e env",
      detail: hasSetup
        ? "Schema e variaveis conferidos."
        : "Rode o schema completo e revise as variaveis na Vercel.",
      ok: hasSetup
    },
    {
      label: "Base demonstravel",
      detail: clientCount >= 3
        ? "Carteira minima pronta para mostrar."
        : "Carregue pelo menos 3 clientes para a demo fazer sentido.",
      ok: clientCount >= 3
    },
    {
      label: "Dados operacionais",
      detail: entriesCount > 0
        ? "Ha lancamentos para calcular margem."
        : "Importe CSV ou lance dados manuais antes de vender.",
      ok: entriesCount > 0
    },
    {
      label: "Decisao comercial",
      detail: hasDecision
        ? "Ja existe cliente priorizado para relatorio."
        : "O diagnostico precisa apontar um cliente antes da venda.",
      ok: hasDecision
    },
    {
      label: "Seguranca basica",
      detail: "Headers, CSP, bloqueio de probes comuns e RLS no Supabase.",
      ok: true
    },
    {
      label: "Oferta beta",
      detail: "R$ 97 por 30 dias, suporte fundador e liberacao manual.",
      ok: true
    }
  ];
}

function buildLaunchPitch(clientName?: string) {
  const example = clientName
    ? `No meu teste, o primeiro caso critico foi ${clientName}.`
    : "Em 10 minutos da para sair com o primeiro cliente critico.";

  return `Estou abrindo o beta fundador do Lucro Oculto.

Ele pega uma planilha simples de clientes, horas, chamados e descontos, e mostra quem esta queimando margem.

${example}

A ideia e direta: achar reajuste, limite de escopo ou cliente que precisa sair da carteira.

Beta fundador: R$ 97 por 30 dias, com meu suporte direto para interpretar o primeiro diagnostico.`;
}
