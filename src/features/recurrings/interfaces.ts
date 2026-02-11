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
