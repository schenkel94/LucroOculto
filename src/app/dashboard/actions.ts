"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedContext, slugKey, toInteger, toNumber } from "@/lib/data";
import type { CsvWorkRow } from "@/lib/types";

export async function updateOrganizationSettings(formData: FormData) {
  const { supabase, organization } = await getAuthenticatedContext();

  const { error } = await supabase
    .from("organizations")
    .update({
      name: String(formData.get("name") ?? organization.name).trim(),
      hourly_cost: toNumber(formData.get("hourly_cost")),
      target_margin: toNumber(formData.get("target_margin")) / 100,
      rework_factor: toNumber(formData.get("rework_factor")),
      urgency_factor: toNumber(formData.get("urgency_factor")),
      late_daily_penalty: toNumber(formData.get("late_daily_penalty")) / 100
    })
    .eq("id", organization.id);

  if (error) throw error;
  revalidatePath("/dashboard", "layout");
}

export async function createClientRecord(formData: FormData) {
  const { supabase, organization } = await getAuthenticatedContext();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const { error } = await supabase.from("clients").insert({
    organization_id: organization.id,
    name,
    segment: String(formData.get("segment") ?? "").trim() || null,
    monthly_revenue: toNumber(formData.get("monthly_revenue")),
    notes: String(formData.get("notes") ?? "").trim() || null
  });

  if (error) throw error;
  revalidatePath("/dashboard", "layout");
}

