import type { ClientDiagnosis } from "@/lib/types";

export type LeakInsight = {
  label: string;
  value: number;
  description: string;
};

export function getMainLeak(diagnosis: ClientDiagnosis): LeakInsight {
  const leaks: LeakInsight[] = [
    {
      label: "Horas consumidas",
      value: diagnosis.operationalCost,
      description: "Servico virou capacidade ocupada."
    },
    {
      label: "Retrabalho",
      value: diagnosis.reworkCost,
      description: "Entrega refeita cobra duas vezes da equipe."
    },
    {
      label: "Urgencias",
      value: diagnosis.urgencyCost,
      description: "Prioridade fora do combinado troca margem por pressa."
    },
    {
      label: "Descontos e atraso",
      value: diagnosis.discounts + diagnosis.lateCost,
      description: "Dinheiro contratado nao chegou inteiro no caixa."
    }
  ];

  return leaks.sort((a, b) => b.value - a.value)[0];
}

export function getMarginGap(diagnosis: ClientDiagnosis, targetMargin: number) {
  return Math.max(0, targetMargin - diagnosis.margin);
}
