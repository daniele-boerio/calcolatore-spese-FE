export interface PaginationParams {
  page: number;
  size: number;
}

export interface Transaction {
  id: string; // ID come stringa
  data: string;
  descrizione: string;
  importo: number;
  tipo: "entrata" | "uscita";
  categoria_id: string;
  conto_id: string;
  // aggiungi altri campi se presenti (es. tags)
}

export interface PaginatedResponse {
  data: Transaction[];
  total: number;
  page: number;
  size: number;
}

export interface TransactionsState {
  loading: boolean;
  transactions: Transaction[];
  selectedTransaction: Transaction | null;
  pagination: {
    total: number | null;
    page: number | null;
    size: number | null;
  };
}
