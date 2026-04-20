import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export type SetupItem = {
  key: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type SetupStatus = {
  ok: boolean;
  checkedAt: string;
  items: SetupItem[];
};

const REQUIRED_TABLES = [
  {
    name: "organizations",
    columns: "id,billing_status,paid_until,beta_started_at"
  },
  {
    name: "clients",
    columns: "id"
  },
  {
    name: "contracts",
    columns: "id"
  },
  {
    name: "work_entries",
    columns: "id"
  },
  {
    name: "imports",
    columns: "id"
  },
  {
    name: "recommendations",
    columns: "id"
  },
  {
    name: "billing_events",
    columns: "id,event_type,plan,amount,status"
  }
];

export async function getSetupStatus(): Promise<SetupStatus> {
  const checkedAt = new Date().toISOString();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  const items: SetupItem[] = [
    {
      key: "env.supabase_url",
      label: "NEXT_PUBLIC_SUPABASE_URL",
      ok: Boolean(supabaseUrl),
      detail: supabaseUrl ? maskUrl(supabaseUrl) : "Variavel ausente na Vercel."
    },
    {
      key: "env.supabase_key",
      label: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      ok: Boolean(supabaseKey),
      detail: supabaseKey ? "Configurada." : "Variavel ausente na Vercel."
    },
    {
      key: "env.app_url",
      label: "NEXT_PUBLIC_APP_URL",
      ok: Boolean(appUrl),
      detail: appUrl ? maskUrl(appUrl) : "Variavel ausente na Vercel."
    }
  ];

  if (!supabaseUrl || !supabaseKey) {
    return summarize(checkedAt, items);
  }

  const supabase = createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  for (const table of REQUIRED_TABLES) {
    const { error } = await supabase.from(table.name).select(table.columns, { head: true }).limit(1);

    items.push({
      key: `table.${table.name}`,
      label: `Tabela ${table.name}`,
      ok: !error,
      detail: error ? normalizeSupabaseError(error.message) : "Encontrada com RLS ativo."
    });
  }

  return summarize(checkedAt, items);
}

function summarize(checkedAt: string, items: SetupItem[]): SetupStatus {
  return {
    ok: items.every((item) => item.ok),
    checkedAt,
    items
  };
}

function maskUrl(value: string) {
  try {
    const url = new URL(value);
    return url.hostname;
  } catch {
    return "Configurada.";
  }
}

function normalizeSupabaseError(message: string) {
  if (message.includes("does not exist")) {
    return "Nao encontrei esta tabela. Rode o conteudo de supabase/schema.sql no SQL Editor.";
  }

  if (message.includes("Invalid API key")) {
    return "Publishable key invalida ou de outro projeto.";
  }

  return message;
}