export async function createContractRecord(formData: FormData) {
  const { supabase, organization } = await getAuthenticatedContext();

  const clientId = String(formData.get("client_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!clientId || !name) return;

  const { error } = await supabase.from("contracts").insert({
    organization_id: organization.id,
    client_id: clientId,
    name,
    billing_type: String(formData.get("billing_type") ?? "recurring"),
    expected_monthly_revenue: toNumber(formData.get("expected_monthly_revenue")),
    expected_hours: toNumber(formData.get("expected_hours")),
    start_date: String(formData.get("start_date") ?? "") || null,
    status: "active"
  });

  if (error) throw error;
  revalidatePath("/dashboard", "layout");
}

export async function createWorkEntryRecord(formData: FormData) {
  const { supabase, organization } = await getAuthenticatedContext();

  const clientId = String(formData.get("client_id") ?? "");
  if (!clientId) return;

  const contractId = String(formData.get("contract_id") ?? "");

  const { error } = await supabase.from("work_entries").insert({
    organization_id: organization.id,
    client_id: clientId,
    contract_id: contractId || null,
    entry_date: String(formData.get("entry_date") ?? new Date().toISOString().slice(0, 10)),
    revenue: toNumber(formData.get("revenue")),
    hours: toNumber(formData.get("hours")),
    hourly_cost: toNumber(formData.get("hourly_cost")) || organization.hourly_cost,
    ticket_count: toInteger(formData.get("ticket_count")),
    urgent_count: toInteger(formData.get("urgent_count")),
    rework_count: toInteger(formData.get("rework_count")),
    discount_amount: toNumber(formData.get("discount_amount")),
    payment_delay_days: toInteger(formData.get("payment_delay_days")),
    notes: String(formData.get("notes") ?? "").trim() || null
  });

  if (error) throw error;
  revalidatePath("/dashboard", "layout");
}

export async function deleteClientRecord(clientId: string) {
  const { supabase, organization } = await getAuthenticatedContext();

  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", clientId)
    .eq("organization_id", organization.id);

  if (error) throw error;
  revalidatePath("/dashboard", "layout");
}

export async function importCsvRows(rows: CsvWorkRow[], filename: string) {
  const { supabase, organization } = await getAuthenticatedContext();

  const { data: existingClients, error: clientsError } = await supabase
    .from("clients")
    .select("*")
    .eq("organization_id", organization.id);

  if (clientsError) throw clientsError;

  const { data: existingContracts, error: contractsError } = await supabase
    .from("contracts")
    .select("*")
    .eq("organization_id", organization.id);

  if (contractsError) throw contractsError;

  const clientMap = new Map<string, string>();
  for (const client of existingClients ?? []) {
    clientMap.set(slugKey(String(client.name)), String(client.id));
  }

  const contractMap = new Map<string, string>();
  for (const contract of existingContracts ?? []) {
    contractMap.set(`${String(contract.client_id)}:${slugKey(String(contract.name))}`, String(contract.id));
  }

  const validRows = rows.filter((row) => row.data && row.cliente);
  let rowsInvalid = rows.length - validRows.length;
  const entries = [];

  for (const row of validRows) {
    const clientName = row.cliente.trim();
    const clientKey = slugKey(clientName);
    let clientId = clientMap.get(clientKey);

    if (!clientId) {
      const { data: createdClient, error } = await supabase
        .from("clients")
        .insert({
          organization_id: organization.id,
          name: clientName,
          monthly_revenue: row.receita
        })
        .select("id")
        .single();

      if (error) {
        rowsInvalid += 1;
        continue;
      }

      clientId = String(createdClient.id);
      clientMap.set(clientKey, clientId);
    }

    let contractId: string | null = null;
    const contractName = row.contrato?.trim();

    if (contractName) {
      const contractKey = `${clientId}:${slugKey(contractName)}`;
      contractId = contractMap.get(contractKey) ?? null;

      if (!contractId) {
        const { data: createdContract, error } = await supabase
          .from("contracts")
          .insert({
            organization_id: organization.id,
            client_id: clientId,
            name: contractName,
            expected_monthly_revenue: row.receita,
            expected_hours: row.horas
          })
          .select("id")
          .single();

        if (!error && createdContract) {
          contractId = String(createdContract.id);
          contractMap.set(contractKey, contractId);
        }
      }
    }

    entries.push({
      organization_id: organization.id,
      client_id: clientId,
      contract_id: contractId,
      entry_date: row.data,
      revenue: row.receita,
      hours: row.horas,
      hourly_cost: row.custo_hora || organization.hourly_cost,
      ticket_count: row.chamados,
      urgent_count: row.urgencias,
      rework_count: row.retrabalhos,
      discount_amount: row.descontos,
      payment_delay_days: row.atraso_pagamento_dias,
      notes: row.observacoes ?? null
    });
  }

  if (entries.length > 0) {
    const { error } = await supabase.from("work_entries").insert(entries);
    if (error) throw error;
  }

  await supabase.from("imports").insert({
    organization_id: organization.id,
    filename: filename || "importacao.csv",
    rows_total: rows.length,
    rows_valid: entries.length,
    rows_invalid: rowsInvalid
  });

  revalidatePath("/dashboard", "layout");

  return {
    rowsTotal: rows.length,
    rowsValid: entries.length,
    rowsInvalid
  };
}

export async function seedDemoData() {
  const { supabase, organization } = await getAuthenticatedContext();

  const { data: clients, error: clientError } = await supabase
    .from("clients")
    .insert([
      {
        organization_id: organization.id,
        name: "Condominio Alfa",
        segment: "Condominios",
        monthly_revenue: 2500,
        notes: "Cliente com muitas urgencias fora do combinado."
      },
      {
        organization_id: organization.id,
        name: "Clinica Beta",
        segment: "Saude",
        monthly_revenue: 4200,
        notes: "Cliente organizado e previsivel."
      },
      {
        organization_id: organization.id,
        name: "Loja Gama",
        segment: "Varejo",
        monthly_revenue: 1800,
        notes: "Escopo muda com frequencia."
      }
    ])
    .select("id, name");

  if (clientError) throw clientError;

  const byName = new Map((clients ?? []).map((client) => [String(client.name), String(client.id)]));

  const demoRows = [
    {
      client: "Condominio Alfa",
      revenue: 2500,
      hours: 18,
      tickets: 12,
      urgent: 3,
      rework: 2,
      delay: 8,
      discounts: 0
    },
    {
      client: "Clinica Beta",
      revenue: 4200,
      hours: 16,
      tickets: 5,
      urgent: 0,
      rework: 1,
      delay: 0,
      discounts: 0
    },
    {
      client: "Loja Gama",
      revenue: 1800,
      hours: 22,
      tickets: 15,
      urgent: 5,
      rework: 4,
      delay: 20,
      discounts: 200
    }
  ];

  const { error: entryError } = await supabase.from("work_entries").insert(
    demoRows.map((row, index) => ({
      organization_id: organization.id,
      client_id: byName.get(row.client),
      entry_date: `2026-04-0${index + 1}`,
      revenue: row.revenue,
      hours: row.hours,
      hourly_cost: organization.hourly_cost,
      ticket_count: row.tickets,
      urgent_count: row.urgent,
      rework_count: row.rework,
      discount_amount: row.discounts,
      payment_delay_days: row.delay,
      notes: "Dado demo para validar o diagnostico."
    }))
  );

  if (entryError) throw entryError;
  revalidatePath("/dashboard", "layout");
}
