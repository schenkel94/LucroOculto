import { actionLabel } from "@/lib/calculations";
import type { ClientDiagnosis } from "@/lib/types";

export function StatusBadge({ action }: { action: ClientDiagnosis["action"] }) {
  return <span className={`badge ${action}`}>{actionLabel(action)}</span>;
}
