"use client";

import { useMemo, useState, useTransition } from "react";
import Papa from "papaparse";
import { importCsvRows } from "@/app/dashboard/actions";
import type { CsvWorkRow } from "@/lib/types";
import { formatCurrency, formatNumber } from "@/lib/format";

type ImportResult = {
  rowsTotal: number;
  rowsValid: number;
  rowsInvalid: number;
};

export function CsvImporter() {
  const [rows, setRows] = useState<CsvWorkRow[]>([]);
  const [filename, setFilename] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, row) => {
          acc.revenue += row.receita;
          acc.hours += row.horas;
          return acc;
        },
        { revenue: 0, hours: 0 }
      ),
    [rows]
  );

  function handleFile(file?: File) {
    setError("");
    setResult(null);

    if (!file) return;
    setFilename(file.name);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (parseResult) => {
        const parsed = parseResult.data
          .map(normalizeCsvRow)
          .filter((row): row is CsvWorkRow => Boolean(row));

        if (parsed.length === 0) {
          setRows([]);
          setError("Nao encontrei linhas validas. Confira os nomes das colunas.");
          return;
        }

        setRows(parsed);
      },
      error: (parseError) => {
        setError(parseError.message);
      }
    });
  }

  function submitImport() {
    startTransition(async () => {
      const response = await importCsvRows(rows, filename);
      setResult(response);
      setRows([]);
    });
  }

  return (
    <div className="csv-preview">
      <label className="csv-drop">
        <span className="label">Arquivo CSV</span>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
        <span className="muted">
          Use colunas como data, cliente, contrato, receita, horas, custo_hora,
          chamados, urgencias, retrabalhos, descontos e atraso_pagamento_dias.
        </span>
      </label>

      {error ? <div className="message">{error}</div> : null}

      {rows.length > 0 ? (
        <>
          <div className="dashboard-grid">
            <div className="metric">
              <span>Linhas validas</span>
              <strong>{rows.length}</strong>
              <small>Prontas para gravar.</small>
            </div>
            <div className="metric">
              <span>Receita importada</span>
              <strong>{formatCurrency(totals.revenue)}</strong>
              <small>Total lido no arquivo.</small>
            </div>
            <div className="metric">
              <span>Horas</span>
              <strong>{formatNumber(totals.hours, 1)}</strong>
              <small>Capacidade consumida.</small>
            </div>
            <div className="metric">
              <span>Arquivo</span>
              <strong>{filename || "CSV"}</strong>
              <small>Origem da importacao.</small>
            </div>
          </div>

          <div className="table-shell">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Cliente</th>
                  <th>Contrato</th>
                  <th>Receita</th>
                  <th>Horas</th>
                  <th>Retrabalho</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 8).map((row, index) => (
                  <tr key={`${row.cliente}-${row.data}-${index}`}>
                    <td>{row.data}</td>
                    <td>{row.cliente}</td>
                    <td>{row.contrato || "Sem contrato"}</td>
                    <td>{formatCurrency(row.receita)}</td>
                    <td>{formatNumber(row.horas, 1)}</td>
                    <td>{row.retrabalhos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button className="button" type="button" disabled={isPending} onClick={submitImport}>
            {isPending ? "Importando..." : "Importar agora"}
          </button>
        </>
      ) : null}

      {result ? (
        <div className="message">
          Importacao concluida: {result.rowsValid} linhas gravadas, {result.rowsInvalid} ignoradas.
        </div>
      ) : null}
    </div>
  );
}

function normalizeCsvRow(row: Record<string, string>): CsvWorkRow | null {
  const data = normalizeDate(row.data ?? row.date ?? "");
  const cliente = String(row.cliente ?? row.client ?? "").trim();

  if (!data || !cliente) return null;

  return {
    data,
    cliente,
    contrato: String(row.contrato ?? row.contract ?? "").trim(),
    receita: parseCsvNumber(row.receita ?? row.revenue),
    horas: parseCsvNumber(row.horas ?? row.hours),
    custo_hora: parseCsvNumber(row.custo_hora ?? row.hourly_cost),
    chamados: parseCsvInteger(row.chamados ?? row.ticket_count),
    urgencias: parseCsvInteger(row.urgencias ?? row.urgent_count),
    retrabalhos: parseCsvInteger(row.retrabalhos ?? row.rework_count),
    descontos: parseCsvNumber(row.descontos ?? row.discount_amount),
    atraso_pagamento_dias: parseCsvInteger(
      row.atraso_pagamento_dias ?? row.payment_delay_days
    ),
    observacoes: String(row.observacoes ?? row.notes ?? "").trim()
  };
}

function parseCsvNumber(value: unknown) {
  const parsed = Number(String(value ?? "0").replace(/\./g, "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseCsvInteger(value: unknown) {
  return Math.round(parseCsvNumber(value));
}

function normalizeDate(value: string) {
  const raw = value.trim();
  if (!raw) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  const brazilian = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brazilian) {
    const [, day, month, year] = brazilian;
    return `${year}-${month}-${day}`;
  }

  return raw;
}
