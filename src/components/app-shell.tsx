import Link from "next/link";
import { signOut } from "@/app/actions";
import { getBillingStatusLabel, getPlanDefinition } from "@/lib/plans";
import type { Organization } from "@/lib/types";

export function AppShell({
  organization,
  children
}: {
  organization: Organization;
  children: React.ReactNode;
}) {
  const plan = getPlanDefinition(organization.plan);

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <Link className="brand" href="/dashboard">
          <span className="brand-mark">LO</span>
          <span>Lucro Oculto</span>
        </Link>

        <nav className="nav" aria-label="Navegacao principal">
          <Link href="/dashboard">Diagnostico</Link>
          <Link href="/dashboard/import">Importar CSV</Link>
          <Link href="/dashboard/clients">Clientes</Link>
          <Link href="/dashboard/settings">Ajustes</Link>
          <Link href="/setup">Setup</Link>
          <Link href="/admin">Admin beta</Link>
          <form action={signOut}>
            <button type="submit">Sair</button>
          </form>
        </nav>

        <p className="muted" style={{ marginTop: 28 }}>
          {organization.name}
          <br />
          Plano {plan.name}
          <br />
          {getBillingStatusLabel(organization.billing_status)}
        </p>
      </aside>

      <main className="app-main">{children}</main>
    </div>
  );
}
