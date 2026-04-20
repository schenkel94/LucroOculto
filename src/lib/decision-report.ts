import { actionLabel } from "@/lib/calculations";
import { getMainLeak, getMarginGap } from "@/lib/diagnosis-insights";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import type { ClientDiagnosis } from "@/lib/types";

export type DecisionReport = {
  decision: string;
  headline: string;
  summary: string;
  proposedPrice: number;
  priceDelta: number;
  expectedProfit: number;
  expectedLift: number;
  evidence: Array<{
    label: string;
    value: string;
    detail: string;
  }>;
  proposal: string[];
  script: string[];
  options: Array<{
    label: string;
    detail: string;
  }>;
  copyText: string;
};

export function buildDecisionReport(
  diagnosis: ClientDiagnosis,
  targetMargin: number
): DecisionReport {
  const mainLeak = getMainLeak(diagnosis);
  const marginGap = getMarginGap(diagnosis, targetMargin);
  const proposedPrice = pickProposedPrice(diagnosis);
  const priceDelta = Math.max(0, proposedPrice - diagnosis.revenue);
  const expectedProfit = proposedPrice - diagnosis.totalCost;
  const expectedLift = expectedProfit - diagnosis.profit;
  const decision = pickDecision(diagnosis);
  const headline = pickHeadline(diagnosis, proposedPrice);
  const summary = buildSummary(diagnosis, targetMargin, proposedPrice);
  const proposal = buildProposal(diagnosis, proposedPrice, priceDelta);
  const script = buildScript(diagnosis, proposedPrice, mainLeak.label);
  const options = buildOptions(diagnosis, proposedPrice);

  const evidence = [
    {
      label: "Margem real",
      value: formatPercent(diagnosis.margin),
      detail:
        marginGap > 0
          ? `${formatPercent(marginGap)} abaixo da meta de ${formatPercent(targetMargin)}.`
          : `Dentro da meta de ${formatPercent(targetMargin)}.`
    },
    {
      label: "Vazamento principal",
      value: formatCurrency(mainLeak.value),
      detail: `${mainLeak.label}: ${mainLeak.description}`
    },
    {
      label: "Caos operacional",
      value: `${formatNumber(diagnosis.chaosScore)}/100`,
      detail: `${diagnosis.urgentCount} urgencias, ${diagnosis.reworkCount} retrabalhos e ${diagnosis.paymentDelayDays} dias de atraso.`
    },
    {
      label: "Valor recomendado",
      value: formatCurrency(proposedPrice),
      detail:
        priceDelta > 0
          ? `Reajuste de ${formatCurrency(priceDelta)} para recuperar margem.`
          : "Manter valor e proteger escopo."
    }
  ];

  const copyText = buildCopyText({
    diagnosis,
    decision,
    evidence,
    expectedLift,
    proposal,
    script,
    summary
  });

  return {
    decision,
    headline,
    summary,
    proposedPrice,
    priceDelta,
    expectedProfit,
    expectedLift,
    evidence,
    proposal,
    script,
    options,
    copyText
  };
}

function pickProposedPrice(diagnosis: ClientDiagnosis) {
  if (diagnosis.action === "saudavel") {
    return Math.max(diagnosis.revenue, diagnosis.suggestedPrice);
  }

  return Math.ceil(Math.max(diagnosis.suggestedPrice, diagnosis.revenue) / 100) * 100;
}

function pickDecision(diagnosis: ClientDiagnosis) {
  const decisions = {
    saudavel: "Renovar e proteger margem",
    observar: "Renovar com limite de escopo",
    renegociar: "Reajustar ou reduzir escopo",
    cortar: "Cortar escopo ou encerrar"
  };

  return decisions[diagnosis.action];
}

function pickHeadline(diagnosis: ClientDiagnosis, proposedPrice: number) {
  if (diagnosis.action === "saudavel") {
    return `${diagnosis.clientName} pode renovar sem drama.`;
  }

  if (diagnosis.action === "observar") {
    return `${diagnosis.clientName} ainda cabe, mas precisa de regra.`;
  }

  if (diagnosis.action === "renegociar") {
    return `${diagnosis.clientName} precisa pagar pelo que consome.`;
  }

  return `${diagnosis.clientName} so faz sentido com nova proposta de ${formatCurrency(proposedPrice)}.`;
}

