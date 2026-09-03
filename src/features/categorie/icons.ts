// Le categorie sul BE non hanno un'icona: il design però ne mostra una diversa
// per riga. Finché il campo non esiste la deduciamo dal nome, con un ripiego
// neutro per tutto il resto — meglio un'icona generica che una sbagliata.
//
// Solo icone presenti nell'elenco del design (PrimeIcons).
const KEYWORD_ICONS: ReadonlyArray<readonly [readonly string[], string]> = [
  [["spesa", "supermercato", "aliment", "grocer"], "pi pi-shopping-cart"],
  [["casa", "affitto", "mutuo", "rent", "home"], "pi pi-home"],
  [["trasport", "auto", "carburante", "benzina", "car", "fuel"], "pi pi-car"],
  [["svago", "tempo libero", "divertimento", "cinema", "leisure"], "pi pi-ticket"],
  [["utenz", "bollett", "luce", "gas", "energia", "util"], "pi pi-bolt"],
  [["shopping", "abbigliamento", "vestiti", "clothes"], "pi pi-shopping-bag"],
  [["stipendio", "salario", "lavoro", "salary", "income"], "pi pi-money-bill"],
  [["banca", "conto", "bank"], "pi pi-building-columns"],
  [["carta", "credito", "card"], "pi pi-credit-card"],
  [["tass", "imposte", "bollo", "tax"], "pi pi-receipt"],
];

const FALLBACK_ICON = "pi pi-tag";

export function categoryIcon(name: string | null | undefined): string {
  if (!name) return FALLBACK_ICON;

  const normalized = name
    .toLowerCase()
    // Toglie gli accenti: "Utenzè" e "Utenze" devono pescare la stessa icona.
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  for (const [keywords, icon] of KEYWORD_ICONS) {
    if (keywords.some((keyword) => normalized.includes(keyword))) return icon;
  }

  return FALLBACK_ICON;
}
