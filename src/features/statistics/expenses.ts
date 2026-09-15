import { Categoria } from "../categorie/interfaces";
import { MonthlyDetailCategory } from "./interfaces";

// Come il BE chiama negli aggregati quello che una categoria (o una
// sottocategoria) non ce l'ha.
export const UNCATEGORIZED = "Uncategorized";

/** Una barra di "Uscite per categoria": una categoria, o una sottocategoria. */
export type ExpenseRow = {
  nome: string;
  totale: number;
  /** Valorizzato solo quando la riga è una sottocategoria riconosciuta. */
  sottocategoriaId: string | null;
};

/**
 * Le barre delle uscite del mese, dal payload di `monthDetails`.
 *
 * Con una categoria scelta si scende di un livello e si elencano le sue
 * sottocategorie — il nome della categoria è già nel titolo della card.
 *
 * La categoria si cerca *dentro* il payload invece di appiattire tutto quello
 * che c'è: lo store è globale e i dati possono essere quelli di un'altra
 * schermata o del filtro di un attimo prima, e appiattirli mescolerebbe le
 * sottocategorie di tutti — una riga "senza sottocategoria" per ogni categoria
 * che non ne ha. Se il payload non parla ancora della categoria scelta, non
 * c'è niente da mostrare: meglio vuoto che le righe di qualcun altro.
 *
 * `monthDetails` manda le uscite col segno meno: qui si ragiona in valore
 * assoluto, il segno lo rimette la scrittura.
 */
export function expenseRows(
  data: MonthlyDetailCategory[],
  categoria: Categoria | null,
): ExpenseRow[] {
  const rows: ExpenseRow[] = categoria
    ? (
        data.find((entry) => entry.categoria === categoria.nome)
          ?.sottocategorie ?? []
      ).map((sub) => ({
        nome: sub.sottocategoria,
        totale: sub.totale,
        // Le statistiche danno il nome della sottocategoria, non il suo id:
        // per poterci filtrare i movimenti lo ripeschiamo dalla categoria. Le
        // uscite senza sottocategoria non hanno corrispondenza e restano senza.
        sottocategoriaId:
          categoria.sottocategorie?.find(
            (item) => item.nome === sub.sottocategoria,
          )?.id ?? null,
      }))
    : data.map((entry) => ({
        nome: entry.categoria,
        totale: entry.totale,
        sottocategoriaId: null,
      }));

  return rows
    .filter((row) => row.totale < 0)
    .map((row) => ({ ...row, totale: Math.abs(row.totale) }))
    .sort((a, b) => b.totale - a.totale);
}
