export interface PaginationParams {
  page: number;
  size: number;
}

export type tipoTransaction = "ENTRATA" | "USCITA" | "RIMBORSO";

export interface Transaction {
  id: string; // ID come stringa
  data: string;
  descrizione: string;
  importo: number;
  tipo: tipoTransaction;
  conto_id: string;
  categoria_id: string;
  sottocategoria_id: string;
  tag_id: string;
  parent_transaction_id: string;
  creationDate: string;
  lastUpdate: string;
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

export interface CreateTransactionParams {
  importo: number;
  tipo: tipoTransaction;
  data: string;
  descrizione: string | null;
  conto_id: string;
  categoria_id: string | null;
  sottocategoria_id: string | null;
  tag_id: string | null;
  parent_transaction_id: string | null;
}

export interface UpdateTransactionParams {
  id: string;
  importo: number | null;
  tipo: tipoTransaction | null;
  data: string | null;
  descrizione: string | null;
  conto_id: string | null;
  categoria_id: string | null;
  sottocategoria_id: string | null;
  tag_id: string | null;
  parent_transaction_id: string | null;
}

export interface DeleteTransactionParams {
  id: string;
}

export interface TransactionByTagParams {
  tagId: string;
}
