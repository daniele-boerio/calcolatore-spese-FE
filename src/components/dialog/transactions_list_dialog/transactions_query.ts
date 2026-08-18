/**
 * Filtri della lista transazioni che si apre dalle statistiche, e loro
 * traduzione in query string per `/transazioni/paginated`.
 *
 * Vive in un modulo a parte perché il tipo è condiviso con le pagine che aprono
 * il dialog: prima ognuna dichiarava il proprio, quindi un filtro impostato
 * nella pagina e non gestito nel dialog passava il compilatore e veniva perso
 * in silenzio (era il caso del `tag_id`).
 */
export interface TransactionsListFilters {
  categoria_id?: string;
  sottocategoria_id?: string;
  tag_id?: string;
  data_inizio?: string;
  data_fine?: string;
}

export function buildTransactionsQuery(
  filters: TransactionsListFilters,
  page: number,
  size: number,
): string {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());

  // Il `Record<keyof …>` è la rete: aggiungere un campo a TransactionsListFilters
  // senza mapparlo qui non compila più, invece di far sparire il filtro.
  const queryParams: Record<keyof TransactionsListFilters, string | undefined> =
    {
      categoria_id: filters.categoria_id,
      sottocategoria_id: filters.sottocategoria_id,
      tag_id: filters.tag_id,
      data_inizio: filters.data_inizio,
      data_fine: filters.data_fine,
    };

  for (const [key, value] of Object.entries(queryParams)) {
    if (value) params.append(key, value);
  }

  return params.toString();
}
