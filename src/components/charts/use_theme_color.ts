import { useEffect, useState } from "react";

/**
 * Risolve un colore che può essere una CSS variable (es. "var(--ink)") nel
 * valore concreto richiesto dal canvas di Chart.js: dentro un canvas non
 * esistono custom properties, ci vuole il colore già calcolato.
 *
 * getComputedStyle viene riletto DOPO il mount (quando gli stili sono ormai
 * applicati) e ad ogni cambio di tema: questo evita che il grafico "congeli"
 * un colore letto prima che il tema fosse applicato, rendendo le label
 * illeggibili sullo sfondo.
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

  // Ripiego se la variabile non è ancora disponibile al momento della lettura.
  // Anche qui si guarda il tema *risolto* su <html>, non quello di sistema.
  const dark = document.documentElement.dataset.theme === "dark";
  return dark ? "#f0f0f0" : "#333333";
}

export function useResolvedThemeColor(color: string): string {
  const [resolved, setResolved] = useState<string>(() =>
    resolveThemeColor(color),
  );

  useEffect(() => {
    setResolved(resolveThemeColor(color));

    // Il tema da seguire è `data-theme` su <html>, non `prefers-color-scheme`:
    // la preferenza dell'utente può essere "chiaro" su un sistema scuro (e
    // viceversa), e chi sceglie il tema da Impostazioni non tocca la media
    // query. Prima i grafici restavano con i colori del tema di sistema:
    // etichette e griglia sparivano finché non si ricaricava la pagina.
    const observer = new MutationObserver(() =>
      setResolved(resolveThemeColor(color)),
    );
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, [color]);

  return resolved;
}
