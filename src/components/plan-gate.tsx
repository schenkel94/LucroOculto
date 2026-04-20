import Link from "next/link";
import { formatLimit } from "@/lib/plans";

export function PlanGate({
  title,
  description,
  used,
  limit
}: {
  title: string;
  description: string;
  used: number;
  limit: number | null;
}) {
  return (
    <div className="plan-gate">
      <span className="badge renegociar">Limite do plano</span>
      <h2>{title}</h2>
      <p className="muted">{description}</p>
      <div className="limit-row">
        <span>Uso atual</span>
        <strong>
          {used}/{formatLimit(limit)}
        </strong>
      </div>
      <Link className="button" href="/admin">
        Liberar beta pago
      </Link>
    </div>
  );
}
