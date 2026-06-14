export interface Debito {
  id: string;
  nome: string;
  ammontare: number;
  residuo: number | null;
  descrizione: string | null;
  conto_id: string | null;
  creationDate: string;
  lastUpdate: string;
}

export interface DebitoState {
  loading: boolean;
  debiti: Debito[];
}

export interface CreateDebitoParams {
  nome: string;
  ammontare: number;
  residuo?: number | null;
  descrizione?: string | null;
  conto_id?: string | null;
}

export interface UpdateDebitoParams {
  id: string;
  nome: string;
  ammontare: number;
  residuo?: number | null;
  descrizione?: string | null;
  conto_id?: string | null;
}

export interface PayDebitoParams {
  id: string;
  importo: number;
  conto_id?: string | null;
  data?: string | null;
  descrizione?: string | null;
}

export interface DeleteDebitoParams {
  id: string;
  force?: boolean;
}
