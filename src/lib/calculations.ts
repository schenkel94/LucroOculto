import type {
  ClientDiagnosis,
  ClientRecord,
  CompanySettings,
  WorkEntry
} from "@/lib/types";

const DEFAULT_SETTINGS: CompanySettings = {
  hourlyCost: 65,
  targetMargin: 0.35,
  reworkFactor: 1.5,
  urgencyFactor: 0.75,
  lateDailyPenalty: 0.001
};

export function normalizeSettings(settings?: Partial<CompanySettings>): CompanySettings {
  return {
    hourlyCost: settings?.hourlyCost ?? DEFAULT_SETTINGS.hourlyCost,
    targetMargin: settings?.targetMargin ?? DEFAULT_SETTINGS.targetMargin,
    reworkFactor: settings?.reworkFactor ?? DEFAULT_SETTINGS.reworkFactor,
    urgencyFactor: settings?.urgencyFactor ?? DEFAULT_SETTINGS.urgencyFactor,
    lateDailyPenalty: settings?.lateDailyPenalty ?? DEFAULT_SETTINGS.lateDailyPenalty
  };
}

export function calculateDiagnoses(
  clients: ClientRecord[],
  entries: WorkEntry[],
  settingsInput?: Partial<CompanySettings>
): ClientDiagnosis[] {
  const settings = normalizeSettings(settingsInput);

  return clients
    .map((client) => {
      const clientEntries = entries.filter((entry) => entry.client_id === client.id);
      return calculateClientDiagnosis(client, clientEntries, settings);
    })
    .filter((diagnosis) => diagnosis.revenue > 0 || diagnosis.hours > 0)
    .sort((a, b) => a.profit - b.profit);
}

export function calculateClientDiagnosis(
  client: ClientRecord,
  entries: WorkEntry[],
  settingsInput?: Partial<CompanySettings>
): ClientDiagnosis {
  const settings = normalizeSettings(settingsInput);

  const totals = entries.reduce(
    (acc, entry) => {
      const hourlyCost = Number(entry.hourly_cost || settings.hourlyCost);
      acc.revenue += Number(entry.revenue || 0);
      acc.hours += Number(entry.hours || 0);
      acc.operationalCost += Number(entry.hours || 0) * hourlyCost;
      acc.reworkCost += Number(entry.rework_count || 0) * hourlyCost * settings.reworkFactor;
      acc.urgencyCost += Number(entry.urgent_count || 0) * hourlyCost * settings.urgencyFactor;
      acc.discounts += Number(entry.discount_amount || 0);
      acc.ticketCount += Number(entry.ticket_count || 0);
      acc.urgentCount += Number(entry.urgent_count || 0);
      acc.reworkCount += Number(entry.rework_count || 0);
      acc.paymentDelayDays += Number(entry.payment_delay_days || 0);
      return acc;
    },
    {
      revenue: 0,
      hours: 0,
      operationalCost: 0,
      reworkCost: 0,
      urgencyCost: 0,
      discounts: 0,
      ticketCount: 0,
      urgentCount: 0,
      reworkCount: 0,
      paymentDelayDays: 0
    }
  );

  const revenue = totals.revenue || Number(client.monthly_revenue || 0);
  const lateCost = revenue * Math.min(totals.paymentDelayDays, 45) * settings.lateDailyPenalty;
  const totalCost =
    totals.operationalCost +
    totals.reworkCost +
    totals.urgencyCost +
    totals.discounts +
    lateCost;
  const profit = revenue - totalCost;
  const margin = revenue > 0 ? profit / revenue : 0;
  const chaosScore = calculateChaosScore({
    ticketCount: totals.ticketCount,
    urgentCount: totals.urgentCount,
    reworkCount: totals.reworkCount,
    paymentDelayDays: totals.paymentDelayDays,
    hours: totals.hours,
    revenue
  });
  const suggestedPrice =
    settings.targetMargin >= 0.9 ? totalCost : totalCost / (1 - settings.targetMargin);
  const action = pickAction(margin, chaosScore, profit);
  const reason = buildReason(action, margin, chaosScore, totals.reworkCount, totals.urgentCount);

  return {
    clientId: client.id,
    clientName: client.name,
    revenue,
    hours: totals.hours,
    operationalCost: totals.operationalCost,
    reworkCost: totals.reworkCost,
    urgencyCost: totals.urgencyCost,
    lateCost,
    discounts: totals.discounts,
    totalCost,
    profit,
    margin,
    chaosScore,
    suggestedPrice,
    action,
    reason,
    ticketCount: totals.ticketCount,
    urgentCount: totals.urgentCount,
    reworkCount: totals.reworkCount,
    paymentDelayDays: totals.paymentDelayDays
  };
}

function calculateChaosScore(input: {
  ticketCount: number;
  urgentCount: number;
  reworkCount: number;
  paymentDelayDays: number;
  hours: number;
  revenue: number;
}) {
  const raw =
    input.ticketCount * 1.2 +
    input.urgentCount * 6 +
    input.reworkCount * 9 +
    Math.min(input.paymentDelayDays, 45) * 1.1 +
    Math.max(input.hours - 20, 0) * 0.8;

  return Math.min(Math.round(raw), 100);
}

function pickAction(
  margin: number,
  chaosScore: number,
  profit: number
): ClientDiagnosis["action"] {
  if (profit < 0 || chaosScore >= 78) return "cortar";
  if (margin < 0.15 || chaosScore >= 55) return "renegociar";
  if (margin < 0.35 || chaosScore >= 35) return "observar";
  return "saudavel";
}

function buildReason(
  action: ClientDiagnosis["action"],
  margin: number,
  chaosScore: number,
  reworkCount: number,
  urgentCount: number
) {
  if (action === "cortar") {
    return "Contrato com prejuizo ou caos alto demais para manter sem mudanca forte de escopo.";
  }

  if (action === "renegociar") {
    if (reworkCount > urgentCount) return "Retrabalho esta puxando a margem para baixo.";
    if (urgentCount > 0) return "Urgencias estao consumindo capacidade acima do combinado.";
    return "Margem abaixo do minimo saudavel para o negocio.";
  }

  if (action === "observar") {
    return chaosScore >= 35
      ? "Cliente ainda cabe na carteira, mas ja pede controle de escopo."
      : "Margem positiva, porem abaixo da meta definida.";
  }

  return margin >= 0.35
    ? "Cliente saudavel: boa margem e baixa friccao operacional."
    : "Cliente operando dentro do limite esperado.";
}

export function actionLabel(action: ClientDiagnosis["action"]) {
  const labels = {
    saudavel: "Saudavel",
    observar: "Observar",
    renegociar: "Renegociar",
    cortar: "Cortar ou mudar escopo"
  };

  return labels[action];
}