function buildSummary(
  diagnosis: ClientDiagnosis,
  targetMargin: number,
  proposedPrice: number
) {
  const action = actionLabel(diagnosis.action).toLowerCase();

  return [
    `A decisao recomendada e ${action}.`,
    `O cliente trouxe ${formatCurrency(diagnosis.revenue)}, consumiu ${formatNumber(diagnosis.hours, 1)} horas e ficou com margem de ${formatPercent(diagnosis.margin)}.`,
    `Para mirar ${formatPercent(targetMargin)}, o valor de referencia passa a ser ${formatCurrency(proposedPrice)}.`
  ].join(" ");
}

function buildProposal(
  diagnosis: ClientDiagnosis,
  proposedPrice: number,
  priceDelta: number
) {
  if (diagnosis.action === "saudavel") {
    return [
      "Renovar mantendo o escopo atual.",
      "Registrar limites de urgencia e retrabalho para preservar margem.",
      "Oferecer expansao somente se houver novo pacote ou novo contrato."
    ];
  }

  if (diagnosis.action === "observar") {
    return [
      "Renovar com escopo fechado e regra de urgencia.",
      priceDelta > 0
        ? `Usar ${formatCurrency(proposedPrice)} como valor alvo.`
        : "Manter valor, mas travar demanda fora do combinado.",
      "Revisar em 30 dias com novos lancamentos."
    ];
  }

  if (diagnosis.action === "renegociar") {
    return [
      `Apresentar reajuste para ${formatCurrency(proposedPrice)}.`,
      "Se houver resistencia, reduzir escopo ate a margem voltar para a meta.",
      "Cobrar urgencias e retrabalhos fora do pacote."
    ];
  }

  return [
    `Oferecer continuidade apenas a partir de ${formatCurrency(proposedPrice)}.`,
    "Se nao aceitar, preparar transicao educada e encerrar sem queimar agenda.",
    "Nao absorver nova urgencia sem aprovacao comercial."
  ];
}

function buildScript(
  diagnosis: ClientDiagnosis,
  proposedPrice: number,
  mainLeakLabel: string
) {
  return [
    `Abrir com contexto: \"Revisei os ultimos atendimentos para manter qualidade e previsibilidade.\"`,
    `Mostrar o fato: \"O principal ponto foi ${mainLeakLabel.toLowerCase()}, e a margem real ficou em ${formatPercent(diagnosis.margin)}.\"`,
    `Conectar com decisao: \"Para continuar nesse nivel, precisamos trabalhar com ${formatCurrency(proposedPrice)} ou ajustar escopo.\"`,
    "Fechar com escolha: \"Prefere manter o atendimento completo nesse valor ou priorizar um escopo menor?\""
  ];
}

function buildOptions(diagnosis: ClientDiagnosis, proposedPrice: number) {
  const keepScope = {
    label: "Opcao A: manter escopo",
    detail: `Novo valor de referencia: ${formatCurrency(proposedPrice)}.`
  };
  const reduceScope = {
    label: "Opcao B: reduzir escopo",
    detail: "Manter valor atual cortando urgencias, retrabalhos e demanda fora do pacote."
  };
  const exit = {
    label: "Opcao C: transicao",
    detail: "Encerrar com prazo combinado se o cliente nao aceitar preco nem escopo."
  };

  if (diagnosis.action === "saudavel") {
    return [
      {
        label: "Opcao A: renovar",
        detail: "Manter valor e escopo atual com limites documentados."
      },
      {
        label: "Opcao B: expandir",
        detail: "Criar pacote adicional para novas demandas."
      },
      {
        label: "Opcao C: observar",
        detail: "Acompanhar margem no proximo ciclo."
      }
    ];
  }

  if (diagnosis.action === "observar") {
    return [reduceScope, keepScope, exit];
  }

  return [keepScope, reduceScope, exit];
}

function buildCopyText({
  diagnosis,
  decision,
  evidence,
  expectedLift,
  proposal,
  script,
  summary
}: {
  diagnosis: ClientDiagnosis;
  decision: string;
  evidence: DecisionReport["evidence"];
  expectedLift: number;
  proposal: string[];
  script: string[];
  summary: string;
}) {
  return [
    `Relatorio Lucro Oculto - ${diagnosis.clientName}`,
    `Decisao: ${decision}`,
    "",
    summary,
    "",
    "Evidencias:",
    ...evidence.map((item) => `- ${item.label}: ${item.value}. ${item.detail}`),
    "",
    `Impacto estimado: ${formatCurrency(expectedLift)} de melhoria no lucro do periodo analisado.`,
    "",
    "Proposta:",
    ...proposal.map((item) => `- ${item}`),
    "",
    "Roteiro da conversa:",
    ...script.map((item) => `- ${item}`)
  ].join("\n");
}
