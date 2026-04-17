import { AppShell } from "@/components/app-shell";
import { SettingsForm } from "@/components/forms";
import { getDashboardData } from "@/lib/data";

export default async function SettingsPage() {
  const { organization } = await getDashboardData();

  return (
    <AppShell organization={organization}>
      <div className="topbar">
        <div className="page-title">
          <h1>Ajustes</h1>
          <p>
            Mude o custo/hora e a meta de margem para o diagnostico bater com a
            realidade da sua operacao.
          </p>
        </div>
      </div>

      <section className="panel">
        <SettingsForm organization={organization} />
      </section>
    </AppShell>
  );
}
