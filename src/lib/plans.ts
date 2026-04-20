import type { ImportRecord, Organization } from "@/lib/types";

export type PlanKey = "free" | "beta" | "pro";

export type PlanDefinition = {
  key: PlanKey;
  name: string;
  price: number;
  badge: string;
  description: string;
  limits: {
    clients: number | null;
    importsPerMonth: number | null;
    decisionReports: number | null;
  };
  features: string[];
  cta: string;
};

export const PLAN_DEFINITIONS: PlanDefinition[] = [
  {
    key: "free",
    name: "Free",
    price: 0,
    badge: "Validacao",
    description: "Para provar o diagnostico com poucos clientes.",
    limits: {
      clients: 3,
      importsPerMonth: 1,
      decisionReports: 3
    },
    features: ["CSV e cadastro manual", "Diagnostico basico", "Relatorio de decisao limitado"],
    cta: "Plano atual"
  },
  {
    key: "beta",
    name: "Beta pago",
    price: 97,
    badge: "MVP comercial",
    description: "Para vender reajuste de verdade em uma carteira pequena.",
    limits: {
      clients: 25,
      importsPerMonth: 20,
      decisionReports: 100
    },
    features: [
      "Mais clientes na carteira",
      "Importacoes recorrentes",
      "Relatorios que vendem a decisao",
      "Suporte fundador"
    ],
    cta: "Quero beta pago"
  },
  {
    key: "pro",
    name: "Pro",
    price: 197,
    badge: "Em breve",
    description: "Para operacao com time, funil e automacoes.",
    limits: {
      clients: null,
      importsPerMonth: null,
      decisionReports: null
    },
    features: ["Pipeline comercial", "Exportacao gerencial", "Cobranca integrada", "Multiusuario"],
    cta: "Entrar na lista"
  }
];

export function normalizePlan(plan?: string): PlanKey {
  return plan === "beta" || plan === "pro" ? plan : "free";
}

export function getPlanDefinition(plan?: string) {
  const key = normalizePlan(plan);
  return PLAN_DEFINITIONS.find((item) => item.key === key) ?? PLAN_DEFINITIONS[0];
}

export function getBillingStatusLabel(status?: string | null) {
  const labels: Record<string, string> = {
    trial: "Teste",
    requested: "Beta solicitado",
    active: "Ativo",
    past_due: "Pagamento pendente",
    canceled: "Cancelado"
  };

  return labels[status ?? "trial"] ?? "Teste";
}

export function getUsageStatus({
  clientsCount,
  imports,
  organization
}: {
  clientsCount: number;
  imports: ImportRecord[];
  organization: Organization;
}) {
  const plan = getPlanDefinition(organization.plan);
  const importsThisMonth = countImportsThisMonth(imports);

  return {
    plan,
    clients: {
      used: clientsCount,
      limit: plan.limits.clients,
      reached: isLimitReached(clientsCount, plan.limits.clients)
    },
    imports: {
      used: importsThisMonth,
      limit: plan.limits.importsPerMonth,
      reached: isLimitReached(importsThisMonth, plan.limits.importsPerMonth)
    },
    reports: {
      used: 0,
      limit: plan.limits.decisionReports,
      reached: false
    }
  };
}

export function formatLimit(limit: number | null) {
  return limit === null ? "Ilimitado" : String(limit);
}

function isLimitReached(used: number, limit: number | null) {
  return limit !== null && used >= limit;
}

function countImportsThisMonth(imports: ImportRecord[]) {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  return imports.filter((item) => {
    const createdAt = new Date(item.created_at);
    return createdAt.getFullYear() === year && createdAt.getMonth() === month;
  }).length;
}
