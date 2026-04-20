import { AppShell } from "@/components/app-shell";
import { CsvImporter } from "@/components/csv-importer";
import { getDashboardData } from "@/lib/data";
import Link from "next/link";

export default async function ImportPage() {
  const { organization, imports } = await getDashboardData();

  return (
    <AppShell organization={organization}>
      <div className="topbar">
        <div className="page-title">
          <h1>Importar CSV</h1>
          <p>
            Traga a planilha baguncada para dentro do diagnostico. Entrada
            manual e CSV bastam para chegar na primeira decisao.
          </p>
        </div>
        <a className="button" href="/api/templates/lucro-oculto.csv">
          Baixar modelo
        </a>
      </div>

      <div className="two-column">
        <section className="panel">
          <CsvImporter />
        </section>

        <aside className="panel">
          <h2 style={{ marginTop: 0 }}>Colunas aceitas</h2>
          <p className="muted">
            O importador tambem entende alguns nomes em ingles, mas este formato
            e o caminho feliz.
          </p>
          <pre style={{ overflow: "auto", whiteSpace: "pre-wrap" }}>
{`data,cliente,contrato,receita,horas,custo_hora,chamados,urgencias,retrabalhos,descontos,atraso_pagamento_dias,observacoes
2026-04-01,Condominio Alfa,Suporte mensal,2500,18,65,12,3,2,0,8,Muitas urgencias fora do combinado`}
          </pre>
          <div className="actions">
            <a className="button-secondary" href="/api/templates/lucro-oculto.csv">
              Baixar CSV preenchido
            </a>
            <Link className="button-secondary" href="/setup">
              Checar setup
            </Link>
          </div>

          <h3>Ultimas importacoes</h3>
          {imports.length === 0 ? (
            <p className="muted">Nenhuma importacao registrada ainda.</p>
          ) : (
            <div className="bars">
              {imports.map((item) => (
                <div className="bar-row" key={item.id}>
                  <div className="bar-label">
                    <span>{item.filename}</span>
                    <span>
                      {item.rows_valid}/{item.rows_total}
                    </span>
                  </div>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round((item.rows_valid / Math.max(item.rows_total, 1)) * 100)
                        )}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </AppShell>
  );
}
