import type { WorkEntry } from "@/lib/types";

export const PERIOD_OPTIONS = [
  { value: "all", label: "Todo historico", hint: "Tudo que entrou" },
  { value: "month", label: "Mes atual", hint: "Desde o dia 1" },
  { value: "90d", label: "90 dias", hint: "Janela recente" },
  { value: "180d", label: "180 dias", hint: "Semestre" }
] as const;

export type PeriodValue = (typeof PERIOD_OPTIONS)[number]["value"];

export function normalizePeriod(value?: string): PeriodValue {
  return PERIOD_OPTIONS.some((option) => option.value === value)
    ? (value as PeriodValue)
    : "all";
}

export function periodLabel(period: PeriodValue) {
  return PERIOD_OPTIONS.find((option) => option.value === period)?.label ?? "Todo historico";
}

export function filterEntriesByPeriod(
  entries: WorkEntry[],
  period: PeriodValue,
  now = new Date()
) {
  if (period === "all") return entries;

  const start = getPeriodStart(period, now);
  const startKey = toDateKey(start);
  const endKey = toDateKey(now);

  return entries.filter((entry) => {
    const entryKey = entry.entry_date.slice(0, 10);
    return entryKey >= startKey && entryKey <= endKey;
  });
}

function getPeriodStart(period: Exclude<PeriodValue, "all">, now: Date) {
  const start = new Date(now);

  if (period === "month") {
    start.setDate(1);
    return start;
  }

  const days = period === "90d" ? 90 : 180;
  start.setDate(start.getDate() - days);
  return start;
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
