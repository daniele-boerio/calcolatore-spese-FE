export type tipoTransaction = "ENTRATA" | "USCITA" | "RIMBORSO";

export interface Recurring {
  id: string; // ID come stringa
  nome: string;
  importo: number;
  tipo: tipoTransaction;
  frequenza: string;
  prossima_esecuzione: string;
  attiva: true;
  conto_id: string;
  categoria_id: string;
  sottocategoria_id: string;
  tag_id: string;
  creationDate: string;
  lastUpdate: string;
}

export interface RecurringsState {
  loading: boolean;
  recurrings: Recurring[];
  selectedRecurring: Recurring | null;
  filters: RecurringFilters;
}

export interface CreateRecurringParams {
  nome: string;
  importo: number;
  tipo: tipoTransaction;
  frequenza: string;
  prossima_esecuzione: string;
  attiva: true;
  conto_id: string;
  categoria_id?: string;
  sottocategoria_id?: string;
  tag_id?: string;
}

export interface UpdateRecurringParams {
  id: string;
  nome?: string;
  importo?: number;
  tipo?: tipoTransaction;
  frequenza?: string;
  prossima_esecuzione?: string;
  attiva?: true;
  conto_id?: string;
  categoria_id?: string;
  sottocategoria_id?: string;
  tag_id?: string;
}

export interface DeleteRecurringParams {
  id: string;
}

export interface RecurringFilters {
  sort_by?: string;
  sort_order?: "asc" | "desc";
  nome?: string;
  tipo?: string;
  importo_min?: number;
  importo_max?: number;
  frequenza?: string;
  prossima_esecuzione_inizio?: string;
  prossima_esecuzione_fine?: string;
  attiva?: boolean;
  conto_id?: string[];
  categoria_id?: string[];
  sottocategoria_id?: string[];
  tag_id?: string[];
}
