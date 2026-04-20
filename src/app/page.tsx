import Link from "next/link";
import { actionLabel } from "@/lib/calculations";
import { formatCurrency, formatPercent } from "@/lib/format";

const sampleRows = [
  {
    client: "Loja Gama",
    revenue: 1800,
    profit: -1116,
    margin: -0.62,
    chaos: 88,
    action: "cortar" as const
  },
  {
    client: "Condominio Alfa",
    revenue: 2500,
    profit: 872,
    margin: 0.35,
    chaos: 47,
    action: "observar" as const
  },
  {
    client: "Clinica Beta",
    revenue: 4200,
    profit: 3013,
    margin: 0.72,
    chaos: 15,
    action: "saudavel" as const
  }
];

export default function HomePage() {
  return (
    <>
      <header className="site-header">
        <Link className="brand" href="/">
          <span className="brand-mark">LO</span>
          <span>Lucro Oculto</span>
        </Link>
        <Link className="button-ghost" href="/login">
          Entrar
        </Link>
      </header>

      <main>
        <section className="hero">
          <div className="hero-inner">
            <div className="hero-copy">
              <p className="eyebrow">Margem real para prestadores B2B</p>
              <h1>Cliente ruim custa caro.</h1>
              <p>
                Importe uma planilha simples e descubra quem merece renovacao,
                reajuste, limite de escopo ou uma despedida educada.
              </p>
              <div className="hero-actions">
                <Link className="button" href="/login">
                  Entrar no MVP
                </Link>
                <a className="button-ghost" href="#demo">
                  Ver diagnostico
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="section white" id="demo">
          <div className="section-inner demo-grid">
            <div>
              <div className="section-heading">
                <h2>O dinheiro vaza onde a agenda grita.</h2>
                <p>
                  Horas, chamados, urgencias, retrabalho, descontos e atraso de
                  pagamento viram uma decisao comercial clara.
                </p>
              </div>

              <div className="table-shell">
                <table>
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Receita</th>
                      <th>Lucro estimado</th>
                      <th>Margem</th>
                      <th>Caos</th>
                      <th>Acao</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleRows.map((row) => (
                      <tr key={row.client}>
                        <td>{row.client}</td>
                        <td>{formatCurrency(row.revenue)}</td>
                        <td>{formatCurrency(row.profit)}</td>
                        <td>{formatPercent(row.margin)}</td>
                        <td>{row.chaos}/100</td>
                        <td>
                          <span className={`badge ${row.action}`}>{actionLabel(row.action)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <aside className="panel">
              <p className="eyebrow" style={{ color: "var(--green)" }}>
                Beta pago aberto
              </p>
              <h3 style={{ marginTop: 0 }}>R$ 97/mes para decidir com margem real.</h3>
              <p className="muted">
                Sem API externa. Sem ERP. Sem novela. CSV e cadastro manual
                bastam para achar a conversa de reajuste desta semana.
              </p>
              <div className="actions">
                <Link className="button-secondary" href="/login">
                  Criar acesso
                </Link>
              </div>
            </aside>
          </div>
        </section>

        <section className="section dark">
          <div className="section-inner three-column">
            <div>
              <h3>Renovar</h3>
              <p className="muted">Cliente saudavel, previsivel e com margem boa.</p>
            </div>
            <div>
              <h3>Reajustar</h3>
              <p className="muted">Cliente que cabe na carteira, mas nao no preco atual.</p>
            </div>
            <div>
              <h3>Cortar escopo</h3>
              <p className="muted">Cliente que consome time demais para o retorno que entrega.</p>
            </div>
          </div>
        </section>

        <section className="section white">
          <div className="section-inner launch-band">
            <div>
              <p className="eyebrow" style={{ color: "var(--green)" }}>
                Lancamento fundador
              </p>
              <h2>Primeiros usuarios entram para provar caixa, nao para brincar de dashboard.</h2>
              <p className="muted">
                O teste bom e simples: importar uma planilha, abrir o pior cliente
                e sair com uma frase de decisao comercial.
              </p>
            </div>
            <Link className="button" href="/login">
              Entrar no beta
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
