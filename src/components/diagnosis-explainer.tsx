import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { getMainLeak, getMarginGap } from "@/lib/diagnosis-insights";
import type { ClientDiagnosis } from "@/lib/types";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";

export function DiagnosisExplainer({
  diagnosis,
  period,
  targetMargin
}: {
  diagnosis: ClientDiagnosis;
  period: string;
  targetMargin: number;
}) {
  const leak = getMainLeak(diagnosis);
  const marginGap = getMarginGap(diagnosis, targetMargin);

  return (
    <section className="insight-strip" aria-label="Leitura do diagnostico">
      <div className="insight-copy">
        <p className="eyebrow">Leitura do motor</p>
        <h2>{diagnosis.clientName} pede decisao primeiro.</h2>
        <p>
          {period}: maior vazamento em {leak.label.toLowerCase()} com{" "}
          <strong>{formatCurrency(leak.value)}</strong>. {leak.description}
        </p>
        <div className="insight-actions">
          <StatusBadge action={diagnosis.action} />
          <Link className="button-secondary" href={`/dashboard/clients/${diagnosis.clientId}`}>
            Abrir cliente
          </Link>
        </div>
      </div>

      <div className="formula-grid" aria-label="Formula resumida">
        <div>
          <span>Receita</span>
          <strong>{formatCurrency(diagnosis.revenue)}</strong>
          <small>Entrada manual ou CSV.</small>
        </div>
        <div>
          <span>Custos invisiveis</span>
          <strong>{formatCurrency(diagnosis.totalCost)}</strong>
          <small>Horas, retrabalho, urgencia, desconto e atraso.</small>
        </div>
        <div>
          <span>Margem real</span>
          <strong>{formatPercent(diagnosis.margin)}</strong>
          <small>
            {marginGap > 0
              ? `${formatPercent(marginGap)} abaixo da meta.`
              : "Dentro da meta configurada."}
          </small>
        </div>
        <div>
          <span>Caos operacional</span>
          <strong>{formatNumber(diagnosis.chaosScore)}/100</strong>
          <small>Chamados, urgencias, retrabalho e atraso.</small>
        </div>
      </div>
    </section>
  );
}
