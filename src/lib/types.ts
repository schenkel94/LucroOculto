export type Organization = {
  id: string;
  owner_user_id: string;
  name: string;
  plan: string;
  is_founder: boolean;
  billing_status: string;
  billing_email: string | null;
  billing_notes: string | null;
  paid_until: string | null;
  beta_started_at: string | null;
  hourly_cost: number;
  target_margin: number;
  rework_factor: number;
  urgency_factor: number;
  late_daily_penalty: number;
};

export type BillingEvent = {
  id: string;
  organization_id: string;
  event_type: string;
  plan: string;
  amount: number;
  status: string;
  contact_email: string | null;
  notes: string | null;
  created_at: string;
};

export type ImportRecord = {
  id: string;
  organization_id: string;
  filename: string;
  status: string;
  rows_total: number;
  rows_valid: number;
  rows_invalid: number;
  created_at: string;
};

export type ClientRecord = {
  id: string;
  organization_id: string;
  name: string;
  segment: string | null;
  monthly_revenue: number;
  notes: string | null;
};

export type ContractRecord = {
  id: string;
  organization_id: string;
  client_id: string;
  name: string;
  billing_type: string;
  expected_monthly_revenue: number;
  expected_hours: number;
  start_date: string | null;
  status: string;
};

export type WorkEntry = {
  id: string;
  organization_id: string;
  client_id: string;
  contract_id: string | null;
  entry_date: string;
  revenue: number;
  hours: number;
  hourly_cost: number;
  ticket_count: number;
  urgent_count: number;
  rework_count: number;
  discount_amount: number;
  payment_delay_days: number;
  notes: string | null;
  clients?: {
    name: string;
  } | null;
  contracts?: {
    name: string;
  } | null;
};

export type CsvWorkRow = {
  data: string;
  cliente: string;
  contrato?: string;
  receita: number;
  horas: number;
  custo_hora: number;
  chamados: number;
  urgencias: number;
  retrabalhos: number;
  descontos: number;
  atraso_pagamento_dias: number;
  observacoes?: string;
};

export type CompanySettings = {
  hourlyCost: number;
  targetMargin: number;
  reworkFactor: number;
  urgencyFactor: number;
  lateDailyPenalty: number;
};

export type ClientDiagnosis = {
  clientId: string;
  clientName: string;
  revenue: number;
  hours: number;
  operationalCost: number;
  reworkCost: number;
  urgencyCost: number;
  lateCost: number;
  discounts: number;
  totalCost: number;
  profit: number;
  margin: number;
  chaosScore: number;
  suggestedPrice: number;
  action: "saudavel" | "observar" | "renegociar" | "cortar";
  reason: string;
  ticketCount: number;
  urgentCount: number;
  reworkCount: number;
  paymentDelayDays: number;
};
