import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type {
  ClientRecord,
  ContractRecord,
  Organization,
  WorkEntry
} from "@/lib/types";

type User = {
  id: string;
  email?: string;
};

export async function getAuthenticatedContext() {
  const supabase = await createClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const organization = await getOrCreateOrganization(supabase, {
    id: user.id,
    email: user.email ?? undefined
  });

  return {
    supabase,
    user,
    organization
  };
}

export async function getDashboardData() {
  const { supabase, user, organization } = await getAuthenticatedContext();

  const [clientsResult, contractsResult, entriesResult, importsResult] =
    await Promise.all([
      supabase
        .from("clients")
        .select("*")
        .eq("organization_id", organization.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("contracts")
        .select("*")
        .eq("organization_id", organization.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("work_entries")
        .select("*, clients(name), contracts(name)")
        .eq("organization_id", organization.id)
        .order("entry_date", { ascending: false }),
      supabase
        .from("imports")
        .select("*")
        .eq("organization_id", organization.id)
        .order("created_at", { ascending: false })
        .limit(5)
    ]);

  if (clientsResult.error) throw clientsResult.error;
  if (contractsResult.error) throw contractsResult.error;
  if (entriesResult.error) throw entriesResult.error;
  if (importsResult.error) throw importsResult.error;

  return {
    user,
    organization,
    clients: normalizeClients(clientsResult.data ?? []),
    contracts: normalizeContracts(contractsResult.data ?? []),
    entries: normalizeEntries(entriesResult.data ?? []),
    imports: importsResult.data ?? []
  };
}

async function getOrCreateOrganization(
  supabase: Awaited<ReturnType<typeof createClient>>,
  user: User
) {
  const { data: existing, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  if (error) throw error;
  if (existing) return normalizeOrganization(existing);

  const fallbackName = user.email ? `${user.email.split("@")[0]} Ltda` : "Minha empresa";
  const { data: created, error: createError } = await supabase
    .from("organizations")
    .insert({
      owner_user_id: user.id,
      name: fallbackName
    })
    .select("*")
    .single();

  if (createError) throw createError;
  return normalizeOrganization(created);
}

export function normalizeOrganization(row: Record<string, unknown>): Organization {
  return {
    id: String(row.id),
    owner_user_id: String(row.owner_user_id),
    name: String(row.name),
    plan: String(row.plan),
    hourly_cost: toNumber(row.hourly_cost),
    target_margin: toNumber(row.target_margin),
    rework_factor: toNumber(row.rework_factor),
    urgency_factor: toNumber(row.urgency_factor),
    late_daily_penalty: toNumber(row.late_daily_penalty)
  };
}

export function normalizeClients(rows: Record<string, unknown>[]): ClientRecord[] {
  return rows.map((row) => ({
    id: String(row.id),
    organization_id: String(row.organization_id),
    name: String(row.name),
    segment: nullableString(row.segment),
    monthly_revenue: toNumber(row.monthly_revenue),
    notes: nullableString(row.notes)
  }));
}

export function normalizeContracts(rows: Record<string, unknown>[]): ContractRecord[] {
  return rows.map((row) => ({
    id: String(row.id),
    organization_id: String(row.organization_id),
    client_id: String(row.client_id),
    name: String(row.name),
    billing_type: String(row.billing_type),
    expected_monthly_revenue: toNumber(row.expected_monthly_revenue),
    expected_hours: toNumber(row.expected_hours),
    start_date: nullableString(row.start_date),
    status: String(row.status)
  }));
}

export function normalizeEntries(rows: Record<string, unknown>[]): WorkEntry[] {
  return rows.map((row) => ({
    id: String(row.id),
    organization_id: String(row.organization_id),
    client_id: String(row.client_id),
    contract_id: nullableString(row.contract_id),
    entry_date: String(row.entry_date),
    revenue: toNumber(row.revenue),
    hours: toNumber(row.hours),
    hourly_cost: toNumber(row.hourly_cost),
    ticket_count: toInteger(row.ticket_count),
    urgent_count: toInteger(row.urgent_count),
    rework_count: toInteger(row.rework_count),
    discount_amount: toNumber(row.discount_amount),
    payment_delay_days: toInteger(row.payment_delay_days),
    notes: nullableString(row.notes),
    clients: relationName(row.clients),
    contracts: relationName(row.contracts)
  }));
}

export function slugKey(value: string) {
  return value.trim().toLowerCase();
}

export function toNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const normalized = value.replace(/\./g, "").replace(",", ".");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

export function toInteger(value: unknown) {
  return Math.round(toNumber(value));
}

function nullableString(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  return String(value);
}

function relationName(value: unknown): { name: string } | null {
  if (!value) return null;
  if (Array.isArray(value)) {
    const first = value[0] as { name?: unknown } | undefined;
    return first?.name ? { name: String(first.name) } : null;
  }

  const relation = value as { name?: unknown };
  return relation.name ? { name: String(relation.name) } : null;
}
