import { useEffect, useState } from "react";

/**
 * Risolve un colore che può essere una CSS variable (es. "var(--text-main)")
 * nel valore concreto richiesto dal canvas di Chart.js.
 *
 * getComputedStyle viene riletto DOPO il mount (quando gli stili sono ormai
 * applicati) e ad ogni cambio di tema chiaro/scuro: questo evita che su mobile
 * il grafico "congeli" un colore letto prima che la dark-mode fosse applicata,
 * rendendo le label illeggibili sullo sfondo scuro.
 */
export function resolveThemeColor(color: string): string {
  if (!color.includes("var(")) return color;

  const name = color.match(/var\((.*?)\)/)?.[1];
  if (name) {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();
    if (value) return value;
  }

  // Fallback se la variabile non è ancora disponibile al momento della lettura
  const dark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  return dark ? "#f0f0f0" : "#333333";
}

export function useResolvedThemeColor(color: string): string {
  const [resolved, setResolved] = useState<string>(() =>
    resolveThemeColor(color),
  );

  useEffect(() => {
    setResolved(resolveThemeColor(color));

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setResolved(resolveThemeColor(color));
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [color]);

  return resolved;
}
