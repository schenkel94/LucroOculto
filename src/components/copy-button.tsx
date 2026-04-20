"use client";

import { useState } from "react";

export function CopyButton({
  label = "Copiar texto",
  text
}: {
  label?: string;
  text: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button className="button-secondary" onClick={handleCopy} type="button">
      {copied ? "Copiado" : label}
    </button>
  );
}
