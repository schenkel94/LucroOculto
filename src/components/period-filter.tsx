import Link from "next/link";
import { PERIOD_OPTIONS, type PeriodValue } from "@/lib/periods";

export function PeriodFilter({ active }: { active: PeriodValue }) {
  return (
    <nav className="period-filter" aria-label="Periodo analisado">
      {PERIOD_OPTIONS.map((option) => (
        <Link
          aria-current={option.value === active ? "page" : undefined}
          className={option.value === active ? "active" : ""}
          href={`/dashboard?period=${option.value}`}
          key={option.value}
        >
          <strong>{option.label}</strong>
          <span>{option.hint}</span>
        </Link>
      ))}
    </nav>
  );
}
