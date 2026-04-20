"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type OnboardingGuideProps = {
  setupOk: boolean;
  clientsCount: number;
  entriesCount: number;
  hasDiagnosis: boolean;
  planName: string;
};

const STORAGE_KEY = "lucro-oculto:onboarding-skipped";

export function OnboardingGuide({
  setupOk,
  clientsCount,
  entriesCount,
  hasDiagnosis,
  planName
}: OnboardingGuideProps) {
  const [isVisible, setIsVisible] = useState(false);

  const steps = useMemo(
    () => [
      {
        key: "setup",
        title: "1. Conferir setup",
        detail: "Confirme Supabase, env vars e schema antes de confiar no diagnostico.",
        actionLabel: "Checar setup",
        href: "/setup",
        done: setupOk
      },
      {
        key: "settings",
        title: "2. Configurar margem",
        detail: "Ajuste custo/hora, margem alvo, urgencia, retrabalho e atraso.",
        actionLabel: "Abrir ajustes",
        href: "/dashboard/settings",
        done: true
      },
      {
        key: "clients",
        title: "3. Subir carteira",
        detail: "Comece com 3 clientes reais ou use a base demo para entender o fluxo.",
        actionLabel: "Cadastrar clientes",
        href: "/dashboard/clients",
        done: clientsCount >= 3
      },
      {
        key: "entries",
        title: "4. Subir operacao",
        detail: "Importe CSV ou lance manualmente receita, horas, chamados e descontos.",
        actionLabel: "Importar CSV",
        href: "/dashboard/import",
        done: entriesCount > 0
      },
      {
        key: "decision",
        title: "5. Abrir decisao",
        detail: "Use o pior cliente para gerar o primeiro relatorio de reajuste ou corte.",
        actionLabel: "Ver diagnostico",
        href: "/dashboard",
        done: hasDiagnosis
      },
      {
        key: "plan",
        title: "6. Escolher plano",
        detail: "Free valida a dor. Beta pago libera carteira maior e uso recorrente.",
        actionLabel: "Ver planos",
        href: "/launch",
        done: planName !== "Free"
      }
    ],
    [clientsCount, entriesCount, hasDiagnosis, planName, setupOk]
  );
  const completed = steps.filter((step) => step.done).length;
  const activeStep = steps.find((step) => !step.done);

  useEffect(() => {
    setIsVisible(window.localStorage.getItem(STORAGE_KEY) !== "true");
  }, []);

  function skipGuide() {
    window.localStorage.setItem(STORAGE_KEY, "true");
    setIsVisible(false);
  }

  if (!isVisible) return null;

  return (
    <section className="onboarding-guide" aria-labelledby="onboarding-title">
      <div className="onboarding-head">
        <div>
          <p className="eyebrow" style={{ color: "var(--green)" }}>
            Guia rapido
          </p>
          <h2 id="onboarding-title">Por onde comecar</h2>
          <p className="muted">
            Siga estes passos para transformar uma planilha solta em uma decisao
            comercial pronta para cliente.
          </p>
        </div>
        <button className="button-secondary" type="button" onClick={skipGuide}>
          Pular guia
        </button>
      </div>

      <div className="onboarding-progress" aria-label={`${completed} de ${steps.length} passos`}>
        <div
          className="onboarding-progress-fill"
          style={{ width: `${Math.round((completed / steps.length) * 100)}%` }}
        />
      </div>

      <div className="onboarding-current">
        <span>{completed}/{steps.length}</span>
        <strong>
          {activeStep
            ? `Proximo passo: ${activeStep.title.replace(/^\d+\.\s*/, "")}`
            : "Guia inicial fechado"}
        </strong>
        <Link className="button" href={activeStep?.href ?? "/dashboard"}>
          {activeStep?.actionLabel ?? "Abrir diagnostico"}
        </Link>
      </div>

      <div className="onboarding-grid">
        {steps.map((step) => (
          <article
            className={`onboarding-step ${step.done ? "done" : ""} ${
              step.key === activeStep?.key ? "active" : ""
            }`}
            key={step.key}
          >
            <span>{step.done ? "Feito" : step.key === activeStep?.key ? "Agora" : "Depois"}</span>
            <h3>{step.title}</h3>
            <p className="muted">{step.detail}</p>
            {!step.done ? (
              <Link className="table-link" href={step.href}>
                {step.actionLabel}
              </Link>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
