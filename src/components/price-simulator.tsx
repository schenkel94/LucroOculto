"use client";

import { useState } from "react";
import { formatCurrency, formatPercent } from "@/lib/format";

export function PriceSimulator({
  currentRevenue,
  suggestedPrice,
  targetMargin,
  totalCost
}: {
  currentRevenue: number;
  suggestedPrice: number;
  targetMargin: number;
  totalCost: number;
}) {
  const roundedSuggestion = roundToStep(Math.max(suggestedPrice, currentRevenue, 100));
  const [price, setPrice] = useState(roundedSuggestion);
  const minPrice = Math.max(100, roundToStep(Math.min(currentRevenue, roundedSuggestion) * 0.5));
  const maxPrice = Math.max(
    minPrice + 100,
    roundToStep(Math.max(roundedSuggestion * 1.6, currentRevenue * 1.8, totalCost * 1.5, 1000))
  );

  const simulatedProfit = price - totalCost;
  const simulatedMargin = price > 0 ? simulatedProfit / price : 0;
  const targetPrice = targetMargin >= 0.9 ? totalCost : totalCost / (1 - targetMargin);
  const missingToTarget = Math.max(0, targetPrice - price);

  return (
    <div className="simulator">
      <div className="simulator-head">
        <div>
          <h2>Simulador de reajuste</h2>
          <p className="muted">Teste a conversa antes de mandar a proposta.</p>
        </div>
        <span>Meta {formatPercent(targetMargin)}</span>
      </div>

      <label className="field">
        <span className="label">Novo valor mensal</span>
        <input
          max={maxPrice}
          min={minPrice}
          onChange={(event) => setPrice(Number(event.target.value))}
          step={100}
          type="range"
          value={price}
        />
      </label>

      <label className="field">
        <span className="label">Valor simulado</span>
        <input
          min={0}
          onChange={(event) => setPrice(Number(event.target.value))}
          step={100}
          type="number"
          value={price}
        />
      </label>

      <div className="simulator-results">
        <div>
          <span>Margem simulada</span>
          <strong>{formatPercent(simulatedMargin)}</strong>
        </div>
        <div>
          <span>Lucro simulado</span>
          <strong>{formatCurrency(simulatedProfit)}</strong>
        </div>
        <div>
          <span>Falta para meta</span>
          <strong>{formatCurrency(missingToTarget)}</strong>
        </div>
      </div>
    </div>
  );
}

function roundToStep(value: number) {
  return Math.ceil(value / 100) * 100;
}
